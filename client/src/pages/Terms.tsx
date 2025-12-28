
import PublicLayout from '@/components/layout/PublicLayout';

const Terms = () => {
    return (
        <PublicLayout>
            <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-white">Terms of Service</h1>
                <p className="text-slate-400 mb-8">Last Updated: [Date]</p>

                <section className="space-y-6 text-slate-300 leading-relaxed">
                    <h2 className="text-2xl font-semibold text-teal-400">1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using ExpressDeal CRM ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
                    </p>

                    <h2 className="text-2xl font-semibold text-teal-400">2. Description of Service</h2>
                    <p>
                        ExpressDeal CRM provides real estate lead management, analysis tools, and communication features for wholesalers. We reserve the right to modify or discontinue the Service at any time.
                    </p>

                    <h2 className="text-2xl font-semibold text-teal-400">3. User Accounts</h2>
                    <p>
                        You are responsible for maintaining the security of your account credentials. You are fully responsible for all activities that occur under your account.
                    </p>

                    <h2 className="text-2xl font-semibold text-teal-400">4. Lead Data & Privacy</h2>
                    <p>
                        Your data is yours. We do not sell or share your lead data with third parties. Please refer to our Privacy Policy for more details on how we handle your information.
                    </p>

                    <h2 className="text-2xl font-semibold text-teal-400">5. Subscription & Payments</h2>
                    <p>
                        ExpressDeal CRM is a subscription-based service. You agree to pay all fees associated with your chosen plan. Payments are non-refundable except where required by law.
                    </p>

                    <h2 className="text-2xl font-semibold text-teal-400">6. Limitation of Liability</h2>
                    <p>
                        To the maximum extent permitted by law, ExpressDeal CRM shall not be liable for any indirect, incidental, or consequential damages arising arising out of your use of the Service.
                    </p>

                    <h2 className="text-2xl font-semibold text-teal-400">7. Contact Information</h2>
                    <p>
                        If you have any questions about these Terms, please contact us at [Support Email].
                    </p>
                </section>
            </div>
        </PublicLayout>
    );
};

export default Terms;
