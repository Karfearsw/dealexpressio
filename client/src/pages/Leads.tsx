import React, { useState, useEffect } from 'react';
import Pipeline from '@/components/leads/Pipeline';
import LeadsList from '@/components/leads/LeadsList';
import { Plus, Columns, List } from 'lucide-react';
import { Lead } from '@/types';
import axios from 'axios';

const Leads = () => {
    const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline');
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await axios.get('/leads');
            setLeads(res.data);
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLeadUpdate = async (leadId: number, newStatus: Lead['status']) => {
        // Optimistic update
        setLeads((prev) =>
            prev.map(lead => lead.id === leadId ? { ...lead, status: newStatus } : lead)
        );

        try {
            await axios.put(`/leads/${leadId}`, { status: newStatus });
        } catch (error) {
            console.error('Error updating lead status:', error);
            fetchLeads(); // Revert on error
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading leads...</div>;

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Leads Pipeline</h1>
                    <p className="text-slate-400">Manage your deal flow from new lead to closed deal.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 flex">
                        <button
                            onClick={() => setViewMode('pipeline')}
                            className={`p-2 rounded ${viewMode === 'pipeline' ? 'bg-slate-800 text-teal-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <Columns size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-slate-800 text-teal-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <List size={20} />
                        </button>
                    </div>
                    <button className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg flex items-center font-medium transition-colors">
                        <Plus size={20} className="mr-2" />
                        Add Lead
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                {viewMode === 'pipeline' ? (
                    <Pipeline leads={leads} onLeadUpdate={handleLeadUpdate} />
                ) : (
                    <LeadsList leads={leads} />
                )}
            </div>
        </div>
    );
};

export default Leads;
