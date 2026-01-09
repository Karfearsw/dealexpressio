import { Router, Request, Response } from 'express';
import { db } from '../db';
import { leads, type Lead } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth, requireSubscription } from '../middleware/auth';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';

interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Import leads from CSV (Pro feature)
router.post('/import', requireAuth, requireSubscription('pro'), upload.single('file'), async (req: Request, res: Response) => {
    const multerReq = req as MulterRequest;
    if (!multerReq.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const results: any[] = [];
    fs.createReadStream(multerReq.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                // Delete file after processing
                if (multerReq.file) {
                    fs.unlinkSync(multerReq.file.path);
                }

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

export default router;
