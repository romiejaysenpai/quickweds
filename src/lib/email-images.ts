import 'server-only';

/**
 * Shared helpers for resolving wedding-owned images used in email headers.
 *
 * The image is always sourced from the `wedding` row that the email belongs to
 * (the RSVP guest's wedding), so it can never leak another couple's photo.
 * `hero_image` is the builder's hero image and is always preferred; the other
 * fields are only used as a fallback for weddings that never set a hero image.
 * We never fall back to generic QuickWeds marketing artwork.
 */

export function getRootDomain() {
    return process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'quickweds.site';
}

function collectImageCandidates(value: unknown): string[] {
    if (!value) return [];

    if (Array.isArray(value)) {
        return value.flatMap((item) => collectImageCandidates(item));
    }

    if (typeof value === 'object') {
        const record = value as Record<string, unknown>;
        return collectImageCandidates(record.url || record.src || record.image || record.photo);
    }

    if (typeof value !== 'string') return [];

    const trimmed = value.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        try {
            return collectImageCandidates(JSON.parse(trimmed));
        } catch {
            return [trimmed];
        }
    }

    return [trimmed];
}

function normalizeEmailImageUrl(url: string, rootDomain: string) {
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('//')) return `https:${url}`;
    if (url.startsWith('/')) return `https://${rootDomain}${url}`;
    return '';
}

/**
 * Resolve the best wedding-owned image for an email header.
 * Prefers the builder hero image, then other couple-owned images.
 */
export function getWeddingConfirmationImageUrl(wedding: Record<string, unknown> | null | undefined): string {
    if (!wedding) return '';

    const rootDomain = getRootDomain();
    const fields = [
        wedding.hero_image,
        wedding.couple_photo,
        wedding.gallery_images,
        wedding.invitation_image,
        wedding.reception_venue_photos,
    ];

    for (const field of fields) {
        for (const candidate of collectImageCandidates(field)) {
            const normalized = normalizeEmailImageUrl(candidate, rootDomain);
            if (normalized) return normalized;
        }
    }

    return '';
}