import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Mail, Phone, MapPin } from 'lucide-react';
import axios from 'axios';

const BuyersList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [buyers, setBuyers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBuyers();
    }, []);

    const fetchBuyers = async () => {
        try {
            const res = await axios.get('/api/buyers');
            setBuyers(res.data);
        } catch (error) {
            console.error("Failed to fetch buyers", error);
        } finally {
            setLoading(false);
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
                    <h1 className="text-2xl font-bold text-slate-100 italic">Buyers List</h1>
                    <p className="text-slate-400">Manage and segment your qualified buyers.</p>
                </div>
                <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center shadow-lg shadow-teal-500/20 transition-all active:scale-95">
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
                    filteredBuyers.map((buyer) => (
                        <div key={buyer.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-teal-500/30 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-teal-400">
                                    <Users size={24} />
                                </div>
                                <div className="text-[10px] font-bold text-teal-500 bg-teal-500/10 px-2 py-1 rounded uppercase tracking-wider">
                                    {buyer.dealsClosed || 0} Deals Closed
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-100 group-hover:text-teal-400 transition-colors">{buyer.name}</h3>

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
                    ))
                )}
            </div>
        </div>
    );
};

export default BuyersList;
