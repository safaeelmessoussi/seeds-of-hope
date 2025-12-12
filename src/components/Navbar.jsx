import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Calendar, User } from 'lucide-react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const closeMenu = () => setIsOpen(false);

    const isActive = (path) => location.pathname === path ? "text-primary-orange font-bold" : "text-gray-700 hover:text-primary-green";

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3">
                    <img src="/logo.jpg" alt="Seeds of Hope" className="h-12 w-auto" />
                    <span className="text-xl font-bold text-primary-green hidden sm:block">جمعية بذور الأمل</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <Link to="/" className={`flex items-center gap-2 transition-colors ${isActive('/')}`}>
                        <Home size={20} />
                        <span>الرئيسية</span>
                    </Link>
                    <Link to="/calendar" className={`flex items-center gap-2 transition-colors ${isActive('/calendar')}`}>
                        <Calendar size={20} />
                        <span>الجدول الزمني</span>
                    </Link>
                    <Link to="/login" className={`flex items-center gap-2 transition-colors ${isActive('/login')}`}>
                        <User size={20} />
                        <span>دخول الإدارة</span>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden text-gray-700" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 p-4 flex flex-col gap-4">
                    <Link to="/" onClick={closeMenu} className={`flex items-center gap-2 ${isActive('/')}`}>
                        <Home size={20} />
                        <span>الرئيسية</span>
                    </Link>
                    <Link to="/calendar" onClick={closeMenu} className={`flex items-center gap-2 ${isActive('/calendar')}`}>
                        <Calendar size={20} />
                        <span>الجدول الزمني</span>
                    </Link>
                    <Link to="/login" onClick={closeMenu} className={`flex items-center gap-2 ${isActive('/login')}`}>
                        <User size={20} />
                        <span>دخول الإدارة</span>
                    </Link>
                </div>
            )}
        </nav>
    );
}
