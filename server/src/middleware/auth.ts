import { Request, Response, NextFunction, RequestHandler } from 'express';
import { PRICING_TIERS, SubscriptionTier } from '../config/tiers';
import { db } from '../db';
import { users, refreshTokens } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyToken, generateAccessToken, setAuthCookies, TokenPayload } from '../utils/jwt';

export const requireAuth: any = async (req: Request, res: Response, next: NextFunction) => {
    // 1. Check Access Token
    const accessToken = req.cookies.accessToken;
    if (accessToken) {
        const payload = verifyToken(accessToken);
        if (payload) {
            populateSession(req, payload);
            return next();
        }
    }

    // 2. Check Refresh Token (if Access Token invalid/missing)
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const payload = verifyToken(refreshToken);
        if (!payload) return res.status(401).json({ message: 'Unauthorized - Invalid Refresh Token' });

        // 3. Verify Refresh Token in DB
        const [tokenRow] = await db.select().from(refreshTokens)
            .where(and(
                eq(refreshTokens.token, refreshToken),
                eq(refreshTokens.userId, payload.userId),
                eq(refreshTokens.revoked, false)
            ));

        if (!tokenRow) {
            return res.status(401).json({ message: 'Unauthorized - Token Revoked' });
        }

        if (new Date(tokenRow.expiresAt).getTime() < Date.now()) {
            return res.status(401).json({ message: 'Unauthorized - Token Expired' });
        }

        // 4. Check User Token Version (Global Logout)
        const [user] = await db.select().from(users).where(eq(users.id, payload.userId));
        if (!user || user.tokenVersion !== payload.tokenVersion) {
            return res.status(401).json({ message: 'Unauthorized - Session Invalidated' });
        }

        // 5. Generate New Access Token
        const freshPayload: TokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            subscriptionTier: user.subscriptionTier || 'basic',
            is2FAVerified: payload.is2FAVerified,
            tokenVersion: user.tokenVersion
        };
        const newAccessToken = generateAccessToken(freshPayload);

        // 6. Set Cookies & Proceed
        setAuthCookies(res, newAccessToken, refreshToken);
        populateSession(req, freshPayload);
        next();
    } catch (err) {
        console.error("Auth Middleware Error", err);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

function populateSession(req: Request, payload: TokenPayload) {
    if (!req.session) return;
    req.session.userId = payload.userId;
    req.session.role = payload.role;
    req.session.subscriptionTier = payload.subscriptionTier;
    req.session.is2FAVerified = payload.is2FAVerified;
}

export const requireSubscription = (requiredTier: SubscriptionTier): any => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // If subscription tier is in session, check it first
        if (req.session.subscriptionTier) {
            const userTier = req.session.subscriptionTier as SubscriptionTier;
            if (hasAccess(userTier, requiredTier)) {
                return next();
            }
        }

        // Fallback to DB check
        try {
            const [user] = await db.select({ subscriptionTier: users.subscriptionTier }).from(users).where(eq(users.id, req.session.userId));
            const userTier = (user?.subscriptionTier || 'basic') as SubscriptionTier;

            // Update session cache
            req.session.subscriptionTier = userTier;

            if (hasAccess(userTier, requiredTier)) {
                return next();
            } else {
                return res.status(403).json({
                    message: 'Upgrade required',
                    code: 'TIER_RESTRICTED',
                    requiredTier
                });
            }
        } catch (error) {
            console.error('Subscription check error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };
};

// Helper to check tier hierarchy
const hasAccess = (userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean => {
    const levels: Record<SubscriptionTier, number> = {
        'basic': 1,
        'pro': 2,
        'enterprise': 3
    };
    return (levels[userTier] || 1) >= levels[requiredTier];
};


export const require2FA: any = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!req.session.is2FAVerified) {
        return res.status(403).json({ message: '2FA verification required' });
    }
    next();
};

export const requireAdmin: any = (req: Request, res: Response, next: NextFunction) => {
    if (req.session.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    next();
};
