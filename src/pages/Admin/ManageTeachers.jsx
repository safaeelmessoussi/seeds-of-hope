import { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { useData } from '../../context/DataContext';
import { Save, Trash2, Edit, Plus, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toWesternNumerals } from '../../utils/dateUtils';
import { BackButton } from '../../components/Navbar';

export default function ManageTeachers() {
  const { data, refreshData } = useData();
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data.teachers) setTeachers(data.teachers);
  }, [data.teachers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selectedId) {
        await dbService.update('teachers', selectedId, formData);
      } else {
        await dbService.add('teachers', formData);
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
      await dbService.remove('teachers', id);
      await refreshData();
    } catch (error) {
      alert('فشل الحذف');
    }
  };

  const handleEdit = (teacher) => {
    setSelectedId(teacher.id);
    setFormData({ name: teacher.name, email: teacher.email, phone: teacher.phone });
  };

  const resetForm = () => {
    setSelectedId(null);
    setFormData({ name: '', email: '', phone: '' });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">إدارة المعلمات</h1>
        <BackButton />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-700 flex items-center gap-2 mb-4">
          <User size={20} />
          <span>{selectedId ? 'تعديل بيانات معلمة' : 'إضافة معلمة جديدة'}</span>
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-sm text-gray-500">اسم المعلمة</label>
            <input
              required
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
              placeholder="مثال: خديجة أحمد"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: toWesternNumerals(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">البريد الإلكتروني</label>
            <input
              type="email"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none text-left dir-ltr placeholder:text-right"
              placeholder="example@seeds.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: toWesternNumerals(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">رقم الهاتف</label>
            <input
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none text-left dir-ltr placeholder:text-right"
              placeholder="05xxxxxxxx"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: toWesternNumerals(e.target.value) })}
            />
          </div>

          <div className="col-span-full flex justify-end gap-2 mt-2">
            {selectedId && (
              <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-500 border rounded-lg hover:bg-gray-50">إلغاء</button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 font-bold flex items-center gap-2"
            >
              <Save size={18} />
              <span>{loading ? 'جاري الحفظ...' : 'إضافة معلمة'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-600 text-sm">
          قائمة المعلمات
        </div>
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b">
            <tr>
              <th className="p-4">الاسم</th>
              <th className="p-4">الاتصال</th>
              <th className="p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {teachers.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-800">{t.name}</td>
                <td className="p-4 text-gray-600 text-sm">
                  <div className="flex flex-col gap-1 dir-ltr text-right">
                    <span>{t.email}</span>
                    <span className="text-gray-400">{t.phone}</span>
                  </div>
                </td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => handleEdit(t)} className="text-blue-500 hover:text-blue-700">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {teachers.length === 0 && (
          <div className="p-8 text-center text-gray-400">لا توجد معلمات</div>
        )}
      </div>
    </div>
  );
}
