import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, Trash, Plus, Clock, Edit, Save, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { format, addDays, addYears, parseISO, isBefore, isEqual } from 'date-fns';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { ar } from 'date-fns/locale';
import {
    CustomToolbar,
    CustomDateHeader,
    CustomWeekHeader,
    CustomMonthHeader,
    CustomEvent
} from '../../components/CalendarHelpers';

const DnDCalendar = withDragAndDrop(BigCalendar);

const locales = {
    'ar': {
        ...ar,
        options: { ...ar.options, weekStartsOn: 1 }
    },
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

export default function ManageCalendar() {
    const [events, setEvents] = useState(() => {
        const saved = localStorage.getItem('events');
        return saved ? JSON.parse(saved) : [
            { id: 1, title: 'درس تجويد (نساء)', date: '2025-12-15', startTime: '10:00', endTime: '11:30', type: 'class' },
            { id: 2, title: 'عطلة رسمية', date: '2025-12-18', startTime: '', endTime: '', type: 'holiday' },
        ];
    });

    useEffect(() => {
        localStorage.setItem('events', JSON.stringify(events));
    }, [events]);

    const [teachers, setTeachers] = useState([]);
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        const savedTeachers = localStorage.getItem('teachers');
        if (savedTeachers) setTeachers(JSON.parse(savedTeachers));

        const savedRooms = localStorage.getItem('rooms');
        if (savedRooms) setRooms(JSON.parse(savedRooms));
    }, []);

    const [formData, setFormData] = useState({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        type: 'class',
        recurrence: 'none',
        recurrenceEndDate: '',
        teacherId: '',
        roomId: ''
    });

    const [selectedIds, setSelectedIds] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [expandedSeries, setExpandedSeries] = useState([]);

    const [view, setView] = useState('month');
    const [date, setDate] = useState(new Date());

    const handleNavigate = (newDate) => {
        setDate(newDate);
    };

    const handleView = (newView) => {
        setView(newView);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleSeriesExpansion = (seriesId) => {
        if (expandedSeries.includes(seriesId)) {
            setExpandedSeries(expandedSeries.filter(id => id !== seriesId));
        } else {
            setExpandedSeries([...expandedSeries, seriesId]);
        }
    };

    const [editMode, setEditMode] = useState('single');

    // Helper to generate events
    const generateRecurringEvents = (baseEvent, start, end, recurrenceType, sid = null) => {
        const generated = [];
        let currentDate = parseISO(start);
        const endDate = parseISO(end);
        const seriesId = sid || Date.now();

        while (isBefore(currentDate, endDate) || isEqual(currentDate, endDate)) {
            generated.push({
                id: Date.now() + Math.random(),
                title: baseEvent.title,
                type: baseEvent.type,
                date: format(currentDate, 'yyyy-MM-dd'),
                startTime: baseEvent.startTime,
                endTime: baseEvent.endTime,
                seriesId: seriesId,
                recurrence: recurrenceType,
                teacherId: baseEvent.teacherId, // Custom
                roomId: baseEvent.roomId // Custom
            });

            if (recurrenceType === 'daily') currentDate = addDays(currentDate, 1);
            else if (recurrenceType === 'weekly') currentDate = addDays(currentDate, 7);
            else if (recurrenceType === 'biweekly') currentDate = addDays(currentDate, 14);
            else if (recurrenceType === 'yearly') currentDate = addYears(currentDate, 1);
        }
        return generated;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingId) {
            const originalEvent = events.find(e => e.id === editingId);
            const isSeries = !!originalEvent?.seriesId;

            if (isSeries && editMode !== 'single') {
                const seriesId = originalEvent.seriesId;
                const relatedEvents = events.filter(e => e.seriesId === seriesId).sort((a, b) => new Date(a.date) - new Date(b.date));

                let newEventsList = [...events];
                const newSeriesId = Date.now();

                if (editMode === 'all') {
                    newEventsList = newEventsList.filter(e => e.seriesId !== seriesId);
                    const generated = generateRecurringEvents(formData, formData.date, formData.recurrenceEndDate || relatedEvents[relatedEvents.length - 1].date, formData.recurrence, newSeriesId);
                    newEventsList = [...newEventsList, ...generated];

                } else if (editMode === 'future') {
                    newEventsList = newEventsList.filter(e => {
                        if (e.seriesId !== seriesId) return true;
                        const isFuture = new Date(e.date) >= new Date(originalEvent.date);
                        return !isFuture;
                    });
                    const generated = generateRecurringEvents(formData, formData.date, formData.recurrenceEndDate, formData.recurrence, newSeriesId);
                    newEventsList = [...newEventsList, ...generated];
                }
                setEvents(newEventsList);
            } else {
                setEvents(events.map(ev => ev.id === editingId ? {
                    ...ev,
                    title: formData.title,
                    date: formData.date,
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                    type: formData.type,
                    recurrence: formData.recurrence,
                    teacherId: formData.teacherId,
                    roomId: formData.roomId
                } : ev));
            }
            setEditingId(null);
            setEditMode('single');
            alert('تم تعديل الحدث بنجاح');

        } else {
            let newEvents = [];
            if (formData.recurrence === 'none') {
                newEvents.push({
                    id: Date.now(),
                    ...formData,
                    seriesId: null
                });
            } else {
                newEvents = generateRecurringEvents(formData, formData.date, formData.recurrenceEndDate, formData.recurrence);
            }
            setEvents([...events, ...newEvents]);
            alert(`تم إضافة ${newEvents.length} حدث بنجاح`);
        }
        resetForm();
    };

    const handleDelete = (id) => {
        if (confirm('هل أنت متأكد من حذف هذا الحدث؟ سيتم نقله إلى سلة المحذوفات.')) {
            const itemToDelete = events.find(e => e.id === id);
            const trashItem = {
                id: Date.now(),
                source: 'events',
                originalData: itemToDelete,
                deletedBy: 'admin@seeds.com',
                deletedAt: new Date().toISOString()
            };
            const currentTrash = JSON.parse(localStorage.getItem('trash') || '[]');
            localStorage.setItem('trash', JSON.stringify([...currentTrash, trashItem]));

            setEvents(events.filter(e => e.id !== id));
            setSelectedIds(selectedIds.filter(sid => sid !== id));
            if (editingId === id) resetForm();
        }
    };

    const handleDeleteSeries = (seriesId) => {
        if (confirm('هل أنت متأكد من حذف جميع التكرارات لهذا الحدث؟ سيتم نقلها إلى سلة المحذوفات.')) {
            const eventsToDelete = events.filter(e => e.seriesId === seriesId);
            const currentTrash = JSON.parse(localStorage.getItem('trash') || '[]');
            const newTrashItems = eventsToDelete.map(ev => ({
                id: Date.now() + Math.random(),
                source: 'events',
                originalData: ev,
                deletedBy: 'admin@seeds.com',
                deletedAt: new Date().toISOString()
            }));
            localStorage.setItem('trash', JSON.stringify([...currentTrash, ...newTrashItems]));
            setEvents(events.filter(e => e.seriesId !== seriesId));
        }
    }

    const handleEdit = (event) => {
        const isSeries = !!event.seriesId;
        let recurrenceEndDate = '';

        if (isSeries) {
            const seriesEvents = events.filter(e => e.seriesId === event.seriesId);
            seriesEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
            const lastEvent = seriesEvents[seriesEvents.length - 1];
            recurrenceEndDate = lastEvent.date;
        }

        setFormData({
            title: event.title,
            date: event.date,
            startTime: event.startTime || '',
            endTime: event.endTime || '',
            type: event.type,
            recurrence: event.recurrence || 'none',
            recurrenceEndDate: recurrenceEndDate,
            teacherId: event.teacherId || '',
            roomId: event.roomId || ''
        });
        setEditingId(event.id);
        setEditMode('single');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({
            title: '', date: '', startTime: '', endTime: '', type: 'class',
            recurrence: 'none', recurrenceEndDate: '', teacherId: '', roomId: ''
        });
        setEditingId(null);
        setEditMode('single');
    };

    // Bulk actions
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(events.map(e => e.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkDelete = () => {
        if (window.confirm(`هل أنت متأكد من حذف ${selectedIds.length} عناصر؟`)) {
            setEvents(events.filter(e => !selectedIds.includes(e.id)));
            setSelectedIds([]);
            if (selectedIds.includes(editingId)) resetForm();
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'class': return { text: 'حصّة دراسية', color: 'bg-green-100 text-green-700' };
            case 'holiday': return { text: 'عطلة', color: 'bg-red-100 text-red-700' };
            case 'activity': return { text: 'نشاط', color: 'bg-orange-100 text-orange-700' };
            default: return { text: 'آخر', color: 'bg-gray-100 text-gray-700' };
        }
    };

    // Grouping Logic
    const groupedEvents = () => {
        const groups = {};
        const standalone = [];

        events.forEach(event => {
            if (event.seriesId) {
                if (!groups[event.seriesId]) {
                    groups[event.seriesId] = [];
                }
                groups[event.seriesId].push(event);
            } else {
                standalone.push(event);
            }
        });

        // Sort groups by date of first element
        Object.values(groups).forEach(group => group.sort((a, b) => new Date(a.date) - new Date(b.date)));

        return { groups, standalone };
    };

    const { groups, standalone } = groupedEvents();

    // Calendar Handlers
    const handleEventDrop = ({ event, start, end }) => {
        // Find the index of the event
        const updatedEvents = events.map(existingEvent => {
            // Match logic:
            // DragAndDrop gives us the event object we passed to it.
            // We need to match it to our state.
            // Since we pass 'id' in calendarEvents mapping below, we can match by ID.
            if (existingEvent.id === event.id) {
                return {
                    ...existingEvent,
                    date: format(start, 'yyyy-MM-dd'),
                    startTime: event.allDay ? '' : format(start, 'HH:mm'),
                    endTime: event.allDay ? '' : format(end, 'HH:mm'),
                };
            }
            return existingEvent;
        });

        setEvents(updatedEvents);
        // LocalStorage is handled by useEffect
    };

    const handleSelectEvent = (event) => {
        // Populate form with this event's data
        // event is the calendar object. We need to find the raw event or just use props.
        // We included ...event in calendarEvents map, so we have everything.
        handleEdit(event);
    };

    // Transform events for BigCalendar
    const calendarEvents = events.map((event) => {
        const eventDate = new Date(event.date);
        let startDateTime, endDateTime;

        if (event.startTime) {
            const [hours, minutes] = event.startTime.split(':');
            startDateTime = new Date(eventDate);
            startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
            startDateTime = new Date(eventDate);
            startDateTime.setHours(0, 0, 0, 0);
        }

        if (event.endTime) {
            const [hours, minutes] = event.endTime.split(':');
            endDateTime = new Date(eventDate);
            endDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
            endDateTime = new Date(eventDate);
            endDateTime.setHours(23, 59, 59, 999);
        }

        return {
            ...event, // Spread original props including ID
            start: startDateTime, // Override start/end for Calendar
            end: endDateTime,
            allDay: !event.startTime
        };
    });

    const formats = {
        monthHeaderFormat: (date) => new Intl.DateTimeFormat('ar-EG-u-nu-latn', { month: 'long', year: 'numeric' }).format(date),
        dayFormat: (date) => new Intl.DateTimeFormat('ar-EG-u-nu-latn', { weekday: 'long', day: 'numeric' }).format(date),
        weekdayFormat: (date) => new Intl.DateTimeFormat('ar-EG-u-nu-latn', { weekday: 'short' }).format(date),
        timeGutterFormat: (date) => new Intl.DateTimeFormat('ar-EG-u-nu-latn', { hour: 'numeric', minute: '2-digit' }).format(date),
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">إدارة الجدول الزمني</h1>
            </div>

            {/* Add/Edit Event Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <CalendarIcon size={20} />
                    {editingId ? 'تعديل الحدث' : 'إضافة حدث جديد'}
                </h2>

                {editingId && events.find(e => e.id === editingId)?.seriesId && (
                    <div className="mb-6 bg-orange-50 p-4 rounded-lg border border-orange-100">
                        <label className="block text-sm font-bold text-gray-800 mb-3">تطبيق التعديلات على:</label>
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="editMode"
                                    value="single"
                                    checked={editMode === 'single'}
                                    onChange={(e) => setEditMode(e.target.value)}
                                    className="text-primary-green focus:ring-primary-green"
                                />
                                <span className="text-sm text-gray-700">هذا الحدث فقط</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="editMode"
                                    value="future"
                                    checked={editMode === 'future'}
                                    onChange={(e) => setEditMode(e.target.value)}
                                    className="text-primary-green focus:ring-primary-green"
                                />
                                <span className="text-sm text-gray-700">هذا الحدث والأحداث التالية</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="editMode"
                                    value="all"
                                    checked={editMode === 'all'}
                                    onChange={(e) => setEditMode(e.target.value)}
                                    className="text-primary-green focus:ring-primary-green"
                                />
                                <span className="text-sm text-gray-700">جميع الأحداث في السلسلة</span>
                            </label>
                        </div>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الحدث</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green outline-none"
                            placeholder="مثال: درس عقيدة"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">نوع الحدث</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green outline-none"
                        >
                            <option value="class">حصّة دراسية</option>
                            <option value="activity">نشاط / فعالية</option>
                            <option value="holiday">عطلة / إجازة</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">من</label>
                        <input
                            type="time"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">إلى</label>
                        <input
                            type="time"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">المعلمة</label>
                        <select
                            name="teacherId"
                            value={formData.teacherId}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green outline-none"
                        >
                            <option value="">اختيار معلمة...</option>
                            {teachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">القاعة</label>
                        <select
                            name="roomId"
                            value={formData.roomId}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green outline-none"
                        >
                            <option value="">اختيار قاعة...</option>
                            {rooms.map(room => (
                                <option key={room.id} value={room.id}>
                                    {room.name} ({room.capacity})
                                </option>
                            ))}
                        </select>
                    </div>



                    {(!editingId || (editingId && editMode !== 'single')) && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">تكرار</label>
                                <select
                                    name="recurrence"
                                    value={formData.recurrence}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green outline-none"
                                >
                                    <option value="none">بدون تكرار</option>
                                    <option value="daily">يومي (كل يوم)</option>
                                    <option value="weekly">أسبوعي (كل أسبوع)</option>
                                    <option value="biweekly">نصف شهري (أسبوع نعم وأسبوع لا)</option>
                                    <option value="yearly">سنوي (كل سنة)</option>
                                </select>
                            </div>
                            {formData.recurrence !== 'none' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ انتهاء التكرار</label>
                                    <input
                                        type="date"
                                        name="recurrenceEndDate"
                                        value={formData.recurrenceEndDate}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green outline-none"
                                    />
                                </div>
                            )}
                        </>
                    )}

                    <div className="md:col-span-4 flex gap-2 w-full mt-4">
                        <button type="submit" className={`${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary-green hover:bg-green-600'} text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 w-full md:w-auto md:min-w-[200px]`}>
                            {editingId ? <Save size={20} /> : <Plus size={20} />}
                            <span>{editingId ? 'حفظ' : 'إضافة'}</span>
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 w-full md:w-auto"
                            >
                                <span>إلغاء</span>
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <span className="font-bold">تم تحديد {selectedIds.length} عناصر</span>
                    <button
                        onClick={handleBulkDelete}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                        <Trash size={18} />
                        <span>حذف المحدد</span>
                    </button>
                </div>
            )}

            {/* Events List Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-700">
                    الأحداث المجدولة
                </div>
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="border-b border-gray-100 text-sm text-gray-500 sticky top-0 bg-gray-50 z-10">
                                <th className="p-4 w-10">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={events.length > 0 && selectedIds.length === events.length}
                                        className="w-4 h-4 rounded border-gray-300 text-primary-green focus:ring-primary-green"
                                    />
                                </th>
                                <th className="p-4">العنوان</th>
                                <th className="p-4">النوع</th>
                                <th className="p-4">التاريخ</th>
                                <th className="p-4">الوقت</th>
                                <th className="p-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Render Recurring Series Groups */}
                            {Object.entries(groups).map(([seriesId, groupEvents]) => {
                                const firstEvent = groupEvents[0];
                                const isExpanded = expandedSeries.includes(seriesId);
                                return (
                                    <div key={`series-${seriesId}`} style={{ display: 'contents' }}>
                                        {/* Series Parent Row */}
                                        <tr className="bg-orange-50/50 border-b border-gray-100">
                                            <td className="p-4 text-center">
                                                <button onClick={() => toggleSeriesExpansion(seriesId)} className="p-1 hover:bg-orange-100 rounded">
                                                    {isExpanded ? <ChevronUp size={16} className="text-primary-orange" /> : <ChevronDown size={16} className="text-gray-400" />}
                                                </button>
                                            </td>
                                            <td className="p-4 font-bold text-gray-800 flex items-center gap-2">
                                                {firstEvent.title}
                                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <RefreshCw size={10} />
                                                    {firstEvent.recurrence === 'daily' ? 'يومي' :
                                                        firstEvent.recurrence === 'weekly' ? 'أسبوعي' :
                                                            firstEvent.recurrence === 'biweekly' ? 'نصف شهري' : 'سنوي'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-xs text-gray-500">({groupEvents.length} تكرار)</span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600 font-mono">
                                                {firstEvent.date} <span className="mx-1">→</span> {groupEvents[groupEvents.length - 1].date}
                                            </td>
                                            <td className="p-4 font-mono text-sm text-gray-600">
                                                {firstEvent.startTime || '--:--'} - {firstEvent.endTime || '--:--'}
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleDeleteSeries(seriesId)}
                                                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg text-xs flex items-center gap-1"
                                                    title="حذف السلسلة بالكامل"
                                                >
                                                    <Trash size={14} />
                                                    حذف الكل
                                                </button>
                                            </td>
                                        </tr>
                                        {/* Expanded Child Rows */}
                                        {isExpanded && groupEvents.map(event => (
                                            <tr key={event.id} className={`border-b border-gray-50 hover:bg-gray-50 ${selectedIds.includes(event.id) ? 'bg-orange-50' : ''}`}>
                                                <td className="p-4 pr-8">
                                                    <input
                                                        type="checkbox"
                                                        onChange={() => handleSelectOne(event.id)}
                                                        checked={selectedIds.includes(event.id)}
                                                        className="w-4 h-4 rounded border-gray-300 text-primary-green focus:ring-primary-green"
                                                    />
                                                </td>
                                                <td className="p-4 text-gray-600 text-sm pl-8">↳ {event.title}</td>
                                                <td className="p-4">
                                                    {(() => {
                                                        const typeStyle = getTypeLabel(event.type);
                                                        return (
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${typeStyle.color}`}>
                                                                {typeStyle.text}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="p-4 text-gray-600 font-mono text-sm">{event.date}</td>
                                                <td className="p-4 text-gray-600 font-mono text-sm">
                                                    <div className="flex items-center gap-1">
                                                        {(event.startTime || event.endTime) ? <Clock size={16} className="text-gray-400" /> : null}
                                                        {event.startTime || '--:--'} - {event.endTime || '--:--'}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(event)}
                                                            className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg"
                                                            title="تعديل"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(event.id)}
                                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                            title="حذف"
                                                        >
                                                            <Trash size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </div>
                                );
                            })}

                            {/* Render Standalone Events */}
                            {standalone.map(event => {
                                const typeStyle = getTypeLabel(event.type);
                                return (
                                    <tr key={event.id} className={`border-b border-gray-50 hover:bg-gray-50 ${selectedIds.includes(event.id) ? 'bg-orange-50' : ''}`}>
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                onChange={() => handleSelectOne(event.id)}
                                                checked={selectedIds.includes(event.id)}
                                                className="w-4 h-4 rounded border-gray-300 text-primary-green focus:ring-primary-green"
                                            />
                                        </td>
                                        <td className="p-4 font-medium text-gray-800">{event.title}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${typeStyle.color}`}>
                                                {typeStyle.text}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600 font-mono text-sm">{event.date}</td>
                                        <td className="p-4 text-gray-600 font-mono text-sm">
                                            <div className="flex items-center gap-1">
                                                {(event.startTime || event.endTime) ? <Clock size={16} className="text-gray-400" /> : null}
                                                {event.startTime || '--:--'} - {event.endTime || '--:--'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(event)}
                                                    className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg"
                                                    title="تعديل"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(event.id)}
                                                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                    title="حذف"
                                                >
                                                    <Trash size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {events.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        لا توجد أحداث مجدولة.
                    </div>
                )}
            </div>

            {/* Calendar View */}
            <div className="bg-white p-6 rounded-xl shadow-sm h-auto border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">
                    عرض وتعديل الجدول الزمني
                    <span className="block text-sm font-normal text-gray-500 mt-1">
                        يمكنك سحب وإفلات الأحداث لتغيير توقيتها، أو الضغط على حدث لتعديله في النموذج.
                    </span>
                </h2>
                <DnDCalendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    culture="ar"

                    // Controlled State
                    view={view}
                    date={date}
                    onNavigate={handleNavigate}
                    onView={handleView}

                    // Interactions
                    draggableAccessor={() => true}
                    onEventDrop={handleEventDrop}
                    onSelectEvent={handleSelectEvent}
                    resizable={false}

                    // Config
                    scrollToTime={new Date(1970, 1, 1, 9, 0, 0)}
                    views={['month', 'week', 'agenda']}
                    formats={formats}
                    messages={{
                        week: "أسبوع",
                        day: "يوم",
                        agenda: "أجندة",
                        today: "اليوم",
                        previous: "السابق",
                        next: "التالي",
                        month: "شهر",
                        date: "التاريخ",
                        time: "الوقت",
                        event: "الحدث"
                    }}
                    components={{
                        toolbar: CustomToolbar,
                        month: {
                            dateHeader: CustomDateHeader,
                            header: CustomMonthHeader
                        },
                        header: CustomWeekHeader,
                        event: CustomEvent
                    }}
                    eventPropGetter={(event) => {
                        const backgroundColor = event.type === 'holiday' ? '#ef4444' : event.type === 'activity' ? '#F39200' : '#8DC63F';
                        return { style: { backgroundColor } };
                    }}
                    rtl={true}
                    style={{ height: 650 }}
                />
            </div>
        </div>
    );
}
