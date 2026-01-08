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
        price: '50',
        priceId: 'price_1Q...Basic',
        leadsIncluded: 500,
        seats: 1,
        features: [
            "Includes 500 leads",
            "Lead Management & Auto-Enrich",
            "Deal Calculator & Offer Letters",
            "1 User Seat"
        ],
        capabilities: {
            canImportLeads: true,
            canExportLeads: false,
            canManageTeam: false,
            canAccessAPI: false,
            canUseDialer: false,
            canUseAI: false
        }
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        price: '100',
        priceId: 'price_1Q...Pro',
        leadsIncluded: 1000,
        seats: 3,
        features: [
            "Includes 1,000 leads",
            "Advanced Property Analysis",
            "Automated Follow-ups",
            "Up to 3 User Seats",
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
        price: '1000',
        priceId: 'price_1Q...Enterprise',
        leadsIncluded: 15000,
        seats: 999,
        features: [
            "Includes 15,000 leads",
            "Multi-Seat Access",
            "Custom Contract Templates",
            "Dedicated Account Manager",
            "API Access"
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
