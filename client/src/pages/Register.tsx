import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation, Link } from 'wouter';
import { Lock, Mail, User } from 'lucide-react';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const [, setLocation] = useLocation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRe.test(email.trim())) {
                throw { response: { data: { message: 'Please enter a valid email address' } } };
            }
            const hasLetter = /[A-Za-z]/.test(password);
            const hasNumber = /\d/.test(password);
            if (password.length < 8 || !hasLetter || !hasNumber) {
                throw { response: { data: { message: 'Password must be at least 8 characters and include letters and numbers' } } };
            }
            await register(email, password, firstName, lastName, accessCode);
            if (accessCode) {
                setLocation('/dashboard');
            } else {
                setLocation('/pricing');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 px-8 pb-8 pt-0 rounded-2xl w-full max-w-md shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent mb-2">
                        Create Account
                    </h1>
                    <p className="text-slate-400">Join the ExpressDeal Team</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-slate-500"><User size={18} /></span>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
                                    placeholder="John"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-slate-500"><User size={18} /></span>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-slate-500"><Mail size={18} /></span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-slate-500"><Lock size={18} /></span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>



                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Team Access Code (Optional)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-slate-500"><Lock size={18} /></span>
                            <input
                                type="text"
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
                                placeholder="Enter code if joining a team"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div className="text-center mt-6">
                        <p className="text-slate-500 text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
