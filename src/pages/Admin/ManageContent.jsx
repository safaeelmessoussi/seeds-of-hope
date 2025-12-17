import { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { useData } from '../../context/DataContext';
import { Save, Trash2, Edit, Plus, Link as LinkIcon, Headphones, Video, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toWesternNumerals } from '../../utils/dateUtils';
import { BackButton } from '../../components/Navbar';

export default function ManageContent() {
  const { data, refreshData } = useData();
  const [contents, setContents] = useState([]);
  const [formData, setFormData] = useState({ title: '', type: 'video', levelId: '', urls: [''] });
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data.contents) setContents(data.contents);
  }, [data.contents]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Filter empty URLs
    const cleanFormData = {
      ...formData,
      urls: formData.urls.filter(u => u.trim() !== '')
    };

    try {
      if (selectedId) {
        await dbService.update('contents', selectedId, cleanFormData);
      } else {
        await dbService.add('contents', cleanFormData);
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
      await dbService.remove('contents', id);
      await refreshData();
    } catch (error) {
      alert('فشل الحذف');
    }
  };

  const handleEdit = (content) => {
    setSelectedId(content.id);
    setFormData({
      title: content.title,
      type: content.type,
      levelId: content.levelId,
      urls: content.urls && content.urls.length > 0 ? content.urls : [content.url || '']
    });
  };

  const resetForm = () => {
    setSelectedId(null);
    setFormData({ title: '', type: 'video', levelId: '', urls: [''] });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">إدارة المحتوى</h1>
        <BackButton />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-700 flex items-center gap-2 mb-4">
          {selectedId ? 'تعديل المحتوى' : 'إضافة محتوى جديد'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-500">عنوان المحتوى</label>
              <input
                required
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
                placeholder="الحصة 6 من تفسير سورة البقرة"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: toWesternNumerals(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-500">نوع المحتوى</label>
              <select
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="video">فيديو (Video)</option>
                <option value="audio">صوت (Audio)</option>
                <option value="pdf">ملف (PDF)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-500">المستوى الدراسي</label>
              <select
                required
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
                value={formData.levelId}
                onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
              >
                <option value="">اختيار المستوى...</option>
                {data.levels?.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-500 flex justify-between">
              <span>روابط الملفات / الفيديوهات</span>
            </label>
            {formData.urls.map((url, idx) => (
              <div key={idx} className="flex gap-2">
                <button type="button" onClick={() => removeUrlField(idx)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={18} />
                </button>
                <input
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none dir-ltr text-left"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => handleUrlChange(idx, e.target.value)}
                />
              </div>
            ))}
            <button type="button" onClick={addUrlField} className="text-sm text-primary-green hover:underline flex items-center gap-1">
              <Plus size={16} />
              <span>إضافة رابط آخر</span>
            </button>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            {selectedId && (
              <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-500 border rounded-lg hover:bg-gray-50">إلغاء</button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 font-bold flex items-center gap-2"
            >
              <Save size={18} />
              <span>{loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-600 text-sm">
          المحتوى الحالي
        </div>
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b">
            <tr>
              <th className="p-4">العنوان</th>
              <th className="p-4">النوع</th>
              <th className="p-4">المستوى</th>
              <th className="p-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contents.map((c) => {
              const level = data.levels?.find(l => l.id === c.levelId);
              return (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-800">{c.title}</td>
                  <td className="p-4 text-gray-600">
                    <span className="flex items-center gap-1 text-sm bg-gray-100 px-2 py-1 rounded w-fit">
                      {c.type === 'video' ? <Video size={14} /> : c.type === 'audio' ? <Headphones size={14} /> : <FileText size={14} />}
                      {c.type === 'video' ? 'فيديو' : c.type === 'audio' ? 'صوت' : 'ملف'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{level?.title || '-'}</td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => handleEdit(c)} className="text-blue-500 hover:text-blue-700">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {contents.length === 0 && (
          <div className="p-8 text-center text-gray-400">لا يوجد محتوى</div>
        )}
      </div>
    </div>
  );
}
