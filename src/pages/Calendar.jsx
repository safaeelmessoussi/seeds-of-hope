import { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { ar } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
    CustomToolbar,
    CustomDateHeader,
    CustomWeekHeader,
    CustomMonthHeader,
    CustomEvent
} from '../components/CalendarHelpers';

// Customize locale to start on Monday and use Western numerals logic where possible
// Note: date-fns 'ar' might default to Sat/Sun. We override startOfWeek in localizer/props.
const locales = {
    'ar': {
        ...ar,
        options: { ...ar.options, weekStartsOn: 1 } // 1 = Monday
    },
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

// Helper for Western Numerals in Arabic Locale
const formatNumber = (num) => {
    return new Intl.NumberFormat('ar-EG', { numberingSystem: 'latn' }).format(num);
};

// Hijri Formatter (forcing Western numerals)
const getHijriDate = (date) => {
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-nu-latn', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
};

const fixHijriMonthName = (name) => {
    return name.replace(/جمادى الأولى/g, 'جمادى الأولى') // Keep standard
        .replace(/جمادى الآخرة/g, 'جمادى الثانية'); // Replace per user request
};

const getHijriMonth = (date) => {
    const rawName = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-nu-latn', {
        month: 'long',
        year: 'numeric'
    }).format(date);
    return fixHijriMonthName(rawName);
};

const getHijriDay = (date) => {
    // Just the day number
    const parts = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-nu-latn', {
        day: 'numeric'
    }).formatToParts(date);
    return parts.find(p => p.type === 'day')?.value || '';
};

export default function Calendar() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const loadEvents = () => {
            const saved = localStorage.getItem('events');
            if (saved) {
                const parsedEvents = JSON.parse(saved).map(event => {
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
                        title: event.title,
                        start: startDateTime,
                        end: endDateTime,
                        type: event.type,
                        allDay: !event.startTime
                    };
                });
                setEvents(parsedEvents);
            } else {
                setEvents([]);
            }
        };

        loadEvents();

        const handleStorageChange = () => loadEvents();
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Custom formats to ensure Western numerals in Month/Day views
    const formats = {
        monthHeaderFormat: (date) => new Intl.DateTimeFormat('ar-EG-u-nu-latn', { month: 'long', year: 'numeric' }).format(date),
        dayFormat: (date) => new Intl.DateTimeFormat('ar-EG-u-nu-latn', { weekday: 'long', day: 'numeric' }).format(date),
        weekdayFormat: (date) => new Intl.DateTimeFormat('ar-EG-u-nu-latn', { weekday: 'short' }).format(date),
        timeGutterFormat: (date) => new Intl.DateTimeFormat('ar-EG-u-nu-latn', { hour: 'numeric', minute: '2-digit' }).format(date),
    };

    const [view, setView] = useState('month');
    const [date, setDate] = useState(new Date());

    const handleNavigate = (newDate) => {
        setDate(newDate);
    };

    const handleView = (newView) => {
        setView(newView);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm h-auto border border-gray-100 font-sans">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex gap-2">
                <span>الجدول الزمني</span>
                <span className="text-sm font-normal text-gray-500 self-end mb-1">(ميلادي / هجري)</span>
            </h1>
            <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                culture="ar"

                // Controlled State
                view={view}
                date={date}
                onNavigate={handleNavigate}
                onView={handleView}

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
                        header: CustomMonthHeader // Restore simple header for Month view
                    },
                    header: CustomWeekHeader // Keeps custom header for Week view
                }}
                eventPropGetter={(event) => {
                    const backgroundColor = event.type === 'holiday' ? '#ef4444' : event.type === 'activity' ? '#F39200' : '#8DC63F';
                    return { style: { backgroundColor } };
                }}
                rtl={true}
                style={{ height: 650 }}
            />
        </div>
    );
}
