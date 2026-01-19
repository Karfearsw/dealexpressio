import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Users, FileText, CheckCircle, DollarSign, Activity, RefreshCcw } from 'lucide-react';
import axios from 'axios';

const motivationalQuotes = [
    "Real estate investing, even on a very small scale, remains a tried and true means of building an individual's cash flow and wealth. - Robert Kiyosaki",
    "Turn your deals into consistent income with Deal Express.",
    "Don't wait to buy real estate. Buy real estate and wait. - Will Rogers",
    "Ninety percent of all millionaires become so through owning real estate. - Andrew Carnegie"
];

const Dashboard = () => {
    const [quoteIndex, setQuoteIndex] = useState(0);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const fetchStats = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const res = await axios.get('/analytics/dashboard');
            setStats(res.data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        // Auto-refresh every 60 seconds
        const refreshInterval = setInterval(() => fetchStats(true), 60000);
        return () => clearInterval(refreshInterval);
    }, [fetchStats]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(value);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    const metrics = stats?.metrics || { totalLeads: 0, activeDeals: 0, contractsOut: 0, revenue: 0 };
    const pipeline = stats?.pipeline || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-end items-center text-xs text-slate-500 space-x-2">
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                <button
                    onClick={() => fetchStats(true)}
                    className={`p-1 hover:text-teal-400 transition-colors ${refreshing ? 'animate-spin' : ''}`}
                    title="Refresh Data"
                >
                    <RefreshCcw size={14} />
                </button>
            </div>

            {/* Motivational Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-teal-900 border border-teal-500/20 shadow-lg p-8">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <TrendingUp size={120} />
                </div>
                <div className="relative z-10 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 transition-opacity duration-500">
                        "{motivationalQuotes[quoteIndex]}"
                    </h2>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Leads', value: metrics.totalLeads, icon: Users, color: 'text-blue-400' },
                    { label: 'Active Deals', value: metrics.activeDeals, icon: TrendingUp, color: 'text-teal-400' },
                    { label: 'Contracts Out', value: metrics.contractsOut, icon: FileText, color: 'text-purple-400' },
                    { label: 'Revenue', value: formatCurrency(metrics.revenue), icon: DollarSign, color: 'text-emerald-400' },
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-slate-400 text-sm font-medium">{stat.label}</span>
                            <stat.icon className={stat.color} size={20} />
                        </div>
                        <div className="text-3xl font-bold text-slate-100">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Pipeline Overview */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-6">
                    <Activity className="text-teal-500" size={20} />
                    <h3 className="text-lg font-bold text-slate-100">Live Pipeline Overview</h3>
                </div>

                {pipeline.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <p>No active leads in the pipeline.</p>
                        <p className="text-sm">Add leads to see your data here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pipeline.map((item: any, i: number) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-300 font-medium">{item.name || 'Uncategorized'}</span>
                                    <span className="text-slate-400">{item.value}</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"
                                        style={{ width: `${(item.value / Math.max(...pipeline.map((p: any) => p.value), 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
