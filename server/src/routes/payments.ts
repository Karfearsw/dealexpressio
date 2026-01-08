import express, { Request, Response } from 'express';
import axios from 'axios';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Poof.io Configuration
const POOF_API_KEY = process.env.POOF_API_KEY;
const POOF_API_URL = 'https://www.poof.io/api/v2';
const CLIENT_BASE_URL = process.env.CLIENT_BASE_URL || 'https://www.dealexpress.io';

if (!POOF_API_KEY) {
  console.warn('⚠️ POOF_API_KEY not set - payment features disabled');
}

// Pricing configuration matching your tiers
const PRICING_TIERS = {
  basic: {
    amount: '50',
    leads: 500,
    seats: 1,
    features: ['Lead Management & Auto-Enrich', 'Deal Calculator & Offer Letters', '1 User Seat']
  },
  pro: {
    amount: '100',
    leads: 1000,
    seats: 3,
    features: ['Advanced Property Analysis', 'Automated Follow-ups', 'Up to 3 User Seats', 'Priority Support']
  },
  enterprise: {
    amount: '1000',
    leads: 15000,
    seats: 999, // unlimited
    features: ['Multi-Seat Access', 'Custom Contract Templates', 'Dedicated Account Manager', 'API Access']
  }
};

// Create Checkout Session for Subscriptions
router.post('/create-checkout', async (req: Request, res: Response) => {
  try {
    if (!POOF_API_KEY) {
      return res.status(503).json({ error: 'Payment system not configured' });
    }
    
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { tier, crypto = 'ethereum' } = req.body;
    
    // Validate tier
    const tierLower = tier?.toLowerCase();
    if (!PRICING_TIERS[tierLower as keyof typeof PRICING_TIERS]) {
      return res.status(400).json({ error: 'Invalid subscription tier' });
    }

    const tierConfig = PRICING_TIERS[tierLower as keyof typeof PRICING_TIERS];

    // Create Poof checkout
    const response = await axios.post(`${POOF_API_URL}/checkout`, {
      amount: tierConfig.amount,
      crypto,
      name: `DealExpress ${tier} Plan`,
      description: `Monthly subscription - ${tierConfig.leads} leads, ${tierConfig.seats} seats`,
      metadata: {
        userId: req.session.userId.toString(),
        subscriptionTier: tierLower,
        leads: tierConfig.leads.toString(),
        seats: tierConfig.seats.toString(),
        type: 'subscription',
        billingCycle: 'monthly'
      },
      redirect_url: `${CLIENT_BASE_URL}/success?tier=${tierLower}`,
      cancel_url: `${CLIENT_BASE_URL}/pricing`
    }, {
      headers: {
        'Authorization': `Bearer ${POOF_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Checkout created for user ${req.session.userId}: ${tierLower} tier ($${tierConfig.amount}/mo)`);

    res.json({ 
      checkoutUrl: response.data.hosted_url,
      checkoutId: response.data.id,
      tier: tierLower,
      amount: tierConfig.amount
    });
  } catch (error: any) {
    console.error('Poof checkout error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to create checkout',
      details: error.response?.data?.message || error.message
    });
  }
});

// Create Payment Link (for one-time payments or invoices)
router.post('/create-payment-link', async (req: Request, res: Response) => {
  try {
    if (!POOF_API_KEY) {
      return res.status(503).json({ error: 'Payment system not configured' });
    }

    const { amount, crypto = 'ethereum', description, tier } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const response = await axios.post(`${POOF_API_URL}/create_invoice`, {
      amount,
      crypto,
      metadata: {
        userId: req.session.userId?.toString(),
        description: description || `DealExpress ${tier || 'Payment'}`,
        tier: tier || 'one-time',
        type: 'one-time'
      }
    }, {
      headers: {
        'Authorization': `Bearer ${POOF_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ 
      paymentLink: response.data.hosted_url,
      invoiceId: response.data.id 
    });
  } catch (error: any) {
    console.error('Poof payment link error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to create payment link',
      details: error.response?.data?.message || error.message
    });
  }
});

// Webhook handler for Poof payment notifications
router.post('/webhook', express.json(), async (req: Request, res: Response) => {
  try {
    const event = req.body;
    
    console.log('📥 Poof webhook received:', event.type || event.status);
    
    // TODO: Add Poof webhook signature verification for security
    // const signature = req.headers['x-poof-signature'];
    // Verify signature here
    
    // Handle successful payment
    if (event.status === 'completed' && event.metadata?.userId) {
      const userId = parseInt(event.metadata.userId);
      const tier = event.metadata.subscriptionTier || 'basic';
      const tierConfig = PRICING_TIERS[tier as keyof typeof PRICING_TIERS];
      
      // Update user subscription in database
      await db.update(users)
        .set({
          subscriptionStatus: 'active',
          subscriptionTier: tier,
          // Add any additional fields like subscriptionEndDate, etc.
        })
        .where(eq(users.id, userId));
      
      console.log(`✅ Subscription activated: User ${userId} -> ${tier} plan (${tierConfig?.leads} leads, ${tierConfig?.seats} seats)`);
    }
    
    // Handle failed payments
    if (event.status === 'failed' && event.metadata?.userId) {
      const userId = parseInt(event.metadata.userId);
      console.error(`❌ Payment failed for user ${userId}`);
      
      // Optionally update user status or send notification
    }
    
    // Handle cancelled payments
    if (event.status === 'cancelled' && event.metadata?.userId) {
      const userId = parseInt(event.metadata.userId);
      console.log(`⚠️ Payment cancelled by user ${userId}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get current subscription status
router.get('/subscription-status', async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, req.session.userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const tier = user.subscriptionTier || 'none';
    const tierConfig = PRICING_TIERS[tier as keyof typeof PRICING_TIERS];

    res.json({
      status: user.subscriptionStatus || 'inactive',
      tier: tier,
      leads: tierConfig?.leads || 0,
      seats: tierConfig?.seats || 1,
      amount: tierConfig?.amount || '0'
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

export default router;
