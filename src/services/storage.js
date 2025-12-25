import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase";

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} folder - The folder path (e.g., 'content/audio')
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<string>} - The download URL
 */
export const uploadFile = (file, folder = 'content', onProgress) => {
    return new Promise((resolve, reject) => {
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${folder}/${timestamp}_${safeName}`;
        const storageRef = ref(storage, filePath);

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) onProgress(progress);
            },
            (error) => {
                console.error('Upload error:', error);
                reject(error);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
};

/**
 * Delete a file from Firebase Storage
 * @param {string} url - The file URL to delete
 */
export const deleteFile = async (url) => {
    try {
        const fileRef = ref(storage, url);
        await deleteObject(fileRef);
    } catch (error) {
        console.warn('Could not delete file:', error);
    }
};

/**
 * Get file type from extension
 * @param {string} filename - The filename
 * @returns {string} - 'video', 'audio', 'image', 'pdf', or 'other'
 */
export const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();

    const videoExts = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v'];
    const audioExts = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'];
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    const pdfExts = ['pdf'];

    if (videoExts.includes(ext)) return 'video';
    if (audioExts.includes(ext)) return 'audio';
    if (imageExts.includes(ext)) return 'image';
    if (pdfExts.includes(ext)) return 'pdf';
    return 'other';
};
