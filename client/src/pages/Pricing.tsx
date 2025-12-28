import { Link } from 'wouter';
import { Check, Shield, Zap, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import PublicLayout from '@/components/layout/PublicLayout';

const Pricing = () => {
    const tiers = [
        {
            name: "Demo / Trial",
            price: "0.99",
            period: "one-time",
            description: "Perfect for testing the waters and seeing the power of DealExpress.",
            features: [
                "Full System Access (3 Days)",
                "50 Lead Imports",
                "Basic Deal Calculator",
                "1 User Seat"
            ],
            color: "border-slate-700 hover:border-slate-500",
            buttonColor: "bg-slate-800 hover:bg-slate-700 text-white",
        },
        {
            name: "Alpha Solo",
            price: "49.99",
            period: "per month",
            description: "For individual wholesalers ready to scale using our public alpha tools.",
            features: [
                "Public Alpha Features",
                "Unlimited Lead Imports",
                "Advanced Property Analysis",
                "Automated Follow-ups",
                "1 User Seat",
                "Email Support"
            ],
            color: "border-teal-500/50 hover:border-teal-400 bg-teal-500/5",
            buttonColor: "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25",
        },
        {
            name: "Alpha Team",
            price: "99.99",
            period: "per month",
            description: "For growing teams needing multi-seat access and all features.",
            features: [
                "All Features included",
                "Multi-Seat Access (up to 5)",
                "Unlimited Contracts",
                "Priority Support",
                "Custom Contract Templates",
                "Dedicated Account Manager"
            ],
            popular: true,
            color: "border-blue-500/50 hover:border-blue-400 bg-blue-500/5",
            buttonColor: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25",
        },
        {
            name: "Yearly Pro",
            price: "999.99",
            period: "per year",
            description: "Best value for committed investors building a long-term enterprise.",
            features: [
                "Everything in Alpha Team",
                "2 Months Free",
                "10 User Seats",
                "API Access",
                "White-label Reports",
                "Founder's Circle Community"
            ],
            color: "border-indigo-500/50 hover:border-indigo-400 bg-indigo-500/5",
            buttonColor: "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25",
        },
        {
            name: "Lifetime",
            price: "9999.99",
            period: "one-time",
            description: "Own the software. No monthly fees ever again.",
            features: [
                "Everything in Yearly",
                "Lifetime Updates",
                "Unlimited User Seats",
                "White-label Options",
                "Direct Developer Access",
                " VIP Feature Requests"
            ],
            color: "border-purple-500/50 hover:border-purple-400 bg-purple-500/5",
            buttonColor: "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25",
        }
    ];

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
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex items-start">
                                            <Check className="h-5 w-5 text-teal-500 shrink-0 mr-3" />
                                            <span className="text-slate-300 text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link href="/register" className={`w-full py-3 rounded-xl font-bold text-center transition-all hover:scale-[1.02] active:scale-[0.98] ${tier.buttonColor}`}>
                                    Choose {tier.name}
                                </Link>
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
