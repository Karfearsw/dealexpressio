import { Router, Request, Response } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, comparePassword } from '../utils/auth';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
    const { email, password, role } = req.body;

    try {
        const existingUser = await db.select().from(users).where(eq(users.email, email));
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const accessCode = req.body.accessCode;
        if (accessCode !== '3911') {
            return res.status(403).json({ message: 'Invalid Access Code. Registration is currently restricted.' });
        }

        const passwordHash = await hashPassword(password);
        const [newUser] = await db.insert(users).values({
            email,
            passwordHash,
            role: role || 'employee',
            twoFactorEnabled: false
        }).returning();

        req.session.userId = newUser.id;
        req.session.role = newUser.role;
        req.session.is2FAVerified = false;

        res.status(201).json({ user: { id: newUser.id, email: newUser.email, role: newUser.role } });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValid = await comparePassword(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        req.session.userId = user.id;
        req.session.role = user.role;
        req.session.is2FAVerified = !user.twoFactorEnabled; // If 2FA not enabled, considered verified

        res.json({
            user: { id: user.id, email: user.email, role: user.role, twoFactorEnabled: user.twoFactorEnabled },
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
        user: { id: user.id, email: user.email, role: user.role, twoFactorEnabled: user.twoFactorEnabled },
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
