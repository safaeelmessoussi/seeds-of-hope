import DataImportExportComponent from '../../components/DataImportExport';
import { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { useData } from '../../context/DataContext';
import { Save, Trash2, Edit, User, GraduationCap, Phone, MapPin, Briefcase, Users, LogOut, ChevronDown, ChevronUp, Search, CreditCard } from 'lucide-react';
import { BackButton } from '../../components/Navbar';

export default function ManageStudents() {
    const { data, refreshData } = useData();
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        category: 'children',
        branchId: '',
        levelId: '',
        // Common fields
        schoolLevel: '',
        parentJob: '',
        address: '',
        phone: '',
        socialStatus: '',
        hasLeft: false,
        leaveReason: '',
        // Women-specific fields
        idCardNumber: '',
        occupation: '',
        educationLevel: ''
    });
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [expandedRow, setExpandedRow] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSelectAll = (e) => {
        const ids = filteredStudents.map(s => s.id);
        if (e.target.checked) {
            setSelectedIds(ids);
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

    // Filter and sort students
    const filteredStudents = students
        .filter(s => {
            if (!searchQuery.trim()) return true;
            const query = searchQuery.toLowerCase();
            return (s.name || '').toLowerCase().includes(query);
        })
        .sort((a, b) => {
            const nameA = (a.name || '').toLowerCase();
            const nameB = (b.name || '').toLowerCase();
            return nameA.localeCompare(nameB, 'ar');
        });

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
            socialStatus: student.socialStatus || '',
            hasLeft: student.hasLeft || false,
            leaveReason: student.leaveReason || '',
            // Women-specific fields
            idCardNumber: student.idCardNumber || '',
            occupation: student.occupation || '',
            educationLevel: student.educationLevel || ''
        });
    };

    const resetForm = () => {
        setSelectedId(null);
        setFormData({
            name: '', category: 'children', branchId: '', levelId: '',
            schoolLevel: '', parentJob: '', address: '', phone: '',
            socialStatus: '', hasLeft: false, leaveReason: '',
            idCardNumber: '', occupation: '', educationLevel: ''
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
                        }}
                        templateHeaders={['الاسم الكامل', 'الفئة', 'الفرع', 'المستوى', 'المستوى الدراسي', 'مهنة ولي الامر', 'العنوان', 'رقم الهاتف', 'الحالة الاجتماعية']}
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
                            <option value="young-girls">اليافعات</option>
                            <option value="women">المرأة</option>
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

                    {/* Conditional Fields based on Category */}
                    {formData.category === 'women' ? (
                        <>
                            {/* Women-specific fields */}
                            <div className="space-y-1">
                                <label className="text-sm text-gray-500">رقم البطاقة الوطنية</label>
                                <input
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none dir-ltr text-right"
                                    placeholder="EE123456"
                                    value={formData.idCardNumber}
                                    onChange={(e) => setFormData({ ...formData, idCardNumber: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm text-gray-500">المستوى الدراسي</label>
                                <select
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
                                    value={formData.educationLevel}
                                    onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                                >
                                    <option value="">-- غير محدد --</option>
                                    <option value="ابتدائي">ابتدائي</option>
                                    <option value="إعدادي">إعدادي</option>
                                    <option value="ثانوي">ثانوي</option>
                                    <option value="جامعي">جامعي</option>
                                    <option value="ماستر">ماستر</option>
                                    <option value="دكتوراه">دكتوراه</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm text-gray-500">المهنة / الوظيفة</label>
                                <input
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
                                    placeholder="مثال: ربة بيت، موظفة، تقنية..."
                                    value={formData.occupation}
                                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Children/Young Girls fields */}
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
                        </>
                    )}

                    {/* Row 3: Address */}
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

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-green outline-none"
                        placeholder="بحث باسم الطالب..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-600 text-sm flex items-center justify-between">
                    <span>قائمة الطلاب ({filteredStudents.length})</span>
                    {searchQuery && <span className="text-xs text-gray-400 font-normal">نتائج البحث</span>}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right min-w-[900px]">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b">
                            <tr>
                                <th className="p-4 w-4">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={filteredStudents.length > 0 && selectedIds.length === filteredStudents.length}
                                    />
                                </th>
                                <th className="p-4">الاسم</th>
                                <th className="p-4">الفئة</th>
                                <th className="p-4">الهاتف</th>
                                <th className="p-4">الفرع</th>
                                <th className="p-4">المستوى</th>
                                <th className="p-4">المستوى الدراسي</th>
                                <th className="p-4">الحالة</th>
                                <th className="p-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredStudents.map((s) => {
                                const branch = data.branches?.find(b => b.id === s.branchId);
                                const level = data.levels?.find(l => l.id === s.levelId);
                                const isEditing = selectedId === s.id;
                                const categoryLabel = s.category === 'children' ? 'أطفال' : s.category === 'women' ? 'مرأة' : 'يافعات';
                                return (
                                    <tr
                                        key={s.id}
                                        className={`transition-colors ${isEditing
                                            ? 'bg-blue-50 border-r-4 border-r-blue-500'
                                            : s.hasLeft
                                                ? 'bg-red-50 hover:bg-red-100'
                                                : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(s.id)}
                                                onChange={(e) => handleSelectOne(s.id, e.target.checked)}
                                            />
                                        </td>
                                        <td className="p-4 font-medium text-gray-800">{s.name || '-'}</td>
                                        <td className="p-4 text-gray-600 text-sm">{categoryLabel}</td>
                                        <td className="p-4 text-gray-600 text-sm dir-ltr text-right">{s.phone || '-'}</td>
                                        <td className="p-4 text-gray-600 text-sm">{branch?.name || '-'}</td>
                                        <td className="p-4 text-gray-600 text-sm">{level?.title || '-'}</td>
                                        <td className="p-4 text-gray-600 text-sm">{s.schoolLevel || '-'}</td>
                                        <td className="p-4">
                                            {s.hasLeft ? (
                                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">غادر</span>
                                            ) : (
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">نشط</span>
                                            )}
                                        </td>
                                        <td className="p-4 flex gap-2">
                                            <button
                                                onClick={() => handleEdit(s)}
                                                className={`${isEditing ? 'text-blue-700' : 'text-blue-500 hover:text-blue-700'}`}
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredStudents.length === 0 && (
                    <div className="p-8 text-center text-gray-400">لا يوجد طلاب</div>
                )}
            </div>
        </div>
    );
}

