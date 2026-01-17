import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Lead } from '@/types';
import { Phone, Mail, User, Trash2 } from 'lucide-react';
import axios from 'axios';

interface LeadWithOwner extends Lead {
    ownerName?: string;
    ownerEmail?: string;
}

interface LeadCardProps {
    lead: LeadWithOwner;
    onDelete?: (id: number) => void;
    onClick?: (lead: LeadWithOwner) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onDelete, onClick }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: lead.id.toString(),
        data: { lead },
    });

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this lead?')) return;
        try {
            await axios.delete(`/leads/${lead.id}`);
            if (onDelete) onDelete(lead.id);
        } catch (error) {
            console.error('Error deleting lead:', error);
            alert('Failed to delete lead');
        }
    };

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't trigger click if we're dragging
        if (transform) return;
        onClick?.(lead);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={handleCardClick}
            className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm hover:shadow-md hover:border-teal-500/50 transition-all mb-3 relative group cursor-pointer"
        >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={handleDelete}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                >
                    <Trash2 size={14} />
                </button>
            </div>
            
            <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
                <div className="flex justify-between items-start mb-2 pr-6">
                    <h4 className="font-bold text-slate-100">{lead.firstName} {lead.lastName}</h4>
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
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">{new Date(lead.createdAt).toLocaleDateString()}</span>
                        {lead.ownerName && (
                            <div 
                                className="flex items-center gap-1 bg-slate-700/50 px-1.5 py-0.5 rounded text-[10px] text-slate-300"
                                title={`Owner: ${lead.ownerName}`}
                            >
                                <User size={10} />
                                <span className="max-w-[60px] truncate">{lead.ownerName.split(' ')[0]}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadCard;
