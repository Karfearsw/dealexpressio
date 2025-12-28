import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Lead } from '@/types';
import { Phone, Mail, User } from 'lucide-react';

interface LeadCardProps {
    lead: Lead;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: lead.id.toString(),
        data: { lead },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm hover:shadow-md hover:border-teal-500/50 transition-all cursor-grab active:cursor-grabbing mb-3"
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-100">{lead.firstName} {lead.lastName}</h4>
                <span className="text-xs bg-slate-900 text-slate-400 px-2 py-1 rounded">
                    {new Date(lead.createdAt).toLocaleDateString()}
                </span>
            </div>

            <div className="space-y-1">
                {lead.phone && (
                    <div className="flex items-center text-xs text-slate-400">
                        <Phone size={12} className="mr-2" />
                        {lead.phone}
                    </div>
                )}
                {lead.email && (
                    <div className="flex items-center text-xs text-slate-400">
                        <Mail size={12} className="mr-2" />
                        {lead.email}
                    </div>
                )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between items-center">
                <span className="text-xs text-teal-400 font-medium">{lead.source || 'Unknown Source'}</span>
                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300">
                    <User size={12} />
                </div>
            </div>
        </div>
    );
};

export default LeadCard;
