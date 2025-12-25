import { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Save, Trash2, Edit, Plus, MapPin, LayoutDashboard, Layers, List, Tag, Users, GraduationCap, Heart } from 'lucide-react';
import { BackButton } from '../../components/Navbar';
import { toWesternNumerals } from '../../utils/dateUtils';
import DataImportExportComponent from '../../components/DataImportExport';
import { Navigate } from 'react-router-dom';

export default function ManageBaseData() {
  const { data, refreshData } = useData();
  const { currentUser } = useAuth();

  // Super-admin only
  if (currentUser?.role !== 'super-admin') {
    return <Navigate to="/admin" replace />;
  }

  const [activeTab, setActiveTab] = useState('branches'); // 'branches', 'rooms', 'levels'
  const [formData, setFormData] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImport = async (parsedData) => {
    setLoading(true);
    try {
      let collection = activeTab;
      if (activeTab === 'levels') collection = 'levels';
      const validItems = [];

      if (activeTab === 'branches') {
        parsedData.forEach(row => {
          if (row['Name'] || row['الاسم']) {
            validItems.push({
              name: row['Name'] || row['الاسم'],
              code: row['Code'] || row['الرمز'] || ''
            });
          }
        });
      } else if (activeTab === 'rooms') {
        parsedData.forEach(row => {
          let branchId = '';
          const bSearch = row['Branch'] || row['الفرع'];
          if (bSearch) {
            const b = data.branches?.find(br => br.name === bSearch);
            if (b) branchId = b.id;
          }
          if (row['Name'] || row['الاسم']) {
            validItems.push({
              name: row['Name'] || row['الاسم'],
              capacity: row['Capacity'] || row['السعة'] || '0',
              type: row['Type'] || row['النوع'] || 'classroom',
              branchId
            });
          }
        });
      } else if (activeTab === 'levels') {
        parsedData.forEach(row => {
          if (row['Title'] || row['الاسم']) {
            validItems.push({
              title: row['Title'] || row['الاسم'],
              description: row['Description'] || row['الوصف'] || '',
              category: row['Category'] || row['الفئة'] || 'children',
              order: parseInt(row['Order'] || row['الترتيب'] || '1', 10)
            });
          }
        });
      }

      if (validItems.length > 0) {
        await Promise.all(validItems.map(item => dbService.add(collection, item)));
        await refreshData();
        alert('تم الاستيراد بنجاح');
      }
    } catch (error) {
      console.error(error);
      alert('فشل الاستيراد');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedId(null);
    if (activeTab === 'branches') {
      setFormData({ name: '', code: '', address: '', phone: '', email: '', schedule: '', locationLink: '' });
    } else if (activeTab === 'rooms') {
      setFormData({ name: '', capacity: '', type: 'classroom', branchId: '' });
    } else if (activeTab === 'levels') {
      setFormData({ title: '', description: '', category: 'children', order: 1 });
    } else {
      // For dropdown items: activityTypes, categories, socialStatuses, schoolLevels
      setFormData({ name: '', value: '' });
    }
  };

  useEffect(() => {
    resetForm();
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const collection = activeTab;

    try {
      if (selectedId) {
        await dbService.update(collection, selectedId, formData);
      } else {
        if (activeTab === 'levels' && !formData.order) {
          formData.order = (data.levels?.length || 0) + 1;
        }
        await dbService.add(collection, formData);
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
      await dbService.remove(activeTab, id);
      await refreshData();
    } catch (error) {
      alert('فشل الحذف');
    }
  };

  const handleEdit = (item) => {
    setSelectedId(item.id);
    if (activeTab === 'branches') {
      setFormData({
        name: item.name || '',
        code: item.code || '',
        address: item.address || '',
        phone: item.phone || '',
        email: item.email || '',
        schedule: item.schedule || '',
        locationLink: item.locationLink || ''
      });
    } else if (activeTab === 'rooms') {
      setFormData({
        name: item.name,
        capacity: item.capacity,
        type: item.type,
        branchId: item.branchId || ''
      });
    } else {
      setFormData({
        title: item.title,
        description: item.description || '',
        category: item.category || 'children',
        order: item.order || 1
      });
    }
  };

  // ======== RENDER BRANCHES ========
  const renderBranches = () => (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-700 flex items-center gap-2 mb-4">
          {selectedId ? <Edit size={20} /> : <Plus size={20} />}
          <span>{selectedId ? 'تعديل فرع' : 'إضافة فرع جديد'}</span>
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-sm text-gray-500">اسم الفرع *</label>
            <input
              required
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
              placeholder="مثال: فرع تارگة"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: toWesternNumerals(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">رمز الفرع (Code) *</label>
            <input
              required
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none dir-ltr text-right"
              placeholder="TARGA"
              value={formData.code || ''}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">العنوان</label>
            <input
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
              placeholder="حي تارگة، مراكش"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: toWesternNumerals(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">رقم الهاتف</label>
            <input
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none dir-ltr text-right"
              placeholder="+212 6XX-XXXXXX"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: toWesternNumerals(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">البريد الإلكتروني</label>
            <input
              type="email"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none dir-ltr text-right"
              placeholder="contact@example.com"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">أوقات العمل</label>
            <input
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
              placeholder="السبت - الخميس: 9:00 - 18:00"
              value={formData.schedule || ''}
              onChange={(e) => setFormData({ ...formData, schedule: toWesternNumerals(e.target.value) })}
            />
          </div>
          <div className="space-y-1 lg:col-span-2">
            <label className="text-sm text-gray-500">رابط الموقع على الخريطة</label>
            <input
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none dir-ltr text-right"
              placeholder="https://maps.google.com/..."
              value={formData.locationLink || ''}
              onChange={(e) => setFormData({ ...formData, locationLink: e.target.value })}
            />
          </div>
          <div className="lg:col-span-3 flex justify-end gap-2 mt-2">
            {selectedId && (
              <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-500 border rounded-lg hover:bg-gray-50">إلغاء</button>
            )}
            <button type="submit" disabled={loading} className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 font-bold flex items-center gap-2">
              <Save size={18} />
              <span>{selectedId ? 'حفظ التعديلات' : 'إضافة الفرع'}</span>
            </button>
          </div>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b">
            <tr>
              <th className="p-4">اسم الفرع</th>
              <th className="p-4">الرمز</th>
              <th className="p-4">العنوان</th>
              <th className="p-4">الهاتف</th>
              <th className="p-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.branches?.map((branch) => (
              <tr key={branch.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-800">{branch.name}</td>
                <td className="p-4 text-gray-600 font-mono text-sm">{branch.code}</td>
                <td className="p-4 text-gray-600 text-sm">{branch.address || '-'}</td>
                <td className="p-4 text-gray-600 text-sm dir-ltr text-right">{branch.phone || '-'}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => handleEdit(branch)} className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(branch.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ======== RENDER ROOMS ========
  const renderRooms = () => (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-700 flex items-center gap-2 mb-4">
          {selectedId ? <Edit size={20} /> : <Plus size={20} />}
          <span>{selectedId ? 'تعديل قاعة' : 'إضافة قاعة جديدة'}</span>
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-sm text-gray-500">اسم القاعة</label>
            <input required className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none" placeholder="مثال: القاعة الذهبية" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: toWesternNumerals(e.target.value) })} />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">الفرع</label>
            <select className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none" value={formData.branchId || ''} onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}>
              <option value="">-- اختر الفرع --</option>
              {data.branches?.map(b => (<option key={b.id} value={b.id}>{b.name}</option>))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">السعة الاستيعابية</label>
            <input type="number" required className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none text-left dir-ltr" placeholder="عدد الأشخاص" value={formData.capacity || ''} onChange={(e) => setFormData({ ...formData, capacity: toWesternNumerals(e.target.value) })} />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">النوع</label>
            <select className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none" value={formData.type || 'classroom'} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
              <option value="classroom">فصل دراسي</option>
              <option value="hall">قاعة محاضرات</option>
              <option value="lab">محترف</option>
            </select>
          </div>
          <div className="col-span-full flex justify-end gap-2 mt-2">
            {selectedId && (<button type="button" onClick={resetForm} className="px-4 py-2 text-gray-500 border rounded-lg hover:bg-gray-50">إلغاء</button>)}
            <button type="submit" disabled={loading} className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 font-bold flex items-center gap-2"><Save size={18} /><span>{selectedId ? 'حفظ' : 'إضافة القاعة'}</span></button>
          </div>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b">
            <tr>
              <th className="p-4">اسم القاعة</th>
              <th className="p-4">الفرع</th>
              <th className="p-4">السعة</th>
              <th className="p-4">النوع</th>
              <th className="p-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.rooms?.map((room) => {
              const branch = data.branches?.find(b => b.id === room.branchId);
              return (
                <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-800">{room.name}</td>
                  <td className="p-4 text-gray-600 text-sm">{branch?.name || '-'}</td>
                  <td className="p-4 text-gray-600 dir-ltr text-right">{room.capacity} <span className="text-xs">شخص</span></td>
                  <td className="p-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{room.type === 'classroom' ? 'فصل' : room.type === 'hall' ? 'قاعة' : 'محترف'}</span></td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => handleEdit(room)} className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(room.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ======== RENDER LEVELS ========
  const renderLevels = () => (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-700 flex items-center gap-2 mb-4">
          {selectedId ? <Edit size={20} /> : <Plus size={20} />}
          <span>{selectedId ? 'تعديل مستوى' : 'إضافة مستوى جديد'}</span>
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-sm text-gray-500">اسم المستوى</label>
            <input required className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none" placeholder="مثال: المستوى الثالث" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: toWesternNumerals(e.target.value) })} />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">الفئة</label>
            <select className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none" value={formData.category || 'children'} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
              <option value="women">المرأة</option>
              <option value="girls">اليافعات</option>
              <option value="children">الأطفال</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">الترتيب</label>
            <input type="number" min="1" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none dir-ltr text-right" placeholder="1" value={formData.order || ''} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 1 })} />
          </div>
          <div className="space-y-1 md:col-span-2 lg:col-span-1">
            <label className="text-sm text-gray-500">الوصف</label>
            <input className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none" placeholder="وصف قصير (اختياري)" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: toWesternNumerals(e.target.value) })} />
          </div>
          <div className="col-span-full flex justify-end gap-2 mt-2">
            {selectedId && (<button type="button" onClick={resetForm} className="px-4 py-2 text-gray-500 border rounded-lg hover:bg-gray-50">إلغاء</button>)}
            <button type="submit" disabled={loading} className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 font-bold flex items-center gap-2"><Save size={18} /><span>{selectedId ? 'حفظ' : 'إضافة المستوى'}</span></button>
          </div>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b">
            <tr>
              <th className="p-4">اسم المستوى</th>
              <th className="p-4">الفئة</th>
              <th className="p-4">الترتيب</th>
              <th className="p-4">الوصف</th>
              <th className="p-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[...(data.levels || [])].sort((a, b) => {
              const categoryOrder = { women: 1, girls: 2, children: 3 };
              const catA = categoryOrder[a.category] || 99;
              const catB = categoryOrder[b.category] || 99;
              if (catA !== catB) return catA - catB;
              return (a.order || 0) - (b.order || 0);
            }).map((level) => (
              <tr key={level.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-800">{level.title}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${level.category === 'women' ? 'bg-pink-100 text-pink-700' : level.category === 'girls' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {level.category === 'women' ? 'المرأة' : level.category === 'girls' ? 'اليافعات' : 'الأطفال'}
                  </span>
                </td>
                <td className="p-4 text-gray-600 dir-ltr text-right">{level.order || '-'}</td>
                <td className="p-4 text-gray-500 text-sm">{level.description || '-'}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => handleEdit(level)} className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(level.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ======== RENDER DROPDOWN ITEMS (Generic for all dropdown value types) ========
  const renderDropdownItems = (collection, singularArabic, pluralArabic) => {
    const items = data[collection] || [];

    return (
      <div className="flex flex-col gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 flex items-center gap-2 mb-4">
            {selectedId ? <Edit size={20} /> : <Plus size={20} />}
            <span>{selectedId ? `تعديل ${singularArabic}` : `إضافة ${singularArabic} جديد`}</span>
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px] space-y-1">
              <label className="text-sm text-gray-500">الاسم *</label>
              <input
                required
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
                placeholder={`مثال: ${singularArabic}`}
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="flex-1 min-w-[150px] space-y-1">
              <label className="text-sm text-gray-500">القيمة (بالإنجليزية)</label>
              <input
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none dir-ltr text-right"
                placeholder="value"
                value={formData.value || ''}
                onChange={(e) => setFormData({ ...formData, value: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
              />
            </div>
            <div className="flex gap-2">
              {selectedId && (
                <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-lg hover:bg-gray-50">إلغاء</button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 font-bold flex items-center gap-2"
              >
                <Save size={18} />
                حفظ
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-600">
            {pluralArabic} المتوفرة ({items.length})
          </div>
          {items.length === 0 ? (
            <div className="p-8 text-center text-gray-400">لا توجد بيانات</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map(item => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="font-medium text-gray-800">{item.name}</div>
                    {item.value && (
                      <div className="text-xs text-gray-400 dir-ltr text-right">{item.value}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedId(item.id);
                        setFormData({ name: item.name || '', value: item.value || '' });
                      }}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const getImportExportProps = () => {
    if (activeTab === 'branches') {
      return { data: data.branches || [], fileName: 'branches.csv', headerMap: { 'name': 'الاسم', 'code': 'الرمز' }, templateHeaders: ['الاسم', 'الرمز'] };
    } else if (activeTab === 'rooms') {
      return { data: data.rooms || [], fileName: 'rooms.csv', headerMap: { 'name': 'الاسم', 'capacity': 'السعة', 'type': 'النوع' }, templateHeaders: ['الاسم', 'السعة', 'النوع', 'الفرع'] };
    } else {
      return { data: data.levels || [], fileName: 'levels.csv', headerMap: { 'title': 'الاسم', 'category': 'الفئة', 'order': 'الترتيب', 'description': 'الوصف' }, templateHeaders: ['الاسم', 'الفئة', 'الترتيب', 'الوصف'] };
    }
  };

  const importExportProps = getImportExportProps();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">إدارة البيانات الأساسية</h1>
        <div className="flex items-center gap-2">
          <DataImportExportComponent
            data={importExportProps.data}
            fileName={importExportProps.fileName}
            onImport={handleImport}
            headerMap={importExportProps.headerMap}
            templateHeaders={importExportProps.templateHeaders}
          />
          <BackButton />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        <button onClick={() => setActiveTab('branches')} className={`pb-2 px-3 font-bold flex items-center gap-2 transition-colors text-sm ${activeTab === 'branches' ? 'text-primary-green border-b-2 border-primary-green' : 'text-gray-400 hover:text-gray-600'}`}>
          <MapPin size={18} /><span>الفروع</span>
        </button>
        <button onClick={() => setActiveTab('rooms')} className={`pb-2 px-3 font-bold flex items-center gap-2 transition-colors text-sm ${activeTab === 'rooms' ? 'text-primary-green border-b-2 border-primary-green' : 'text-gray-400 hover:text-gray-600'}`}>
          <LayoutDashboard size={18} /><span>القاعات</span>
        </button>
        <button onClick={() => setActiveTab('levels')} className={`pb-2 px-3 font-bold flex items-center gap-2 transition-colors text-sm ${activeTab === 'levels' ? 'text-primary-green border-b-2 border-primary-green' : 'text-gray-400 hover:text-gray-600'}`}>
          <Layers size={18} /><span>المستويات</span>
        </button>
        <span className="border-l border-gray-300 mx-2"></span>
        <button onClick={() => setActiveTab('activityTypes')} className={`pb-2 px-3 font-bold flex items-center gap-2 transition-colors text-sm ${activeTab === 'activityTypes' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-600'}`}>
          <Tag size={18} /><span>أنواع الأنشطة</span>
        </button>
        <button onClick={() => setActiveTab('categories')} className={`pb-2 px-3 font-bold flex items-center gap-2 transition-colors text-sm ${activeTab === 'categories' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400 hover:text-gray-600'}`}>
          <Users size={18} /><span>الفئات</span>
        </button>
        <button onClick={() => setActiveTab('socialStatuses')} className={`pb-2 px-3 font-bold flex items-center gap-2 transition-colors text-sm ${activeTab === 'socialStatuses' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400 hover:text-gray-600'}`}>
          <Heart size={18} /><span>الحالة الاجتماعية</span>
        </button>
        <button onClick={() => setActiveTab('schoolLevels')} className={`pb-2 px-3 font-bold flex items-center gap-2 transition-colors text-sm ${activeTab === 'schoolLevels' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-600'}`}>
          <GraduationCap size={18} /><span>المستوى الدراسي</span>
        </button>
      </div>

      {activeTab === 'branches' ? renderBranches() :
        activeTab === 'rooms' ? renderRooms() :
          activeTab === 'levels' ? renderLevels() :
            activeTab === 'activityTypes' ? renderDropdownItems('activityTypes', 'نوع نشاط', 'أنواع الأنشطة') :
              activeTab === 'categories' ? renderDropdownItems('categories', 'فئة', 'الفئات') :
                activeTab === 'socialStatuses' ? renderDropdownItems('socialStatuses', 'حالة اجتماعية', 'الحالة الاجتماعية') :
                  renderDropdownItems('schoolLevels', 'مستوى دراسي', 'المستوى الدراسي')}
    </div>
  );
}
