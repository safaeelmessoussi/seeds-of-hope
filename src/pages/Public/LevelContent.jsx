
import { useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Video, Headphones, FileText, Download, ExternalLink } from 'lucide-react';
import { BackButton } from '../../components/Navbar';

export default function LevelContent() {
    const { id } = useParams();
    const { data } = useData();

    // Find the level details
    const level = data.levels?.find(l => l.id === id);

    // Filter content for this level
    const levelContent = data.contents?.filter(c => c.levelId === id) || [];

    if (!level) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
                <p>لم يتم العثور على المستوى المطلوب</p>
                <div className="mt-4">
                    <BackButton />
                </div>
            </div>
        );
    }

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

            {/* Content Grid */}
            {levelContent.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {levelContent.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
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
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">لا يوجد محتوى حالياً</h3>
                    <p className="text-gray-500">لم يتم إضافة أي دروس أو ملفات لهذا المستوى بعد.</p>
                </div>
            )}
        </div>
    );
}
