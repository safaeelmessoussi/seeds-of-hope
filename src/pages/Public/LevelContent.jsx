
import { useParams, useSearchParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Video, Headphones, FileText, Download, ExternalLink, Image as ImageIcon, Play } from 'lucide-react';
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
            case 'image': return <ImageIcon size={24} className="text-green-500" />;
            default: return <FileText size={24} className="text-gray-500" />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'video': return 'فيديو';
            case 'audio': return 'تسجيل صوتي';
            case 'pdf': return 'ملف للقراءة';
            case 'image': return 'صورة';
            default: return 'ملف';
        }
    };

    // Render inline media player based on type
    const renderMedia = (url, type) => {
        if (!url) return null;

        // YouTube embed
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let videoId = '';
            if (url.includes('youtube.com/watch')) {
                videoId = new URL(url).searchParams.get('v');
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1]?.split('?')[0];
            }
            if (videoId) {
                return (
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                );
            }
        }

        // Google Drive - convert to direct download link for audio/video
        let mediaUrl = url;
        if (url.includes('drive.google.com')) {
            // Extract file ID from various Google Drive URL formats
            let fileId = '';
            if (url.includes('/file/d/')) {
                fileId = url.split('/file/d/')[1]?.split('/')[0]?.split('?')[0];
            } else if (url.includes('id=')) {
                fileId = new URL(url).searchParams.get('id');
            }

            if (fileId) {
                // Use direct download format for audio/video
                if (type === 'audio' || type === 'video') {
                    mediaUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
                } else if (type === 'image') {
                    mediaUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
                } else if (type === 'pdf') {
                    // For PDF, show Google Drive viewer
                    return (
                        <a
                            href={`https://drive.google.com/file/d/${fileId}/view`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                            <FileText size={20} />
                            <span>فتح الملف PDF</span>
                            <ExternalLink size={16} />
                        </a>
                    );
                }
            }
        }

        switch (type) {
            case 'video':
                return (
                    <video
                        controls
                        className="w-full rounded-lg bg-black max-h-[300px]"
                        preload="metadata"
                    >
                        <source src={mediaUrl} />
                        المتصفح لا يدعم تشغيل الفيديو
                    </video>
                );
            case 'audio':
                return (
                    <div className="space-y-2">
                        <audio
                            controls
                            className="w-full"
                            preload="metadata"
                        >
                            <source src={mediaUrl} />
                            المتصفح لا يدعم تشغيل الصوت
                        </audio>
                        {url.includes('drive.google.com') && (
                            <a
                                href={mediaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 p-2 bg-purple-50 rounded-lg text-purple-600 hover:bg-purple-100 transition-colors text-sm"
                            >
                                <Download size={16} />
                                <span>تحميل الملف الصوتي</span>
                            </a>
                        )}
                    </div>
                );
            case 'image':
                return (
                    <img
                        src={mediaUrl}
                        alt="صورة"
                        className="w-full rounded-lg object-cover max-h-[300px] cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(url, '_blank')}
                    />
                );
            case 'pdf':
                return (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                        <FileText size={20} />
                        <span>فتح الملف PDF</span>
                        <ExternalLink size={16} />
                    </a>
                );
            default:
                return (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-primary-green hover:bg-green-50/10 text-sm text-gray-600 hover:text-primary-green transition-all"
                    >
                        <span className="truncate flex-1 ml-2 dir-ltr text-left">{url}</span>
                        <ExternalLink size={16} />
                    </a>
                );
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

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                {contentByBranch[branchId].map((item) => {
                                                    const isHighlighted = item.id === highlightedContent;
                                                    return (
                                                        <div
                                                            key={item.id}
                                                            ref={isHighlighted ? highlightRef : null}
                                                            className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all ${isHighlighted
                                                                ? 'border-primary-green border-2 ring-4 ring-primary-green/30 animate-pulse'
                                                                : 'border-gray-100'
                                                                }`}
                                                        >
                                                            {/* Media Preview */}
                                                            <div className="bg-gray-50">
                                                                {(item.urls || [item.url]).slice(0, 1).map((url, idx) => (
                                                                    <div key={idx}>
                                                                        {renderMedia(url, item.type)}
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Content Info */}
                                                            <div className="p-4">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    {getIcon(item.type)}
                                                                    <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                                                                        {getTypeLabel(item.type)}
                                                                    </span>
                                                                </div>
                                                                <h3 className="font-bold text-gray-800 text-sm line-clamp-2">{item.title}</h3>
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
