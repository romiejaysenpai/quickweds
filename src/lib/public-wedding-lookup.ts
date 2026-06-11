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

function getMissingWeddingColumn(error: unknown) {
    if (!error || typeof error !== 'object') return '';

    const record = error as Record<string, unknown>;
    const text = `${record.code || ''} ${record.message || ''} ${record.details || ''} ${record.hint || ''}`;
    const normalized = text.toLowerCase();

    if (
        !normalized.includes('weddings.') ||
        !(
            normalized.includes('column') ||
            normalized.includes('schema cache') ||
            normalized.includes('does not exist') ||
            normalized.includes('could not find') ||
            normalized.includes('42703') ||
            normalized.includes('pgrst204')
        )
    ) {
        return '';
    }

    return text.match(/weddings\.([a-z0-9_]+)/i)?.[1] || '';
}

function selectWithoutColumn(select: string, column: string) {
    if (select === '*') return select;

    return select
        .split(',')
        .map((field) => field.trim())
        .filter((field) => field && field !== column)
        .join(',');
}

function isDeleted(record: Record<string, any> | null) {
    return Boolean(record && 'deleted_at' in record && record.deleted_at);
}

async function queryById(db: any, identifier: string, select: string): Promise<ResolveWeddingResult> {
    const { data, error } = await db
        .from('weddings')
        .select(select)
        .eq('id', identifier)
        .maybeSingle();

    if (error) {
        const missingColumn = isMissingPublicSlugColumnError(error)
            ? 'public_slug'
            : getMissingWeddingColumn(error);
        const fallbackSelect = missingColumn ? selectWithoutColumn(select, missingColumn) : select;
        if (fallbackSelect && fallbackSelect !== select) {
            return queryById(db, identifier, fallbackSelect);
        }
    }

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
        const missingColumn = getMissingWeddingColumn(error);
        const fallbackSelect = missingColumn ? selectWithoutColumn(select, missingColumn) : select;
        if (fallbackSelect && fallbackSelect !== select) {
            return queryBySlug(db, identifier, fallbackSelect);
        }
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
