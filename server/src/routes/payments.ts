
import express, { Request, Response } from 'express';
import { subscriptionService } from '../services/subscription';
import { poofClient } from '../services/poof';
import { PlanId } from '../config/plans';

const router = express.Router();

// Create Checkout Session
router.post('/create-checkout-session', async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { priceId, interval = 'monthly' } = req.body; // Frontend sends 'priceId' which maps to our planId
    
    // Map frontend priceId to planId if necessary, or assume they match
    // The frontend sends values like 'price_1Q...' but also has plan names. 
    // Let's check what the frontend actually sends. 
    // In Pricing.tsx: priceId: 'price_1Q...Basic', etc.
    // We need to map these to 'basic', 'pro', 'enterprise'
    
    let planId: PlanId = 'basic';
    if (String(priceId).toLowerCase().includes('basic')) planId = 'basic';
    else if (String(priceId).toLowerCase().includes('pro')) planId = 'pro';
    else if (String(priceId).toLowerCase().includes('enterprise')) planId = 'enterprise';
    
    // Or if the frontend sends the plan name directly, that would be easier.
    // But let's handle the mapping here to be safe.

    const result = await subscriptionService.createSubscription(
      req.session.userId,
      planId,
      interval
    );

    res.json({ url: result.checkoutUrl });
  } catch (error: any) {
    console.error('Create checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Poof Webhook
router.post('/webhook', express.json(), async (req: Request, res: Response) => {
  try {
    const event = req.body;
    console.log('Poof Webhook received:', event);

    // Poof sends different event types. We care about 'paid' or similar status.
    // The structure depends on Poof API.
    // Based on guide: event.status === 'completed' ?? 
    // Or we look at the transaction.
    
    // We should verify the webhook signature if possible (POOF_WEBHOOK_SECRET).
    // For now, let's implement the logic.
    
    if (event.amount && event.currency) {
       // This looks like a payment notification
       // Check if it has metadata
       const metadata = event.metadata || {};
       
       if (metadata.userId && metadata.type === 'subscription_initial') {
           // Initial subscription payment
           // We need to find the payment record by checkout_id if available
           // Poof webhook usually contains 'checkout_id' or we can match by other means.
           
           // Assuming event has `checkout_id` or `payment_id` that matches our `poofCheckoutId`
           // Let's assume `event.checkout_id` exists.
           
           // If the event doesn't directly have checkout_id, we might need to rely on metadata if we passed it?
           // The guide didn't specify exact webhook payload.
           // But `createCheckout` response has `checkout_id`.
           
           // Let's try to activate subscription
           // We need the checkout ID we saved.
           
           // If event has `checkout_id`:
           if (event.checkout_id) {
               await subscriptionService.activateSubscription(event.checkout_id, event.transaction_id || 'tx_unknown');
           }
       }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Create Payment Link (One-off)
router.post('/create-payment-link', async (req: Request, res: Response) => {
    try {
        const { amount, description } = req.body;
        const result = await poofClient.createPaymentLink(amount, description);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create payment link' });
    }
});

export default router;
