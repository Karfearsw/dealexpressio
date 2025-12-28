import React, { useState, useEffect } from 'react';
import { Mail, Users, TrendingUp, Send } from 'lucide-react';
import axios from 'axios';

const Marketing = () => {
    const [signups, setSignups] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [signupsRes, statsRes] = await Promise.all([
                axios.get('/api/marketing/beta-signups'),
                axios.get('/api/marketing/stats')
            ]);
            setSignups(signupsRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching marketing data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading marketing data...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-100">Marketing</h1>
                <p className="text-slate-400">Manage campaigns and view beta signups.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stats */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center">
                    <div className="p-3 bg-blue-500/20 rounded-lg mr-4">
                        <Users className="text-blue-500" size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-100">{signups.length}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase">Beta Signups</div>
                    </div>
                </div>
                 <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center">
                    <div className="p-3 bg-green-500/20 rounded-lg mr-4">
                        <TrendingUp className="text-green-500" size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-100">{stats?.activeUsers || 0}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase">Active Users</div>
                    </div>
                </div>
            </div>

            {/* Campaign Placeholder */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                 <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center">
                    <Mail className="mr-2 text-teal-500" size={20} />
                    Quick Blast
                </h3>
                <div className="space-y-4">
                    <p className="text-sm text-slate-400">Send a quick update to all beta signups.</p>
                    <textarea 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-teal-500 h-24 resize-none"
                        placeholder="Type your message here..."
                    ></textarea>
                    <div className="flex justify-end">
                        <button className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg flex items-center font-medium transition-colors opacity-50 cursor-not-allowed">
                            <Send size={16} className="mr-2" />
                            Send Blast (Coming Soon)
                        </button>
                    </div>
                </div>
            </div>

            {/* Beta Signups List */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                    <h3 className="text-lg font-bold text-slate-100">Beta Signups List</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-4 font-medium">Email</th>
                                <th className="p-4 font-medium">Date Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {signups.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="p-8 text-center text-slate-500">
                                        No signups yet.
                                    </td>
                                </tr>
                            ) : (
                                signups.map((signup: any) => (
                                    <tr key={signup.id} className="text-sm text-slate-300 hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 font-mono text-slate-200">{signup.email}</td>
                                        <td className="p-4 text-slate-400">
                                            {new Date(signup.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Marketing;
