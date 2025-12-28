import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { db } from '../db';
import os from 'os';
import { sql } from 'drizzle-orm';

const router = express.Router();

router.get('/health', async (req, res) => {
    try {
        const start = Date.now();
        // Simple DB check
        await db.execute(sql`SELECT 1`);
        const dbLatency = Date.now() - start;

        const health = {
            status: 'ok',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            database: {
                status: 'connected',
                latencyMs: dbLatency
            },
            system: {
                memoryUsage: process.memoryUsage(),
                loadAverage: os.loadavg(),
                platform: os.platform(),
                release: os.release()
            }
        };

        res.json(health);
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: 'System unavailable'
        });
    }
});

export default router;
