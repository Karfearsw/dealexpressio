import React, { useState } from 'react';
import { Mail, MessageSquare } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';

const Contact = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder for form submission logic
        setSubmitted(true);
    };

    return (
        <PublicLayout>
            <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4 text-white">Contact Support</h1>
                    <p className="text-slate-400 text-lg">We're here to help you close more deals.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div className="flex items-start space-x-4">
                            <div className="p-3 bg-teal-500/10 rounded-lg text-teal-400">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-1">Email Us</h3>
                                <p className="text-slate-400 mb-2">For general inquiries and support.</p>
                                <a href="mailto:support@expressdeal.com" className="text-teal-400 hover:text-teal-300 font-medium">support@expressdeal.com</a>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                                <MessageSquare size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-1">Live Chat</h3>
                                <p className="text-slate-400 mb-2">Available Mon-Fri, 9am - 5pm EST.</p>
                                <button className="text-blue-400 hover:text-blue-300 font-medium">Start a Chat</button>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
                            <h4 className="text-white font-semibold mb-2">Office Address</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                ExpressDeal HQ<br />
                                123 Real Estate Blvd, Suite 100<br />
                                Miami, FL 33101
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl">
                        {submitted ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                                <p className="text-slate-400">We'll get back to you within 24 hours.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">How can we help?</label>
                                    <textarea
                                        required
                                        rows={4}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors"
                                        placeholder="Tell us about your issue..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:from-teal-400 hover:to-blue-500 transition-all transform hover:scale-[1.02]"
                                >
                                    Send Message
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default Contact;
