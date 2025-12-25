import { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Save, Trash2, Edit, Plus, Video, Headphones, FileText, Image } from 'lucide-react';
import { toWesternNumerals } from '../../utils/dateUtils';
import { BackButton } from '../../components/Navbar';
import DataImportExportComponent from '../../components/DataImportExport';
import FileUpload from '../../components/FileUpload';

export default function ManageContent() {
  const { data, refreshData } = useData();
  const { currentUser } = useAuth();
  const [contents, setContents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    type: 'video',
    levelId: '',
    schoolYear: '2025-2026',
    urls: [''],
    branchId: ''
  });
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(contents.map(c => c.id));
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
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.length} عنصر محتوى؟`)) return;

    try {
      await Promise.all(selectedIds.map(id => dbService.remove('contents', id)));
      await refreshData();
      setSelectedIds([]);
    } catch (e) {
      alert('فشل الحذف الجماعي');
    }
  };

  const handleImport = async (parsedData) => {
    setLoading(true);
    try {
      const validContents = [];
      for (const row of parsedData) {
        // Level Lookup
        let levelId = '';
        if (row['levelId']) levelId = row['levelId'];
        else if (row['Level'] || row['المستوى']) {
          const search = row['Level'] || row['المستوى'];
          const level = data.levels?.find(l => l.title === search);
          if (level) levelId = level.id;
        }

        // Branch Lookup
        let branchId = '';
        if (row['branchId']) branchId = row['branchId'];
        else if (row['Branch'] || row['الفرع']) {
          const search = row['Branch'] || row['الفرع'];
          const branch = data.branches?.find(b => b.name === search);
          if (branch) branchId = branch.id;
        }

        // Type
        let type = 'video';
        const typeRaw = row['Type'] || row['النوع'];
        if (typeRaw === 'audio' || typeRaw === 'صوت') type = 'audio';
        if (typeRaw === 'pdf' || typeRaw === 'ملف') type = 'pdf';
        if (typeRaw === 'image' || typeRaw === 'صورة' || typeRaw === 'photo') type = 'image';

        // URLs
        const url = row['URL'] || row['الرابط'] || '';

        if (row['Title'] || row['العنوان']) {
          validContents.push({
            title: row['Title'] || row['العنوان'],
            type,
            levelId,
            branchId,
            urls: [url],
            schoolYear: row['School Year'] || row['السنة الدراسية'] || '2025-2026'
          });
        }
      }

      if (validContents.length > 0) {
        await Promise.all(validContents.map(c => dbService.add('contents', c)));
        await refreshData();
        alert('تم استيراد المحتوى بنجاح');
      }
    } catch (error) {
      console.error(error);
      alert('فشل الاستيراد');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data.contents) {
      if (currentUser?.role === 'super-admin') {
        setContents(data.contents);
      } else if (currentUser?.branchId) {
        // Show content for their branch OR general content (optional, but usually admins manage their own)
        // Let's filtered to their branch + general for viewing, but mainly they edit theirs.
        // Actually, usually admins only see what they can edit?
        // User request: "an admin should be assigned to a branch... all dropdowns initialized"
        // Let's filter to just their branch for simplicity to avoid confusion, or strictly follow
        // what they manage.
        setContents(data.contents.filter(c => c.branchId === currentUser.branchId));

        // Initialize form data 
        setFormData(prev => ({ ...prev, branchId: currentUser.branchId }));
      }
    }
  }, [data.contents, currentUser]);

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
      schoolYear: content.schoolYear || '2025-2026',
      urls: content.urls && content.urls.length > 0 ? content.urls : [content.url || ''],
      branchId: content.branchId || ''
    });
  };

  const resetForm = () => {
    setSelectedId(null);
    setFormData({
      title: '',
      type: 'video',
      levelId: '',
      schoolYear: '2025-2026',
      urls: [''],
      branchId: currentUser?.role === 'super-admin' ? '' : (currentUser?.branchId || '')
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">إدارة المحتوى</h1>
        <div className="flex items-center gap-2">
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
            data={contents}
            fileName="content_library.csv"
            onImport={handleImport}
            headerMap={{
              'title': 'العنوان',
              'type': 'النوع',
              'schoolYear': 'السنة الدراسية'
            }}
            templateHeaders={['العنوان', 'النوع', 'الرابط', 'المستوى', 'الفرع', 'السنة الدراسية']}
          />
          <BackButton />
        </div>
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
                <option value="image">صورة (Image)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-500">الفرع</label>
              <select
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none disabled:bg-gray-100"
                value={formData.branchId}
                onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                disabled={currentUser?.role !== 'super-admin'} // Disable if not super admin
              >
                {currentUser?.role === 'super-admin' && <option value="">عام / مشترك</option>}
                {/* 
                    If super admin, show all branches.
                    If regular admin, show ONLY their branch (effectively locked selection).
                 */}
                {data.branches?.map(b => {
                  // If regular admin, only show their branch
                  if (currentUser?.role !== 'super-admin' && currentUser?.branchId !== b.id) return null;
                  return <option key={b.id} value={b.id}>{b.name}</option>
                })}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-500">المستوى بالجمعية</label>
              <select
                required
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
                value={formData.levelId}
                onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
              >
                <option value="">اختيار المستوى...</option>
                {/* Sort levels: women first, then girls, then children. Within each category sort by order */}
                {[...(data.levels || [])]
                  .sort((a, b) => {
                    const categoryOrder = { women: 1, girls: 2, children: 3 };
                    const catA = categoryOrder[a.category] || 99;
                    const catB = categoryOrder[b.category] || 99;
                    if (catA !== catB) return catA - catB;
                    return (a.order || 0) - (b.order || 0);
                  })
                  .map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-500">السنة الدراسية</label>
              <input
                required
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none dir-ltr text-right"
                placeholder="2025-2026"
                value={formData.schoolYear}
                onChange={(e) => setFormData({ ...formData, schoolYear: toWesternNumerals(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-500">
              <span>رفع الملفات أو إضافة روابط</span>
            </label>
            <FileUpload
              currentUrl={formData.urls?.[0] || ''}
              currentType={formData.type}
              onUpload={(url, detectedType) => {
                if (url) {
                  setFormData({
                    ...formData,
                    urls: [url],
                    type: detectedType || formData.type
                  });
                } else {
                  setFormData({ ...formData, urls: [''] });
                }
              }}
            />
            <p className="text-xs text-gray-400">يمكنك سحب وإفلات الملف، أو الضغط للاختيار، أو إضافة رابط خارجي</p>
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
      </div >

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-600 text-sm">
          المحتوى الحالي
        </div>
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b">
            <tr>
              <th className="p-4 w-4">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={contents.length > 0 && selectedIds.length === contents.length}
                />
              </th>
              <th className="p-4">العنوان</th>
              <th className="p-4">المستوى</th>
              <th className="p-4">الفرع</th>
              <th className="p-4">السنة الدراسية</th>
              <th className="p-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contents.map((c) => {
              const level = data.levels?.find(l => l.id === c.levelId);
              return (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(c.id)}
                      onChange={(e) => handleSelectOne(c.id, e.target.checked)}
                    />
                  </td>
                  <td className="p-4 font-medium text-gray-800">
                    <div className="flex flex-col">
                      <span>{c.title}</span>
                      <span className="flex items-center gap-1 text-[10px] text-gray-400">
                        {c.type === 'video' ? <Video size={10} /> : c.type === 'audio' ? <Headphones size={10} /> : c.type === 'image' ? <Image size={10} /> : <FileText size={10} />}
                        {c.type === 'video' ? 'فيديو' : c.type === 'audio' ? 'صوت' : c.type === 'image' ? 'صورة' : 'ملف'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{level?.title || '-'}</td>
                  <td className="p-4 text-gray-600">
                    {(() => {
                      if (!c.branchId) return <span className="text-xs bg-gray-100 px-2 py-1 rounded">عام</span>;
                      const b = data.branches?.find(br => br.id === c.branchId);
                      return b ? b.name : '-';
                    })()}
                  </td>
                  <td className="p-4 text-gray-600 font-mono text-sm">{c.schoolYear || '-'}</td>
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
    </div >
  );
}
