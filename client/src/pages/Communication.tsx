import React, { useState } from 'react';
import Dialer from '@/components/communication/Dialer';
import { MessageSquare, Phone, Voicemail } from 'lucide-react';

const Communication = () => {
    const [activeTab, setActiveTab] = useState<'calls' | 'sms' | 'voicemail'>('calls');

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
                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500">
                    {activeTab === 'calls' && (
                        <div className="text-center">
                            <Phone size={48} className="mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-slate-300">Call History</h3>
                            <p>No recent calls found.</p>
                        </div>
                    )}
                    {activeTab === 'sms' && (
                        <div className="text-center">
                            <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-slate-300">Messages</h3>
                            <p>Select a conversation to start messaging.</p>
                        </div>
                    )}
                    {activeTab === 'voicemail' && (
                        <div className="text-center">
                            <Voicemail size={48} className="mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-slate-300">Voicemails</h3>
                            <p>No new voicemails.</p>
                        </div>
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
