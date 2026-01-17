import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Lead } from '@/types';
import LeadCard from './LeadCard';

interface PipelineColumnProps {
    id: string;
    title: string;
    leads: Lead[];
    onLeadClick?: (lead: Lead) => void;
    onLeadDelete?: (id: number) => void;
}

const PipelineColumn: React.FC<PipelineColumnProps> = ({ id, title, leads, onLeadClick, onLeadDelete }) => {
    const { setNodeRef } = useDroppable({
        id,
    });

    return (
        <div className="flex-shrink-0 w-80 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-bold text-slate-300 flex items-center">
                    {title}
                    <span className="ml-2 bg-slate-800 text-slate-500 text-xs px-2 py-0.5 rounded-full">
                        {leads.length}
                    </span>
                </h3>
            </div>

            <div
                ref={setNodeRef}
                className="flex-1 bg-slate-900/50 rounded-xl p-3 border border-slate-800/50 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
            >
                {leads.map((lead) => (
                    <LeadCard 
                        key={lead.id}
                        lead={lead} 
                        onClick={onLeadClick}
                        onDelete={onLeadDelete}
                    />
                ))}
                {leads.length === 0 && (
                    <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-800 rounded-lg opacity-50">
                        <p className="text-sm text-slate-600">Drop leads here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PipelineColumn;
