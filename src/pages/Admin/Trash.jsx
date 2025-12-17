import { useEffect, useState } from 'react';
import { dbService } from '../../services/db';
import { formatDate } from '../../utils/dateUtils';
import { RotateCcw, Trash2, AlertTriangle } from 'lucide-react';
import { BackButton } from '../../components/Navbar';

export default function Trash() {
    const [trashItems, setTrashItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTrash = async () => {
        setLoading(true);
        try {
            const items = await dbService.getAll("trash");
            // Sort by deletedAt desc
            setTrashItems(items.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt)));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrash();
    }, []);

    const handleRestore = async (id) => {
        if (!confirm("هل أنت متأكد من استعادة هذا العنصر؟")) return;
        try {
            await dbService.restore(id);
            setTrashItems(prev => prev.filter(item => item.id !== id));
            alert("تمت الاستعادة بنجاح");
        } catch (error) {
            alert("فشل في الاستعادة");
        }
    };

    const handleHardDelete = async (id) => {
        if (!confirm("هل أنت متأكد من الحذف النهائي؟ لا يمكن التراجع عن هذا الإجراء.")) return;
        try {
            await dbService.hardDelete("trash", id);
            setTrashItems(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            alert("فشل في الحذف النهائي");
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">سلة المحذوفات</h1>
                <BackButton />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
                ) : trashItems.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">سلة المحذوفات فارغة</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="p-4">العنوان / المعرف</th>
                                    <th className="p-4">المصدر</th>
                                    <th className="p-4">تاريخ الحذف</th>
                                    <th className="p-4">بواسطة</th>
                                    <th className="p-4">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {trashItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-gray-800 line-clamp-1 block">
                                            {item.originalData.title || item.originalData.name || item.originalId}
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs px-2">
                                                {item.source}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-500 dir-ltr text-right">
                                            {formatDate(item.deletedAt)}
                                        </td>
                                        <td className="p-4 text-gray-500">
                                            {item.deletedBy}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleRestore(item.id)}
                                                    className="flex items-center gap-1 text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                                                >
                                                    <RotateCcw size={16} />
                                                    <span>استعادة</span>
                                                </button>
                                                <button
                                                    onClick={() => handleHardDelete(item.id)}
                                                    className="flex items-center gap-1 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                                                >
                                                    <Trash2 size={16} />
                                                    <span>حذف</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Alert Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="text-blue-500 shrink-0 mt-1" size={20} />
                <div>
                    <h4 className="font-bold text-blue-700 mb-1">تنبيه هام</h4>
                    <p className="text-blue-600 text-sm leading-relaxed">
                        العناصر الموجودة هنا محذوفة مؤقتاً ويمكن استعادتها. الحذف النهائي من هذه القائمة لا يمكن التراجع عنه.
                    </p>
                </div>
            </div>
        </div>
    );
}
