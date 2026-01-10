import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Redirect, useLocation, Link } from 'wouter';
import { Lock } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireCommunicationAccess?: boolean;
    // Keeping this optional prop to avoid breaking other calls immediately if I miss one, 
    // but I will ignore it in logic as per requirements.
    requiredFeature?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireCommunicationAccess = false
}) => {
    const { user, loading } = useAuth();
    const [location] = useLocation();

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

    // Communication page check
    if (requireCommunicationAccess) {
        const allowedEmails = [
            'business@kevnbenestate.org',
            'sk@dealexpress.io',
            'enterprise_test@example.com' // For testing
        ];

        if (!user.email || !allowedEmails.includes(user.email)) {
            return (
                <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-10 h-10 text-orange-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-100 mb-3">
                            Access Restricted
                        </h1>
                        <p className="text-slate-400 mb-6">
                            The Communication feature is currently in beta testing.
                            Contact support for access.
                        </p>
                        <Link href="/dashboard" className="text-teal-400 hover:underline">
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            );
        }
    }

    // Tier checks were requested to be removed.
    // We simply return children now for authenticated users.

    return <>{children}</>;
};
