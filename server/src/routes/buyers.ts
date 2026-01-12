import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { db } from '../db';
import { buyers } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

// Get all buyers for the current user
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });
        
        const allBuyers = await db.select().from(buyers)
            .where(eq(buyers.userId, req.session.userId))
            .orderBy(desc(buyers.createdAt));
        res.json(allBuyers);
    } catch (error) {
        console.error('Error fetching buyers:', error);
        res.status(500).json({ message: 'Error fetching buyers' });
    }
});

// Get single buyer
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });
        
        const [buyer] = await db.select().from(buyers)
            .where(and(eq(buyers.id, parseInt(req.params.id)), eq(buyers.userId, req.session.userId)));
        
        if (!buyer) {
            return res.status(404).json({ message: 'Buyer not found' });
        }
        res.json(buyer);
    } catch (error) {
        console.error('Error fetching buyer:', error);
        res.status(500).json({ message: 'Error fetching buyer' });
    }
});

// Create a new buyer
router.post('/', requireAuth, async (req: Request, res: Response) => {
    const { name, email, phone, criteria } = req.body;
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });
        
        const [newBuyer] = await db.insert(buyers).values({
            userId: req.session.userId,
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

// Update buyer
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
    const { name, email, phone, criteria } = req.body;
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });
        
        const [updated] = await db.update(buyers)
            .set({ name, email, phone, criteria })
            .where(and(eq(buyers.id, parseInt(req.params.id)), eq(buyers.userId, req.session.userId)))
            .returning();
        
        if (!updated) {
            return res.status(404).json({ message: 'Buyer not found' });
        }
        res.json(updated);
    } catch (error) {
        console.error('Error updating buyer:', error);
        res.status(500).json({ message: 'Error updating buyer' });
    }
});

// Delete buyer
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });
        
        const [deleted] = await db.delete(buyers)
            .where(and(eq(buyers.id, parseInt(req.params.id)), eq(buyers.userId, req.session.userId)))
            .returning();
        
        if (!deleted) {
            return res.status(404).json({ message: 'Buyer not found' });
        }
        res.json({ message: 'Buyer deleted' });
    } catch (error) {
        console.error('Error deleting buyer:', error);
        res.status(500).json({ message: 'Error deleting buyer' });
    }
});

export default router;
