import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const { address, city, state, zip } = req.body;
        
        if (!address) {
            return res.status(400).json({ error: 'Address is required' });
        }

        const fullAddress = [address, city, state, zip].filter(Boolean).join(', ');
        
        const seed = fullAddress.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const houseNumber = (seed % 1000) + 1;
        const placeholderImageUrl = `https://picsum.photos/seed/${houseNumber}/800/600`;
        
        const searchQuery = encodeURIComponent(`${fullAddress} property details bedrooms bathrooms sqft`);
        const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
        
        const zillowSearchUrl = `https://www.zillow.com/homes/${encodeURIComponent(fullAddress)}_rb/`;
        const realtorSearchUrl = `https://www.realtor.com/realestateandhomes-search/${encodeURIComponent(address.replace(/\s+/g, '-'))}_${encodeURIComponent(city || '')}_${encodeURIComponent(state || '')}`;
        
        res.json({
            bedrooms: null,
            bathrooms: null,
            squareFeet: null,
            yearBuilt: null,
            propertyImageUrl: placeholderImageUrl,
            googleSearchUrl,
            quickLinks: [
                { name: 'Google Search', url: googleSearchUrl },
                { name: 'Zillow', url: zillowSearchUrl },
                { name: 'Realtor.com', url: realtorSearchUrl }
            ],
            instructions: 'Click a link below to find property details, then enter them manually.',
            source: 'manual',
            message: 'Use the quick links to look up property details from public sources.'
        });
    } catch (error) {
        console.error('Property lookup error:', error);
        res.status(500).json({ error: 'Property lookup failed' });
    }
});

export default router;
