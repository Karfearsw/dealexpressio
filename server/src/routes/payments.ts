import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  console.warn('Stripe disabled: STRIPE_SECRET_KEY not set');
}
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2024-06-20' }) : null;

router.post('/create-checkout-session', async (req: Request, res: Response) => {
  try {
    if (!stripe) return res.status(503).json({ error: 'Stripe not configured' });
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });

    const { priceId } = req.body;
    if (!priceId) return res.status(400).json({ error: 'Missing priceId' });

    const successUrl = (process.env.CLIENT_BASE_URL || 'http://localhost:5173') + '/success';
    const cancelUrl = (process.env.CLIENT_BASE_URL || 'http://localhost:5173') + '/pricing';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId: String(req.session.userId) },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret || !sig) {
    return res.status(503).send('Webhook not configured');
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed', err);
    return res.status(400).send(`Webhook Error`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId ? parseInt(session.metadata.userId) : null;
        const subscriptionId = session.subscription as string | null;

        if (userId) {
          await db.update(users)
            .set({
              subscriptionStatus: 'active',
              subscriptionTier: null,
              stripeCustomerId: session.customer ? String(session.customer) : null,
            })
            .where(eq(users.id, userId));
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        await db.update(users)
          .set({ subscriptionStatus: 'inactive' })
          .where(eq(users.stripeCustomerId!, customerId));
        break;
      }
      default:
        break;
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handling error', err);
    res.status(500).send('Webhook handling failed');
  }
});

export default router;
