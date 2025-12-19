import { useState, useRef } from 'react';
import { Download, Upload, FileSpreadsheet } from 'lucide-react';
import { exportToCSV, parseCSV } from '../utils/csvUtils';

export default function DataImportExport({ data, fileName, onImport, templateHeaders, headerMap }) {
    const fileInputRef = useRef(null);
    const [importing, setImporting] = useState(false);

    const handleExport = () => {
        // If headerMap is provided, map data keys to display names
        let exportData = data;
        if (headerMap) {
            exportData = data.map(item => {
                const row = {};
                Object.keys(headerMap).forEach(key => {
                    row[headerMap[key]] = item[key] || '';
                });
                return row;
            });
        }
        exportToCSV(exportData, fileName);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImporting(true);
        try {
            const text = await file.text();
            let parsedData = parseCSV(text);

            // If headerMap is provided, reverse map display names to keys
            if (headerMap && parsedData.length > 0) {
                // Invert headerMap: { 'Name': 'name', 'Email': 'email' }
                const reverseMap = Object.entries(headerMap).reduce((acc, [key, value]) => {
                    acc[value] = key;
                    return acc;
                }, {});

                parsedData = parsedData.map(row => {
                    const newRow = {};
                    Object.keys(row).forEach(header => {
                        const trimmedHeader = header.trim();
                        // Find key corresponding to this header
                        const key = reverseMap[trimmedHeader] || trimmedHeader;
                        newRow[key] = row[header];
                    });
                    return newRow;
                });
            }

            await onImport(parsedData);
            e.target.value = ''; // Reset input
        } catch (error) {
            console.error("Import error:", error);
            alert("فشل استيراد الملف. تأكد من تنسيق CSV.");
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = () => {
        if (!templateHeaders) return;
        // Create empty object with headers
        const templateRow = {};
        templateHeaders.forEach(h => templateRow[h] = '');
        exportToCSV([templateRow], `${fileName}_template.csv`);
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 border border-green-200"
                title="تصدير إلى Excel/CSV"
            >
                <Download size={16} />
                <span className="hidden sm:inline">تصدير</span>
            </button>

            <div className="relative">
                <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importing}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-200"
                    title="استيراد من CSV"
                >
                    <Upload size={16} />
                    <span className="hidden sm:inline">{importing ? 'جاري التحميل...' : 'استيراد'}</span>
                </button>
            </div>

            {templateHeaders && (
                <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200"
                    title="تحميل نموذج فارغ"
                >
                    <FileSpreadsheet size={16} />
                    <span className="hidden sm:inline">نموذج</span>
                </button>
            )}
        </div>
    );
}
