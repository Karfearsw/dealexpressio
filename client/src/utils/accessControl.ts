// Subscription Tier Definitions
export type SubscriptionTier = 'basic' | 'pro' | 'enterprise';

export interface TierConfig {
    name: string;
    level: number;
    features: string[];
    price: number;
}

// Tier hierarchy with access levels
export const TIER_HIERARCHY: Record<SubscriptionTier, TierConfig> = {
    basic: {
        name: 'Basic',
        level: 1,
        price: 50,
        features: [
            'dashboard',
            'leads',
            'deals',
            'deal-calculator',
            'settings'
        ]
    },
    pro: {
        name: 'Pro',
        level: 2,
        price: 100,
        features: [
            'dashboard',
            'leads',
            'deals',
            'communication',
            'analytics',
            'buyers-list',
            'deal-calculator',
            'settings'
        ]
    },
    enterprise: {
        name: 'Enterprise',
        level: 3,
        price: 0, // Custom pricing
        features: [
            'dashboard',
            'leads',
            'deals',
            'communication',
            'contracts',
            'analytics',
            'buyers-list',
            'deal-calculator',
            'settings',
            'api-access',
            'white-label'
        ]
    }
};

// Feature to tier mapping (which tier is required for each feature)
// Updated to match user requirements exactly
export const FEATURE_REQUIREMENTS: Record<string, SubscriptionTier> = {
    'dashboard': 'basic',
    'leads': 'basic',
    'deals': 'basic',
    'deal-calculator': 'basic',
    'settings': 'basic',

    'communication': 'pro',
    'analytics': 'pro',
    'buyers-list': 'pro',

    'contracts': 'enterprise',
    'api-access': 'enterprise',
    'white-label': 'enterprise'
};

// Check if user has access to a feature
export function hasAccess(
    userTier: string | undefined,
    requiredFeature: string,
    userEmail?: string
): boolean {
    // CRITICAL: Bypass for specific test user
    if (userEmail === 'enterprise_test@example.com') {
        return true;
    }

    // Handle undefined or invalid tiers
    if (!userTier) return false;

    // Normalize tier to lowercase to handle database inconsistencies
    const normalizedTier = userTier.toLowerCase() as SubscriptionTier;

    // If the normalized tier isn't in our hierarchy, default to basic if it's 'premium', or fail
    // Some legacy data might have 'premium' -> treat as 'pro' or 'enterprise'? 
    // For now, let's strictly check against keys.
    if (!(normalizedTier in TIER_HIERARCHY)) {
        // Fallback: if it contains "enterprise", treat as enterprise
        if (normalizedTier.includes('enterprise')) return true;
        if (normalizedTier.includes('pro') || normalizedTier.includes('premium')) {
            // Check if this is enough for the requirement
            const requiredTier = FEATURE_REQUIREMENTS[requiredFeature];
            if (!requiredTier) return true;
            return TIER_HIERARCHY['pro'].level >= TIER_HIERARCHY[requiredTier].level;
        }
        return false;
    }

    const requiredTier = FEATURE_REQUIREMENTS[requiredFeature];

    // If feature doesn't require specific tier, allow access
    if (!requiredTier) return true;

    // Compare tier levels
    return TIER_HIERARCHY[normalizedTier].level >= TIER_HIERARCHY[requiredTier].level;
}

// Get required tier for a feature
export function getRequiredTier(feature: string): TierConfig | null {
    const tierName = FEATURE_REQUIREMENTS[feature];
    return tierName ? TIER_HIERARCHY[tierName] : null;
}

// Get upgrade options for user
export function getUpgradeOptions(
    currentTier: string | undefined
): TierConfig[] {
    const normalizedTier = (currentTier?.toLowerCase() || 'basic') as SubscriptionTier;

    // Safety check
    const currentLevel = TIER_HIERARCHY[normalizedTier]?.level || 1;

    return Object.values(TIER_HIERARCHY)
        .filter(tier => tier.level > currentLevel)
        .sort((a, b) => a.level - b.level);
}
