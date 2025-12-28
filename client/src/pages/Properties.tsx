import React, { useState, useEffect } from 'react';
import { Property, Lead } from '@/types';
import axios from 'axios';
import { MapPin, DollarSign, Home, Plus, X } from 'lucide-react';

import { Link } from 'wouter';

interface PropertiesProps { }

const Properties: React.FC<PropertiesProps> = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [newProperty, setNewProperty] = useState({
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
        fetchProperties();
        fetchLeads();
    }, []);

    const fetchProperties = async () => {
        try {
            const res = await axios.get('/properties');
            setProperties(res.data);
        } catch (error) {
            console.error('Error fetching properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLeads = async () => {
        try {
            const res = await axios.get('/leads');
            setLeads(res.data);
        } catch (error) {
            console.error('Error fetching leads for property creation:', error);
        }
    };

    const handleCreateProperty = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post('/properties', {
                ...newProperty,
                leadId: parseInt(newProperty.leadId)
            });
            setProperties(prev => [res.data, ...prev]);
            setShowModal(false);
            setNewProperty({
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
            console.error('Error creating property:', error);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading properties...</div>;

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Properties</h1>
                    <p className="text-slate-400">Track and analyze potential deals.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg flex items-center font-medium transition-colors"
                >
                    <Plus size={20} className="mr-2" />
                    Add Property
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                    <Link 
                        key={property.id} 
                        href={`/properties/${property.id}`}
                        className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-teal-500/30 transition-all block"
                    >
                        <div className="h-48 bg-slate-800 relative">
                                {/* Placeholder for photo */}
                                <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                                    <Home size={48} />
                                </div>
                                <div className="absolute top-2 right-2 bg-slate-950/80 px-2 py-1 rounded text-xs font-bold text-teal-400">
                                    {property.status || 'Analyzing'}
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-slate-100 mb-1 truncate">{property.address}</h3>
                                <div className="flex items-center text-slate-400 text-sm mb-4">
                                    <MapPin size={14} className="mr-1" />
                                    {property.city}, {property.state} {property.zip}
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">ARV</div>
                                        <div className="text-sm font-bold text-slate-200 flex items-center">
                                            <DollarSign size={12} className="mr-0.5 text-teal-500" />
                                            {parseFloat(property.arv || '0').toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">Spread</div>
                                        <div className="text-sm font-bold text-green-400 flex items-center">
                                            <DollarSign size={12} className="mr-0.5" />
                                            {parseFloat(property.projectedSpread || '0').toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                        </div>
                    </Link>
                ))}
            </div>

            {properties.length === 0 && (
                <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                    <Home size={48} className="mx-auto text-slate-700 mb-4" />
                    <h3 className="text-lg font-bold text-slate-300">No properties found</h3>
                    <p className="text-slate-500">Add a property to start analyzing deals.</p>
                </div>
            )}

            {/* Add Property Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-100">Add New Property</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateProperty} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Associated Lead</label>
                                <select
                                    required
                                    value={newProperty.leadId}
                                    onChange={e => setNewProperty({ ...newProperty, leadId: e.target.value })}
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
                                    value={newProperty.address}
                                    onChange={e => setNewProperty({ ...newProperty, address: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">City</label>
                                    <input
                                        required
                                        type="text"
                                        value={newProperty.city}
                                        onChange={e => setNewProperty({ ...newProperty, city: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">State</label>
                                    <input
                                        required
                                        type="text"
                                        value={newProperty.state}
                                        onChange={e => setNewProperty({ ...newProperty, state: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Zip</label>
                                    <input
                                        required
                                        type="text"
                                        value={newProperty.zip}
                                        onChange={e => setNewProperty({ ...newProperty, zip: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Est. ARV</label>
                                    <input
                                        type="number"
                                        value={newProperty.arv}
                                        onChange={e => setNewProperty({ ...newProperty, arv: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Est. Repairs</label>
                                    <input
                                        type="number"
                                        value={newProperty.repairCost}
                                        onChange={e => setNewProperty({ ...newProperty, repairCost: e.target.value })}
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
                                    Create Property
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Properties;
