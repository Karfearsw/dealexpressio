import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { db } from '../db';
import { contracts, deals, leads } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { generateContractPDF } from '../services/pdf';
import { logEvent, AuditAction } from '../utils/auditLog';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

const uploadsDir = path.join(process.cwd(), 'uploads', 'contracts');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, DOCX files are allowed'));
        }
    }
});

router.get('/templates', requireAuth, (req: Request, res: Response) => {
    res.json([
        { id: 'letter_of_intent', name: 'Letter of Intent (LOI)', description: 'Non-binding expression of interest', active: true },
        { id: 'purchase_agreement', name: 'Purchase Agreement', description: 'Binding agreement between buyer and seller', active: true },
        { id: 'psa', name: 'Purchase & Sale Agreement', description: 'Standard real estate PSA with contingencies', active: true },
        { id: 'assignment', name: 'Assignment Contract', description: 'Assign your contract rights to end buyer', active: true },
        { id: 'jv_agreement', name: 'JV Agreement', description: 'Joint venture partnership agreement', active: true }
    ]);
});

router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

        const userContracts = await db.select()
            .from(contracts)
            .where(eq(contracts.userId, req.session.userId))
            .orderBy(desc(contracts.createdAt));

        res.json(userContracts.map((c: any) => ({
            ...c,
            createdAt: c.createdAt?.toISOString?.() || c.createdAt,
            updatedAt: c.updatedAt?.toISOString?.() || c.updatedAt,
            signedAt: c.signedAt?.toISOString?.() || c.signedAt,
            expiresAt: c.expiresAt?.toISOString?.() || c.expiresAt,
        })));
    } catch (error) {
        console.error('Error fetching contracts:', error);
        res.status(500).json({ message: 'Error fetching contracts' });
    }
});

router.get('/recent', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

        const recentContracts = await db.select()
            .from(contracts)
            .where(eq(contracts.userId, req.session.userId))
            .orderBy(desc(contracts.createdAt))
            .limit(10);

        res.json(recentContracts);
    } catch (error) {
        console.error('Error fetching recent contracts:', error);
        res.status(500).json({ message: 'Error fetching recent contracts' });
    }
});

router.post('/generate/:type', requireAuth, async (req: Request, res: Response) => {
    const { type } = req.params;
    const { 
        dealId, buyerName, buyerAddress, buyerEmail, buyerPhone,
        purchasePrice, earnestMoney, closingDate, inspectionDays, financingDays,
        assignmentFee, jvSplit, additionalTerms 
    } = req.body;

    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

        let deal = null;
        let lead = null;

        if (dealId) {
            const [dealResult] = await db.select().from(deals).where(
                and(eq(deals.id, parseInt(dealId)), eq(deals.userId, req.session.userId))
            );
            deal = dealResult;

            if (deal?.leadId) {
                const [leadResult] = await db.select().from(leads).where(eq(leads.id, deal.leadId));
                lead = leadResult;
            }
        }

        const contractData = {
            type,
            deal,
            lead,
            buyerName: buyerName || 'TBD',
            buyerAddress: buyerAddress || '',
            buyerEmail: buyerEmail || '',
            buyerPhone: buyerPhone || '',
            purchasePrice: purchasePrice ? parseFloat(purchasePrice) : 0,
            earnestMoney: earnestMoney ? parseFloat(earnestMoney) : 0,
            closingDate: closingDate || '',
            inspectionDays: inspectionDays ? parseInt(inspectionDays) : 10,
            financingDays: financingDays ? parseInt(financingDays) : 21,
            assignmentFee: assignmentFee ? parseFloat(assignmentFee) : 0,
            jvSplit: jvSplit ? parseInt(jvSplit) : 50,
            additionalTerms: additionalTerms || ''
        };

        const pdfBuffer = await generateContractPDF(contractData);

        const contractName = `${getContractTypeName(type)} - ${deal?.address || buyerName || 'Contract'}`;
        await db.insert(contracts).values({
            userId: req.session.userId,
            dealId: dealId ? parseInt(dealId) : null,
            type,
            name: contractName,
            status: 'draft',
            generatedData: contractData
        });

        await logEvent({
            userId: req.session.userId,
            action: AuditAction.CONTRACT_CREATE,
            resource: `contracts:${type}`,
            req
        });

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${contractName.replace(/[^a-z0-9]/gi, '_')}.pdf"`,
            'Content-Length': pdfBuffer.length
        });

        res.end(pdfBuffer);

    } catch (error) {
        console.error('Error generating contract:', error);
        res.status(500).json({ message: 'Error generating contract' });
    }
});

router.post('/generate/assignment', requireAuth, async (req: Request, res: Response) => {
    const { propertyId, assigneeName, assignmentFee } = req.body;

    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

        const [deal] = await db.select().from(deals).where(
            and(eq(deals.id, parseInt(propertyId)), eq(deals.userId, req.session.userId))
        );
        if (!deal) return res.status(404).json({ message: 'Deal not found' });

        let lead = null;
        if (deal.leadId) {
            const [leadResult] = await db.select().from(leads).where(eq(leads.id, deal.leadId));
            lead = leadResult;
        }

        const contractData = {
            type: 'assignment',
            deal,
            lead,
            buyerName: assigneeName || 'TBD',
            purchasePrice: deal.purchasePrice ? parseFloat(deal.purchasePrice) : 0,
            assignmentFee: assignmentFee || 10000
        };

        const pdfBuffer = await generateContractPDF(contractData);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Assignment_${deal.address}.pdf"`,
            'Content-Length': pdfBuffer.length
        });

        res.end(pdfBuffer);

    } catch (error) {
        console.error('Error generating contract:', error);
        res.status(500).json({ message: 'Error generating contract' });
    }
});

router.post('/upload', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const { name, type, dealId } = req.body;

        const [newContract] = await db.insert(contracts).values({
            userId: req.session.userId,
            dealId: dealId ? parseInt(dealId) : null,
            type: type || 'custom',
            name: name || req.file.originalname,
            status: 'draft',
            fileUrl: `/uploads/contracts/${req.file.filename}`
        }).returning();

        await logEvent({
            userId: req.session.userId,
            action: AuditAction.CONTRACT_CREATE,
            resource: `contracts:${newContract.id}`,
            req
        });

        res.json(newContract);
    } catch (error) {
        console.error('Error uploading contract:', error);
        res.status(500).json({ message: 'Error uploading contract' });
    }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

        const [deleted] = await db.delete(contracts)
            .where(and(eq(contracts.id, parseInt(req.params.id)), eq(contracts.userId, req.session.userId)))
            .returning();

        if (!deleted) return res.status(404).json({ message: 'Contract not found' });

        if (deleted.fileUrl) {
            const filePath = path.join(process.cwd(), deleted.fileUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await logEvent({
            userId: req.session.userId,
            action: AuditAction.CONTRACT_DELETE,
            resource: `contracts:${deleted.id}`,
            req
        });

        res.json({ message: 'Contract deleted' });
    } catch (error) {
        console.error('Error deleting contract:', error);
        res.status(500).json({ message: 'Error deleting contract' });
    }
});

function getContractTypeName(type: string): string {
    const types: Record<string, string> = {
        'letter_of_intent': 'Letter of Intent',
        'purchase_agreement': 'Purchase Agreement',
        'psa': 'Purchase & Sale Agreement',
        'assignment': 'Assignment Contract',
        'jv_agreement': 'JV Agreement'
    };
    return types[type] || type;
}

export default router;
