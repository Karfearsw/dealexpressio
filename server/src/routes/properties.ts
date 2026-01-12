import { Router, Request, Response } from 'express';
import { db } from '../db';
import { properties, leads, type Property } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth, requireSubscription } from '../middleware/auth';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import os from 'os';
import path from 'path';

const router = Router();
const upload = multer({ dest: path.join(os.tmpdir(), 'uploads/') });

// Import properties from CSV (Pro feature)
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

                const validProperties = results
                    .filter(row => row.leadId && row.address)
                    .map(row => ({
                        userId,
                        leadId: parseInt(row.leadId),
                        address: row.address,
                        city: row.city || null,
                        state: row.state || null,
                        zip: row.zip || null,
                        arv: row.arv || null,
                        mao: row.mao || null,
                        repairCost: row.repairCost || null,
                        assignmentFee: row.assignmentFee || null,
                        projectedSpread: row.projectedSpread || null,
                        status: row.status || 'Analyzing',
                        notes: row.notes || null
                    }));

                if (validProperties.length === 0) {
                    return res.status(400).json({ message: 'No valid properties found (leadId and address required)' });
                }

                await db.insert(properties).values(validProperties);
                res.json({ message: `Successfully imported ${validProperties.length} properties` });
            } catch (error) {
                console.error('Error importing properties:', error);
                res.status(500).json({ message: 'Error processing CSV file' });
            }
        });
});

// Export properties to CSV (Pro feature)
router.get('/export', requireAuth, requireSubscription('pro'), async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });
        
        const allProperties = await db.select().from(properties)
            .where(eq(properties.userId, req.session.userId))
            .orderBy(desc(properties.createdAt));

        const csvHeader = 'ID,Lead ID,Address,City,State,Zip,ARV,MAO,Status,Notes\n';
        const csvRows = allProperties.map((p: Property) => {
            return [
                p.id,
                p.leadId,
                `"${p.address}"`,
                `"${p.city || ''}"`,
                `"${p.state || ''}"`,
                `"${p.zip || ''}"`,
                p.arv || '',
                p.mao || '',
                `"${p.status || ''}"`,
                `"${p.notes || ''}"`
            ].join(',');
        }).join('\n');

        res.header('Content-Type', 'text/csv');
        res.attachment('properties-export.csv');
        res.send(csvHeader + csvRows);
    } catch (error) {
        console.error('Error exporting properties:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all properties for the current user
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });
        
        const allProperties = await db.select({
            property: properties,
            lead: {
                firstName: leads.firstName,
                lastName: leads.lastName,
                email: leads.email
            }
        })
            .from(properties)
            .leftJoin(leads, eq(properties.leadId, leads.id))
            .where(eq(properties.userId, req.session.userId))
            .orderBy(desc(properties.createdAt));

        res.json(allProperties);
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get single property
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });
        
        const [property] = await db.select().from(properties)
            .where(and(eq(properties.id, parseInt(req.params.id)), eq(properties.userId, req.session.userId)));
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        res.json(property);
    } catch (error) {
        console.error('Error fetching property:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create property
router.post('/', requireAuth, async (req: Request, res: Response) => {
    const { leadId, address, city, state, zip, arv, mao, repairCost, assignmentFee, projectedSpread, status, notes } = req.body;

    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });
        
        const [newProperty] = await db.insert(properties).values({
            userId: req.session.userId,
            leadId,
            address,
            city,
            state,
            zip,
            arv: arv ? arv.toString() : null,
            mao: mao ? mao.toString() : null,
            repairCost: repairCost ? repairCost.toString() : null,
            assignmentFee: assignmentFee ? assignmentFee.toString() : null,
            projectedSpread: projectedSpread ? projectedSpread.toString() : null,
            status: status || 'Analyzing',
            notes,
        }).returning();

        res.status(201).json(newProperty);
    } catch (error) {
        console.error('Error creating property:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update property
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
    const { address, city, state, zip, arv, mao, repairCost, assignmentFee, projectedSpread, status, notes } = req.body;

    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });
        
        const [updatedProperty] = await db.update(properties)
            .set({
                address,
                city,
                state,
                zip,
                arv: arv ? arv.toString() : null,
                mao: mao ? mao.toString() : null,
                repairCost: repairCost ? repairCost.toString() : null,
                assignmentFee: assignmentFee ? assignmentFee.toString() : null,
                projectedSpread: projectedSpread ? projectedSpread.toString() : null,
                status,
                notes,
            })
            .where(and(eq(properties.id, parseInt(req.params.id)), eq(properties.userId, req.session.userId)))
            .returning();

        if (!updatedProperty) {
            return res.status(404).json({ message: 'Property not found' });
        }

        res.json(updatedProperty);
    } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete property
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });
        
        const [deleted] = await db.delete(properties)
            .where(and(eq(properties.id, parseInt(req.params.id)), eq(properties.userId, req.session.userId)))
            .returning();

        if (!deleted) {
            return res.status(404).json({ message: 'Property not found' });
        }

        res.json({ message: 'Property deleted' });
    } catch (error) {
        console.error('Error deleting property:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
