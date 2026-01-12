import { db } from '../db';
import { auditLogs } from '../db/schema';
import { Request } from 'express';

export enum AuditAction {
    LOGIN_SUCCESS = 'auth.login.success',
    LOGIN_FAILURE = 'auth.login.failure',
    LOGOUT = 'auth.logout',
    PASSWORD_CHANGE = 'auth.password_change',
    MFA_VERIFY = 'auth.mfa.verify',
    LEAD_CREATE = 'lead.create',
    LEAD_UPDATE = 'lead.update',
    LEAD_DELETE = 'lead.delete',
    DEAL_CREATE = 'deal.create',
    DEAL_UPDATE = 'deal.update',
    DEAL_DELETE = 'deal.delete',
    CONTRACT_CREATE = 'contract.create',
    CONTRACT_DELETE = 'contract.delete',
    API_RATE_LIMIT = 'security.rate_limit'
}

interface AuditLogOptions {
    userId?: number;
    action: AuditAction | string;
    resource?: string;
    status?: 'success' | 'failure';
    details?: any;
    req?: Request;
}

export const logEvent = async (options: AuditLogOptions) => {
    try {
        const { userId, action, resource, status = 'success', details, req } = options;

        const ipAddress = req?.ip || req?.headers['x-forwarded-for']?.toString();
        const userAgent = req?.headers['user-agent'];

        await db.insert(auditLogs).values({
            userId: userId || null,
            action,
            resource: resource || null,
            status,
            details: details || null,
            ipAddress: ipAddress || null,
            userAgent: userAgent || null,
        });
    } catch (error) {
        console.error('Audit Log Error:', error);
        // We don't throw here to avoid breaking the main flow
    }
};
