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
    'Contract Signed'
] as const;

export const DEAL_STAGES = [
    'Open Deal',
    'Closed Deal'
] as const;

export interface MotivationDetails {
    factors: string[]; // e.g., ['Vacant', 'Out of State']
    score: number;
}

export interface NextAction {
    text: string;
    completed: boolean;
}

export interface DealActivity {
    id: number;
    propertyId: number;
    stage: string;
    details: string | null;
    nextActions: NextAction[] | null;
    createdAt: string;
    userId: number | null;
}

export interface Deal {
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
    
    // Extended fields
    purchasePrice: string | null;
    beds: number | null;
    baths: string | null; // decimal as string from JSON/API usually, or number
    sqft: number | null;
    yearBuilt: number | null;
    occupancyStatus: string | null;
    motivationDetails: MotivationDetails | null;
}

export type Property = Deal;

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
