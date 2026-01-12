import { db } from '../db';
import { leads, deals, calls } from '../db/schema';
import { sql, eq, and } from 'drizzle-orm';

export class AnalyticsService {

    static async getDashboardMetrics(userId: number) {
        const [leadsResult] = await db
            .select({ count: sql<number>`cast(count(*) as int)` })
            .from(leads)
            .where(eq(leads.userId, userId));

        const [activeDealsResult] = await db
            .select({ count: sql<number>`cast(count(*) as int)` })
            .from(deals)
            .where(and(eq(deals.userId, userId), eq(deals.status, 'under_contract')));

        const [contractsOutResult] = await db
            .select({ count: sql<number>`cast(count(*) as int)` })
            .from(deals)
            .where(and(eq(deals.userId, userId), eq(deals.status, 'negotiation')));

        const [callsResult] = await db
            .select({ count: sql<number>`cast(count(*) as int)` })
            .from(calls)
            .where(eq(calls.userId, userId));

        const [revenueResult] = await db
            .select({
                total: sql<number>`cast(sum(${deals.assignmentFee}) as float)`,
                count: sql<number>`cast(count(*) as int)`
            })
            .from(deals)
            .where(and(eq(deals.userId, userId), eq(deals.status, 'closed')));

        const totalLeads = leadsResult?.count || 0;
        const totalRevenue = revenueResult?.total || 0;
        const dealsClosed = revenueResult?.count || 0;
        const avgDealSize = dealsClosed > 0 ? totalRevenue / dealsClosed : 0;
        const conversionRate = totalLeads > 0 ? (dealsClosed / totalLeads) * 100 : 0;

        return {
            totalLeads,
            activeDeals: activeDealsResult?.count || 0,
            contractsOut: contractsOutResult?.count || 0,
            revenue: totalRevenue,
            callsMade: callsResult?.count || 0,
            dealsClosed,
            avgDealSize,
            conversionRate
        };
    }

    static async getPipelineStats(userId: number) {
        const result = await db
            .select({
                status: leads.status,
                count: sql<number>`cast(count(*) as int)`
            })
            .from(leads)
            .where(eq(leads.userId, userId))
            .groupBy(leads.status);

        return result.map((r: { status: string | null; count: number }) => ({ name: r.status || 'Unknown', value: r.count }));
    }

    static async getSourceDistribution(userId: number) {
        const result = await db
            .select({
                source: leads.source,
                count: sql<number>`cast(count(*) as int)`
            })
            .from(leads)
            .where(eq(leads.userId, userId))
            .groupBy(leads.source);

        return result.map((r: { source: string | null; count: number }) => ({ name: r.source || 'Direct', value: r.count }));
    }

    static async getMonthlyPerformance(userId: number) {
        const result = await db.execute(sql`
            SELECT
                TO_CHAR(created_at, 'Mon') as name,
                SUM(assignment_fee) as revenue,
                COUNT(*) as deals
            FROM deals
            WHERE user_id = ${userId}
            AND status = 'closed'
            AND created_at >= DATE_TRUNC('year', CURRENT_DATE)
            GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
            ORDER BY DATE_TRUNC('month', created_at)
        `);

        return result.rows.map((row: any) => ({
            name: row.name,
            revenue: parseFloat(row.revenue as string) || 0,
            deals: parseInt(row.deals as string) || 0
        }));
    }
}
