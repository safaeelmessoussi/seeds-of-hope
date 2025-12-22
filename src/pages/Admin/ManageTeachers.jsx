import { useState, useEffect, useRef } from 'react';
import { dbService } from '../../services/db';
import { useData } from '../../context/DataContext';
import { Save, Trash2, Edit, Plus, User, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toWesternNumerals } from '../../utils/dateUtils';
import { BackButton } from '../../components/Navbar';
import DataImportExportComponent from '../../components/DataImportExport';

export default function ManageTeachers() {
  const { data, refreshData } = useData();
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nickname: '',
    email: '',
    phone: '',
    branchId: ''
  });
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (data.teachers) setTeachers(data.teachers);
  }, [data.teachers]);

  // Filter and sort teachers
  const filteredTeachers = teachers
    .filter(t => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        (t.firstName || '').toLowerCase().includes(query) ||
        (t.lastName || '').toLowerCase().includes(query) ||
        (t.nickname || '').toLowerCase().includes(query) ||
        (t.name || '').toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const nameA = (a.firstName || a.name || '').toLowerCase();
      const nameB = (b.firstName || b.name || '').toLowerCase();
      return nameA.localeCompare(nameB, 'ar');
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Build full name for legacy compatibility
      const payload = {
        ...formData,
        name: formData.nickname || `${formData.firstName} ${formData.lastName}`.trim()
      };

      if (selectedId) {
        await dbService.update('teachers', selectedId, payload);
      } else {
        await dbService.add('teachers', payload);
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
    setFormData({
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      nickname: teacher.nickname || teacher.name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      branchId: teacher.branchId || ''
    });
  };

  const resetForm = () => {
    setSelectedId(null);
    setFormData({ firstName: '', lastName: '', nickname: '', email: '', phone: '', branchId: '' });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(teachers.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.length} مؤطرة؟`)) return;

    try {
      await Promise.all(selectedIds.map(id => dbService.remove('teachers', id)));
      await refreshData();
      setSelectedIds([]);
    } catch (e) {
      alert('فشل الحذف الجماعي');
    }
  };

  const handleImport = async (parsedData) => {
    setLoading(true);
    try {
      // parsedData comes with English keys thanks to headerMap reverse mapping
      // headerMap: firstName->الاسم الأول, lastName->اسم العائلة, nickname->اللقب, 
      // email->البريد الإلكتروني, phone->رقم الهاتف, branchName->الفرع
      const validTeachers = parsedData.map(row => {
        // Resolve branch ID from name - check branchName key (from reverse mapping)
        let branchId = '';
        const branchName = row['branchName'] || row['الفرع'] || row['Branch'] || '';
        if (branchName) {
          const branch = data.branches?.find(b => b.name === branchName);
          if (branch) branchId = branch.id;
        }

        return {
          firstName: row['firstName'] || row['الاسم الأول'] || '',
          lastName: row['lastName'] || row['اسم العائلة'] || '',
          nickname: row['nickname'] || row['اللقب'] || '',
          name: row['nickname'] || row['اللقب'] || '',
          email: row['email'] || row['البريد الإلكتروني'] || '',
          phone: row['phone'] || row['رقم الهاتف'] || '',
          branchId
        };
      }).filter(t => t.firstName || t.nickname);

      if (validTeachers.length > 0) {
        await Promise.all(validTeachers.map(t => dbService.add('teachers', t)));
        await refreshData();
        alert(`تم استيراد ${validTeachers.length} مؤطرة بنجاح`);
      } else {
        alert('لم يتم العثور على بيانات صالحة للاستيراد. تأكد من استخدام النموذج الصحيح.');
      }
    } catch (err) {
      console.error(err);
      alert('فشل الاستيراد');
    } finally {
      setLoading(false);
    }
  };

  // Get display name for teacher (nickname or full name)
  const getDisplayName = (t) => t.nickname || t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim() || '-';
  const getFullName = (t) => `${t.firstName || ''} ${t.lastName || ''}`.trim() || '-';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">إدارة المؤطرات</h1>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-bold text-sm"
            >
              <Trash2 size={18} />
              حذف المحدد ({selectedIds.length})
            </button>
          )}
          <DataImportExportComponent
            data={teachers.map(t => {
              const branch = data.branches?.find(b => b.id === t.branchId);
              return { ...t, branchName: branch?.name || '' };
            })}
            fileName="teachers_list.csv"
            onImport={handleImport}
            headerMap={{
              'firstName': 'الاسم الأول',
              'lastName': 'اسم العائلة',
              'nickname': 'اللقب',
              'email': 'البريد الإلكتروني',
              'phone': 'رقم الهاتف',
              'branchName': 'الفرع'
            }}
            templateHeaders={['الاسم الأول', 'اسم العائلة', 'اللقب', 'البريد الإلكتروني', 'رقم الهاتف', 'الفرع']}
          />
          <BackButton />
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-green outline-none"
            placeholder="بحث بالاسم الأول، اسم العائلة، أو اللقب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-700 flex items-center gap-2 mb-4">
          <User size={20} />
          <span>{selectedId ? 'تعديل بيانات مؤطرة' : 'إضافة مؤطرة جديدة'}</span>
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-sm text-gray-500">الاسم الأول *</label>
            <input
              required
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
              placeholder="مثال: خديجة"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: toWesternNumerals(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">اسم العائلة *</label>
            <input
              required
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
              placeholder="مثال: أحمد"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: toWesternNumerals(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">اللقب (يظهر للعموم)</label>
            <input
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
              placeholder="اختياري - مثال: الأستاذة خديجة"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: toWesternNumerals(e.target.value) })}
            />
            <p className="text-xs text-gray-400">اختياري: إذا تركته فارغاً سيظهر الاسم الأول واسم العائلة</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">البريد الإلكتروني</label>
            <input
              type="email"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none text-left dir-ltr placeholder:text-right"
              placeholder="example@seeds.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
          <div className="space-y-1">
            <label className="text-sm text-gray-500">الفرع</label>
            <select
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
              value={formData.branchId || ''}
              onChange={(e) => setFormData({ ...formData, branchId: e.target.value || null })}
            >
              <option value="">كلاهما (جميع الفروع)</option>
              {data.branches?.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
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
              <span>{loading ? 'جاري الحفظ...' : selectedId ? 'حفظ التعديلات' : 'إضافة مؤطرة'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-600 text-sm flex items-center justify-between">
          <span>قائمة المعلمات ({filteredTeachers.length})</span>
          {searchQuery && <span className="text-xs text-gray-400 font-normal">نتائج البحث</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[800px]">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b">
              <tr>
                <th className="p-4 w-4">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={filteredTeachers.length > 0 && selectedIds.length === filteredTeachers.length}
                  />
                </th>
                <th className="p-4">الاسم الأول</th>
                <th className="p-4">اسم العائلة</th>
                <th className="p-4">اللقب (العام)</th>
                <th className="p-4">البريد الإلكتروني</th>
                <th className="p-4">الهاتف</th>
                <th className="p-4">الفرع</th>
                <th className="p-4">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTeachers.map((t) => {
                const branch = data.branches?.find(b => b.id === t.branchId);
                const isEditing = selectedId === t.id;
                return (
                  <tr
                    key={t.id}
                    className={`transition-colors ${isEditing
                      ? 'bg-blue-50 border-r-4 border-r-blue-500'
                      : 'hover:bg-gray-50'
                      }`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(t.id)}
                        onChange={(e) => handleSelectOne(t.id, e.target.checked)}
                      />
                    </td>
                    <td className="p-4 font-medium text-gray-800">{t.firstName || '-'}</td>
                    <td className="p-4 text-gray-700">{t.lastName || '-'}</td>
                    <td className="p-4 text-gray-600">{t.nickname || getDisplayName(t)}</td>
                    <td className="p-4 text-gray-600 text-sm dir-ltr text-right">{t.email || '-'}</td>
                    <td className="p-4 text-gray-600 text-sm dir-ltr text-right">{t.phone || '-'}</td>
                    <td className="p-4 text-gray-600 text-sm">{branch?.name || 'الكل'}</td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(t)}
                        className={`${isEditing ? 'text-blue-700' : 'text-blue-500 hover:text-blue-700'}`}
                      >
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {teachers.length === 0 && (
          <div className="p-8 text-center text-gray-400">لا توجد معلمات</div>
        )}
      </div>
    </div>
  );
}
