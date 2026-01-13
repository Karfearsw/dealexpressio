import { Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import GlobalSearch from '@/components/common/GlobalSearch';

const Topbar = () => {
    const { user } = useAuth();

    return (
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex items-center justify-between px-6">
            <div className="flex items-center flex-1 max-w-md">
                <GlobalSearch />
            </div>

            <div className="flex items-center space-x-4">
                <button className="relative p-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full"></span>
                </button>

                <div className="flex items-center pl-4 border-l border-slate-700">
                    <div className="text-right mr-3 hidden sm:block">
                        <p className="text-sm font-medium text-slate-200">{user?.email}</p>
                        <div className="flex items-center justify-end gap-2 text-xs text-slate-400 capitalize">
                            <span>{user?.role}</span>
                            <span className="text-slate-600">•</span>
                            <span className={user?.subscriptionTier === 'enterprise' ? 'text-purple-400' : user?.subscriptionTier === 'pro' ? 'text-blue-400' : 'text-teal-400'}>
                                {user?.subscriptionTier || 'Basic'} Plan
                            </span>
                        </div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                        {user?.email?.substring(0, 2)}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
