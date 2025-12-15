import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Layout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();

    const isHomePage = location.pathname === '/';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="flex-grow container mx-auto px-4 py-6">
                {!isHomePage && (
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-4 flex items-center gap-1 text-gray-600 hover:text-primary-orange transition-colors font-medium"
                    >
                        <ArrowRight size={20} />
                        <span>العودة</span>
                    </button>
                )}
                {children}
            </main>
            <footer className="bg-primary-green text-white py-6 mt-auto">
                <div className="container mx-auto px-4 text-center">
                    <p>© {new Date().getFullYear()} جمعية بذور الأمل للمرأة والطفل. جميع الحقوق محفوظة.</p>
                </div>
            </footer>
        </div>
    );
}
