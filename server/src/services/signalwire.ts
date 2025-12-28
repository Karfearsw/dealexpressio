import { RestClient } from '@signalwire/compatibility-api';
import { Messaging } from '@signalwire/realtime-api';

const project = process.env.SIGNALWIRE_PROJECT_ID!;
const token = process.env.SIGNALWIRE_API_TOKEN!;
const space = process.env.SIGNALWIRE_SPACE_URL!; // e.g., example.signalwire.com

if (!project || !token || !space) {
    console.warn('SignalWire credentials not found in environment variables. Communication features will be disabled.');
}

// Compatibility API Client for REST calls (making calls, sending SMS)
let client: any;

try {
    if (project && token && space) {
        client = RestClient(project, token, { signalwireSpaceUrl: space });
    } else {
        console.warn('SignalWire credentials missing. Using mock client.');
        // Mock client to prevent crashes
        client = {
            calls: { create: async () => ({ sid: 'mock-call-sid', status: 'queued' }) },
            messages: { create: async () => ({ sid: 'mock-msg-sid', status: 'queued' }) }
        };
    }
} catch (error) {
    console.warn('Failed to initialize SignalWire client:', error);
    client = {
        calls: { create: async () => ({ sid: 'mock-call-sid', status: 'queued' }) },
        messages: { create: async () => ({ sid: 'mock-msg-sid', status: 'queued' }) }
    };
}

export { client };

// Helper to format phone numbers (E.164)
export const formatPhoneNumber = (number: string) => {
    // Simple basic formatting, can be improved with libphonenumber-js
    if (!number) return '';
    if (number.startsWith('+1')) return number;
    if (number.length === 10) return `+1${number}`;
    return `+${number.replace(/\D/g, '')}`;
};

export const makeCall = async (to: string, from: string, url: string) => {
    try {
        const call = await client.calls.create({
            url, // XML TwiML URL or similar
            to: formatPhoneNumber(to),
            from: formatPhoneNumber(from),
        });
        return call;
    } catch (error) {
        console.error('SignalWire Call Error:', error);
        throw error;
    }
};

export const sendSMS = async (to: string, from: string, body: string) => {
    try {
        const message = await client.messages.create({
            body,
            to: formatPhoneNumber(to),
            from: formatPhoneNumber(from),
        });
        return message;
    } catch (error) {
        console.error('SignalWire SMS Error:', error);
        throw error;
    }
};
