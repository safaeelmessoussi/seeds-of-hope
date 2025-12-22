
import { Calendar as BigCalendar } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { localizer, calendarMessages, formatDualMonthHeader, getHijriParts } from '../../utils/calendarUtils';
import { useData } from '../../context/DataContext';
import CustomToolbar from '../../components/CalendarToolbar';
import { useState, useMemo } from 'react';
import EventModal from '../../components/EventModal';

// Level colors for events
const LEVEL_COLORS = [
    '#8DC63F', '#F39200', '#8B5CF6', '#EC4899', '#06B6D4',
    '#EF4444', '#10B981', '#F59E0B', '#6366F1', '#84CC16'
];

// Month View Date Header (for day cells)
const CustomDateHeader = ({ date, label }) => {
    const { day } = getHijriParts(date);
    return (
        <div className="flex justify-between px-1 text-xs font-bold w-full">
            <span className="text-[#8DC63F]">{label}</span>
            <span className="text-[#F39200]">{day}</span>
        </div>
    );
};

// Week View Header (for column headers)
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

export default function Calendar() {
    const { data } = useData();
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedLevelFilter, setSelectedLevelFilter] = useState('');

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
    };

    // Get women's levels only, sorted by order
    const womenLevels = useMemo(() => {
        return (data.levels || [])
            .filter(l => l.category === 'women')
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [data.levels]);

    // Build level color map
    const levelColorMap = useMemo(() => {
        const map = {};
        womenLevels.forEach((level, idx) => {
            map[level.id] = LEVEL_COLORS[idx % LEVEL_COLORS.length];
        });
        return map;
    }, [womenLevels]);

    // Enrich events with colors
    const allEvents = useMemo(() => {
        return (data.events || []).map(event => {
            const teacher = data.teachers?.find(t => t.id === event.teacherId);
            const room = data.rooms?.find(r => r.id === event.roomId);
            const level = data.levels?.find(l => l.id === event.levelId);
            const branch = data.branches?.find(b => b.id === event.branchId);
            const content = data.content?.find(c => c.id === event.contentId);

            return {
                ...event,
                start: new Date(event.start),
                end: new Date(event.end),
                teacherName: teacher?.name,
                roomName: room?.name,
                levelName: level?.title,
                branchName: branch?.name,
                contentName: content?.title,
                levelColor: event.levelId ? levelColorMap[event.levelId] : '#6B7280'
            };
        });
    }, [data.events, data.teachers, data.rooms, data.levels, data.branches, data.content, levelColorMap]);

    // Filter events by selected level
    const filteredEvents = useMemo(() => {
        if (!selectedLevelFilter) return allEvents;
        return allEvents.filter(e => e.levelId === selectedLevelFilter);
    }, [allEvents, selectedLevelFilter]);

    // Group events by Branch
    const branches = data.branches || [];

    const calendarsToRender = [];

    // Add Branch Calendars
    branches.forEach(branch => {
        const branchEvents = filteredEvents.filter(e => e.branchId === branch.id);
        calendarsToRender.push({
            id: branch.id,
            title: `جدول ${branch.name}`,
            events: branchEvents
        });
    });

    // Handle level click
    const handleLevelClick = (levelId) => {
        if (selectedLevelFilter === levelId) {
            setSelectedLevelFilter(''); // Toggle off
        } else {
            setSelectedLevelFilter(levelId);
        }
    };

    return (
        <div className="flex flex-col gap-8">
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
                        const color = LEVEL_COLORS[idx % LEVEL_COLORS.length];
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

            {calendarsToRender.map(cal => (
                <div key={cal.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[850px] flex flex-col gap-4">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2 border-b pb-4 border-gray-100">
                        {cal.title}
                        {selectedLevelFilter && (
                            <span className="text-sm font-normal text-gray-500 mr-3">
                                ({womenLevels.find(l => l.id === selectedLevelFilter)?.title})
                            </span>
                        )}
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
                            },
                            week: {
                                header: CustomWeekHeader
                            }
                        }}
                        formats={{
                            monthHeaderFormat: (date, culture, loc) => formatDualMonthHeader(date, loc),
                            weekdayFormat: (date, culture, loc) => {
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
                                backgroundColor: event.levelColor || '#6B7280',
                                borderColor: event.levelColor || '#6B7280',
                                color: '#fff'
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
