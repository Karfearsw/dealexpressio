import { motion } from 'framer-motion';
import { MessageSquare, Users, Heart, Share2 } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import iconLeadManagement from '@/assets/icon-feature-lead-management.png';
import iconBuyersList from '@/assets/icon-feature-buyers-list.png';

const Community = () => {
    return (
        <PublicLayout>
            <div className="pt-32 pb-20 px-4">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold uppercase tracking-wider"
                    >
                        <Users size={16} />
                        <span>Join 500+ Wholesalers</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-extrabold tracking-tight text-white"
                    >
                        The DealExpress <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Community</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        Connect with top-tier wholesalers, share off-market deals, and get real-time support in our exclusive Discord server.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="pt-8"
                    >
                        <a
                            href="https://discord.gg/dealexpress"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-3 px-10 py-5 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-2xl font-bold text-xl transition-all hover:scale-105 shadow-xl shadow-indigo-500/20"
                        >
                            <MessageSquare size={24} />
                            <span>Join the Discord</span>
                        </a>
                        <p className="mt-4 text-slate-500 text-sm">Free access for all registered users</p>
                    </motion.div>
                </div>

                <div className="max-w-5xl mx-auto mt-32 grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: Users,
                            image: iconLeadManagement,
                            title: "Networking",
                            desc: "Find JV partners, cash buyers, and mentors in your local market."
                        },
                        {
                            icon: Share2,
                            image: iconBuyersList,
                            title: "Deal Sharing",
                            desc: "Post your assignment contracts and find buyers instantly."
                        },
                        {
                            icon: Heart,
                            title: "Support",
                            desc: "24/7 community support for technical issues or deal structuring questions."
                        }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + (i * 0.1) }}
                            className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl text-center hover:bg-slate-900 transition-colors"
                        >
                            <div className="w-16 h-16 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center mx-auto mb-6 text-indigo-400">
                                {item.image ? (
                                    <img src={item.image} alt={item.title} className="w-10 h-10 object-contain" />
                                ) : (
                                    <item.icon size={32} />
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                            <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </PublicLayout>
    );
};

export default Community;
