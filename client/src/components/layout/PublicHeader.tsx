import { Link, useLocation } from 'wouter';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const PublicHeader = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [location] = useLocation();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        setMobileMenuOpen(false);

        if (location !== '/') {
            window.location.href = `/${id}`;
            return;
        }

        const element = document.querySelector(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/90 backdrop-blur-md border-b border-slate-800 py-2' : 'bg-transparent py-4'}`}>
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
                <Link href="/">
                    <div className="flex items-center space-x-2 cursor-pointer group">
                        <div className="font-extrabold text-2xl tracking-tighter text-white group-hover:text-teal-400 transition-colors">
                            Deal<span className="text-teal-500">Express</span>
                        </div>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-y-0 space-x-8 text-sm font-medium text-slate-400">
                    <a href="#features" onClick={(e) => scrollToSection(e, '#features')} className="hover:text-teal-400 transition-colors">Features</a>
                    <a href="#workflow" onClick={(e) => scrollToSection(e, '#workflow')} className="hover:text-teal-400 transition-colors">How it Works</a>
                    <Link href="/pricing" className={`hover:text-teal-400 transition-colors ${location === '/pricing' ? 'text-teal-400' : ''}`}>Pricing</Link>
                    <Link href="/community" className={`hover:text-teal-400 transition-colors ${location === '/community' ? 'text-teal-400' : ''}`}>Community</Link>

                    <div className="flex items-center space-x-4 ml-4">
                        <Link href="/login" className="bg-slate-900 border border-slate-700 px-5 py-2 rounded-full hover:bg-slate-800 transition-colors text-slate-100">
                            Sign In
                        </Link>
                        <Link href="/register" className="bg-gradient-to-r from-teal-500 to-blue-600 px-5 py-2 rounded-full text-white shadow-lg shadow-teal-500/20 hover:scale-105 transition-transform active:scale-95">
                            Get Started
                        </Link>
                    </div>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-slate-300 hover:text-white"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-slate-950 border-b border-slate-800 p-4 flex flex-col space-y-4 shadow-2xl">
                    <a href="#features" onClick={(e) => scrollToSection(e, '#features')} className="text-slate-300 hover:text-teal-400 py-2 block">Features</a>
                    <a href="#workflow" onClick={(e) => scrollToSection(e, '#workflow')} className="text-slate-300 hover:text-teal-400 py-2 block">How it Works</a>
                    <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-teal-400 py-2 block">Pricing</Link>
                    <Link href="/community" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-teal-400 py-2 block">Community</Link>
                    <div className="flex flex-col space-y-3 pt-4 border-t border-slate-800">
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-center bg-slate-900 border border-slate-700 px-5 py-3 rounded-xl hover:bg-slate-800 text-slate-100">
                            Sign In
                        </Link>
                        <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="text-center bg-gradient-to-r from-teal-500 to-blue-600 px-5 py-3 rounded-xl text-white font-bold">
                            Get Started
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
};

export default PublicHeader;
