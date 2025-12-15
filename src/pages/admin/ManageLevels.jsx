import { useState, useEffect } from 'react';
import { Plus, Trash, Edit, Save, BookOpen } from 'lucide-react';

export default function ManageLevels() {
    const [levels, setLevels] = useState(() => {
        const saved = localStorage.getItem('levels');
        return saved ? JSON.parse(saved) : [
            { id: 1, title: 'المستوى الأول', description: 'تعليم القراءة والكتابة للمبتدئين' },
            { id: 2, title: 'المستوى الثاني', description: 'بناء الجمل والقواعد الأساسية' },
        ];
    });

    useEffect(() => {
        localStorage.setItem('levels', JSON.stringify(levels));
    }, [levels]);

    const [newLevel, setNewLevel] = useState({ title: '', description: '' });
    const [selectedIds, setSelectedIds] = useState([]);
    const [editingId, setEditingId] = useState(null);

    // Independent actions
    const handleDelete = (id) => {
        if (confirm('هل أنت متأكد من حذف هذا المستوى؟ سيتم نقله إلى سلة المحذوفات.')) {
            const itemToDelete = levels.find(l => l.id === id);

            // Add to Trash
            const trashItem = {
                id: Date.now(),
                source: 'levels',
                originalData: itemToDelete,
                deletedBy: 'admin@seeds.com',
                deletedAt: new Date().toISOString()
            };
            const currentTrash = JSON.parse(localStorage.getItem('trash') || '[]');
            localStorage.setItem('trash', JSON.stringify([...currentTrash, trashItem]));

            // Remove from Levels
            setLevels(levels.filter(l => l.id !== id));
            setSelectedIds(selectedIds.filter(sid => sid !== id));
            if (editingId === id) {
                setEditingId(null);
                setNewLevel({ title: '', description: '' });
            }
        }
    };

    const handleEdit = (level) => {
        setNewLevel({ title: level.title, description: level.description });
        setEditingId(level.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setNewLevel({ title: '', description: '' });
        setEditingId(null);
    };

    // Bulk actions
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(levels.map(l => l.id));
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

    const handleBulkDelete = () => {
        if (window.confirm(`هل أنت متأكد من حذف ${selectedIds.length} عناصر؟`)) {
            setLevels(levels.filter(l => !selectedIds.includes(l.id)));
            setSelectedIds([]);
            if (selectedIds.includes(editingId)) {
                setEditingId(null);
                setNewLevel({ title: '', description: '' });
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newLevel.title) return;

        if (editingId) {
            // Update existing level
            setLevels(levels.map(l => l.id === editingId ? { ...l, ...newLevel } : l));
            setEditingId(null);
        } else {
            // Add new level
            const level = {
                id: Date.now(),
                ...newLevel
            };
            setLevels([...levels, level]);
        }
        setNewLevel({ title: '', description: '' });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">إدارة المستويات</h1>
            </div>

            {/* Add/Edit Level Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <BookOpen size={20} />
                    {editingId ? 'تعديل المستوى' : 'إضافة مستوى جديد'}
                </h2>
                <form onSubmit={handleSubmit} className="gap-4">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستوى</label>
                        <input
                            type="text"
                            value={newLevel.title}
                            onChange={(e) => setNewLevel({ ...newLevel, title: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green outline-none"
                            placeholder="مثال: المستوى الثالث"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                        <textarea
                            value={newLevel.description}
                            onChange={(e) => setNewLevel({ ...newLevel, description: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green outline-none h-24 resize-none"
                            placeholder="وصف قصير للمستوى..."
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className={`${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary-green hover:bg-green-600'} text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 w-full md:w-auto`}
                        >
                            {editingId ? <Save size={20} /> : <Plus size={20} />}
                            <span>{editingId ? 'حفظ التعديلات' : 'حفظ المستوى'}</span>
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 w-full md:w-auto"
                            >
                                <span>إلغاء</span>
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <span className="font-bold">تم تحديد {selectedIds.length} عناصر</span>
                    <button
                        onClick={handleBulkDelete}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                        <Trash size={18} />
                        <span>حذف المحدد</span>
                    </button>
                </div>
            )}

            {/* Levels List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-700">
                    المستويات الحالية
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="border-b border-gray-100 text-sm text-gray-500">
                                <th className="p-4 w-10">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={levels.length > 0 && selectedIds.length === levels.length}
                                        className="w-4 h-4 rounded border-gray-300 text-primary-green focus:ring-primary-green"
                                    />
                                </th>
                                <th className="p-4">العنوان</th>
                                <th className="p-4">الوصف</th>
                                <th className="p-4">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {levels.map(level => (
                                <tr key={level.id} className={`border-b border-gray-50 hover:bg-gray-50 ${selectedIds.includes(level.id) ? 'bg-orange-50' : ''}`}>
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            onChange={() => handleSelectOne(level.id)}
                                            checked={selectedIds.includes(level.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-primary-green focus:ring-primary-green"
                                        />
                                    </td>
                                    <td className="p-4 font-medium text-gray-800">{level.title}</td>
                                    <td className="p-4 text-gray-600">{level.description}</td>
                                    <td className="p-4 flex gap-2">
                                        <button
                                            onClick={() => handleEdit(level)}
                                            className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg"
                                            title="تعديل"
                                        >
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
                    {levels.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            لا توجد مستويات دراسية مضافة.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
