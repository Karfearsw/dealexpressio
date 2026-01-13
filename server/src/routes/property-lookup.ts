import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const { address } = req.body;
        
        if (!address) {
            return res.status(400).json({ error: 'Address is required' });
        }

        res.json({
            bedrooms: null,
            bathrooms: null,
            squareFeet: null,
            yearBuilt: null,
            propertyImageUrl: null,
            message: 'Property lookup is available with a data provider API key'
        });
    } catch (error) {
        console.error('Property lookup error:', error);
        res.status(500).json({ error: 'Property lookup failed' });
    }
});

export default router;
