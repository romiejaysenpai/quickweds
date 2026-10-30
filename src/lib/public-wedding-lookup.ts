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

function getMissingWeddingColumn(error: unknown, select?: string) {
    if (!error || typeof error !== 'object') return '';

    const record = error as Record<string, unknown>;
    const text = `${record.code || ''} ${record.message || ''} ${record.details || ''} ${record.hint || ''}`;
    const normalized = text.toLowerCase();

    if (
        !normalized.includes('weddings.') &&
        !normalized.includes('column') &&
        !normalized.includes('schema cache') &&
        !normalized.includes('does not exist') &&
        !normalized.includes('could not find') &&
        !normalized.includes('42703') &&
        !normalized.includes('pgrst204')
    ) {
        return '';
    }

    const match = text.match(/weddings\.([a-z0-9_]+)/i) ||
        text.match(/column "?([a-z0-9_]+)"? does not exist/i) ||
        text.match(/could not find the '([a-z0-9_]+)' column/i);

    if (match?.[1]) return match[1];

    if (select) {
        const columns = select.split(',').map((c) => c.trim().toLowerCase());
        const found = columns.find((c) => c && normalized.includes(c));
        if (found) return found;
    }

    return '';
}

function selectWithoutColumn(select: string, column: string) {
    if (select === '*') return select;

    return select
        .split(',')
        .map((field) => field.trim())
        .filter((field) => field && field.toLowerCase() !== column.toLowerCase())
        .join(',');
}

function isDeleted(record: Record<string, any> | null) {
    return Boolean(record && 'deleted_at' in record && record.deleted_at);
}

// Only a database-confirmed absent column permits legacy mode. Permission and
// schema-cache failures must keep the privacy filter and fail closed.
function isMissingPlannerOnlyColumn(error: unknown) {
    if (!error || typeof error !== 'object') return false;
    const record = error as { code?: string; message?: string };
    return record.code === '42703' && typeof record.message === 'string' && /^column "?weddings"?\."?planner_only"? does not exist$/i.test(record.message);
}

async function queryById(db: any, identifier: string, select: string, legacySchema = false): Promise<ResolveWeddingResult> {
    let query = db
        .from('weddings')
        .select(select)
        .eq('id', identifier)
        .is('deleted_at', null);
    if (!legacySchema) query = query.eq('planner_only', false);
    const { data, error } = await query.maybeSingle();

    if (error) {
        if (!legacySchema && isMissingPlannerOnlyColumn(error)) return queryById(db, identifier, selectWithoutColumn(select, 'planner_only'), true);
        const missingColumn = isMissingPublicSlugColumnError(error)
            ? 'public_slug'
            : getMissingWeddingColumn(error, select);
        const fallbackSelect = missingColumn ? selectWithoutColumn(select, missingColumn) : select;
        if (fallbackSelect && fallbackSelect !== select) {
            return queryById(db, identifier, fallbackSelect, legacySchema);
        }
    }

    if (error) return { wedding: null, error };
    if (!data || isDeleted(data) || data.planner_only === true) return { wedding: null, error: null };
    return { wedding: data, error: null };
}

async function queryBySlug(db: any, identifier: string, select: string, legacySchema = false): Promise<ResolveWeddingResult> {
    let query = db
        .from('weddings')
        .select(select)
        .eq('public_slug', identifier)
        .is('deleted_at', null);
    if (!legacySchema) query = query.eq('planner_only', false);
    const { data, error } = await query.maybeSingle();

    if (error) {
        if (!legacySchema && isMissingPlannerOnlyColumn(error)) return queryBySlug(db, identifier, selectWithoutColumn(select, 'planner_only'), true);
        if (isMissingPublicSlugColumnError(error)) return { wedding: null, error: null };
        const missingColumn = getMissingWeddingColumn(error, select);
        const fallbackSelect = missingColumn ? selectWithoutColumn(select, missingColumn) : select;
        if (fallbackSelect && fallbackSelect !== select) {
            return queryBySlug(db, identifier, fallbackSelect, legacySchema);
        }
        return { wedding: null, error };
    }

    if (!data || isDeleted(data) || data.planner_only === true) return { wedding: null, error: null };
    return { wedding: data, error: null };
}

export async function resolvePublicWeddingById(
    db: any,
    weddingId: string,
    select = '*'
): Promise<ResolveWeddingResult> {
    const raw = String(weddingId || '').trim();
    if (!raw) return { wedding: null, error: null };
    return queryById(db, raw, select);
}

export async function resolvePublicWeddingByIdentifier(
    db: any,
    rawIdentifier: string,
    select = '*'
): Promise<ResolveWeddingResult & { identifier: string }> {
    const raw = String(rawIdentifier || '').trim();
    if (!raw) return { wedding: null, error: null, identifier: '' };

    if (isWeddingIdLike(raw)) {
        const byId = await queryById(db, raw, select);
        if (byId.error || byId.wedding) return { ...byId, identifier: raw };
    }

    const identifier = sanitizeWeddingPublicIdentifier(raw);
    if (!identifier) return { wedding: null, error: null, identifier: '' };

    if (identifier !== raw && isWeddingIdLike(identifier)) {
        const byId = await queryById(db, identifier, select);
        if (byId.error || byId.wedding) return { ...byId, identifier };
    }

    const bySlug = await queryBySlug(db, identifier, select);
    if (bySlug.error || bySlug.wedding) return { ...bySlug, identifier };

    if (!isWeddingIdLike(identifier)) return { wedding: null, error: null, identifier };

    return { wedding: null, error: null, identifier };
}
