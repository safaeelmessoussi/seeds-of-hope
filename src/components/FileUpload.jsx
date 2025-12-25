import { useState, useEffect } from 'react';
import { Link as LinkIcon, FileText, Video, Headphones, Image, X, Check } from 'lucide-react';

/**
 * Get file type from URL
 */
const getFileTypeFromUrl = (url) => {
    const lower = url.toLowerCase();

    // YouTube
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
        return 'video';
    }

    // Google Drive - could be anything, default to PDF
    if (lower.includes('drive.google.com')) {
        if (lower.includes('/file/d/')) {
            // Check if we can detect type from URL
            return 'pdf'; // Most common use case
        }
        return 'pdf';
    }

    // By extension
    if (lower.includes('.mp4') || lower.includes('.webm') || lower.includes('.mov')) return 'video';
    if (lower.includes('.mp3') || lower.includes('.wav') || lower.includes('.m4a')) return 'audio';
    if (lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.png') || lower.includes('.gif') || lower.includes('.webp')) return 'image';
    if (lower.includes('.pdf')) return 'pdf';

    return 'video'; // Default
};

/**
 * FileUpload Component - External URL input only (Google Drive, YouTube, etc.)
 * @param {function} onUpload - Callback with uploaded file URL and type
 * @param {string} currentUrl - Current file URL (for editing)
 * @param {string} currentType - Current file type
 */
export default function FileUpload({ onUpload, currentUrl = '', currentType = '' }) {
    const [url, setUrl] = useState(currentUrl);
    const [type, setType] = useState(currentType || 'video');
    const [isEditing, setIsEditing] = useState(!currentUrl);

    // Sync state with props when editing (props change)
    useEffect(() => {
        setUrl(currentUrl);
        setType(currentType || 'video');
        setIsEditing(!currentUrl);
    }, [currentUrl, currentType]);

    const handleSubmit = () => {
        if (!url.trim()) return;
        const detectedType = getFileTypeFromUrl(url.trim());
        setType(detectedType);
        onUpload(url.trim(), detectedType);
        setIsEditing(false);
    };

    const handleTypeChange = (newType) => {
        setType(newType);
        if (url.trim()) {
            onUpload(url.trim(), newType);
        }
    };

    const clearUrl = () => {
        setUrl('');
        setType('video');
        onUpload('', '');
        setIsEditing(true);
    };

    const getTypeIcon = (t) => {
        switch (t) {
            case 'video': return <Video className="text-red-500" size={18} />;
            case 'audio': return <Headphones className="text-purple-500" size={18} />;
            case 'image': return <Image className="text-green-500" size={18} />;
            case 'pdf': return <FileText className="text-blue-500" size={18} />;
            default: return <FileText className="text-gray-500" size={18} />;
        }
    };

    // If URL is set and not editing, show the URL
    if (url && !isEditing) {
        return (
            <div className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getTypeIcon(type)}
                        <span className="text-sm text-gray-600 truncate flex-1 dir-ltr text-left">{url}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="text-blue-500 hover:text-blue-700 text-xs"
                        >
                            تعديل
                        </button>
                        <button
                            type="button"
                            onClick={clearUrl}
                            className="text-red-500 hover:text-red-700"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* URL Input */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <LinkIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="url"
                        placeholder="الصق الرابط هنا (YouTube, Google Drive, رابط مباشر...)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full border rounded-lg p-2 pr-10 text-sm focus:ring-2 focus:ring-primary-green outline-none dir-ltr text-left"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!url.trim()}
                    className="px-4 py-2 bg-primary-green text-white rounded-lg text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                    <Check size={16} />
                    حفظ
                </button>
            </div>

            {/* Type Selection */}
            <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500">نوع المحتوى:</span>
                {[
                    { value: 'video', label: 'فيديو', icon: Video, color: 'text-red-500' },
                    { value: 'audio', label: 'صوت', icon: Headphones, color: 'text-purple-500' },
                    { value: 'image', label: 'صورة', icon: Image, color: 'text-green-500' },
                    { value: 'pdf', label: 'PDF', icon: FileText, color: 'text-blue-500' }
                ].map(t => (
                    <button
                        key={t.value}
                        type="button"
                        onClick={() => handleTypeChange(t.value)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors ${type === t.value
                            ? 'bg-gray-100 border-gray-300 font-bold'
                            : 'border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <t.icon size={14} className={t.color} />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
                <strong>كيفية رفع ملف من Google Drive:</strong>
                <ol className="mt-1 space-y-1 list-decimal list-inside">
                    <li>ارفع الملف إلى Google Drive</li>
                    <li>اضغط على الملف بزر الفأرة الأيمن → "الحصول على رابط"</li>
                    <li>غيّر الإعداد إلى "أي شخص لديه الرابط"</li>
                    <li>انسخ الرابط والصقه هنا</li>
                </ol>
            </div>
        </div>
    );
}
