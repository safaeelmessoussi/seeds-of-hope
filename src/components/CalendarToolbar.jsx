
import { formatDate, getHijriParts } from '../utils/calendarUtils';

const CustomToolbar = (toolbar) => {
    const goToBack = () => {
        toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
        toolbar.onNavigate('NEXT');
    };

    const goToCurrent = () => {
        toolbar.onNavigate('TODAY');
    };

    const label = () => {
        const date = toolbar.date;
        const gYear = date.getFullYear();
        const gMonth = formatDate(date, 'MMMM');

        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const hStart = getHijriParts(start);
        const hEnd = getHijriParts(end);

        let hText = '';
        try {
            if (hStart.month === hEnd.month) {
                hText = `${hStart.month} ${hStart.year}`;
            } else if (hStart.year === hEnd.year) {
                hText = `${hStart.month} / ${hEnd.month} ${hStart.year}`;
            } else {
                hText = `${hStart.month} ${hStart.year} / ${hEnd.month} ${hEnd.year}`;
            }
        } catch (e) {
            console.error("Error generating Hijri header", e);
            hText = '';
        }

        return (
            <div className="flex gap-3 items-center text-lg md:text-xl font-bold">
                <span className="text-[#8DC63F]">{gMonth} {gYear}</span>
                <span className="text-gray-300">|</span>
                <span className="text-[#F39200]">{hText}</span>
            </div>
        );
    };

    return (
        <div className="rbc-toolbar flex-col md:flex-row gap-4 mb-4 h-auto">
            <span className="rbc-btn-group">
                <button type="button" onClick={goToCurrent}>اليوم</button>
                <button type="button" onClick={goToNext}>التالي</button>
                <button type="button" onClick={goToBack}>السابق</button>
            </span>

            <span className="rbc-toolbar-label flex justify-center w-full md:w-auto order-first md:order-none">
                {label()}
            </span>

            <span className="rbc-btn-group">
                <button type="button" className={toolbar.view === 'month' ? 'rbc-active' : ''} onClick={() => toolbar.onView('month')}>شهري</button>
                <button type="button" className={toolbar.view === 'week' ? 'rbc-active' : ''} onClick={() => toolbar.onView('week')}>أسبوعي</button>
                <button type="button" className={toolbar.view === 'day' ? 'rbc-active' : ''} onClick={() => toolbar.onView('day')}>يومي</button>
            </span>
        </div>
    );
};

export default CustomToolbar;
