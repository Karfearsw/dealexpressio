import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, Redirect } from 'wouter';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    const [location] = useLocation();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">Loading...</div>;
    }

    if (!user) {
        return <Redirect to="/login" />;
    }

    return <>{children}</>;
};

// Helper: Check if user tier meets requirement
export const checkTierAccess = (userTier: string = 'basic', requiredTier: string = 'basic'): boolean => {
    const levels: Record<string, number> = { 'basic': 1, 'pro': 2, 'enterprise': 3 };
    const userLevel = levels[userTier] || 1;
    const requiredLevel = levels[requiredTier] || 1;
    return userLevel >= requiredLevel;
};

// Component: Enforce Tier Access
export const RequireTier: React.FC<{ tier: 'basic' | 'pro' | 'enterprise'; children: React.ReactNode }> = ({ tier, children }) => {
    const { user, loading } = useAuth();

    if (loading) return null; // Parent ProtectedRoute usually handles loading

    // Double check user exists (should be wrapped in ProtectedRoute)
    if (!user) return <Redirect to="/login" />;

    if (!checkTierAccess(user.subscriptionTier, tier)) {
        // Redirect to pricing with a subtle query param or just simple redirect
        return <Redirect to="/pricing" />;
    }

    return <>{children}</>;
};
