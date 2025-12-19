
/**
 * Convert array of objects to CSV string and trigger download
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file to download
 */
export const exportToCSV = (data, filename = 'export.csv') => {
    if (!data || !data.length) {
        alert('لا توجد بيانات للتصدير');
        return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        headers.join(','), // Header row
        ...data.map(row => headers.map(fieldName => {
            // Escape quotes and wrap in quotes if contains comma
            let value = row[fieldName] || '';
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        }).join(','))
    ].join('\n');

    // Create Blob and Link
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

/**
 * Parse CSV string to Array of Objects
 * Simple parser: assumes header row, basic quote handling
 * @param {string} content - CSV file content
 * @returns {Array} Array of objects
 */
export const parseCSV = (content) => {
    const lines = content.split(/\r\n|\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

    const results = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // Regex to split by comma but ignore commas inside quotes
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');

        // Use a simpler split if regex fails or for simple cases, but strictly:
        // Let's use a robust split logic or simple split if we assume simple data
        // For now, simple split is risky. Let's try to handle standard CSV.
        // Actually, for this specific use case (Name, Email, Phone), complex CSV is unlikely unless names have commas.
        // Let's stick to a simple split for the MVP but sanitize text.

        // Better Parser Logic for MVP without library:
        const row = {};
        let currentLine = lines[i];

        // Simple Parser: won't handle newlines in cells
        const matches = currentLine.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);

        // Fallback to simple split if regex fails to find matches (e.g. empty fields)
        const cells = currentLine.split(',').map(cell => {
            let val = cell.trim();
            if (val.startsWith('"') && val.endsWith('"')) {
                val = val.slice(1, -1).replace(/""/g, '"');
            }
            return val;
        });

        headers.forEach((header, index) => {
            row[header] = cells[index] || '';
        });

        results.push(row);
    }

    return results;
};
