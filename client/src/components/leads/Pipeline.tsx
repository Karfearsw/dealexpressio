import React, { useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Lead, LEAD_STAGES } from '@/types';
import PipelineColumn from './PipelineColumn';
import LeadDetailModal from './LeadDetailModal';

interface PipelineProps {
    leads: Lead[];
    onLeadUpdate: (leadId: number, newStatus: Lead['status']) => void;
    onConvertToDeal?: (leadId: number) => void;
}

const Pipeline: React.FC<PipelineProps> = ({ leads, onLeadUpdate, onConvertToDeal }) => {
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const leadId = parseInt(active.id.toString());
            const newStatus = over.id as Lead['status'];
            onLeadUpdate(leadId, newStatus);
        }
    };

    const handleLeadClick = (lead: Lead) => {
        setSelectedLead(lead);
    };

    return (
        <>
            <DndContext onDragEnd={handleDragEnd}>
                <div className="flex h-full gap-4 overflow-x-auto pb-4">
                    {LEAD_STAGES.map((stage) => (
                        <PipelineColumn
                            key={stage}
                            id={stage}
                            title={stage}
                            leads={leads.filter(lead => lead.status === stage)}
                            onLeadClick={handleLeadClick}
                        />
                    ))}
                </div>
            </DndContext>

            {selectedLead && (
                <LeadDetailModal
                    lead={selectedLead}
                    isOpen={!!selectedLead}
                    onClose={() => setSelectedLead(null)}
                    onConvertToDeal={onConvertToDeal ? () => onConvertToDeal(selectedLead.id) : undefined}
                />
            )}
        </>
    );
};

export default Pipeline;
