import { Link } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, Calendar, Layers, ArchiveRestore, GraduationCap, Award, Shield, Database, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
    const { currentUser } = useAuth();

    const menuItems = [
        { title: 'إدارة المحتوى', icon: <BookOpen size={32} />, path: '/admin/content', color: 'text-green-500', bg: 'bg-green-50' },
        { title: 'إدارة الجدول الزمني', icon: <Calendar size={32} />, path: '/admin/calendar', color: 'text-purple-500', bg: 'bg-purple-50' },
        { title: 'إدارة المؤطرات', icon: <Users size={32} />, path: '/admin/teachers', color: 'text-orange-500', bg: 'bg-orange-50' },
        { title: 'إدارة الطلاب', icon: <GraduationCap size={32} />, path: '/admin/students', color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'إدارة الحضور', icon: <ClipboardCheck size={32} />, path: '/admin/attendance', color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { title: 'النتائج والترقية', icon: <Award size={32} />, path: '/admin/grades', color: 'text-yellow-500', bg: 'bg-yellow-50' },
    ];

    // Super-admin only items
    if (currentUser?.role === 'super-admin') {
        menuItems.push({ title: 'سلة المحذوفات', icon: <ArchiveRestore size={32} />, path: '/admin/trash', color: 'text-red-500', bg: 'bg-red-50' });
        menuItems.push({ title: 'إدارة البيانات الأساسية', icon: <Database size={32} />, path: '/admin/base-data', color: 'text-teal-500', bg: 'bg-teal-50' });
        menuItems.push({ title: 'إدارة المسؤولين', icon: <Shield size={32} />, path: '/admin/admins', color: 'text-purple-600', bg: 'bg-purple-50' });
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">لوحة التحكم</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        to={item.path}
                        className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-4 hover:shadow-md transition-all group"
                    >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                            {item.icon}
                        </div>
                        <span className="text-lg font-bold text-gray-700">{item.title}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
