
import { useParams, useSearchParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Video, Headphones, FileText, Download, ExternalLink } from 'lucide-react';
import { BackButton } from '../../components/Navbar';
import { useEffect, useState, useRef } from 'react';

export default function LevelContent() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const highlightId = searchParams.get('highlight');
    const { data } = useData();
    const [highlightedContent, setHighlightedContent] = useState(highlightId);
    const highlightRef = useRef(null);

    // Find the level details
    const level = data.levels?.find(l => l.id === id);

    // ...
    // Filter content for this level
    const thisLevelContent = data.contents?.filter(c => c.levelId === id) || [];

    // Group by schoolYear
    const groupedContent = {};
    thisLevelContent.forEach(item => {
        const year = item.schoolYear || '2025-2026'; // Default/Fallback
        if (!groupedContent[year]) groupedContent[year] = [];
        groupedContent[year].push(item);
    });

    // Sort years descending
    const sortedYears = Object.keys(groupedContent).sort().reverse();

    // Scroll to highlighted content and clear highlight after delay
    useEffect(() => {
        if (highlightId && highlightRef.current) {
            // Scroll to element with offset for header
            setTimeout(() => {
                highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);

            // Clear highlight after 5 seconds
            const timer = setTimeout(() => {
                setHighlightedContent(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [highlightId]);

    if (!level) {
        // ... (Keep existing error state)
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
                <p>لم يتم العثور على المستوى المطلوب</p>
                <div className="mt-4">
                    <BackButton />
                </div>
            </div>
        );
    }
    // ...

    const getIcon = (type) => {
        switch (type) {
            case 'video': return <Video size={24} className="text-red-500" />;
            case 'audio': return <Headphones size={24} className="text-purple-500" />;
            case 'pdf': return <FileText size={24} className="text-blue-500" />;
            default: return <FileText size={24} className="text-gray-500" />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'video': return 'فيديو';
            case 'audio': return 'تسجيل صوتي';
            case 'pdf': return 'ملف للقراءة';
            default: return 'ملف';
        }
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{level.title}</h1>
                    <p className="text-gray-500">{level.description || 'محتوى تعليمي ودروس خاصة بهذا المستوى'}</p>
                </div>
                <BackButton />
            </div>

            {/* Content Groups by Year */}
            {sortedYears.length > 0 ? (
                sortedYears.map(year => {
                    // Filter content for this year
                    const yearContent = groupedContent[year];

                    // Group by Branch
                    const contentByBranch = {};
                    yearContent.forEach(item => {
                        const branchId = item.branchId || 'general';
                        if (!contentByBranch[branchId]) contentByBranch[branchId] = [];
                        contentByBranch[branchId].push(item);
                    });

                    // Get list of branches to display (only those that have content)
                    const branchesWithContent = Object.keys(contentByBranch);

                    return (
                        <div key={year} className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h2 className="text-xl font-bold text-gray-800 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm inline-block">
                                    السنة الدراسية: {year}
                                </h2>
                                <div className="h-px bg-gray-200 flex-1"></div>
                            </div>

                            <div className="flex flex-col gap-8 px-4">
                                {branchesWithContent.map(branchId => {
                                    const branch = data.branches?.find(b => b.id === branchId);
                                    const branchName = branch ? branch.name : (branchId === 'general' ? 'عام / مشترك' : 'فرع غير محدد');

                                    return (
                                        <div key={branchId} className="space-y-4">
                                            <h3 className="text-lg font-bold text-primary-green flex items-center gap-2 border-r-4 border-primary-green pr-3">
                                                {branchName}
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {contentByBranch[branchId].map((item) => {
                                                    const isHighlighted = item.id === highlightedContent;
                                                    return (
                                                        <div
                                                            key={item.id}
                                                            ref={isHighlighted ? highlightRef : null}
                                                            className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all group ${isHighlighted
                                                                ? 'border-primary-green border-2 ring-4 ring-primary-green/30 animate-pulse'
                                                                : 'border-gray-100'
                                                                }`}
                                                        >
                                                            <div className="p-6">
                                                                <div className="flex items-start justify-between mb-4">
                                                                    <div className="bg-gray-50 p-3 rounded-lg group-hover:bg-gray-100 transition-colors">
                                                                        {getIcon(item.type)}
                                                                    </div>
                                                                    <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600">
                                                                        {getTypeLabel(item.type)}
                                                                    </span>
                                                                </div>
                                                                <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{item.title}</h3>

                                                                <div className="space-y-2 mt-4">
                                                                    {(item.urls || [item.url]).map((url, idx) => {
                                                                        if (!url) return null;
                                                                        return (
                                                                            <a
                                                                                key={idx}
                                                                                href={url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-primary-green hover:bg-green-50/10 text-sm text-gray-600 hover:text-primary-green transition-all"
                                                                            >
                                                                                <span className="truncate flex-1 ml-2 dir-ltr text-left">{url}</span>
                                                                                <ExternalLink size={16} />
                                                                            </a>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">لا يوجد محتوى حالياً</h3>
                    <p className="text-gray-500">لم يتم إضافة أي دروس أو ملفات لهذا المستوى بعد.</p>
                </div >
            )
            }
        </div >
    );

}
