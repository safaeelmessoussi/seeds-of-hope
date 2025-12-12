import { useState } from 'react';
import { Plus, Trash, Edit } from 'lucide-react';

export default function ManageLevels() {
    const [levels, setLevels] = useState([
        { id: 1, title: 'المستوى الأول', description: 'تعليم القراءة والكتابة للمبتدئين' },
        { id: 2, title: 'المستوى الثاني', description: 'بناء الجمل والقواعد الأساسية' },
    ]);

    // Simple state management for demo
    const handleDelete = (id) => {
        if (window.confirm('هل أنت متأكد من الحذف؟')) {
            setLevels(levels.filter(l => l.id !== id));
        }
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">إدارة المستويات</h1>
                <button className="bg-primary-green text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-colors">
                    <Plus size={20} />
                    <span>إضافة مستوى</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="p-4 font-bold text-gray-700">العنوان</th>
                            <th className="p-4 font-bold text-gray-700">الوصف</th>
                            <th className="p-4 font-bold text-gray-700">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {levels.map(level => (
                            <tr key={level.id} className="border-b border-gray-50 hover:bg-gray-50">
                                <td className="p-4 font-medium">{level.title}</td>
                                <td className="p-4 text-gray-600">{level.description}</td>
                                <td className="p-4 flex gap-2">
                                    <button className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg" title="تعديل">
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(level.id)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                                        title="حذف"
                                    >
                                        <Trash size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
