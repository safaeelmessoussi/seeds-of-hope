import { useData } from '../../context/DataContext';
import { Users, BookOpen, Calendar, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

// Branch colors for alternating display
const BRANCH_COLORS = [
    { bg: 'from-green-50 to-green-100', border: 'border-green-200', title: 'text-green-800', icon: 'text-green-600', text: 'text-green-700', link: 'text-green-600 hover:text-green-800' },
    { bg: 'from-orange-50 to-orange-100', border: 'border-orange-200', title: 'text-orange-800', icon: 'text-orange-600', text: 'text-orange-700', link: 'text-orange-600 hover:text-orange-800' },
    { bg: 'from-purple-50 to-purple-100', border: 'border-purple-200', title: 'text-purple-800', icon: 'text-purple-600', text: 'text-purple-700', link: 'text-purple-600 hover:text-purple-800' },
    { bg: 'from-cyan-50 to-cyan-100', border: 'border-cyan-200', title: 'text-cyan-800', icon: 'text-cyan-600', text: 'text-cyan-700', link: 'text-cyan-600 hover:text-cyan-800' }
];

export default function Home() {
    const { data } = useData();
    const branches = data.branches || [];

    return (
        <div className="flex flex-col gap-8">
            {/* Hero Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-primary-green mb-4">
                    مرحباً بكم في جمعية بذور الأمل
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    جمعية تعليمية وتربوية تهتم بتنمية قدرات المرأة والطفل من خلال برامج تعليمية متكاملة ومتنوعة.
                </p>
            </div>

            {/* Introduction Video */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">تعرف على جمعيتنا</h2>
                <div className="max-w-3xl mx-auto">
                    <video
                        controls
                        className="w-full rounded-lg shadow-lg"
                        poster=""
                    >
                        <source src="/intro-video.mp4" type="video/mp4" />
                        متصفحك لا يدعم تشغيل الفيديو.
                    </video>
                </div>
            </div>

            {/* Features/Services - Clickable Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    to="/programs"
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center gap-4 hover:shadow-md hover:border-pink-200 hover:bg-pink-50/30 transition-all cursor-pointer group"
                >
                    <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                        <Users size={28} />
                    </div>
                    <h3 className="font-bold text-gray-800">برامج متنوعة</h3>
                    <p className="text-sm text-gray-500">برامج مخصصة للنساء واليافعات والأطفال</p>
                </Link>
                <Link
                    to="/levels"
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center gap-4 hover:shadow-md hover:border-green-200 hover:bg-green-50/30 transition-all cursor-pointer group"
                >
                    <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                        <BookOpen size={28} />
                    </div>
                    <h3 className="font-bold text-gray-800">محتوى تعليمي</h3>
                    <p className="text-sm text-gray-500">دروس ومحاضرات في مختلف المجالات</p>
                </Link>
                <Link
                    to="/calendar"
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center gap-4 hover:shadow-md hover:border-purple-200 hover:bg-purple-50/30 transition-all cursor-pointer group"
                >
                    <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                        <Calendar size={28} />
                    </div>
                    <h3 className="font-bold text-gray-800">جدول منظم</h3>
                    <p className="text-sm text-gray-500">حصص ومواعيد منظمة طوال الأسبوع</p>
                </Link>
            </div>

            {/* Branches & Contact - Dynamic from Database */}
            {branches.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">فروعنا ومعلومات التواصل</h2>

                    <div className={`grid grid-cols-1 ${branches.length === 1 ? '' : 'md:grid-cols-2'} gap-6`}>
                        {branches.map((branch, idx) => {
                            const colors = BRANCH_COLORS[idx % BRANCH_COLORS.length];
                            return (
                                <div key={branch.id} className={`bg-gradient-to-br ${colors.bg} rounded-xl p-5 border ${colors.border}`}>
                                    <h3 className={`font-bold ${colors.title} text-lg mb-4 flex items-center gap-2`}>
                                        <MapPin className={colors.icon} size={20} />
                                        {branch.name}
                                    </h3>

                                    <div className={`space-y-3 text-sm ${colors.text}`}>
                                        {/* Address */}
                                        {branch.address && (
                                            <div className="flex items-start gap-2">
                                                <MapPin size={16} className="mt-0.5 shrink-0" />
                                                <span>{branch.address}</span>
                                            </div>
                                        )}

                                        {/* Phone */}
                                        {branch.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone size={16} className="shrink-0" />
                                                <span className="dir-ltr">{branch.phone}</span>
                                            </div>
                                        )}

                                        {/* Email */}
                                        {branch.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail size={16} className="shrink-0" />
                                                <span className="dir-ltr">{branch.email}</span>
                                            </div>
                                        )}

                                        {/* Schedule */}
                                        {branch.schedule && (
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} className="shrink-0" />
                                                <span>{branch.schedule}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Location Link */}
                                    {branch.locationLink && (
                                        <a
                                            href={branch.locationLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`inline-flex items-center gap-1 text-xs ${colors.link} underline mt-4`}
                                        >
                                            <MapPin size={14} />
                                            عرض على الخريطة
                                        </a>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
