import { Router, Request, Response } from 'express';
import { db } from '../db';
import { leads, deals, properties, type Lead } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { requireAuth, requireSubscription } from '../middleware/auth';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import os from 'os';
import path from 'path';

const router = Router();
const upload = multer({ dest: path.join(os.tmpdir(), 'uploads/') });

// Import leads from CSV (Pro feature)
router.post('/import', requireAuth, requireSubscription('pro'), upload.single('file'), async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const results: any[] = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                // Delete file after processing
                fs.unlinkSync(req.file!.path);

                const validLeads = results
                    .filter(row => row.firstName && row.lastName && row.email)
                    .map(row => ({
                        firstName: row.firstName,
                        lastName: row.lastName,
                        email: row.email,
                        phone: row.phone || null,
                        source: row.source || 'Imported',
                        status: 'New Lead',
                        assignedTo: req.session.userId,
                    }));

                if (validLeads.length === 0) {
                    return res.status(400).json({ message: 'No valid leads found in CSV' });
                }

                await db.insert(leads).values(validLeads);
                res.json({ message: `Successfully imported ${validLeads.length} leads` });
            } catch (error) {
                console.error('Error importing leads:', error);
                res.status(500).json({ message: 'Error processing CSV file' });
            }
        });
});

// Export leads to CSV (Pro feature)
router.get('/export', requireAuth, requireSubscription('pro'), async (req: Request, res: Response) => {
    try {
        const allLeads = await db.select().from(leads).orderBy(desc(leads.createdAt));

        const csvHeader = 'ID,First Name,Last Name,Email,Phone,Status,Source,Created At\n';
        const csvRows = allLeads.map((lead: Lead) => {
            return [
                lead.id,
                `"${lead.firstName}"`,
                `"${lead.lastName}"`,
                `"${lead.email || ''}"`,
                `"${lead.phone || ''}"`,
                `"${lead.status}"`,
                `"${lead.source || ''}"`,
                `"${lead.createdAt.toISOString()}"`
            ].join(',');
        }).join('\n');

        res.header('Content-Type', 'text/csv');
        res.attachment('leads-export.csv');
        res.send(csvHeader + csvRows);
    } catch (error) {
        console.error('Error exporting leads:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all leads
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const allLeads = await db.select().from(leads).orderBy(desc(leads.createdAt));
        res.json(allLeads);
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get single lead
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const [lead] = await db.select().from(leads).where(eq(leads.id, parseInt(req.params.id)));
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        res.json(lead);
    } catch (error) {
        console.error('Error fetching lead:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create new lead
router.post('/', requireAuth, async (req: Request, res: Response) => {
    const { firstName, lastName, email, phone, source, status } = req.body;

    try {
        if (!firstName || !lastName) {
            return res.status(400).json({ message: 'First Name and Last Name are required' });
        }

        const [newLead] = await db.insert(leads).values({
            firstName,
            lastName,
            email,
            phone,
            source,
            status: status || 'New Lead',
            assignedTo: req.session.userId,
        }).returning();

        res.status(201).json(newLead);
    } catch (error: any) {
        console.error('Error creating lead:', error);
        if (error.code === '23503') {
            return res.status(400).json({ message: 'Invalid user session. Please log in again.' });
        }
        res.status(500).json({ message: 'Internal server error: ' + (error.message || 'Unknown error') });
    }
});

// Update lead (status, info, etc)
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
    const { firstName, lastName, email, phone, source, status, assignedTo } = req.body;

    try {
        const [updatedLead] = await db.update(leads)
            .set({
                firstName,
                lastName,
                email,
                phone,
                source,
                status,
                assignedTo
            })
            .where(eq(leads.id, parseInt(req.params.id)))
            .returning();

        if (!updatedLead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        res.json(updatedLead);
    } catch (error) {
        console.error('Error updating lead:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete lead
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        await db.delete(leads).where(eq(leads.id, parseInt(req.params.id)));
        res.json({ message: 'Lead deleted' });
    } catch (error) {
        console.error('Error deleting lead:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Convert lead to deal
router.post('/:id/convert-to-deal', async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).send('Unauthorized');
        const { id } = req.params;
        const userId = req.session.userId;

        // Get lead data
        const [lead] = await db
            .select()
            .from(leads)
            .where(and(eq(leads.id, parseInt(id)), eq(leads.assignedTo, userId)));

        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        // Create deal from lead
        const [deal] = await db.insert(properties).values({
            leadId: lead.id,
            address: 'TBD', // Placeholder as leads table doesn't have address column in schema provided
            status: 'New',
        }).returning();

        // Update lead status
        await db.update(leads)
            .set({ status: 'Converted' })
            .where(eq(leads.id, lead.id));

        res.json(deal);
    } catch (error) {
        console.error('Error converting lead to deal:', error);
        res.status(500).json({ error: 'Failed to convert lead' });
    }
});

// Update lead status and auto-convert if contract signed
router.patch('/:id/status', requireAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Update lead
        const [updatedLead] = await db
            .update(leads)
            .set({
                status,
                contractSignedAt: status === 'contract_signed' ? new Date() : undefined,
                updatedAt: new Date()
            })
            .where(and(eq(leads.id, parseInt(id)), eq(leads.assignedTo, userId)))
            .returning();

        if (!updatedLead) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        // If contract signed, automatically create deal
        if (status === 'contract_signed' && !updatedLead.convertedToDealId) {

            // Try to find property address
            const [property] = await db.select().from(properties).where(eq(properties.leadId, parseInt(id)));

            const [newDeal] = await db.insert(deals).values({
                userId,
                leadId: parseInt(id),
                address: property?.address || 'TBD',
                city: property?.city || null,
                state: property?.state || null,
                zip: property?.zip || null,
                status: 'under_contract'
            }).returning();

            // Link lead to deal
            await db
                .update(leads)
                .set({ convertedToDealId: newDeal.id, status: 'converted' })
                .where(eq(leads.id, parseInt(id)));

            return res.json({
                lead: updatedLead,
                deal: newDeal,
                message: 'Lead converted to deal successfully'
            });
        }

        res.json({ lead: updatedLead });
    } catch (error) {
        console.error('Error updating lead:', error);
        res.status(500).json({ error: 'Failed to update lead' });
    }
});

export default router;
