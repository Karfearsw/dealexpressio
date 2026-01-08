import { Router, Request, Response } from 'express';
import { db } from '../db';
import { betaSignups, users, properties, leads } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import { desc, eq, count, sql } from 'drizzle-orm';

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

router.get('/beta-signups', requireAuth, async (req: Request, res: Response) => {
    try {
        const signups = await db.select().from(betaSignups).orderBy(desc(betaSignups.createdAt));
        res.json(signups);
    } catch (error) {
        console.error('Error fetching beta signups:', error);
        res.status(500).json({ message: 'Error fetching beta signups' });
    }
});

router.get('/stats', async (_req: Request, res: Response) => {
    try {
        // Count total users
        const [userResult] = await db.select({ count: count() }).from(users);
        const userCount = userResult?.count || 0;

        // Count closed deals (properties with status 'Closed')
        const [dealsResult] = await db.select({ count: count() }).from(properties).where(eq(properties.status, 'Closed'));
        const dealsCount = dealsResult?.count || 0;

        // Monthly leads (last 30 days)
        const [leadsResult] = await db.select({ count: count() })
            .from(leads)
            .where(sql`${leads.createdAt} > NOW() - INTERVAL '30 days'`);
        const monthlyLeads = leadsResult?.count || 0;

        // Tracked Volume (sum of projected_spread)
        const [volumeResult] = await db.select({ sum: sql<string>`sum(${properties.projectedSpread})` }).from(properties);
        const volume = parseFloat(volumeResult?.sum || '0');

        // Return structured stats
        res.json({
            activeUsers: userCount,
            dealsClosed: dealsCount,
            monthlyLeads,
            trackedVolume: volume
        });
    } catch (error) {
        console.error('Stats fetch error:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

// Public pricing tiers
router.get('/pricing-tiers', async (_req: Request, res: Response) => {
    try {
        const tiers = [
            { name: 'Basic', price: 50, period: 'per month', leadsIncluded: 500, priceId: 'price_1Q...Basic' },
            { name: 'Pro', price: 100, period: 'per month', leadsIncluded: 1000, priceId: 'price_1Q...Pro' },
            { name: 'Enterprise', price: 1000, period: 'per month', leadsIncluded: 15000, priceId: 'price_1Q...Enterprise' }
        ];
        res.json(tiers);
    } catch (error) {
        console.error('Error fetching pricing tiers:', error);
        res.status(500).json({ message: 'Error fetching pricing tiers' });
    }
});

export default router;
