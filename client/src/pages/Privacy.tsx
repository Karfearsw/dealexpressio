
import PublicLayout from '@/components/layout/PublicLayout';

const Privacy = () => {
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <PublicLayout>
            <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-4 text-white">Privacy Policy</h1>
                <p className="text-slate-400 mb-8 font-mono">Last Updated: {today}</p>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
                    <section className="space-y-10 text-slate-300 leading-relaxed">
                        <div>
                            <h2 className="text-2xl font-semibold text-teal-400 mb-4">1. Data Identity & Collection</h2>
                            <p className="mb-4">
                                DealExpress ("we", "our") collects various types of information to provide enterprise-grade real estate CRM services. This includes:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-400">
                                <li><strong>Identity Information:</strong> Professional name, email, and verified authentication data.</li>
                                <li><strong>Property Data:</strong> Addresses, transaction history, and associated media (photos/videos).</li>
                                <li><strong>Client Metadata:</strong> Lead contact details and communication logs.</li>
                                <li><strong>Security Logs:</strong> IP addresses and device fingerprints for threat detection.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold text-teal-400 mb-4">2. Processing & Usage</h2>
                            <p>
                                We process data under the legal basis of "Contractual Necessity" and "Legitimate Interest" (Security). Data is used to facilitate real estate transactions, automate marketing flows, and ensure the integrity of the DealExpress ecosystem. We use AES-256 encryption at rest and TLS 1.3 for all data in transit.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold text-teal-400 mb-4">3. Regulatory Compliance (GDPR/CCPA/CPRA)</h2>
                            <p className="mb-4">
                                In accordance with 2026 global privacy standards:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-400">
                                <li><strong>Right to Access:</strong> You may request a machine-readable copy of all your data (processed within 30 days).</li>
                                <li><strong>Right to Deletion:</strong> We provide tools for permanent account and data erasure.</li>
                                <li><strong>Opt-Out:</strong> Users have granular control over marketing and data sharing preferences via Account Settings.</li>
                                <li><strong>Breach Notification:</strong> In the event of a high-risk security breach, we notify affected users within 72 hours.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold text-teal-400 mb-4">4. Data Retention</h2>
                            <p>
                                Personal information is retained only as long as necessary to fulfill the purposes outlined in this policy or to comply with legal/audit obligations (typically 7 years for financial records).
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold text-teal-400 mb-4">5. Third-Party Disclosures</h2>
                            <p>
                                We do not sell your data. We share data only with verified Service Providers (e.g., Stripe for payments, SignalWire for communications) who maintain strict SOC 2 compliance.
                            </p>
                        </div>

                        <div className="pt-6 border-t border-slate-800">
                            <h2 className="text-2xl font-semibold text-teal-400 mb-4">6. Contact Information</h2>
                            <p>
                                For data access requests or privacy inquiries, contact our Data Protection Officer at:
                                <br />
                                <span className="text-teal-400 font-mono mt-2 block">privacy@dealexpress.io</span>
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </PublicLayout>
    );
};

export default Privacy;
