import { useState, useEffect } from 'react';
import { Layout, Plus, Edit, Trash, Save, Search, Users, MapPin } from 'lucide-react';

export default function ManageRooms() {
    const [rooms, setRooms] = useState(() => {
        const saved = localStorage.getItem('rooms');
        return saved ? JSON.parse(saved) : [
            { id: 1, name: 'القاعة الرئيسية', capacity: '50', type: 'lecture' },
            { id: 2, name: 'فصل أ', capacity: '20', type: 'classroom' }
        ];
    });

    const [formData, setFormData] = useState({ name: '', capacity: '', type: 'classroom' });
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        localStorage.setItem('rooms', JSON.stringify(rooms));
    }, [rooms]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            setRooms(rooms.map(r => r.id === editingId ? { ...r, ...formData } : r));
            setEditingId(null);
            alert('تم تحديث بيانات القاعة بنجاح');
        } else {
            setRooms([...rooms, { id: Date.now(), ...formData }]);
            alert('تم إضافة القاعة بنجاح');
        }
        setFormData({ name: '', capacity: '', type: 'classroom' });
    };

    const handleEdit = (room) => {
        setFormData({ name: room.name, capacity: room.capacity, type: room.type });
        setEditingId(room.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        if (confirm('هل أنت متأكد من حذف هذه القاعة؟')) {
            const itemToDelete = rooms.find(r => r.id === id);
            const trashItem = {
                id: Date.now(),
                source: 'rooms',
                originalData: itemToDelete,
                deletedBy: 'admin@seeds.com',
                deletedAt: new Date().toISOString()
            };
            const currentTrash = JSON.parse(localStorage.getItem('trash') || '[]');
            localStorage.setItem('trash', JSON.stringify([...currentTrash, trashItem]));

            setRooms(rooms.filter(r => r.id !== id));
        }
    };

    const filteredRooms = rooms.filter(r => r.name.includes(searchTerm));

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">إدارة القاعات والفصول</h1>

            {/* Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Layout size={20} />
                    {editingId ? 'تعديل بيانات القاعة' : 'إضافة قاعة جديدة'}
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم القاعة</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green outline-none"
                            placeholder="مثال: القاعة الذهبية"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">السعة الاستيعابية</label>
                        <input
                            type="number"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green outline-none"
                            placeholder="عدد الأشخاص"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green outline-none"
                        >
                            <option value="classroom">فصل دراسي</option>
                            <option value="lecture">قاعة محاضرات</option>
                            <option value="lab">معمل / ورشة</option>
                            <option value="office">مكتب إداري</option>
                        </select>
                    </div>
                    <div className="md:col-span-3 flex gap-2 mt-2">
                        <button type="submit" className={`${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary-green hover:bg-green-600'} text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 w-full md:w-auto`}>
                            {editingId ? <Save size={20} /> : <Plus size={20} />}
                            <span>{editingId ? 'حفظ التعديلات' : 'إضافة القاعة'}</span>
                        </button>
                        {editingId && (
                            <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', capacity: '', type: 'classroom' }); }} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-200 w-full md:w-auto">
                                إلغاء
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <span className="font-bold text-gray-700">قائمة القاعات</span>
                    <div className="relative w-64">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="بحث عن قاعة..."
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
                                <th className="p-4">اسم القاعة</th>
                                <th className="p-4">السعة</th>
                                <th className="p-4">النوع</th>
                                <th className="p-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRooms.map(room => (
                                <tr key={room.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-800 flex items-center gap-2">
                                        <MapPin size={16} className="text-gray-400" />
                                        {room.name}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Users size={16} className="text-gray-400" />
                                            {room.capacity}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${room.type === 'lecture' ? 'bg-purple-100 text-purple-700' :
                                                room.type === 'lab' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {room.type === 'lecture' ? 'محاضرات' :
                                                room.type === 'classroom' ? 'فصل' :
                                                    room.type === 'lab' ? 'معمل' : 'مكتب'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(room)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(room.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
