import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import axios from 'axios';

const Contracts = () => {
    const [templates, setTemplates] = useState<any[]>([]);
    const [recentContracts, setRecentContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [templatesRes, recentRes] = await Promise.all([
                    axios.get('/api/contracts/templates'),
                    axios.get('/api/contracts/recent')
                ]);
                setTemplates(templatesRes.data);
                setRecentContracts(recentRes.data);
            } catch (error) {
                console.error("Failed to fetch contracts data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-100">Contracts</h1>
                <p className="text-slate-400">Manage agreement templates and generated contracts.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-100 mb-4">Templates</h3>
                    <div className="space-y-3">
                        {loading ? (
                            <div className="text-center text-slate-500">Loading templates...</div>
                        ) : templates.map((template) => (
                            <div key={template.id} className={`p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between hover:border-teal-500/50 transition-colors cursor-pointer ${!template.active && 'opacity-50'}`}>
                                <div className="flex items-center">
                                    <FileText className={`${template.active ? 'text-teal-500' : 'text-slate-500'} mr-3`} size={20} />
                                    <div>
                                        <div className="text-slate-200 font-medium">{template.name}</div>
                                        <div className="text-xs text-slate-500">{template.description}</div>
                                    </div>
                                </div>
                                {template.active ? (
                                    <span className="text-xs bg-teal-500/10 text-teal-400 px-2 py-1 rounded">Active</span>
                                ) : (
                                    <span className="text-xs text-slate-500">Coming Soon</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-100 mb-4">Recent Generated Contracts</h3>
                    {loading ? (
                        <div className="text-center text-slate-500">Loading recent contracts...</div>
                    ) : recentContracts.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            <FileText size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No contracts generated recently.</p>
                            <p className="text-xs mt-2">Go to a Property to generate an assignment.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentContracts.map((contract) => (
                                <div key={contract.id} className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FileText className="text-blue-500 mr-3" size={20} />
                                        <div>
                                            <div className="text-slate-200 font-medium">{contract.address}</div>
                                            <div className="text-xs text-slate-500">Assignment Fee: ${contract.assignmentFee || 0}</div>
                                        </div>
                                    </div>
                                    <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded">{contract.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Contracts;
