export const RESERVED_WEDDING_SLUGS = new Set([
    'admin',
    'api',
    'auth',
    'builder',
    'dashboard',
    'login',
    'logout',
    'privacy',
    'qr',
    'signup',
    'supplier',
    'suppliers',
    'terms',
    'w',
]);

const MAX_SLUG_LENGTH = 80;

export function slugifyWeddingValue(value: string) {
    return value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/&/g, ' and ')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-')
        .toLowerCase()
        .slice(0, MAX_SLUG_LENGTH)
        .replace(/-+$/g, '');
}

export function createWeddingSlugBase(brideName?: string | null, groomName?: string | null) {
    const bride = String(brideName || '').trim();
    const groom = String(groomName || '').trim();
    const base = slugifyWeddingValue([bride, groom].filter(Boolean).join(' and '));

    if (!base || RESERVED_WEDDING_SLUGS.has(base)) {
        return 'wedding';
    }

    return base;
}

export function sanitizeWeddingSlug(value: string) {
    const slug = slugifyWeddingValue(value);
    if (slug.length < 3 || RESERVED_WEDDING_SLUGS.has(slug)) return '';
    return slug;
}

export function sanitizeWeddingPublicIdentifier(value: string) {
    if (!value || typeof value !== 'string') return '';

    let decoded = value.trim();
    try {
        decoded = decodeURIComponent(decoded);
    } catch {
        // Keep the raw value when it is not a valid encoded URI component.
    }

    const normalized = decoded.toLowerCase();
    const isValid = /^[a-z0-9][a-z0-9-]{2,79}$/.test(normalized) && !normalized.includes('--');
    if (!isValid) return '';

    return normalized;
}

export function isWeddingIdLike(value: string) {
    return /^[a-zA-Z0-9]{4,32}$/.test(value) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function getWeddingPublicIdentifier(wedding: { id?: string | null; public_slug?: string | null }) {
    return sanitizeWeddingSlug(String(wedding.public_slug || '')) || String(wedding.id || '');
}

export function getWeddingPublicPath(wedding: { id?: string | null; public_slug?: string | null }) {
    const identifier = getWeddingPublicIdentifier(wedding);
    return identifier ? `/w/${encodeURIComponent(identifier)}` : '';
}

export function getWeddingPublicUrl(
    baseUrl: string,
    wedding: { id?: string | null; public_slug?: string | null; custom_domain?: string | null }
) {
    if (wedding.custom_domain) {
        return `https://${String(wedding.custom_domain).replace(/^https?:\/\//, '').replace(/\/+$/, '')}`;
    }

    const base = baseUrl.replace(/\/+$/, '');
    const path = getWeddingPublicPath(wedding);
    return path ? `${base}${path}` : base;
}

/**
 * Append a suffix while respecting the database slug length/format constraint
 * (`^[a-z0-9][a-z0-9-]{2,79}$`, no `--`).
 */
export function withWeddingSlugSuffix(base: string, suffix: string) {
    const cleanSuffix = slugifyWeddingValue(suffix);
    const safeBase = sanitizeWeddingSlug(base) || 'wedding';
    if (!cleanSuffix) return safeBase;
    const room = MAX_SLUG_LENGTH - cleanSuffix.length - 1;
    const trimmedBase = safeBase.slice(0, Math.max(1, room)).replace(/-+$/g, '') || 'wedding';
    return `${trimmedBase}-${cleanSuffix}`.slice(0, MAX_SLUG_LENGTH).replace(/-+$/g, '');
}

/**
 * Ordered list of slug candidates for a wedding. The final candidates include
 * the wedding id so there is always a practically unique option.
 */
export function buildWeddingSlugCandidates(base: string, weddingId: string) {
    const safeBase = sanitizeWeddingSlug(base) || 'wedding';
    const idPart = slugifyWeddingValue(String(weddingId || '')).replace(/-/g, '');
    const candidates = [
        safeBase,
        ...Array.from({ length: 7 }, (_, index) => withWeddingSlugSuffix(safeBase, String(index + 2))),
    ];
    if (idPart) {
        candidates.push(withWeddingSlugSuffix(safeBase, idPart.slice(0, 4)));
        candidates.push(withWeddingSlugSuffix(safeBase, idPart.slice(0, 8)));
    }
    return Array.from(new Set(candidates.filter((slug) => sanitizeWeddingSlug(slug) === slug)));
}

/**
 * Slug used when a chosen slug turned out to be taken at write time.
 * Combines the wedding id with a random component so repeated retries differ.
 */
export function createCollisionSafeWeddingSlug(base: string, weddingId: string, attempt = 0) {
    const idPart = slugifyWeddingValue(String(weddingId || '')).replace(/-/g, '').slice(0, 8);
    const random = Math.random().toString(36).slice(2, 2 + Math.min(6, 3 + attempt));
    const suffix = [idPart, random].filter(Boolean).join('-');
    return withWeddingSlugSuffix(base, suffix);
}

/** True when a write failed because another wedding already uses the public slug. */
export function isPublicSlugConflictError(error: unknown) {
    if (!error || typeof error !== 'object') return false;
    const record = error as Record<string, unknown>;
    const text = `${record.message || ''} ${record.details || ''} ${record.hint || ''}`.toLowerCase();
    const isUniqueViolation = String(record.code || '') === '23505' || text.includes('duplicate key');
    return isUniqueViolation && (text.includes('public_slug') || text.includes('weddings_public_slug_unique_idx'));
}

export function isMissingPublicSlugColumnError(error: unknown) {
    if (!error || typeof error !== 'object') return false;
    const record = error as Record<string, unknown>;
    const text = `${record.code || ''} ${record.message || ''} ${record.details || ''} ${record.hint || ''}`.toLowerCase();
    return text.includes('public_slug') && (
        text.includes('schema cache') ||
        text.includes('column') ||
        text.includes('does not exist') ||
        text.includes('could not find') ||
        text.includes('pgrst204') ||
        text.includes('42703')
    );
}
