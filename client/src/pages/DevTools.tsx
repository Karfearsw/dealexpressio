import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Clock, Server, CheckCircle, AlertCircle, Play, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemHealth {
    status: string;
    uptime: number;
    timestamp: string;
    database: {
        status: string;
        latencyMs: number;
    };
    system: {
        memoryUsage: any;
        loadAverage: number[];
        platform: string;
        release: string;
    };
}

interface Timesheet {
    id: number;
    userId: number;
    clockIn: string;
    clockOut?: string;
    duration?: number;
    status: string;
}

const DevTools = () => {
    const [health, setHealth] = useState<SystemHealth | null>(null);
    const [activeTimesheet, setActiveTimesheet] = useState<Timesheet | null>(null);
    const [history, setHistory] = useState<Timesheet[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchData = () => {
        fetchHealth();
        fetchTimesheetStatus();
        fetchTimesheetHistory();
    };

    const fetchHealth = async () => {
        try {
            const res = await axios.get('/system/health');
            setHealth(res.data);
        } catch (error) {
            console.error('Error fetching health:', error);
        }
    };

    const fetchTimesheetStatus = async () => {
        try {
            const res = await axios.get('/timesheets/status');
            setActiveTimesheet(res.data.timesheet);
        } catch (error) {
            console.error('Error fetching timesheet status:', error);
        }
    };

    const fetchTimesheetHistory = async () => {
        try {
            const res = await axios.get('/timesheets/history');
            setHistory(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching history:', error);
            setLoading(false);
        }
    };

    const handleClockIn = async () => {
        try {
            await axios.post('/timesheets/clock-in');
            fetchTimesheetStatus();
            fetchTimesheetHistory();
        } catch (error) {
            console.error('Error clocking in:', error);
        }
    };

    const handleClockOut = async () => {
        try {
            await axios.post('/timesheets/clock-out');
            fetchTimesheetStatus();
            fetchTimesheetHistory();
        } catch (error) {
            console.error('Error clocking out:', error);
        }
    };

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-100">Developer Tools</h1>
                <p className="text-slate-400">System health monitoring and employee tools.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Health */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center">
                        <Activity className="mr-2 text-teal-500" size={20} />
                        System Health
                    </h3>

                    {health ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">API Status</div>
                                    <div className="flex items-center text-green-400 font-medium">
                                        <CheckCircle size={16} className="mr-2" />
                                        Operational
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Database</div>
                                    <div className={cn("flex items-center font-medium",
                                        health.database.status === 'connected' ? "text-green-400" : "text-red-400"
                                    )}>
                                        <Server size={16} className="mr-2" />
                                        {health.database.status === 'connected' ? `Connected (${health.database.latencyMs}ms)` : 'Disconnected'}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Uptime</span>
                                    <span className="text-slate-200 font-mono">{formatDuration(health.uptime)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Platform</span>
                                    <span className="text-slate-200 font-mono">{health.system.platform} {health.system.release}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Load Average</span>
                                    <span className="text-slate-200 font-mono">{health.system.loadAverage.map(n => n.toFixed(2)).join(', ')}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-500">
                            <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                            <p>System metrics unavailable</p>
                        </div>
                    )}
                </div>

                {/* Timesheets */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center">
                        <Clock className="mr-2 text-teal-500" size={20} />
                        Timesheet
                    </h3>

                    <div className="mb-6">
                        {activeTimesheet ? (
                            <div className="p-6 bg-teal-500/10 border border-teal-500/50 rounded-xl text-center">
                                <div className="text-teal-400 font-bold mb-2">Currently Clocked In</div>
                                <div className="text-3xl font-mono text-slate-100 mb-4">
                                    {new Date(activeTimesheet.clockIn).toLocaleTimeString()}
                                </div>
                                <button
                                    onClick={handleClockOut}
                                    className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center mx-auto"
                                >
                                    <Square size={16} className="mr-2 fill-current" />
                                    Clock Out
                                </button>
                            </div>
                        ) : (
                            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl text-center">
                                <div className="text-slate-400 mb-4">You are currently clocked out.</div>
                                <button
                                    onClick={handleClockIn}
                                    className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center mx-auto"
                                >
                                    <Play size={16} className="mr-2 fill-current" />
                                    Clock In
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-slate-400 uppercase">Recent Activity</h4>
                        {history.length > 0 ? (
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {history.map((sheet) => (
                                    <div key={sheet.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-sm">
                                        <div>
                                            <div className="text-slate-200 font-medium">
                                                {new Date(sheet.clockIn).toLocaleDateString()}
                                            </div>
                                            <div className="text-slate-500">
                                                {new Date(sheet.clockIn).toLocaleTimeString()} - {sheet.clockOut ? new Date(sheet.clockOut).toLocaleTimeString() : 'Active'}
                                            </div>
                                        </div>
                                        <div className="font-mono text-teal-400">
                                            {sheet.duration ? formatDuration(sheet.duration) : '...'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-slate-500 py-4">No recent history.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DevTools;
