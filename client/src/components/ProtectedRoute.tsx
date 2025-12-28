import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, Redirect } from 'wouter';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    const [location] = useLocation();

    if (loading) {
        console.log('ProtectedRoute: Loading...');
        return <div>Loading...</div>; // Or a nice spinner
    }

    if (!user) {
        console.log('ProtectedRoute: No user, redirecting to login');
        return <Redirect to="/login" />;
    }

    console.log('ProtectedRoute: Access granted');
    return <>{children}</>;
};
