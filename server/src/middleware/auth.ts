import { Request, Response, NextFunction } from 'express';
import { PRICING_TIERS, getTierConfig, SubscriptionTier } from '../config/tiers';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

declare module 'express-session' {
    interface SessionData {
        userId: number;
        role: string;
        is2FAVerified: boolean;
        subscriptionTier?: string;
    }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};

export const requireSubscription = (requiredTier: SubscriptionTier) => {
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


export const require2FA = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!req.session.is2FAVerified) {
        return res.status(403).json({ message: '2FA verification required' });
    }
    next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.session.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    next();
};
