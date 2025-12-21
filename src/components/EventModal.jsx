import { X, Clock, MapPin, User, Tag, Layers, GitBranch } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

export default function EventModal({ event, onClose }) {
    if (!event) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-bold text-gray-800 text-lg">{event.title}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-gray-600">
                        <Clock className="text-primary-green" size={20} />
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-400">الوقت والتاريخ</span>
                            <span className="font-medium dir-ltr text-right">
                                {formatDate(event.start, 'EEEE d MMMM yyyy - h:mm a')}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-600">
                        <Layers className="text-indigo-500" size={20} />
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-400">المستوى</span>
                            <span className="font-medium">{event.levelName || 'عام (لكل الطلاب)'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-600">
                        <GitBranch className="text-teal-500" size={20} />
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-400">الفرع</span>
                            <span className="font-medium">{event.branchName || 'عام / مشترك'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-600">
                        <User className="text-orange-500" size={20} />
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-400">المؤطرة</span>
                            <span className="font-medium">{event.teacherName || 'غير محدد'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-600">
                        <MapPin className="text-blue-500" size={20} />
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-400">القاعة</span>
                            <span className="font-medium">{event.roomName || 'غير محدد'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-600">
                        <Tag className="text-purple-500" size={20} />
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-400">نوع النشاط</span>
                            <span className="font-medium">{
                                event.type === 'class' ? 'حصة دراسية' :
                                    event.type === 'activity' ? 'نشاط' :
                                        event.type === 'meeting' ? 'اجتماع' :
                                            event.type === 'exam' ? 'امتحان' :
                                                event.type === 'vacation' ? 'عطلة' : 'عام'
                            }</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
}
