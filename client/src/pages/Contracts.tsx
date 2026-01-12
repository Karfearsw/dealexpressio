import React, { useState, useEffect } from 'react';
import { FileText, Download, X, Upload, Trash2, CheckCircle, Clock, AlertCircle, FileUp } from 'lucide-react';
import axios from 'axios';
import { Deal, Contract } from '@/types';

const CONTRACT_TEMPLATES = [
    { id: 'letter_of_intent', name: 'Letter of Intent (LOI)', description: 'Non-binding expression of interest to purchase property', active: true },
    { id: 'purchase_agreement', name: 'Purchase Agreement', description: 'Binding agreement between buyer and seller', active: true },
    { id: 'psa', name: 'Purchase & Sale Agreement', description: 'Standard real estate PSA with contingencies', active: true },
    { id: 'assignment', name: 'Assignment Contract', description: 'Assign your contract rights to end buyer', active: true },
    { id: 'jv_agreement', name: 'JV Agreement', description: 'Joint venture partnership agreement', active: true }
];

const Contracts = () => {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'templates' | 'my_contracts' | 'upload'>('templates');
    
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<typeof CONTRACT_TEMPLATES[0] | null>(null);
    const [generating, setGenerating] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    const [formData, setFormData] = useState({
        dealId: '',
        buyerName: '',
        buyerAddress: '',
        buyerEmail: '',
        buyerPhone: '',
        purchasePrice: '',
        earnestMoney: '',
        closingDate: '',
        inspectionDays: '10',
        financingDays: '21',
        assignmentFee: '',
        jvSplit: '50',
        additionalTerms: ''
    });

    const [uploadData, setUploadData] = useState({
        name: '',
        type: 'purchase_agreement',
        dealId: '',
        file: null as File | null
    });

    useEffect(() => {
        fetchData();
        const params = new URLSearchParams(window.location.search);
        const dealId = params.get('dealId');
        if (dealId) {
            setFormData(prev => ({ ...prev, dealId }));
        }
    }, []);

    const fetchData = async () => {
        try {
            const [contractsRes, dealsRes] = await Promise.all([
                axios.get('/contracts'),
                axios.get('/deals')
            ]);
            setContracts(contractsRes.data || []);
            setDeals(dealsRes.data || []);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const openGenerator = (template: typeof CONTRACT_TEMPLATES[0]) => {
        setSelectedTemplate(template);
        setIsGenerateModalOpen(true);
    };

    const handleDealSelect = (dealId: string) => {
        setFormData(prev => ({ ...prev, dealId }));
        const deal = deals.find(d => d.id === parseInt(dealId));
        if (deal) {
            setFormData(prev => ({
                ...prev,
                purchasePrice: deal.purchasePrice || '',
                assignmentFee: deal.assignmentFee || ''
            }));
        }
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTemplate) return;
        
        setGenerating(true);
        try {
            const response = await axios.post(`/contracts/generate/${selectedTemplate.id}`, {
                ...formData,
                dealId: formData.dealId ? parseInt(formData.dealId) : null
            }, { responseType: 'blob' });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${selectedTemplate.name.replace(/\s+/g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            setIsGenerateModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Failed to generate contract", error);
            alert("Failed to generate contract. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadData.file) {
            alert('Please select a file');
            return;
        }

        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('file', uploadData.file);
        formDataUpload.append('name', uploadData.name);
        formDataUpload.append('type', uploadData.type);
        if (uploadData.dealId) {
            formDataUpload.append('dealId', uploadData.dealId);
        }

        try {
            await axios.post('/contracts/upload', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsUploadModalOpen(false);
            setUploadData({ name: '', type: 'purchase_agreement', dealId: '', file: null });
            fetchData();
        } catch (error) {
            console.error("Failed to upload contract", error);
            alert("Failed to upload contract. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteContract = async (contractId: number) => {
        if (!confirm('Delete this contract?')) return;
        try {
            await axios.delete(`/contracts/${contractId}`);
            setContracts(prev => prev.filter(c => c.id !== contractId));
        } catch (error) {
            console.error("Failed to delete contract", error);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'signed': return <CheckCircle className="text-green-400" size={16} />;
            case 'sent': return <Clock className="text-yellow-400" size={16} />;
            case 'expired': return <AlertCircle className="text-red-400" size={16} />;
            default: return <FileText className="text-slate-400" size={16} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'signed': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'sent': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'expired': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'cancelled': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        }
    };

    const getContractTypeName = (type: string) => {
        const template = CONTRACT_TEMPLATES.find(t => t.id === type);
        return template?.name || type;
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Contracts</h1>
                    <p className="text-slate-400">Generate templates or upload your own contracts.</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg flex items-center font-medium transition-colors"
                >
                    <Upload size={18} className="mr-2" />
                    Upload Contract
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-800 pb-4">
                <button
                    onClick={() => setActiveTab('templates')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'templates' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
                >
                    <FileText size={16} className="inline mr-2" />
                    Templates
                </button>
                <button
                    onClick={() => setActiveTab('my_contracts')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'my_contracts' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
                >
                    <FileUp size={16} className="inline mr-2" />
                    My Contracts ({contracts.length})
                </button>
            </div>

            {/* Templates Tab */}
            {activeTab === 'templates' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {CONTRACT_TEMPLATES.map((template) => (
                        <div
                            key={template.id}
                            onClick={() => openGenerator(template)}
                            className={`bg-slate-900 border border-slate-800 rounded-xl p-5 cursor-pointer hover:border-teal-500/50 transition-all group`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className={`p-3 rounded-lg ${template.active ? 'bg-teal-500/20 text-teal-400' : 'bg-slate-800 text-slate-500'}`}>
                                    <FileText size={24} />
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${template.active ? 'bg-teal-500/20 text-teal-400' : 'bg-slate-700 text-slate-500'}`}>
                                    {template.active ? 'Generate' : 'Coming Soon'}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-100 mb-1 group-hover:text-teal-400 transition-colors">{template.name}</h3>
                            <p className="text-sm text-slate-500">{template.description}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* My Contracts Tab */}
            {activeTab === 'my_contracts' && (
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-10 text-slate-500">Loading contracts...</div>
                    ) : contracts.length === 0 ? (
                        <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                            <FileText size={48} className="mx-auto text-slate-700 mb-4" />
                            <h3 className="text-lg font-bold text-slate-300">No contracts yet</h3>
                            <p className="text-slate-500 mb-4">Generate from templates or upload your own contracts.</p>
                            <button
                                onClick={() => setActiveTab('templates')}
                                className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                Browse Templates
                            </button>
                        </div>
                    ) : (
                        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-800/50">
                                    <tr>
                                        <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Contract</th>
                                        <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Type</th>
                                        <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Deal</th>
                                        <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Status</th>
                                        <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Created</th>
                                        <th className="text-right text-xs font-medium text-slate-500 uppercase px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {contracts.map((contract) => {
                                        const deal = deals.find(d => d.id === contract.dealId);
                                        return (
                                            <tr key={contract.id} className="hover:bg-slate-800/30">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center">
                                                        {getStatusIcon(contract.status)}
                                                        <span className="ml-2 text-slate-200 font-medium">{contract.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-400 text-sm">{getContractTypeName(contract.type)}</td>
                                                <td className="px-4 py-3 text-slate-400 text-sm">{deal?.address || '-'}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(contract.status)}`}>
                                                        {contract.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 text-sm">
                                                    {new Date(contract.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {contract.fileUrl && (
                                                            <a
                                                                href={contract.fileUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 text-slate-400 hover:text-teal-400 transition-colors"
                                                            >
                                                                <Download size={16} />
                                                            </a>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteContract(contract.id)}
                                                            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Generate Contract Modal */}
            {isGenerateModalOpen && selectedTemplate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden">
                        <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-100">Generate {selectedTemplate.name}</h3>
                                <p className="text-sm text-slate-400">{selectedTemplate.description}</p>
                            </div>
                            <button onClick={() => setIsGenerateModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleGenerate} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Deal Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Link to Deal (Optional)</label>
                                <select
                                    value={formData.dealId}
                                    onChange={(e) => handleDealSelect(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                                >
                                    <option value="">Select a deal...</option>
                                    {deals.map(deal => (
                                        <option key={deal.id} value={deal.id}>{deal.address} - {deal.city}, {deal.state}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Buyer Information */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-teal-400 border-b border-slate-800 pb-2">Buyer/Assignee Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Full Name / Entity</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.buyerName}
                                            onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                                            placeholder="Buyer Name LLC"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={formData.buyerEmail}
                                            onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                                            placeholder="buyer@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            value={formData.buyerPhone}
                                            onChange={(e) => setFormData({ ...formData, buyerPhone: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                                            placeholder="(555) 123-4567"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Address</label>
                                        <input
                                            type="text"
                                            value={formData.buyerAddress}
                                            onChange={(e) => setFormData({ ...formData, buyerAddress: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                                            placeholder="123 Main St, City, ST"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Deal Terms */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-teal-400 border-b border-slate-800 pb-2">Deal Terms</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Purchase Price ($)</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.purchasePrice}
                                            onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                                            placeholder="150000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Earnest Money ($)</label>
                                        <input
                                            type="number"
                                            value={formData.earnestMoney}
                                            onChange={(e) => setFormData({ ...formData, earnestMoney: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                                            placeholder="1000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Closing Date</label>
                                        <input
                                            type="date"
                                            value={formData.closingDate}
                                            onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Inspection Period (days)</label>
                                        <input
                                            type="number"
                                            value={formData.inspectionDays}
                                            onChange={(e) => setFormData({ ...formData, inspectionDays: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Financing Contingency (days)</label>
                                        <input
                                            type="number"
                                            value={formData.financingDays}
                                            onChange={(e) => setFormData({ ...formData, financingDays: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                                        />
                                    </div>
                                    {(selectedTemplate.id === 'assignment') && (
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Assignment Fee ($)</label>
                                            <input
                                                type="number"
                                                value={formData.assignmentFee}
                                                onChange={(e) => setFormData({ ...formData, assignmentFee: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                                                placeholder="10000"
                                            />
                                        </div>
                                    )}
                                    {(selectedTemplate.id === 'jv_agreement') && (
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">JV Split (%)</label>
                                            <input
                                                type="number"
                                                value={formData.jvSplit}
                                                onChange={(e) => setFormData({ ...formData, jvSplit: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                                                placeholder="50"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Additional Terms */}
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Additional Terms / Special Conditions</label>
                                <textarea
                                    rows={3}
                                    value={formData.additionalTerms}
                                    onChange={(e) => setFormData({ ...formData, additionalTerms: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-teal-500 resize-none"
                                    placeholder="Any special conditions or addendums..."
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={generating}
                                className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                            >
                                {generating ? 'Generating...' : (
                                    <>
                                        <Download size={18} className="mr-2" />
                                        Generate & Download PDF
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Upload Contract Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-slate-800">
                            <h3 className="text-xl font-bold text-slate-100">Upload Contract</h3>
                            <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpload} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Contract Name</label>
                                <input
                                    type="text"
                                    required
                                    value={uploadData.name}
                                    onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                                    placeholder="123 Main St - Purchase Agreement"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Contract Type</label>
                                <select
                                    value={uploadData.type}
                                    onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                                >
                                    {CONTRACT_TEMPLATES.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Link to Deal (Optional)</label>
                                <select
                                    value={uploadData.dealId}
                                    onChange={(e) => setUploadData({ ...uploadData, dealId: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                                >
                                    <option value="">No deal linked</option>
                                    {deals.map(deal => (
                                        <option key={deal.id} value={deal.id}>{deal.address}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">File (PDF, DOC, DOCX)</label>
                                <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-teal-500/50 transition-colors">
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => setUploadData({ ...uploadData, file: e.target.files?.[0] || null })}
                                        className="hidden"
                                        id="contract-file"
                                    />
                                    <label htmlFor="contract-file" className="cursor-pointer">
                                        {uploadData.file ? (
                                            <div className="text-teal-400">
                                                <FileText size={32} className="mx-auto mb-2" />
                                                <span className="text-sm">{uploadData.file.name}</span>
                                            </div>
                                        ) : (
                                            <div className="text-slate-500">
                                                <Upload size={32} className="mx-auto mb-2" />
                                                <span className="text-sm">Click to upload or drag and drop</span>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={uploading || !uploadData.file}
                                className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                            >
                                {uploading ? 'Uploading...' : (
                                    <>
                                        <Upload size={18} className="mr-2" />
                                        Upload Contract
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contracts;
