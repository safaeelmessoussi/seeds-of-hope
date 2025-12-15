import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function Home() {
    const [levels, setLevels] = useState(() => {
        const saved = localStorage.getItem('levels');
        return saved ? JSON.parse(saved) : [
            { id: 1, title: 'المستوى الأول', description: 'تعليم القراءة والكتابة للمبتدئين' },
            { id: 2, title: 'المستوى الثاني', description: 'بناء الجمل والقواعد الأساسية' },
            { id: 3, title: 'المستوى الثالث', description: 'قراءة النصوص المتقدمة' },
            { id: 4, title: 'تحفيظ القرآن', description: 'حلقات تحفيظ وتجويد القرآن الكريم' },
        ];
    });

    useEffect(() => {
        const handleStorageChange = () => {
            const saved = localStorage.getItem('levels');
            if (saved) {
                setLevels(JSON.parse(saved));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);
    return (
        <div className="space-y-8">
            <header className="text-center py-10 bg-white rounded-2xl shadow-sm border border-orange-100">
                <h1 className="text-4xl font-bold text-primary-green mb-4">مرحباً بكم في جمعية بذور الأمل</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    منصتكم التعليمية المتكاملة للمرأة والطفل. اختر المستوى الدراسي للوصول إلى المحتوى.
                </p>
            </header>

            <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-r-4 border-primary-orange pr-3">
                    المستويات الدراسية
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {levels.map((level) => (
                        <Link
                            key={level.id}
                            to={`/level/${level.id}`}
                            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-primary-orange group flex flex-col items-center text-center"
                        >
                            <div className="w-16 h-16 bg-orange-100 text-primary-orange rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <BookOpen size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary-orange transition-colors">{level.title}</h3>
                            <p className="text-gray-600">{level.description}</p>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
