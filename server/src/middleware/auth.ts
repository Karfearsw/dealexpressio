import { Request, Response, NextFunction } from 'express';

declare module 'express-session' {
    interface SessionData {
        userId: number;
        role: string;
        is2FAVerified: boolean;
    }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
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
