
import PublicLayout from '@/components/layout/PublicLayout';

const Privacy = () => {
    return (
        <PublicLayout>
            <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-white">Privacy Policy</h1>
                <p className="text-slate-400 mb-8">Last Updated: [Date]</p>

                <section className="space-y-6 text-slate-300 leading-relaxed">
                    <h2 className="text-2xl font-semibold text-teal-400">1. Information Collection</h2>
                    <p>
                        We collect information you provide directly to us, such as when you create an account, subscribe to our service, or communicate with us.
                    </p>

                    <h2 className="text-2xl font-semibold text-teal-400">2. Use of Information</h2>
                    <p>
                        We use the information we collect to provide, maintain, and improve our services, including to process transactions, send you technical notices, and respond to your comments.
                    </p>

                    <h2 className="text-2xl font-semibold text-teal-400">3. Data Security</h2>
                    <p>
                        We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                    </p>

                    <h2 className="text-2xl font-semibold text-teal-400">4. Cookies and Tracking</h2>
                    <p>
                        We use cookies and similar tracking technologies to track the activity on our Service and hold certain information.
                    </p>

                    <h2 className="text-2xl font-semibold text-teal-400">5. Third-Party Services</h2>
                    <p>
                        We may use third-party services (like payment processors) that collect, monitor and analyze this type of information in order to increase our Service's functionality.
                    </p>

                    <h2 className="text-2xl font-semibold text-teal-400">6. Changes to This Policy</h2>
                    <p>
                        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                    </p>

                    <h2 className="text-2xl font-semibold text-teal-400">7. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at [Privacy Email].
                    </p>
                </section>
            </div>
        </PublicLayout>
    );
};

export default Privacy;
