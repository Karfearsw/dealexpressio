import { Link } from 'wouter';
import { Mail, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await fetch('/api/marketing/beta-signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            setStatus('success');
            setEmail('');
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <footer className="pt-20 pb-12 px-4 border-t border-slate-900 bg-slate-950">
            <div className="max-w-7xl mx-auto mb-16">
                <div className="bg-slate-900/50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800">
                    <div className="max-w-xl">
                        <h3 className="text-2xl font-bold text-white mb-2">Want early access to updates?</h3>
                        <p className="text-slate-400">Join our exclusive waiting list to get notified when new spots open up.</p>
                    </div>
                    <form onSubmit={handleSubscribe} className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full sm:w-80 bg-slate-950 border border-slate-700 rounded-full pl-12 pr-6 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={status === 'loading' || status === 'success'}
                            className="bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold px-8 py-3 rounded-full transition-all flex items-center justify-center gap-2"
                        >
                            {status === 'success' ? 'Joined!' : 'Join Waitlist'}
                            {status !== 'success' && <ArrowRight className="h-4 w-4" />}
                        </button>
                    </form>
                </div>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 pt-8 border-t border-slate-900">
                <Link href="/">
                    <div className="flex items-center space-x-2 cursor-pointer group">
                        <div className="font-extrabold text-2xl tracking-tighter text-white group-hover:text-teal-400 transition-colors">
                            Express<span className="text-teal-500">Deal</span>
                        </div>
                    </div>
                </Link>

                <div className="text-slate-500 text-sm text-center md:text-left">
                    <p>© 2025 Express Brands LLC. All rights reserved.</p>
                    <p className="mt-1">1000 Brickell Ave Miami, FL 33131</p>
                </div>

                <div className="flex space-x-6 text-slate-400 text-sm">
                    <Link href="/terms" className="hover:text-teal-400 block p-1">Terms</Link>
                    <Link href="/privacy" className="hover:text-teal-400 block p-1">Privacy</Link>
                    <Link href="/contact" className="hover:text-teal-400 block p-1">Contact</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
