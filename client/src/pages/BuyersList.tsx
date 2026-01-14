import React, { useState, useEffect, useMemo } from 'react';
import { Users, Search, Plus, Mail, Phone, MapPin, X, Star, Pencil } from 'lucide-react';
import axios from 'axios';

interface Deal {
    id: number;
    address: string;
    notes?: string;
}

const BuyersList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [buyers, setBuyers] = useState<any[]>([]);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBuyer, setEditingBuyer] = useState<any | null>(null);
    const [newBuyer, setNewBuyer] = useState({ name: '', email: '', phone: '', criteria: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [buyersRes, dealsRes] = await Promise.all([
                axios.get('/buyers'),
                axios.get('/deals')
            ]);
            setBuyers(buyersRes.data);
            setDeals(dealsRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBuyers = async () => {
        try {
            const res = await axios.get('/buyers');
            setBuyers(res.data);
        } catch (error) {
            console.error("Failed to fetch buyers", error);
        } finally {
            setLoading(false);
        }
    };

    const buyerMatches = useMemo(() => {
        const matches: Map<number, { id: number; address: string }[]> = new Map();
        
        buyers.forEach(buyer => {
            if (!buyer.criteria) return;
            
            const criteriaWords = buyer.criteria.toLowerCase()
                .split(/[\s,]+/)
                .filter((word: string) => word.length > 2)
                .map((word: string) => word.replace(/[^a-z0-9]/g, ''));
            
            if (criteriaWords.length === 0) return;
            
            const matchingDeals: { id: number; address: string }[] = [];
            
            deals.forEach(deal => {
                if (!deal.notes) return;
                
                const notesLower = deal.notes.toLowerCase();
                const hasMatch = criteriaWords.some((word: string) => notesLower.includes(word));
                
                if (hasMatch) {
                    matchingDeals.push({ id: deal.id, address: deal.address });
                }
            });
            
            if (matchingDeals.length > 0) {
                matches.set(buyer.id, matchingDeals);
            }
        });
        
        return matches;
    }, [buyers, deals]);

    const handleCreateBuyer = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post('/buyers', newBuyer);
            setBuyers(prev => [res.data, ...prev]);
            setShowModal(false);
            setNewBuyer({ name: '', email: '', phone: '', criteria: '' });
        } catch (error) {
            console.error("Failed to create buyer", error);
        }
    };

    const handleEditBuyer = (buyer: any) => {
        setEditingBuyer({ ...buyer });
    };

    const handleUpdateBuyer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBuyer) return;
        try {
            const res = await axios.put(`/buyers/${editingBuyer.id}`, editingBuyer);
            setBuyers(prev => prev.map(b => b.id === editingBuyer.id ? res.data : b));
            setEditingBuyer(null);
        } catch (error) {
            console.error("Failed to update buyer", error);
        }
    };

    const filteredBuyers = buyers.filter(buyer => 
        buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.criteria?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Buyers</h1>
                    <p className="text-slate-400">Manage and segment your qualified buyers.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center shadow-lg shadow-teal-500/20 transition-all active:scale-95"
                >
                    <Plus size={20} className="mr-2" />
                    Add Buyer
                </button>
            </div>

            <div className="flex gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search buyers by name, criteria, or email..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-20 text-slate-500">
                        Loading buyers...
                    </div>
                ) : filteredBuyers.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-slate-500">
                        No buyers found.
                    </div>
                ) : (
                    filteredBuyers.map((buyer) => {
                        const matchingDeals = buyerMatches.get(buyer.id);
                        return (
                            <div key={buyer.id} className={`bg-slate-900 border rounded-xl p-6 hover:border-teal-500/30 transition-all group ${matchingDeals ? 'border-yellow-500/50' : 'border-slate-800'}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-teal-400">
                                        <Users size={24} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {matchingDeals && (
                                            <div className="text-yellow-400" title="Potential deal match">
                                                <Star size={20} fill="currentColor" />
                                            </div>
                                        )}
                                        <div className="text-[10px] font-bold text-teal-500 bg-teal-500/10 px-2 py-1 rounded uppercase tracking-wider">
                                            {buyer.dealsClosed || 0} Deals Closed
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-teal-400 transition-colors">{buyer.name}</h3>
                                    <button
                                        onClick={() => handleEditBuyer(buyer)}
                                        className="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-slate-800 rounded-lg transition-colors"
                                        title="Edit buyer"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                </div>

                                {matchingDeals && (
                                    <div className="mt-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2">
                                        <p className="text-xs text-yellow-400 font-medium">
                                            Potential match to {matchingDeals.map(d => d.address).join(', ')}
                                        </p>
                                    </div>
                                )}

                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center text-sm text-slate-400">
                                        <Mail size={14} className="mr-2 shrink-0" />
                                        <span className="truncate">{buyer.email || 'No email'}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-400">
                                        <Phone size={14} className="mr-2 shrink-0" />
                                        <span>{buyer.phone || 'No phone'}</span>
                                    </div>
                                    <div className="flex items-start text-sm text-slate-400 pt-2 border-t border-slate-800">
                                        <MapPin size={14} className="mr-2 mt-0.5 shrink-0" />
                                        <p className="italic">{buyer.criteria || 'No criteria listed'}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Buyer Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-100">Add New Buyer</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateBuyer} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                                <input
                                    required
                                    type="text"
                                    value={newBuyer.name}
                                    onChange={e => setNewBuyer({ ...newBuyer, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={newBuyer.email}
                                    onChange={e => setNewBuyer({ ...newBuyer, email: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={newBuyer.phone}
                                    onChange={e => setNewBuyer({ ...newBuyer, phone: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Criteria</label>
                                <textarea
                                    value={newBuyer.criteria}
                                    onChange={e => setNewBuyer({ ...newBuyer, criteria: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none h-24 resize-none"
                                    placeholder="e.g. Single family in Orlando, under $200k"
                                />
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
                                    Add Buyer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Buyer Modal */}
            {editingBuyer && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-100">Edit Buyer</h2>
                            <button onClick={() => setEditingBuyer(null)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateBuyer} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                                <input
                                    required
                                    type="text"
                                    value={editingBuyer.name}
                                    onChange={e => setEditingBuyer({ ...editingBuyer, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editingBuyer.email || ''}
                                    onChange={e => setEditingBuyer({ ...editingBuyer, email: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={editingBuyer.phone || ''}
                                    onChange={e => setEditingBuyer({ ...editingBuyer, phone: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Criteria</label>
                                <textarea
                                    value={editingBuyer.criteria || ''}
                                    onChange={e => setEditingBuyer({ ...editingBuyer, criteria: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none h-24 resize-none"
                                    placeholder="e.g. Single family in Orlando, under $200k"
                                />
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingBuyer(null)}
                                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuyersList;
