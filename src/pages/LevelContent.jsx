import { useParams } from 'react-router-dom';
import { Video, FileText, Image as ImageIcon, Headphones, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';

const getIcon = (type) => {
    switch (type) {
        case 'video': return <Video size={20} />;
        case 'pdf': return <FileText size={20} />;
        case 'audio': return <Headphones size={20} />;
        default: return <ImageIcon size={20} />;
    }
};

export default function LevelContent() {
    const { id } = useParams();
    const [levelContent, setLevelContent] = useState([]);
    const [levelTitle, setLevelTitle] = useState('');

    useEffect(() => {
        // Get content from localStorage
        const savedContent = localStorage.getItem('contents');
        const contents = savedContent ? JSON.parse(savedContent) : [];

        // Filter content for this level
        // Admin saves level as '1', '2', '3', '4'
        const filtered = contents.filter(item => item.level === id);
        setLevelContent(filtered);

        // Get level title from localStorage (levels) to display correct name
        const savedLevels = localStorage.getItem('levels');
        if (savedLevels) {
            const levels = JSON.parse(savedLevels);
            const currentLevel = levels.find(l => l.id.toString() === id);
            if (currentLevel) setLevelTitle(currentLevel.title);
        } else {
            // Fallback titles if no levels found
            const titles = {
                '1': 'المستوى الأول',
                '2': 'المستوى الثاني',
                '3': 'المستوى الثالث',
                '4': 'تحفيظ القرآن'
            };
            setLevelTitle(titles[id] || `المستوى ${id}`);
        }

    }, [id]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">محتوى {levelTitle}</h1>
                <p className="text-gray-600">تصفح المصادر التعليمية المتاحة لهذا المستوى.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {levelContent.length > 0 ? (
                    levelContent.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col gap-4"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center 
                      ${item.type === 'video' ? 'bg-red-100 text-red-500' :
                                        item.type === 'pdf' ? 'bg-blue-100 text-blue-500' :
                                            item.type === 'audio' ? 'bg-purple-100 text-purple-500' :
                                                'bg-green-100 text-green-500'}`}>
                                    {getIcon(item.type)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg leading-tight">{item.title}</h3>
                                    <span className="text-xs text-gray-500 mt-1 block">{item.date}</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3 space-y-2 mt-auto">
                                <p className="text-xs font-bold text-gray-500 mb-1">الروابط:</p>
                                {item.urls && item.urls.length > 0 ? (
                                    item.urls.map((url, idx) => (
                                        <a
                                            key={idx}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-primary-green hover:underline bg-white p-2 rounded border border-gray-200 hover:border-primary-green transition-colors"
                                        >
                                            <ExternalLink size={14} />
                                            <span>رابط {idx + 1}</span>
                                        </a>
                                    ))
                                ) : (item.url && (
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-primary-green hover:underline bg-white p-2 rounded border border-gray-200 hover:border-primary-green transition-colors"
                                    >
                                        <ExternalLink size={14} />
                                        <span>رابط للمحتوى</span>
                                    </a>
                                ))}
                                {(!item.urls || item.urls.length === 0) && !item.url && (
                                    <span className="text-sm text-gray-400 italic">لا توجد روابط</span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                        لا يوجد محتوى مضاف لهذا المستوى حتى الآن.
                    </div>
                )}
            </div>
        </div>
    );
}
