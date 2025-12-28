import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { db } from '../db';
import { buyers } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// Get all buyers
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const allBuyers = await db.select().from(buyers).orderBy(desc(buyers.createdAt));
        res.json(allBuyers);
    } catch (error) {
        console.error('Error fetching buyers:', error);
        res.status(500).json({ message: 'Error fetching buyers' });
    }
});

// Create a new buyer
router.post('/', requireAuth, async (req: Request, res: Response) => {
    const { name, email, phone, criteria } = req.body;
    try {
        const [newBuyer] = await db.insert(buyers).values({
            name,
            email,
            phone,
            criteria
        }).returning();
        res.status(201).json(newBuyer);
    } catch (error) {
        console.error('Error creating buyer:', error);
        res.status(500).json({ message: 'Error creating buyer' });
    }
});

export default router;
