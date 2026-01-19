export type SubscriptionTier = 'basic' | 'pro' | 'enterprise';

export interface TierConfig {
    id: SubscriptionTier;
    name: string;
    price: string; // Monthly price
    priceId: string; // Stripe Price ID
    leadsIncluded: number;
    seats: number;
    features: string[];
    capabilities: {
        canImportLeads: boolean;
        canExportLeads: boolean;
        canManageTeam: boolean;
        canAccessAPI: boolean;
        canUseDialer: boolean;
        canUseAI: boolean;
    };
}

export const PRICING_TIERS: Record<SubscriptionTier, TierConfig> = {
    basic: {
        id: 'basic',
        name: 'Basic',
        price: '150',
        priceId: process.env.STRIPE_PRICE_BASIC || '',
        leadsIncluded: 400,
        seats: 1,
        features: [
            "400 Leads (FSBO & County Records)",
            "Lead Management & Auto-Enrich",
            "Deal Calculator & Offer Letters",
            "Advanced Property Analysis",
            "Automated Follow-ups",
            "Multi-Seat Team Access",
            "Priority Support"
        ],
        capabilities: {
            canImportLeads: true,
            canExportLeads: true,
            canManageTeam: true,
            canAccessAPI: false,
            canUseDialer: true,
            canUseAI: true
        }
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        price: '250',
        priceId: process.env.STRIPE_PRICE_PRO || '',
        leadsIncluded: 700,
        seats: 5,
        features: [
            "700 Leads (FSBO & County Records)",
            "Lead Management & Auto-Enrich",
            "Deal Calculator & Offer Letters",
            "Advanced Property Analysis",
            "Automated Follow-ups",
            "Multi-Seat Team Access",
            "Priority Support"
        ],
        capabilities: {
            canImportLeads: true,
            canExportLeads: true,
            canManageTeam: true,
            canAccessAPI: false,
            canUseDialer: true,
            canUseAI: true
        }
    },
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        price: '500',
        priceId: process.env.STRIPE_PRICE_ENTERPRISE || '',
        leadsIncluded: 1200,
        seats: 999,
        features: [
            "1,200 Leads (FSBO & County Records)",
            "20 Prequalified Inbound Leads with Recordings",
            "Lead Management & Auto-Enrich",
            "Deal Calculator & Offer Letters",
            "Advanced Property Analysis",
            "Automated Follow-ups",
            "Multi-Seat Team Access",
            "Priority Support"
        ],
        capabilities: {
            canImportLeads: true,
            canExportLeads: true,
            canManageTeam: true,
            canAccessAPI: true,
            canUseDialer: true,
            canUseAI: true
        }
    }
};

export const getTierConfig = (tier: string | null | undefined): TierConfig => {
    // Default to basic if no tier or invalid tier
    const tierKey = (tier?.toLowerCase() as SubscriptionTier) || 'basic';
    return PRICING_TIERS[tierKey] || PRICING_TIERS.basic;
};
