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
    Calculator
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo-white.png';

const Sidebar = () => {
    const [location] = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const { logout } = useAuth();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Leads', path: '/leads', icon: Users },
        { name: 'Properties', path: '/properties', icon: Home },
        { name: 'Buyers List', path: '/buyers', icon: Users, isComingSoon: false },
        { name: 'Deal Calculator', path: '/calculator', icon: Calculator, isComingSoon: false },
    ];

    const upcomingItems = [
        { name: 'Communication', path: '/communication', icon: MessageSquare },
        { name: 'Contracts', path: '/contracts', icon: FileText },
        { name: 'Analytics', path: '/analytics', icon: BarChart },
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
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-medium transition-colors hover:bg-slate-800/50",
                                    isActive ? "text-teal-400 border-r-2 border-teal-400 bg-slate-800/30" : "text-slate-400 hover:text-slate-100"
                                )}
                            >
                                <item.icon size={20} className={cn("shrink-0", collapsed ? "mx-auto" : "mr-3")} />
                                {!collapsed && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </div>

                <div className="space-y-1">
                    {!collapsed && <div className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Future Updates</div>}
                    {upcomingItems.map((item) => {
                        return (
                            <div key={item.path} className="relative group">
                                <Link
                                    href={item.path}
                                    className={cn(
                                        "flex items-center px-4 py-3 text-sm font-medium transition-colors opacity-50 cursor-not-allowed",
                                        "text-slate-500 hover:text-slate-400"
                                    )}
                                >
                                    <item.icon size={20} className={cn("shrink-0", collapsed ? "mx-auto" : "mr-3")} />
                                    {!collapsed && (
                                        <div className="flex items-center justify-between w-full">
                                            <span>{item.name}</span>
                                            <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-bold uppercase">Soon</span>
                                        </div>
                                    )}
                                </Link>
                                {collapsed && (
                                    <div className="absolute left-16 top-1/2 -translate-y-1/2 hidden group-hover:block bg-slate-800 text-slate-100 text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap z-50">
                                        {item.name} (Coming Soon)
                                    </div>
                                )}
                            </div>
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
