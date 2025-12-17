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

// Custom Date Header Component
const CustomDateHeader = ({ date, label }) => {
    const { day } = getHijriParts(date);
    return (
        <div className="flex justify-between px-1 text-xs font-bold w-full">
            <span className="text-[#8DC63F]">{label}</span>
            <span className="text-[#F39200]">{day}</span>
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
        start: '',
        end: '',
        teacherId: '',
        roomId: '',
        recurrence: 'none', // none, daily, weekly, biweekly, yearly
        recurrenceEnd: '',
    });

    // Series Update Mode
    const [updateMode, setUpdateMode] = useState('single'); // single, future, all

    useEffect(() => {
        if (data.events) {
            setEvents(
                data.events.map(ev => ({
                    ...ev,
                    start: new Date(ev.start),
                    end: new Date(ev.end),
                    isRecurring: !!ev.seriesId
                }))
            );
        }
    }, [data.events]);

    const handleSelectSlot = ({ start, end }) => {
        setSelectedEvent(null);
        const startDate = new Date(start);
        const endDate = new Date(end);

        // Adjust default duration for slot click to 1 hour if start=end (day view click)
        if (startDate.getTime() === endDate.getTime()) {
            endDate.setHours(endDate.getHours() + 1);
        }

        // Convert to datetime-local string format safe for Inputs
        // Note: This needs to handle timezone offset if strict ISO used, 
        // but for local inputs simplest is manual formatting or a library helper.
        // Basic approach:
        const toLocalISO = (d) => {
            const offset = d.getTimezoneOffset() * 60000;
            return new Date(d.getTime() - offset).toISOString().slice(0, 16);
        };

        setFormData({
            title: '',
            type: 'class',
            start: toLocalISO(startDate),
            end: toLocalISO(endDate),
            teacherId: '',
            roomId: '',
            recurrence: 'none',
            recurrenceEnd: ''
        });
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        const toLocalISO = (d) => {
            const offset = d.getTimezoneOffset() * 60000;
            return new Date(d.getTime() - offset).toISOString().slice(0, 16);
        };

        setFormData({
            title: event.title,
            type: event.type || 'class',
            start: toLocalISO(new Date(event.start)),
            end: toLocalISO(new Date(event.end)),
            teacherId: event.teacherId || '',
            roomId: event.roomId || '',
            recurrence: 'none', // Reset recurrence for edit unless logic allows changing series
            recurrenceEnd: ''
        });
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

        const eventPayload = {
            title: formData.title,
            type: formData.type,
            start: new Date(formData.start).toISOString(),
            end: new Date(formData.end).toISOString(),
            teacherId: formData.teacherId,
            roomId: formData.roomId
        };

        try {
            if (selectedEvent) {
                // UPDATE LOGIC
                if (selectedEvent.seriesId && updateMode !== 'single') {
                    // Series Update
                    const seriesId = selectedEvent.seriesId;
                    const fromDate = updateMode === 'future' ? eventPayload.start : null;

                    // 1. Delete relevant recurring events
                    await dbService.deleteSeries('events', seriesId, fromDate);

                    // 2. Re-create events
                    // If we are updating "Future" or "All", we generally re-create the series.
                    // However, if recurrence params are not in the form (recurrence='none'), 
                    // this essentially converts it to a single event or a new series if specified.
                    // For MVP simplicity: If recurrence is 'none', we create a single event.
                    // If recurrence is set, we create a series.

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
                        // Just add as single event (breaking the loop if it was a loop)
                        await dbService.add('events', eventPayload);
                    }
                } else {
                    // Single Update (or clean single event)
                    await dbService.update('events', selectedEvent.id, eventPayload);
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
                    type: event.type
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

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">إدارة الجدول الزمني</h1>
                <BackButton />
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
                        <label className="text-sm text-gray-500">المعلمة (المؤطرة)</label>
                        <select
                            className="w-full border rounded-lg p-2"
                            value={formData.teacherId}
                            onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                        >
                            <option value="">اختيار معلمة...</option>
                            {data.teachers?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
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
                            {data.rooms?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>

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
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">من</label>
                        <input
                            type="datetime-local"
                            className="w-full border rounded-lg p-2 dir-ltr text-right"
                            value={formData.start}
                            onChange={e => setFormData({ ...formData, start: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">إلى</label>
                        <input
                            type="datetime-local"
                            className="w-full border rounded-lg p-2 dir-ltr text-right"
                            value={formData.end}
                            onChange={e => setFormData({ ...formData, end: e.target.value })}
                            required
                        />
                    </div>

                    {/* Recurrence Options */}
                    {!selectedEvent && (
                        <>
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
                        </>
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
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[600px]">
                <DnDCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    messages={calendarMessages}
                    rtl={true}
                    culture='ar'
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    onEventDrop={handleEventDrop}
                    selectable
                    resizable
                    components={{
                        toolbar: CustomToolbar,
                        month: {
                            dateHeader: CustomDateHeader
                        }
                    }}
                    formats={{
                        monthHeaderFormat: (date, culture, loc) => formatDualMonthHeader(date, loc)
                    }}
                    eventPropGetter={(event) => ({
                        style: {
                            backgroundColor: event.id === selectedEvent?.id ? '#F39200' : '#8DC63F',
                            color: 'white',
                        }
                    })}
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
                        {groupedEvents.map((item, idx) => {
                            if (item.isGroup) {
                                const isExpanded = expandedGroups[item.seriesId];
                                return (
                                    <div key={'group-' + item.seriesId} className="bg-gray-50/50">
                                        {/* Series Header Row */}
                                        <div
                                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => toggleGroup(item.seriesId)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : 'rotate-180'}`}>
                                                    ▼
                                                </span>
                                                <div>
                                                    <div className="font-bold text-gray-800 flex items-center gap-2">
                                                        {item.title}
                                                        <span className="text-xs font-normal bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">سلسلة ({item.events.length} حدث)</span>
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        يبدأ: {new Date(item.events[item.events.length - 1].start).toLocaleDateString()} -
                                                        ينتهي: {new Date(item.events[0].start).toLocaleDateString()}
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
                                return (
                                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="font-medium text-gray-800">
                                            {item.title}
                                            <div className="text-xs text-gray-400 font-normal mt-0.5">
                                                {new Date(item.start).toLocaleDateString()} - {new Date(item.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                )}
            </div>
        </div>
    );
}
