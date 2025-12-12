import { Link } from 'react-router-dom';

export default function AdminDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">لوحة التحكم</h1>

            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mb-8 text-orange-800">
                مرحباً بك في لوحة تحكم الإدارة. يمكنك هنا إدارة المحتوى والجدول الزمني.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                    <h2 className="text-xl font-bold mb-2">إدارة المستويات</h2>
                    <p className="text-gray-500 mb-4 h-12">إضافة وتعديل وحذف المستويات الدراسية.</p>
                    <Link to="/admin/levels" className="text-primary-green font-bold hover:underline flex items-center gap-1">
                        الذهاب للقسم
                        <span dir="ltr">&larr;</span>
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </div>
                    <h2 className="text-xl font-bold mb-2">إدارة المحتوى</h2>
                    <p className="text-gray-500 mb-4 h-12">رفع الملفات والفيديوهات وتعيينها للمستويات.</p>
                    <button className="text-primary-green font-bold hover:underline flex items-center gap-1">
                        الذهاب للقسم
                        <span dir="ltr">&larr;</span>
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-green-100 text-primary-green rounded-lg flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <h2 className="text-xl font-bold mb-2">إدارة الجدول</h2>
                    <p className="text-gray-500 mb-4 h-12">تحديث مواعيد الحصص وإضافة العطل.</p>
                    <button className="text-primary-green font-bold hover:underline flex items-center gap-1">
                        الذهاب للقسم
                        <span dir="ltr">&larr;</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
