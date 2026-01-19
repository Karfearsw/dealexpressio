import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { CheckCircle, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const RegisterSuccess = () => {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');

        if (!sessionId) {
            setStatus('success');
            setMessage('Your account has been created successfully!');
            return;
        }

        let attempts = 0;
        const maxAttempts = 10;

        const verifySession = async () => {
            try {
                const response = await fetch(`/api/stripe/verify-session/${sessionId}`);
                const data = await response.json();

                if (data.success) {
                    setStatus('success');
                    setEmail(data.email);
                    setMessage('Your account has been created successfully!');
                } else {
                    attempts++;
                    if (data.message === 'User not found yet, processing...' && attempts < maxAttempts) {
                        setTimeout(verifySession, 2000);
                    } else if (attempts >= maxAttempts) {
                        setStatus('success');
                        setMessage('Your payment was successful! Your account is being set up.');
                    } else {
                        setStatus('error');
                        setMessage(data.message || 'Payment verification failed');
                    }
                }
            } catch (error) {
                setStatus('error');
                setMessage('Failed to verify payment. Please contact support.');
            }
        };

        verifySession();
    }, []);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl text-center">
                    <Loader2 className="w-16 h-16 text-teal-400 mx-auto mb-6 animate-spin" />
                    <h1 className="text-2xl font-bold text-white mb-4">
                        Processing Your Registration
                    </h1>
                    <p className="text-slate-400">
                        Please wait while we set up your account...
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-white mb-4">
                        Something Went Wrong
                    </h1>
                    <p className="text-slate-400 mb-6">
                        {message}
                    </p>
                    <div className="space-y-4">
                        <Link 
                            href="/register"
                            className="inline-block bg-gradient-to-r from-teal-500 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-teal-400 hover:to-blue-500 transition-all"
                        >
                            Try Again
                        </Link>
                        <p className="text-slate-500 text-sm">
                            Need help? Contact support@dealexpress.io
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-teal-500/10 p-3 rounded-full border border-teal-500/20">
                        <CheckCircle className="text-teal-400" size={48} />
                    </div>
                </div>
                
                <h1 className="text-3xl font-bold text-slate-100 mb-4">
                    Welcome to Deal Express!
                </h1>
                
                <div className="space-y-4 mb-8">
                    <p className="text-slate-300">
                        {message}
                    </p>
                    
                    {email && (
                        <p className="text-slate-300">
                            Your account email: <span className="text-teal-400 font-medium">{email}</span>
                        </p>
                    )}
                    
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-4 text-left">
                        <div className="bg-blue-500/10 p-2 rounded-lg">
                            <Mail className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <p className="text-slate-100 font-medium">Check your email</p>
                            <p className="text-slate-400 text-sm">We've sent a welcome email with your login credentials.</p>
                        </div>
                    </div>
                </div>

                <Link href="/login" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                    Sign In to Your Account
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
