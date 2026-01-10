import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { AnalyticsService } from '../services/analyticsService';

const router = Router();

router.get('/dashboard', requireAuth, async (req: Request, res: Response) => {
    try {
        const [metrics, pipeline, sources, performance] = await Promise.all([
            AnalyticsService.getDashboardMetrics(),
            AnalyticsService.getPipelineStats(),
            AnalyticsService.getSourceDistribution(),
            AnalyticsService.getMonthlyPerformance()
        ]);

        res.json({
            metrics,
            pipeline,
            sources,
            revenue: performance
        });

    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});

export default router;
