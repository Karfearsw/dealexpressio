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
import { logEvent, AuditAction } from '../utils/auditLog';

const router = Router();
const upload = multer({ dest: path.join(os.tmpdir(), 'uploads/') });

// Import leads from CSV (Pro feature)
router.post('/import', requireAuth, requireSubscription('pro'), upload.single('file'), async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.session.userId;
    const results: any[] = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                fs.unlinkSync(req.file!.path);

                const validLeads = results
                    .filter(row => row.firstName && row.lastName && row.email)
                    .map(row => ({
                        userId,
                        firstName: row.firstName,
                        lastName: row.lastName,
                        email: row.email,
                        phone: row.phone || null,
                        source: row.source || 'Imported',
                        status: 'New Lead',
                        assignedTo: userId,
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
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });
        
        const allLeads = await db.select().from(leads)
            .where(eq(leads.userId, req.session.userId))
            .orderBy(desc(leads.createdAt));

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

// Get all leads for the current user
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });
        
        const allLeads = await db.select().from(leads)
            .where(eq(leads.userId, req.session.userId))
            .orderBy(desc(leads.createdAt));
        res.json(allLeads);
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get single lead (must belong to user)
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });
        
        const [lead] = await db.select().from(leads)
            .where(and(eq(leads.id, parseInt(req.params.id)), eq(leads.userId, req.session.userId)));
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
    const { firstName, lastName, email, phone, address, city, state, zip, source, status } = req.body;

    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });
        if (!firstName || !lastName) {
            return res.status(400).json({ message: 'First Name and Last Name are required' });
        }

        const [newLead] = await db.insert(leads).values({
            userId: req.session.userId,
            firstName,
            lastName,
            email,
            phone,
            address,
            city,
            state,
            zip,
            source,
            status: status || 'New Lead',
            assignedTo: req.session.userId,
        }).returning();

        await logEvent({
            userId: req.session.userId,
            action: AuditAction.LEAD_CREATE,
            resource: `leads:${newLead.id}`,
            req
        });

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
    const { firstName, lastName, email, phone, address, city, state, zip, source, status, assignedTo } = req.body;
    const userId = req.session.userId;

    try {
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        
        const isContractSigned = status === 'Contract Signed' || status === 'contract_signed';

        const updateData: Record<string, any> = { updatedAt: new Date() };
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        if (city !== undefined) updateData.city = city;
        if (state !== undefined) updateData.state = state;
        if (zip !== undefined) updateData.zip = zip;
        if (source !== undefined) updateData.source = source;
        if (status !== undefined) updateData.status = status;
        if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
        if (isContractSigned) updateData.contractSignedAt = new Date();

        const [updatedLead] = await db.update(leads)
            .set(updateData)
            .where(and(eq(leads.id, parseInt(req.params.id)), eq(leads.userId, userId)))
            .returning();

        if (!updatedLead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        await logEvent({
            userId: req.session.userId,
            action: AuditAction.LEAD_UPDATE,
            resource: `leads:${updatedLead.id}`,
            req
        });

        // If contract signed and not already converted, automatically create deal
        if (isContractSigned && !updatedLead.convertedToDealId && userId) {
            // Use lead's address first, then try property
            const [property] = await db.select().from(properties).where(eq(properties.leadId, parseInt(req.params.id)));

            const [newDeal] = await db.insert(deals).values({
                userId,
                leadId: parseInt(req.params.id),
                address: updatedLead.address || property?.address || 'TBD',
                city: updatedLead.city || property?.city || null,
                state: updatedLead.state || property?.state || null,
                zip: updatedLead.zip || property?.zip || null,
                status: 'Under Contract'
            }).returning();

            // Link lead to deal (keep status as Contract Signed)
            const [convertedLead] = await db
                .update(leads)
                .set({ convertedToDealId: newDeal.id })
                .where(eq(leads.id, parseInt(req.params.id)))
                .returning();

            return res.json({
                ...convertedLead,
                deal: newDeal,
                message: 'Lead converted to deal successfully'
            });
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
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });
        
        const [deleted] = await db.delete(leads)
            .where(and(eq(leads.id, parseInt(req.params.id)), eq(leads.userId, req.session.userId)))
            .returning();

        if (!deleted) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        await logEvent({
            userId: req.session.userId,
            action: AuditAction.LEAD_DELETE,
            resource: `leads:${req.params.id}`,
            req
        });

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

        const [lead] = await db
            .select()
            .from(leads)
            .where(and(eq(leads.id, parseInt(id)), eq(leads.userId, userId)));

        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        const [property] = await db.insert(properties).values({
            userId,
            leadId: lead.id,
            address: 'TBD',
            status: 'New',
        }).returning();

        await db.update(leads)
            .set({ status: 'Converted' })
            .where(eq(leads.id, lead.id));

        res.json(property);
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

        const isContractSigned = status === 'Contract Signed' || status === 'contract_signed';

        const [updatedLead] = await db
            .update(leads)
            .set({
                status,
                contractSignedAt: isContractSigned ? new Date() : undefined,
                updatedAt: new Date()
            })
            .where(and(eq(leads.id, parseInt(id)), eq(leads.userId, userId)))
            .returning();

        if (!updatedLead) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        // If contract signed, automatically create deal
        if (isContractSigned && !updatedLead.convertedToDealId) {
            // Use lead's address first, then try property
            const [property] = await db.select().from(properties).where(eq(properties.leadId, parseInt(id)));

            const [newDeal] = await db.insert(deals).values({
                userId,
                leadId: parseInt(id),
                address: updatedLead.address || property?.address || 'TBD',
                city: updatedLead.city || property?.city || null,
                state: updatedLead.state || property?.state || null,
                zip: updatedLead.zip || property?.zip || null,
                status: 'Under Contract'
            }).returning();

            // Link lead to deal (keep status as Contract Signed)
            const [convertedLead] = await db
                .update(leads)
                .set({ convertedToDealId: newDeal.id })
                .where(eq(leads.id, parseInt(id)))
                .returning();

            return res.json({
                lead: convertedLead,
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

// Convert lead to deal with contract details
router.post('/:id/convert-with-contract', requireAuth, upload.single('contractFile'), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;
        
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { 
            contractPrice, 
            marketedPrice, 
            expiryDate, 
            notes, 
            assignmentFee,
            bedrooms,
            bathrooms,
            squareFeet,
            yearBuilt,
            propertyImageUrl
        } = req.body;

        const [lead] = await db
            .select()
            .from(leads)
            .where(and(eq(leads.id, parseInt(id)), eq(leads.userId, userId)));

        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        let contractFileUrl = null;
        if (req.file) {
            contractFileUrl = `/uploads/${req.file.filename}`;
        }

        const [newDeal] = await db.insert(deals).values({
            userId,
            leadId: parseInt(id),
            address: lead.address || 'TBD',
            city: lead.city || null,
            state: lead.state || null,
            zip: lead.zip || null,
            contractPrice: contractPrice || null,
            marketedPrice: marketedPrice || null,
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            notes: notes || null,
            assignmentFee: assignmentFee || null,
            contractFileUrl: contractFileUrl,
            propertyImageUrl: propertyImageUrl || null,
            bedrooms: bedrooms ? parseInt(bedrooms) : null,
            bathrooms: bathrooms ? parseInt(bathrooms) : null,
            squareFeet: squareFeet ? parseInt(squareFeet) : null,
            yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
            status: 'Under Contract'
        }).returning();

        const [updatedLead] = await db
            .update(leads)
            .set({ 
                status: 'Contract Signed',
                contractSignedAt: new Date(),
                convertedToDealId: newDeal.id,
                updatedAt: new Date()
            })
            .where(eq(leads.id, parseInt(id)))
            .returning();

        await logEvent({
            userId,
            action: AuditAction.DEAL_CREATE,
            resource: `deals:${newDeal.id}`,
            req
        });

        res.json({
            lead: updatedLead,
            deal: newDeal,
            message: 'Lead converted to deal with contract details'
        });
    } catch (error) {
        console.error('Error converting lead with contract:', error);
        res.status(500).json({ error: 'Failed to convert lead' });
    }
});

export default router;
