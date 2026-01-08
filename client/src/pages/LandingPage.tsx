import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Users, Search, Calculator, Database, CheckCircle2 } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
const LandingPage = () => {
    const { scrollY } = useScroll();

    // Hero Parallax
    const heroY = useTransform(scrollY, [0, 500], [0, 200]);
    const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
    const dashboardY = useTransform(scrollY, [0, 500], [0, -100]);

    // formatCurrency removed as it was unused

    const features = [
        {
            title: "Lead Management",
            description: "Imported leads DONE FOR YOU or instantly auto-enrich your own data so you have the full picture immediately.",
            icon: Users,
            color: "text-teal-400"
        },
        {
            title: "Property Analysis",
            description: "Real-time CMA research and property analysis tools to help you make informed decisions.",
            icon: Search,
            color: "text-blue-400"
        },
        {
            title: "Deal Calculator",
            description: "Run the numbers in seconds. Our deal calculator helps you determine your max offer amount and generate professional offer letters with one click.",
            icon: Calculator,
            color: "text-indigo-400"
        },
        {
            title: "Financial Tools",
            description: "Powerful financial calculators to evaluate MAO, ARV, and projected spreads instantly.",
            icon: Calculator,
            color: "text-indigo-400"
        },
        {
            title: "Buyers List",
            description: "Maintain a curated list of qualified buyers ready for your next big assignment.",
            icon: Database,
            color: "text-teal-500"
        }
    ];

    const workflowSteps = [
        {
            id: 1,
            title: "Find & Capture",
            description: "Import leads instantly or capture them via webforms. Deal Express auto-enriches property data so you have the full picture immediately.",
            icon: Search,
            color: "bg-blue-500"
        },
        {
            id: 2,
            title: "Analyze & Offer",
            description: "Run the numbers in seconds. Our deal calculator helps you determine your MAO and generate professional offer letters with one click.",
            icon: Calculator,
            color: "bg-teal-500"
        },
        {
            id: 3,
            title: "Assign & Close",
            description: "Match deals with buyers from your list. Generate assignment contracts and track the closing process until the wire hits.",
            icon: CheckCircle2,
            color: "bg-indigo-500"
        }
    ];

    return (
        <PublicLayout>
            <div className="overflow-x-hidden">
                {/* Hero Section */}
                <section className="pt-40 pb-20 px-4 relative min-h-screen flex flex-col justify-center">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-teal-500/10 blur-[120px] rounded-full -z-10"></div>

                    <motion.div
                        style={{ y: heroY, opacity: heroOpacity }}
                        className="max-w-7xl mx-auto text-center space-y-8 z-10"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                            </span>
                            <span>Now in Beta</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className="text-5xl md:text-8xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white via-teal-400 to-blue-600"
                        >
                            The Express Way to Wholesaling
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                            className="max-w-2xl mx-auto text-xl text-slate-400 leading-relaxed"
                        >
                            All your tools, leads, and deals—managed in one powerful platform. Calculate, track, and close faster than ever.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                        >
                            <Link href="/register" className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full text-white font-bold text-lg shadow-xl shadow-teal-500/25 hover:scale-105 transition-all group flex items-center justify-center">
                                Start Your Trial
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/login" className="w-full sm:w-auto px-10 py-4 bg-slate-900 border border-slate-700 rounded-full text-white font-bold text-lg hover:bg-slate-800 transition-colors flex items-center justify-center">
                                View Demo
                            </Link>
                        </motion.div>
                    </motion.div>
                </section>

                <section id="features" className="py-24 px-4 bg-slate-950">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16 space-y-4"
                        >
                            <h2 className="text-4xl font-bold tracking-tight">Everything You Need to Scale</h2>
                            <p className="text-slate-400 max-w-xl mx-auto">Focus on what makes you money: finding and closing deals. Let us handle the data and organization.</p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="p-8 bg-slate-900/40 border border-slate-800/60 rounded-3xl hover:border-teal-500/30 transition-all hover:bg-slate-900/60 group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform text-teal-400">
                                    <Users size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Lead Management</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">Imported leads DONE FOR YOU or instantly auto-enrich your own data so you have the full picture immediately.</p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="p-8 bg-slate-900/40 border border-slate-800/60 rounded-3xl hover:border-teal-500/30 transition-all hover:bg-slate-900/60 group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform text-blue-400">
                                    <Search size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Property Analysis</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">Powerful financial calculators to evaluate MAO, ARV, and projected spreads instantly.</p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="p-8 bg-slate-900/40 border border-slate-800/60 rounded-3xl hover:border-teal-500/30 transition-all hover:bg-slate-900/60 group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform text-indigo-400">
                                    <Calculator size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Deal Calculator</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">Run the numbers in seconds. Our deal calculator helps you determine your max offer amount and generate professional offer letters with one click.</p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                className="p-8 bg-slate-900/40 border border-slate-800/60 rounded-3xl hover:border-teal-500/30 transition-all hover:bg-slate-900/60 group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform text-teal-500">
                                    <Database size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Buyers List</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">Maintain a curated list of qualified buyers ready for your next big assignment.</p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Social Proof / Stats */}
                <section className="py-24 px-4 overflow-hidden border-t border-slate-900">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, rotateX: 10 }}
                        whileInView={{ scale: 1, opacity: 1, rotateX: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="max-w-5xl mx-auto bg-gradient-to-br from-teal-500 to-blue-700 rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-teal-500/20"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-12 -translate-y-12">
                            <CheckCircle2 size={300} strokeWidth={1} />
                        </div>

                        <div className="relative z-10 space-y-6">
                            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Ready to stop losing deals?</h2>
                            <p className="text-teal-50/80 text-lg max-w-xl mx-auto">
                                Join hundreds of smart wholesalers who use ExpressDeal to organize their business and triple their closing rate.
                            </p>
                            <motion.div
                                className="pt-4"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link href="/register" className="px-12 py-5 bg-white text-teal-600 rounded-full font-black text-xl hover:shadow-2xl transition-all inline-block text-center">
                                    Get Started for Free
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </section>
            </div>
        </PublicLayout>
    );
};

export default LandingPage;
