import React from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Lead, LEAD_STAGES } from '@/types';
import PipelineColumn from './PipelineColumn';

interface PipelineProps {
    leads: Lead[];
    onLeadUpdate: (leadId: number, newStatus: Lead['status']) => void;
}

const Pipeline: React.FC<PipelineProps> = ({ leads, onLeadUpdate }) => {
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const leadId = parseInt(active.id.toString());
            const newStatus = over.id as Lead['status'];
            onLeadUpdate(leadId, newStatus);
        }
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                {LEAD_STAGES.map((stage) => (
                    <PipelineColumn
                        key={stage}
                        id={stage}
                        title={stage}
                        leads={leads.filter(lead => lead.status === stage)}
                    />
                ))}
            </div>
        </DndContext>
    );
};

export default Pipeline;
