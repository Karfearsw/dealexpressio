export interface Lead {
    id: number;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    status: 'New Lead' | 'Contacted' | 'Warm' | 'Offer Sent' | 'Contract Signed' | 'Converted' | 'Closed';
    source: string | null;
    assignedTo: number | null;
    convertedToDealId?: number | null;
    createdAt: string;
}

export const LEAD_STAGES = [
    'New Lead',
    'Contacted',
    'Warm',
    'Offer Sent',
    'Contract Signed',
    'Converted'
] as const;

export const DEAL_STAGES = [
    'Analyzing',
    'Negotiation', 
    'Under Contract',
    'Assigned',
    'Closed',
    'Dead'
] as const;

export interface Deal {
    id: number;
    userId: number;
    leadId: number | null;
    address: string;
    city: string | null;
    state: string | null;
    zip: string | null;
    county?: string | null;
    propertyType?: string | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    squareFeet?: number | null;
    lotSize?: string | null;
    yearBuilt?: number | null;
    purchasePrice: string | null;
    arv: string | null;
    repairs: string | null;
    assignmentFee: string | null;
    projectedProfit: string | null;
    mao?: string | null;
    wholesaleFee?: string | null;
    sellerMotivation?: string | null;
    occupancy?: string | null;
    condition?: string | null;
    buyerId?: number | null;
    buyerName?: string | null;
    status: string | null;
    notes?: string | null;
    photos?: any[];
    closedAt?: string | null;
    createdAt: string;
    updatedAt?: string;
}

export const CONTRACT_TYPES = [
    'Letter of Intent',
    'Purchase Agreement',
    'Purchase & Sale Agreement',
    'Assignment Contract',
    'JV Agreement'
] as const;

export interface Contract {
    id: number;
    userId: number;
    dealId: number | null;
    type: string;
    name: string;
    status: string;
    fileUrl?: string | null;
    generatedData?: any;
    signedAt?: string | null;
    expiresAt?: string | null;
    createdAt: string;
    updatedAt?: string;
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
