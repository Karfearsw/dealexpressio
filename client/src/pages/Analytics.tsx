import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { DollarSign, CheckCircle, Percent } from 'lucide-react';
import axios from 'axios';

const Analytics = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await axios.get('/analytics/dashboard');
            setData(res.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            // Set mock data if API fails
            setData({
                metrics: { totalLeads: 0, activeDeals: 0, revenue: 0, callsMade: 0, dealsClosed: 0, avgDealSize: 0, conversionRate: 0 },
                pipeline: [],
                sources: [],
                revenue: [
                    { name: 'Jan', revenue: 0, deals: 0 },
                    { name: 'Feb', revenue: 0, deals: 0 },
                    { name: 'Mar', revenue: 0, deals: 0 }
                ]
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
                <h1 className="text-2xl font-bold text-slate-100">Analytics</h1>
                <p className="text-slate-400">Key metrics and performance insights for your wholesaling business.</p>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center">
                    <div className="p-3 bg-green-500/20 rounded-lg mr-4">
                        <DollarSign className="text-green-500" size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-100">${data.metrics.revenue.toLocaleString()}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase">YTD Revenue</div>
                        <div className="text-[10px] text-slate-600">From closed deals</div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center">
                    <div className="p-3 bg-blue-500/20 rounded-lg mr-4">
                        <CheckCircle className="text-blue-500" size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-100">{data.metrics.dealsClosed}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase">Deals Closed</div>
                        <div className="text-[10px] text-slate-600">This year</div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center">
                    <div className="p-3 bg-teal-500/20 rounded-lg mr-4">
                        <DollarSign className="text-teal-500" size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-100">${Math.round(data.metrics.avgDealSize).toLocaleString()}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase">Avg Deal Size</div>
                        <div className="text-[10px] text-slate-600">Per transaction</div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center">
                    <div className="p-3 bg-purple-500/20 rounded-lg mr-4">
                        <Percent className="text-purple-500" size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-100">{data.metrics.conversionRate.toFixed(1)}%</div>
                        <div className="text-xs text-slate-500 font-bold uppercase">Conv. Rate</div>
                        <div className="text-[10px] text-slate-600">Lead to close</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Conversion Funnel */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-100 mb-6">Conversion Funnel</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data.pipeline}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis type="number" stroke="#64748b" />
                                <YAxis dataKey="name" type="category" width={100} stroke="#64748b" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                                    itemStyle={{ color: '#f1f5f9' }}
                                />
                                <Bar dataKey="value" fill="#0d9488" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Lead Source Distribution */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-100 mb-6">Lead Source Distribution</h3>
                    <div className="h-64 flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.sources}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.sources.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Monthly Performance</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data.revenue}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                                itemStyle={{ color: '#f1f5f9' }}
                                formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </div >
    );
};

export default Analytics;
