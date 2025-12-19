
import { Calendar as BigCalendar } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { localizer, calendarMessages, formatDualMonthHeader, getHijriParts } from '../../utils/calendarUtils';
import { useData } from '../../context/DataContext';
import CustomToolbar from '../../components/CalendarToolbar';
import { useState } from 'react';
import EventModal from '../../components/EventModal';

const CustomDateHeader = ({ date, label }) => {
    const { day } = getHijriParts(date);
    return (
        <div className="flex justify-between px-1 text-xs font-bold w-full">
            <span className="text-[#8DC63F]">{label}</span>
            <span className="text-[#F39200]">{day}</span>
        </div>
    );
};

export default function Calendar() {
    const { data } = useData();
    const [selectedEvent, setSelectedEvent] = useState(null);

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
    };

    // Enrich events
    const allEvents = (data.events || []).map(event => {
        const teacher = data.teachers?.find(t => t.id === event.teacherId);
        const room = data.rooms?.find(r => r.id === event.roomId);

        return {
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
            teacherName: teacher?.name,
            roomName: room?.name
        };
    });

    // Group events by Branch
    // 1. Specific Branches
    // 2. No Branch (General)
    const branches = data.branches || [];

    const calendarsToRender = [];

    // Add Branch Calendars
    branches.forEach(branch => {
        const branchEvents = allEvents.filter(e => e.branchId === branch.id);
        if (branchEvents.length > 0 || true) { // Always show branch calendars even if empty? User said "if we have two branches, we show two calendars".
            calendarsToRender.push({
                id: branch.id,
                title: `جدول ${branch.name}`,
                events: branchEvents
            });
        }
    });

    // Add General/Global events (those with no branchId set)
    const generalEvents = allEvents.filter(e => !e.branchId);
    if (generalEvents.length > 0) {
        calendarsToRender.push({
            id: 'general',
            title: 'الجدول العام',
            events: generalEvents
        });
    }

    return (
        <div className="flex flex-col gap-12">
            {calendarsToRender.map(cal => (
                <div key={cal.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[850px] flex flex-col gap-4">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 border-gray-100">
                        {cal.title}
                    </h1>

                    <BigCalendar
                        localizer={localizer}
                        events={cal.events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        messages={calendarMessages}
                        rtl={true}
                        culture='ar'
                        views={['month', 'week', 'agenda']}
                        onSelectEvent={handleSelectEvent}
                        components={{
                            toolbar: CustomToolbar,
                            month: {
                                dateHeader: CustomDateHeader
                            }
                        }}
                        formats={{
                            monthHeaderFormat: (date, culture, loc) => formatDualMonthHeader(date, loc),
                            dayFormat: (date, culture, loc) => {
                                // For Week View Header: "الاثنين 04"
                                const d = date.getDay();
                                const names = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
                                return `${names[d]} ${date.getDate()}`;
                            },
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
                        eventPropGetter={(event) => ({
                            style: {
                                backgroundColor: '#8DC63F',
                                color: 'white',
                            }
                        })}
                    />
                </div>
            ))}

            {selectedEvent && (
                <EventModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                />
            )}
        </div>
    );
}
