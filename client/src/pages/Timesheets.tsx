import React, { useState, useEffect } from 'react';
import { Clock, Play, Square, History, Calendar } from 'lucide-react';
import axios from 'axios';

const Timesheets = () => {
    const [status, setStatus] = useState<'idle' | 'active'>('idle');
    const [currentSession, setCurrentSession] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        fetchStatus();
        fetchHistory();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === 'active' && currentSession) {
            interval = setInterval(() => {
                const startTime = new Date(currentSession.clockIn).getTime();
                const now = new Date().getTime();
                setElapsed(Math.floor((now - startTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status, currentSession]);

    const fetchStatus = async () => {
        try {
            const res = await axios.get('/timesheets/status');
            if (res.data.active) {
                setStatus('active');
                setCurrentSession(res.data.timesheet);
            } else {
                setStatus('idle');
                setCurrentSession(null);
            }
        } catch (error) {
            console.error('Error fetching status:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await axios.get('/timesheets/history');
            setHistory(res.data);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const handleClockIn = async () => {
        try {
            const res = await axios.post('/timesheets/clock-in');
            setStatus('active');
            setCurrentSession(res.data);
            fetchHistory(); // Refresh history
        } catch (error) {
            console.error('Error clocking in:', error);
        }
    };

    const handleClockOut = async () => {
        try {
            await axios.post('/timesheets/clock-out');
            setStatus('idle');
            setCurrentSession(null);
            setElapsed(0);
            fetchHistory();
        } catch (error) {
            console.error('Error clocking out:', error);
        }
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading timesheets...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-100">Timesheets</h1>
                <p className="text-slate-400">Track your work hours and history.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Clock In/Out Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                    <div className="mb-6">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 mx-auto transition-colors ${status === 'active' ? 'bg-teal-500/20 text-teal-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                            <Clock size={48} />
                        </div>
                        <h2 className="text-3xl font-mono font-bold text-slate-100 mb-2">
                            {status === 'active' ? formatTime(elapsed) : '00:00:00'}
                        </h2>
                        <p className={`text-sm font-medium uppercase tracking-wider ${status === 'active' ? 'text-teal-400' : 'text-slate-500'}`}>
                            {status === 'active' ? 'Currently Working' : 'Ready to Start'}
                        </p>
                    </div>

                    {status === 'idle' ? (
                        <button
                            onClick={handleClockIn}
                            className="w-full max-w-xs bg-teal-600 hover:bg-teal-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-teal-900/20"
                        >
                            <Play className="mr-2 fill-current" />
                            Clock In
                        </button>
                    ) : (
                        <button
                            onClick={handleClockOut}
                            className="w-full max-w-xs bg-red-600 hover:bg-red-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-red-900/20"
                        >
                            <Square className="mr-2 fill-current" />
                            Clock Out
                        </button>
                    )}
                </div>

                {/* Summary / Stats (Placeholder for now) */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-100 mb-4">Summary</h3>
                    <div className="space-y-4">
                         <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                            <span className="text-slate-400">Today</span>
                            <span className="text-slate-200 font-mono font-bold">
                                {formatDuration(history
                                    .filter(h => new Date(h.clockIn).toDateString() === new Date().toDateString())
                                    .reduce((acc, curr) => acc + (curr.duration || 0), 0) + (status === 'active' ? elapsed : 0))}
                            </span>
                        </div>
                        <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                            <span className="text-slate-400">This Week</span>
                             <span className="text-slate-200 font-mono font-bold">
                                {formatDuration(history
                                    .filter(h => {
                                        const d = new Date(h.clockIn);
                                        const now = new Date();
                                        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                                        return d >= startOfWeek;
                                    })
                                    .reduce((acc, curr) => acc + (curr.duration || 0), 0) + (status === 'active' ? elapsed : 0))}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex items-center">
                    <History className="mr-2 text-teal-500" size={20} />
                    <h3 className="text-lg font-bold text-slate-100">Recent Activity</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium">Clock In</th>
                                <th className="p-4 font-medium">Clock Out</th>
                                <th className="p-4 font-medium">Duration</th>
                                <th className="p-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        No activity recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                history.map((item) => (
                                    <tr key={item.id} className="text-sm text-slate-300 hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 flex items-center">
                                            <Calendar size={14} className="mr-2 text-slate-500" />
                                            {new Date(item.clockIn).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 font-mono text-slate-400">
                                            {new Date(item.clockIn).toLocaleTimeString()}
                                        </td>
                                        <td className="p-4 font-mono text-slate-400">
                                            {item.clockOut ? new Date(item.clockOut).toLocaleTimeString() : '-'}
                                        </td>
                                        <td className="p-4 font-bold text-slate-200">
                                            {item.duration ? formatDuration(item.duration) : '-'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'active' ? 'bg-teal-500/10 text-teal-400' : 'bg-slate-800 text-slate-400'}`}>
                                                {item.status}
                                            </span>
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

export default Timesheets;
