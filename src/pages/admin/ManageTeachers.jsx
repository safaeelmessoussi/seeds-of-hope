import { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash, Save, Search, Phone, Mail } from 'lucide-react';

export default function ManageTeachers() {
    const [teachers, setTeachers] = useState(() => {
        const saved = localStorage.getItem('teachers');
        return saved ? JSON.parse(saved) : [
            { id: 1, name: 'خديجة أحمد', phone: '0551234567', email: 'khadija@seeds.com' },
            { id: 2, name: 'فاطمة علي', phone: '0559876543', email: 'fatima@seeds.com' }
        ];
    });

    const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        localStorage.setItem('teachers', JSON.stringify(teachers));
    }, [teachers]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            setTeachers(teachers.map(t => t.id === editingId ? { ...t, ...formData } : t));
            setEditingId(null);
            alert('تم تحديث بيانات المعلمة بنجاح');
        } else {
            setTeachers([...teachers, { id: Date.now(), ...formData }]);
            alert('تم إضافة المعلمة بنجاح');
        }
        setFormData({ name: '', phone: '', email: '' });
    };

    const handleEdit = (teacher) => {
        setFormData({ name: teacher.name, phone: teacher.phone, email: teacher.email });
        setEditingId(teacher.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        if (confirm('هل أنت متأكد من حذف هذه المعلمة؟')) {
            const itemToDelete = teachers.find(t => t.id === id);
            // Add to Trash logic if consistent with other pages
            const trashItem = {
                id: Date.now(),
                source: 'teachers',
                originalData: itemToDelete,
                deletedBy: 'admin@seeds.com',
                deletedAt: new Date().toISOString()
            };
            const currentTrash = JSON.parse(localStorage.getItem('trash') || '[]');
            localStorage.setItem('trash', JSON.stringify([...currentTrash, trashItem]));

            setTeachers(teachers.filter(t => t.id !== id));
        }
    };

    const filteredTeachers = teachers.filter(t =>
        t.name.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">إدارة المعلمات</h1>

            {/* Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Users size={20} />
                    {editingId ? 'تعديل بيانات المعلمة' : 'إضافة معلمة جديدة'}
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green outline-none"
                            placeholder="مثال: خديجة أحمد"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green outline-none"
                            placeholder="05xxxxxxxx"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green outline-none"
                            placeholder="example@seeds.com"
                        />
                    </div>
                    <div className="md:col-span-2 flex gap-2 mt-2">
                        <button type="submit" className={`${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary-green hover:bg-green-600'} text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 w-full md:w-auto`}>
                            {editingId ? <Save size={20} /> : <Plus size={20} />}
                            <span>{editingId ? 'حفظ التعديلات' : 'إضافة معلمة'}</span>
                        </button>
                        {editingId && (
                            <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', phone: '', email: '' }); }} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-200 w-full md:w-auto">
                                إلغاء
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <span className="font-bold text-gray-700">قائمة المعلمات</span>
                    <div className="relative w-64">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="بحث بالاسم..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-green"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="border-b border-gray-100 text-sm text-gray-500">
                                <th className="p-4">الاسم</th>
                                <th className="p-4">الاتصال</th>
                                <th className="p-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeachers.map(teacher => (
                                <tr key={teacher.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-800">{teacher.name}</td>
                                    <td className="p-4 text-sm text-gray-500">
                                        <div className="flex flex-col gap-1">
                                            {teacher.phone && <div className="flex items-center gap-2"><Phone size={14} /> {teacher.phone}</div>}
                                            {teacher.email && <div className="flex items-center gap-2"><Mail size={14} /> {teacher.email}</div>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(teacher)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(teacher.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredTeachers.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="p-8 text-center text-gray-500">لا توجد معلمات مطابقات للبحث.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
