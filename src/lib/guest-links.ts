import { getWeddingPublicUrl } from '@/lib/wedding-slugs';

type GuestWedding = { id?: string | null; public_slug?: string | null; custom_domain?: string | null; planner_only?: boolean; rsvp_page_enabled?: boolean };
/** A disabled private workspace must never produce a guest-facing invitation link. */
export function getWeddingGuestUrl(base: string, wedding: GuestWedding): string | null {
    if (wedding.planner_only) return wedding.rsvp_page_enabled && wedding.id ? `${base.replace(/\/+$/, '')}/rsvp/${encodeURIComponent(wedding.id)}` : null;
    return getWeddingPublicUrl(base, wedding);
}
