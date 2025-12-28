import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { db } from '../db';
import { leads, properties, calls } from '../db/schema';
import { sql } from 'drizzle-orm';

const router = Router();

router.get('/dashboard', requireAuth, async (req: Request, res: Response) => {
    try {
        // Real data aggregation
        const [leadsCount] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(leads);
        const [propertiesCount] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(properties);
        const [callsCount] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(calls);

        // Pipeline Stats (Leads by Status)
        const pipelineRaw = await db
            .select({
                status: leads.status,
                count: sql<number>`cast(count(*) as int)`
            })
            .from(leads)
            .groupBy(leads.status);

        const pipelineStats = pipelineRaw.map(p => ({ name: p.status, value: p.count }));

        // Revenue (Sum of assignment fees for Closed properties)
        const [revenueResult] = await db
            .select({
                total: sql<number>`cast(sum(${properties.assignmentFee}) as float)`
            })
            .from(properties)
            .where(sql`${properties.status} = 'Closed'`);

        const totalRevenue = revenueResult?.total || 0;

        // "Contracts Out" estimation (Properties with status 'Under Contract')
        const [contractsOutCount] = await db
            .select({ count: sql<number>`cast(count(*) as int)` })
            .from(properties)
            .where(sql`${properties.status} = 'Under Contract'`);

        res.json({
            metrics: {
                totalLeads: leadsCount.count,
                activeDeals: propertiesCount.count,
                callsMade: callsCount.count,
                contractsOut: contractsOutCount.count,
                revenue: totalRevenue
            },
            pipeline: pipelineStats,
            revenue: [] // TODO: Implement revenue over time aggregation based on property closed dates
        });

    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});

export default router;
