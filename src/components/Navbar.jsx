import React, { useState } from 'react';
import logo from '../assets/logo.jpg';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Calendar, LayoutDashboard, Home, ArrowRight, User, Menu, X, BookOpen } from 'lucide-react';

// Reusable Back Button for sub-pages
export const BackButton = () => {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-gray-600 hover:text-primary-green transition-colors text-sm font-medium"
        >
            <ArrowRight size={18} />
            <span>العودة</span>
        </button>
    );
};

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
            <div className="container mx-auto px-4">
                {/* 
                    In RTL mode:
                    normal flex row: Start is Right. Item 1 (Auth) -> Right. Item 3 (Branding) -> Left.
                    flex-row-reverse: Start is Left. Item 1 (Auth) -> Left. Item 3 (Branding) -> Right.
                    The user comments say:
                    1. Auth = Left Side
                    3. Branding = Right Side
                    So we want Auth on Left and Branding on Right.
                    In RTL, flex-row-reverse behaves as Left-to-Right visual flow.
                */}
                <div className="flex flex-row-reverse items-center justify-between h-20">

                    {/* Left Side: Auth Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {currentUser ? (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-bold">خروج</span>
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center gap-2 text-primary-orange hover:bg-orange-50 px-3 py-2 rounded-lg transition-colors"
                            >
                                <User className="w-5 h-5" />
                                <span className="font-bold">دخول الإدارة</span>
                            </Link>
                        )}
                    </div>

                    {/* Center: Main Navigation */}
                    <div className="hidden md:flex items-center gap-8 font-bold text-gray-700">
                        <Link to="/" className={`flex items-center gap-1 ${location.pathname === '/' ? 'text-primary-green' : 'hover:text-primary-green'}`}>
                            <Home className="w-5 h-5" /> الرئيسية
                        </Link>
                        <Link to="/levels" className={`flex items-center gap-1 ${location.pathname === '/levels' ? 'text-primary-green' : 'hover:text-primary-green'}`}>
                            <BookOpen className="w-5 h-5" /> المحتوى التعليمي
                        </Link>
                        <Link to="/calendar" className={`flex items-center gap-1 ${location.pathname === '/calendar' ? 'text-primary-green' : 'hover:text-primary-green'}`}>
                            <Calendar className="w-5 h-5" /> الجدول الزمني
                        </Link>
                        {currentUser && (
                            <Link to="/admin" className={`flex items-center gap-1 ${location.pathname.startsWith('/admin') ? 'text-primary-green' : 'hover:text-primary-green'}`}>
                                <LayoutDashboard className="w-5 h-5" /> لوحة التحكم
                            </Link>
                        )}
                    </div>

                    {/* Right Side: Branding (Title to immediate LEFT of Logo) 
                        In RTL flex-row-reverse (L->R), this is the last item, so it ends up on the Right?
                        Wait. L->R flow: 1 (Left), 2 (Center), 3 (Right).
                        Yes.
                        
                        Branding Internal Layout:
                        User wants: Text to immediate LEFT of Logo.
                        Visual: [Text] [Logo] (Rightmost)
                        In standard RTL internal flow (Right to Left): [Logo] [Text]?
                        No, RTL flow puts 1st item on Right.
                        So if we want Logo on Right, Logo must be 1st child.
                        DOM: <img /> <span>Text</span>
                        
                        The user script had: <span>Text</span> <img />
                        In RTL, that puts Span on Right, Img on Left. -> [Img] [Text] (Visual)
                        Wait.
                        RTL: Start -> Right.
                        Item 1: Span -> Rightmost.
                        Item 2: Img -> Left of Span.
                        Visual: [Img] [Span]  (Span is Rightmost??)
                        Let's verify.
                        dir="rtl"
                        <div> A B </div>
                        Renders: B A (visually? A is rightmost).
                        So A is Right. B is Left of A.
                        User code: Span Img.
                        Span is Right. Img is Left of Span.
                        Visual: [Img] [Span(Text)] (Rightmost edge) [..rest of page]
                        Text is on the Right. Img is to its Left.
                        User wants: "Title to immediate LEFT of Logo".
                        So we need [Text] [Logo] (Rightmost).
                        Currently we have [Img] [Text] (Rightmost).
                        So we need to swap them.
                        We need Logo to be Rightmost (Item 1). Text to be Left of Logo (Item 2).
                        So DOM: Img, Text.
                        
                        BUT user code has Link -> Span, Img.
                        I will Respect user code for internal branding structure, but I suspect it might be backwards for their description.
                        However, usually "Text Left of Logo" implies [Text] [Logo].
                        If User Code (Span, Img) in RTL -> [Img] [Span]. Text is Right. Logo is Left.
                        This is "Logo Left of Text".
                        I will SWAP them to match the "Title to immediate LEFT of Logo" requirement even if the snippet had them differently, because the requirement is explicit text instruction.
                    */}
                    <Link to="/" className="flex items-center gap-3">
                        {/* Swapping order to ensure Logo is Right (Item 1) and Text is Left (Item 2) in RTL */}
                        <img src={logo} alt="Logo" className="w-12 h-12 object-contain rounded-full" />
                        <span className="text-xl font-bold text-primary-green hidden sm:block">جمعية بذور الأمل</span>
                    </Link>

                    {/* Mobile Menu Button - Visible only on mobile */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg ml-auto"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
                    <div className="flex flex-col p-4 gap-2">
                        <Link to="/" onClick={toggleMenu} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                            <Home className="w-5 h-5 text-gray-500" /> الرئيسية
                        </Link>
                        <Link to="/levels" onClick={toggleMenu} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                            <BookOpen className="w-5 h-5 text-gray-500" /> المحتوى التعليمي
                        </Link>
                        <Link to="/calendar" onClick={toggleMenu} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                            <Calendar className="w-5 h-5 text-gray-500" /> الجدول الزمني
                        </Link>
                        {currentUser && (
                            <Link to="/admin" onClick={toggleMenu} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                                <LayoutDashboard className="w-5 h-5 text-gray-500" /> لوحة التحكم
                            </Link>
                        )}
                        <div className="h-px bg-gray-100 my-2"></div>
                        {currentUser ? (
                            <button onClick={() => { handleLogout(); toggleMenu(); }} className="flex items-center gap-2 text-red-500 p-2 w-full">
                                <LogOut className="w-5 h-5" /> خروج
                            </button>
                        ) : (
                            <Link to="/login" onClick={toggleMenu} className="flex items-center gap-2 text-primary-green p-2">
                                <User className="w-5 h-5" /> دخول الإدارة
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
