import 'server-only';

import {
    isMissingPublicSlugColumnError,
    isWeddingIdLike,
    sanitizeWeddingPublicIdentifier,
} from '@/lib/wedding-slugs';

type ResolveWeddingResult = {
    wedding: Record<string, any> | null;
    error: unknown;
};

function isDeleted(record: Record<string, any> | null) {
    return Boolean(record && 'deleted_at' in record && record.deleted_at);
}

async function queryById(db: any, identifier: string, select: string): Promise<ResolveWeddingResult> {
    const { data, error } = await db
        .from('weddings')
        .select(select)
        .eq('id', identifier)
        .maybeSingle();

    if (error) return { wedding: null, error };
    if (!data || isDeleted(data)) return { wedding: null, error: null };
    return { wedding: data, error: null };
}

async function queryBySlug(db: any, identifier: string, select: string): Promise<ResolveWeddingResult> {
    const { data, error } = await db
        .from('weddings')
        .select(select)
        .eq('public_slug', identifier)
        .maybeSingle();

    if (error) {
        if (isMissingPublicSlugColumnError(error)) return { wedding: null, error: null };
        return { wedding: null, error };
    }

    if (!data || isDeleted(data)) return { wedding: null, error: null };
    return { wedding: data, error: null };
}

export async function resolvePublicWeddingByIdentifier(
    db: any,
    rawIdentifier: string,
    select = '*'
): Promise<ResolveWeddingResult & { identifier: string }> {
    const identifier = sanitizeWeddingPublicIdentifier(rawIdentifier);
    if (!identifier) return { wedding: null, error: null, identifier: '' };

    if (isWeddingIdLike(identifier)) {
        const byId = await queryById(db, identifier, select);
        if (byId.error || byId.wedding) return { ...byId, identifier };
    }

    const bySlug = await queryBySlug(db, identifier, select);
    if (bySlug.error || bySlug.wedding) return { ...bySlug, identifier };

    if (!isWeddingIdLike(identifier)) return { wedding: null, error: null, identifier };

    return { wedding: null, error: null, identifier };
}
