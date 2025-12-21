import { useData } from '../../context/DataContext';
import { Heart, Users, BookOpen, Calendar, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="flex flex-col gap-8">
            {/* Hero Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-primary-green mb-4">
                    مرحباً بكم في جمعية بذور الأمل
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed mb-6">
                    جمعية تعليمية وتربوية تهتم بتنمية قدرات المرأة والطفل من خلال برامج تعليمية متكاملة ومتنوعة.
                </p>
                <Link
                    to="/levels"
                    className="inline-flex items-center gap-2 bg-primary-green text-white px-6 py-3 rounded-lg font-bold hover:bg-green-600 transition-colors"
                >
                    <BookOpen size={20} />
                    تصفح المحتوى التعليمي
                </Link>
            </div>

            {/* Features/Services */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center text-pink-500">
                        <Users size={28} />
                    </div>
                    <h3 className="font-bold text-gray-800">برامج متنوعة</h3>
                    <p className="text-sm text-gray-500">برامج مخصصة للنساء والفتيات والأطفال</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                        <BookOpen size={28} />
                    </div>
                    <h3 className="font-bold text-gray-800">محتوى تعليمي</h3>
                    <p className="text-sm text-gray-500">دروس ومحاضرات في مختلف المجالات</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center text-purple-500">
                        <Calendar size={28} />
                    </div>
                    <h3 className="font-bold text-gray-800">جدول منظم</h3>
                    <p className="text-sm text-gray-500">حصص ومواعيد منظمة طوال الأسبوع</p>
                </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-l from-primary-green/10 to-primary-orange/10 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg">اطلع على الجدول الزمني</h3>
                    <p className="text-sm text-gray-600">تعرف على مواعيد الحصص والأنشطة</p>
                </div>
                <Link
                    to="/calendar"
                    className="flex items-center gap-2 bg-white text-primary-green px-5 py-2 rounded-lg font-bold border border-primary-green hover:bg-primary-green hover:text-white transition-colors"
                >
                    <Calendar size={18} />
                    عرض الجدول
                </Link>
            </div>

            {/* Branches & Contact */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">فروعنا ومعلومات التواصل</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Branch 1 - Targa */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
                        <h3 className="font-bold text-green-800 text-lg mb-4 flex items-center gap-2">
                            <MapPin className="text-green-600" size={20} />
                            فرع تارگة
                        </h3>
                        <div className="space-y-2 text-sm text-green-700 mb-4">
                            <p>حي تارگة، مراكش</p>
                        </div>
                        <a
                            href="https://share.google/7RZVBmrfShvjeTI6g"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-800 underline"
                        >
                            <MapPin size={14} />
                            عرض على الخريطة
                        </a>
                    </div>

                    {/* Branch 2 - Amerchich */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
                        <h3 className="font-bold text-orange-800 text-lg mb-4 flex items-center gap-2">
                            <MapPin className="text-orange-600" size={20} />
                            فرع أمرشيش
                        </h3>
                        <div className="space-y-2 text-sm text-orange-700 mb-4">
                            <p>حي أمرشيش، مراكش</p>
                        </div>
                        <a
                            href="https://share.google/erGFedYhw9wNKbh36"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-800 underline"
                        >
                            <MapPin size={14} />
                            عرض على الخريطة
                        </a>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4 text-center">تواصل معنا</h3>
                    <div className="flex flex-wrap justify-center gap-6">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="text-primary-green" size={18} />
                            <span className="dir-ltr">+212 6XX-XXXXXX</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="text-primary-orange" size={18} />
                            <span>contact@seedsofhope.ma</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="text-purple-500" size={18} />
                            <span>السبت - الخميس: 9:00 - 18:00</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

