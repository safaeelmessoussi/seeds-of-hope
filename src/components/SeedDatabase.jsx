import { useState } from 'react';
import { dbService } from '../services/db';
import { Database } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export default function SeedDatabase() {
    const [loading, setLoading] = useState(false);
    const { refreshData } = useData();
    const { currentUser } = useAuth();

    const handleSeed = async () => {
        if (!confirm('هل أنت متأكد من إضافة بيانات تجريبية؟')) return;

        setLoading(true);
        try {
            // 0. Branches
            const branchA = await dbService.add('branches', { name: 'تاركة', code: 'TARKA' });
            const branchB = await dbService.add('branches', { name: 'أمرشيش', code: 'AMRCHICH' });

            // 0.1 Promote Current User to Super Admin
            if (currentUser && currentUser.email) {
                // Check if exists
                const existingUsers = await dbService.getAll('users');
                const myUser = existingUsers.find(u => u.email === currentUser.email);

                if (myUser) {
                    await dbService.update('users', myUser.id, { role: 'super-admin', branchId: null, uid: currentUser.uid });
                } else {
                    await dbService.add('users', {
                        email: currentUser.email,
                        role: 'super-admin',
                        branchId: null,
                        uid: currentUser.uid
                    });
                }
            }

            // 0.2 Mock Users (Optional fallback)
            await dbService.add('users', {
                email: 'superadmin@seeds.com',
                role: 'super-admin',
                branchId: null
            });
            await dbService.add('users', {
                email: 'admin_tarka@seeds.com',
                role: 'admin',
                branchId: branchA.id
            });

            // 1. Levels (Global Curriculum)
            const childrenLevels = [
                'كتاكيت الامل', 'براعم الامل', 'اشبال الامل', 'أجيال الامل',
                'المستوى 5', 'المستوى 6', 'المستوى 7'
            ];
            const womenLevels = [
                'وميض الأمل', 'نور الأمل', 'ضياء الأمل',
                'المستوى 4', 'المستوى 5', 'المستوى 6'
            ];

            const createdLevels = [];

            // Add Children Levels
            for (let i = 0; i < childrenLevels.length; i++) {
                const l = await dbService.add('levels', {
                    title: childrenLevels[i],
                    category: 'children',
                    order: i + 1,
                    description: `المستوى ${i + 1} - برنامج الأطفال`
                });
                createdLevels.push(l);
            }

            // Add Women Levels
            for (let i = 0; i < womenLevels.length; i++) {
                const l = await dbService.add('levels', {
                    title: womenLevels[i],
                    category: 'women',
                    order: i + 1,
                    description: `المستوى ${i + 1} - برنامج النساء`
                });
                createdLevels.push(l);
            }

            // Use the first level for the later seeds (Content/Student) to avoid errors
            const level = createdLevels[0];

            // 2. Room
            const room = await dbService.add('rooms', {
                name: 'القاعة الرئيسية',
                capacity: 20,
                type: 'classroom',
                branchId: branchA.id
            });

            // 3. Teacher (Mu'attira)
            const teacher = await dbService.add('teachers', {
                name: 'فاطمة الزهراء',
                phone: '0600000000',
                email: 'fatima@example.com',
                branchId: branchA.id
            });

            // 4. Content (with School Year)
            await dbService.add('contents', {
                title: 'درس الحروف العربية',
                type: 'video',
                url: 'https://example.com/video',
                levelId: level.id,
                schoolYear: '2025-2026',
                branchId: branchA.id
            });

            // 5. Event
            await dbService.add('events', {
                title: 'درس قراءة',
                start: new Date().toISOString(),
                end: new Date(Date.now() + 3600000).toISOString(),
                teacherId: teacher.id,
                roomId: room.id,
                type: 'class',
                branchId: branchA.id
            });

            // 6. Student
            const student = await dbService.add('students', {
                name: 'سلمى العمراني',
                category: 'children',
                levelId: level.id,
                branchId: branchA.id,
                enrollmentDate: new Date().toISOString()
            });

            // 7. Grades
            await dbService.add('grades', {
                studentId: student.id,
                levelId: level.id,
                semester: 1,
                score: 18.5,
                schoolYear: '2025-2026',
                branchId: branchA.id
            });
            await dbService.add('grades', {
                studentId: student.id,
                levelId: level.id,
                semester: 2,
                score: 19.0, // Future grade
                schoolYear: '2025-2026',
                branchId: branchA.id
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
