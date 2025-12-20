import { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Save, ArrowUpCircle, SaveAll } from 'lucide-react';
import { BackButton } from '../../components/Navbar';

export default function GradeEntry() {
    const { data, refreshData } = useData();
    const { currentUser } = useAuth();

    const [gradesValues, setGradesValues] = useState({}); // { studentId: { s1: '', s2: '' } }
    const [loading, setLoading] = useState(false);
    const [savingAll, setSavingAll] = useState(false);

    // Get all students sorted by category order (women, girls, children), then by level order
    const getSortedStudents = () => {
        if (!data.students || !data.levels) return [];

        const categoryOrder = { women: 1, girls: 2, children: 3 };

        // Create a map of levelId to level info for quick lookup
        const levelMap = {};
        data.levels.forEach(l => {
            levelMap[l.id] = l;
        });

        // Filter by branch if not super-admin
        let students = [...data.students];
        if (currentUser?.role !== 'super-admin' && currentUser?.branchId) {
            students = students.filter(s => s.branchId === currentUser.branchId);
        }

        // Sort students by category, then by level order, then by name
        return students.sort((a, b) => {
            const levelA = levelMap[a.levelId];
            const levelB = levelMap[b.levelId];

            const catOrderA = categoryOrder[levelA?.category] || 99;
            const catOrderB = categoryOrder[levelB?.category] || 99;

            if (catOrderA !== catOrderB) return catOrderA - catOrderB;

            const levelOrderA = levelA?.order || 99;
            const levelOrderB = levelB?.order || 99;

            if (levelOrderA !== levelOrderB) return levelOrderA - levelOrderB;

            return (a.name || '').localeCompare(b.name || '', 'ar');
        });
    };

    const sortedStudents = getSortedStudents();

    // Initialize grades on mount
    useEffect(() => {
        if (data.students && data.grades) {
            const initialGrades = {};
            data.students.forEach(s => {
                const studentGrades = data.grades?.filter(g => g.studentId === s.id);
                const s1 = studentGrades?.find(g => g.semester === 1)?.score ?? '';
                const s2 = studentGrades?.find(g => g.semester === 2)?.score ?? '';
                initialGrades[s.id] = { s1, s2, levelId: s.levelId };
            });
            setGradesValues(initialGrades);
        }
    }, [data.students, data.grades]);

    const handleGradeChange = (studentId, semester, value) => {
        setGradesValues(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [semester]: value
            }
        }));
    };

    const saveGradesForStudent = async (studentId) => {
        setLoading(true);
        try {
            const scores = gradesValues[studentId];
            const student = data.students?.find(s => s.id === studentId);
            if (!student) return;

            const currentYear = '2025-2026';

            // Save S1
            if (scores.s1 !== '' && scores.s1 !== null) {
                const existingS1 = data.grades?.find(g => g.studentId === studentId && g.levelId === student.levelId && g.semester === 1);
                if (existingS1) {
                    await dbService.update('grades', existingS1.id, { score: parseFloat(scores.s1) });
                } else {
                    await dbService.add('grades', {
                        studentId,
                        levelId: student.levelId,
                        semester: 1,
                        score: parseFloat(scores.s1),
                        schoolYear: currentYear,
                        branchId: student.branchId
                    });
                }
            }

            // Save S2
            if (scores.s2 !== '' && scores.s2 !== null) {
                const existingS2 = data.grades?.find(g => g.studentId === studentId && g.levelId === student.levelId && g.semester === 2);
                if (existingS2) {
                    await dbService.update('grades', existingS2.id, { score: parseFloat(scores.s2) });
                } else {
                    await dbService.add('grades', {
                        studentId,
                        levelId: student.levelId,
                        semester: 2,
                        score: parseFloat(scores.s2),
                        schoolYear: currentYear,
                        branchId: student.branchId
                    });
                }
            }

            await refreshData();
        } catch (e) {
            console.error(e);
            alert('خطأ في الحفظ');
        } finally {
            setLoading(false);
        }
    };

    const saveAllGrades = async () => {
        setSavingAll(true);
        try {
            const currentYear = '2025-2026';
            const updates = [];

            for (const student of sortedStudents) {
                const scores = gradesValues[student.id];
                if (!scores) continue;

                // Save S1
                if (scores.s1 !== '' && scores.s1 !== null) {
                    const existingS1 = data.grades?.find(g => g.studentId === student.id && g.levelId === student.levelId && g.semester === 1);
                    if (existingS1) {
                        updates.push(dbService.update('grades', existingS1.id, { score: parseFloat(scores.s1) }));
                    } else {
                        updates.push(dbService.add('grades', {
                            studentId: student.id,
                            levelId: student.levelId,
                            semester: 1,
                            score: parseFloat(scores.s1),
                            schoolYear: currentYear,
                            branchId: student.branchId
                        }));
                    }
                }

                // Save S2
                if (scores.s2 !== '' && scores.s2 !== null) {
                    const existingS2 = data.grades?.find(g => g.studentId === student.id && g.levelId === student.levelId && g.semester === 2);
                    if (existingS2) {
                        updates.push(dbService.update('grades', existingS2.id, { score: parseFloat(scores.s2) }));
                    } else {
                        updates.push(dbService.add('grades', {
                            studentId: student.id,
                            levelId: student.levelId,
                            semester: 2,
                            score: parseFloat(scores.s2),
                            schoolYear: currentYear,
                            branchId: student.branchId
                        }));
                    }
                }
            }

            await Promise.all(updates);
            await refreshData();
            alert('تم حفظ جميع النقاط بنجاح');
        } catch (e) {
            console.error(e);
            alert('خطأ في الحفظ');
        } finally {
            setSavingAll(false);
        }
    };

    const promoteStudent = async (student) => {
        if (!confirm(`هل أنت متأكد من ترقية الطالبة ${student.name} إلى المستوى التالي؟`)) return;

        const currentLevel = data.levels.find(l => l.id === student.levelId);
        if (!currentLevel) return;

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

    // Group students by level for display with headers
    const groupStudentsByLevel = () => {
        const groups = [];
        let currentLevelId = null;

        sortedStudents.forEach(student => {
            if (student.levelId !== currentLevelId) {
                currentLevelId = student.levelId;
                const level = data.levels?.find(l => l.id === currentLevelId);
                groups.push({
                    type: 'header',
                    levelId: currentLevelId,
                    levelTitle: level?.title || 'غير محدد',
                    category: level?.category
                });
            }
            groups.push({ type: 'student', student });
        });

        return groups;
    };

    const groupedData = groupStudentsByLevel();

    const getCategoryLabel = (category) => {
        switch (category) {
            case 'women': return 'النساء';
            case 'girls': return 'الفتيات';
            case 'children': return 'الأطفال';
            default: return '';
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">إدخال النقاط والنتائج</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={saveAllGrades}
                        disabled={savingAll}
                        className="flex items-center gap-2 bg-primary-green text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
                    >
                        <SaveAll size={18} />
                        {savingAll ? 'جارٍ الحفظ...' : 'حفظ جميع التغييرات'}
                    </button>
                    <BackButton />
                </div>
            </div>

            {/* Students List - No Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-600 text-sm flex justify-between items-center">
                    <span>قائمة جميع الطلاب ({sortedStudents.length})</span>
                </div>
                <table className="w-full text-right">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b sticky top-0">
                        <tr>
                            <th className="p-4">الاسم</th>
                            <th className="p-4">المستوى</th>
                            <th className="p-4 w-28">نقطة الدورة 1</th>
                            <th className="p-4 w-28">نقطة الدورة 2</th>
                            <th className="p-4 w-32">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {groupedData.map((item, idx) => {
                            if (item.type === 'header') {
                                return (
                                    <tr key={`header-${item.levelId}`} className="bg-gradient-to-l from-gray-100 to-white">
                                        <td colSpan="5" className="p-3 font-bold text-gray-700">
                                            <span className="text-primary-orange">{getCategoryLabel(item.category)}</span>
                                            {' - '}
                                            <span className="text-primary-green">{item.levelTitle}</span>
                                        </td>
                                    </tr>
                                );
                            }

                            const s = item.student;
                            const scores = gradesValues[s.id] || { s1: '', s2: '' };
                            const level = data.levels?.find(l => l.id === s.levelId);
                            const canPromote = scores.s1 !== '' && scores.s2 !== '';

                            return (
                                <tr key={s.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-800">{s.name}</td>
                                    <td className="p-4 text-gray-500 text-sm">{level?.title || '-'}</td>
                                    <td className="p-4">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="20"
                                            className="w-full border rounded px-2 py-1 text-center dir-ltr"
                                            placeholder="0.0"
                                            value={scores.s1}
                                            onChange={(e) => handleGradeChange(s.id, 's1', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="20"
                                            className="w-full border rounded px-2 py-1 text-center dir-ltr"
                                            placeholder="0.0"
                                            value={scores.s2}
                                            onChange={(e) => handleGradeChange(s.id, 's2', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-4 flex gap-2 items-center">
                                        <button
                                            onClick={() => saveGradesForStudent(s.id)}
                                            disabled={loading}
                                            className="text-green-600 hover:bg-green-50 p-2 rounded-lg"
                                            title="حفظ النقاط"
                                        >
                                            <Save size={18} />
                                        </button>

                                        {canPromote && (
                                            <button
                                                onClick={() => promoteStudent(s)}
                                                className="bg-primary-orange text-white px-3 py-1 rounded text-xs flex items-center gap-1 hover:bg-orange-600"
                                                title="ترقية للمستوى التالي"
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
                {sortedStudents.length === 0 && (
                    <div className="p-8 text-center text-gray-400">لا يوجد طلاب</div>
                )}
            </div>
        </div>
    );
}
