import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
    LayoutDashboard,
    Users,
    Home,
    MessageSquare,
    FileText,
    BarChart,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Calculator,
    Lock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo-white.png';

type SubscriptionTier = 'basic' | 'pro' | 'enterprise';

const Sidebar = () => {
    const [location] = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const { logout, user } = useAuth();

    const userTier = (user?.subscriptionTier || 'basic') as SubscriptionTier;
    const tierLevels: Record<SubscriptionTier, number> = { 'basic': 1, 'pro': 2, 'enterprise': 3 };
    const currentLevel = tierLevels[userTier] || 1;

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Leads', path: '/leads', icon: Users },
        { name: 'Deals', path: '/deals', icon: Home },
        {
            name: 'Communication',
            path: '/communication',
            icon: MessageSquare,
            locked: !['business@kevnbenestate.org', 'sk@dealexpress.io', 'enterprise_test@example.com'].includes(user?.email || '')
        },
        { name: 'Contracts', path: '/contracts', icon: FileText },
        { name: 'Analytics', path: '/analytics', icon: BarChart },
        { name: 'Buyers List', path: '/buyers', icon: Users },
        { name: 'Deal Calculator', path: '/calculator', icon: Calculator },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    return (
        <div className={cn(
            "h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col",
            collapsed ? "w-16" : "w-64"
        )}>
            <div className="h-20 flex items-center justify-between px-4 border-b border-slate-800">
                {!collapsed && <img src={logo} alt="DealExpress" className="h-16 w-auto" />}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400"
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <nav className="flex-1 py-4 space-y-8 overflow-y-auto">
                <div className="space-y-1">
                    {!collapsed && <div className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Core Tools</div>}
                    {navItems.map((item) => {
                        const isActive = location === item.path;
                        // const isLocked = false; // Everyone has access except specific locked items
                        const isLocked = (item as any).locked;

                        return (
                            <Link
                                key={item.path}
                                href={isLocked ? '/dashboard' : item.path} // Redirect locked to dashboard or stay (link disabled effectively)
                                onClick={(e) => {
                                    if (isLocked) e.preventDefault();
                                }}
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-medium transition-colors hover:bg-slate-800/50 relative group",
                                    isActive ? "text-teal-400 border-r-2 border-teal-400 bg-slate-800/30" : "text-slate-400 hover:text-slate-100",
                                    isLocked && "opacity-50 hover:opacity-100 cursor-not-allowed"
                                )}
                            >
                                <item.icon size={20} className={cn("shrink-0", collapsed ? "mx-auto" : "mr-3")} />
                                {!collapsed && (
                                    <div className="flex items-center justify-between w-full">
                                        <span>{item.name}</span>
                                        {isLocked && <Lock size={14} className="text-slate-500" />}
                                    </div>
                                )}
                                {collapsed && isLocked && (
                                    <div className="absolute right-2 top-2">
                                        <Lock size={10} className="text-slate-500" />
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <button
                    onClick={logout}
                    className={cn(
                        "flex items-center w-full text-sm font-medium text-slate-400 hover:text-red-400 transition-colors",
                        collapsed ? "justify-center" : "px-4 py-2"
                    )}
                >
                    <LogOut size={20} className={cn("shrink-0", !collapsed && "mr-3")} />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
