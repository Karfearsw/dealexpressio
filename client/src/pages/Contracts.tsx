import React from 'react';
import { FileText } from 'lucide-react';

const Contracts = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-100">Contracts</h1>
                <p className="text-slate-400">Manage agreement templates and generated contracts.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-100 mb-4">Templates</h3>
                    <div className="space-y-3">
                        <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between hover:border-teal-500/50 transition-colors cursor-pointer">
                            <div className="flex items-center">
                                <FileText className="text-teal-500 mr-3" size={20} />
                                <div>
                                    <div className="text-slate-200 font-medium">Assignment of Contract</div>
                                    <div className="text-xs text-slate-500">Standard Assignment Agreement</div>
                                </div>
                            </div>
                            <span className="text-xs bg-teal-500/10 text-teal-400 px-2 py-1 rounded">Active</span>
                        </div>
                        <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between hover:border-teal-500/50 transition-colors cursor-pointer opacity-50">
                            <div className="flex items-center">
                                <FileText className="text-slate-500 mr-3" size={20} />
                                <div>
                                    <div className="text-slate-200 font-medium">Purchase & Sale Agreement</div>
                                    <div className="text-xs text-slate-500">Coming Soon</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-100 mb-4">Recent Generated Contracts</h3>
                    <div className="text-center py-10 text-slate-500">
                        <FileText size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No contracts generated recently.</p>
                        <p className="text-xs mt-2">Go to a Property to generate an assignment.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contracts;
