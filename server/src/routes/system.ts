import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { db } from '../db';
import { contactSubmissions } from '../db/schema';
import os from 'os';
import { sql } from 'drizzle-orm';

const router = express.Router();

router.post('/contact', async (req, res) => {
    const { email, message } = req.body;
    
    if (!email || !message) {
        return res.status(400).json({ message: 'Email and message are required' });
    }

    try {
        await db.insert(contactSubmissions).values({ email, message });
        res.json({ message: 'Contact submission received' });
    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({ message: 'Error submitting contact form' });
    }
});

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
