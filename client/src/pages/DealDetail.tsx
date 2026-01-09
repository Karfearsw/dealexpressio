import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Property, DealActivity, Lead } from '@/types';
import axios from 'axios';
import { 
    MapPin, DollarSign, Home, Save, ArrowLeft, FileText, Download, 
    Calendar, User, CheckCircle, Clock, Phone, Mail, TrendingUp,
    Layout, Activity, Edit2, Plus
} from 'lucide-react';
import { Link } from 'wouter';

const DealDetail = () => {
    const [, params] = useRoute('/deals/:id');
    const id = params?.id;
    const [property, setProperty] = useState<(Property & { lead?: Lead }) | null>(null);
    const [activities, setActivities] = useState<DealActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'financials' | 'activity'>('details');
    
    // Form state
    const [formData, setFormData] = useState<Partial<Property>>({});

    useEffect(() => {
        if (id) {
            fetchProperty();
            fetchActivities();
        }
    }, [id]);

    const fetchProperty = async () => {
        try {
            const res = await axios.get(`/deals/${id}`);
            setProperty(res.data);
            setFormData(res.data);
        } catch (error) {
            console.error('Error fetching property:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchActivities = async () => {
        try {
            const res = await axios.get(`/deals/${id}/activities`);
            setActivities(res.data);
        } catch (error) {
            console.error('Error fetching activities:', error);
        }
    };

    const handleSave = async () => {
        try {
            const res = await axios.put(`/deals/${id}`, formData);
            setProperty({ ...property, ...res.data }); // Keep lead info
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating property:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMotivationChange = (factor: string) => {
        const current = formData.motivationDetails || { factors: [], score: 0 };
        const exists = current.factors.includes(factor);
        let newFactors = exists 
            ? current.factors.filter(f => f !== factor)
            : [...current.factors, factor];
        
        // Simple scoring logic
        let score = 0;
        if (newFactors.includes('Vacant Property')) score += 25;
        if (newFactors.includes('Out of State Owner')) score += 20;
        if (newFactors.includes('Tax Delinquent')) score += 30;
        if (newFactors.includes('Quick Sale Requested')) score += 17;

        setFormData({
            ...formData,
            motivationDetails: {
                factors: newFactors,
                score
            }
        });
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading deal details...</div>;
    if (!property) return <div className="p-8 text-center text-slate-400">Deal not found</div>;

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <Link href="/deals" className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center space-x-2 text-sm text-slate-500 mb-1">
                            <span>Opportunities</span>
                            <span>/</span>
                            <span>{property.status}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-100">{property.address}</h1>
                        <div className="flex items-center text-slate-400 text-sm">
                            <MapPin size={14} className="mr-1" />
                            {property.city}, {property.state} {property.zip}
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium">
                        Run Comps
                    </button>
                    <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium">
                        Generate Offer
                    </button>
                    <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-colors text-sm font-medium flex items-center">
                        <Phone size={16} className="mr-2" />
                        Call Owner
                    </button>
                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                        title={isEditing ? "Save Changes" : "Edit Deal"}
                    >
                        {isEditing ? <CheckCircle size={20} /> : <Edit2 size={20} />}
                    </button>
                </div>
            </div>

            {/* Photo Gallery Placeholder */}
            <div className="grid grid-cols-4 gap-4 h-48">
                <div className="col-span-2 bg-slate-800 rounded-xl overflow-hidden relative group">
                    <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                        <Home size={48} />
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-medium">Exterior</span>
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl overflow-hidden relative group">
                    <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                        <Layout size={32} />
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-medium">Living Room</span>
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl overflow-hidden relative group">
                    <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                        <Layout size={32} />
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-medium">Kitchen</span>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-slate-800">
                <nav className="flex space-x-8">
                    {['details', 'financials', 'activity'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`
                                py-4 px-1 border-b-2 font-medium text-sm transition-colors capitalize
                                ${activeTab === tab 
                                    ? 'border-teal-500 text-teal-500' 
                                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700'}
                            `}
                        >
                            {tab === 'details' ? 'Property Details' : tab === 'financials' ? 'Financial Analysis' : 'Activity Log'}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'details' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Facts & Specs */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-slate-100 mb-4">Property Facts</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Beds</label>
                                        {isEditing ? (
                                            <input 
                                                type="number" 
                                                name="beds" 
                                                value={formData.beds || ''} 
                                                onChange={handleChange}
                                                className="bg-slate-950 border border-slate-800 rounded p-2 text-white w-full"
                                            />
                                        ) : (
                                            <div className="text-slate-200">{property.beds || '-'}</div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Baths</label>
                                        {isEditing ? (
                                            <input 
                                                type="number" 
                                                step="0.5"
                                                name="baths" 
                                                value={formData.baths || ''} 
                                                onChange={handleChange}
                                                className="bg-slate-950 border border-slate-800 rounded p-2 text-white w-full"
                                            />
                                        ) : (
                                            <div className="text-slate-200">{property.baths || '-'}</div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Sqft</label>
                                        {isEditing ? (
                                            <input 
                                                type="number" 
                                                name="sqft" 
                                                value={formData.sqft || ''} 
                                                onChange={handleChange}
                                                className="bg-slate-950 border border-slate-800 rounded p-2 text-white w-full"
                                            />
                                        ) : (
                                            <div className="text-slate-200">{property.sqft ? property.sqft.toLocaleString() : '-'}</div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Year Built</label>
                                        {isEditing ? (
                                            <input 
                                                type="number" 
                                                name="yearBuilt" 
                                                value={formData.yearBuilt || ''} 
                                                onChange={handleChange}
                                                className="bg-slate-950 border border-slate-800 rounded p-2 text-white w-full"
                                            />
                                        ) : (
                                            <div className="text-slate-200">{property.yearBuilt || '-'}</div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Occupancy</label>
                                        {isEditing ? (
                                            <select 
                                                name="occupancyStatus" 
                                                value={formData.occupancyStatus || ''} 
                                                onChange={handleChange}
                                                className="bg-slate-950 border border-slate-800 rounded p-2 text-white w-full"
                                            >
                                                <option value="">Select...</option>
                                                <option value="Vacant">Vacant</option>
                                                <option value="Owner Occupied">Owner Occupied</option>
                                                <option value="Tenant Occupied">Tenant Occupied</option>
                                            </select>
                                        ) : (
                                            <div className="text-slate-200">{property.occupancyStatus || '-'}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-slate-100 mb-4">Motivation Analysis</h3>
                                <div className="flex items-center justify-between mb-6 bg-slate-800/50 p-4 rounded-lg">
                                    <div>
                                        <div className="text-sm text-slate-400">Motivation Score</div>
                                        <div className="text-3xl font-bold text-teal-400">
                                            {formData.motivationDetails?.score || 0}
                                            <span className="text-sm text-slate-500 font-normal ml-2">/ 100</span>
                                        </div>
                                    </div>
                                    <div className="h-12 w-px bg-slate-700"></div>
                                    <div>
                                        <div className="text-sm text-slate-400">Status</div>
                                        <div className="text-lg font-medium text-slate-200">
                                            {(formData.motivationDetails?.score || 0) > 70 ? 'High Motivation' : 
                                             (formData.motivationDetails?.score || 0) > 40 ? 'Moderate' : 'Low Motivation'}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    {[
                                        { label: 'Vacant Property', points: 25 },
                                        { label: 'Out of State Owner', points: 20 },
                                        { label: 'Tax Delinquent', points: 30 },
                                        { label: 'Quick Sale Requested', points: 17 }
                                    ].map((factor) => (
                                        <label key={factor.label} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                                            formData.motivationDetails?.factors.includes(factor.label)
                                                ? 'bg-teal-900/20 border-teal-500/50'
                                                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                        }`}>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    disabled={!isEditing}
                                                    checked={formData.motivationDetails?.factors.includes(factor.label) || false}
                                                    onChange={() => handleMotivationChange(factor.label)}
                                                    className="w-4 h-4 rounded border-slate-700 text-teal-600 focus:ring-teal-500 bg-slate-900"
                                                />
                                                <span className="ml-3 text-slate-200">{factor.label}</span>
                                            </div>
                                            <span className="text-xs font-mono text-teal-500">+{factor.points}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Owner Info Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center">
                                    <User className="mr-2 text-teal-500" size={20} />
                                    Owner Information
                                </h3>
                                {property.lead ? (
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Name</div>
                                            <div className="text-slate-200 font-medium">
                                                {property.lead.firstName} {property.lead.lastName}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Email</div>
                                            <div className="text-slate-200 flex items-center">
                                                <Mail size={14} className="mr-2 text-slate-400" />
                                                {property.lead.email || '-'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Phone</div>
                                            <div className="text-slate-200 flex items-center">
                                                <Phone size={14} className="mr-2 text-slate-400" />
                                                {property.lead.phone || '-'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Mailing Address</div>
                                            <div className="text-slate-200 text-sm">
                                                {/* Assuming mailing address is same as lead address if available, or property address */}
                                                {property.address}<br/>
                                                {property.city}, {property.state} {property.zip}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-slate-500 text-sm">No lead associated with this deal.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'financials' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center">
                                <DollarSign className="mr-2 text-teal-500" size={20} />
                                Valuation
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Purchase Price</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                                        <input
                                            type="number"
                                            name="purchasePrice"
                                            disabled={!isEditing}
                                            value={formData.purchasePrice || ''}
                                            onChange={handleChange}
                                            className="w-full bg-slate-950 border border-slate-800 rounded pl-7 pr-3 py-2 text-slate-200"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">After Repair Value (ARV)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                                        <input
                                            type="number"
                                            name="arv"
                                            disabled={!isEditing}
                                            value={formData.arv || ''}
                                            onChange={handleChange}
                                            className="w-full bg-slate-950 border border-slate-800 rounded pl-7 pr-3 py-2 text-slate-200"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Repair Estimate</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                                        <input
                                            type="number"
                                            name="repairCost"
                                            disabled={!isEditing}
                                            value={formData.repairCost || ''}
                                            onChange={handleChange}
                                            className="w-full bg-slate-950 border border-slate-800 rounded pl-7 pr-3 py-2 text-slate-200"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center">
                                <TrendingUp className="mr-2 text-teal-500" size={20} />
                                ROI Analysis
                            </h3>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Projected Profit</div>
                                        <div className="text-xl font-bold text-green-400">
                                            ${((parseFloat(formData.arv || '0') * 0.7) - parseFloat(formData.repairCost || '0') - parseFloat(formData.purchasePrice || '0')).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </div>
                                        <div className="text-xs text-slate-600 mt-1">Based on 70% Rule</div>
                                    </div>
                                    <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">ROI</div>
                                        <div className="text-xl font-bold text-teal-400">
                                            {formData.purchasePrice && formData.repairCost ? 
                                                Math.round((((parseFloat(formData.arv || '0') * 0.7) - parseFloat(formData.repairCost || '0') - parseFloat(formData.purchasePrice || '0')) / (parseFloat(formData.purchasePrice || '0') + parseFloat(formData.repairCost || '0'))) * 100)
                                            : 0}%
                                        </div>
                                        <div className="text-xs text-slate-600 mt-1">Return on Cash</div>
                                    </div>
                                </div>
                                
                                <div className="border-t border-slate-800 pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-slate-400">Max Allowable Offer (MAO)</span>
                                        <span className="text-sm font-bold text-slate-200">
                                            ${((parseFloat(formData.arv || '0') * 0.7) - parseFloat(formData.repairCost || '0')).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-950 rounded-full h-2">
                                        <div 
                                            className="bg-teal-600 h-2 rounded-full" 
                                            style={{ width: `${Math.min((parseFloat(formData.purchasePrice || '0') / ((parseFloat(formData.arv || '0') * 0.7) - parseFloat(formData.repairCost || '0'))) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center">
                                <Activity className="mr-2 text-teal-500" size={20} />
                                Activity Timeline
                            </h3>
                            
                            <div className="relative border-l-2 border-slate-800 ml-3 space-y-8 pl-8 pb-4">
                                {activities.length > 0 ? activities.map((activity) => (
                                    <div key={activity.id} className="relative">
                                        <div className="absolute -left-[41px] bg-slate-900 p-1">
                                            <div className="bg-teal-600 rounded-full w-4 h-4"></div>
                                        </div>
                                        <div className="mb-1 flex items-center">
                                            <span className="font-bold text-slate-200 mr-2">{activity.stage}</span>
                                            <span className="text-xs text-slate-500">{new Date(activity.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-slate-400 text-sm mb-3">{activity.details}</p>
                                        {activity.nextActions && activity.nextActions.length > 0 && (
                                            <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                                                <div className="text-xs font-bold text-slate-500 uppercase mb-2">Next Actions</div>
                                                <div className="space-y-2">
                                                    {activity.nextActions.map((action, idx) => (
                                                        <div key={idx} className="flex items-center text-sm text-slate-300">
                                                            <div className={`w-4 h-4 rounded border mr-2 flex items-center justify-center ${action.completed ? 'bg-teal-600 border-teal-600' : 'border-slate-600'}`}>
                                                                {action.completed && <CheckCircle size={10} className="text-white" />}
                                                            </div>
                                                            <span className={action.completed ? 'line-through text-slate-500' : ''}>{action.text}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )) : (
                                    <div className="text-slate-500 text-sm italic">No activity recorded yet.</div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-slate-100 mb-4">Current Status</h3>
                                <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 mb-4">
                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Stage</div>
                                    <div className="text-xl font-bold text-teal-400">{property.status}</div>
                                </div>
                                <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Time in Stage</div>
                                    <div className="text-xl font-bold text-slate-200">
                                        {/* Simple calculation for demo - assumes created_at is start of current stage */}
                                        {Math.floor((new Date().getTime() - new Date(property.createdAt).getTime()) / (1000 * 60 * 60 * 24))} Days
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center">
                                <Plus size={18} className="mr-2" />
                                Log Activity
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DealDetail;