import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

/**
 * Enforces Western Arabic numerals (0-9) by replacing Eastern Arabic numerals.
 * @param {string|number} input 
 * @returns {string}
 */
export const toWesternNumerals = (input) => {
    if (input === null || input === undefined) return '';
    const str = String(input);
    return str.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
};

/**
 * Formats a date using Western numerals.
 * @param {Date|string|number} date 
 * @param {string} pattern 
 * @returns {string}
 */
export const formatDate = (date, pattern = 'yyyy/MM/dd hh:mm a') => {
    if (!date) return '';
    const d = new Date(date);
    // Use 'en-US' or similar to ensure digits are 0-9 by default in most environments,
    // but if we use Arabic locale, we must manually enforce digit replacement.
    // Using 'ar' locale might produce Eastern numerals by default in some implementations.
    // The safest way is to format and then sanitize.

    const formatted = format(d, pattern, { locale: ar });
    return toWesternNumerals(formatted);
};

// Helper for display numbers
export const formatNumber = (num) => {
    return toWesternNumerals(num);
};
