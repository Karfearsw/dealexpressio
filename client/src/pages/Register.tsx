import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Lock, Mail, User, CreditCard, Tag, Eye, EyeOff } from 'lucide-react';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [discountCode, setDiscountCode] = useState('');
    const [subscriptionTier, setSubscriptionTier] = useState('basic');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [, setLocation] = useLocation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRe.test(email.trim())) {
                throw new Error('Please enter a valid email address');
            }
            const hasLetter = /[A-Za-z]/.test(password);
            const hasNumber = /\d/.test(password);
            if (password.length < 8 || !hasLetter || !hasNumber) {
                throw new Error('Password must be at least 8 characters and include letters and numbers');
            }

            const response = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    password,
                    tier: subscriptionTier,
                    accessCode: accessCode.trim() || undefined,
                    discountCode: discountCode.trim() || undefined
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create checkout session');
            }

            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to register');
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
                    <p className="text-slate-400">Join the Deal Express Team</p>
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
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-12 text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
                                placeholder="Min 8 chars, letters and numbers"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subscription Tier</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-slate-500"><CreditCard size={18} /></span>
                            <select
                                value={subscriptionTier}
                                onChange={(e) => setSubscriptionTier(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-teal-500 transition-colors appearance-none cursor-pointer"
                            >
                                <option value="basic">Basic - $150/month (400 leads)</option>
                                <option value="pro">Pro - $250/month (700 leads)</option>
                                <option value="enterprise">Enterprise - $500/month (1200+ leads)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Team Access Code (Optional)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-slate-500"><User size={18} /></span>
                            <input
                                type="text"
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
                                placeholder="Enter team code to join"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Have a team code? Enter it to join an existing team.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Discount Code (Optional)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-slate-500"><Tag size={18} /></span>
                            <input
                                type="text"
                                value={discountCode}
                                onChange={(e) => setDiscountCode(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
                                placeholder="Enter promo code"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-teal-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {loading ? 'Processing...' : 'Continue to Payment'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-slate-400 text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="text-teal-400 hover:text-teal-300 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>

                <div className="mt-4 text-center">
                    <Link href="/pricing" className="text-slate-500 hover:text-slate-400 text-sm transition-colors">
                        View pricing details
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
