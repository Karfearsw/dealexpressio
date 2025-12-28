import { Router, Request, Response } from 'express';
import { db } from '../db';
import { betaSignups } from '../db/schema';

const router = Router();

router.post('/beta-signup', async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        await db.insert(betaSignups).values({ email }).onConflictDoNothing();
        res.json({ message: 'Successfully joined the waiting list!' });
    } catch (error) {
        console.error('Beta signup error:', error);
        res.status(500).json({ message: 'Error signing up for beta' });
    }
});

export default router;
