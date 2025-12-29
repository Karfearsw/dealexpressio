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

                <div className="text-slate-500 text-sm text-center md:text-left">
                    <p>© 2025 Express Brands LLC. All rights reserved.</p>
                    <p className="mt-1">1000 Brickell Ave Miami, FL 33131</p>
                </div>

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
