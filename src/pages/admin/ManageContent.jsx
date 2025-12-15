import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Trash, FileText, Video, Headphones, Image as ImageIcon, Plus, Edit, Save } from 'lucide-react';

export default function ManageContent() {
    const [contents, setContents] = useState(() => {
        const saved = localStorage.getItem('contents');
        return saved ? JSON.parse(saved) : [
            { id: 1, title: 'الدرس الأول: الحروف', type: 'video', level: '1', date: '2025-10-01', urls: ['https://youtube.com/watch?v=123'] },
            { id: 2, title: 'كراسة التمارين', type: 'pdf', level: '1', date: '2025-10-02', urls: ['https://example.com/file.pdf'] },
            { id: 3, title: 'تلاوة الصباح', type: 'audio', level: '4', date: '2025-10-03', urls: ['https://soundcloud.com/track'] },
        ];
    });

    const [availableLevels, setAvailableLevels] = useState([]);

    useEffect(() => {
        localStorage.setItem('contents', JSON.stringify(contents));
    }, [contents]);

    useEffect(() => {
        // Fetch levels for the dropdown
        const savedLevels = localStorage.getItem('levels');
        if (savedLevels) {
            setAvailableLevels(JSON.parse(savedLevels));
        } else {
            // Fallback default levels if none exist in storage yet to ensure dropdown isn't empty on first load
            setAvailableLevels([
                { id: 1, title: 'المستوى الأول' },
                { id: 2, title: 'المستوى الثاني' },
                { id: 3, title: 'المستوى الثالث' },
                { id: 4, title: 'تحفيظ القرآن' },
            ]);
        }
    }, []);

    const [formData, setFormData] = useState({
        title: '',
        type: 'video',
        level: '1',
        urls: ['']
    });

    const [selectedIds, setSelectedIds] = useState([]);
    const [editingId, setEditingId] = useState(null);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUrlChange = (index, value) => {
        const newUrls = [...formData.urls];
        newUrls[index] = value;
        setFormData({ ...formData, urls: newUrls });
    };

    const addUrlField = () => {
        setFormData({ ...formData, urls: [...formData.urls, ''] });
    };

    const removeUrlField = (index) => {
        const newUrls = formData.urls.filter((_, i) => i !== index);
        setFormData({ ...formData, urls: newUrls });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Filter out empty URLs
        const validUrls = formData.urls.filter(url => url.trim() !== '');
        const dataToSave = { ...formData, urls: validUrls };

        if (editingId) {
            // Update existing content
            setContents(contents.map(c => c.id === editingId ? { ...c, ...dataToSave } : c));
            setEditingId(null);
            alert('تم تعديل المحتوى بنجاح');
        } else {
            // Add new content
            const newContent = {
                id: Date.now(),
                ...dataToSave,
                date: new Date().toISOString().split('T')[0]
            };
            setContents([...contents, newContent]);
            alert('تم إضافة المحتوى بنجاح');
        }
        setFormData({ title: '', type: 'video', level: availableLevels[0]?.id.toString() || '1', urls: [''] });
    };

    const handleDelete = (id) => {
        if (confirm('هل أنت متأكد من حذف هذا المحتوى؟ سيتم نقله إلى سلة المحذوفات.')) {
            const itemToDelete = contents.find(c => c.id === id);

            // Add to Trash
            const trashItem = {
                id: Date.now(),
                source: 'contents',
                originalData: itemToDelete,
                deletedBy: 'admin@seeds.com',
                deletedAt: new Date().toISOString()
            };
            const currentTrash = JSON.parse(localStorage.getItem('trash') || '[]');
            localStorage.setItem('trash', JSON.stringify([...currentTrash, trashItem]));

            // Remove from Contents
            setContents(contents.filter(c => c.id !== id));
            setSelectedIds(selectedIds.filter(sid => sid !== id));
            if (editingId === id) {
                setEditingId(null);
                setFormData({ title: '', type: 'video', level: availableLevels[0]?.id.toString() || '1', urls: [''] });
            }
        }
    };

    const handleEdit = (content) => {
        setFormData({
            title: content.title,
            type: content.type,
            level: content.level ? content.level.toString() : '1',
            urls: content.urls && content.urls.length > 0 ? content.urls : ['']
        });
        setEditingId(content.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setFormData({ title: '', type: 'video', level: availableLevels[0]?.id.toString() || '1', urls: [''] });
        setEditingId(null);
    };

    // Bulk actions
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(contents.map(c => c.id));
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
            setContents(contents.filter(c => !selectedIds.includes(c.id)));
            setSelectedIds([]);
            if (selectedIds.includes(editingId)) {
                setEditingId(null);
                setFormData({ title: '', type: 'video', level: availableLevels[0]?.id.toString() || '1', urls: [''] });
            }
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'video': return <Video size={18} className="text-red-500" />;
            case 'pdf': return <FileText size={18} className="text-blue-500" />;
            case 'audio': return <Headphones size={18} className="text-purple-500" />;
            default: return <ImageIcon size={18} className="text-green-500" />;
        }
    };

    const getLevelTitle = (levelId) => {
        const level = availableLevels.find(l => l.id.toString() === levelId?.toString());
        return level ? level.title : levelId;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">إدارة المحتوى</h1>
            </div>

            {/* Upload/Edit Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Upload size={20} />
                    {editingId ? 'تعديل المحتوى' : 'إضافة محتوى جديد'}
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">عنوان المحتوى</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green outline-none"
                            placeholder="مثال: درس القراءة 1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">نوع المحتوى</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green outline-none"
                        >
                            <option value="video">فيديو (Video)</option>
                            <option value="pdf">ملف (PDF)</option>
                            <option value="audio">صوت (Audio)</option>
                            <option value="image">صورة (Image)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">المستوى الدراسي</label>
                        <select
                            name="level"
                            value={formData.level}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green outline-none"
                        >
                            {availableLevels.map(level => (
                                <option key={level.id} value={level.id}>{level.title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">روابط الملفات / الفيديوهات</label>
                        <div className="space-y-2">
                            {formData.urls.map((url, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => handleUrlChange(index, e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green outline-none text-left"
                                        placeholder="https://..."
                                    />
                                    {formData.urls.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeUrlField(index)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                                        >
                                            <Trash size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addUrlField}
                                className="text-primary-green text-sm hover:underline flex items-center gap-1"
                            >
                                <Plus size={16} />
                                إضافة رابط آخر
                            </button>
                        </div>
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                        <button type="submit" className={`${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary-green hover:bg-green-600'} text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 w-full md:w-auto`}>
                            {editingId ? <Save size={20} /> : <Plus size={20} />}
                            <span>{editingId ? 'حفظ التعديلات' : 'نشر المحتوى'}</span>
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

            {/* Content List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-700">
                    المحتوى الحالي
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="border-b border-gray-100 text-sm text-gray-500">
                                <th className="p-4 w-10">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={contents.length > 0 && selectedIds.length === contents.length}
                                        className="w-4 h-4 rounded border-gray-300 text-primary-green focus:ring-primary-green"
                                    />
                                </th>
                                <th className="p-4">العنوان</th>
                                <th className="p-4">النوع</th>
                                <th className="p-4">المستوى</th>
                                <th className="p-4">تاريخ الإضافة</th>
                                <th className="p-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contents.map(item => (
                                <tr key={item.id} className={`border-b border-gray-50 hover:bg-gray-50 ${selectedIds.includes(item.id) ? 'bg-orange-50' : ''}`}>
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            onChange={() => handleSelectOne(item.id)}
                                            checked={selectedIds.includes(item.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-primary-green focus:ring-primary-green"
                                        />
                                    </td>
                                    <td className="p-4 font-medium text-gray-800">{item.title}</td>
                                    <td className="p-4 flex items-center gap-2">
                                        {getIcon(item.type)}
                                        <span className="text-sm text-gray-600">
                                            {item.type === 'video' ? 'فيديو' : item.type === 'pdf' ? 'ملف PDF' : item.type === 'audio' ? 'صوت' : 'صورة'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600">{getLevelTitle(item.level)}</td>
                                    <td className="p-4 text-gray-500 text-sm">{item.date}</td>
                                    <td className="p-4 flex gap-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg"
                                            title="تعديل"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
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
                {contents.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        لا يوجد محتوى مضاف حالياً.
                    </div>
                )}
            </div>
        </div>
    );
}
