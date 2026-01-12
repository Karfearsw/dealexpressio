import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { AnalyticsService } from '../services/analyticsService';

const router = Router();

router.get('/dashboard', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const [metrics, pipeline, sources, performance] = await Promise.all([
            AnalyticsService.getDashboardMetrics(userId),
            AnalyticsService.getPipelineStats(userId),
            AnalyticsService.getSourceDistribution(userId),
            AnalyticsService.getMonthlyPerformance(userId)
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
