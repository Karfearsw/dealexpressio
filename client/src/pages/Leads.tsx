import React, { useState, useEffect } from 'react';
import Pipeline from '@/components/leads/Pipeline';
import LeadsList from '@/components/leads/LeadsList';
import { Plus, Columns, List, X, Upload, Download } from 'lucide-react';
import { Lead } from '@/types';
import axios from 'axios';
import DataImportModal from '@/components/common/DataImportModal';
import { useLocation } from 'wouter';

const Leads = () => {
    const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline');
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [newLead, setNewLead] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', zip: '', source: 'Manual', status: 'New Lead' });
    const [, setLocation] = useLocation();

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

    const handleExport = async () => {
        try {
            const response = await axios.get('/leads/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'leads-export.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting leads:', error);
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

    const handleConvertToDeal = async (leadId: number) => {
        try {
            await axios.post(`/leads/${leadId}/convert-to-deal`);
            // Show success message if we had toast
            setLocation('/deals');
        } catch (error) {
            console.error('Failed to convert lead to deal', error);
            alert('Failed to convert lead to deal');
        }
    };

    const handleCreateLead = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post('/leads', newLead);
            setLeads(prev => [res.data, ...prev]);
            setShowModal(false);
            setNewLead({ firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', zip: '', source: 'Manual', status: 'New Lead' });
        } catch (error: any) {
            console.error('Error creating lead:', error);
            const message = error.response?.data?.message || error.message || 'Failed to create lead';
            alert(message);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading leads...</div>;

    return (
        <div className="flex flex-col h-full relative">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Leads Pipeline</h1>
                    <p className="text-slate-400">Manage your deal flow from new lead to closed deal.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 flex">
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                            title="Import Leads"
                        >
                            <Upload size={20} />
                        </button>
                        <button
                            onClick={handleExport}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                            title="Export Leads"
                        >
                            <Download size={20} />
                        </button>
                    </div>
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
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg flex items-center font-medium transition-colors"
                    >
                        <Plus size={20} className="mr-2" />
                        Add Lead
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                {viewMode === 'pipeline' ? (
                    <Pipeline
                        leads={leads}
                        onLeadUpdate={handleLeadUpdate}
                        onConvertToDeal={handleConvertToDeal}
                    />
                ) : (
                    <LeadsList
                        leads={leads}
                        onConvertToDeal={handleConvertToDeal}
                    />
                )}
            </div>

            <DataImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                endpoint="/leads/import"
                onSuccess={fetchLeads}
                title="Import Leads"
                templateFields={['firstName', 'lastName', 'email']}
            />

            {/* Add Lead Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-100">Add New Lead</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateLead} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">First Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newLead.firstName}
                                        onChange={e => setNewLead({ ...newLead, firstName: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Last Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newLead.lastName}
                                        onChange={e => setNewLead({ ...newLead, lastName: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={newLead.email}
                                    onChange={e => setNewLead({ ...newLead, email: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={newLead.phone}
                                    onChange={e => setNewLead({ ...newLead, phone: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Address</label>
                                <input
                                    type="text"
                                    value={newLead.address}
                                    onChange={e => setNewLead({ ...newLead, address: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                    placeholder="Street address"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">City</label>
                                    <input
                                        type="text"
                                        value={newLead.city}
                                        onChange={e => setNewLead({ ...newLead, city: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">State</label>
                                    <input
                                        type="text"
                                        value={newLead.state}
                                        onChange={e => setNewLead({ ...newLead, state: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Zip Code</label>
                                    <input
                                        type="text"
                                        value={newLead.zip}
                                        onChange={e => setNewLead({ ...newLead, zip: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Source</label>
                                <select
                                    value={newLead.source}
                                    onChange={e => setNewLead({ ...newLead, source: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                >
                                    <option value="Manual">Manual Entry</option>
                                    <option value="Website">Website</option>
                                    <option value="Referral">Referral</option>
                                    <option value="Cold Call">Cold Call</option>
                                </select>
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium transition-colors"
                                >
                                    Create Lead
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leads;
