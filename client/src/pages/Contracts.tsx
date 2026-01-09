import React, { useState, useEffect } from 'react';
import { FileText, Download, X } from 'lucide-react';
import axios from 'axios';

const Contracts = () => {
    const [templates, setTemplates] = useState<any[]>([]);
    const [recentContracts, setRecentContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Generator Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [formData, setFormData] = useState({
        propertyId: '', // Ideally this would be a dropdown of properties
        assigneeName: '',
        assignmentFee: 10000
    });
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [templatesRes, recentRes] = await Promise.all([
                    axios.get('/api/contracts/templates'),
                    axios.get('/api/contracts/recent')
                ]);
                setTemplates(templatesRes.data || []);
                setRecentContracts(recentRes.data || []);
            } catch (error) {
                console.error("Failed to fetch contracts data", error);
                setTemplates([]);
                setRecentContracts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const openGenerator = (template: any) => {
        if (!template.active) return;
        setSelectedTemplate(template);
        setIsModalOpen(true);
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setGenerating(true);
        try {
            const response = await axios.post('/api/contracts/generate/assignment', formData, {
                responseType: 'blob'
            });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Assignment_Contract.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to generate contract", error);
            alert("Failed to generate contract. Please check property ID.");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-6 relative">
            <div>
                <h1 className="text-2xl font-bold text-slate-100">Contracts</h1>
                <p className="text-slate-400">Manage agreement templates and generated contracts.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-100 mb-4">Templates</h3>
                    <div className="space-y-3">
                        {loading ? (
                            <div className="text-center text-slate-500">Loading templates...</div>
                        ) : templates.map((template) => (
                            <div 
                                key={template.id} 
                                onClick={() => openGenerator(template)}
                                className={`p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between transition-colors ${template.active ? 'hover:border-teal-500/50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                            >
                                <div className="flex items-center">
                                    <FileText className={`${template.active ? 'text-teal-500' : 'text-slate-500'} mr-3`} size={20} />
                                    <div>
                                        <div className="text-slate-200 font-medium">{template.name}</div>
                                        <div className="text-xs text-slate-500">{template.description}</div>
                                    </div>
                                </div>
                                {template.active ? (
                                    <span className="text-xs bg-teal-500/10 text-teal-400 px-2 py-1 rounded">Generate</span>
                                ) : (
                                    <span className="text-xs text-slate-500">Coming Soon</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-100 mb-4">Recent Generated Contracts</h3>
                    {loading ? (
                        <div className="text-center text-slate-500">Loading recent contracts...</div>
                    ) : recentContracts.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            <FileText size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No contracts generated recently.</p>
                            <p className="text-xs mt-2">Use a template to generate a new contract.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentContracts.map((contract) => (
                                <div key={contract.id} className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FileText className="text-blue-500 mr-3" size={20} />
                                        <div>
                                            <div className="text-slate-200 font-medium">{contract.address}</div>
                                            <div className="text-xs text-slate-500">Assignment Fee: ${contract.assignmentFee || 0}</div>
                                        </div>
                                    </div>
                                    <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded">{contract.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Generator Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-100">Generate {selectedTemplate?.name}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleGenerate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Deal ID (Temporary)</label>
                                <input 
                                    type="number" 
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                                    value={formData.propertyId}
                                    onChange={(e) => setFormData({...formData, propertyId: e.target.value})}
                                    placeholder="Enter Deal ID (e.g., 1)"
                                />
                                <p className="text-xs text-slate-500 mt-1">Check Deals page for ID.</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Assignee Name</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                                    value={formData.assigneeName}
                                    onChange={(e) => setFormData({...formData, assigneeName: e.target.value})}
                                    placeholder="Buyer Name LLC"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Assignment Fee ($)</label>
                                <input 
                                    type="number" 
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                                    value={formData.assignmentFee}
                                    onChange={(e) => setFormData({...formData, assignmentFee: parseInt(e.target.value)})}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={generating}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-lg mt-4 transition-colors flex items-center justify-center"
                            >
                                {generating ? 'Generating...' : (
                                    <>
                                        <Download size={18} className="mr-2" />
                                        Download Contract
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
