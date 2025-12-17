import { useState } from 'react';
import { dbService } from '../services/db';
import { Database } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function SeedDatabase() {
    const [loading, setLoading] = useState(false);
    const { refreshData } = useData();

    const handleSeed = async () => {
        if (!confirm('هل أنت متأكد من إضافة بيانات تجريبية؟')) return;

        setLoading(true);
        try {
            // 1. Level
            const level = await dbService.add('levels', {
                title: 'المستوى الأول',
                description: 'مستوى تأسيسي للأطفال',
                order: 1
            });

            // 2. Room
            const room = await dbService.add('rooms', {
                name: 'القاعة الرئيسية',
                capacity: 20,
                type: 'classroom'
            });

            // 3. Teacher
            const teacher = await dbService.add('teachers', {
                name: 'فاطمة الزهراء',
                phone: '0600000000',
                email: 'fatima@example.com'
            });

            // 4. Content
            await dbService.add('contents', {
                title: 'درس الحروف العربية',
                type: 'video',
                url: 'https://example.com/video',
                levelId: level.id
            });

            // 5. Event
            await dbService.add('events', {
                title: 'درس قراءة',
                start: new Date().toISOString(),
                end: new Date(Date.now() + 3600000).toISOString(),
                teacherId: teacher.id,
                roomId: room.id,
                type: 'class'
            });

            alert('تم إضافة البيانات بنجاح!');
            await refreshData();
        } catch (error) {
            console.error(error);
            alert('حدث خطأ أثناء إضافة البيانات');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between mb-8">
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">تهيئة قاعدة البيانات</h3>
                <p className="text-gray-500 text-sm">إضافة بيانات أولية للنظام لبدء العمل</p>
            </div>

            <button
                onClick={handleSeed}
                disabled={loading}
                className="flex items-center gap-2 bg-primary-orange text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
                <Database size={18} />
                <span>{loading ? 'جاري الإضافة...' : 'إضافة بيانات تجريبية'}</span>
            </button>
        </div>
    );
}
