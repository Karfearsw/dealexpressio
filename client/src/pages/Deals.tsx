import React, { useState, useEffect } from 'react';
import { Deal, Lead, DEAL_STAGES } from '@/types';
import axios from 'axios';
import { MapPin, DollarSign, Home, Plus, X, Upload, Download, Filter, Search, Building, Bed, Bath, Square, FileText, Trash2, Eye } from 'lucide-react';
import DataImportModal from '@/components/common/DataImportModal';
import { Link } from 'wouter';

const PROPERTY_TYPES = ['Single Family', 'Multi-Family', 'Duplex', 'Triplex', 'Fourplex', 'Townhouse', 'Condo', 'Mobile Home', 'Land', 'Commercial'];
const OCCUPANCY_OPTIONS = ['Owner Occupied', 'Tenant Occupied', 'Vacant'];
const CONDITION_OPTIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Needs Rehab'];
const MOTIVATION_OPTIONS = ['High', 'Medium', 'Low'];

interface DealsProps { }

const Deals: React.FC<DealsProps> = () => {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [, setBuyers] = useState<any[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'pipeline'>('grid');
    
    const [newDeal, setNewDeal] = useState({
        leadId: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        county: '',
        propertyType: 'Single Family',
        bedrooms: '',
        bathrooms: '',
        squareFeet: '',
        lotSize: '',
        yearBuilt: '',
        arv: '',
        repairs: '',
        purchasePrice: '',
        assignmentFee: '',
        sellerMotivation: 'Medium',
        occupancy: 'Owner Occupied',
        condition: 'Fair',
        notes: '',
        status: 'Analyzing'
    });

    useEffect(() => {
        fetchDeals();
        fetchLeads();
        fetchBuyers();
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

    const fetchLeads = async () => {
        try {
            const res = await axios.get('/leads');
            setLeads(res.data);
        } catch (error) {
            console.error('Error fetching leads:', error);
        }
    };

    const fetchBuyers = async () => {
        try {
            const res = await axios.get('/buyers');
            setBuyers(res.data);
        } catch (error) {
            console.error('Error fetching buyers:', error);
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

    const handleCreateDeal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post('/deals', {
                ...newDeal,
                leadId: newDeal.leadId ? parseInt(newDeal.leadId) : null,
                bedrooms: newDeal.bedrooms ? parseInt(newDeal.bedrooms) : null,
                bathrooms: newDeal.bathrooms ? parseInt(newDeal.bathrooms) : null,
                squareFeet: newDeal.squareFeet ? parseInt(newDeal.squareFeet) : null,
                yearBuilt: newDeal.yearBuilt ? parseInt(newDeal.yearBuilt) : null
            });
            setDeals(prev => [res.data, ...prev]);
            setShowModal(false);
            resetNewDeal();
        } catch (error) {
            console.error('Error creating deal:', error);
        }
    };

    const handleUpdateDeal = async (dealId: number, updates: Partial<Deal>) => {
        try {
            const res = await axios.patch(`/deals/${dealId}`, updates);
            setDeals(prev => prev.map(d => d.id === dealId ? res.data : d));
            if (selectedDeal?.id === dealId) {
                setSelectedDeal(res.data);
            }
        } catch (error) {
            console.error('Error updating deal:', error);
        }
    };

    const handleDeleteDeal = async (dealId: number) => {
        if (!confirm('Are you sure you want to delete this deal?')) return;
        try {
            await axios.delete(`/deals/${dealId}`);
            setDeals(prev => prev.filter(d => d.id !== dealId));
            setShowDetailModal(false);
        } catch (error) {
            console.error('Error deleting deal:', error);
        }
    };

    const resetNewDeal = () => {
        setNewDeal({
            leadId: '',
            address: '',
            city: '',
            state: '',
            zip: '',
            county: '',
            propertyType: 'Single Family',
            bedrooms: '',
            bathrooms: '',
            squareFeet: '',
            lotSize: '',
            yearBuilt: '',
            arv: '',
            repairs: '',
            purchasePrice: '',
            assignmentFee: '',
            sellerMotivation: 'Medium',
            occupancy: 'Owner Occupied',
            condition: 'Fair',
            notes: '',
            status: 'Analyzing'
        });
    };

    const calculateMAO = (arv: string, repairs: string) => {
        const arvNum = parseFloat(arv) || 0;
        const repairsNum = parseFloat(repairs) || 0;
        return (arvNum * 0.7) - repairsNum;
    };


    const getStatusColor = (status: string | null) => {
        switch (status) {
            case 'Under Contract': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'Closed': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'Lost': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const filteredDeals = deals.filter(deal => {
        const matchesStatus = filterStatus === 'all' || deal.status === filterStatus;
        const matchesSearch = deal.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            deal.city?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const dealsByStatus = DEAL_STAGES.reduce((acc, stage) => {
        acc[stage] = filteredDeals.filter(d => d.status === stage);
        return acc;
    }, {} as Record<string, Deal[]>);

    if (loading) return <div className="p-8 text-center text-slate-400">Loading deals...</div>;

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Deals Pipeline</h1>
                    <p className="text-slate-400">Track and analyze wholesale deals.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search deals..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-teal-500 outline-none w-48"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-sm focus:border-teal-500 outline-none"
                    >
                        <option value="all">All Status</option>
                        {DEAL_STAGES.map(stage => (
                            <option key={stage} value={stage}>{stage}</option>
                        ))}
                    </select>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 flex">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Building size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('pipeline')}
                            className={`p-2 rounded transition-colors ${viewMode === 'pipeline' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Filter size={18} />
                        </button>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 flex">
                        <button onClick={() => setShowImportModal(true)} className="p-2 text-slate-400 hover:text-white transition-colors" title="Import">
                            <Upload size={18} />
                        </button>
                        <button onClick={handleExport} className="p-2 text-slate-400 hover:text-white transition-colors" title="Export">
                            <Download size={18} />
                        </button>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg flex items-center font-medium transition-colors"
                    >
                        <Plus size={18} className="mr-2" />
                        Add Deal
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {DEAL_STAGES.map(stage => (
                    <div key={stage} className={`bg-slate-900 border border-slate-800 rounded-xl p-4 ${dealsByStatus[stage]?.length > 0 ? 'border-l-2 border-l-teal-500' : ''}`}>
                        <div className="text-2xl font-bold text-slate-100">{dealsByStatus[stage]?.length || 0}</div>
                        <div className="text-xs text-slate-500">{stage}</div>
                    </div>
                ))}
            </div>

            {/* Pipeline View */}
            {viewMode === 'pipeline' ? (
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {DEAL_STAGES.map(stage => (
                        <div key={stage} className="min-w-[280px] flex-shrink-0">
                            <div className={`rounded-t-lg px-4 py-2 font-medium text-sm ${getStatusColor(stage)}`}>
                                {stage} ({dealsByStatus[stage]?.length || 0})
                            </div>
                            <div className="bg-slate-900/50 border border-slate-800 border-t-0 rounded-b-lg p-2 space-y-2 min-h-[400px]">
                                {dealsByStatus[stage]?.map(deal => (
                                    <div
                                        key={deal.id}
                                        onClick={() => { setSelectedDeal(deal); setShowDetailModal(true); }}
                                        className="bg-slate-900 border border-slate-800 rounded-lg p-3 cursor-pointer hover:border-teal-500/50 transition-all"
                                    >
                                        <div className="font-medium text-slate-200 text-sm truncate">{deal.address}</div>
                                        <div className="text-xs text-slate-500 mt-1">{deal.city}, {deal.state}</div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-teal-400 text-sm font-medium">
                                                ${deal.purchasePrice ? parseFloat(deal.purchasePrice).toLocaleString() : '0'}
                                            </span>
                                            <span className="text-green-400 text-xs">
                                                +${deal.assignmentFee ? parseFloat(deal.assignmentFee).toLocaleString() : '0'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDeals.map((deal) => (
                        <div
                            key={deal.id}
                            className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-teal-500/30 transition-all group"
                        >
                            <div className="h-40 bg-slate-800 relative overflow-hidden">
                                {deal.propertyImageUrl ? (
                                    <img 
                                        src={deal.propertyImageUrl} 
                                        alt={deal.address}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                                        <Home size={48} />
                                    </div>
                                )}
                                <div className={`absolute top-2 right-2 flex items-center gap-1`}>
                                    <div className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(deal.status)}`}>
                                        {deal.status || 'Analyzing'}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteDeal(deal.id);
                                        }}
                                        className="p-1 bg-slate-900/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-md border border-slate-700 transition-colors"
                                        title="Delete Deal"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent h-16" />
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-slate-100 truncate">{deal.address}</h3>
                                <div className="flex items-center text-slate-400 text-sm mb-3">
                                    <MapPin size={12} className="mr-1" />
                                    {deal.city}, {deal.state} {deal.zip}
                                </div>

                                {/* Property Details */}
                                <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                                    {deal.bedrooms && <span className="flex items-center"><Bed size={12} className="mr-1" />{deal.bedrooms} bd</span>}
                                    {deal.bathrooms && <span className="flex items-center"><Bath size={12} className="mr-1" />{deal.bathrooms} ba</span>}
                                    {deal.squareFeet && <span className="flex items-center"><Square size={12} className="mr-1" />{deal.squareFeet.toLocaleString()} sqft</span>}
                                </div>

                                {/* Financial Summary */}
                                <div className="grid grid-cols-2 gap-3 border-t border-slate-800 pt-3">
                                    <div>
                                        <div className="text-xs text-slate-500">Purchase</div>
                                        <div className="text-sm font-bold text-slate-200 flex items-center">
                                            <DollarSign size={12} className="text-slate-500" />
                                            {deal.purchasePrice ? parseFloat(deal.purchasePrice).toLocaleString() : '0'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500">ARV</div>
                                        <div className="text-sm font-bold text-slate-200 flex items-center">
                                            <DollarSign size={12} className="text-teal-500" />
                                            {deal.arv ? parseFloat(deal.arv).toLocaleString() : '0'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500">Repairs</div>
                                        <div className="text-sm font-bold text-orange-400 flex items-center">
                                            <DollarSign size={12} />
                                            {deal.repairs ? parseFloat(deal.repairs).toLocaleString() : '0'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500">Assignment Fee</div>
                                        <div className="text-sm font-bold text-green-400 flex items-center">
                                            <DollarSign size={12} />
                                            {deal.assignmentFee ? parseFloat(deal.assignmentFee).toLocaleString() : '0'}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
                                    <button
                                        onClick={() => { setSelectedDeal(deal); setShowDetailModal(true); }}
                                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg text-sm flex items-center justify-center transition-colors"
                                    >
                                        <Eye size={14} className="mr-1" /> View
                                    </button>
                                    <Link
                                        href={`/contracts?dealId=${deal.id}`}
                                        className="flex-1 bg-teal-600/20 hover:bg-teal-600/30 text-teal-400 px-3 py-2 rounded-lg text-sm flex items-center justify-center transition-colors"
                                    >
                                        <FileText size={14} className="mr-1" /> Contract
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredDeals.length === 0 && (
                <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                    <Home size={48} className="mx-auto text-slate-700 mb-4" />
                    <h3 className="text-lg font-bold text-slate-300">No deals found</h3>
                    <p className="text-slate-500">Add a deal to start analyzing.</p>
                </div>
            )}

            {/* Add Deal Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-100">Add New Deal</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateDeal} className="space-y-6">
                            {/* Lead Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Link to Lead (Optional)</label>
                                <select
                                    value={newDeal.leadId}
                                    onChange={e => setNewDeal({ ...newDeal, leadId: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                >
                                    <option value="">No lead linked</option>
                                    {leads.map(lead => (
                                        <option key={lead.id} value={lead.id}>
                                            {lead.firstName} {lead.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Property Address */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-teal-400 border-b border-slate-800 pb-2">Property Address</h3>
                                <input
                                    required
                                    type="text"
                                    placeholder="Street Address"
                                    value={newDeal.address}
                                    onChange={e => setNewDeal({ ...newDeal, address: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                />
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <input type="text" placeholder="City" value={newDeal.city} onChange={e => setNewDeal({ ...newDeal, city: e.target.value })} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none" />
                                    <input type="text" placeholder="State" value={newDeal.state} onChange={e => setNewDeal({ ...newDeal, state: e.target.value })} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none" />
                                    <input type="text" placeholder="Zip" value={newDeal.zip} onChange={e => setNewDeal({ ...newDeal, zip: e.target.value })} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none" />
                                    <input type="text" placeholder="County" value={newDeal.county} onChange={e => setNewDeal({ ...newDeal, county: e.target.value })} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none" />
                                </div>
                            </div>

                            {/* Property Details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-teal-400 border-b border-slate-800 pb-2">Property Details</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    <select value={newDeal.propertyType} onChange={e => setNewDeal({ ...newDeal, propertyType: e.target.value })} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none">
                                        {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <input type="number" placeholder="Bedrooms" value={newDeal.bedrooms} onChange={e => setNewDeal({ ...newDeal, bedrooms: e.target.value })} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none" />
                                    <input type="number" placeholder="Bathrooms" value={newDeal.bathrooms} onChange={e => setNewDeal({ ...newDeal, bathrooms: e.target.value })} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none" />
                                    <input type="number" placeholder="Sq Ft" value={newDeal.squareFeet} onChange={e => setNewDeal({ ...newDeal, squareFeet: e.target.value })} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none" />
                                    <input type="text" placeholder="Lot Size" value={newDeal.lotSize} onChange={e => setNewDeal({ ...newDeal, lotSize: e.target.value })} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none" />
                                    <input type="number" placeholder="Year Built" value={newDeal.yearBuilt} onChange={e => setNewDeal({ ...newDeal, yearBuilt: e.target.value })} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none" />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <select value={newDeal.occupancy} onChange={e => setNewDeal({ ...newDeal, occupancy: e.target.value })} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none">
                                        {OCCUPANCY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                    <select value={newDeal.condition} onChange={e => setNewDeal({ ...newDeal, condition: e.target.value })} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none">
                                        {CONDITION_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <select value={newDeal.sellerMotivation} onChange={e => setNewDeal({ ...newDeal, sellerMotivation: e.target.value })} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none">
                                        <option value="">Seller Motivation</option>
                                        {MOTIVATION_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Financials */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-teal-400 border-b border-slate-800 pb-2">Deal Financials</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Purchase Price</label>
                                        <input type="number" value={newDeal.purchasePrice} onChange={e => setNewDeal({ ...newDeal, purchasePrice: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none" placeholder="$0" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">ARV</label>
                                        <input type="number" value={newDeal.arv} onChange={e => setNewDeal({ ...newDeal, arv: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none" placeholder="$0" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Est. Repairs</label>
                                        <input type="number" value={newDeal.repairs} onChange={e => setNewDeal({ ...newDeal, repairs: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none" placeholder="$0" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Assignment Fee</label>
                                        <input type="number" value={newDeal.assignmentFee} onChange={e => setNewDeal({ ...newDeal, assignmentFee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none" placeholder="$0" />
                                    </div>
                                </div>
                                {/* MAO Calculator */}
                                <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">Maximum Allowable Offer (70% Rule)</span>
                                        <span className="text-lg font-bold text-teal-400">${calculateMAO(newDeal.arv, newDeal.repairs).toLocaleString()}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">(ARV × 0.70) - Repairs</div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Notes</label>
                                <textarea
                                    rows={3}
                                    value={newDeal.notes}
                                    onChange={e => setNewDeal({ ...newDeal, notes: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none resize-none"
                                    placeholder="Deal notes, seller situation, etc..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium transition-colors">Create Deal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Deal Detail Modal */}
            {showDetailModal && selectedDeal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden">
                        <div className="bg-slate-800 h-32 relative overflow-hidden">
                            {selectedDeal.propertyImageUrl ? (
                                <img 
                                    src={selectedDeal.propertyImageUrl} 
                                    alt={selectedDeal.address}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                                    <Home size={64} />
                                </div>
                            )}
                            <button onClick={() => setShowDetailModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-900/50 rounded-full p-2">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-100">{selectedDeal.address}</h2>
                                    <p className="text-slate-400">{selectedDeal.city}, {selectedDeal.state} {selectedDeal.zip}</p>
                                </div>
                                <select
                                    value={selectedDeal.status || 'Analyzing'}
                                    onChange={e => handleUpdateDeal(selectedDeal.id, { status: e.target.value })}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(selectedDeal.status)} bg-transparent outline-none`}
                                >
                                    {DEAL_STAGES.map(stage => (
                                        <option key={stage} value={stage} className="bg-slate-900 text-slate-200">{stage}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Property Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-slate-950 rounded-lg p-3">
                                    <div className="text-xs text-slate-500">Bedrooms</div>
                                    <div className="text-lg font-bold text-slate-200">{selectedDeal.bedrooms || '-'}</div>
                                </div>
                                <div className="bg-slate-950 rounded-lg p-3">
                                    <div className="text-xs text-slate-500">Bathrooms</div>
                                    <div className="text-lg font-bold text-slate-200">{selectedDeal.bathrooms || '-'}</div>
                                </div>
                                <div className="bg-slate-950 rounded-lg p-3">
                                    <div className="text-xs text-slate-500">Sq Feet</div>
                                    <div className="text-lg font-bold text-slate-200">{selectedDeal.squareFeet?.toLocaleString() || '-'}</div>
                                </div>
                                <div className="bg-slate-950 rounded-lg p-3">
                                    <div className="text-xs text-slate-500">Year Built</div>
                                    <div className="text-lg font-bold text-slate-200">{selectedDeal.yearBuilt || '-'}</div>
                                </div>
                            </div>

                            {/* Deal Analysis */}
                            <h3 className="text-sm font-semibold text-teal-400 mb-3">Deal Analysis</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                                    <div className="text-xs text-slate-500">Contract Price</div>
                                    <div className="text-xl font-bold text-slate-200">
                                        ${selectedDeal.contractPrice ? parseFloat(String(selectedDeal.contractPrice)).toLocaleString() : '0'}
                                    </div>
                                </div>
                                <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                                    <div className="text-xs text-slate-500">Marketed Price</div>
                                    <div className="text-xl font-bold text-teal-400">
                                        ${selectedDeal.marketedPrice ? parseFloat(String(selectedDeal.marketedPrice)).toLocaleString() : '0'}
                                    </div>
                                </div>
                                <div className="bg-slate-950 rounded-lg p-3 border border-green-500/30">
                                    <div className="text-xs text-slate-500">Assignment Fee</div>
                                    <div className="text-xl font-bold text-green-400">
                                        ${(() => {
                                            const marketed = parseFloat(String(selectedDeal.marketedPrice)) || 0;
                                            const contract = parseFloat(String(selectedDeal.contractPrice)) || 0;
                                            return (marketed - contract).toLocaleString();
                                        })()}
                                    </div>
                                    <div className="text-[10px] text-slate-600">Marketed - Contract Price</div>
                                </div>
                            </div>

                            {/* Expiry Date */}
                            {selectedDeal.expiryDate && (
                                <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4 mb-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm text-slate-400">Contract Expiry Date</div>
                                            <div className="text-xs text-slate-500">Make sure to close before this date</div>
                                        </div>
                                        <div className="text-xl font-bold text-orange-400">
                                            {new Date(selectedDeal.expiryDate).toLocaleDateString('en-US', { 
                                                month: 'short', 
                                                day: 'numeric', 
                                                year: 'numeric' 
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {selectedDeal.notes && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-slate-400 mb-2">Notes</h3>
                                    <p className="text-slate-300 bg-slate-950 rounded-lg p-3 whitespace-pre-wrap">{selectedDeal.notes}</p>
                                </div>
                            )}

                            {/* Contract File */}
                            {selectedDeal.contractFileUrl && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-slate-400 mb-2">Signed Contract</h3>
                                    <a 
                                        href={selectedDeal.contractFileUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300"
                                    >
                                        <FileText size={16} />
                                        View Contract Document
                                    </a>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                                <button
                                    onClick={() => handleDeleteDeal(selectedDeal.id)}
                                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg flex items-center transition-colors"
                                >
                                    <Trash2 size={18} className="mr-2" /> Delete Deal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <DataImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                endpoint="/deals/import"
                onSuccess={fetchDeals}
                title="Import Deals"
                templateFields={['address', 'city', 'state', 'zip', 'purchasePrice', 'arv', 'repairs']}
            />
        </div>
    );
};

export default Deals;
