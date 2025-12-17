import { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { useData } from '../../context/DataContext';
import { Save, Trash2, Edit, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toWesternNumerals } from '../../utils/dateUtils';
import { BackButton } from '../../components/Navbar';

export default function ManageLevels() {
  const { data, refreshData } = useData();
  const [levels, setLevels] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data.levels) setLevels(data.levels);
  }, [data.levels]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selectedId) {
        await dbService.update('levels', selectedId, formData);
      } else {
        await dbService.add('levels', { ...formData, order: levels.length + 1 });
      }
      await refreshData();
      resetForm();
    } catch (error) {
      console.error(error);
      alert('فشل الحفظ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      await dbService.remove('levels', id);
      await refreshData();
    } catch (error) {
      alert('فشل الحذف');
    }
  };

  const handleEdit = (level) => {
    setSelectedId(level.id);
    setFormData({ title: level.title, description: level.description });
  };

  const resetForm = () => {
    setSelectedId(null);
    setFormData({ title: '', description: '' });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">إدارة المستويات</h1>
        <BackButton />
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-700 flex items-center gap-2 mb-4">
          {selectedId ? <Edit size={20} /> : <Plus size={20} />}
          <span>{selectedId ? 'تعديل مستوى' : 'إضافة مستوى جديد'}</span>
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1">
            <label className="text-sm text-gray-500">اسم المستوى</label>
            <input
              required
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
              placeholder="مثال: المستوى الثالث"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: toWesternNumerals(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">الوصف</label>
            <textarea
              className="w-full border rounded-lg p-2 h-24 focus:ring-2 focus:ring-primary-green outline-none"
              placeholder="وصف قصير للمستوى..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: toWesternNumerals(e.target.value) })}
            />
          </div>
          <div className="flex justify-end gap-2">
            {selectedId && (
              <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-500 border rounded-lg hover:bg-gray-50">إلغاء</button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 font-bold flex items-center gap-2"
            >
              <Save size={18} />
              <span>{loading ? 'جاري الحفظ...' : 'حفظ المستوى'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-600">
          المستويات الحالية
        </div>
        <div className="divide-y divide-gray-100">
          {levels.map((level) => (
            <div key={level.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div>
                <h3 className="font-bold text-gray-800">{level.title}</h3>
                <p className="text-sm text-gray-500">{level.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(level)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(level.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {levels.length === 0 && (
            <div className="p-8 text-center text-gray-400">لا توجد مستويات مضافة</div>
          )}
        </div>
      </div>
    </div>
  );
}
