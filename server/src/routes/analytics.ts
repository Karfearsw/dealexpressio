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
        const [dealsCount] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(properties);
        const [callsCount] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(calls);

        // Pipeline Stats (Leads by Status) - Conversion Funnel
        const pipelineRaw = await db
            .select({
                status: leads.status,
                count: sql<number>`cast(count(*) as int)`
            })
            .from(leads)
            .groupBy(leads.status);

        // Map to standard funnel order if possible, or just return all
        const pipelineStats = pipelineRaw.map((p: { status: string; count: number }) => ({ name: p.status, value: p.count }));

        // YTD Revenue (Sum of assignment fees for 'Closed Deal' properties created this year)
        // Note: Ideally we use a 'closedAt' date, but using 'createdAt' or just status check for now
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1).toISOString();

        const [revenueResult] = await db
            .select({
                total: sql<number>`cast(sum(${properties.assignmentFee}) as float)`,
                count: sql<number>`cast(count(*) as int)`
            })
            .from(properties)
            .where(sql`${properties.status} = 'Closed Deal'`); // Removed year filter for now to show all data, can add AND created_at >= ${startOfYear}

        const totalRevenue = revenueResult?.total || 0;
        const dealsClosed = revenueResult?.count || 0;
        const avgDealSize = dealsClosed > 0 ? totalRevenue / dealsClosed : 0;
        const totalLeads = leadsCount.count || 0;
        const conversionRate = totalLeads > 0 ? (dealsClosed / totalLeads) * 100 : 0;

        // "Contracts Out" estimation (Properties with status 'Open Deal')
        const [activeDealsCount] = await db
            .select({ count: sql<number>`cast(count(*) as int)` })
            .from(properties)
            .where(sql`${properties.status} = 'Open Deal'`);

        // Monthly Performance (Mock or real if dates available)
        // For now returning empty or basic
        
        // Lead Source Distribution
        const sourcesRaw = await db
            .select({
                source: leads.source,
                count: sql<number>`cast(count(*) as int)`
            })
            .from(leads)
            .groupBy(leads.source);
            
        const sourceDistribution = sourcesRaw.map((s: { source: string; count: number }) => ({ name: s.source || 'Unknown', value: s.count }));

        res.json({
            metrics: {
                totalLeads,
                activeDeals: activeDealsCount.count,
                callsMade: callsCount.count,
                revenue: totalRevenue,
                dealsClosed,
                avgDealSize,
                conversionRate
            },
            pipeline: pipelineStats,
            sources: sourceDistribution,
            revenue: [] // TODO: Implement monthly revenue
        });

    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});

export default router;
