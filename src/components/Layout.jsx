import Navbar from './Navbar';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-8">
                {children}
            </main>

            <footer className="bg-primary-green text-white py-6 mt-auto">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm font-medium opacity-90">
                        جميع الحقوق محفوظة جمعية بذور الأمل © 2025
                    </p>
                </div>
            </footer>
        </div>
    );
}
