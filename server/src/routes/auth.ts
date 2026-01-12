import { Router, Request, Response } from 'express';
import { db } from '../db';
import { hashPassword, comparePassword } from '../utils/auth';
import { generateAccessToken, generateRefreshToken, setAuthCookies, clearAuthCookies, TokenPayload } from '../utils/jwt';
import { refreshTokens, users } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import rateLimit from 'express-rate-limit';
import { isEmailValid, isPasswordValid, isNameValid, sanitize } from '../utils/validation';
import { logEvent, AuditAction } from '../utils/auditLog';
import { sendWelcomeEmail } from '../services/email';

const router = Router();

const registerLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 50 });
const loginLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 100 });

async function createRefreshToken(userId: number, payload: TokenPayload, req?: Request) {
    const token = generateRefreshToken(payload);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.insert(refreshTokens).values({
        userId,
        token,
        expiresAt,
        userAgent: req?.headers['user-agent'] || null,
        ipAddress: req?.ip || req?.headers['x-forwarded-for']?.toString() || null,
    });

    return token;
}

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
            twoFactorEnabled: false,
            tokenVersion: 0
        }).onConflictDoNothing({ target: users.email }).returning();

        if (!inserted || inserted.length === 0) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const newUser = inserted[0];

        const payload: TokenPayload = {
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role,
            subscriptionTier: newUser.subscriptionTier || 'basic',
            is2FAVerified: false,
            tokenVersion: 0
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = await createRefreshToken(newUser.id, payload, req);

        setAuthCookies(res, accessToken, refreshToken);

        await logEvent({
            userId: newUser.id,
            action: AuditAction.LOGIN_SUCCESS,
            status: 'success',
            details: { method: 'register', email: newUser.email },
            req
        });

        sendWelcomeEmail(newUser.email, sFirst, sLast).catch(err => {
            console.error('Failed to send welcome email:', err);
        });

        res.status(201).json({ user: { id: newUser.id, email: newUser.email, role: newUser.role, subscriptionTier: newUser.subscriptionTier } });
    } catch (error: any) {
        await logEvent({
            action: AuditAction.LOGIN_FAILURE,
            status: 'failure',
            details: { method: 'register', error: error.message },
            req
        });
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
            return res.status(429).json({ message: 'Account temporarily locked. Try again later.' });
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

        const payload: TokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            subscriptionTier: user.subscriptionTier || 'basic',
            is2FAVerified: !user.twoFactorEnabled,
            tokenVersion: user.tokenVersion || 0
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = await createRefreshToken(user.id, payload, req);

        setAuthCookies(res, accessToken, refreshToken);

        await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, user.id));

        await logEvent({
            userId: user.id,
            action: AuditAction.LOGIN_SUCCESS,
            status: 'success',
            details: { mfaRequired: user.twoFactorEnabled },
            req
        });

        res.json({
            user: { id: user.id, email: user.email, role: user.role, twoFactorEnabled: user.twoFactorEnabled, subscriptionTier: user.subscriptionTier },
            requires2FA: user.twoFactorEnabled
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/logout', async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        // Revoke the refresh token in DB
        await db.update(refreshTokens)
            .set({ revoked: true })
            .where(eq(refreshTokens.token, refreshToken));
    }

    clearAuthCookies(res);
    await logEvent({
        userId: req.session.userId,
        action: AuditAction.LOGOUT,
        req
    });
    req.session.destroy(() => {
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

        // Issue new tokens with verified status
        const payload: TokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            subscriptionTier: user.subscriptionTier || 'basic',
            is2FAVerified: true,
            tokenVersion: user.tokenVersion || 0
        };
        const accessToken = generateAccessToken(payload);
        const refreshTokenToken = await createRefreshToken(user.id, payload, req);
        setAuthCookies(res, accessToken, refreshTokenToken);

        await logEvent({
            userId: user.id,
            action: AuditAction.MFA_VERIFY,
            status: 'success',
            req
        });

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
        const newTokenVersion = (user.tokenVersion || 0) + 1;

        await db.update(users)
            .set({
                passwordHash: newPasswordHash,
                tokenVersion: newTokenVersion
            })
            .where(eq(users.id, user.id));

        // Revoke all existing refresh tokens for this user
        await db.update(refreshTokens)
            .set({ revoked: true })
            .where(eq(refreshTokens.userId, user.id));

        // Issue new tokens for the current session
        const payload: TokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            subscriptionTier: user.subscriptionTier || 'basic',
            is2FAVerified: req.session.is2FAVerified || false,
            tokenVersion: newTokenVersion
        };
        const accessToken = generateAccessToken(payload);
        const refreshTokenToken = await createRefreshToken(user.id, payload, req);
        setAuthCookies(res, accessToken, refreshTokenToken);

        await logEvent({
            userId: user.id,
            action: AuditAction.PASSWORD_CHANGE,
            status: 'success',
            req
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Error changing password' });
    }
});

export default router;
