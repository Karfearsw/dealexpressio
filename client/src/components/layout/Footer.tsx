import { Link } from 'wouter';
import logo from '@/assets/logo-white.png';

const Footer = () => {
    return (
        <footer className="py-12 px-4 border-t border-slate-900 bg-slate-950">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <Link href="/">
                    <div className="flex items-center space-x-2 cursor-pointer">
                        <img src={logo} alt="DealExpress" className="h-16 w-auto" />
                    </div>
                </Link>

                <p className="text-slate-500 text-sm">© 2025 ExpressDeal CRM. All rights reserved.</p>

                <div className="flex space-x-6 text-slate-400 text-sm">
                    <Link href="/terms" className="hover:text-teal-400 block p-1">Terms</Link>
                    <Link href="/privacy" className="hover:text-teal-400 block p-1">Privacy</Link>
                    <Link href="/contact" className="hover:text-teal-400 block p-1">Contact</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
