import { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Save, Trash2, Edit, Shield, Mail, KeyRound } from 'lucide-react';
import { BackButton } from '../../components/Navbar';
import { sendPasswordResetEmail, createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { auth, firebaseConfig } from '../../firebase';
import { initializeApp } from "firebase/app";

import DataImportExportComponent from '../../components/DataImportExport';

export default function ManageAdmins() {
    const { data, refreshData } = useData();
    const { currentUser } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [formData, setFormData] = useState({ email: '', role: 'admin', branchId: '' });
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleImport = async (parsedData) => {
        setLoading(true);
        try {
            const validAdmins = parsedData.map(row => ({
                email: row['Email'] || row['email'] || row['البريد'] || '',
                role: 'admin', // Default
                branchId: '' // Logic to find branch if provided
            })).filter(a => a.email);

            await Promise.all(validAdmins.map(a => dbService.add('users', a)));
            await refreshData();
            alert('تم استيراد المسؤولين بنجاح. تذكر إرسال دعوة لهم لتفعيل الحساب.');
        } catch (error) {
            console.error(error);
            alert('فشل الاستيراد');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (data.users) {
            // Show both admins and super-admins
            setAdmins(data.users.filter(u => u.role === 'admin' || u.role === 'super-admin'));
        }
    }, [data.users]);

    // Helper to create user in Auth if not exists (using secondary app to avoid logout)
    const ensureAuthUser = async (email) => {
        try {
            // Try to create the user with a temporary password
            // Use a unique name for the secondary app to avoid conflicts if multiple calls happen
            const appName = "secondaryApp";
            let tempApp;
            try {
                tempApp = initializeApp(firebaseConfig, appName);
            } catch (e) {
                // If already initialized, use existing
                // But we can't easily get it by name without importing getApp.
                // Easier to just let it fail or wrap? 
                // Actually initializeApp throws if exists.
                // We should probably just catch or use a random name.
            }
            // Better approach: Since we don't have getApp imported, let's just use a random ID suffix
            const uniqueName = `secondary-${Date.now()}`;
            const secondaryApp = initializeApp(firebaseConfig, uniqueName);
            const secondaryAuth = getAuth(secondaryApp);

            await createUserWithEmailAndPassword(secondaryAuth, email, "tempPass123!");

            // Note: We leave the app instance alive as cleanup is complex without 'deleteApp'
            // In a real prod app we'd delete it, but for this admin tool it's acceptable.
            return { success: true };
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                return { success: true }; // Exists
            }
            console.error("Failed to create auth user:", error);
            return { success: false, error: error.code || error.message };
        }
    };

    // Protect Route: Only super-admin should see this
    if (currentUser?.role !== 'super-admin') {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl text-red-500">غير مسموح لك بالدخول لهذه الصفحة</h2>
                <BackButton />
            </div>
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                email: formData.email,
                role: formData.role, // Use selected role
                branchId: formData.branchId || null
            };

            if (selectedId) {
                await dbService.update('users', selectedId, payload);
            } else {
                await dbService.add('users', payload);
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

    const handleSendInvite = async (email) => {
        if (!confirm(`هل تريد إرسال بريد دعوة/إعادة تعيين كلمة المرور إلى ${email}؟`)) return;

        // Debug Alert 1
        console.log("Starting invite process for:", email);

        try {
            // Debug Alert 2
            await sendPasswordResetEmail(auth, email);
            alert(`تم إرسال بريد الدعوة إلى ${email} بنجاح.`);
        } catch (error) {
            console.error("Main send error:", error);

            if (error.code === 'auth/user-not-found') {
                const proceed = confirm(`المستخدم غير موجود في نظام المصادقة (Auth). هل تريد إنشاء حساب له تلقائياً الآن؟`);
                if (!proceed) return;

                // User doesn't exist in Auth. Create them first.
                const created = await ensureAuthUser(email);

                if (created.success) {
                    try {
                        // Retry sending email
                        await sendPasswordResetEmail(auth, email);
                        alert(`تم إنشاء حساب للمستخدم وإرسال بريد الدعوة إلى ${email} بنجاح.`);
                    } catch (retryError) {
                        console.error("Retry send error:", retryError);
                        alert(`تم إنشاء الحساب لكن فشل إرسال البريد: ${retryError.code}`);
                    }
                } else {
                    alert(`فشل إنشاء حساب لهذا البريد الإلكتروني تلقائياً.\nالسبب: ${created.error}`);
                }
            } else {
                alert(`خطأ غير متوقع: ${error.code}\n${error.message}`);
            }
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من الحذف؟')) return;
        try {
            await dbService.remove('users', id);
            await refreshData();
        } catch (error) {
            alert('فشل الحذف');
        }
    };

    const handleEdit = (admin) => {
        setSelectedId(admin.id);
        setFormData({ email: admin.email, role: admin.role || 'admin', branchId: admin.branchId || '' });
    };

    const resetForm = () => {
        setSelectedId(null);
        setFormData({ email: '', role: 'admin', branchId: '' });
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">إدارة المسؤولين</h1>
                <div className="flex items-center gap-2">
                    <DataImportExportComponent
                        data={admins}
                        fileName="admins_export.csv"
                        onImport={handleImport}
                        headerMap={{ 'email': 'البريد الإلكتروني', 'role': 'الدور' }}
                        templateHeaders={['Email', 'Role', 'Branch']}
                    />
                    <BackButton />
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="font-bold text-gray-700 flex items-center gap-2 mb-4">
                    <Shield size={20} />
                    <span>{selectedId ? 'تعديل بيانات مسؤول' : 'إضافة مسؤول جديد'}</span>
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">البريد الإلكتروني</label>
                        <input
                            type="email"
                            required
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none dir-ltr text-left placeholder:text-right"
                            placeholder="admin@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">الدور (الصلاحية)</label>
                        <select
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-green outline-none"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="admin">مسؤول (Admin)</option>
                            <option value="super-admin">مسؤول عام (Super Admin)</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">الفرع المسؤول عنه</label>
                        <select
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
                            <span>{loading ? 'جاري الحفظ...' : 'حفظ المسؤول'}</span>
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-600 text-sm">
                    قائمة المسؤولين (Admins)
                </div>
                <table className="w-full text-right">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b">
                        <tr>
                            <th className="p-4">البريد الإلكتروني</th>
                            <th className="p-4">الدور</th>
                            <th className="p-4">الفرع</th>
                            <th className="p-4">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {admins.map((admin) => {
                            const branch = data.branches?.find(b => b.id === admin.branchId);
                            return (
                                <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-gray-800 dir-ltr text-right">{admin.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs ${admin.role === 'super-admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {admin.role === 'super-admin' ? 'مسؤول عام' : 'مسؤول'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600">{branch?.name || 'غير محدد'}</td>
                                    <td className="p-4 flex gap-2">
                                        <button
                                            onClick={() => handleSendInvite(admin.email)}
                                            className="text-orange-500 hover:text-orange-700"
                                            title="إرسال دعوة / تعيين كلمة المرور"
                                        >
                                            <KeyRound size={18} />
                                        </button>
                                        <button onClick={() => handleEdit(admin)} className="text-blue-500 hover:text-blue-700">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(admin.id)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                {admins.length === 0 && (
                    <div className="p-8 text-center text-gray-400">لا يوجد مسؤولين حالياً</div>
                )}
            </div>
        </div>
    );
}
