export interface Lead {
    id: number;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    status: 'New Lead' | 'Contacted' | 'Warm' | 'Offer Sent' | 'Contract Signed' | 'Closed';
    source: string | null;
    assignedTo: number | null;
    createdAt: string;
}

export const LEAD_STAGES = [
    'New Lead',
    'Contacted',
    'Warm',
    'Offer Sent',
    'Contract Signed',
    'Closed'
] as const;

export interface Property {
    id: number;
    leadId: number;
    address: string;
    city: string | null;
    state: string | null;
    zip: string | null;
    arv: string | null;
    mao: string | null;
    repairCost: string | null;
    assignmentFee: string | null;
    projectedSpread: string | null;
    status: string | null;
    photos: any[];
    notes: string | null;
    createdAt: string;
}

export interface Call {
    id: number;
    leadId: number | null;
    userId: number | null;
    direction: 'inbound' | 'outbound';
    duration: number | null;
    status: string | null;
    recordingUrl: string | null;
    createdAt: string;
}

export interface SMSMessage {
    id: number;
    leadId: number | null;
    userId: number | null;
    message: string;
    direction: 'inbound' | 'outbound';
    status: string | null;
    createdAt: string;
}
