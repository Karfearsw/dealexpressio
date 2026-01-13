import { Router, type Request, type Response } from 'express';
import { db } from '../db';
import { deals, leads } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';
import { logEvent, AuditAction } from '../utils/auditLog';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

const uploadsDir = path.join(process.cwd(), 'uploads', 'deals');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'deal-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed'));
    }
});

const normalizeDecimal = (val: any): number | null => {
    if (val === null || val === undefined) return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
};

// Get all deals for user
router.get('/', requireAuth, async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).send('Unauthorized');

        const allDeals = await db.select()
            .from(deals)
            .where(eq(deals.userId, req.session.userId))
            .orderBy(desc(deals.createdAt));

        res.json(allDeals.map((d: any) => ({
            ...d,
            purchasePrice: normalizeDecimal(d.purchasePrice),
            arv: normalizeDecimal(d.arv),
            repairs: normalizeDecimal(d.repairs),
            assignmentFee: normalizeDecimal(d.assignmentFee),
            projectedProfit: normalizeDecimal(d.projectedProfit),
            contractPrice: normalizeDecimal(d.contractPrice),
            marketedPrice: normalizeDecimal(d.marketedPrice),
        })));
    } catch (error) {
        console.error('Error fetching deals:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Export deals to CSV - MUST be before /:id
router.get('/export', requireAuth, async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).send('Unauthorized');

        const allDeals = await db.select()
            .from(deals)
            .where(eq(deals.userId, req.session.userId))
            .orderBy(desc(deals.createdAt));

        const csvHeader = 'ID,Address,City,State,Zip,Purchase Price,ARV,Repairs,Assignment Fee,Status,Created At\n';
        const csvRows = allDeals.map((d: any) => {
            return [
                d.id,
                `"${d.address || ''}"`,
                `"${d.city || ''}"`,
                `"${d.state || ''}"`,
                `"${d.zip || ''}"`,
                d.purchasePrice || '',
                d.arv || '',
                d.repairs || '',
                d.assignmentFee || '',
                `"${d.status || ''}"`,
                d.createdAt
            ].join(',');
        }).join('\n');

        res.header('Content-Type', 'text/csv');
        res.attachment('deals-export.csv');
        res.send(csvHeader + csvRows);
    } catch (error) {
        console.error('Error exporting deals:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create new deal
router.post('/', requireAuth, async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).send('Unauthorized');

        const { 
            leadId, address, city, state, zip,
            bedrooms, bathrooms, squareFeet,
            purchasePrice, arv, repairs, assignmentFee,
            notes, status 
        } = req.body;

        const [newDeal] = await db.insert(deals).values({
            userId: req.session.userId,
            leadId: leadId || null,
            address,
            city,
            state,
            zip,
            purchasePrice: purchasePrice ? purchasePrice.toString() : null,
            arv: arv ? arv.toString() : null,
            repairs: repairs ? repairs.toString() : null,
            assignmentFee: assignmentFee ? assignmentFee.toString() : null,
            bedrooms: bedrooms || null,
            bathrooms: bathrooms || null,
            squareFeet: squareFeet || null,
            status: status || 'Analyzing'
        }).returning();

        await logEvent({
            userId: req.session.userId,
            action: AuditAction.DEAL_CREATE,
            resource: `deals:${newDeal.id}`,
            req
        });

        res.json({
            ...newDeal,
            purchasePrice: normalizeDecimal(newDeal.purchasePrice),
            arv: normalizeDecimal(newDeal.arv),
            repairs: normalizeDecimal(newDeal.repairs),
            assignmentFee: normalizeDecimal(newDeal.assignmentFee),
        });
    } catch (error) {
        console.error('Error creating deal:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get single deal - MUST be after /export
router.get('/:id', requireAuth, async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).send('Unauthorized');

        const dealId = parseInt(req.params.id);
        if (isNaN(dealId)) return res.status(400).json({ message: 'Invalid deal ID' });

        const [deal] = await db.select()
            .from(deals)
            .where(and(eq(deals.id, dealId), eq(deals.userId, req.session.userId)));

        if (!deal) return res.status(404).json({ message: 'Deal not found' });

        res.json({
            ...deal,
            purchasePrice: normalizeDecimal(deal.purchasePrice),
            arv: normalizeDecimal(deal.arv),
            repairs: normalizeDecimal(deal.repairs),
            assignmentFee: normalizeDecimal(deal.assignmentFee),
        });
    } catch (error) {
        console.error('Error fetching deal:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update deal (PUT - full update)
router.put('/:id', requireAuth, async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).send('Unauthorized');

        const dealId = parseInt(req.params.id);
        if (isNaN(dealId)) return res.status(400).json({ message: 'Invalid deal ID' });

        const { address, city, state, zip, purchasePrice, arv, repairs, assignmentFee, status, bedrooms, bathrooms, squareFeet, notes } = req.body;

        const [updated] = await db.update(deals)
            .set({
                address,
                city,
                state,
                zip,
                purchasePrice: purchasePrice ? purchasePrice.toString() : null,
                arv: arv ? arv.toString() : null,
                repairs: repairs ? repairs.toString() : null,
                assignmentFee: assignmentFee ? assignmentFee.toString() : null,
                status,
                bedrooms,
                bathrooms,
                squareFeet,
                updatedAt: new Date()
            })
            .where(and(eq(deals.id, dealId), eq(deals.userId, req.session.userId)))
            .returning();

        if (!updated) return res.status(404).json({ message: 'Deal not found' });

        await logEvent({
            userId: req.session.userId,
            action: AuditAction.DEAL_UPDATE,
            resource: `deals:${updated.id}`,
            req
        });

        res.json({
            ...updated,
            purchasePrice: normalizeDecimal(updated.purchasePrice),
            arv: normalizeDecimal(updated.arv),
            repairs: normalizeDecimal(updated.repairs),
            assignmentFee: normalizeDecimal(updated.assignmentFee),
        });
    } catch (error) {
        console.error('Error updating deal:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Upload deal property image
router.post('/:id/image', requireAuth, upload.single('image'), async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).send('Unauthorized');
        
        const dealId = parseInt(req.params.id);
        if (isNaN(dealId)) return res.status(400).json({ message: 'Invalid deal ID' });
        
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }
        
        const imageUrl = `/uploads/deals/${req.file.filename}`;
        
        const [updated] = await db.update(deals)
            .set({ propertyImageUrl: imageUrl, updatedAt: new Date() })
            .where(and(eq(deals.id, dealId), eq(deals.userId, req.session.userId)))
            .returning();
        
        if (!updated) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'Deal not found' });
        }
        
        res.json({ 
            propertyImageUrl: imageUrl,
            message: 'Image uploaded successfully' 
        });
    } catch (error) {
        console.error('Error uploading deal image:', error);
        res.status(500).json({ message: 'Failed to upload image' });
    }
});

