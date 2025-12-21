import { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Save, Check, X, AlertCircle, Calendar, Users, Filter, Clock, CalendarDays } from 'lucide-react';
import { BackButton } from '../../components/Navbar';

export default function ManageAttendance() {
    const { data, refreshData } = useData();
    const { currentUser } = useAuth();

    // Filters
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const [selectedEvent, setSelectedEvent] = useState('');

    // Attendance state: { studentId: 'present' | 'absent' | 'excused' }
    const [attendanceMap, setAttendanceMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [existingRecordId, setExistingRecordId] = useState(null);

    // Set default branch based on user role
    useEffect(() => {
        if (currentUser && currentUser.role !== 'super-admin' && currentUser.branchId) {
            setSelectedBranch(currentUser.branchId);
        }
    }, [currentUser]);

    // Filter events by date and branch
    const eventsForDate = (data.events || []).filter(ev => {
        const evDate = new Date(ev.start).toISOString().slice(0, 10);
        const matchesDate = evDate === selectedDate;
        const matchesBranch = !selectedBranch || ev.branchId === selectedBranch || !ev.branchId;
        return matchesDate && matchesBranch;
    }).sort((a, b) => new Date(a.start) - new Date(b.start));

    // Get selected event details
    const eventDetails = selectedEvent ? data.events?.find(e => e.id === selectedEvent) : null;

    // Get level from selected event
    const eventLevel = eventDetails?.levelId ? data.levels?.find(l => l.id === eventDetails.levelId) : null;

    // Get students from event's level OR by category if general
    const getEventStudents = () => {
        if (!eventDetails) return [];

        const allStudents = (data.students || []).filter(s => !s.hasLeft);

        // If event has specific levelId
        if (eventDetails.levelId) {
            const level = data.levels?.find(l => l.id === eventDetails.levelId);

            // Check if it's a "general" level for all of a category or all students
            if (level) {
                const titleLower = level.title?.toLowerCase() || '';
                if (titleLower.includes('عام') || titleLower.includes('كل') || titleLower.includes('عمومي')) {
                    // Check category
                    if (level.category === 'women') {
                        return allStudents.filter(s => s.category === 'women');
                    } else if (level.category === 'children') {
                        return allStudents.filter(s => s.category === 'children');
                    } else if (level.category === 'girls' || level.category === 'young-girls') {
                        return allStudents.filter(s => s.category === 'young-girls' || s.category === 'girls');
                    } else {
                        // No specific category or general category - show ALL students
                        return allStudents;
                    }
                }
            }

            // Normal case: students enrolled in this level
            return allStudents.filter(s => s.levelId === eventDetails.levelId);
        }

        // No level specified - show all students (general event)
        return allStudents;
    };

    const eventStudents = getEventStudents();

    // Load existing attendance for selected event
    useEffect(() => {
        if (selectedEvent) {
            const existing = (data.attendance || []).find(a => a.eventId === selectedEvent);
            if (existing) {
                setExistingRecordId(existing.id);
                const map = {};
                (existing.students || []).forEach(s => {
                    map[s.studentId] = s.status;
                });
                setAttendanceMap(map);
            } else {
                setExistingRecordId(null);
                // Default all to present
                const map = {};
                eventStudents.forEach(s => {
                    map[s.id] = 'present';
                });
                setAttendanceMap(map);
            }
        } else {
            setAttendanceMap({});
            setExistingRecordId(null);
        }
    }, [selectedEvent, data.attendance]);

    // Reset attendance map when students change
    useEffect(() => {
        if (selectedEvent && !existingRecordId) {
            const map = {};
            eventStudents.forEach(s => {
                map[s.id] = 'present';
            });
            setAttendanceMap(map);
        }
    }, [eventStudents.length]);

    const handleStatusChange = (studentId, status) => {
        setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSave = async () => {
        if (!selectedEvent || !eventDetails) {
            alert('يرجى اختيار حدث');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                date: selectedDate,
                eventId: selectedEvent,
                levelId: eventDetails.levelId || '',
                branchId: eventDetails.branchId || selectedBranch || '',
                eventTitle: eventDetails.title,
                students: Object.entries(attendanceMap).map(([studentId, status]) => ({
                    studentId,
                    status
                })),
                updatedAt: new Date().toISOString()
            };

            if (existingRecordId) {
                await dbService.update('attendance', existingRecordId, payload);
            } else {
                payload.createdAt = new Date().toISOString();
                await dbService.add('attendance', payload);
            }

            await refreshData();
            alert('تم حفظ الحضور بنجاح');
        } catch (error) {
            console.error(error);
            alert('فشل حفظ الحضور');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'present':
                return <Check className="text-green-500" size={20} />;
            case 'absent':
                return <X className="text-red-500" size={20} />;
            case 'excused':
                return <AlertCircle className="text-yellow-500" size={20} />;
            default:
                return null;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'present': return 'حاضر';
            case 'absent': return 'غائب';
            case 'excused': return 'معذور';
            default: return '';
        }
    };

    // Format time using Western numerals
    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        const h = String(d.getHours()).padStart(2, '0');
        const m = String(d.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    };

    const formatEventTime = (startStr, endStr) => {
        return `${formatTime(startStr)} - ${formatTime(endStr)}`;
    };

    const getEventTypeLabel = (type) => {
        switch (type) {
            case 'class': return 'حصة دراسية';
            case 'activity': return 'نشاط';
            case 'meeting': return 'اجتماع';
            case 'exam': return 'امتحان';
            case 'vacation': return 'عطلة';
            default: return 'عام';
        }
    };

    // Stats
    const presentCount = Object.values(attendanceMap).filter(s => s === 'present').length;
    const absentCount = Object.values(attendanceMap).filter(s => s === 'absent').length;
    const excusedCount = Object.values(attendanceMap).filter(s => s === 'excused').length;

    // Check if admin can change branch
    const canChangeBranch = currentUser?.role === 'super-admin';

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">إدارة الحضور والغياب</h1>
                <BackButton />
            </div>

            {/* Date & Event Selection */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                    <CalendarDays size={20} className="text-gray-500" />
                    <h2 className="font-bold text-gray-700">اختر الحدث</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">الفرع</label>
                        <select
                            className="w-full border rounded-lg p-2"
                            value={selectedBranch}
                            onChange={e => { setSelectedBranch(e.target.value); setSelectedEvent(''); }}
                            disabled={!canChangeBranch}
                        >
                            {canChangeBranch && <option value="">كل الفروع</option>}
                            {data.branches?.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">التاريخ</label>
                        <input
                            type="date"
                            className="w-full border rounded-lg p-2 dir-ltr text-right"
                            value={selectedDate}
                            onChange={e => { setSelectedDate(e.target.value); setSelectedEvent(''); }}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">الحدث</label>
                        <select
                            className="w-full border rounded-lg p-2"
                            value={selectedEvent}
                            onChange={e => setSelectedEvent(e.target.value)}
                        >
                            <option value="">-- اختر حدثا --</option>
                            {eventsForDate.map((ev, idx) => {
                                const level = data.levels?.find(l => l.id === ev.levelId);
                                return (
                                    <option key={ev.id} value={ev.id}>
                                        {idx + 1}. {ev.title} | {level?.title || 'عام'} | {formatEventTime(ev.start, ev.end)}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                {/* No events message */}
                {eventsForDate.length === 0 && (
                    <div className="text-center py-4 text-gray-400 bg-gray-50 rounded-lg">
                        لا توجد أحداث في هذا التاريخ
                    </div>
                )}

                {/* Selected Event Info */}
                {eventDetails && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Clock className="text-purple-500" size={18} />
                                <span className="font-medium text-purple-800">{eventDetails.title}</span>
                            </div>
                            <span className="text-purple-600 text-sm bg-purple-100 px-2 py-1 rounded">
                                {getEventTypeLabel(eventDetails.type)}
                            </span>
                            <span className="text-indigo-600 text-sm">
                                {formatEventTime(eventDetails.start, eventDetails.end)}
                            </span>
                            {eventLevel && (
                                <span className="text-green-600 text-sm bg-green-100 px-2 py-1 rounded">
                                    المستوى: {eventLevel.title}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Summary */}
            {selectedEvent && eventStudents.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                        <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                        <div className="text-sm text-green-700">حاضر</div>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                        <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                        <div className="text-sm text-red-700">غائب</div>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-100">
                        <div className="text-2xl font-bold text-yellow-600">{excusedCount}</div>
                        <div className="text-sm text-yellow-700">معذور</div>
                    </div>
                </div>
            )}

            {/* Students List */}
            {selectedEvent ? (
                eventStudents.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                            <div className="flex items-center gap-2">
                                <Users size={20} className="text-gray-500" />
                                <span className="font-bold text-gray-700">
                                    طلاب {eventLevel?.title || 'المستوى'} ({eventStudents.length})
                                </span>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 font-bold flex items-center gap-2"
                            >
                                <Save size={18} />
                                <span>{loading ? 'جاري الحفظ...' : 'حفظ الحضور'}</span>
                            </button>
                        </div>
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b">
                                <tr>
                                    <th className="p-4 w-12">#</th>
                                    <th className="p-4">اسم الطالب</th>
                                    <th className="p-4 text-center">الحالة</th>
                                    <th className="p-4 text-center">الإجراء</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {eventStudents.map((student, idx) => {
                                    const status = attendanceMap[student.id] || 'present';
                                    return (
                                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 text-gray-400 text-sm">{idx + 1}</td>
                                            <td className="p-4 font-medium text-gray-800">{student.name}</td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status === 'present' ? 'bg-green-100 text-green-700' :
                                                    status === 'absent' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {getStatusIcon(status)}
                                                    {getStatusLabel(status)}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleStatusChange(student.id, 'present')}
                                                        className={`p-2 rounded-lg transition-colors ${status === 'present' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-green-100'}`}
                                                        title="حاضر"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(student.id, 'absent')}
                                                        className={`p-2 rounded-lg transition-colors ${status === 'absent' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-red-100'}`}
                                                        title="غائب"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(student.id, 'excused')}
                                                        className={`p-2 rounded-lg transition-colors ${status === 'excused' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-yellow-100'}`}
                                                        title="معذور"
                                                    >
                                                        <AlertCircle size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <Users size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-400">لا يوجد طلاب مسجلين في مستوى هذا الحدث</p>
                        {!eventDetails?.levelId && (
                            <p className="text-gray-400 text-sm mt-2">هذا الحدث غير مرتبط بمستوى معين</p>
                        )}
                    </div>
                )
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-400">اختر حدثا لعرض قائمة الطلاب</p>
                </div>
            )}
        </div>
    );
}
