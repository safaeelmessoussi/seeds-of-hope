import { useData } from '../../context/DataContext';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
    const { data, loading } = useData();

    return (
        <div className="flex flex-col gap-8">
            {/* Hero Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-primary-green mb-4">
                    مرحباً بكم في جمعية بذور الأمل
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    منصتكم التعليمية المتكاملة للمرأة والطفل، اختر المستوى الدراسي للوصول إلى المحتوى.
                </p>
            </div>

            {/* Levels Section */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2 border-r-4 border-primary-orange pr-3">
                    <h2 className="text-xl font-bold text-gray-800">
                        المستويات الدراسية
                    </h2>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-400">
                        جاري التحميل...
                    </div>
                ) : data.levels && data.levels.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.levels.map((level) => (
                            <Link
                                key={level.id}
                                to={`/level/${level.id}`}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center gap-4 hover:shadow-md hover:border-primary-orange transition-all group"
                            >
                                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center group-hover:bg-primary-orange group-hover:text-white transition-colors text-primary-orange">
                                    <BookOpen size={28} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary-orange transition-colors">
                                    {level.title}
                                </h3>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm">
                            لا توجد مستويات دراسية حالياً
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
