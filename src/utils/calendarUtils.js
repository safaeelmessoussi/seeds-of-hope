import { dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays, addWeeks, addYears, isAfter } from 'date-fns';
import { arMA } from 'date-fns/locale';

// Setup Localizer
const locales = {
    'ar': arMA,
};

export const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

export const formatDate = (date, formatStr) => {
    return format(date, formatStr, { locale: arMA });
};

// Arabic Translations for Calendar Control
export const calendarMessages = {
    allDay: 'طوال اليوم',
    previous: 'السابق',
    next: 'التالي',
    today: 'اليوم',
    month: 'شهري',
    week: 'أسبوعي',
    day: 'يومي',
    agenda: 'أجندة',
    date: 'التاريخ',
    time: 'الوقت',
    event: 'الحدث',
    noEventsInRange: 'لا توجد أحداث في هذا النطاق',
};

/**
 * Generates a series of events based on recurrence rules.
 * @param {Object} baseEvent - The initial event data
 * @param {string} recurrenceType - 'daily', 'weekly', 'biweekly', 'yearly'
 * @param {Date} endDate - When the series ends
 * @param {string} seriesId - Unique ID linking the series
 */
export const generateEventSeries = (baseEvent, recurrenceType, endDate, seriesId) => {
    const events = [];
    let currentStart = new Date(baseEvent.start);
    let currentEnd = new Date(baseEvent.end);
    const endLimit = new Date(endDate);

    // Safety break to prevent infinite loops
    let count = 0;
    const MAX_EVENTS = 365;

    while (!isAfter(currentStart, endLimit) && count < MAX_EVENTS) {
        events.push({
            ...baseEvent,
            start: currentStart.toISOString(),
            end: currentEnd.toISOString(),
            seriesId: seriesId
        });

        // Increment based on recurrence
        switch (recurrenceType) {
            case 'daily':
                currentStart = addDays(currentStart, 1);
                currentEnd = addDays(currentEnd, 1);
                break;
            case 'weekly':
                currentStart = addWeeks(currentStart, 1);
                currentEnd = addWeeks(currentEnd, 1);
                break;
            case 'biweekly':
                currentStart = addWeeks(currentStart, 2);
                currentEnd = addWeeks(currentEnd, 2);
                break;
            case 'yearly':
                currentStart = addYears(currentStart, 1);
                currentEnd = addYears(currentEnd, 1);
                break;
            default:
                // No recurrence, just one event (should verify if loop logic needs this break)
                return [baseEvent];
        }
        count++;
    }

    return events;
};

// Hijri Date Helpers using Intl (with Western Numerals via nu-latn)
export const getHijriParts = (date) => {
    try {
        const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        const parts = formatter.formatToParts(date);
        const day = parts.find(p => p.type === 'day')?.value || '';
        const month = parts.find(p => p.type === 'month')?.value || '';
        const year = parts.find(p => p.type === 'year')?.value || '';
        return { day, month, year };
    } catch (e) {
        console.error("Hijri format error", e);
        return { day: '', month: '', year: '' };
    }
};

export const formatDualMonthHeader = (date, localizer) => {
    const gYear = date.getFullYear();
    const gMonth = localizer.format(date, 'MMMM');

    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const hStart = getHijriParts(start);
    const hEnd = getHijriParts(end);

    let hText = '';
    if (hStart.month === hEnd.month) {
        hText = `${hStart.month} ${hStart.year}`;
    } else if (hStart.year === hEnd.year) {
        hText = `${hStart.month} / ${hEnd.month} ${hStart.year}`;
    } else {
        hText = `${hStart.month} ${hStart.year} / ${hEnd.month} ${hEnd.year}`;
    }

    return `${gMonth} ${gYear} | ${hText}`;
};
