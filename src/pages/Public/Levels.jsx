import { useData } from '../../context/DataContext';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Levels() {
    const { data, loading } = useData();

    // Filter levels to only show those that have content associated with them
    const visibleLevels = data.levels?.filter(level =>
        data.contents?.some(content => content.levelId === level.id)
    ) || [];

    // Sort: women → girls → children, then by order within category
    const sortedLevels = [...visibleLevels].sort((a, b) => {
        const categoryOrder = { women: 1, girls: 2, children: 3 };
        const catA = categoryOrder[a.category] || 99;
        const catB = categoryOrder[b.category] || 99;
        if (catA !== catB) return catA - catB;
        return (a.order || 0) - (b.order || 0);
    });

    // Group by category
    const groupedLevels = {
        women: sortedLevels.filter(l => l.category === 'women'),
        girls: sortedLevels.filter(l => l.category === 'girls'),
        children: sortedLevels.filter(l => l.category === 'children'),
    };

    const categoryLabels = {
        women: 'برنامج النساء',
        girls: 'برنامج الفتيات',
        children: 'برنامج الأطفال'
    };

    const categoryColors = {
        women: 'border-pink-300 hover:border-pink-500',
        girls: 'border-purple-300 hover:border-purple-500',
        children: 'border-blue-300 hover:border-blue-500'
    };

    const categoryBg = {
        women: 'bg-pink-50 text-pink-600 group-hover:bg-pink-500',
        girls: 'bg-purple-50 text-purple-600 group-hover:bg-purple-500',
        children: 'bg-blue-50 text-blue-600 group-hover:bg-blue-500'
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-primary-green mb-4">
                    المحتوى التعليمي
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    اختر المستوى الدراسي للوصول إلى المحتوى.
                </p>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-400">جاري التحميل...</div>
            ) : sortedLevels.length > 0 ? (
                <div className="flex flex-col gap-8">
                    {Object.entries(groupedLevels).map(([category, levels]) => {
                        if (levels.length === 0) return null;
                        return (
                            <div key={category} className="flex flex-col gap-4">
                                <div className="flex items-center gap-2 border-r-4 border-primary-orange pr-3">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {categoryLabels[category]}
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {levels.map((level) => (
                                        <Link
                                            key={level.id}
                                            to={`/level/${level.id}`}
                                            className={`bg-white rounded-xl shadow-sm border-2 ${categoryColors[category]} p-8 flex flex-col items-center gap-4 hover:shadow-md transition-all group`}
                                        >
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${categoryBg[category]} group-hover:text-white transition-colors`}>
                                                <BookOpen size={28} />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary-green transition-colors">
                                                {level.title}
                                            </h3>
                                            {level.description && (
                                                <p className="text-sm text-gray-500 text-center">{level.description}</p>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-400 text-sm">
                        {(data.levels && data.levels.length > 0)
                            ? "لا يوجد محتوى متاح حالياً في أي مستوى"
                            : "لا توجد مستويات دراسية حالياً"}
                    </p>
                </div>
            )}
        </div>
    );
}
