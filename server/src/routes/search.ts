import { Router, Request, Response } from 'express';
import { db } from '../db';
import { leads, deals, buyers } from '../db/schema';
import { sql, ilike, or } from 'drizzle-orm';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const query = (req.query.q as string || '').trim().toLowerCase();
        
        if (!query) {
            return res.json([]);
        }

        const searchPattern = `%${query}%`;
        const results: any[] = [];

        const leadResults = await db.select()
            .from(leads)
            .where(
                or(
                    ilike(leads.firstName, searchPattern),
                    ilike(leads.lastName, searchPattern),
                    ilike(leads.email, searchPattern),
                    ilike(leads.phone, searchPattern),
                    ilike(leads.address, searchPattern),
                    ilike(leads.city, searchPattern)
                )
            )
            .limit(10);

        for (const lead of leadResults) {
            results.push({
                id: lead.id,
                type: 'lead',
                title: `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || lead.email || 'Unnamed Lead',
                subtitle: lead.address ? `${lead.address}, ${lead.city || ''}` : lead.phone || lead.email || ''
            });
        }

        const dealResults = await db.select()
            .from(deals)
            .where(
                or(
                    ilike(deals.address, searchPattern),
                    ilike(deals.city, searchPattern),
                    ilike(deals.state, searchPattern),
                    ilike(deals.zip, searchPattern)
                )
            )
            .limit(10);

        for (const deal of dealResults) {
            results.push({
                id: deal.id,
                type: 'deal',
                title: deal.address || 'Unnamed Deal',
                subtitle: `${deal.city || ''}, ${deal.state || ''} ${deal.zip || ''}`.trim()
            });
        }

        const buyerResults = await db.select()
            .from(buyers)
            .where(
                or(
                    ilike(buyers.name, searchPattern),
                    ilike(buyers.email, searchPattern),
                    ilike(buyers.phone, searchPattern),
                    ilike(buyers.criteria, searchPattern)
                )
            )
            .limit(10);

        for (const buyer of buyerResults) {
            results.push({
                id: buyer.id,
                type: 'buyer',
                title: buyer.name || 'Unnamed Buyer',
                subtitle: buyer.email || buyer.phone || buyer.criteria || ''
            });
        }

        res.json(results.slice(0, 20));
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

export default router;
