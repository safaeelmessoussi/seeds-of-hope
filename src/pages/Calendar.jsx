import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { ar } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
    'ar': ar,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const events = [
    {
        title: 'درس تجويد (نساء)',
        start: new Date(new Date().setHours(10, 0, 0, 0)),
        end: new Date(new Date().setHours(12, 0, 0, 0)),
        type: 'class'
    },
    {
        title: 'يوم مفتوح للأطفال',
        start: new Date(new Date().setDate(new Date().getDate() + 2)),
        end: new Date(new Date().setDate(new Date().getDate() + 2)),
        allDay: true,
        type: 'activity'
    }
];

export default function Calendar() {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm h-[600px] border border-gray-100 font-sans">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">الجدول الزمني</h1>
            <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                culture="ar"
                messages={{
                    next: "التالي",
                    previous: "السابق",
                    today: "اليوم",
                    month: "شهر",
                    week: "أسبوع",
                    day: "يوم",
                    agenda: "أجندة",
                    date: "تاريخ",
                    time: "وقت",
                    event: "حدث",
                    noEventsInRange: "لا توجد أحداث في هذا النطاق",
                    showMore: total => `+ ${total} إضافي`
                }}
                eventPropGetter={(event) => {
                    const backgroundColor = event.type === 'holiday' ? '#ef4444' : event.type === 'activity' ? '#F39200' : '#8DC63F';
                    return { style: { backgroundColor } };
                }}
                rtl={true}
            />
        </div>
    );
}
