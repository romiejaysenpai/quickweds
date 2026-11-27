import 'server-only';

import { resolvePublicWeddingById } from '@/lib/public-wedding-lookup';
import { sanitizeWeddingPublicIdentifier } from '@/lib/wedding-slugs';

/** RSVP publication is separate from publication of a full wedding website. */
export async function resolveRsvpWeddingById(db: any, id: string, select = 'id') {
    const published = await resolvePublicWeddingById(db, id, select);
    if (published.error || published.wedding) return published;

    // Never remove these filters in legacy/schema-error fallbacks: a private
    // workspace must explicitly publish RSVP before any guest endpoint uses it.
    const result = await db.from('weddings').select(select)
        .eq('id', id).is('deleted_at', null)
        .eq('planner_only', true).eq('rsvp_page_enabled', true).maybeSingle();
    if (result.error && ['42703', 'PGRST204'].includes(result.error.code)) return { wedding: null, error: null };
    return { wedding: result.data || null, error: result.error };
}

export const RSVP_PAGE_COLUMNS = 'id,bride_name,groom_name,wedding_date,wedding_time,venue_name,rsvp_deadline,motif_color,hero_image,rsvp_events,rsvp_allow_plus_ones,rsvp_allow_children,rsvp_search_guest_list,external_website_url';

export async function getRsvpPageWedding(db: any, rawId: string) {
    const id = sanitizeWeddingPublicIdentifier(rawId);
    if (!id) return { wedding: null, error: null };
    return resolveRsvpWeddingById(db, id, RSVP_PAGE_COLUMNS);
}
