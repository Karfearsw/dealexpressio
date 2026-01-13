import React, { useState } from 'react';
import { X, Upload, Loader2, Home, Calendar, DollarSign, FileText } from 'lucide-react';
import { Lead } from '@/types';
import axios from 'axios';

interface ContractDetailsModalProps {
    lead: Lead;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (dealId: number) => void;
}

interface PropertyData {
    bedrooms: number | null;
    bathrooms: number | null;
    squareFeet: number | null;
    yearBuilt: number | null;
    propertyImageUrl: string | null;
}

const ContractDetailsModal: React.FC<ContractDetailsModalProps> = ({ lead, isOpen, onClose, onSuccess }) => {
    const [contractPrice, setContractPrice] = useState('');
    const [marketedPrice, setMarketedPrice] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [notes, setNotes] = useState('');
    const [contractFile, setContractFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetchingProperty, setFetchingProperty] = useState(false);
    const [propertyData, setPropertyData] = useState<PropertyData>({
        bedrooms: null,
        bathrooms: null,
        squareFeet: null,
        yearBuilt: null,
        propertyImageUrl: null
    });

    const calculateAssignmentFee = () => {
        const contract = parseFloat(contractPrice) || 0;
        const marketed = parseFloat(marketedPrice) || 0;
        return marketed - contract;
    };

    const fetchPropertyData = async () => {
        if (!lead.address) return;
        
        setFetchingProperty(true);
        try {
            const fullAddress = `${lead.address}, ${lead.city || ''}, ${lead.state || ''} ${lead.zip || ''}`;
            const res = await axios.post('/api/property-lookup', { address: fullAddress });
            if (res.data) {
                setPropertyData({
                    bedrooms: res.data.bedrooms || null,
                    bathrooms: res.data.bathrooms || null,
                    squareFeet: res.data.squareFeet || null,
                    yearBuilt: res.data.yearBuilt || null,
                    propertyImageUrl: res.data.propertyImageUrl || null
                });
            }
        } catch (error) {
            console.log('Property lookup not available, continuing with manual entry');
        } finally {
            setFetchingProperty(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contractPrice || !expiryDate) {
            alert('Please fill in Contract Price and Expiry Date');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('leadId', lead.id.toString());
            formData.append('contractPrice', contractPrice);
            formData.append('marketedPrice', marketedPrice);
            formData.append('expiryDate', expiryDate);
            formData.append('notes', notes);
            formData.append('assignmentFee', calculateAssignmentFee().toString());
            
            if (propertyData.bedrooms) formData.append('bedrooms', propertyData.bedrooms.toString());
            if (propertyData.bathrooms) formData.append('bathrooms', propertyData.bathrooms.toString());
            if (propertyData.squareFeet) formData.append('squareFeet', propertyData.squareFeet.toString());
            if (propertyData.yearBuilt) formData.append('yearBuilt', propertyData.yearBuilt.toString());
            if (propertyData.propertyImageUrl) formData.append('propertyImageUrl', propertyData.propertyImageUrl);
            
            if (contractFile) {
                formData.append('contractFile', contractFile);
            }

            const res = await axios.post('/leads/' + lead.id + '/convert-with-contract', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            onSuccess(res.data.deal.id);
            onClose();
        } catch (error) {
            console.error('Error converting lead:', error);
            alert('Failed to convert lead to deal');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-slate-800">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Contract Details</h2>
                        <p className="text-sm text-slate-400 mt-1">Enter contract information to create the deal</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-5">
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <div className="flex items-center gap-3 mb-2">
                            <Home size={18} className="text-teal-400" />
                            <span className="font-medium text-slate-200">Property</span>
                        </div>
                        <p className="text-slate-300">{lead.address || 'No address'}</p>
                        <p className="text-sm text-slate-500">{lead.city}, {lead.state} {lead.zip}</p>
                        
                        {lead.address && (
                            <button
                                type="button"
                                onClick={fetchPropertyData}
                                disabled={fetchingProperty}
                                className="mt-3 text-sm text-teal-400 hover:text-teal-300 flex items-center gap-2"
                            >
                                {fetchingProperty ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Looking up property details...
                                    </>
                                ) : (
                                    'Fetch property details from public records'
                                )}
                            </button>
                        )}

                        {(propertyData.bedrooms || propertyData.bathrooms || propertyData.squareFeet || propertyData.yearBuilt) && (
                            <div className="mt-3 grid grid-cols-4 gap-3 text-center">
                                <div className="bg-slate-900 rounded-lg p-2">
                                    <div className="text-lg font-bold text-slate-200">{propertyData.bedrooms || '-'}</div>
                                    <div className="text-xs text-slate-500">Beds</div>
                                </div>
                                <div className="bg-slate-900 rounded-lg p-2">
                                    <div className="text-lg font-bold text-slate-200">{propertyData.bathrooms || '-'}</div>
                                    <div className="text-xs text-slate-500">Baths</div>
                                </div>
                                <div className="bg-slate-900 rounded-lg p-2">
                                    <div className="text-lg font-bold text-slate-200">{propertyData.squareFeet?.toLocaleString() || '-'}</div>
                                    <div className="text-xs text-slate-500">Sq Ft</div>
                                </div>
                                <div className="bg-slate-900 rounded-lg p-2">
                                    <div className="text-lg font-bold text-slate-200">{propertyData.yearBuilt || '-'}</div>
                                    <div className="text-xs text-slate-500">Built</div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">
                                <DollarSign size={14} className="inline mr-1" />
                                Contract Price *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                <input
                                    type="number"
                                    required
                                    value={contractPrice}
                                    onChange={e => setContractPrice(e.target.value)}
                                    className="w-full pl-7 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:border-teal-500 outline-none"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">
                                <Calendar size={14} className="inline mr-1" />
                                Expiry Date *
                            </label>
                            <input
                                type="date"
                                required
                                value={expiryDate}
                                onChange={e => setExpiryDate(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:border-teal-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">
                            <DollarSign size={14} className="inline mr-1" />
                            Marketed Price
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                            <input
                                type="number"
                                value={marketedPrice}
                                onChange={e => setMarketedPrice(e.target.value)}
                                className="w-full pl-7 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:border-teal-500 outline-none"
                                placeholder="0"
                            />
                        </div>
                        {contractPrice && marketedPrice && (
                            <div className="mt-2 text-sm">
                                <span className="text-slate-500">Assignment Fee: </span>
                                <span className={`font-bold ${calculateAssignmentFee() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    ${calculateAssignmentFee().toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">
                            <FileText size={14} className="inline mr-1" />
                            Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:border-teal-500 outline-none resize-none"
                            placeholder="Add any notes about this contract..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">
                            <Upload size={14} className="inline mr-1" />
                            Upload Signed Contract (Optional)
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                onChange={e => setContractFile(e.target.files?.[0] || null)}
                                className="hidden"
                                id="contract-upload"
                            />
                            <label
                                htmlFor="contract-upload"
                                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-950 border border-dashed border-slate-700 rounded-lg text-slate-400 hover:border-teal-500 hover:text-teal-400 cursor-pointer transition-colors"
                            >
                                <Upload size={18} />
                                {contractFile ? contractFile.name : 'Click to upload contract file'}
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 text-slate-300 hover:text-white border border-slate-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Creating Deal...
                                </>
                            ) : (
                                'Create Deal'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContractDetailsModal;
