import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import axios from 'axios';
import PublicLayout from '@/components/layout/PublicLayout';

const Success = () => {
  const [, setLocation] = useLocation();
  const [tier, setTier] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tierParam = params.get('tier');
    setTier(tierParam);

    // Verify payment status
    axios.get('/payments/subscription-status')
      .then(res => {
        console.log('Subscription activated:', res.data);
      })
      .catch(err => {
        console.error('Failed to verify subscription:', err);
      });
  }, []);

  return (
    <PublicLayout>
      <div className="pt-40 pb-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-white">
            🎉 Welcome to DealExpress {tier ? (tier.charAt(0).toUpperCase() + tier.slice(1)) : ''}!
          </h1>
          <p className="text-slate-400 mt-4">Your subscription has been activated successfully.</p>
          <div className="mt-8">
            <Link href="/dashboard" className="px-8 py-3 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-500 transition-colors">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Success;
