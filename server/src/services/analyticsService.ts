import { db } from '../db';
import { leads, deals, calls } from '../db/schema';
import { sql, eq, and, gte, lte } from 'drizzle-orm';

export class AnalyticsService {

    static async getDashboardMetrics() {
        // Total Leads
        const [leadsResult] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(leads);

        // Active Deals (Status = 'under_contract')
        const [activeDealsResult] = await db
            .select({ count: sql<number>`cast(count(*) as int)` })
            .from(deals)
            .where(eq(deals.status, 'under_contract'));

        // Contracts Out (Status = 'negotiation')
        const [contractsOutResult] = await db
            .select({ count: sql<number>`cast(count(*) as int)` })
            .from(deals)
            .where(eq(deals.status, 'negotiation'));

        // Calls Made
        const [callsResult] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(calls);

        // Revenue & Closed Deals
        const [revenueResult] = await db
            .select({
                total: sql<number>`cast(sum(${deals.assignmentFee}) as float)`,
                count: sql<number>`cast(count(*) as int)`
            })
            .from(deals)
            .where(eq(deals.status, 'closed'));

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

    static async getPipelineStats() {
        const result = await db
            .select({
                status: leads.status,
                count: sql<number>`cast(count(*) as int)`
            })
            .from(leads)
            .groupBy(leads.status);

        return result.map((r: { status: string | null; count: number }) => ({ name: r.status || 'Unknown', value: r.count }));
    }

    static async getSourceDistribution() {
        const result = await db
            .select({
                source: leads.source,
                count: sql<number>`cast(count(*) as int)`
            })
            .from(leads)
            .groupBy(leads.source);

        return result.map((r: { source: string | null; count: number }) => ({ name: r.source || 'Direct', value: r.count }));
    }

    static async getMonthlyPerformance() {
        const result = await db.execute(sql`
            SELECT
                TO_CHAR(created_at, 'Mon') as name,
                SUM(assignment_fee) as revenue,
                COUNT(*) as deals
            FROM deals
            WHERE status = 'closed'
            AND created_at >= DATE_TRUNC('year', CURRENT_DATE)
            GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
            ORDER BY DATE_TRUNC('month', created_at)
        `);

        // If no data, return empty array
        return result.rows.map((row: any) => ({
            name: row.name,
            revenue: parseFloat(row.revenue as string) || 0,
            deals: parseInt(row.deals as string) || 0
        }));
    }
}
