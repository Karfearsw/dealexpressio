import React, { useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Lead, LEAD_STAGES } from '@/types';
import PipelineColumn from './PipelineColumn';
import LeadDetailModal from './LeadDetailModal';
import ContractDetailsModal from './ContractDetailsModal';
import { useLocation } from 'wouter';

interface PipelineProps {
    leads: Lead[];
    onLeadUpdate: (leadId: number, newStatus: Lead['status']) => void;
    onConvertToDeal?: (leadId: number) => void;
    onLeadDelete?: (id: number) => void;
}

const Pipeline: React.FC<PipelineProps> = ({ leads, onLeadUpdate, onConvertToDeal, onLeadDelete }) => {
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [contractModalLead, setContractModalLead] = useState<Lead | null>(null);
    const [, setLocation] = useLocation();

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const leadId = parseInt(active.id.toString());
            const newStatus = over.id as Lead['status'];
            
            const lead = leads.find(l => l.id === leadId);
            if (lead?.status === 'Contract Signed') {
                alert('Leads in "Contract Signed" are now Deals and cannot be moved back to previous stages.');
                return;
            }

            if (newStatus === 'Contract Signed' && lead) {
                setContractModalLead(lead);
                return;
            }

            onLeadUpdate(leadId, newStatus);
        }
    };

    const handleLeadClick = (lead: Lead) => {
        setSelectedLead(lead);
    };

    const handleContractSuccess = () => {
        if (contractModalLead) {
            onLeadUpdate(contractModalLead.id, 'Contract Signed');
        }
        setContractModalLead(null);
        setLocation('/deals');
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
                            onLeadDelete={onLeadDelete}
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

            {contractModalLead && (
                <ContractDetailsModal
                    lead={contractModalLead}
                    isOpen={!!contractModalLead}
                    onClose={() => setContractModalLead(null)}
                    onSuccess={handleContractSuccess}
                />
            )}
        </>
    );
};

export default Pipeline;
