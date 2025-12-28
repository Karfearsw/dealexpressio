import express from 'express';
import { requireAuth } from '../middleware/auth';
import { db } from '../db';
import { timesheets } from '../db/schema';
import { eq, and, desc, isNull } from 'drizzle-orm';

const router = express.Router();

// Get current timesheet status (active clock-in)
router.get('/status', requireAuth, async (req, res) => {
    try {
        const activeSheet = await db.query.timesheets.findFirst({
            where: and(
                eq(timesheets.userId, req.session.userId!),
                eq(timesheets.status, 'active')
            ),
        });

        res.json({ active: !!activeSheet, timesheet: activeSheet });
    } catch (error) {
        console.error('Error fetching timesheet status:', error);
        res.status(500).json({ error: 'Failed to fetch status' });
    }
});

// Clock In
router.post('/clock-in', requireAuth, async (req, res) => {
    try {
        // Check if already clocked in
        const activeSheet = await db.query.timesheets.findFirst({
            where: and(
                eq(timesheets.userId, req.session.userId!),
                eq(timesheets.status, 'active')
            ),
        });

        if (activeSheet) {
            return res.status(400).json({ error: 'Already clocked in' });
        }

        const [newSheet] = await db.insert(timesheets).values({
            userId: req.session.userId!,
            status: 'active',
        }).returning();

        res.json(newSheet);
    } catch (error) {
        console.error('Error clocking in:', error);
        res.status(500).json({ error: 'Failed to clock in' });
    }
});

// Clock Out
router.post('/clock-out', requireAuth, async (req, res) => {
    try {
        const activeSheet = await db.query.timesheets.findFirst({
            where: and(
                eq(timesheets.userId, req.session.userId!),
                eq(timesheets.status, 'active')
            ),
        });

        if (!activeSheet) {
            return res.status(400).json({ error: 'Not clocked in' });
        }

        const now = new Date();
        const duration = Math.floor((now.getTime() - activeSheet.clockIn.getTime()) / 1000);

        const [updatedSheet] = await db.update(timesheets)
            .set({
                clockOut: now,
                duration: duration,
                status: 'completed'
            })
            .where(eq(timesheets.id, activeSheet.id))
            .returning();

        res.json(updatedSheet);
    } catch (error) {
        console.error('Error clocking out:', error);
        res.status(500).json({ error: 'Failed to clock out' });
    }
});

// Get History
router.get('/history', requireAuth, async (req, res) => {
    try {
        const history = await db.query.timesheets.findMany({
            where: eq(timesheets.userId, req.session.userId!),
            orderBy: [desc(timesheets.clockIn)],
            limit: 50
        });

        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

export default router;
