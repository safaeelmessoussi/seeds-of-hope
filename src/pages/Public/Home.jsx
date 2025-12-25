import { useData } from '../../context/DataContext';
import { Users, BookOpen, Calendar, MapPin, Phone, Mail, Clock, Heart, Baby, Star, Award, Handshake, Sparkles, ArrowLeft, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

// Branch colors for alternating display
const BRANCH_COLORS = [
    { bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-200', title: 'text-emerald-800', icon: 'text-emerald-600', text: 'text-emerald-700', link: 'text-emerald-600 hover:text-emerald-800' },
    { bg: 'from-amber-50 to-orange-50', border: 'border-amber-200', title: 'text-amber-800', icon: 'text-amber-600', text: 'text-amber-700', link: 'text-amber-600 hover:text-amber-800' },
];

export default function Home() {
    const { data } = useData();
    const branches = data.branches || [];

    // Statistics from association data
    const stats = [
        { label: 'امرأة مستفيدة', count: '400+', icon: Heart, color: 'from-pink-500 to-rose-500' },
        { label: 'فتاة يافعة', count: '143', icon: Star, color: 'from-purple-500 to-violet-500' },
        { label: 'طفل وطفلة', count: '340+', icon: Baby, color: 'from-emerald-500 to-teal-500' },
        { label: 'سنة من العطاء', count: '13+', icon: Award, color: 'from-amber-500 to-orange-500' }
    ];

    return (
        <div className="flex flex-col gap-10">
            {/* Hero Section with Landing Image */}
            <div className="relative overflow-hidden rounded-3xl shadow-2xl min-h-[500px] md:min-h-[600px]">
                {/* Background Image */}
                <img
                    src="/landing_Image.png"
                    alt="جمعية بذور الأمل"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-end h-full min-h-[500px] md:min-h-[600px] p-8 md:p-16 text-center">

                    {/* Title */}
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                        جمعية بذور الأمل
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 mb-2 font-medium">
                        للمرأة والطفل
                    </p>
                    <p className="text-white/80 max-w-2xl mx-auto leading-relaxed mb-8 text-sm md:text-base">
                        منذ <span className="font-bold text-amber-300">2011</span> نكرس جهودنا لتحسين حياة المجتمع
                        من خلال مشاريع تعليمية واجتماعية تستهدف النساء والأطفال
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            to="/programs"
                            className="inline-flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-xl font-bold hover:bg-amber-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            <Sparkles size={20} />
                            اكتشف برامجنا
                        </Link>
                        <Link
                            to="/levels"
                            className="inline-flex items-center gap-2 bg-white/20 text-white border-2 border-white/50 px-6 py-3 rounded-xl font-bold hover:bg-white/30 transition-all backdrop-blur-sm"
                        >
                            <BookOpen size={20} />
                            المحتوى التعليمي
                        </Link>
                    </div>
                </div>
            </div>

            {/* Statistics - Floating Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-6 relative z-20 px-4">
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        className="bg-white rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100 group"
                    >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                            <stat.icon size={24} />
                        </div>
                        <div className="text-3xl font-bold text-gray-800">{stat.count}</div>
                        <div className="text-sm text-gray-500">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Introduction Video */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white">
                        <Play size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">تعرف على جمعيتنا</h2>
                </div>
                <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
                    <video
                        controls
                        className="w-full"
                        poster="/favicon.png"
                    >
                        <source src="/intro-video.mp4" type="video/mp4" />
                        متصفحك لا يدعم تشغيل الفيديو.
                    </video>
                </div>
            </div>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    to="/programs"
                    className="group relative bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-6 text-white overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1"
                >
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                    <Users size={32} className="mb-4" />
                    <h3 className="font-bold text-xl mb-2">برامج متنوعة</h3>
                    <p className="text-sm text-white/80">للنساء واليافعات والأطفال</p>
                    <ArrowLeft size={20} className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                <Link
                    to="/levels"
                    className="group relative bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1"
                >
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                    <BookOpen size={32} className="mb-4" />
                    <h3 className="font-bold text-xl mb-2">محتوى تعليمي</h3>
                    <p className="text-sm text-white/80">دروس ومحاضرات متنوعة</p>
                    <ArrowLeft size={20} className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                <Link
                    to="/calendar"
                    className="group relative bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl p-6 text-white overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1"
                >
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                    <Calendar size={32} className="mb-4" />
                    <h3 className="font-bold text-xl mb-2">الجدول الزمني</h3>
                    <p className="text-sm text-white/80">حصص ومواعيد منظمة</p>
                    <ArrowLeft size={20} className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
            </div>

            {/* About - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 md:p-8 border border-emerald-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white">
                            <BookOpen size={20} />
                        </div>
                        <h3 className="font-bold text-lg text-emerald-800">الأنشطة الثقافية</h3>
                    </div>
                    <ul className="space-y-3">
                        {[
                            'محاربة الأمية من الابتدائي والإعدادي',
                            'تعلم قواعد التجويد وحفظ القرآن الكريم',
                            'دروس في العقيدة وتفسير القرآن الكريم',
                            'حصص في اللغة الإنجليزية',
                            'دورات في التنمية الذاتية والكوتشينغ',
                            'خلية القراءة لمناقشة الكتب'
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-emerald-700">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 md:p-8 border border-amber-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white">
                            <Heart size={20} />
                        </div>
                        <h3 className="font-bold text-lg text-amber-800">الأنشطة الاجتماعية</h3>
                    </div>
                    <ul className="space-y-3">
                        {[
                            'إفطار الطالب الجامعي (2000+ طالب)',
                            'توزيع قفة رمضان للمحتاجين',
                            'توزيع الملابس للمناطق النائية',
                            'تنظيم قوافل طبية',
                            'رحلة سنوية لأداء العمرة',
                            'دعم ضحايا زلزال 2023'
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-amber-700">
                                <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Partners */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
                <div className="flex items-center justify-center gap-3 mb-6">
                    <Handshake className="text-emerald-600" size={24} />
                    <h2 className="text-xl font-bold text-gray-800">شركاؤنا</h2>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                    {[
                        'المجلس البلدي لمدينة مراكش',
                        'الأكاديمية الجهوية للتربية والتكوين',
                        'جامعة القاضي عياض',
                        'أساتذة باحثين ومتخصصين'
                    ].map((partner, i) => (
                        <span
                            key={i}
                            className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 rounded-full text-sm text-gray-700 border border-gray-200 hover:border-emerald-300 transition-colors"
                        >
                            {partner}
                        </span>
                    ))}
                </div>
            </div>

            {/* Branches & Contact */}
            {branches.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <MapPin className="text-emerald-600" size={24} />
                        <h2 className="text-xl font-bold text-gray-800">فروعنا ومعلومات التواصل</h2>
                    </div>

                    <div className={`grid grid-cols-1 ${branches.length === 1 ? '' : 'md:grid-cols-2'} gap-6`}>
                        {branches.map((branch, idx) => {
                            const colors = BRANCH_COLORS[idx % BRANCH_COLORS.length];
                            return (
                                <div key={branch.id} className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-6 border ${colors.border} hover:shadow-lg transition-shadow`}>
                                    <h3 className={`font-bold ${colors.title} text-lg mb-4 flex items-center gap-2`}>
                                        <MapPin className={colors.icon} size={20} />
                                        {branch.name}
                                    </h3>

                                    <div className={`space-y-3 text-sm ${colors.text}`}>
                                        {branch.address && (
                                            <div className="flex items-start gap-2">
                                                <MapPin size={16} className="mt-0.5 shrink-0" />
                                                <span>{branch.address}</span>
                                            </div>
                                        )}
                                        {branch.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone size={16} />
                                                <a href={`tel:${branch.phone}`} className={colors.link} dir="ltr">{branch.phone}</a>
                                            </div>
                                        )}
                                        {branch.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail size={16} />
                                                <a href={`mailto:${branch.email}`} className={colors.link}>{branch.email}</a>
                                            </div>
                                        )}
                                        {branch.schedule && (
                                            <div className="flex items-start gap-2">
                                                <Clock size={16} className="mt-0.5 shrink-0" />
                                                <span>{branch.schedule}</span>
                                            </div>
                                        )}
                                        {branch.locationLink && (
                                            <a
                                                href={branch.locationLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`inline-flex items-center gap-1 text-xs font-medium mt-2 ${colors.link}`}
                                            >
                                                <MapPin size={12} />
                                                عرض الموقع على الخريطة
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
