import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Redirect } from 'wouter'; // Removed useLocation
import { hasAccess, getRequiredTier, getUpgradeOptions } from '../utils/accessControl';
import { UpgradeModal } from './UpgradeModal';
import { Lock } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredFeature?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredFeature
}) => {
    const { user, loading } = useAuth();
    // const [location] = useLocation(); // Removed unused location
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Handle authentication check
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-teal-400">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return <Redirect to="/login" />;
    }

    // Handle feature access check
    if (requiredFeature) {
        // Pass user.email to check for specific bypasses
        const userHasAccess = hasAccess(user.subscriptionTier, requiredFeature, user.email);

        if (!userHasAccess) {
            const requiredTier = getRequiredTier(requiredFeature);
            const upgradeOptions = getUpgradeOptions(user.subscriptionTier);

            return (
                <>
                    {/* Show a placeholder page with locked state */}
                    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                        <div className="text-center max-w-md">
                            <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Lock className="w-10 h-10 text-orange-500" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-100 mb-3">
                                Feature Locked
                            </h1>
                            <p className="text-slate-400 mb-6">
                                This feature requires a {requiredTier?.name} plan or higher.
                            </p>
                            <button
                                onClick={() => setShowUpgradeModal(true)}
                                className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium transition-colors"
                            >
                                View Upgrade Options
                            </button>
                        </div>
                    </div>

                    <UpgradeModal
                        isOpen={showUpgradeModal}
                        onClose={() => setShowUpgradeModal(false)}
                        featureName={requiredFeature.replace('-', ' ')}
                        requiredTier={requiredTier!}
                        upgradeOptions={upgradeOptions}
                        currentTier={user.subscriptionTier || 'Basic'}
                    />
                </>
            );
        }
    }

    return <>{children}</>;
};
