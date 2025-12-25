import { Users, Heart, Baby, GraduationCap, Target, Star, ArrowRight, BookOpen, Book, Globe, Palette, Award, Building, Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Programs() {
    const programs = [
        {
            id: 'women',
            title: 'برنامج المرأة',
            subtitle: '400+ امرأة',
            description: 'برنامج متكامل لتنمية مهارات المرأة من محاربة الأمية إلى التنمية الذاتية، مع التركيز على القرآن الكريم والعلوم الشرعية.',
            icon: Heart,
            gradient: 'from-pink-500 via-rose-500 to-pink-600',
            lightBg: 'from-pink-50 to-rose-50',
            borderColor: 'border-pink-200',
            textColor: 'text-pink-700',
            features: [
                'محاربة الأمية: من الابتدائي إلى الإعدادي',
                'تعلم التجويد وحفظ القرآن الكريم',
                'دروس العقيدة وتفسير القرآن',
                'اللغة الإنجليزية',
                'التنمية الذاتية والكوتشينغ',
                'رحلة العمرة السنوية',
                'خلية القراءة'
            ]
        },
        {
            id: 'girls',
            title: 'برنامج اليافعات',
            subtitle: '143 يافعة',
            description: 'برنامج خاص بالفتيات لتنمية شخصيتهن وتعزيز قدراتهن الأكاديمية، مع بناء الثقة بالنفس والمهارات الحياتية.',
            icon: Star,
            gradient: 'from-violet-500 via-purple-500 to-violet-600',
            lightBg: 'from-violet-50 to-purple-50',
            borderColor: 'border-violet-200',
            textColor: 'text-violet-700',
            features: [
                'دعم دراسي في المواد الأساسية',
                'حفظ القرآن والتجويد',
                'دورات الآداب والسلوك',
                'التنمية الذاتية',
                'حصص الكوتشينغ',
                'أنشطة ترفيهية تعليمية',
                'بناء الثقة بالنفس'
            ]
        },
        {
            id: 'children',
            title: 'برنامج الأطفال',
            subtitle: '340+ طفل',
            description: 'برنامج تربوي من مرحلة الروض إلى السنوات الأولى من الابتدائي، لغرس القيم والأخلاق الإسلامية بطرق إبداعية.',
            icon: Baby,
            gradient: 'from-emerald-500 via-teal-500 to-emerald-600',
            lightBg: 'from-emerald-50 to-teal-50',
            borderColor: 'border-emerald-200',
            textColor: 'text-emerald-700',
            features: [
                'تحفيظ القرآن بطرق مبتكرة',
                'أساسيات الدين والأخلاق',
                'أناشيد وقصص هادفة',
                'أنشطة فنية وإبداعية',
                'ألعاب تعليمية تفاعلية',
                'بناء شخصية سوية'
            ]
        }
    ];

    const socialActivities = [
        { icon: Award, title: 'إفطار الطالب الجامعي', desc: '2000+ طالب في رمضان', gradient: 'from-amber-500 to-orange-500' },
        { icon: Building, title: 'دعم السكن والحواسب', desc: 'للطلبة المحتاجين', gradient: 'from-blue-500 to-cyan-500' },
        { icon: Globe, title: 'قوافل طبية', desc: 'بشراكة مع جمعيات', gradient: 'from-emerald-500 to-teal-500' },
        { icon: Palette, title: 'توزيع الملابس', desc: 'للمناطق النائية', gradient: 'from-rose-500 to-pink-500' }
    ];

    return (
        <div className="flex flex-col gap-10">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-violet-700 shadow-2xl">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>

                {/* Glowing orbs */}
                <div className="absolute top-10 right-10 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl" />
                <div className="absolute bottom-10 left-10 w-60 h-60 bg-amber-400/20 rounded-full blur-3xl" />

                <div className="relative z-10 p-8 md:p-12 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                        <Users size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
                        برامجنا المتنوعة
                    </h1>
                    <p className="text-white/90 max-w-2xl mx-auto leading-relaxed">
                        منذ <span className="font-bold text-amber-300">2011</span>، نقدم برامج تعليمية وتربوية متكاملة
                        للنساء والأطفال في مقرينا بحي <strong>أمرشيش</strong> وحي <strong>تاركة</strong> بمدينة مراكش
                    </p>
                </div>
            </div>

            {/* Programs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {programs.map(program => (
                    <div
                        key={program.id}
                        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all hover:-translate-y-1"
                    >
                        {/* Card Header with Gradient */}
                        <div className={`bg-gradient-to-r ${program.gradient} p-6 text-white relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-xl" />

                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <program.icon size={36} className="mb-3" />
                                    <h2 className="font-bold text-2xl">{program.title}</h2>
                                </div>
                                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
                                    {program.subtitle}
                                </span>
                            </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-6">
                            <p className="text-gray-600 text-sm leading-relaxed mb-5">{program.description}</p>

                            <div className="space-y-2">
                                {program.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-sm">
                                        <span className={`w-1.5 h-1.5 ${program.textColor.replace('text', 'bg')} rounded-full mt-1.5 shrink-0`} />
                                        <span className="text-gray-600">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Social Activities - Horizontal Scroll on Mobile */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white">
                        <Heart size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">أنشطتنا الاجتماعية</h2>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {socialActivities.map((activity, idx) => (
                        <div
                            key={idx}
                            className="group bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-all hover:-translate-y-0.5"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activity.gradient} flex items-center justify-center text-white mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                                <activity.icon size={22} />
                            </div>
                            <h4 className="font-bold text-gray-800 mb-1">{activity.title}</h4>
                            <p className="text-xs text-gray-500">{activity.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Spiritual Activities */}
            <div className="relative overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600" />
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>

                <div className="relative z-10 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Book size={20} className="text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white">الجانب الروحي</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: 'تعليم القرآن الكريم', desc: 'دروس في قواعد التجويد وقراءة القرآن وحفظه' },
                            { title: 'دروس العقيدة والتفسير', desc: 'محاضرات لتعميق الفهم الديني' },
                            { title: 'رحلة العمرة السنوية', desc: 'منذ 2017 للمؤطرات والمستفيدات' },
                            { title: 'الأسابيع الثقافية', desc: 'تتويج المتفوقات والمتفوقين' }
                        ].map((item, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors">
                                <h4 className="font-bold text-white mb-1">{item.title}</h4>
                                <p className="text-white/80 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 shadow-2xl">
                <div className="absolute inset-0 bg-black/5" />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

                <div className="relative z-10 p-8 md:p-12 text-center">
                    <Sparkles className="text-white/80 mx-auto mb-4" size={36} />
                    <h3 className="font-bold text-white text-2xl md:text-3xl mb-3">
                        انضمي إلينا اليوم!
                    </h3>
                    <p className="text-white/90 mb-8 max-w-xl mx-auto">
                        للتسجيل أو الاستفسار عن برامجنا، تواصلي مع الفرع الأقرب إليك
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 bg-white text-amber-600 px-8 py-4 rounded-xl font-bold hover:bg-amber-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
                    >
                        <GraduationCap size={22} />
                        معلومات التواصل
                        <ArrowLeft size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
