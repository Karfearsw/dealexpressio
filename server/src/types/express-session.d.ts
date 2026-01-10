import 'express-session';

declare module 'express-session' {
    interface SessionData {
        userId: number;
        role: string;
        is2FAVerified: boolean;
        subscriptionTier?: string;
    }
}
