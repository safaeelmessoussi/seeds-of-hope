import { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { useData } from '../../context/DataContext';
import { Save, Trash2, Edit, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toWesternNumerals } from '../../utils/dateUtils';
import { BackButton } from '../../components/Navbar';

export default function ManageRooms() {
  const { data, refreshData } = useData();
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({ name: '', capacity: '', type: 'classroom' });
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data.rooms) setRooms(data.rooms);
  }, [data.rooms]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selectedId) {
        await dbService.update('rooms', selectedId, formData);
      } else {
        await dbService.add('rooms', formData);
      }
      await refreshData();
      resetForm();
    } catch (error) {
      console.error(error);
      alert('فشل الحفظ');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      await dbService.remove('rooms', id);
      await refreshData();
    } catch (error) {
      alert('فشل الحذف');
    }
  };

  const handleEdit = (room) => {
    setSelectedId(room.id);
    setFormData({ name: room.name, capacity: room.capacity, type: room.type });
  };

  const resetForm = () => {
    setSelectedId(null);
    setFormData({ name: '', capacity: '', type: 'classroom' });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">إدارة القاعات والفصول</h1>
        <BackButton />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-700 flex items-center gap-2 mb-4">
          {selectedId ? <Edit size={20} /> : <Plus size={20} />}
          <span>{selectedId ? 'تعديل قاعة' : 'إضافة قاعة جديدة'}</span>
        </h2>

        <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
          <div className="space-y-1 flex-1 min-w-[200px]">
            <label className="text-sm text-gray-500">اسم القاعة</label>
            <input
              required
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
              placeholder="مثال: القاعة الذهبية"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: toWesternNumerals(e.target.value) })}
            />
          </div>
          <div className="space-y-1 w-32">
            <label className="text-sm text-gray-500">السعة الاستيعابية</label>
            <input
              type="number"
              required
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none text-left dir-ltr"
              placeholder="عدد الأشخاص"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: toWesternNumerals(e.target.value) })}
            />
          </div>
          <div className="space-y-1 w-40">
            <label className="text-sm text-gray-500">النوع</label>
            <select
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="classroom">فصل دراسي</option>
              <option value="hall">قاعة محاضرات</option>
              <option value="lab">محترف</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pb-0.5">
            {selectedId && (
              <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-500 border rounded-lg hover:bg-gray-50">إلغاء</button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 font-bold flex items-center gap-2"
            >
              <Save size={18} />
              <span>{selectedId ? 'حفظ' : 'إضافة القاعة'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between font-bold text-gray-600 text-sm">
          <span>قائمة القاعات</span>
        </div>
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b">
            <tr>
              <th className="p-4">اسم القاعة</th>
              <th className="p-4">السعة</th>
              <th className="p-4">النوع</th>
              <th className="p-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rooms.map((room) => (
              <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-800">{room.name}</td>
                <td className="p-4 text-gray-600 dir-ltr text-right">{room.capacity} <span className="text-xs">شخص</span></td>
                <td className="p-4">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                    {room.type === 'classroom' ? 'فصل' : room.type === 'hall' ? 'قاعة' : 'محترف'}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => handleEdit(room)} className="text-blue-500 hover:text-blue-700">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(room.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rooms.length === 0 && (
          <div className="p-8 text-center text-gray-400">لا توجد قاعات</div>
        )}
      </div>
    </div>
  );
}
