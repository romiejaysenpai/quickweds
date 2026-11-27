export function toSafeHttpUrl(raw?: string | null): string | null {
    if (!raw || typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;

    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
            return null;
        }
        return parsed.toString();
    } catch {
        return null;
    }
}

export function normalizeExternalWebsiteUrl(value: string): string | null {
    if (/[\u0000-\u001f\u007f]/.test(value)) return null;
    try {
        const url = new URL(value.trim());
        if (url.protocol !== 'https:' || url.username || url.password || !url.hostname.includes('.')) return null;
        return url.toString();
    } catch { return null; }
}
