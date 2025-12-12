import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Video, FileText, Image as ImageIcon, Headphones } from 'lucide-react';

const mockContent = [
    { id: 1, type: 'video', title: 'الدرس الأول: الحروف الهجائية', url: '#' },
    { id: 2, type: 'pdf', title: 'كراسة التمارين - الجزء 1', url: '#' },
    { id: 3, type: 'audio', title: 'تلاوة سورة الفاتحة', url: '#' },
    { id: 4, type: 'image', title: 'جدول الحروف', url: '#' },
];

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

    return (
        <div className="space-y-6">
            <Link to="/" className="inline-flex items-center text-gray-500 hover:text-primary-orange transition-colors">
                <ArrowRight size={16} className="ml-2" />
                العودة للرئيسية
            </Link>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">محتوى المستوى {id}</h1>
                <p className="text-gray-600">تصفح المصادر التعليمية المتاحة لهذا المستوى.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {mockContent.map((item) => (
                    <a
                        key={item.id}
                        href={item.url}
                        className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center gap-3 border border-gray-100"
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center 
              ${item.type === 'video' ? 'bg-red-100 text-red-500' :
                                item.type === 'pdf' ? 'bg-blue-100 text-blue-500' :
                                    item.type === 'audio' ? 'bg-purple-100 text-purple-500' :
                                        'bg-green-100 text-green-500'}`}>
                            {getIcon(item.type)}
                        </div>
                        <span className="font-medium text-gray-700">{item.title}</span>
                    </a>
                ))}
            </div>
        </div>
    );
}
