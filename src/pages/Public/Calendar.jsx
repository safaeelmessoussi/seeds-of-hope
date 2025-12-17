
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

    // Map events to BigCalendar format and enrich with related data
    const events = (data.events || []).map(event => {
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

    return (
        <div className="h-[800px] flex flex-col gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">الجدول الزمني</h1>

                <BigCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    messages={calendarMessages}
                    rtl={true}
                    culture='ar'
                    onSelectEvent={handleSelectEvent}
                    components={{
                        toolbar: CustomToolbar,
                        month: {
                            dateHeader: CustomDateHeader
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

            {selectedEvent && (
                <EventModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                />
            )}
        </div>
    );
}
