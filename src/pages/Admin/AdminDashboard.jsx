import { Link } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, Calendar, Eraser, Layers, ArchiveRestore } from 'lucide-react';
import SeedDatabase from '../../components/SeedDatabase';

export default function AdminDashboard() {
    const menuItems = [
        { title: 'إدارة المستويات', icon: <Layers size={32} />, path: '/admin/levels', color: 'text-blue-500', bg: 'bg-blue-50' },
        { title: 'إدارة المحتوى', icon: <BookOpen size={32} />, path: '/admin/content', color: 'text-green-500', bg: 'bg-green-50' },
        { title: 'الجدول الزمني', icon: <Calendar size={32} />, path: '/admin/calendar', color: 'text-purple-500', bg: 'bg-purple-50' },
        { title: 'إدارة المؤطرات', icon: <Users size={32} />, path: '/admin/teachers', color: 'text-orange-500', bg: 'bg-orange-50' },
        { title: 'إدارة القاعات', icon: <LayoutDashboard size={32} />, path: '/admin/rooms', color: 'text-teal-500', bg: 'bg-teal-50' },
        { title: 'سلة المحذوفات', icon: <ArchiveRestore size={32} />, path: '/admin/trash', color: 'text-red-500', bg: 'bg-red-50' },
    ];

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">لوحة التحكم</h1>
            </div>

            <SeedDatabase />

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
