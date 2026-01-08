import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '/api'; // Use Vite proxy in dev, env var in prod
axios.defaults.withCredentials = true;

interface User {
    id: number;
    email: string;
    role: string;
    twoFactorEnabled: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: any) => Promise<void>;
    register: (email: string, password: string, firstName: string, lastName: string, accessCode?: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    requires2FA: boolean;
    verify2FA: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [requires2FA, setRequires2FA] = useState(false);

    const checkAuth = async () => {
        console.log('AuthContext: checkAuth starting...');
        try {
            const res = await axios.get('/auth/me');
            console.log('AuthContext: checkAuth success', res.data);
            setUser(res.data.user);
        } catch (error) {
            console.log('AuthContext: checkAuth failed/unauthorized');
            setUser(null);
        } finally {
            console.log('AuthContext: checkAuth finished, setting loading false');
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (data: any) => {
        const res = await axios.post('/auth/login', data);
        if (res.data.requires2FA) {
            setRequires2FA(true);
        } else {
            setUser(res.data.user);
        }
    };

    const verify2FA = async (token: string) => {
        await axios.post('/auth/2fa/verify', { token });
        setRequires2FA(false);
        checkAuth();
    };

    const register = async (email: string, password: string, firstName: string, lastName: string, accessCode?: string) => {
        const res = await axios.post('/auth/register', { email, password, firstName, lastName, accessCode });
        setUser(res.data.user);
    };

    const logout = async () => {
        await axios.post('/auth/logout');
        setUser(null);
        setRequires2FA(false);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth, requires2FA, verify2FA }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
