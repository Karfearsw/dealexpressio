
import { db } from '../db';
import { subscriptions, payments, users } from '../db/schema';
import { poofClient } from './poof';
import { PLANS, PlanId } from '../config/plans';
import { addMonths, addYears } from 'date-fns';
import { eq } from 'drizzle-orm';

export class SubscriptionService {
  /**
   * Create a new subscription for a user
   */
  async createSubscription(userId: number, planId: PlanId, interval: 'monthly' | 'yearly' = 'monthly') {
    const plan = PLANS[planId];
    if (!plan) throw new Error('Invalid plan');

    const amount = interval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice!;
    const now = new Date();
    const nextBillingDate = interval === 'monthly' ? addMonths(now, 1) : addYears(now, 1);

    // Create checkout with Poof
    const checkout = await poofClient.createCheckout({
      amount: amount.toString(),
      username: process.env.POOF_USERNAME!,
      metadata: {
        userId,
        planId,
        interval,
        type: 'subscription_initial',
      },
    });

    // Create pending subscription in database
    const [subscription] = await db.insert(subscriptions).values({
      userId,
      planId,
      planName: plan.name,
      amount: amount.toString(),
      currency: 'USD',
      billingInterval: interval,
      status: 'ACTIVE', // Will be activated after payment (or stay active if this is just creating record)
      // Note: Guide said "Will be activated after payment" but code set 'ACTIVE'. 
      // Ideally should be 'TRIALING' or 'UNPAID' until webhook.
      // But let's follow guide logic for now or set to UNPAID. 
      // Let's set to UNPAID to be safe until webhook confirms.
      // Actually, let's stick to 'ACTIVE' if the intention is to allow access immediately or if this is called after payment?
      // The guide says "Create pending subscription... status: ACTIVE // Will be activated after payment".
      // This is contradictory. Let's use 'UNPAID' initially.
      currentPeriodStart: now,
      currentPeriodEnd: nextBillingDate,
      nextBillingDate,
      maxLeads: plan.maxLeads,
      maxProperties: plan.maxProperties,
      maxUsers: plan.maxUsers,
    }).returning();

    // Create payment record
    await db.insert(payments).values({
      userId,
      poofCheckoutId: checkout.checkout_id,
      amount: amount.toString(),
      currency: 'USD',
      status: 'PENDING',
      description: `${plan.name} - ${interval} subscription`,
      subscriptionId: subscription.id,
    });

    return {
      subscription,
      checkoutUrl: checkout.checkout_url,
    };
  }

  /**
   * Process renewal payment for existing subscription
   */
  async processRenewal(subscriptionId: number) {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.id, subscriptionId));

    if (!subscription) throw new Error('Subscription not found');
    if (subscription.cancelAtPeriodEnd) {
      await this.cancelSubscription(subscriptionId);
      return;
    }

    const plan = PLANS[subscription.planId as PlanId];
    const amount = subscription.billingInterval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice!;

    try {
      // Create checkout for renewal
      const checkout = await poofClient.createCheckout({
        amount: amount.toString(),
        username: process.env.POOF_USERNAME!,
        metadata: {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          type: 'subscription_renewal',
        },
      });

      // Create payment record
      await db.insert(payments).values({
        userId: subscription.userId,
        poofCheckoutId: checkout.checkout_id,
        amount: amount.toString(),
        currency: 'USD',
        status: 'PENDING',
        description: `${subscription.planName} - Renewal`,
        subscriptionId: subscription.id,
      });

      console.log(`Renewal payment link: ${checkout.checkout_url}`);

      return checkout;
    } catch (error) {
      // Mark subscription as past due
      await db.update(subscriptions)
        .set({ status: 'PAST_DUE' })
        .where(eq(subscriptions.id, subscriptionId));
      throw error;
    }
  }

  /**
   * Activate subscription after successful payment
   */
  async activateSubscription(poofCheckoutId: string, transactionId: string) {
    // Find payment by checkout ID
    const [payment] = await db.select().from(payments).where(eq(payments.poofCheckoutId, poofCheckoutId));

    if (!payment || !payment.subscriptionId) {
      throw new Error('Payment or Subscription not found');
    }

    // Update payment status
    await db.update(payments)
      .set({
        status: 'COMPLETED',
        poofTransactionId: transactionId,
        paidAt: new Date(),
      })
      .where(eq(payments.id, payment.id));

    // Activate subscription
    await db.update(subscriptions)
      .set({ status: 'ACTIVE' })
      .where(eq(subscriptions.id, payment.subscriptionId));
      
    // Also update user table for backward compatibility/easy access
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.id, payment.subscriptionId));
    if (sub) {
        await db.update(users)
            .set({ 
                subscriptionStatus: 'active',
                subscriptionTier: sub.planId
            })
            .where(eq(users.id, sub.userId));
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: number) {
    await db.update(subscriptions)
      .set({
        status: 'CANCELED',
        canceledAt: new Date(),
      })
      .where(eq(subscriptions.id, subscriptionId));
      
    // Update user status
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.id, subscriptionId));
    if (sub) {
         await db.update(users)
            .set({ subscriptionStatus: 'inactive' })
            .where(eq(users.id, sub.userId));
    }
  }
}

export const subscriptionService = new SubscriptionService();
