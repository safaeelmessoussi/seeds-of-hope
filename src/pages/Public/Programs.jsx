import { Users, Heart, Baby, GraduationCap, Target, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Programs() {
    const programs = [
        {
            id: 'women',
            title: 'برنامج المرأة',
            description: 'برنامج متكامل لتنمية مهارات المرأة وتأهيلها من خلال دورات تعليمية وتربوية متنوعة.',
            icon: Heart,
            color: 'pink',
            bgColor: 'bg-pink-50',
            borderColor: 'border-pink-200',
            iconColor: 'text-pink-500',
            features: [
                'دروس في التجويد وتحفيظ القرآن الكريم',
                'دورات في التنمية الذاتية',
                'ورشات في الصناعة التقليدية',
                'محاضرات توعوية'
            ]
        },
        {
            id: 'girls',
            title: 'برنامج اليافعات',
            description: 'برنامج خاص بالفتيات اليافعات لتنمية شخصيتهن وتعزيز قدراتهن الأكاديمية والاجتماعية.',
            icon: Star,
            color: 'purple',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            iconColor: 'text-purple-500',
            features: [
                'دعم دراسي في المواد الأساسية',
                'دورات في الآداب والسلوك',
                'أنشطة ترفيهية وتعليمية',
                'حلقات تحفيظ القرآن'
            ]
        },
        {
            id: 'children',
            title: 'برنامج الأطفال',
            description: 'برنامج تربوي للأطفال يهدف إلى غرس القيم والأخلاق الإسلامية من خلال أنشطة ممتعة.',
            icon: Baby,
            color: 'green',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            iconColor: 'text-green-500',
            features: [
                'تحفيظ القرآن الكريم بطرق مبتكرة',
                'أناشيد وقصص هادفة',
                'أنشطة فنية وإبداعية',
                'ألعاب تعليمية'
            ]
        }
    ];

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="w-16 h-16 bg-primary-green/10 rounded-full flex items-center justify-center text-primary-green mx-auto mb-4">
                    <Users size={32} />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                    برامجنا المتنوعة
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    نقدم برامج تعليمية وتربوية متكاملة تناسب جميع الفئات العمرية،
                    من الأطفال إلى الشباب والنساء، بهدف بناء جيل واعٍ ومتعلم.
                </p>
            </div>

            {/* Programs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {programs.map(program => (
                    <div
                        key={program.id}
                        className={`bg-white rounded-xl shadow-sm border ${program.borderColor} p-6 hover:shadow-md transition-shadow`}
                    >
                        <div className={`w-14 h-14 ${program.bgColor} rounded-full flex items-center justify-center ${program.iconColor} mb-4`}>
                            <program.icon size={28} />
                        </div>
                        <h2 className="font-bold text-xl text-gray-800 mb-2">{program.title}</h2>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">{program.description}</p>

                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                                <Target size={14} />
                                ما نقدمه:
                            </h4>
                            <ul className="space-y-1">
                                {program.features.map((feature, idx) => (
                                    <li key={idx} className="text-sm text-gray-500 flex items-start gap-2">
                                        <ArrowRight size={12} className="mt-1 text-gray-400 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-l from-primary-green/10 to-primary-orange/10 rounded-xl p-8 text-center">
                <h3 className="font-bold text-gray-800 text-xl mb-3">
                    انضمي إلينا اليوم!
                </h3>
                <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                    للتسجيل أو الاستفسار عن برامجنا، يرجى التواصل مع الفرع الأقرب إليك.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-primary-green text-white px-6 py-3 rounded-lg font-bold hover:bg-green-600 transition-colors"
                >
                    <GraduationCap size={20} />
                    معلومات التواصل
                </Link>
            </div>
        </div>
    );
}
