import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';

export default function Trash() {
    const [trashItems, setTrashItems] = useState(() => {
        const saved = localStorage.getItem('trash');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('trash', JSON.stringify(trashItems));
    }, [trashItems]);

    // Safety cleanup: Ensure no null/undefined items in trash
    useEffect(() => {
        if (trashItems.some(i => !i || !i.id)) {
            setTrashItems(prev => prev.filter(i => i && i.id));
        }
    }, []);

    const handleRestore = (item) => {
        if (confirm('هل أنت متأكد من استعادة هذا العنصر؟')) {
            // Determine target storage based on source
            const targetStorageKey = item.source; // 'levels', 'contents', 'events'
            const currentData = JSON.parse(localStorage.getItem(targetStorageKey) || '[]');

            // Add back to list
            const restoredItem = item.originalData;

            // For levels/contents/events, we just push it back. 
            // Note: ID conflicts might occur if a new item was created with same ID (unlikely with Date.now() but strictly possible).
            // We assume IDs are unique enough (Date.now()).

            const updatedData = [...currentData, restoredItem];
            localStorage.setItem(targetStorageKey, JSON.stringify(updatedData));

            // Remove from trash
            const newTrash = trashItems.filter(t => t.id !== item.id);
            setTrashItems(newTrash);

            // Dispatch storage event so other tabs/components update
            window.dispatchEvent(new Event('storage'));

            alert('تمت استعادة العنصر بنجاح');
        }
    };

    const handleDeleteForever = (id) => {
        if (confirm('هل أنت متأكد من الحذف النهائي؟ لا يمكن التراجع عن هذا الإجراء.')) {
            const newTrash = trashItems.filter(t => t.id !== id);
            setTrashItems(newTrash);
        }
    };

    const handleEmptyTrash = () => {
        if (confirm('هل أنت متأكد من تفريغ سلة المهملات بالكامل؟')) {
            setTrashItems([]);
        }
    };

    const getSourceLabel = (source) => {
        switch (source) {
            case 'levels': return { text: 'مستوى دراسي', color: 'bg-blue-100 text-blue-700' };
            case 'contents': return { text: 'محتوى', color: 'bg-purple-100 text-purple-700' };
            case 'events': return { text: 'حدث', color: 'bg-orange-100 text-orange-700' };
            default: return { text: 'عنصر', color: 'bg-gray-100 text-gray-700' };
        }
    };

    const [selectedIds, setSelectedIds] = useState([]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(trashItems.map(i => i.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkRestore = () => {
        if (confirm(`هل أنت متأكد من استعادة ${selectedIds.length} عناصر؟`)) {
            const itemsToRestore = trashItems.filter(i => selectedIds.includes(i.id));

            itemsToRestore.forEach(item => {
                const targetStorageKey = item.source;
                const currentData = JSON.parse(localStorage.getItem(targetStorageKey) || '[]');
                // Basic restoration without deep conflict check
                const updatedData = [...currentData, item.originalData];
                localStorage.setItem(targetStorageKey, JSON.stringify(updatedData));
            });

            // Remove from trash
            const newTrash = trashItems.filter(i => !selectedIds.includes(i.id));
            setTrashItems(newTrash);
            setSelectedIds([]);
            window.dispatchEvent(new Event('storage'));
            alert('تمت استعادة العناصر المحددة بنجاح');
        }
    };

    const handleBulkDeleteForever = () => {
        if (confirm(`هل أنت متأكد من الحذف النهائي لـ ${selectedIds.length} عناصر؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
            const newTrash = trashItems.filter(i => !selectedIds.includes(i.id));
            setTrashItems(newTrash);
            setSelectedIds([]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Trash2 className="text-red-500" />
                    سلة المحذوفات
                </h1>
                {trashItems.length > 0 && (
                    <button
                        onClick={handleEmptyTrash}
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                    >
                        <Trash2 size={18} />
                        تفريغ السلة
                    </button>
                )}
            </div>

            {selectedIds.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 border border-blue-100">
                    <span className="font-bold text-blue-800">تم تحديد {selectedIds.length} عناصر</span>
                    <div className="flex gap-2">
                        <button
                            onClick={handleBulkRestore}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <RefreshCw size={18} />
                            <span>استعادة المحدد</span>
                        </button>
                        <button
                            onClick={handleBulkDeleteForever}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <Trash2 size={18} />
                            <span>حذف نهائي</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="border-b border-gray-100 text-sm text-gray-500">
                                <th className="p-4 w-10">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={trashItems.length > 0 && selectedIds.length === trashItems.length}
                                        className="w-4 h-4 rounded border-gray-300 text-primary-green focus:ring-primary-green"
                                    />
                                </th>
                                <th className="p-4">العنصر</th>
                                <th className="p-4">الأصل</th>
                                <th className="p-4">حذف بواسطة</th>
                                <th className="p-4">تاريخ الحذف</th>
                                <th className="p-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trashItems.map(item => (
                                <tr key={item.id} className={`border-b border-gray-50 hover:bg-gray-50 ${selectedIds.includes(item.id) ? 'bg-blue-50' : ''}`}>
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            onChange={() => handleSelectOne(item.id)}
                                            checked={selectedIds.includes(item.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-primary-green focus:ring-primary-green"
                                        />
                                    </td>
                                    <td className="p-4 font-medium text-gray-800">
                                        {item.originalData?.title || item.originalData?.name || 'بدون عنوان'}
                                    </td>
                                    <td className="p-4">
                                        {(() => {
                                            const label = getSourceLabel(item.source);
                                            return (
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${label.color}`}>
                                                    {label.text}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td className="p-4 text-gray-600 text-sm">{item.deletedBy || 'غير معروف'}</td>
                                    <td className="p-4 text-gray-500 text-sm">
                                        {item.deletedAt && !isNaN(new Date(item.deletedAt).getTime())
                                            ? new Date(item.deletedAt).toLocaleString('ar-SA')
                                            : 'تاريخ غير صالح'}
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button
                                            onClick={() => handleRestore(item)}
                                            className="text-green-600 hover:bg-green-50 p-2 rounded-lg flex items-center gap-1 text-sm font-medium"
                                            title="استعادة"
                                        >
                                            <RefreshCw size={16} />
                                            استعادة
                                        </button>
                                        <button
                                            onClick={() => handleDeleteForever(item.id)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg flex items-center gap-1 text-sm font-medium"
                                            title="حذف نهائي"
                                        >
                                            <Trash2 size={16} />
                                            حذف
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {trashItems.length === 0 && (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-4">
                        <Trash2 size={48} className="text-gray-300" />
                        <p>سلة المحذوفات فارغة حالياً.</p>
                    </div>
                )}
            </div>

            <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 text-blue-800 text-sm">
                <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                <p>
                    تنبيه: العناصر الموجودة هنا محذوفة مؤقتاً ويمكن استعادتها. الحذف النهائي من هذه القائمة لا يمكن التراجع عنه.
                </p>
            </div>
        </div>
    );
}
