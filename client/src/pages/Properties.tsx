import React, { useState, useEffect } from 'react';
import { Property } from '@/types';
import axios from 'axios';
import { MapPin, DollarSign, Home, Plus } from 'lucide-react';

import { Link } from 'wouter';

interface PropertiesProps { }

const Properties: React.FC<PropertiesProps> = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProperties();
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

    if (loading) return <div className="p-8 text-center text-slate-400">Loading properties...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Properties</h1>
                    <p className="text-slate-400">Track and analyze potential deals.</p>
                </div>
                <button className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg flex items-center font-medium transition-colors">
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
        </div>
    );
};

export default Properties;
