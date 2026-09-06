/** Shared media limits. Keep these at or below the corresponding Supabase global/bucket limits. */
const MB = 1024 * 1024;

function readByteLimit(name: string, fallback: number) {
    const rawValue = process.env[name];
    const parsed = rawValue ? Number(rawValue) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export const MEDIA_BUCKET = 'quickweds';
export const MAX_IMAGE_UPLOAD_SIZE = readByteLimit('NEXT_PUBLIC_MAX_IMAGE_UPLOAD_SIZE_BYTES', 10 * MB);
export const MAX_IMAGE_SOURCE_SIZE = readByteLimit('NEXT_PUBLIC_MAX_IMAGE_SOURCE_SIZE_BYTES', 25 * MB);
export const MAX_VIDEO_UPLOAD_SIZE = readByteLimit('NEXT_PUBLIC_MAX_VIDEO_UPLOAD_SIZE_BYTES', 50 * MB);
export const MAX_AUDIO_UPLOAD_SIZE = readByteLimit('NEXT_PUBLIC_MAX_AUDIO_UPLOAD_SIZE_BYTES', 15 * MB);
export const IMAGE_COMPRESSION_THRESHOLD = readByteLimit('NEXT_PUBLIC_IMAGE_COMPRESSION_THRESHOLD_BYTES', 4 * MB);

export const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
export const ACCEPTED_VIDEO_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm']);

export function formatFileSize(bytes: number) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
    if (bytes < MB) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / MB).toFixed(bytes >= 100 * MB ? 0 : 1)} MB`;
}

export function fileTooLargeMessage(file: Pick<File, 'name' | 'size'>, maximumBytes: number) {
    return `${file.name} is ${formatFileSize(file.size)}. The current upload limit is ${formatFileSize(maximumBytes)}.`;
}

export function storageErrorMessage(error: unknown, file?: Pick<File, 'name' | 'size'>) {
    const record = error && typeof error === 'object' ? error as Record<string, unknown> : {};
    const message = String(record.message || error || '').trim();
    const status = Number(record.statusCode || record.status || 0);
    const name = file?.name ? `${file.name}: ` : '';

    if (status === 413 || /maximum allowed size|file size|payload too large|too large/i.test(message)) {
        return `${name}the storage service rejected this file because it is too large${file ? ` (${formatFileSize(file.size)})` : ''}. Please choose a smaller file and try again.`;
    }
    if (/network|fetch|timeout|offline|failed to fetch/i.test(message)) {
        return `${name}the network interrupted the upload. Check your connection and retry.`;
    }
    if (/mime|content.?type|format|unsupported/i.test(message)) {
        return `${name}this file format is not supported.`;
    }
    return `${name}${message || 'Supabase Storage could not upload this file. Please retry.'}`;
}
