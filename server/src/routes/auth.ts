import { Router, Request, Response } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, comparePassword } from '../utils/auth';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import rateLimit from 'express-rate-limit';
import { isEmailValid, isPasswordValid, isNameValid, sanitize } from '../utils/validation';
import { SubscriptionTier } from '../config/tiers';

const router = Router();


const registerLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 50 });
const loginLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 100 });

router.post('/register', registerLimiter, async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, accessCode, subscriptionTier } = req.body;
    const sEmail = sanitize(email);
    const sFirst = sanitize(firstName);
    const sLast = sanitize(lastName);

    try {
        if (!isEmailValid(sEmail)) {
            return res.status(400).json({ message: 'Invalid email address' });
        }
        if (!isPasswordValid(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters and include letters and numbers' });
        }
        if (!isNameValid(sFirst) || !isNameValid(sLast)) {
            return res.status(400).json({ message: 'First and last name are required' });
        }

        // Pre-check for existing user to return a clean 409 instead of generic 500
        const [existing] = await db.select().from(users).where(eq(users.email, sEmail));
        if (existing) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const passwordHash = await hashPassword(password);
        const inserted = await db.insert(users).values({
            email: sEmail,
            passwordHash,
            firstName: sFirst,
            lastName: sLast,
            role: 'user',
            subscriptionStatus: 'active',
            subscriptionTier: subscriptionTier || 'basic',
            twoFactorEnabled: false
        }).onConflictDoNothing({ target: users.email }).returning();

        if (!inserted || inserted.length === 0) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const newUser = inserted[0];

        req.session.userId = newUser.id;
        req.session.role = newUser.role;
        req.session.subscriptionTier = newUser.subscriptionTier || 'basic';
        req.session.is2FAVerified = false;

        res.status(201).json({ user: { id: newUser.id, email: newUser.email, role: newUser.role, subscriptionTier: newUser.subscriptionTier } });
    } catch (error: any) {
        // Handle duplicate constraint gracefully across drivers
        const msg = String(error?.message || '');
        if (
            error?.code === '23505' ||
            msg.includes('duplicate key value') ||
            msg.includes('violates unique constraint') ||
            msg.includes('already exists')
        ) {
            return res.status(409).json({ message: 'User already exists' });
        }
        // As a fallback, check if user now exists and return 409
        try {
            const [exists] = await db.select().from(users).where(eq(users.email, sEmail));
            if (exists) {
                return res.status(409).json({ message: 'User already exists' });
            }
        } catch {}
        console.error('Register error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/login', loginLimiter, async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const sEmail = sanitize(email);
        if (!isEmailValid(sEmail) || typeof password !== 'string') {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const [user] = await db.select().from(users).where(eq(users.email, sEmail));
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.lockUntil && new Date(user.lockUntil).getTime() > Date.now()) {
            return res.status(429).json({ message: 'Account temporarily locked due to too many failed attempts. Try again later.' });
        }

        const isValid = await comparePassword(password, user.passwordHash);
        if (!isValid) {
            const attempts = (user.failedLoginAttempts || 0) + 1;
            let lockUntil = null as Date | null;
            if (attempts >= 5) {
                lockUntil = new Date(Date.now() + 15 * 60 * 1000);
            }
            await db.update(users)
                .set({ failedLoginAttempts: attempts, lockUntil })
                .where(eq(users.id, user.id));
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.failedLoginAttempts && user.failedLoginAttempts > 0) {
            await db.update(users)
                .set({ failedLoginAttempts: 0, lockUntil: null })
                .where(eq(users.id, user.id));
        }

        req.session.userId = user.id;
        req.session.role = user.role;
        req.session.subscriptionTier = user.subscriptionTier || 'basic';
        req.session.is2FAVerified = !user.twoFactorEnabled; // If 2FA not enabled, considered verified

        res.json({
            user: { id: user.id, email: user.email, role: user.role, twoFactorEnabled: user.twoFactorEnabled, subscriptionTier: user.subscriptionTier },
            requires2FA: user.twoFactorEnabled
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
});

router.post('/2fa/setup', async (req: Request, res: Response) => {
    if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

    const secret = speakeasy.generateSecret({ name: 'ExpressDeal' });

    await db.update(users)
        .set({ twoFactorSecret: secret.base32 })
        .where(eq(users.id, req.session.userId));

    QRCode.toDataURL(secret.otpauth_url!, (err, data_url) => {
        res.json({ secret: secret.base32, qrCode: data_url });
    });
});

router.post('/2fa/verify', async (req: Request, res: Response) => {
    if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

    const { token } = req.body;
    const [user] = await db.select().from(users).where(eq(users.id, req.session.userId));

    if (!user.twoFactorSecret) return res.status(400).json({ message: '2FA not set up' });

    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token
    });

    if (verified) {
        if (!user.twoFactorEnabled) {
            await db.update(users).set({ twoFactorEnabled: true }).where(eq(users.id, user.id));
        }
        req.session.is2FAVerified = true;
        res.json({ message: '2FA verified' });
    } else {
        res.status(401).json({ message: 'Invalid token' });
    }
});

router.get('/me', async (req: Request, res: Response) => {
    if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

    const [user] = await db.select().from(users).where(eq(users.id, req.session.userId));
    res.json({
        user: { id: user.id, email: user.email, role: user.role, twoFactorEnabled: user.twoFactorEnabled, subscriptionTier: user.subscriptionTier },
        is2FAVerified: req.session.is2FAVerified
    });
});

router.post('/change-password', async (req: Request, res: Response) => {
    if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

    const { currentPassword, newPassword } = req.body;

    try {
        const [user] = await db.select().from(users).where(eq(users.id, req.session.userId));

        const isValid = await comparePassword(currentPassword, user.passwordHash);
        if (!isValid) {
            return res.status(400).json({ message: 'Invalid current password' });
        }

        const newPasswordHash = await hashPassword(newPassword);
        await db.update(users).set({ passwordHash: newPasswordHash }).where(eq(users.id, user.id));

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Error changing password' });
    }
});

export default router;
