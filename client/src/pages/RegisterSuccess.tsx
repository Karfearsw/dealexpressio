import React from 'react';
import { Link } from 'wouter';
import { CheckCircle, Mail, ArrowRight } from 'lucide-react';

const RegisterSuccess = () => {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-teal-500/10 p-3 rounded-full border border-teal-500/20">
                        <CheckCircle className="text-teal-400" size={48} />
                    </div>
                </div>
                
                <h1 className="text-3xl font-bold text-slate-100 mb-4">
                    Account Created!
                </h1>
                
                <div className="space-y-4 mb-8">
                    <p className="text-slate-300">
                        Thank you for signing up for DealExpress. Your account has been successfully created.
                    </p>
                    
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-4 text-left">
                        <div className="bg-blue-500/10 p-2 rounded-lg">
                            <Mail className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <p className="text-slate-100 font-medium">Check your email</p>
                            <p className="text-slate-400 text-sm">We've sent a welcome email with your next steps.</p>
                        </div>
                    </div>
                </div>

                <Link href="/dashboard" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                    Go to Dashboard
                    <ArrowRight size={18} />
                </Link>
                
                <p className="text-slate-500 text-sm mt-6">
                    Didn't receive an email? Check your spam folder or contact support.
                </p>
            </div>
        </div>
    );
};

export default RegisterSuccess;
