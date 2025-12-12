import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-6">
                <Outlet />
            </main>
            <footer className="bg-primary-green text-white py-6 mt-auto">
                <div className="container mx-auto px-4 text-center">
                    <p>© {new Date().getFullYear()} جمعية بذور الأمل للمرأة والطفل. جميع الحقوق محفوظة.</p>
                </div>
            </footer>
        </div>
    );
}
