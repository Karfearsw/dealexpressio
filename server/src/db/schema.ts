import { pgTable, serial, text, timestamp, integer, boolean, decimal, jsonb } from 'drizzle-orm/pg-core';
import { relations, type InferSelectModel, type InferInsertModel } from 'drizzle-orm';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: text('email').unique().notNull(),
    passwordHash: text('password_hash').notNull(),
    role: text('role').default('employee').notNull(), // admin, employee
    twoFactorSecret: text('two_factor_secret'),
    twoFactorEnabled: boolean('two_factor_enabled').default(false),
    accessCode: text('access_code'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
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
    status: text('status').default('New Lead').notNull(),
    source: text('source'),
    assignedTo: integer('assigned_to').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    leads: many(leads),
    notifications: many(notifications),
    timesheets: many(timesheets),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
    assignedUser: one(users, {
        fields: [leads.assignedTo],
        references: [users.id],
    }),
    properties: many(properties),
    calls: many(calls),
    smsMessages: many(smsMessages),
    voicemails: many(voicemails),
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
