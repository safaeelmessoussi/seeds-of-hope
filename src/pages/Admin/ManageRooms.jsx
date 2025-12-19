import { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Save, Trash2, Edit, Plus, MapPin, LayoutDashboard } from 'lucide-react';
import { BackButton } from '../../components/Navbar';
import { toWesternNumerals } from '../../utils/dateUtils';
import DataImportExportComponent from '../../components/DataImportExport';

export default function ManageRooms() {
  const { data, refreshData } = useData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('rooms'); // 'branches' or 'rooms'

  // Unified State for simplicity (keys overlap is fine)
  // Branch: { name, code }
  // Room: { name, capacity, type, branchId }
  const [formData, setFormData] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImport = async (parsedData) => {
    setLoading(true);
    try {
      const collection = activeTab === 'branches' ? 'branches' : 'rooms';
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
      } else {
        // Rooms
        parsedData.forEach(row => {
          // Find Branch
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

  // Set default tab based on role? 
  // Super-admins might start on Branches, others on Rooms.
  // For now default Rooms is safe.

  const resetForm = () => {
    setSelectedId(null);
    if (activeTab === 'branches') {
      setFormData({ name: '', code: '' });
    } else {
      setFormData({ name: '', capacity: '', type: 'classroom', branchId: '' });
    }
  };

  // Switch tab resets form
  useEffect(() => {
    resetForm();
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const collection = activeTab === 'branches' ? 'branches' : 'rooms';

    try {
      if (selectedId) {
        await dbService.update(collection, selectedId, formData);
      } else {
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
    const collection = activeTab === 'branches' ? 'branches' : 'rooms';
    try {
      await dbService.remove(collection, id);
      await refreshData();
    } catch (error) {
      alert('فشل الحذف');
    }
  };

  const handleEdit = (item) => {
    setSelectedId(item.id);
    if (activeTab === 'branches') {
      setFormData({ name: item.name, code: item.code });
    } else {
      setFormData({
        name: item.name,
        capacity: item.capacity,
        type: item.type,
        branchId: item.branchId || ''
      });
    }
  };

  // Renders
  const renderBranches = () => (
    <div className="flex flex-col gap-6">
      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-700 flex items-center gap-2 mb-4">
          {selectedId ? <Edit size={20} /> : <Plus size={20} />}
          <span>{selectedId ? 'تعديل فرع' : 'إضافة فرع جديد'}</span>
        </h2>
        <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
          <div className="space-y-1 flex-1 min-w-[200px]">
            <label className="text-sm text-gray-500">اسم الفرع</label>
            <input
              required
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
              placeholder="مثال: فرع تاركة"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: toWesternNumerals(e.target.value) })}
            />
          </div>
          <div className="space-y-1 w-40">
            <label className="text-sm text-gray-500">رمز الفرع (Code)</label>
            <input
              required
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none dir-ltr text-right"
              placeholder="TARKA"
              value={formData.code || ''}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
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
              <span>{selectedId ? 'حفظ' : 'إضافة'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b">
            <tr>
              <th className="p-4">اسم الفرع</th>
              <th className="p-4">الرمز</th>
              <th className="p-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.branches?.map((branch) => (
              <tr key={branch.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-800">{branch.name}</td>
                <td className="p-4 text-gray-600 font-mono text-sm">{branch.code}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => handleEdit(branch)} className="text-blue-500 hover:text-blue-700">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(branch.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRooms = () => (
    <div className="flex flex-col gap-6">
      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-700 flex items-center gap-2 mb-4">
          {selectedId ? <Edit size={20} /> : <Plus size={20} />}
          <span>{selectedId ? 'تعديل قاعة' : 'إضافة قاعة جديدة'}</span>
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-sm text-gray-500">اسم القاعة</label>
            <input
              required
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
              placeholder="مثال: القاعة الذهبية"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: toWesternNumerals(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">الفرع</label>
            <select
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
              value={formData.branchId || ''}
              onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
            >
              <option value="">-- اختر الفرع --</option>
              {data.branches?.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">السعة الاستيعابية</label>
            <input
              type="number"
              required
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none text-left dir-ltr"
              placeholder="عدد الأشخاص"
              value={formData.capacity || ''}
              onChange={(e) => setFormData({ ...formData, capacity: toWesternNumerals(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">النوع</label>
            <select
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
              value={formData.type || 'classroom'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="classroom">فصل دراسي</option>
              <option value="hall">قاعة محاضرات</option>
              <option value="lab">محترف</option>
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
              <span>{selectedId ? 'حفظ' : 'إضافة القاعة'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">إدارة المرافق (الفروع والقاعات)</h1>
        <div className="flex items-center gap-2">
          <DataImportExportComponent
            data={activeTab === 'branches' ? (data.branches || []) : (data.rooms || [])}
            fileName={activeTab === 'branches' ? "branches.csv" : "rooms.csv"}
            onImport={handleImport}
            headerMap={activeTab === 'branches' ? { 'name': 'الاسم', 'code': 'الرمز' } : { 'name': 'الاسم', 'capacity': 'السعة', 'type': 'النوع' }}
            templateHeaders={activeTab === 'branches' ? ['Name', 'Code'] : ['Name', 'Capacity', 'Type', 'Branch']}
          />
          <BackButton />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('branches')}
          className={`pb-2 px-4 font-bold flex items-center gap-2 transition-colors ${activeTab === 'branches' ? 'text-primary-green border-b-2 border-primary-green' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <MapPin size={20} />
          <span>الفروع</span>
        </button>
        <button
          onClick={() => setActiveTab('rooms')}
          className={`pb-2 px-4 font-bold flex items-center gap-2 transition-colors ${activeTab === 'rooms' ? 'text-primary-green border-b-2 border-primary-green' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <LayoutDashboard size={20} />
          <span>القاعات</span>
        </button>
      </div>

      {activeTab === 'branches' ? renderBranches() : renderRooms()}
    </div>
  );
}
