import { Router, type Request, type Response } from 'express';
import { db } from '../db';
import { deals, leads } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get all deals for user
router.get('/', requireAuth, async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).send('Unauthorized');

        const allDeals = await db.select({
            id: deals.id,
            address: deals.address,
            city: deals.city,
            state: deals.state,
            zip: deals.zip,
            purchasePrice: deals.purchasePrice,
            arv: deals.arv,
            repairs: deals.repairs,
            bedrooms: deals.bedrooms,
            bathrooms: deals.bathrooms,
            squareFeet: deals.squareFeet,
            status: deals.status,
            createdAt: deals.createdAt,
            lead: {
                firstName: leads.firstName,
                lastName: leads.lastName,
                email: leads.email,
                phone: leads.phone
            }
        })
            .from(deals)
            .leftJoin(leads, eq(deals.leadId, leads.id))
            .where(eq(deals.userId, req.session.userId))
            .orderBy(desc(deals.createdAt));

        res.json(allDeals.map((d: any) => ({
            ...d,
            purchasePrice: d.purchasePrice ? parseFloat(d.purchasePrice) : null,
            arv: d.arv ? parseFloat(d.arv) : null,
            repairs: d.repairs ? parseFloat(d.repairs) : null,
        })));
    } catch (error) {
        console.error('Error fetching deals:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create new deal
router.post('/', requireAuth, async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).send('Unauthorized');

        const { address, city, state, zip, purchasePrice, arv, repairs, status } = req.body;

        const [newDeal] = await db.insert(deals).values({
            userId: req.session.userId,
            address,
            city,
            state,
            zip,
            purchasePrice: purchasePrice ? purchasePrice.toString() : null,
            arv: arv ? arv.toString() : null,
            repairs: repairs ? repairs.toString() : null,
            status: status || 'analyzing'
        }).returning();

        res.json(newDeal);
    } catch (error) {
        console.error('Error creating deal:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get single deal
router.get('/:id', requireAuth, async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).send('Unauthorized');

        const [deal] = await db.select()
            .from(deals)
            .where(and(eq(deals.id, parseInt(req.params.id)), eq(deals.userId, req.session.userId)));

        if (!deal) return res.status(404).json({ message: 'Deal not found' });

        res.json(deal);
    } catch (error) {
        console.error('Error fetching deal:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Export deals to CSV
router.get('/export', requireAuth, async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).send('Unauthorized');

        const allDeals = await db.select()
            .from(deals)
            .where(eq(deals.userId, req.session.userId))
            .orderBy(desc(deals.createdAt));

        const csvHeader = 'ID,Address,City,State,Zip,Purchase Price,ARV,Repairs,Status,Created At\n';
        const csvRows = allDeals.map((d: any) => {
            return [
                d.id,
                `"${d.address}"`,
                `"${d.city || ''}"`,
                `"${d.state || ''}"`,
                `"${d.zip || ''}"`,
                d.purchasePrice || '',
                d.arv || '',
                d.repairs || '',
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

// Update deal
router.put('/:id', requireAuth, async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).send('Unauthorized');

        const { address, city, state, zip, purchasePrice, arv, repairs, status, bedrooms, bathrooms, squareFeet } = req.body;

        const [updated] = await db.update(deals)
            .set({
                address,
                city,
                state,
                zip,
                purchasePrice: purchasePrice ? purchasePrice.toString() : null,
                arv: arv ? arv.toString() : null,
                repairs: repairs ? repairs.toString() : null,
                status,
                bedrooms,
                bathrooms,
                squareFeet,
                updatedAt: new Date()
            })
            .where(and(eq(deals.id, parseInt(req.params.id)), eq(deals.userId, req.session.userId)))
            .returning();

        if (!updated) return res.status(404).json({ message: 'Deal not found' });

        res.json(updated);
    } catch (error) {
        console.error('Error updating deal:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
