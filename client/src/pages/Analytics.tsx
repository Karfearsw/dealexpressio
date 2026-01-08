import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Phone } from 'lucide-react';
import axios from 'axios';

const Analytics = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await axios.get('/api/analytics/dashboard');
            setData(res.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            // Set mock data if API fails
            setData({
                metrics: { totalLeads: 0, activeDeals: 0, revenue: 0, callsMade: 0 },
                pipeline: [],
                revenue: []
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading analytics...</div>;
    if (!data) return <div className="p-8 text-center text-slate-400">No data available</div>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-100">Analytics Dashboard</h1>
                <p className="text-slate-400">Performance metrics and KPIs.</p>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center">
                    <div className="p-3 bg-blue-500/20 rounded-lg mr-4">
                        <Users className="text-blue-500" size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-100">{data.metrics.totalLeads}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase">Total Leads</div>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center">
                    <div className="p-3 bg-teal-500/20 rounded-lg mr-4">
                        <TrendingUp className="text-teal-500" size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-100">{data.metrics.activeDeals}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase">Active Deals</div>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center">
                    <div className="p-3 bg-green-500/20 rounded-lg mr-4">
                        <DollarSign className="text-green-500" size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-100">${data.metrics.revenue.toLocaleString()}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase">Revenue YTD</div>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center">
                    <div className="p-3 bg-purple-500/20 rounded-lg mr-4">
                        <Phone className="text-purple-500" size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-100">{data.metrics.callsMade}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase">Calls Made</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pipeline Funnel */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-100 mb-6">Pipeline Health</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data.pipeline}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis type="number" stroke="#64748b" />
                                <YAxis dataKey="name" type="category" width={100} stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                                    itemStyle={{ color: '#f1f5f9' }}
                                />
                                <Bar dataKey="value" fill="#0d9488" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue Trend */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-100 mb-6">Revenue Trend</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data.revenue}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="name" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                                    itemStyle={{ color: '#f1f5f9' }}
                                />
                                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
