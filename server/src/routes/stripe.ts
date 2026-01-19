import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import { users, teams, teamMembers, teamCodes, pendingRegistrations } from '../db/schema';
import { eq, and, or, gt, isNull } from 'drizzle-orm';
import { hashPassword } from '../utils/auth';
import { PRICING_TIERS, SubscriptionTier } from '../config/tiers';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-06-20'
});

const STRIPE_PRICES: Record<SubscriptionTier, string> = {
    basic: process.env.STRIPE_PRICE_BASIC || '',
    pro: process.env.STRIPE_PRICE_PRO || '',
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE || ''
};

router.post('/create-checkout', async (req: Request, res: Response) => {
    try {
        const { email, firstName, lastName, password, tier, accessCode, discountCode } = req.body;

        if (!email || !firstName || !lastName || !password || !tier) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const [existingUser] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
        if (existingUser) {
            return res.status(409).json({ message: 'An account with this email already exists' });
        }

        const tierKey = tier.toLowerCase() as SubscriptionTier;
        const priceId = STRIPE_PRICES[tierKey];
        
        if (!priceId) {
            return res.status(400).json({ message: 'Invalid subscription tier. Please configure Stripe Price IDs.' });
        }

        let teamCodeId: number | null = null;
        let teamName: string | null = null;
        let teamId: number | null = null;
        
        if (accessCode) {
            const [teamCode] = await db.select({
                id: teamCodes.id,
                teamId: teamCodes.teamId,
                maxUses: teamCodes.maxUses,
                usedCount: teamCodes.usedCount,
                expiresAt: teamCodes.expiresAt,
                isActive: teamCodes.isActive
            })
            .from(teamCodes)
            .where(and(
                eq(teamCodes.code, accessCode),
                eq(teamCodes.isActive, true)
            ));
            
            if (teamCode) {
                const now = new Date();
                const isExpired = teamCode.expiresAt && new Date(teamCode.expiresAt) < now;
                const isMaxedOut = teamCode.maxUses && teamCode.usedCount >= teamCode.maxUses;
                
                if (!isExpired && !isMaxedOut) {
                    teamCodeId = teamCode.id;
                    teamId = teamCode.teamId;
                    
                    const [team] = await db.select({ name: teams.name }).from(teams).where(eq(teams.id, teamCode.teamId));
                    teamName = team?.name || null;
                }
            }
        }

        const passwordHash = await hashPassword(password);

        await db.insert(pendingRegistrations).values({
            email: email.toLowerCase(),
            firstName,
            lastName,
            passwordHash,
            tier: tierKey,
            discountCode: discountCode || null,
            teamCodeId,
            teamName,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }).onConflictDoUpdate({
            target: pendingRegistrations.email,
            set: {
                firstName,
                lastName,
                passwordHash,
                tier: tierKey,
                discountCode: discountCode || null,
                teamCodeId,
                teamName,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
        });

        const baseUrl = process.env.REPLIT_DEV_DOMAIN 
            ? 'https://' + process.env.REPLIT_DEV_DOMAIN 
            : 'http://localhost:5000';

        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            mode: 'subscription',
            payment_method_types: ['card'],
            customer_email: email.toLowerCase(),
            line_items: [
                {
                    price: priceId,
                    quantity: 1
                }
            ],
            metadata: {
                email: email.toLowerCase(),
                firstName,
                lastName,
                tier: tierKey,
                teamCodeId: teamCodeId?.toString() || '',
                teamId: teamId?.toString() || '',
                teamName: teamName || ''
            },
            success_url: `${baseUrl}/register-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/register`,
            allow_promotion_codes: true
        };

        if (discountCode) {
            try {
                const promotionCodes = await stripe.promotionCodes.list({
                    code: discountCode,
                    active: true,
                    limit: 1
                });
                
                if (promotionCodes.data.length > 0) {
                    sessionParams.discounts = [{ promotion_code: promotionCodes.data[0].id }];
                    delete sessionParams.allow_promotion_codes;
                }
            } catch (e) {
                console.log('Discount code not found in Stripe, allowing manual entry:', discountCode);
            }
        }

        const session = await stripe.checkout.sessions.create(sessionParams);

        await db.update(pendingRegistrations)
            .set({ stripeSessionId: session.id })
            .where(eq(pendingRegistrations.email, email.toLowerCase()));

        res.json({ checkoutUrl: session.url });
    } catch (error: any) {
        console.error('Create checkout error:', error);
        res.status(500).json({ message: 'Failed to create checkout session' });
    }
});

router.post('/webhook', async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
        if (webhookSecret && sig) {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } else {
            event = req.body as Stripe.Event;
        }
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.payment_status === 'paid' && session.metadata) {
            await handleSuccessfulPayment(session);
        }
    }

    res.json({ received: true });
});

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
    const { email, firstName, lastName, tier, teamCodeId, teamId, teamName } = session.metadata || {};
    
    if (!email) {
        console.error('No email in session metadata');
        return;
    }

    try {
        const [existingUser] = await db.select().from(users).where(eq(users.email, email));
        if (existingUser) {
            console.log('User already exists:', email);
            return;
        }

        const [pending] = await db.select().from(pendingRegistrations).where(eq(pendingRegistrations.email, email));
        if (!pending) {
            console.error('No pending registration found for:', email);
            return;
        }

        const [newUser] = await db.insert(users).values({
            email: email,
            passwordHash: pending.passwordHash,
            firstName: pending.firstName,
            lastName: pending.lastName,
            role: 'user',
            subscriptionStatus: 'active',
            subscriptionTier: tier as SubscriptionTier || 'basic',
            stripeCustomerId: session.customer as string || null,
            stripeSubscriptionId: session.subscription as string || null,
            twoFactorEnabled: false,
            tokenVersion: 0
        }).returning();

        if (teamId && parseInt(teamId)) {
            await db.insert(teamMembers).values({
                userId: newUser.id,
                teamId: parseInt(teamId),
                role: 'member'
            });

            if (teamCodeId && parseInt(teamCodeId)) {
                const [code] = await db.select().from(teamCodes).where(eq(teamCodes.id, parseInt(teamCodeId)));
                if (code) {
                    await db.update(teamCodes)
                        .set({ usedCount: code.usedCount + 1 })
                        .where(eq(teamCodes.id, parseInt(teamCodeId)));
                }
            }
        }

        await db.delete(pendingRegistrations).where(eq(pendingRegistrations.email, email));

        const { sendSignupWelcomeEmail } = await import('../services/email');
        await sendSignupWelcomeEmail(
            email,
            pending.firstName,
            email,
            teamName || null
        );

        console.log('User created successfully:', email);
    } catch (error) {
        console.error('Error handling successful payment:', error);
    }
}

router.get('/verify-session/:sessionId', async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status === 'paid' && session.metadata) {
            await handleSuccessfulPayment(session);
            
            const { email } = session.metadata;
            const [user] = await db.select().from(users).where(eq(users.email, email));
            
            if (user) {
                res.json({ 
                    success: true, 
                    email: user.email,
                    tier: user.subscriptionTier
                });
            } else {
                res.json({ success: false, message: 'User not found yet, processing...' });
            }
        } else {
            res.json({ success: false, message: 'Payment not completed' });
        }
    } catch (error) {
        console.error('Verify session error:', error);
        res.status(500).json({ success: false, message: 'Failed to verify session' });
    }
});

export default router;
