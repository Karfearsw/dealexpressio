import React, { useState, useEffect } from 'react';
import { Deal, Lead } from '@/types';
import axios from 'axios';
import { MapPin, DollarSign, Home, Plus, X, Upload, Download } from 'lucide-react';
import DataImportModal from '@/components/common/DataImportModal';

import { Link } from 'wouter';

interface DealsProps { }

const Deals: React.FC<DealsProps> = () => {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [newDeal, setNewDeal] = useState({
        leadId: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        arv: '',
        repairCost: '',
        status: 'Analyzing'
    });

    useEffect(() => {
        fetchDeals();
        fetchLeads();
    }, []);

    const fetchDeals = async () => {
        try {
            const res = await axios.get('/deals');
            setDeals(res.data);
        } catch (error) {
            console.error('Error fetching deals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await axios.get('/deals/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'deals-export.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting deals:', error);
        }
    };

    const fetchLeads = async () => {
        try {
            const res = await axios.get('/leads');
            setLeads(res.data);
        } catch (error) {
            console.error('Error fetching leads for deal creation:', error);
        }
    };

    const handleCreateDeal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post('/deals', {
                ...newDeal,
                leadId: parseInt(newDeal.leadId)
            });
            setDeals(prev => [res.data, ...prev]);
            setShowModal(false);
            setNewDeal({
                leadId: '',
                address: '',
                city: '',
                state: '',
                zip: '',
                arv: '',
                repairCost: '',
                status: 'Analyzing'
            });
        } catch (error) {
            console.error('Error creating deal:', error);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading deals...</div>;

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Deals</h1>
                    <p className="text-slate-400">Track and analyze potential deals.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 flex">
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                            title="Import Deals"
                        >
                            <Upload size={20} />
                        </button>
                        <button
                            onClick={handleExport}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                            title="Export Deals"
                        >
                            <Download size={20} />
                        </button>
                    </div>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg flex items-center font-medium transition-colors"
                    >
                        <Plus size={20} className="mr-2" />
                        Add Deal
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deals.map((deal) => (
                    <Link 
                        key={deal.id} 
                        href={`/deals/${deal.id}`}
                        className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-teal-500/30 transition-all block"
                    >
                        <div className="h-48 bg-slate-800 relative">
                                {/* Placeholder for photo */}
                                <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                                    <Home size={48} />
                                </div>
                                <div className="absolute top-2 right-2 bg-slate-950/80 px-2 py-1 rounded text-xs font-bold text-teal-400">
                                    {deal.status || 'Analyzing'}
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-slate-100 mb-1 truncate">{deal.address}</h3>
                                <div className="flex items-center text-slate-400 text-sm mb-4">
                                    <MapPin size={14} className="mr-1" />
                                    {deal.city}, {deal.state} {deal.zip}
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">ARV</div>
                                        <div className="text-sm font-bold text-slate-200 flex items-center">
                                            <DollarSign size={12} className="mr-0.5 text-teal-500" />
                                            {parseFloat(deal.arv || '0').toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">Spread</div>
                                        <div className="text-sm font-bold text-green-400 flex items-center">
                                            <DollarSign size={12} className="mr-0.5" />
                                            {parseFloat(deal.projectedSpread || '0').toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                        </div>
                    </Link>
                ))}
            </div>

            {deals.length === 0 && (
                <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                    <Home size={48} className="mx-auto text-slate-700 mb-4" />
                    <h3 className="text-lg font-bold text-slate-300">No deals found</h3>
                    <p className="text-slate-500">Add a deal to start analyzing.</p>
                </div>
            )}

            {/* Add Deal Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-100">Add New Deal</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateDeal} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Associated Lead</label>
                                <select
                                    required
                                    value={newDeal.leadId}
                                    onChange={e => setNewDeal({ ...newDeal, leadId: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                >
                                    <option value="">Select a lead...</option>
                                    {leads.map(lead => (
                                        <option key={lead.id} value={lead.id}>
                                            {lead.firstName} {lead.lastName} ({lead.address || lead.email || 'No address'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Address</label>
                                <input
                                    required
                                    type="text"
                                    value={newDeal.address}
                                    onChange={e => setNewDeal({ ...newDeal, address: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">City</label>
                                    <input
                                        required
                                        type="text"
                                        value={newDeal.city}
                                        onChange={e => setNewDeal({ ...newDeal, city: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">State</label>
                                    <input
                                        required
                                        type="text"
                                        value={newDeal.state}
                                        onChange={e => setNewDeal({ ...newDeal, state: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Zip</label>
                                    <input
                                        required
                                        type="text"
                                        value={newDeal.zip}
                                        onChange={e => setNewDeal({ ...newDeal, zip: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Est. ARV</label>
                                    <input
                                        type="number"
                                        value={newDeal.arv}
                                        onChange={e => setNewDeal({ ...newDeal, arv: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Est. Repairs</label>
                                    <input
                                        type="number"
                                        value={newDeal.repairCost}
                                        onChange={e => setNewDeal({ ...newDeal, repairCost: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                    />
                                </div>
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
                                    Create Deal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DataImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                endpoint="/api/deals/import"
                onSuccess={fetchDeals}
                title="Import Deals"
                templateFields={['leadId', 'address', 'city', 'state', 'zip']}
            />
        </div>
    );
};

export default Deals;
