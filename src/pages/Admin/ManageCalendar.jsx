import { useState, useEffect } from 'react';
import { Calendar as BigCalendar, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { localizer, calendarMessages, generateEventSeries, formatDualMonthHeader, getHijriParts } from '../../utils/calendarUtils';
import { useData } from '../../context/DataContext';
import { dbService } from '../../services/db';
import { Save, Trash2, Edit, AlertCircle } from 'lucide-react';
import { BackButton } from '../../components/Navbar';
import CustomToolbar from '../../components/CalendarToolbar';

const DnDCalendar = withDragAndDrop(BigCalendar);

// Custom Date Header Component (Month View)
const CustomDateHeader = ({ date, label }) => {
    const { day } = getHijriParts(date);
    return (
        <div className="flex justify-between px-1 text-xs font-bold w-full">
            <span className="text-[#8DC63F]">{label}</span>
            <span className="text-[#F39200]">{day}</span>
        </div>
    );
};

// Custom Week Header Component - [Hijri day] [Day name] [Gregorian day]
const CustomWeekHeader = ({ date, label }) => {
    const { day: hijriDay } = getHijriParts(date);
    const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayName = dayNames[date.getDay()];
    const gregorianDay = date.getDate();

    return (
        <div className="flex items-center justify-center gap-2 text-sm font-bold py-1">
            <span className="text-[#F39200]">{hijriDay}</span>
            <span className="text-gray-700">{dayName}</span>
            <span className="text-[#8DC63F]">{gregorianDay}</span>
        </div>
    );
};

export default function ManageCalendar() {
    const { data, refreshData } = useData();
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        type: 'class',
        eventDate: '',
        startTime: '',
        endTime: '',
        teacherId: '',
        roomId: '',
        branchId: '',
        levelId: '',  // New: for level-specific events
        contentId: '', // New: link to specific content
        recurrence: 'none',
        recurrenceEnd: '',
        isAllDay: false, // New: for all-day events like vacations
    });

    // Series Update Mode
    const [updateMode, setUpdateMode] = useState('single'); // single, future, all

    // Level Filter for calendar
    const [selectedLevelFilter, setSelectedLevelFilter] = useState('');

    // Level colors for events
    const levelColors = [
        '#8DC63F', '#F39200', '#8B5CF6', '#EC4899', '#06B6D4',
        '#EF4444', '#10B981', '#F59E0B', '#6366F1', '#84CC16'
    ];

    useEffect(() => {
        if (data.events) {
            // Build level color map
            const levelColorMap = {};
            (data.levels || []).forEach((level, idx) => {
                levelColorMap[level.id] = levelColors[idx % levelColors.length];
            });

            // Special event type colors
            const getEventColor = (ev) => {
                if (ev.type === 'vacation') return '#DC2626'; // Red for vacations
                if (ev.type === 'exam') return '#D97706'; // Amber/Orange for exams
                return ev.levelId ? levelColorMap[ev.levelId] : '#6B7280';
            };

            setEvents(
                data.events.map(ev => ({
                    ...ev,
                    start: new Date(ev.start),
                    end: new Date(ev.end),
                    isRecurring: !!ev.seriesId,
                    levelColor: getEventColor(ev)
                }))
            );
        }
    }, [data.events, data.levels]);

    const handleSelectSlot = ({ start, end }) => {
        setSelectedEvent(null);
        const startDate = new Date(start);
        const endDate = new Date(end);

        // Adjust default duration for slot click to 1 hour if start=end (day view click)
        if (startDate.getTime() === endDate.getTime()) {
            endDate.setHours(endDate.getHours() + 1);
        }

        // Format date as YYYY-MM-DD
        const toDateStr = (d) => d.toISOString().slice(0, 10);
        // Format time as HH:MM
        const toTimeStr = (d) => {
            const h = String(d.getHours()).padStart(2, '0');
            const m = String(d.getMinutes()).padStart(2, '0');
            return `${h}:${m}`;
        };

        setFormData({
            title: '',
            type: 'class',
            eventDate: toDateStr(startDate),
            startTime: toTimeStr(startDate),
            endTime: toTimeStr(endDate),
            teacherId: '',
            roomId: '',
            branchId: '',
            levelId: '',
            contentId: '',
            recurrence: 'none',
            recurrenceEnd: ''
        });
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        const startD = new Date(event.start);
        const endD = new Date(event.end);

        const toDateStr = (d) => d.toISOString().slice(0, 10);
        const toTimeStr = (d) => {
            const h = String(d.getHours()).padStart(2, '0');
            const m = String(d.getMinutes()).padStart(2, '0');
            return `${h}:${m}`;
        };

        setFormData({
            title: event.title,
            type: event.type || 'class',
            eventDate: toDateStr(startD),
            startTime: toTimeStr(startD),
            endTime: toTimeStr(endD),
            teacherId: event.teacherId || '',
            roomId: event.roomId || '',
            branchId: event.branchId || '',
            levelId: event.levelId || '',
            contentId: event.contentId || '',
            recurrence: event.recurrence || 'none',
            recurrenceEnd: event.recurrenceEnd || ''
        });
        // Reset update mode when selecting a new event
        setUpdateMode('single');
    };

    const handleEventDrop = async ({ event, start, end }) => {
        try {
            // Drag and drop is simple update for single event "This Event Only" logic typically
            // If it's a series, asking user is complex in DnD. 
            // For MVP, we'll treat DnD as "Edit This Event Only" implicitly or block if recurring
            // Let's implement simple direct update for now.
            const updatedEvent = {
                ...event,
                start: start.toISOString(),
                end: end.toISOString()
            };
            await dbService.update('events', event.id, updatedEvent);
            await refreshData();
        } catch (error) {
            console.error("Drop failed:", error);
            alert("فشل تحديث الموعد");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Combine date and times into ISO strings
        const startDateTime = new Date(`${formData.eventDate}T${formData.startTime}:00`);
        const endDateTime = new Date(`${formData.eventDate}T${formData.endTime}:00`);

        const eventPayload = {
            title: formData.title,
            type: formData.type,
            start: startDateTime.toISOString(),
            end: endDateTime.toISOString(),
            teacherId: formData.teacherId,
            roomId: formData.roomId,
            branchId: formData.branchId,
            levelId: formData.levelId,
            contentId: formData.contentId  // Link to content
        };

        try {
            if (selectedEvent) {
                // UPDATE LOGIC
                const isRecurring = selectedEvent.seriesId;

                if (isRecurring && updateMode === 'single') {
                    // SINGLE EVENT UPDATE - Update just this event, keep it in the series
                    const singleEventPayload = {
                        ...eventPayload,
                        seriesId: selectedEvent.seriesId, // Keep in series
                        recurrence: selectedEvent.recurrence || 'none'
                    };
                    await dbService.update('events', selectedEvent.id, singleEventPayload);

                } else if (isRecurring && updateMode === 'future') {
                    // FUTURE EVENTS UPDATE - Delete this and future, recreate series from this date
                    const seriesId = selectedEvent.seriesId;

                    // Delete this event and all future events in the series
                    await dbService.deleteSeries('events', seriesId, selectedEvent.start);

                    // Create new series from this date if recurrence is set
                    if (formData.recurrence !== 'none' && formData.recurrenceEnd) {
                        const newSeriesId = crypto.randomUUID();
                        const events = generateEventSeries(
                            eventPayload,
                            formData.recurrence,
                            new Date(formData.recurrenceEnd),
                            newSeriesId
                        );
                        await dbService.addBatch('events', events);
                    } else {
                        // Just add this as single event
                        await dbService.add('events', eventPayload);
                    }

                } else if (isRecurring && updateMode === 'all') {
                    // ALL EVENTS UPDATE - Delete entire series, recreate with new params
                    const seriesId = selectedEvent.seriesId;

                    // Delete entire series
                    await dbService.deleteSeries('events', seriesId, null);

                    // Create new series with updated params
                    if (formData.recurrence !== 'none' && formData.recurrenceEnd) {
                        const newSeriesId = crypto.randomUUID();
                        const events = generateEventSeries(
                            eventPayload,
                            formData.recurrence,
                            new Date(formData.recurrenceEnd),
                            newSeriesId
                        );
                        await dbService.addBatch('events', events);
                    } else {
                        // Convert to single event
                        await dbService.add('events', eventPayload);
                    }

                } else {
                    // NON-RECURRING EVENT UPDATE
                    if (formData.recurrence !== 'none' && formData.recurrenceEnd) {
                        // Convert single event to series
                        await dbService.hardDelete('events', selectedEvent.id);

                        const seriesId = crypto.randomUUID();
                        const events = generateEventSeries(
                            eventPayload,
                            formData.recurrence,
                            new Date(formData.recurrenceEnd),
                            seriesId
                        );
                        await dbService.addBatch('events', events);
                    } else {
                        // Regular single update
                        await dbService.update('events', selectedEvent.id, eventPayload);
                    }
                }
            } else {
                // CREATE LOGIC
                if (formData.recurrence !== 'none' && formData.recurrenceEnd) {
                    const seriesId = crypto.randomUUID();
                    const events = generateEventSeries(
                        eventPayload,
                        formData.recurrence,
                        new Date(formData.recurrenceEnd),
                        seriesId
                    );
                    await dbService.addBatch('events', events);
                } else {
                    await dbService.add('events', eventPayload);
                }
            }
            await refreshData();
            setSelectedEvent(null);
            setFormData(prev => ({ ...prev, title: '', recurrence: 'none' })); // Reset
        } catch (error) {
            console.error(error);
            alert("حدث خطأ أثناء الحفظ: " + error.message);
        }
    };

    const handleDelete = async () => {
        if (!selectedEvent) return;
        if (!confirm("هل أنت متأكد من الحذف؟")) return;

        try {
            await dbService.hardDelete('events', selectedEvent.id);
            await refreshData();
            setSelectedEvent(null);
        } catch (error) {
            alert("فشل الحذف");
        }
    };

    // Group events for the table
    const groupedEvents = events.reduce((acc, event) => {
        if (event.seriesId) {
            const existingGroup = acc.find(g => g.isGroup && g.seriesId === event.seriesId);
            if (existingGroup) {
                existingGroup.events.push(event);
                // Update range if needed
                if (new Date(event.start) < new Date(existingGroup.start)) existingGroup.start = event.start;
                if (new Date(event.end) > new Date(existingGroup.end)) existingGroup.end = event.end;
            } else {
                acc.push({
                    isGroup: true,
                    seriesId: event.seriesId,
                    title: event.title,
                    events: [event],
                    start: event.start,
                    end: event.end, // Will update as we find more
                    type: event.type,
                    branchId: event.branchId // Added branchId to group
                });
            }
        } else {
            acc.push({ ...event, isGroup: false });
        }
        return acc;
    }, []);

    // Sort grouped events: recent first
    groupedEvents.sort((a, b) => new Date(b.start) - new Date(a.start));

    const [expandedGroups, setExpandedGroups] = useState({});

    const toggleGroup = (seriesId) => {
        setExpandedGroups(prev => ({ ...prev, [seriesId]: !prev[seriesId] }));
    };

    const handleDeleteSeries = async (seriesId) => {
        if (!confirm("هل أنت متأكد من حذف السلسلة بالكامل؟")) return;
        try {
            await dbService.deleteSeries('events', seriesId);
            await refreshData();
        } catch (e) {
            alert("فشل الحذف: " + e.message);
        }
    };

    const handleDeleteInstance = async (event, mode = 'single') => {
        // mode: 'single' | 'future'
        const msg = mode === 'single' ? "هل أنت متأكد من حذف هذا الحدث فقط؟" : "هل أنت متأكد من حذف هذا الحدث وجميع الأحداث التالية؟";
        if (!confirm(msg)) return;

        try {
            if (mode === 'single') {
                await dbService.hardDelete('events', event.id);
            } else {
                await dbService.deleteSeries('events', event.seriesId, event.start);
            }
            await refreshData();
        } catch (e) {
            alert("فشل الحذف: " + e.message);
        }
    };

    // Get women's levels only, sorted by order
    const womenLevels = (data.levels || [])
        .filter(l => l.category === 'women')
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    // Handle level button click
    const handleLevelClick = (levelId) => {
        if (selectedLevelFilter === levelId) {
            setSelectedLevelFilter(''); // Toggle off
        } else {
            setSelectedLevelFilter(levelId);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">إدارة الجدول الزمني</h1>
                <BackButton />
            </div>

            {/* Clickable Level Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 ml-2">المستويات:</span>

                    {/* All levels button */}
                    <button
                        onClick={() => setSelectedLevelFilter('')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${!selectedLevelFilter
                            ? 'bg-gray-800 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        الكل
                    </button>

                    {/* Women's levels */}
                    {womenLevels.map((level, idx) => {
                        const color = levelColors[idx % levelColors.length];
                        const isSelected = selectedLevelFilter === level.id;

                        return (
                            <button
                                key={level.id}
                                onClick={() => handleLevelClick(level.id)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${isSelected
                                    ? 'text-white shadow-md scale-105'
                                    : 'text-gray-700 hover:scale-105'
                                    }`}
                                style={{
                                    backgroundColor: isSelected ? color : `${color}20`,
                                    borderWidth: '2px',
                                    borderColor: color
                                }}
                            >
                                <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: color }}
                                />
                                {level.title}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Editor Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold flex items-center gap-2 text-gray-700">
                        <Edit size={20} />
                        <span>{selectedEvent ? 'تعديل الحدث' : 'إضافة حدث جديد'}</span>
                    </h2>
                    {selectedEvent && (
                        <button onClick={handleDelete} className="text-red-500 bg-red-50 p-2 rounded-lg hover:bg-red-100">
                            <Trash2 size={20} />
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">عنوان الحدث</label>
                        <input
                            className="w-full border rounded-lg p-2"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">الفرع</label>
                        <select
                            className="w-full border rounded-lg p-2"
                            value={formData.branchId || ''}
                            onChange={e => setFormData({ ...formData, branchId: e.target.value, roomId: '' })}
                        >
                            <option value="">عام / مشترك</option>
                            {data.branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">المستوى</label>
                        <select
                            className="w-full border rounded-lg p-2"
                            value={formData.levelId || ''}
                            onChange={e => setFormData({ ...formData, levelId: e.target.value })}
                        >
                            <option value="">عام (لكل الطلاب)</option>
                            {[...(data.levels || [])]
                                .sort((a, b) => {
                                    const categoryOrder = { women: 1, girls: 2, children: 3 };
                                    const catA = categoryOrder[a.category] || 99;
                                    const catB = categoryOrder[b.category] || 99;
                                    if (catA !== catB) return catA - catB;
                                    return (a.order || 0) - (b.order || 0);
                                })
                                .map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                        </select>
                    </div>

                    {/* Content Link - only shows if level is selected */}
                    {formData.levelId && (
                        <div className="space-y-1">
                            <label className="text-sm text-gray-500">ربط بمحتوى (اختياري)</label>
                            <select
                                className="w-full border rounded-lg p-2"
                                value={formData.contentId || ''}
                                onChange={e => setFormData({ ...formData, contentId: e.target.value })}
                            >
                                <option value="">بدون ربط</option>
                                {(data.content || [])
                                    .filter(c => c.levelId === formData.levelId)
                                    .map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.title}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">المؤطرة</label>
                        <select
                            className="w-full border rounded-lg p-2"
                            value={formData.teacherId}
                            onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                        >
                            <option value="">اختيار مؤطرة...</option>
                            {data.teachers?.map(t => {
                                const displayName = t.nickname || `${t.firstName || ''} ${t.lastName || ''}`.trim() || t.name || '-';
                                return <option key={t.id} value={t.id}>{displayName}</option>;
                            })}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">القاعة</label>
                        <select
                            className="w-full border rounded-lg p-2"
                            value={formData.roomId}
                            onChange={e => setFormData({ ...formData, roomId: e.target.value })}
                        >
                            <option value="">اختيار قاعة...</option>
                            {(data.rooms || [])
                                .filter(r => !formData.branchId || r.branchId === formData.branchId)
                                .map(r => {
                                    const branch = data.branches?.find(b => b.id === r.branchId);
                                    return (
                                        <option key={r.id} value={r.id}>
                                            {r.name}{branch ? ` (فرع ${branch.name})` : ''}
                                        </option>
                                    );
                                })}
                        </select>
                    </div>

                    {/* ... (Activity Type, Time Inputs etc remain the same) ... */}

                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">نوع النشاط</label>
                        <select
                            className="w-full border rounded-lg p-2"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="class">حصة دراسية</option>
                            <option value="activity">نشاط</option>
                            <option value="meeting">اجتماع</option>
                            <option value="exam">امتحان</option>
                            <option value="vacation">عطلة</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">التاريخ</label>
                        <input
                            type="date"
                            className="w-full border rounded-lg p-2 dir-ltr text-right"
                            value={formData.eventDate}
                            onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                            required
                        />
                    </div>

                    {/* All-Day Checkbox */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isAllDay"
                            checked={formData.isAllDay}
                            onChange={e => setFormData({ ...formData, isAllDay: e.target.checked, startTime: '', endTime: '' })}
                            className="w-4 h-4 text-primary-green border-gray-300 rounded focus:ring-primary-green"
                        />
                        <label htmlFor="isAllDay" className="text-sm text-gray-600">حدث لليوم كامل (عطلة، مناسبة...)</label>
                    </div>

                    {/* Time inputs - only show if not all-day */}
                    {!formData.isAllDay && (
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-sm text-gray-500">من</label>
                                <input
                                    type="time"
                                    className="w-full border rounded-lg p-2 dir-ltr text-right"
                                    value={formData.startTime}
                                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-gray-500">إلى</label>
                                <input
                                    type="time"
                                    className="w-full border rounded-lg p-2 dir-ltr text-right"
                                    value={formData.endTime}
                                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Recurrence Options */}
                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">تكرار</label>
                        <select
                            className="w-full border rounded-lg p-2"
                            value={formData.recurrence}
                            onChange={e => setFormData({ ...formData, recurrence: e.target.value })}
                        >
                            <option value="none">لا يتكرر</option>
                            <option value="daily">يومي</option>
                            <option value="weekly">أسبوعي</option>
                            <option value="biweekly">نصف شهري (أسبوع نعم وأسبوع لا)</option>
                            <option value="yearly">سنوي</option>
                        </select>
                    </div>

                    {formData.recurrence !== 'none' && (
                        <div className="space-y-1">
                            <label className="text-sm text-gray-500">تاريخ انتهاء التكرار</label>
                            <input
                                type="date"
                                className="w-full border rounded-lg p-2"
                                value={formData.recurrenceEnd}
                                onChange={e => setFormData({ ...formData, recurrenceEnd: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    {/* Edit Mode Options (Only if Recurring Event Selected) */}
                    {selectedEvent && selectedEvent.isRecurring && (
                        <div className="col-span-full bg-orange-50 p-4 rounded-lg flex flex-col gap-2">
                            <span className="font-bold text-orange-800 text-sm flex items-center gap-2">
                                <AlertCircle size={16} />
                                تطبيق التعديلات على:
                            </span>
                            <div className="flex gap-4 text-sm text-gray-700">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="mode" checked={updateMode === 'single'} onChange={() => setUpdateMode('single')} />
                                    هذا الحدث فقط
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="mode" checked={updateMode === 'future'} onChange={() => setUpdateMode('future')} />
                                    هذا الحدث والأحداث التالية
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="mode" checked={updateMode === 'all'} onChange={() => setUpdateMode('all')} />
                                    جميع الأحداث في السلسلة
                                </label>
                            </div>
                        </div>
                    )}

                    <div className="col-span-full flex justify-end gap-2 mt-4">
                        <button
                            type="button"
                            onClick={() => { setSelectedEvent(null); setFormData(prev => ({ ...prev, title: '' })); }}
                            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 font-bold flex items-center gap-2"
                        >
                            <Save size={18} />
                            حفظ
                        </button>
                    </div>
                </form>
            </div>

            {/* Calendar */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[800px] flex flex-col gap-4">
                <DnDCalendar
                    localizer={localizer}
                    events={selectedLevelFilter ? events.filter(e => e.levelId === selectedLevelFilter) : events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    messages={calendarMessages}
                    rtl={true}
                    culture='ar'
                    views={['month', 'week', 'agenda']}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    onEventDrop={handleEventDrop}
                    selectable
                    resizable
                    eventPropGetter={(event) => ({
                        style: {
                            backgroundColor: event.levelColor || '#6B7280',
                            borderColor: event.levelColor || '#6B7280',
                            color: '#fff'
                        }
                    })}
                    components={{
                        toolbar: CustomToolbar,
                        month: {
                            dateHeader: CustomDateHeader
                        },
                        week: {
                            header: CustomWeekHeader
                        }
                    }}
                    formats={{
                        monthHeaderFormat: (date, culture, loc) => formatDualMonthHeader(date, loc),
                        weekdayFormat: (date, culture, loc) => {
                            // For Month View Header: "الاثنين"
                            const d = date.getDay();
                            const names = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
                            return names[d];
                        },
                        agendaDateFormat: (date, culture, loc) => {
                            const d = date.getDay();
                            const names = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
                            return `${names[d]} ${date.getDate()} ${loc.format(date, 'MMM', culture)}`;
                        }
                    }}
                />
            </div>

            {/* List of Scheduled Events (Grouped) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-600">
                    قائمة الأحداث والمواعيد
                </div>
                {groupedEvents.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">لا توجد أحداث</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {[
                            // { id: '', name: 'عام / مشترك' }, // Removed as per request
                            ...(data.branches || [])
                        ].map(branch => {
                            const branchItems = groupedEvents.filter(i => (i.branchId || '') === (branch.id || ''));
                            if (branchItems.length === 0) return null;

                            return (
                                <div key={branch.id || 'general'} className="border-b border-gray-200 last:border-0">
                                    <div className="bg-gray-100 p-3 px-4 text-sm font-bold text-gray-700">
                                        {branch.name}
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {branchItems.map((item) => {
                                            if (item.isGroup) {
                                                const isExpanded = expandedGroups[item.seriesId];
                                                return (
                                                    <div key={'group-' + item.seriesId} className="bg-gray-50/50">
                                                        {/* Series Header Row */}
                                                        <div
                                                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                                                            onClick={() => toggleGroup(item.seriesId)}
                                                        >
                                                            <div className="flex items-center gap-3 flex-1">
                                                                <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : 'rotate-180'}`}>
                                                                    ▼
                                                                </span>
                                                                <div className="flex-1">
                                                                    <div className="font-bold text-gray-800 flex items-center gap-2 flex-wrap">
                                                                        {item.title}
                                                                        <span className="text-xs font-normal bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">سلسلة ({item.events.length} حدث)</span>
                                                                        {item.type && (
                                                                            <span className={`text-xs font-normal px-2 py-0.5 rounded-full ${item.type === 'vacation' ? 'bg-red-100 text-red-700' :
                                                                                item.type === 'exam' ? 'bg-orange-100 text-orange-700' :
                                                                                    item.type === 'class' ? 'bg-green-100 text-green-700' :
                                                                                        item.type === 'meeting' ? 'bg-purple-100 text-purple-700' :
                                                                                            'bg-gray-100 text-gray-700'
                                                                                }`}>
                                                                                {item.type === 'class' ? 'حصة' : item.type === 'vacation' ? 'عطلة' : item.type === 'exam' ? 'امتحان' : item.type === 'meeting' ? 'اجتماع' : item.type}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-3">
                                                                        <span>يبدأ: {new Date(item.events[item.events.length - 1].start).toLocaleDateString()} - ينتهي: {new Date(item.events[0].start).toLocaleDateString()}</span>
                                                                        {item.events[0]?.levelId && (
                                                                            <span className="text-primary-green">• {data.levels?.find(l => l.id === item.events[0].levelId)?.title || 'المستوى'}</span>
                                                                        )}
                                                                        {item.events[0]?.teacherId && (
                                                                            <span className="text-orange-600">• {(() => {
                                                                                const t = data.teachers?.find(t => t.id === item.events[0].teacherId);
                                                                                return t ? (t.nickname || `${t.firstName || ''} ${t.lastName || ''}`.trim() || t.name) : '';
                                                                            })()}</span>
                                                                        )}
                                                                        {item.events[0]?.roomId && (
                                                                            <span className="text-blue-600">• {data.rooms?.find(r => r.id === item.events[0].roomId)?.name || 'القاعة'}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteSeries(item.seriesId); }}
                                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg text-sm flex items-center gap-1"
                                                                >
                                                                    <Trash2 size={16} />
                                                                    <span className="hidden sm:inline">حذف السلسلة</span>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Expanded Children */}
                                                        {isExpanded && (
                                                            <div className="bg-white border-y border-gray-100 divide-y divide-gray-50 pr-8">
                                                                {item.events
                                                                    .sort((a, b) => new Date(a.start) - new Date(b.start))
                                                                    .map(ev => (
                                                                        <div key={ev.id} className="p-3 flex items-center justify-between hover:bg-gray-50 pl-4">
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="text-sm font-medium text-gray-700">
                                                                                    {new Date(ev.start).toLocaleDateString()}
                                                                                </div>
                                                                                <div className="text-sm text-gray-400">
                                                                                    {new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex gap-2">
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); handleSelectEvent(ev); }}
                                                                                    className="text-blue-500 hover:text-blue-700 text-xs px-2 py-1 bg-blue-50 rounded"
                                                                                >
                                                                                    تعديل
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteInstance(ev, 'single'); }}
                                                                                    className="text-red-500 hover:text-red-700 text-xs px-2 py-1 bg-red-50 rounded"
                                                                                >
                                                                                    حذف
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteInstance(ev, 'future'); }}
                                                                                    className="text-orange-500 hover:text-orange-700 text-xs px-2 py-1 bg-orange-50 rounded"
                                                                                >
                                                                                    حذف هذا والتالي
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            } else {
                                                // Single Event
                                                const level = data.levels?.find(l => l.id === item.levelId);
                                                const teacher = data.teachers?.find(t => t.id === item.teacherId);
                                                const room = data.rooms?.find(r => r.id === item.roomId);
                                                const teacherName = teacher ? (teacher.nickname || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || teacher.name) : null;

                                                return (
                                                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                        <div className="flex-1">
                                                            <div className="font-medium text-gray-800 flex items-center gap-2 flex-wrap">
                                                                {item.title}
                                                                {item.type && (
                                                                    <span className={`text-xs font-normal px-2 py-0.5 rounded-full ${item.type === 'vacation' ? 'bg-red-100 text-red-700' :
                                                                        item.type === 'exam' ? 'bg-orange-100 text-orange-700' :
                                                                            item.type === 'class' ? 'bg-green-100 text-green-700' :
                                                                                item.type === 'meeting' ? 'bg-purple-100 text-purple-700' :
                                                                                    'bg-gray-100 text-gray-700'
                                                                        }`}>
                                                                        {item.type === 'class' ? 'حصة' : item.type === 'vacation' ? 'عطلة' : item.type === 'exam' ? 'امتحان' : item.type === 'meeting' ? 'اجتماع' : item.type === 'activity' ? 'نشاط' : item.type}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-3">
                                                                <span className="text-gray-400">
                                                                    {new Date(item.start).toLocaleDateString()} - {new Date(item.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                                {level && (
                                                                    <span className="text-primary-green">• {level.title}</span>
                                                                )}
                                                                {teacherName && (
                                                                    <span className="text-orange-600">• {teacherName}</span>
                                                                )}
                                                                {room && (
                                                                    <span className="text-blue-600">• {room.name}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleSelectEvent(item)}
                                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteInstance(item, 'single')}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
