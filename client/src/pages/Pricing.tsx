import { Link, useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, Shield, Zap, Database, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import PublicLayout from '@/components/layout/PublicLayout';
import { useAuth } from '@/context/AuthContext';

const Pricing = () => {
    const { user } = useAuth();
    const [, setLocation] = useLocation();
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const [tiers, setTiers] = useState<any[]>([
        {
            name: "Basic",
            price: "50",
            period: "per month",
            description: "For starters who need a solid foundation.",
            features: [
                "Includes 500 leads",
                "Lead Management & Auto-Enrich",
                "Deal Calculator & Offer Letters",
                "1 User Seat"
            ],
            priceId: 'price_1Q...Basic',
            color: "border-teal-500/50 hover:border-teal-400 bg-teal-500/5",
            buttonColor: "bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/25",
        },
        {
            name: "Pro",
            price: "100",
            period: "per month",
            description: "For growing operations ready to scale.",
            features: [
                "Includes 1,000 leads",
                "Advanced Property Analysis",
                "Automated Follow-ups",
                "Up to 3 User Seats",
                "Priority Support"
            ],
            popular: true,
            priceId: 'price_1Q...Pro',
            color: "border-blue-500/50 hover:border-blue-400 bg-blue-500/5",
            buttonColor: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25",
        },
        {
            name: "Enterprise",
            price: "1000",
            period: "per month",
            description: "For teams demanding performance at scale.",
            features: [
                "Includes 15,000 leads",
                "Multi-Seat Access",
                "Custom Contract Templates",
                "Dedicated Account Manager",
                "API Access"
            ],
            priceId: 'price_1Q...Enterprise',
            color: "border-indigo-500/50 hover:border-indigo-400 bg-indigo-500/5",
            buttonColor: "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25",
        }
    ]);

    useEffect(() => {
        const loadPricing = async () => {
            try {
                const res = await axios.get('/marketing/pricing-tiers');
                const apiTiers = res.data.map((t: any) => ({
                    name: t.name,
                    price: String(t.price),
                    period: t.period,
                    priceId: t.priceId,
                    description:
                        t.name === 'Basic'
                            ? 'For starters who need a solid foundation.'
                            : t.name === 'Pro'
                                ? 'For growing operations ready to scale.'
                                : 'For teams demanding performance at scale.',
                    features:
                        t.name === 'Basic'
                            ? ["Includes 500 leads", "Lead Management & Auto-Enrich", "Deal Calculator & Offer Letters", "1 User Seat"]
                            : t.name === 'Pro'
                                ? ["Includes 1,000 leads", "Advanced Property Analysis", "Automated Follow-ups", "Up to 3 User Seats", "Priority Support"]
                                : ["Includes 15,000 leads", "Multi-Seat Access", "Custom Contract Templates", "Dedicated Account Manager", "API Access"],
                    color:
                        t.name === 'Basic'
                            ? "border-teal-500/50 hover:border-teal-400 bg-teal-500/5"
                            : t.name === 'Pro'
                                ? "border-blue-500/50 hover:border-blue-400 bg-blue-500/5"
                            : "border-indigo-500/50 hover:border-indigo-400 bg-indigo-500/5",
                    buttonColor:
                        t.name === 'Basic'
                            ? "bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/25"
                            : t.name === 'Pro'
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                            : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25",
                    popular: t.name === 'Pro'
                }));
                setTiers(apiTiers);
            } catch {
                // Keep default tiers
            }
        };
        loadPricing();
    }, []);

    const handleSubscribe = async (tier: any) => {
        if (!user) {
            setLocation('/register');
            return;
        }

        setIsLoading(tier.name);

        try {
            const { data } = await axios.post('/api/payments/create-checkout', {
                tier: tier.name.toLowerCase(),
                crypto: 'ethereum'
            });
            window.location.href = data.checkoutUrl;
        } catch (error) {
            console.error('Subscription error:', error);
            alert("Failed to start checkout. Please try again.");
            setIsLoading(null);
        }
    };

    return (
        <PublicLayout>
            <div className="pt-40 pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold tracking-tight text-white"
                        >
                            Simple, Transparent Pricing
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-400 max-w-2xl mx-auto"
                        >
                            Choose the plan that fits your business stage. No hidden fees.
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {tiers.map((tier, index) => (
                            <motion.div
                                key={tier.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 + 0.2 }}
                                className={`relative p-8 rounded-2xl border ${tier.color} bg-slate-900/40 backdrop-blur-sm flex flex-col`}
                            >
                                {tier.popular && (
                                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4">
                                        <span className="bg-teal-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-slate-100 mb-2">{tier.name}</h3>
                                    <div className="flex items-baseline space-x-1">
                                        <span className="text-4xl font-extrabold text-white">${tier.price}</span>
                                        <span className="text-slate-500 text-sm">/{tier.period}</span>
                                    </div>
                                    <p className="mt-4 text-slate-400 text-sm leading-relaxed min-h-[60px]">
                                        {tier.description}
                                    </p>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {tier.features.map((feature: string) => (
                                        <li key={feature} className="flex items-start">
                                            <Check className="h-5 w-5 text-teal-500 shrink-0 mr-3" />
                                            <span className="text-slate-300 text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleSubscribe(tier)}
                                    disabled={isLoading === tier.name}
                                    className={`w-full py-3 rounded-xl font-bold text-center transition-all hover:scale-[1.02] active:scale-[0.98] ${tier.buttonColor} disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isLoading === tier.name ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Processing...
                                        </span>
                                    ) : (
                                        `Choose ${tier.name}`
                                    )}
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    {/* FAQ / Guarantee Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="mt-24 grid md:grid-cols-3 gap-8 text-center"
                    >
                        <div className="p-6 bg-slate-900/30 rounded-2xl border border-slate-800">
                            <Shield className="h-10 w-10 text-teal-500 mx-auto mb-4" />
                            <h4 className="font-bold text-white mb-2">Secure Payments</h4>
                            <p className="text-slate-400 text-sm">Encrypted transactions handled by industry leaders.</p>
                        </div>
                        <div className="p-6 bg-slate-900/30 rounded-2xl border border-slate-800">
                            <Zap className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
                            <h4 className="font-bold text-white mb-2">Instant Access</h4>
                            <p className="text-slate-400 text-sm">Get started immediately after sign up. No waiting.</p>
                        </div>
                        <div className="p-6 bg-slate-900/30 rounded-2xl border border-slate-800">
                            <Database className="h-10 w-10 text-blue-500 mx-auto mb-4" />
                            <h4 className="font-bold text-white mb-2">Data Ownership</h4>
                            <p className="text-slate-400 text-sm">Your leads are yours. Export them anytime.</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default Pricing;
