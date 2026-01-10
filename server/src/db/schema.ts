import { pgTable, serial, text, timestamp, integer, boolean, decimal, jsonb } from 'drizzle-orm/pg-core';
import { relations, type InferSelectModel, type InferInsertModel } from 'drizzle-orm';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    email: text('email').unique().notNull(),
    passwordHash: text('password_hash').notNull(),
    role: text('role').default('user').notNull(), // admin, user, premium
    twoFactorSecret: text('two_factor_secret'),
    twoFactorEnabled: boolean('two_factor_enabled').default(false),
    accessCode: text('access_code'),
    stripeCustomerId: text('stripe_customer_id').unique(),
    subscriptionStatus: text('subscription_status').default('inactive'),
    subscriptionTier: text('subscription_tier'),
    failedLoginAttempts: integer('failed_login_attempts').default(0),
    lockUntil: timestamp('lock_until'),
    tokenVersion: integer('token_version').default(0).notNull(),
    lastLogin: timestamp('last_login'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const subscriptions = pgTable('subscriptions', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull().unique(),
    planId: text('plan_id').notNull(), // basic, pro, enterprise
    planName: text('plan_name').notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').default('USD').notNull(),
    billingInterval: text('billing_interval').default('monthly').notNull(), // monthly, yearly
    status: text('status').default('ACTIVE').notNull(), // TRIALING, ACTIVE, PAST_DUE, CANCELED, UNPAID
    currentPeriodStart: timestamp('current_period_start').notNull(),
    currentPeriodEnd: timestamp('current_period_end').notNull(),
    nextBillingDate: timestamp('next_billing_date').notNull(),
    lastPaymentId: text('last_payment_id'),
    lastTransactionId: text('last_transaction_id'),
    maxLeads: integer('max_leads').default(500),
    maxProperties: integer('max_properties').default(50),
    maxUsers: integer('max_users').default(1),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
    canceledAt: timestamp('canceled_at'),
    trialEndsAt: timestamp('trial_ends_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const payments = pgTable('payments', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    poofCheckoutId: text('poof_checkout_id').unique().notNull(),
    poofTransactionId: text('poof_transaction_id').unique(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').default('USD').notNull(),
    paymentMethod: text('payment_method'), // bitcoin, credit_card, paypal, etc.
    status: text('status').default('PENDING').notNull(), // PENDING, COMPLETED, FAILED, REFUNDED
    description: text('description'),
    subscriptionId: integer('subscription_id').references(() => subscriptions.id),
    webhookData: jsonb('webhook_data'),
    paidAt: timestamp('paid_at'),
    failedAt: timestamp('failed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const betaSignups = pgTable('beta_signups', {
    id: serial('id').primaryKey(),
    email: text('email').unique().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const leads = pgTable('leads', {
    id: serial('id').primaryKey(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email'),
    phone: text('phone'),
    status: text('status').default('new').notNull(), // new, contacted, qualified, contract_signed, converted
    source: text('source'),
    assignedTo: integer('assigned_to').references(() => users.id),
    contractSignedAt: timestamp('contract_signed_at'),
    convertedToDealId: integer('converted_to_deal_id'), // To be referenced after deals defined or use lazy
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const deals = pgTable('deals', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id),
    leadId: integer('lead_id').references(() => leads.id),
    address: text('address').notNull(),
    city: text('city'),
    state: text('state'),
    zip: text('zip'),

    // Financial data
    purchasePrice: decimal('purchase_price', { precision: 12, scale: 2 }),
    arv: decimal('arv', { precision: 12, scale: 2 }),
    repairs: decimal('repairs', { precision: 12, scale: 2 }),
    assignmentFee: decimal('assignment_fee', { precision: 12, scale: 2 }),
    projectedProfit: decimal('projected_profit', { precision: 12, scale: 2 }),

    // Property details
    bedrooms: integer('bedrooms'),
    bathrooms: integer('bathrooms'),
    squareFeet: integer('square_feet'),

    // Deal status
    status: text('status').default('analyzing'), // analyzing, negotiation, under_contract, closed, dead

    closedAt: timestamp('closed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Add foreign key constraint for leads.convertedToDealId separately or use string reference if lazy evaluation matches
// in Drizzle cyclic ref can be tricky.
// Better to use relations for valid ORM usage, but for schema definition:
// Drizzle supports lazy refs: references(() => deals.id)
// But defined order matters for variables.
// I will keep leads definition as is above but I need to handle the cyclic ref if I use `leads` before `deals`.
// `convertedToDealId` tries to ref `deals.id`.
// I will resolve this by defining `deals` first? No `deals` refs `leads`.
// Drizzle recommends: `convertedToDealId: integer('converted_to_deal_id').references(() => deals.id)` works if `deals` is defined later? 
// No, const `deals` must exist.
// Typescript hoisting doesn't work for const.
// I can remove the `.references` from one side in the DDL definition in TS and rely on DB foreign key or `relations`.
// Or let's see current content.

export const properties = pgTable('properties', {
    id: serial('id').primaryKey(),
    leadId: integer('lead_id').references(() => leads.id).notNull(),
    address: text('address').notNull(),
    city: text('city'),
    state: text('state'),
    zip: text('zip'),
    arv: decimal('arv', { precision: 12, scale: 2 }),
    mao: decimal('mao', { precision: 12, scale: 2 }),
    repairCost: decimal('repair_cost', { precision: 12, scale: 2 }),
    assignmentFee: decimal('assignment_fee', { precision: 12, scale: 2 }),
    projectedSpread: decimal('projected_spread', { precision: 12, scale: 2 }),
    status: text('status'),
    photos: jsonb('photos').default([]),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const buyers = pgTable('buyers', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone'),
    criteria: text('criteria'),
    dealsClosed: integer('deals_closed').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const calls = pgTable('calls', {
    id: serial('id').primaryKey(),
    leadId: integer('lead_id').references(() => leads.id),
    userId: integer('user_id').references(() => users.id),
    direction: text('direction').notNull(), // inbound, outbound
    duration: integer('duration'), // seconds
    recordingUrl: text('recording_url'),
    status: text('status'),
    sid: text('sid'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const smsMessages = pgTable('sms_messages', {
    id: serial('id').primaryKey(),
    leadId: integer('lead_id').references(() => leads.id),
    userId: integer('user_id').references(() => users.id),
    message: text('message').notNull(),
    direction: text('direction').notNull(), // inbound, outbound
    status: text('status'),
    sid: text('sid'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const voicemails = pgTable('voicemails', {
    id: serial('id').primaryKey(),
    leadId: integer('lead_id').references(() => leads.id),
    recordingUrl: text('recording_url').notNull(),
    transcript: text('transcript'),
    handled: boolean('handled').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    type: text('type').notNull(),
    message: text('message').notNull(),
    read: boolean('read').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sessions = pgTable('session', {
    sid: text('sid').primaryKey(),
    sess: jsonb('sess').notNull(),
    expire: timestamp('expire', { precision: 6 }).notNull(),
});

export const timesheets = pgTable('timesheets', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    clockIn: timestamp('clock_in').defaultNow().notNull(),
    clockOut: timestamp('clock_out'),
    duration: integer('duration'), // seconds (calculated on clock out)
    status: text('status').default('active'), // active, completed
});

export const contactSubmissions = pgTable('contact_submissions', {
    id: serial('id').primaryKey(),
    email: text('email').notNull(),
    message: text('message').notNull(),
    status: text('status').default('new'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const refreshTokens = pgTable('refresh_tokens', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    token: text('token').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    revoked: boolean('revoked').default(false).notNull(),
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),
    lastUsedAt: timestamp('last_used_at').defaultNow(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    action: text('action').notNull(), // e.g., 'auth.login', 'lead.delete'
    resource: text('resource'), // e.g., 'leads', 'deals:123'
    status: text('status').default('success'), // success, failure
    details: jsonb('details'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
    leads: many(leads),
    notifications: many(notifications),
    timesheets: many(timesheets),
    subscription: one(subscriptions, {
        fields: [users.id],
        references: [subscriptions.userId],
    }),
    payments: many(payments),
    refreshTokens: many(refreshTokens),
    auditLogs: many(auditLogs),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
    user: one(users, {
        fields: [subscriptions.userId],
        references: [users.id],
    }),
    payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
    user: one(users, {
        fields: [payments.userId],
        references: [users.id],
    }),
    subscription: one(subscriptions, {
        fields: [payments.subscriptionId],
        references: [subscriptions.id],
    }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
    user: one(users, {
        fields: [refreshTokens.userId],
        references: [users.id],
    }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
    user: one(users, {
        fields: [auditLogs.userId],
        references: [users.id],
    }),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
    assignedUser: one(users, {
        fields: [leads.assignedTo],
        references: [users.id],
    }),
    convertedDeal: one(deals, {
        fields: [leads.convertedToDealId],
        references: [deals.id],
    }),
    properties: many(properties),
    calls: many(calls),
    smsMessages: many(smsMessages),
    voicemails: many(voicemails),
}));

export const dealsRelations = relations(deals, ({ one }) => ({
    user: one(users, {
        fields: [deals.userId],
        references: [users.id],
    }),
    lead: one(leads, {
        fields: [deals.leadId],
        references: [leads.id],
    }),
}));

export const timesheetsRelations = relations(timesheets, ({ one }) => ({
    user: one(users, {
        fields: [timesheets.userId],
        references: [users.id],
    }),
}));

export type Lead = InferSelectModel<typeof leads>;
export type NewLead = InferInsertModel<typeof leads>;
export type Property = InferSelectModel<typeof properties>;
export type NewProperty = InferInsertModel<typeof properties>;
export type User = InferSelectModel<typeof users>;
export type RefreshToken = InferSelectModel<typeof refreshTokens>;
export type AuditLog = InferSelectModel<typeof auditLogs>;
