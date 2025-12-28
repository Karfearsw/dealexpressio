import { Router, Request, Response } from 'express';
import { db } from '../db';
import { properties, leads } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get all properties
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
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
        const [property] = await db.select().from(properties).where(eq(properties.id, parseInt(req.params.id)));
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
        const [newProperty] = await db.insert(properties).values({
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
            .where(eq(properties.id, parseInt(req.params.id)))
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

export default router;