// PATCH update deal (partial update)
router.patch('/:id', requireAuth, async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).send('Unauthorized');

        const dealId = parseInt(req.params.id);
        if (isNaN(dealId)) return res.status(400).json({ message: 'Invalid deal ID' });

        const updateData: any = { updatedAt: new Date() };
        const allowedFields = ['address', 'city', 'state', 'zip', 'purchasePrice', 'arv', 'repairs', 
            'assignmentFee', 'status', 'bedrooms', 'bathrooms', 'squareFeet', 'notes', 'buyerId',
            'contractPrice', 'marketedPrice', 'expiryDate', 'yearBuilt', 'propertyImageUrl'];
        
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                if (['purchasePrice', 'arv', 'repairs', 'assignmentFee', 'contractPrice', 'marketedPrice'].includes(field)) {
                    updateData[field] = req.body[field] ? req.body[field].toString() : null;
                } else if (field === 'expiryDate') {
                    updateData[field] = req.body[field] ? new Date(req.body[field]) : null;
                } else {
                    updateData[field] = req.body[field];
                }
            }
        }

        const [updated] = await db.update(deals)
            .set(updateData)
            .where(and(eq(deals.id, dealId), eq(deals.userId, req.session.userId)))
            .returning();

        if (!updated) return res.status(404).json({ message: 'Deal not found' });

        await logEvent({
            userId: req.session.userId,
            action: AuditAction.DEAL_UPDATE,
            resource: `deals:${updated.id}`,
            req
        });

        res.json({
            ...updated,
            purchasePrice: normalizeDecimal(updated.purchasePrice),
            arv: normalizeDecimal(updated.arv),
            repairs: normalizeDecimal(updated.repairs),
            assignmentFee: normalizeDecimal(updated.assignmentFee),
            contractPrice: normalizeDecimal(updated.contractPrice),
            marketedPrice: normalizeDecimal(updated.marketedPrice),
        });
    } catch (error) {
        console.error('Error updating deal:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete deal
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).send('Unauthorized');

        const dealId = parseInt(req.params.id);
        if (isNaN(dealId)) return res.status(400).json({ message: 'Invalid deal ID' });

        const [deleted] = await db.delete(deals)
            .where(and(eq(deals.id, dealId), eq(deals.userId, req.session.userId)))
            .returning();

        if (!deleted) return res.status(404).json({ message: 'Deal not found' });

        await logEvent({
            userId: req.session.userId,
            action: AuditAction.DEAL_DELETE,
            resource: `deals:${deleted.id}`,
            req
        });

        res.json({ message: 'Deal deleted' });
    } catch (error) {
        console.error('Error deleting deal:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
