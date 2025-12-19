import { useEffect, useState } from 'react';
import { dbService } from '../../services/db';
import { formatDate } from '../../utils/dateUtils';
import { RotateCcw, Trash2, AlertTriangle, CheckSquare, Square, Check } from 'lucide-react';
import { BackButton } from '../../components/Navbar';

export default function Trash() {
    const [trashItems, setTrashItems] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [items, usersList] = await Promise.all([
                dbService.getAll("trash"),
                dbService.getAll("users")
            ]);
            // Sort by deletedAt desc
            setTrashItems(items.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt)));
            setUsers(usersList);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getUserEmail = (uid) => {
        if (uid === 'system') return 'system';
        const user = users.find(u => u.id === uid || u.uid === uid); // Check Firestore ID or Auth UID if stored
        // In seed, we stored user objects, ID is doc ID. Auth ID might not be linked directly unless we did that.
        // Assuming deletedBy stored existing user ID. 
        // If deletedBy is Firebase Auth UID, we might need to check if we stored that in our users collection.
        // Let's assume best effort lookup.
        return user ? user.email : uid;
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(trashItems.map(i => i.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id, checked) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(i => i !== id));
        }
    };

    const handleRestore = async (ids) => {
        if (!confirm(`هل أنت متأكد من استعادة ${ids.length} عنصر/عناصر؟`)) return;
        try {
            await Promise.all(ids.map(id => dbService.restore(id)));
            setTrashItems(prev => prev.filter(item => !ids.includes(item.id)));
            setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
            alert("تمت الاستعادة بنجاح");
        } catch (error) {
            console.error(error);
            alert("فشل في الاستعادة");
        }
    };

    const handleHardDelete = async (ids) => {
        if (!confirm(`هل أنت متأكد من الحذف النهائي لـ ${ids.length} عنصر/عناصر؟ لا يمكن التراجع عن هذا الإجراء.`)) return;
        try {
            await Promise.all(ids.map(id => dbService.hardDelete("trash", id)));
            setTrashItems(prev => prev.filter(item => !ids.includes(item.id)));
            setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
        } catch (error) {
            console.error(error);
            alert("فشل في الحذف النهائي");
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">سلة المحذوفات</h1>
                <BackButton />
            </div>

            {selectedIds.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <span className="font-bold text-blue-700">تم تحديد {selectedIds.length} عنصر</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleRestore(selectedIds)}
                            className="bg-white text-green-600 border border-green-200 px-4 py-2 rounded-lg hover:bg-green-50 font-bold flex items-center gap-2"
                        >
                            <RotateCcw size={18} />
                            استعادة المحدد
                        </button>
                        <button
                            onClick={() => handleHardDelete(selectedIds)}
                            className="bg-white text-red-500 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 font-bold flex items-center gap-2"
                        >
                            <Trash2 size={18} />
                            حذف نهائي
                        </button>
                    </div>
                </div>
            )}

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
                                    <th className="p-4 w-12">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-primary-green focus:ring-primary-green"
                                            checked={selectedIds.length === trashItems.length && trashItems.length > 0}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th className="p-4">العنوان / المعرف</th>
                                    <th className="p-4">المصدر</th>
                                    <th className="p-4">تاريخ الحذف</th>
                                    <th className="p-4">بواسطة (Deleted By)</th>
                                    <th className="p-4">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {trashItems.map((item) => (
                                    <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(item.id) ? 'bg-blue-50/30' : ''}`}>
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-primary-green focus:ring-primary-green"
                                                checked={selectedIds.includes(item.id)}
                                                onChange={(e) => handleSelectOne(item.id, e.target.checked)}
                                            />
                                        </td>
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
                                        <td className="p-4 text-gray-500 dir-ltr text-right">
                                            {getUserEmail(item.deletedBy)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleRestore([item.id])}
                                                    title="استعادة"
                                                    className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors"
                                                >
                                                    <RotateCcw size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleHardDelete([item.id])}
                                                    title="حذف نهائي"
                                                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
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
