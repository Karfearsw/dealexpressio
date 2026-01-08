import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { makeCall, sendSMS } from '../services/signalwire';
import { db } from '../db';
import { calls, smsMessages, voicemails } from '../db/schema'; // Assuming these schemas exist
import { eq, desc } from 'drizzle-orm';

const router = Router();

// Get recent communication history (global)
router.get('/recent', requireAuth, async (req: Request, res: Response) => {
    try {
        const isMockMode = !process.env.SIGNALWIRE_PROJECT_ID;

        const recentCalls = await db.select().from(calls).orderBy(desc(calls.createdAt)).limit(20);
        const recentSms = await db.select().from(smsMessages).orderBy(desc(smsMessages.createdAt)).limit(20);
        const recentVoicemails = await db.select().from(voicemails).orderBy(desc(voicemails.createdAt)).limit(20);

        // If mock mode and no data, return some fake data for the UI
        if (isMockMode && recentCalls.length === 0 && recentSms.length === 0) {
            return res.json({
                isMockMode: true,
                calls: [
                    { id: 1, direction: 'inbound', status: 'completed', createdAt: new Date().toISOString(), duration: 120, leadId: 1 },
                    { id: 2, direction: 'outbound', status: 'no-answer', createdAt: new Date(Date.now() - 86400000).toISOString(), duration: 0, leadId: 1 }
                ],
                sms: [
                    { id: 1, direction: 'inbound', message: 'I am interested in the offer', createdAt: new Date().toISOString(), leadId: 1 },
                    { id: 2, direction: 'outbound', message: 'Hi, just following up on the property', createdAt: new Date(Date.now() - 3600000).toISOString(), leadId: 1 }
                ],
                voicemail: []
            });
        }

        res.json({
            isMockMode,
            calls: recentCalls,
            sms: recentSms,
            voicemail: recentVoicemails
        });
    } catch (error) {
        console.error('Error fetching recent communication:', error);
        // Return empty structure on error to prevent frontend crash
        res.status(500).json({ 
            message: 'Error fetching recent communication',
            calls: [],
            sms: [],
            voicemail: []
        });
    }
});

// Initiate a call
router.post('/call', requireAuth, async (req: Request, res: Response) => {
    const { to, leadId } = req.body;
    // In a real app, 'from' should be one of your purchased SignalWire numbers
    const from = process.env.SIGNALWIRE_PHONE_NUMBER || '+15550109999';
    const callbackUrl = `${process.env.APP_URL}/api/communication/webhooks/voice`; // URL for SignalWire to hit

    try {
        const call = await makeCall(to, from, callbackUrl);

        // Log call in DB
        await db.insert(calls).values({
            leadId,
            userId: req.session.userId!,
            direction: 'outbound',
            status: call.status,
            sid: call.sid,
            duration: 0,
            recordingUrl: null
        });

        res.json({ message: 'Call initiated', sid: call.sid });
    } catch (error) {
        console.error('Error making call:', error);
        res.status(500).json({ message: 'Failed to initiate call' });
    }
});

// Send an SMS
router.post('/sms', requireAuth, async (req: Request, res: Response) => {
    const { to, message, leadId } = req.body;
    const from = process.env.SIGNALWIRE_PHONE_NUMBER || '+15550109999';

    try {
        const sms = await sendSMS(to, from, message);

        // Log SMS in DB
        await db.insert(smsMessages).values({
            leadId,
            userId: req.session.userId!,
            direction: 'outbound',
            status: sms.status,
            sid: sms.sid,
            message: message
        });

        res.json({ message: 'SMS sent', sid: sms.sid });
    } catch (error) {
        console.error('Error sending SMS:', error);
        res.status(500).json({ message: 'Failed to send SMS' });
    }
});

// Get communication history for a lead
router.get('/history/:leadId', requireAuth, async (req: Request, res: Response) => {
    try {
        const leadId = parseInt(req.params.leadId);

        const callHistory = await db.select().from(calls).where(eq(calls.leadId, leadId)).orderBy(desc(calls.createdAt));
        const smsHistory = await db.select().from(smsMessages).where(eq(smsMessages.leadId, leadId)).orderBy(desc(smsMessages.createdAt));

        // Combine and sort by date could happen here or on client
        res.json({ calls: callHistory, sms: smsHistory });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Webhook for Voice Status Updates (publicly accessible)
router.post('/webhooks/voice', async (req: Request, res: Response) => {
    // Handle SignalWire voice callbacks events (e.g., status changes, recording available)
    console.log('Voice Webhook:', req.body);
    // You would update the call status in DB here
    res.status(200).send('<Response></Response>');
});

// Webhook for Incoming SMS (publicly accessible)
router.post('/webhooks/sms', async (req: Request, res: Response) => {
    // Handle incoming SMS
    console.log('SMS Webhook:', req.body);
    // Parse body, store in DB as inbound message
    res.status(200).send('<Response></Response>');
});

export default router;
