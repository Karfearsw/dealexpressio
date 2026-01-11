import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation, Link } from 'wouter';
import logo from '@/assets/logo-white.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const [, setLocation] = useLocation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(email.trim())) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            await login({ email, password });
            setLocation('/dashboard');
        } catch (err: any) {
            console.error("Login Error:", err);
            const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(msg);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl px-8 pb-8 pt-0 shadow-2xl">
                <div className="mb-8 text-center">
                    <img src={logo} alt="DealExpress" className="h-80 mx-auto mb-6" />
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-100 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-400 mb-1">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-100 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02]"
                    >
                        Sign In
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-slate-500 text-sm">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
