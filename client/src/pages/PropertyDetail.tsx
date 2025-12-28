import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Property } from '@/types';
import axios from 'axios';
import { MapPin, DollarSign, Home, Save, ArrowLeft, FileText, Download } from 'lucide-react';
import { Link } from 'wouter';

const PropertyDetail = () => {
    const [, params] = useRoute('/properties/:id');
    const id = params?.id;
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [formData, setFormData] = useState<Partial<Property>>({});

    useEffect(() => {
        if (id) fetchProperty();
    }, [id]);

    const fetchProperty = async () => {
        try {
            const res = await axios.get(`/ properties / ${id} `);
            setProperty(res.data);
            setFormData(res.data);
        } catch (error) {
            console.error('Error fetching property:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const res = await axios.put(`/ properties / ${id} `, formData);
            setProperty(res.data);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating property:', error);
        }
    };

    const handleGenerateContract = async () => {
        try {
            const res = await axios.post('/contracts/generate/assignment', {
                propertyId: property?.id,
                assigneeName: 'Investor One, LLC', // Placeholder or form input
                assignmentFee: parseFloat(formData.assignmentFee as string || '0')
            }, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Assignment_${property?.address}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error generating contract:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading property details...</div>;
    if (!property) return <div className="p-8 text-center text-slate-400">Property not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
                <Link href="/properties" className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-100">{property.address}</h1>
                    <div className="flex items-center text-slate-400 text-sm">
                        <MapPin size={14} className="mr-1" />
                        {property.city}, {property.state} {property.zip}
                    </div>
                </div>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={`flex items - center px - 4 py - 2 rounded - lg font - medium transition - colors ${isEditing
                            ? 'bg-green-600 hover:bg-green-500 text-white'
                            : 'bg-teal-600 hover:bg-teal-500 text-white'
                        } `}
                >
                    <Save size={18} className="mr-2" />
                    {isEditing ? 'Save Changes' : 'Edit Property'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Photos Placeholder */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl h-64 flex items-center justify-center text-slate-600 relative overflow-hidden group">
                        <Home size={64} />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white font-medium">Manage Photos (Coming Soon)</span>
                        </div>
                    </div>

                    {/* Property Details Form */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-slate-100 mb-4 border-b border-slate-800 pb-2">Property Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1 uppercase font-bold">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1 uppercase font-bold">Status</label>
                                <select
                                    name="status"
                                    value={formData.status || 'Analyzing'}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 disabled:opacity-50"
                                >
                                    <option>Analyzing</option>
                                    <option>Offer Sent</option>
                                    <option>Under Contract</option>
                                    <option>Closed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1 uppercase font-bold">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1 uppercase font-bold">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 disabled:opacity-50"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs text-slate-500 mb-1 uppercase font-bold">Notes</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    rows={4}
                                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 disabled:opacity-50"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financials Side Panel */}
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center">
                            <DollarSign className="mr-2 text-teal-500" size={20} />
                            Financial Analysis
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1 uppercase font-bold">ARV (After Repair Value)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-slate-500">$</span>
                                    <input
                                        type="number"
                                        name="arv"
                                        value={formData.arv || ''}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full bg-slate-950 border border-slate-800 rounded pl-7 pr-3 py-2 text-slate-200 focus:border-teal-500 disabled:opacity-50 font-mono"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1 uppercase font-bold">Repair Estimate</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-slate-500">$</span>
                                    <input
                                        type="number"
                                        name="repairCost"
                                        value={formData.repairCost || ''}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full bg-slate-950 border border-slate-800 rounded pl-7 pr-3 py-2 text-slate-200 focus:border-teal-500 disabled:opacity-50 font-mono"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1 uppercase font-bold">MAO (Max Allowable Offer)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-slate-500">$</span>
                                    <input
                                        type="number"
                                        name="mao"
                                        value={formData.mao || ''}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full bg-slate-950 border border-slate-800 rounded pl-7 pr-3 py-2 text-slate-200 focus:border-teal-500 disabled:opacity-50 font-mono"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-800">
                                <label className="block text-xs text-slate-500 mb-1 uppercase font-bold">Assignment Fee Goal</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-slate-500">$</span>
                                    <input
                                        type="number"
                                        name="assignmentFee"
                                        value={formData.assignmentFee || ''}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full bg-slate-950 border border-slate-800 rounded pl-7 pr-3 py-2 text-teal-400 font-bold focus:border-teal-500 disabled:opacity-50 font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contracts Section */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center">
                            <FileText className="mr-2 text-teal-500" size={20} />
                            Contracts
                        </h3>
                        <div className="space-y-3">
                            <button
                                onClick={handleGenerateContract}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-lg flex items-center justify-center transition-colors border border-slate-700"
                            >
                                <Download size={18} className="mr-2" />
                                Generate Assignment (PDF)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetail;
