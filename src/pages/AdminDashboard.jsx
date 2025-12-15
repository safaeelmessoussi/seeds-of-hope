import { useNavigate, Link } from 'react-router-dom';
import { Layers, FileText, Calendar, LogOut, Trash2, Users, Layout as LayoutIcon } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">لوحة التحكم</h1>

            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mb-8 text-orange-800">
                مرحباً بك في لوحة تحكم الإدارة. يمكنك هنا إدارة المحتوى والجدول الزمني.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link to="/admin/levels" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center gap-4 group text-center">
                    <div className="bg-blue-100 p-4 rounded-full text-blue-600 group-hover:bg-blue-200 transition-colors">
                        <Layers size={32} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">إدارة المستويات</h2>
                        <p className="text-sm text-gray-500 mt-1">تعديل المستويات الدراسية</p>
                    </div>
                </Link>

                <Link to="/admin/content" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center gap-4 group text-center">
                    <div className="bg-purple-100 p-4 rounded-full text-purple-600 group-hover:bg-purple-200 transition-colors">
                        <FileText size={32} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">إدارة المحتوى</h2>
                        <p className="text-sm text-gray-500 mt-1">رفع الملفات والفيديوهات</p>
                    </div>
                </Link>

                <Link to="/admin/calendar" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center gap-4 group text-center">
                    <div className="bg-green-100 p-4 rounded-full text-primary-green group-hover:bg-green-200 transition-colors">
                        <Calendar size={32} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">إدارة الجدول</h2>
                        <p className="text-sm text-gray-500 mt-1">تحديث الحصص والعطل</p>
                    </div>
                </Link>

                <Link to="/admin/teachers" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center gap-4 group text-center">
                    <div className="bg-blue-100 p-4 rounded-full text-blue-600 group-hover:bg-blue-200 transition-colors">
                        <Users size={32} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">إدارة المعلمات</h2>
                        <p className="text-sm text-gray-500 mt-1">تعديل بيانات المعلمات</p>
                    </div>
                </Link>

                <Link to="/admin/rooms" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center gap-4 group text-center">
                    <div className="bg-yellow-100 p-4 rounded-full text-yellow-600 group-hover:bg-yellow-200 transition-colors">
                        <LayoutIcon size={32} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">إدارة القاعات</h2>
                        <p className="text-sm text-gray-500 mt-1">تحديث القاعات والفصول</p>
                    </div>
                </Link>

                <Link to="/admin/trash" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center gap-4 group text-center">
                    <div className="bg-red-50 p-4 rounded-full text-red-500 group-hover:bg-red-100 transition-colors">
                        <Trash2 size={32} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">سلة المحذوفات</h2>
                        <p className="text-sm text-gray-500 mt-1">استعادة العناصر المحذوفة</p>
                    </div>
                </Link>
            </div>
        </div>
    )
}
