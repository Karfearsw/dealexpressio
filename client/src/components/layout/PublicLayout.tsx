import PublicHeader from './PublicHeader';
import Footer from './Footer';

interface PublicLayoutProps {
    children: React.ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-teal-500/30 font-sans">
            <PublicHeader />
            <main>
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
