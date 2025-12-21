import DataImportExportComponent from '../../components/DataImportExport';
import { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { useData } from '../../context/DataContext';
import { Save, Trash2, Edit, User, GraduationCap, Phone, MapPin, Briefcase, Users, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { BackButton } from '../../components/Navbar';

export default function ManageStudents() {
    const { data, refreshData } = useData();
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        category: 'children',
        branchId: '',
        levelId: '',
        // New fields from xlsx
        schoolLevel: '',
        parentJob: '',
        address: '',
        phone: '',
        groupName: '',
        socialStatus: '',
        hasLeft: false,
        leaveReason: ''
    });
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [expandedRow, setExpandedRow] = useState(null);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(students.map(s => s.id));
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
        if (!confirm(`هل أنت متأكد من حذف ${selectedIds.length} طالب؟`)) return;

        try {
            await Promise.all(selectedIds.map(id => dbService.remove('students', id)));
            await refreshData();
            setSelectedIds([]);
        } catch (e) {
            alert('فشل الحذف الجماعي');
        }
    };

    useEffect(() => {
        if (data.students) setStudents(data.students);
    }, [data.students]);

    const handleImport = async (parsedData) => {
        if (!confirm(`سيتم استيراد ${parsedData.length} طالب. هل أنت متأكد؟`)) return;
        setLoading(true);
        try {
            const validStudents = [];

            for (const row of parsedData) {
                // Resolve Branch ID
                let branchId = '';
                if (row['Branch ID'] || row['branchId']) branchId = row['Branch ID'] || row['branchId'];
                else if (row['Branch'] || row['الفرع']) {
                    const branchName = row['Branch'] || row['الفرع'];
                    const branch = data.branches?.find(b => b.name === branchName);
                    if (branch) branchId = branch.id;
                }

                // Resolve Level ID
                let levelId = '';
                if (row['Level ID'] || row['levelId']) levelId = row['Level ID'] || row['levelId'];
                else if (row['Level'] || row['المستوى'] || row['المجموعة']) {
                    const levelName = row['Level'] || row['المستوى'] || row['المجموعة'];
                    const level = data.levels?.find(l => l.title === levelName);
                    if (level) levelId = level.id;
                }

                // Map Category
                let category = 'children';
                const catRaw = row['Category'] || row['الفئة'] || row['اللجة'] || 'children';
                if (catRaw === 'نسائي' || catRaw === 'women' || catRaw === 'نساء') category = 'women';
                else if (catRaw === 'فتيات' || catRaw === 'young-girls' || catRaw === 'girls') category = 'young-girls';
                else if (catRaw === 'طفل' || catRaw === 'أطفال' || catRaw === 'children') category = 'children';

                validStudents.push({
                    name: row['Name'] || row['الاسم'] || row['الاسم الكامل'] || row['الاسم الكامل '],
                    category,
                    branchId,
                    levelId,
                    schoolLevel: row['المستوى الدراسي'] || row['School Level'] || '',
                    parentJob: row['مهنة ولي الامر'] || row['Parent Job'] || '',
                    address: row['العنوان'] || row['Address'] || '',
                    phone: String(row['رقم الهاتف'] || row['Phone'] || ''),
                    groupName: row['المجموعة'] || row['Group'] || row['اسم المستوى'] || '',
                    socialStatus: row['الحالة الاجتماعية'] || row['اللجة'] || row['Social Status'] || '',
                    hasLeft: (row['غادر'] === 'نعم' || row['Left'] === 'yes') ? true : false,
                    leaveReason: row['سبب المغادرة'] || row['Leave Reason'] || '',
                    enrollmentDate: new Date().toISOString()
                });
            }

            await Promise.all(validStudents.map(s => dbService.add('students', s)));
            await refreshData();
            alert('تم الاستيراد بنجاح');
        } catch (error) {
            console.error(error);
            alert('فشل الاستيراد');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (selectedId) {
                await dbService.update('students', selectedId, formData);
            } else {
                await dbService.add('students', {
                    ...formData,
                    enrollmentDate: new Date().toISOString()
                });
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
        if (!confirm('هل أنت متأكد من حذف هذا الطالب؟')) return;
        try {
            await dbService.remove('students', id);
            await refreshData();
        } catch (error) {
            alert('فشل الحذف');
        }
    };

    const handleEdit = (student) => {
        setSelectedId(student.id);
        setFormData({
            name: student.name || '',
            category: student.category || 'children',
            branchId: student.branchId || '',
            levelId: student.levelId || '',
            schoolLevel: student.schoolLevel || '',
            parentJob: student.parentJob || '',
            address: student.address || '',
            phone: student.phone || '',
            groupName: student.groupName || '',
            socialStatus: student.socialStatus || '',
            hasLeft: student.hasLeft || false,
            leaveReason: student.leaveReason || ''
        });
    };

    const resetForm = () => {
        setSelectedId(null);
        setFormData({
            name: '', category: 'children', branchId: '', levelId: '',
            schoolLevel: '', parentJob: '', address: '', phone: '',
            groupName: '', socialStatus: '', hasLeft: false, leaveReason: ''
        });
    };

    // Filter levels based on selected category AND branch
    const availableLevels = data.levels?.filter(l =>
        (!l.category || l.category === formData.category) &&
        (!l.branchId || l.branchId === formData.branchId || !formData.branchId)
    ) || [];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">إدارة المستفيدين (الطلاب)</h1>
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
                        data={students}
                        fileName="students_export.csv"
                        onImport={handleImport}
                        headerMap={{
                            'name': 'الاسم',
                            'category': 'الفئة',
                            'phone': 'رقم الهاتف',
                            'groupName': 'المجموعة',
                        }}
                        templateHeaders={['الاسم الكامل', 'الفئة', 'الفرع', 'المستوى', 'المستوى الدراسي', 'مهنة ولي الامر', 'العنوان', 'رقم الهاتف', 'المجموعة', 'الحالة الاجتماعية']}
                    />
                    <BackButton />
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="font-bold text-gray-700 flex items-center gap-2 mb-4">
                    <GraduationCap size={20} />
                    <span>{selectedId ? 'تعديل بيانات طالب' : 'إضافة طالب جديد'}</span>
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Row 1: Basic Info */}
                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">الاسم الكامل *</label>
                        <input
                            required
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
                            placeholder="الاسم الكامل"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">الفئة</label>
                        <select
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="children">الأطفال</option>
                            <option value="young-girls">الفتيات</option>
                            <option value="women">النساء</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">الفرع *</label>
                        <select
                            required
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
                            value={formData.branchId}
                            onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                        >
                            <option value="">-- اختر الفرع --</option>
                            {data.branches?.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">المستوى بالجمعية *</label>
                        <select
                            required
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
                            value={formData.levelId}
                            onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
                        >
                            <option value="">-- اختر المستوى --</option>
                            {availableLevels.map(l => (
                                <option key={l.id} value={l.id}>{l.title}</option>
                            ))}
                        </select>
                    </div>

                    {/* Row 2: Contact & School Info */}
                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">رقم الهاتف</label>
                        <input
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none dir-ltr text-right"
                            placeholder="06XXXXXXXX"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">المستوى الدراسي</label>
                        <select
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
                            value={formData.schoolLevel}
                            onChange={(e) => setFormData({ ...formData, schoolLevel: e.target.value })}
                        >
                            <option value="">-- غير محدد --</option>
                            <option value="روضة">روضة</option>
                            <option value="ابتدائي">ابتدائي</option>
                            <option value="اعدادي">إعدادي</option>
                            <option value="ثانوي">ثانوي</option>
                            <option value="جامعي">جامعي</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">مهنة ولي الأمر</label>
                        <input
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
                            placeholder="مهنة ولي الأمر"
                            value={formData.parentJob}
                            onChange={(e) => setFormData({ ...formData, parentJob: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">المجموعة</label>
                        <input
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
                            placeholder="اسم المجموعة"
                            value={formData.groupName}
                            onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                        />
                    </div>

                    {/* Row 3: Address & Social */}
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-sm text-gray-500">العنوان</label>
                        <input
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
                            placeholder="العنوان الكامل"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">الحالة الاجتماعية</label>
                        <select
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
                            value={formData.socialStatus}
                            onChange={(e) => setFormData({ ...formData, socialStatus: e.target.value })}
                        >
                            <option value="">-- غير محدد --</option>
                            <option value="كليها">كليهما (الأب والأم)</option>
                            <option value="مع الأم">مع الأم</option>
                            <option value="مع الأب">مع الأب</option>
                            <option value="يتيم">يتيم</option>
                            <option value="أخرى">أخرى</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">الحالة</label>
                        <div className="flex items-center gap-4 h-10">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.hasLeft}
                                    onChange={(e) => setFormData({ ...formData, hasLeft: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className={formData.hasLeft ? 'text-red-600 font-medium' : 'text-gray-600'}>غادر</span>
                            </label>
                        </div>
                    </div>

                    {formData.hasLeft && (
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm text-gray-500">سبب المغادرة</label>
                            <input
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
                                placeholder="سبب المغادرة"
                                value={formData.leaveReason}
                                onChange={(e) => setFormData({ ...formData, leaveReason: e.target.value })}
                            />
                        </div>
                    )}

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
                            <span>{loading ? 'جاري الحفظ...' : 'حفظ الطالب'}</span>
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-600 text-sm flex items-center justify-between">
                    <span>قائمة الطلاب ({students.length})</span>
                </div>
                <table className="w-full text-right">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b">
                        <tr>
                            <th className="p-4 w-4">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={students.length > 0 && selectedIds.length === students.length}
                                />
                            </th>
                            <th className="p-4">الاسم</th>
                            <th className="p-4">الهاتف</th>
                            <th className="p-4">الفرع</th>
                            <th className="p-4">المستوى</th>
                            <th className="p-4">الحالة</th>
                            <th className="p-4">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {students.map((s) => {
                            const branch = data.branches?.find(b => b.id === s.branchId);
                            const level = data.levels?.find(l => l.id === s.levelId);
                            const isExpanded = expandedRow === s.id;
                            return (
                                <>
                                    <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${s.hasLeft ? 'bg-red-50' : ''}`}>
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(s.id)}
                                                onChange={(e) => handleSelectOne(s.id, e.target.checked)}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => setExpandedRow(isExpanded ? null : s.id)}
                                                className="flex items-center gap-2 font-medium text-gray-800 hover:text-primary-green"
                                            >
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                {s.name}
                                            </button>
                                        </td>
                                        <td className="p-4 text-gray-600 text-sm dir-ltr text-right">{s.phone || '-'}</td>
                                        <td className="p-4 text-gray-600 text-sm">{branch?.name || '-'}</td>
                                        <td className="p-4 text-gray-600 text-sm">{level?.title || s.groupName || '-'}</td>
                                        <td className="p-4">
                                            {s.hasLeft ? (
                                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">غادر</span>
                                            ) : (
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">نشط</span>
                                            )}
                                        </td>
                                        <td className="p-4 flex gap-2">
                                            <button onClick={() => handleEdit(s)} className="text-blue-500 hover:text-blue-700">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr key={`${s.id}-details`} className="bg-gray-50">
                                            <td colSpan="7" className="p-4">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-400">الفئة:</span>
                                                        <span className="mr-2 text-gray-700">{s.category === 'children' ? 'أطفال' : s.category === 'women' ? 'نساء' : 'فتيات'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">المستوى الدراسي:</span>
                                                        <span className="mr-2 text-gray-700">{s.schoolLevel || '-'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">مهنة ولي الأمر:</span>
                                                        <span className="mr-2 text-gray-700">{s.parentJob || '-'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">الحالة الاجتماعية:</span>
                                                        <span className="mr-2 text-gray-700">{s.socialStatus || '-'}</span>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <span className="text-gray-400">العنوان:</span>
                                                        <span className="mr-2 text-gray-700">{s.address || '-'}</span>
                                                    </div>
                                                    {s.hasLeft && s.leaveReason && (
                                                        <div className="md:col-span-2">
                                                            <span className="text-gray-400">سبب المغادرة:</span>
                                                            <span className="mr-2 text-red-600">{s.leaveReason}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            );
                        })}
                    </tbody>
                </table>
                {students.length === 0 && (
                    <div className="p-8 text-center text-gray-400">لا يوجد طلاب</div>
                )}
            </div>
        </div>
    );
}
