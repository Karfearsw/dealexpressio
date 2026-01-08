import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import PublicLayout from '@/components/layout/PublicLayout';

const Success = () => {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const t = setTimeout(() => setLocation('/dashboard'), 2500);
    return () => clearTimeout(t);
  }, [setLocation]);

  return (
    <PublicLayout>
      <div className="pt-40 pb-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-white">Payment Successful</h1>
          <p className="text-slate-400 mt-4">Your subscription is active. Redirecting to your dashboard...</p>
          <div className="mt-8">
            <Link href="/dashboard" className="px-8 py-3 rounded-xl bg-teal-600 text-white font-bold">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Success;
