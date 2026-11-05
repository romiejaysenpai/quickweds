import { NextResponse, type NextRequest } from 'next/server';
import { getAuthenticatedRequest } from '@/lib/api-rate-limit';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { sanitizeWeddingId } from '@/lib/rate-limiter';
import { isMissingPublicSlugColumnError, sanitizeWeddingSlug } from '@/lib/wedding-slugs';

export const dynamic = 'force-dynamic';

const MAX_CANDIDATES = 12;

/**
 * Returns the first public slug candidate not used by another wedding.
 *
 * This must run server-side: weddings RLS only exposes a user's own rows, so a
 * browser query cannot see slugs owned by other couples (which previously led to
 * "duplicate key value violates unique constraint weddings_public_slug_unique_idx").
 * Only slug existence is revealed, and slugs are already public URLs.
 */
export async function POST(req: NextRequest) {
    const auth = await getAuthenticatedRequest(req, 'AUTHENTICATED_DEFAULT');
    if (auth.response) return auth.response;
    const { user } = auth;

    const body = await req.json().catch(() => ({}));
    const weddingId = sanitizeWeddingId(String(body?.weddingId || ''));
    const rawCandidates: unknown[] = Array.isArray(body?.candidates) ? body.candidates.slice(0, MAX_CANDIDATES) : [];
    const candidates = Array.from(new Set(
        rawCandidates
            .map((value) => (typeof value === 'string' ? sanitizeWeddingSlug(value) : ''))
            .filter((value) => value.length > 0)
    ));

    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });
    if (candidates.length === 0) return NextResponse.json({ slug: null });

    try {
        const db = getSupabaseAdminClient();
        // Include soft-deleted weddings: they still hold their slug in the unique index.
        const { data, error } = await db
            .from('weddings')
            .select('id, user_id, public_slug')
            .in('public_slug', candidates);

        if (error) {
            if (isMissingPublicSlugColumnError(error)) return NextResponse.json({ slug: null, supported: false });
            throw error;
        }

        const holders = new Map<string, { id: string; user_id: string | null }>();
        for (const row of (data || []) as Array<{ id: string; user_id: string | null; public_slug: string }>) {
            holders.set(row.public_slug, row);
        }

        const slug = candidates.find((candidate) => {
            const holder = holders.get(candidate);
            return !holder || (holder.id === weddingId && holder.user_id === user.id);
        }) || null;

        return NextResponse.json({ slug });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to check slug availability.';
        console.error('Wedding slug availability check failed:', message);
        return NextResponse.json({ error: 'Unable to check slug availability.' }, { status: 500 });
    }
}
