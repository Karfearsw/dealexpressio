import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { db } from '../db';
import { properties, leads } from '../db/schema';
import { eq } from 'drizzle-orm';
import { generateAssignmentContract } from '../services/pdf';

const router = Router();

router.post('/generate/assignment', requireAuth, async (req: Request, res: Response) => {
    const { propertyId, assigneeName, assignmentFee } = req.body;

    try {
        const [property] = await db.select().from(properties).where(eq(properties.id, propertyId));
        if (!property) return res.status(404).json({ message: 'Property not found' });

        const [lead] = await db.select().from(leads).where(eq(leads.id, property.leadId));
        if (!lead) return res.status(404).json({ message: 'Lead not found' });

        const pdfBuffer = await generateAssignmentContract({
            property,
            lead,
            assigneeName: assigneeName || 'Placeholder Buyer',
            assignmentFee: assignmentFee || 10000
        });

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Assignment_${property.address}.pdf"`,
            'Content-Length': pdfBuffer.length
        });

        res.end(pdfBuffer);

    } catch (error) {
        console.error('Error generating contract:', error);
        res.status(500).json({ message: 'Error generating contract' });
    }
});

export default router;
