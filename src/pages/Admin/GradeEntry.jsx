import { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Save, Award, ChevronLeft, ArrowUpCircle } from 'lucide-react';
import { BackButton } from '../../components/Navbar';

export default function GradeEntry() {
    const { data, refreshData } = useData();
    const { currentUser } = useAuth();

    // Filters
    const [selectedBranch, setSelectedBranch] = useState(currentUser?.branchId || '');
    const [selectedCategory, setSelectedCategory] = useState('children');
    const [selectedLevelId, setSelectedLevelId] = useState('');

    const [students, setStudents] = useState([]);
    const [gradesValues, setGradesValues] = useState({}); // { studentId: { s1: '', s2: '' } }
    const [loading, setLoading] = useState(false);

    // Filter Logic
    useEffect(() => {
        if (data.students && selectedLevelId) {
            // Filter students by branch, category, AND level
            const branchFilter = selectedBranch ? (s) => s.branchId === selectedBranch : () => true;
            const levelFilter = (s) => s.levelId === selectedLevelId;

            const filtered = data.students.filter(s => branchFilter(s) && levelFilter(s));
            setStudents(filtered);

            // Pre-fill grades
            const initialGrades = {};
            filtered.forEach(s => {
                // Find existing grades for this student, level, and current year?
                // For simplicity, just finding ANY grade record for this level
                // Ideally we filter by schoolYear too. Assume 2025-2026 for now or latest.
                const studentGrades = data.grades?.filter(g => g.studentId === s.id && g.levelId === selectedLevelId);
                const s1 = studentGrades?.find(g => g.semester === 1)?.score || '';
                const s2 = studentGrades?.find(g => g.semester === 2)?.score || '';
                initialGrades[s.id] = { s1, s2 };
            });
            setGradesValues(initialGrades);
        } else {
            setStudents([]);
        }
    }, [data.students, data.grades, selectedLevelId, selectedBranch]);

    const handleGradeChange = (studentId, semester, value) => {
        setGradesValues(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [semester]: value
            }
        }));
    };

    const saveGrades = async (studentId) => {
        setLoading(true);
        try {
            const scores = gradesValues[studentId];
            const currentYear = '2025-2026'; // Should be dynamic or selected

            // Save S1
            if (scores.s1 !== '') {
                // Check if exists to update, or add new
                // Simplified: Add new for now, or dbService should handle upsert if we had ID
                // Ideally we store grade IDs in state too. 
                // For this prototype, let's just add (duplicate risk if no ID check).
                // Query First?
                // Let's rely on dbService.getStudentHistory approach or just add.
                // BETTER: check local data.grades to see if exists
                const existingS1 = data.grades?.find(g => g.studentId === studentId && g.levelId === selectedLevelId && g.semester === 1);

                if (existingS1) {
                    await dbService.update('grades', existingS1.id, { score: parseFloat(scores.s1) });
                } else {
                    await dbService.add('grades', {
                        studentId,
                        levelId: selectedLevelId,
                        semester: 1,
                        score: parseFloat(scores.s1),
                        schoolYear: currentYear,
                        branchId: selectedBranch
                    });
                }
            }

            // Save S2
            if (scores.s2 !== '') {
                const existingS2 = data.grades?.find(g => g.studentId === studentId && g.levelId === selectedLevelId && g.semester === 2);
                if (existingS2) {
                    await dbService.update('grades', existingS2.id, { score: parseFloat(scores.s2) });
                } else {
                    await dbService.add('grades', {
                        studentId,
                        levelId: selectedLevelId,
                        semester: 2,
                        score: parseFloat(scores.s2),
                        schoolYear: currentYear,
                        branchId: selectedBranch
                    });
                }
            }

            await refreshData();
            alert('تم حفظ النقاط');
        } catch (e) {
            console.error(e);
            alert('خطأ في الحفظ');
        } finally {
            setLoading(false);
        }
    };

    const promoteStudent = async (student) => {
        if (!confirm(`هل أنت متأكد من ترقية الطالبة ${student.name} إلى المستوى التالي؟`)) return;

        // Find current level order
        const currentLevel = data.levels.find(l => l.id === selectedLevelId);
        if (!currentLevel) return;

        // Find next level: same category, order + 1
        const nextLevel = data.levels.find(l =>
            l.category === currentLevel.category &&
            l.order === currentLevel.order + 1
        );

        if (!nextLevel) {
            alert('هذا هو المستوى الأخير، لا يوجد مستوى تالٍ.');
            return;
        }

        try {
            await dbService.update('students', student.id, { levelId: nextLevel.id });
            await refreshData();
            alert(`تم ترقية الطالبة إلى ${nextLevel.title}`);
        } catch (e) {
            alert('فشل الترقية');
        }
    };

    // Derived lists
    const filteredLevels = data.levels?.filter(l => l.category === selectedCategory).sort((a, b) => a.order - b.order) || [];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">إدخال النقاط والنتائج</h1>
                <BackButton />
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Branch Select (Super Admin Only) */}
                {currentUser?.role === 'super-admin' && (
                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">الفرع</label>
                        <select
                            className="w-full border rounded-lg p-2"
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                        >
                            <option value="">كل الفروع</option>
                            {data.branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-sm text-gray-500">البرنامج</label>
                    <select
                        className="w-full border rounded-lg p-2"
                        value={selectedCategory}
                        onChange={(e) => { setSelectedCategory(e.target.value); setSelectedLevelId(''); }}
                    >
                        <option value="children">الأطفال</option>
                        <option value="women">النساء</option>
                        <option value="young-girls">الفتيات</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-sm text-gray-500">المستوى</label>
                    <select
                        className="w-full border rounded-lg p-2"
                        value={selectedLevelId}
                        onChange={(e) => setSelectedLevelId(e.target.value)}
                    >
                        <option value="">-- اختر المستوى --</option>
                        {filteredLevels.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                    </select>
                </div>
            </div>

            {/* Students List */}
            {selectedLevelId && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-600 text-sm">
                        قائمة الطلاب - {data.levels.find(l => l.id === selectedLevelId)?.title}
                    </div>
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b">
                            <tr>
                                <th className="p-4">الاسم</th>
                                <th className="p-4 w-32">نقطة الدورة 1</th>
                                <th className="p-4 w-32">نقطة الدورة 2</th>
                                <th className="p-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.map(s => {
                                const scores = gradesValues[s.id] || { s1: '', s2: '' };
                                const canPromote = scores.s1 && scores.s2; // logic: has both grades

                                return (
                                    <tr key={s.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-800">{s.name}</td>
                                        <td className="p-4">
                                            <input
                                                type="number"
                                                className="w-full border rounded px-2 py-1 text-center dir-ltr"
                                                placeholder="0.0"
                                                value={scores.s1}
                                                onChange={(e) => handleGradeChange(s.id, 's1', e.target.value)}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <input
                                                type="number"
                                                className="w-full border rounded px-2 py-1 text-center dir-ltr"
                                                placeholder="0.0"
                                                value={scores.s2}
                                                onChange={(e) => handleGradeChange(s.id, 's2', e.target.value)}
                                            />
                                        </td>
                                        <td className="p-4 flex gap-2 items-center">
                                            <button
                                                onClick={() => saveGrades(s.id)}
                                                className="text-green-600 hover:bg-green-50 p-2 rounded-lg title='حفظ النقاط'"
                                            >
                                                <Save size={18} />
                                            </button>

                                            {canPromote && (
                                                <button
                                                    onClick={() => promoteStudent(s)}
                                                    className="bg-primary-orange text-white px-3 py-1 rounded text-xs flex items-center gap-1 hover:bg-orange-600"
                                                >
                                                    <ArrowUpCircle size={14} />
                                                    ترقية
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {students.length === 0 && (
                        <div className="p-8 text-center text-gray-400">لا يوجد طلاب في هذا المستوى</div>
                    )}
                </div>
            )}
        </div>
    );
}
