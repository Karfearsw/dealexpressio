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

                    <motion.div
                        style={{ y: dashboardY }}
                        className="pt-20 px-4 scale-95 md:scale-100"
                    >
                        <div className="p-2 bg-slate-800/50 border border-slate-700/50 rounded-2xl backdrop-blur max-w-6xl mx-auto shadow-2xl origin-top transform perspective-1000 rotate-x-12">
                            <div className="bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-800/50 aspect-[16/9] flex items-center justify-center relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-blue-600/10 to-transparent" />
                                <div className="relative z-10 text-slate-400 font-bold tracking-wider uppercase">Dashboard Preview</div>
                            </div>
                        </div>
                    </motion.div>
                </section>



                {/* Scrollytelling Workflow Section */}
                <section id="workflow" className="relative bg-slate-950 py-24">
                    <div className="max-w-7xl mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-24"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">How Deal Express Works</h2>
                            <p className="text-slate-400 text-lg max-w-2xl mx-auto">A seamless workflow designed to take you from lead to payday in record time.</p>
                        </motion.div>

                        <div className="relative">
                            {/* Connecting Line */}
                            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-800 -translate-x-1/2 hidden md:block"></div>

                            {workflowSteps.map((step, index) => (
                                <div key={step.id} className="relative grid md:grid-cols-2 gap-12 mb-32 last:mb-0 items-center">
                                    {/* Timeline Dot */}
                                    <div className="absolute left-8 md:left-1/2 top-0 md:top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-800 border-4 border-slate-950 z-10 hidden md:block group-hover:bg-teal-500 transition-colors"></div>

                                    <motion.div
                                        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ margin: "-100px" }}
                                        transition={{ duration: 0.6 }}
                                        className={`pl-16 md:pl-0 ${index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:order-2 md:pl-16'}`}
                                    >
                                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 shadow-lg ${step.color} text-white`}>
                                            <step.icon size={24} />
                                        </div>
                                        <h3 className="text-3xl font-bold mb-4 text-slate-100">{step.title}</h3>
                                        <p className="text-slate-400 text-lg leading-relaxed">{step.description}</p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                                        whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                        viewport={{ margin: "-100px" }}
                                        transition={{ duration: 0.8 }}
                                        className={`relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 aspect-video group ${index % 2 === 0 ? 'md:order-2' : ''}`}
                                    >
                                        {/* Background Layer (Blurred & Filled) */}
                                        <div className="absolute inset-0 z-0">
                                            {step.image && (
                                                <img
                                                    src={step.image}
                                                    alt=""
                                                    className="w-full h-full object-cover opacity-20 blur-2xl scale-125"
                                                />
                                            )}
                                            <div className={`absolute inset-0 opacity-30 bg-gradient-to-br ${step.color.replace('bg-', 'from-')} to-transparent mix-blend-overlay`}></div>
                                        </div>

                                        {/* Main Content Layer */}
                                        <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
                                            {step.image ? (
                                                <img
                                                    src={step.image}
                                                    alt={step.title}
                                                    className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(45,212,191,0.4)] group-hover:scale-105 transition-transform duration-700 ease-out"
                                                />
                                            ) : (
                                                <step.icon size={64} className="text-slate-700 opacity-50" />
                                            )}
                                        </div>

                                        {/* Mock UI Elements (Only show if no image) */}
                                        {!step.image && (
                                            <div className="absolute bottom-4 left-4 right-4 h-2 bg-slate-800 rounded-full overflow-hidden z-20">
                                                <motion.div
                                                    initial={{ width: "0%" }}
                                                    whileInView={{ width: "100%" }}
                                                    transition={{ duration: 1.5, delay: 0.5 }}
                                                    className={`h-full ${step.color}`}
                                                />
                                            </div>
                                        )}
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
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
                            {features.map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-8 bg-slate-900/40 border border-slate-800/60 rounded-3xl hover:border-teal-500/30 transition-all hover:bg-slate-900/60 group"
                                >
                                    <div className={`w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform ${feature.color}`}>
                                        {feature.image ? (
                                            <img src={feature.image} alt={feature.title} className="w-10 h-10 object-contain" />
                                        ) : (
                                            <feature.icon size={28} />
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Social Proof / Stats */}
                <div className="min-h-screen flex items-center justify-center">
                    <section className="py-20 border-y border-slate-900 bg-slate-950/50">
                        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            {[
                            { value: "1000+", label: "Monthly Leads", color: "text-teal-400" },
                            { value: "$11M", label: "Tracked Volume", color: "text-blue-400" },
                            { value: "24/7", label: "Support", color: "text-teal-500" }
                            ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: "spring", stiffness: 100, delay: i * 0.1 }}
                            >
                                <div className={`text-4xl font-extrabold ${stat.color} mb-1`}>{stat.value}</div>
                                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">{stat.label}</div>
                            </motion.div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* CTA Section */}
                <section className="py-24 px-4 overflow-hidden">
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
                                Join hundreds of smart wholesalers who use Deal Express to organize their business and triple their closing rate.
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
