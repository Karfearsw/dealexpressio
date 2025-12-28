import React, { useState } from 'react';
import { Phone, PhoneOff, Delete } from 'lucide-react';
import axios from 'axios';

interface DialerProps {
    minimized?: boolean;
}

const Dialer: React.FC<DialerProps> = ({ minimized = false }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [activeCall, setActiveCall] = useState<boolean>(false);
    const [status, setStatus] = useState<string>('Ready');

    const handleDigitClick = (digit: string) => {
        setPhoneNumber(prev => prev + digit);
    };

    const handleCall = async () => {
        if (!phoneNumber) return;
        setStatus('Calling...');
        setActiveCall(true);

        try {
            await axios.post('/communication/call', {
                to: phoneNumber,
                leadId: null // Standalone call for now
            });
            setStatus('Connected');
        } catch (error) {
            console.error('Call failed:', error);
            setStatus('Failed');
            setTimeout(() => {
                setActiveCall(false);
                setStatus('Ready');
            }, 2000);
        }
    };

    const handleHangup = () => {
        setActiveCall(false);
        setStatus('Ready');
        // Implement hangup logic with backend/SignalWire SDK
    };

    const handleDelete = () => {
        setPhoneNumber(prev => prev.slice(0, -1));
    };

    if (minimized) {
        return (
            <button className="fixed bottom-4 right-4 bg-teal-600 p-4 rounded-full shadow-lg hover:bg-teal-500 transition-all z-50">
                <Phone className="text-white" size={24} />
            </button>
        );
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl w-64 p-4 shadow-xl">
            <div className="mb-4 text-center">
                <div className="h-8 text-teal-400 font-medium text-sm mb-1">{status}</div>
                <input
                    type="text"
                    value={phoneNumber}
                    readOnly
                    className="w-full bg-slate-950 text-2xl text-center text-slate-100 p-2 rounded focus:outline-none"
                    placeholder="Enter Number"
                />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((digit) => (
                    <button
                        key={digit}
                        onClick={() => handleDigitClick(digit.toString())}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded text-lg font-medium transition-colors"
                        disabled={activeCall}
                    >
                        {digit}
                    </button>
                ))}
            </div>

            <div className="flex justify-center space-x-4">
                {!activeCall ? (
                    <>
                        <button
                            onClick={handleDelete}
                            className="bg-slate-800 hover:bg-slate-700 p-3 rounded-full text-slate-400 transition-colors"
                        >
                            <Delete size={20} />
                        </button>
                        <button
                            onClick={handleCall}
                            className="bg-green-600 hover:bg-green-500 p-3 rounded-full text-white shadow-lg shadow-green-900/20 transition-all"
                        >
                            <Phone size={24} />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleHangup}
                        className="bg-red-600 hover:bg-red-500 p-3 rounded-full text-white shadow-lg shadow-red-900/20 transition-all w-full flex justify-center items-center"
                    >
                        <PhoneOff size={24} className="mr-2" />
                        End Call
                    </button>
                )}
            </div>
        </div>
    );
};

export default Dialer;
