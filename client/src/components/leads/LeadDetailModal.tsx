import React, { useState, useEffect } from 'react';
import { Lead, Property } from '@/types';
import axios from 'axios';
import { X, User, Home, MessageSquare, Loader2, MapPin, DollarSign, Plus } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';

interface LeadDetailModalProps {
    lead: Lead;
    isOpen: boolean;
    onClose: () => void;
    onConvertToDeal?: () => void;
}

const ErrorFallback = ({ error, resetErrorBoundary }: any) => {
    return (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            <p className="font-bold mb-1">Something went wrong:</p>
            <pre className="text-sm mb-2 whitespace-pre-wrap">{error.message}</pre>
            <button
                onClick={resetErrorBoundary}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded text-sm transition-colors"
            >
                Try again
            </button>
        </div>
    );
};

const PropertyTab = ({ leadId }: { leadId: number }) => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProperties();
    }, [leadId]);

    const fetchProperties = async () => {
        try {
            // In a real app, you'd filter by leadId on the server
            // For now we fetch all and filter client side as per current API
            const res = await axios.get('/properties');
            const leadProperties = res.data.filter((p: any) => p.leadId === leadId || (p.lead && p.lead.id === leadId));
            setProperties(leadProperties);
        } catch (err) {
            console.error('Error fetching properties:', err);
            setError('Failed to load property data.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-teal-500" /></div>;

    if (error) return (
        <div className="p-4 text-center">
            <p className="text-red-400 mb-2">{error}</p>
            <button onClick={fetchProperties} className="text-sm text-teal-400 hover:underline">Retry</button>
        </div>
    );

    if (properties.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
                <Home className="mx-auto h-12 w-12 text-slate-700 mb-3" />
                <h3 className="text-slate-300 font-medium mb-1">No Properties Found</h3>
                <p className="text-slate-500 text-sm mb-4">This lead doesn't have any associated properties yet.</p>
                <button className="bg-slate-800 hover:bg-slate-700 text-teal-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center mx-auto">
                    <Plus size={16} className="mr-2" />
                    Add Property
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {properties.map(property => (
                <div key={property.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h4 className="font-bold text-slate-200 text-lg">{property.address}</h4>
                            <div className="flex items-center text-slate-400 text-sm">
                                <MapPin size={14} className="mr-1" />
                                {property.city}, {property.state} {property.zip}
                            </div>
                        </div>
                        <span className="bg-slate-900 text-teal-400 text-xs font-bold px-2 py-1 rounded uppercase">
                            {property.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-900">
                        <div>
                            <div className="text-xs text-slate-500 uppercase">ARV</div>
                            <div className="text-slate-200 font-medium flex items-center">
                                <DollarSign size={14} className="text-slate-500" />
                                {parseFloat(property.arv || '0').toLocaleString()}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500 uppercase">Repairs</div>
                            <div className="text-slate-200 font-medium flex items-center">
                                <DollarSign size={14} className="text-slate-500" />
                                {parseFloat(property.repairCost || '0').toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, isOpen, onClose, onConvertToDeal }) => {
    const [activeTab, setActiveTab] = useState<'details' | 'property' | 'communication'>('details');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-900">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-100">{lead.firstName} {lead.lastName}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-slate-400">{lead.email}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-sm text-slate-400">{lead.phone}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {onConvertToDeal && (
                            <button
                                onClick={onConvertToDeal}
                                className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                            >
                                Convert to Deal
                            </button>
                        )}
                        <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-800 bg-slate-950/50 px-6">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'details' ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        <User size={16} /> Details
                    </button>
                    <button
                        onClick={() => setActiveTab('property')}
                        className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'property' ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        <Home size={16} /> Property
                    </button>
                    <button
                        onClick={() => setActiveTab('communication')}
                        className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'communication' ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        <MessageSquare size={16} /> Communication
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 bg-slate-900">
                    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => setActiveTab('details')}>
                        {activeTab === 'details' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                                        <div className="mt-1 text-slate-200">{lead.status}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Source</label>
                                        <div className="mt-1 text-slate-200">{lead.source}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Created At</label>
                                        <div className="mt-1 text-slate-200">{new Date(lead.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Last Contact</label>
                                        <div className="mt-1 text-slate-200">Never</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'property' && (
                            <PropertyTab leadId={lead.id} />
                        )}

                        {activeTab === 'communication' && (
                            <div className="text-center py-12 text-slate-500">
                                <MessageSquare className="mx-auto h-12 w-12 mb-3 opacity-20" />
                                <p>Communication history coming soon.</p>
                            </div>
                        )}
                    </ErrorBoundary>
                </div>

            </div>
        </div>
    );
};

export default LeadDetailModal;
