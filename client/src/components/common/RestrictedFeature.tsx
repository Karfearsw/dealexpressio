import React, { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock } from 'lucide-react';
import { Link } from 'wouter';

type SubscriptionTier = 'basic' | 'pro' | 'enterprise';

interface RestrictedFeatureProps {
    minTier: SubscriptionTier;
    children: ReactNode;
    fallback?: ReactNode;
    showLock?: boolean;
}

const TIER_LEVELS: Record<SubscriptionTier, number> = {
    'basic': 1,
    'pro': 2,
    'enterprise': 3
};

const RestrictedFeature: React.FC<RestrictedFeatureProps> = ({ minTier, children, fallback, showLock = false }) => {
    const { user } = useAuth();
    
    // Default to basic if undefined
    const userTier = (user?.subscriptionTier || 'basic') as SubscriptionTier;
    
    const hasAccess = (TIER_LEVELS[userTier] || 1) >= TIER_LEVELS[minTier];

    if (hasAccess) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    if (showLock) {
        return (
            <div className="relative group cursor-not-allowed opacity-75">
                <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center rounded-lg z-10">
                    <div className="text-center p-4">
                        <div className="bg-slate-900 p-3 rounded-full inline-block mb-2 shadow-lg border border-slate-800">
                            <Lock className="h-6 w-6 text-teal-500" />
                        </div>
                        <h3 className="text-white font-bold text-sm mb-1">{minTier.charAt(0).toUpperCase() + minTier.slice(1)} Feature</h3>
                        <Link href="/pricing" className="text-xs text-teal-400 hover:text-teal-300 hover:underline">
                            Upgrade to Access
                        </Link>
                    </div>
                </div>
                <div className="pointer-events-none filter blur-[2px] select-none">
                    {children}
                </div>
            </div>
        );
    }

    return null;
};

export default RestrictedFeature;
