import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, TrendingUp, Percent, ArrowRight } from 'lucide-react';

const DealCalculator = () => {
    const [arv, setArv] = useState<number>(300000);
    const [repairCost, setRepairCost] = useState<number>(50000);
    const [assignmentFee, setAssignmentFee] = useState<number>(10000);
    const [ruleOfThumb, setRuleOfThumb] = useState<number>(70); // 70% rule

    const [mao, setMao] = useState<number>(0);

    useEffect(() => {
        const calculatedMao = (arv * (ruleOfThumb / 100)) - repairCost - assignmentFee;
        setMao(calculatedMao);
    }, [arv, repairCost, assignmentFee, ruleOfThumb]);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-100 italic flex items-center">
                    <Calculator className="mr-2 text-teal-400" size={24} />
                    Deal Calculator
                </h1>
                <p className="text-slate-400">Calculate Maximum Allowable Offer (MAO) and projected spreads.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Parameters</h3>

                    <div className="space-y-2">
                        <label className="text-sm text-slate-400 flex justify-between">
                            <span>After Repair Value (ARV)</span>
                            <span className="text-teal-400 font-mono">${arv.toLocaleString()}</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-500"><DollarSign size={16} /></span>
                            <input
                                type="number"
                                value={arv}
                                onChange={(e) => setArv(Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-slate-100 focus:outline-none focus:border-teal-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-slate-400 flex justify-between">
                            <span>Repair Estimates</span>
                            <span className="text-red-400 font-mono">-${repairCost.toLocaleString()}</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-500"><DollarSign size={16} /></span>
                            <input
                                type="number"
                                value={repairCost}
                                onChange={(e) => setRepairCost(Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-slate-100 focus:outline-none focus:border-red-500/50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-slate-400 flex justify-between">
                            <span>Target Assignment Fee</span>
                            <span className="text-blue-400 font-mono">${assignmentFee.toLocaleString()}</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-500"><DollarSign size={16} /></span>
                            <input
                                type="number"
                                value={assignmentFee}
                                onChange={(e) => setAssignmentFee(Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-slate-100 focus:outline-none focus:border-blue-500/50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <label className="text-sm text-slate-400 flex justify-between">
                            <span>Rule of Thumb (%)</span>
                            <span className="text-indigo-400 font-mono">{ruleOfThumb}%</span>
                        </label>
                        <input
                            type="range"
                            min="50"
                            max="90"
                            step="1"
                            value={ruleOfThumb}
                            onChange={(e) => setRuleOfThumb(Number(e.target.value))}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                        />
                    </div>
                </div>

                {/* Results */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-teal-500/20 to-blue-600/20 border border-teal-500/30 rounded-2xl p-8 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <TrendingUp size={120} />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-1">Max Allowable Offer (MAO)</h4>
                            <div className="text-5xl font-black text-slate-100 tracking-tight">
                                ${mao.toLocaleString()}
                            </div>
                            <p className="text-teal-400/60 text-xs mt-4 leading-relaxed font-medium capitalize italic">
                                Based on {ruleOfThumb}% rule minus repairs and your fee.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Your Fee</h4>
                            <div className="text-2xl font-bold text-blue-400">${assignmentFee.toLocaleString()}</div>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Investor Buy Price</h4>
                            <div className="text-2xl font-bold text-indigo-400">${(mao + assignmentFee).toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-900/50 border border-dashed border-slate-800 rounded-xl text-center">
                        <p className="text-slate-400 text-sm">Need a PDF analysis for your buyer?</p>
                        <button className="text-teal-400 font-bold text-sm mt-2 hover:text-teal-300 transition-colors flex items-center justify-center mx-auto group">
                            Generate Analysis Report <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DealCalculator;
