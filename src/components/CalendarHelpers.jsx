import React from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// --- Helper Functions ---

export const getHijriDate = (date) => {
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-nu-latn', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
};

export const fixHijriMonthName = (name) => {
    return name.replace(/جمادى الأولى/g, 'جمادى الأولى') // Keep standard
        .replace(/جمادى الآخرة/g, 'جمادى الثانية'); // Replace per user request
};

export const getHijriMonth = (date) => {
    const rawName = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-nu-latn', {
        month: 'long',
        year: 'numeric'
    }).format(date);
    return fixHijriMonthName(rawName);
};

export const getHijriDay = (date) => {
    // Just the day number
    const parts = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-nu-latn', {
        day: 'numeric'
    }).formatToParts(date);
    return parts.find(p => p.type === 'day')?.value || '';
};

// --- Custom Components ---

export const CustomToolbar = (toolbar) => {
    const goToBack = () => {
        toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
        toolbar.onNavigate('NEXT');
    };

    const goToCurrent = () => {
        toolbar.onNavigate('TODAY');
    };

    const changeView = (view) => {
        toolbar.onView(view);
    };

    const label = () => {
        const date = toolbar.date;
        // Gregorian (Green)
        const gregorian = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { month: 'long', year: 'numeric' }).format(date);

        // Hijri (Orange)
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const startHijriFull = getHijriMonth(startOfMonth);
        const endHijriFull = getHijriMonth(endOfMonth);

        let hijriLabel = startHijriFull;
        if (startHijriFull !== endHijriFull) {
            const startParts = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-nu-latn', { month: 'long', year: 'numeric' }).formatToParts(startOfMonth);
            const endParts = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-nu-latn', { month: 'long', year: 'numeric' }).formatToParts(endOfMonth);

            const startM = fixHijriMonthName(startParts.find(p => p.type === 'month').value);
            const endM = fixHijriMonthName(endParts.find(p => p.type === 'month').value);
            const startY = startParts.find(p => p.type === 'year').value;
            const endY = endParts.find(p => p.type === 'year').value;

            if (startY === endY) {
                hijriLabel = `${startM} / ${endM} ${startY}`;
            } else {
                hijriLabel = `${startHijriFull} / ${endHijriFull}`;
            }
        }

        return (
            <div className="flex items-center justify-center gap-2 text-lg font-bold">
                <span className="text-primary-green">{gregorian}</span>
                <span className="text-gray-400 font-light mx-1">|</span>
                <span className="text-primary-orange">{hijriLabel}</span>
            </div>
        );
    };

    return (
        <div className="flex items-center justify-between mb-6 w-full">
            {/* Right Side: View Switcher */}
            <div className="flex-1 flex justify-start">
                <div className="flex bg-gray-50 p-1 rounded-lg">
                    <button
                        onClick={() => changeView('month')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${toolbar.view === 'month' ? 'bg-white text-primary-green shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        شهري
                    </button>
                    <button
                        onClick={() => changeView('week')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${toolbar.view === 'week' ? 'bg-white text-primary-green shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        أسبوعي
                    </button>
                    <button
                        onClick={() => changeView('agenda')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${toolbar.view === 'agenda' ? 'bg-white text-primary-green shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        أجندة
                    </button>
                </div>
            </div>

            {/* Center: Label */}
            <div className="flex-1 flex justify-center text-center whitespace-nowrap">
                {label()}
            </div>

            {/* Left Side: Navigation Buttons */}
            {/* Swapped Order: Prev (Rightmost in visual RTL?? No wait.) */}
            {/* RTL: Flex Start is Right. Flex End is Left. */}
            {/* This container is `justify-end`, so it pushes content to the Left. */}
            {/* Children Order: 1, 2, 3. */}
            {/* Child 1 is Visual Right. Child 3 is Visual Left. */}
            {/* User wants: Next (Left) and Prev (Right). */}
            {/* So Next should be Child 3 (Leftmost). Prev should be Child 1 (Rightmost). */}
            {/* Order: Prev, Today, Next */}
            <div className="flex-1 flex justify-end">
                <div className="flex gap-2">
                    <button onClick={goToBack} className="px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-bold shadow-sm border border-gray-100 transition-all">السابق</button>
                    <button onClick={goToCurrent} className="px-4 py-2 rounded-lg bg-primary-green text-white hover:bg-green-600 text-sm font-bold shadow-sm transition-all">اليوم</button>
                    <button onClick={goToNext} className="px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-bold shadow-sm border border-gray-100 transition-all">التالي</button>
                </div>
            </div>
        </div>
    );
};

export const CustomDateHeader = ({ label, date }) => {
    const gregorianDay = format(date, 'd');
    const hijriDay = getHijriDay(date);

    return (
        <div className="flex justify-between items-center px-1">
            <span className="text-sm font-bold text-primary-green">{gregorianDay}</span>
            <span className="text-sm font-bold text-primary-orange">{hijriDay}</span>
        </div>
    );
};

export const CustomWeekHeader = ({ date }) => {
    // Visual RTL Order: [Hijri] [|] [Gregorian] [Weekday]
    // DOM Order (Start -> End): Weekday, Greg, Pipe, Hijri
    // This results in Visual: Hijri (Left) | Greg Weekday (Right) ?? No.
    // Wait, previous verification said: Weekday(Right) Greg | Hijri(Left).
    // User SAID: "25 (Hijri) | 15 (Greg) Monday".
    // 25 is on the Right or Left?
    // "25 | 15 Monday" -> In RTL Reading: Monday (Rightmost word) ... 25 (Leftmost word).
    // So Visual: Monday 15 | 25.
    // Previous Prompt said: "switch the header... 25 | 15 Monday".
    // And user confirmed "It's showing: day name gregorian | hijri".
    // And I fixed it to be "Hijri | Greg Weekday".
    // Let's stick to the code state I left it in, which was `Weekday, Greg, Pipe, Hijri` in DOM.

    const gregorianDay = format(date, 'd');
    const hijriDay = getHijriDay(date);
    const weekday = format(date, 'EEEE', { locale: ar });

    return (
        <div className="flex items-center justify-center gap-1 py-1 h-full w-full text-sm whitespace-nowrap">
            <span className="text-gray-700 font-bold text-xs md:text-sm">{weekday}</span>
            <span className="text-primary-green font-bold text-xs md:text-sm">{gregorianDay}</span>
            <span className="text-gray-300 text-xs">|</span>
            <span className="text-primary-orange font-bold text-xs md:text-sm">{hijriDay}</span>
        </div>
    );
};

export const CustomMonthHeader = ({ label }) => {
    return (
        <div className="text-center py-2 font-bold text-gray-700">
            {label}
        </div>
    );
};

// Event component to hide time in Weekly view
export const CustomEvent = ({ event }) => {
    return (
        <div className="text-xs md:text-sm font-medium">
            {event.title}
        </div>
    );
};
