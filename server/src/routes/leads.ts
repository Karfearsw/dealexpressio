import { Router, Request, Response } from 'express';
import { db } from '../db';
import { leads } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get all leads
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const allLeads = await db.select().from(leads).orderBy(desc(leads.createdAt));
        res.json(allLeads);
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get single lead
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const [lead] = await db.select().from(leads).where(eq(leads.id, parseInt(req.params.id)));
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        res.json(lead);
    } catch (error) {
        console.error('Error fetching lead:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create new lead
router.post('/', requireAuth, async (req: Request, res: Response) => {
    const { firstName, lastName, email, phone, source, status } = req.body;

    try {
        const [newLead] = await db.insert(leads).values({
            firstName,
            lastName,
            email,
            phone,
            source,
            status: status || 'New Lead',
            assignedTo: req.session.userId,
        }).returning();

        res.status(201).json(newLead);
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update lead (status, info, etc)
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
    const { firstName, lastName, email, phone, source, status, assignedTo } = req.body;

    try {
        const [updatedLead] = await db.update(leads)
            .set({
                firstName,
                lastName,
                email,
                phone,
                source,
                status,
                assignedTo
            })
            .where(eq(leads.id, parseInt(req.params.id)))
            .returning();

        if (!updatedLead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        res.json(updatedLead);
    } catch (error) {
        console.error('Error updating lead:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete lead
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        await db.delete(leads).where(eq(leads.id, parseInt(req.params.id)));
        res.json({ message: 'Lead deleted' });
    } catch (error) {
        console.error('Error deleting lead:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
