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
