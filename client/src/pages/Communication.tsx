import React, { useState, useEffect } from 'react';
import Dialer from '@/components/communication/Dialer';
import { MessageSquare, Phone, Voicemail } from 'lucide-react';
import axios from 'axios';

const Communication = () => {
    const [activeTab, setActiveTab] = useState<'calls' | 'sms' | 'voicemail'>('calls');
    const [history, setHistory] = useState<{ calls: any[], sms: any[], voicemail: any[], notConfigured?: boolean }>({ calls: [], sms: [], voicemail: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get('/api/communication/recent');
                setHistory(res.data || { calls: [], sms: [], voicemail: [] });
            } catch (error: any) {
                console.error("Failed to fetch communication history", error);
                // If the backend returns a specific error structure (as we added), use it
                if (error.response?.data?.calls) {
                    setHistory(error.response.data);
                } else {
                    setError("Failed to load communication history.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-400">Loading communication history...</div>;
    if (error) return <div className="p-8 text-center text-red-400">{error}</div>;
    if (!history) return <div className="p-8 text-center text-slate-400">No data available</div>;

    if (history.notConfigured) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
                <div className="bg-slate-800 p-4 rounded-full mb-4">
                    <Phone size={48} className="text-slate-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-100 mb-2">Communication Hub Not Configured</h2>
                <p className="text-slate-400 max-w-md mb-6">
                    The communication features (Calling, SMS, Voicemail) require SignalWire integration. 
                    Please contact the administrator to configure the necessary credentials.
                </p>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-left">
                    <h3 className="text-sm font-bold text-slate-300 mb-2">Required Environment Variables:</h3>
                    <ul className="text-xs text-slate-500 space-y-1 font-mono">
                        <li>SIGNALWIRE_PROJECT_ID</li>
                        <li>SIGNALWIRE_TOKEN</li>
                        <li>SIGNALWIRE_SPACE_URL</li>
                        <li>SIGNALWIRE_PHONE_NUMBER</li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full gap-6">
            <div className="flex-1 flex flex-col space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Communication</h1>
                    <p className="text-slate-400">Manage all your calls and messages in one place.</p>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-slate-900 p-1 rounded-lg w-fit border border-slate-800">
                    <button
                        onClick={() => setActiveTab('calls')}
                        className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-all ${activeTab === 'calls' ? 'bg-slate-800 text-teal-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        <Phone size={16} className="mr-2" />
                        Calls
                    </button>
                    <button
                        onClick={() => setActiveTab('sms')}
                        className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-all ${activeTab === 'sms' ? 'bg-slate-800 text-teal-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        <MessageSquare size={16} className="mr-2" />
                        Messages
                    </button>
                    <button
                        onClick={() => setActiveTab('voicemail')}
                        className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-all ${activeTab === 'voicemail' ? 'bg-slate-800 text-teal-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        <Voicemail size={16} className="mr-2" />
                        Voicemails
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-start text-slate-500 overflow-y-auto">
                    {loading ? (
                        <div className="m-auto">Loading...</div>
                    ) : (
                        <>
                            {activeTab === 'calls' && (
                                !history.calls || history.calls.length === 0 ? (
                                    <div className="text-center m-auto">
                                        <Phone size={48} className="mx-auto mb-4 opacity-50" />
                                        <h3 className="text-lg font-medium text-slate-300">Call History</h3>
                                        <p>No recent calls found.</p>
                                    </div>
                                ) : (
                                    <div className="w-full space-y-3">
                                        {history.calls.map((call: any) => (
                                            <div key={call.id} className="w-full p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className={`p-2 rounded-full mr-3 ${call.direction === 'outbound' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                                                        <Phone size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="text-slate-200 font-medium">{call.direction === 'outbound' ? 'Outbound Call' : 'Inbound Call'}</div>
                                                        <div className="text-xs text-slate-500">{new Date(call.createdAt).toLocaleString()}</div>
                                                    </div>
                                                </div>
                                                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded capitalize">{call.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                            {activeTab === 'sms' && (
                                history.sms.length === 0 ? (
                                    <div className="text-center m-auto">
                                        <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                                        <h3 className="text-lg font-medium text-slate-300">Messages</h3>
                                        <p>Select a conversation to start messaging.</p>
                                    </div>
                                ) : (
                                    <div className="w-full space-y-3">
                                        {history.sms.map((sms: any) => (
                                            <div key={sms.id} className="w-full p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className={`p-2 rounded-full mr-3 ${sms.direction === 'outbound' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                                                        <MessageSquare size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="text-slate-200 font-medium truncate max-w-xs">{sms.message}</div>
                                                        <div className="text-xs text-slate-500">{new Date(sms.createdAt).toLocaleString()}</div>
                                                    </div>
                                                </div>
                                                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded capitalize">{sms.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                            {activeTab === 'voicemail' && (
                                !history.voicemail || history.voicemail.length === 0 ? (
                                    <div className="text-center m-auto">
                                        <Voicemail size={48} className="mx-auto mb-4 opacity-50" />
                                        <h3 className="text-lg font-medium text-slate-300">Voicemails</h3>
                                        <p>No new voicemails.</p>
                                    </div>
                                ) : (
                                    <div className="w-full space-y-3">
                                        {(history.voicemail || []).map((vm: any) => (
                                            <div key={vm.id} className="w-full p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="p-2 rounded-full mr-3 bg-purple-500/10 text-purple-400">
                                                        <Voicemail size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="text-slate-200 font-medium">Voicemail</div>
                                                        <div className="text-xs text-slate-500">{new Date(vm.createdAt).toLocaleString()}</div>
                                                    </div>
                                                </div>
                                                <audio controls src={vm.recordingUrl} className="h-8 w-48" />
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Right Sidebar - Dialer */}
            <div className="w-80 border-l border-slate-800 pl-6 flex flex-col justify-end">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-auto w-full">
                    <h3 className="font-bold text-slate-300 mb-4">Active Lines</h3>
                    <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800/50">
                        <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                            <span className="text-sm text-slate-300">Main Line</span>
                        </div>
                        <span className="text-xs text-slate-500">+1 (555) 010-9999</span>
                    </div>
                </div>
                <div className="flex justify-center pb-8">
                    <Dialer />
                </div>
            </div>
        </div>
    );
};

export default Communication;
