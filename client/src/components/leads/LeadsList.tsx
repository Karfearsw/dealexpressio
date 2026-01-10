import React from 'react';
import { Lead } from '@/types';
import { Phone, Mail, Calendar } from 'lucide-react';

interface LeadsListProps {
    leads: Lead[];
    onConvertToDeal?: (leadId: number) => void;
}

const LeadsList: React.FC<LeadsListProps> = ({ leads, onConvertToDeal }) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                            <th className="p-4 font-medium">Name</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Contact</th>
                            <th className="p-4 font-medium">Source</th>
                            <th className="p-4 font-medium">Created</th>
                            <th className="p-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="p-4">
                                    <div className="font-medium text-slate-200">{lead.firstName} {lead.lastName}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium 
                                ${lead.status === 'New Lead' ? 'bg-blue-500/20 text-blue-400' :
                                            lead.status === 'Closed' ? 'bg-green-500/20 text-green-400' :
                                                'bg-slate-700 text-slate-300'}`}>
                                        {lead.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col space-y-1">
                                        {lead.phone && (
                                            <div className="flex items-center text-sm text-slate-400">
                                                <Phone size={14} className="mr-2" />
                                                {lead.phone}
                                            </div>
                                        )}
                                        {lead.email && (
                                            <div className="flex items-center text-sm text-slate-400">
                                                <Mail size={14} className="mr-2" />
                                                {lead.email}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="text-sm text-slate-400">{lead.source || '-'}</span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center text-sm text-slate-500">
                                        <Calendar size={14} className="mr-2" />
                                        {new Date(lead.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="p-4">
                                    {onConvertToDeal && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onConvertToDeal(lead.id);
                                            }}
                                            className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white text-sm rounded transition-colors"
                                        >
                                            Convert
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {leads.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        No leads found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeadsList;
