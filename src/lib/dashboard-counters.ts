import 'server-only';

import { redisDel, redisJsonGet, redisJsonSet } from '@/lib/redis';

export type DashboardCounters = {
    confirmed: number;
    declined: number;
    pending: number;
    totalGuests: number;
    totalRsvps: number;
    checkedInGuests: number;
    photoUploadCount: number;
    mealChoices: Record<string, number>;
    cachedAt: string;
};

const DASHBOARD_COUNTER_TTL_SECONDS = 2 * 60;

export function dashboardCountersKey(weddingId: string) {
    return `quickweds:dashboard:counters:${weddingId}`;
}

export async function getDashboardCounters(db: any, weddingId: string): Promise<DashboardCounters> {
    const key = dashboardCountersKey(weddingId);
    const cached = await redisJsonGet<DashboardCounters>(key);
    if (cached) return cached;

    const [rsvpsRes, photosRes] = await Promise.all([
        db
            .from('rsvps')
            .select('num_guests, rsvp_status, attendance, checked_in_at, meal_preference')
            .eq('wedding_id', weddingId),
        db
            .from('wedding_photos')
            .select('id', { count: 'exact', head: true })
            .eq('wedding_id', weddingId),
    ]);

    if (rsvpsRes.error) throw rsvpsRes.error;
    if (photosRes.error) throw photosRes.error;

    const rsvps = rsvpsRes.data || [];
    const mealChoices: Record<string, number> = {};
    let confirmed = 0;
    let declined = 0;
    let pending = 0;
    let totalGuests = 0;
    let checkedInGuests = 0;

    for (const rsvp of rsvps) {
        const status = rsvp.rsvp_status || (rsvp.attendance === 'Yes' ? 'confirmed' : rsvp.attendance === 'No' ? 'declined' : 'pending');
        if (status === 'confirmed' || rsvp.attendance === 'Yes') {
            confirmed += 1;
            totalGuests += Number(rsvp.num_guests || 1);
        } else if (status === 'declined' || rsvp.attendance === 'No') {
            declined += 1;
        } else {
            pending += 1;
        }

        if (rsvp.checked_in_at) checkedInGuests += 1;
        const meal = rsvp.meal_preference || 'No Preference';
        mealChoices[meal] = (mealChoices[meal] || 0) + 1;
    }

    const counters: DashboardCounters = {
        confirmed,
        declined,
        pending,
        totalGuests,
        totalRsvps: rsvps.length,
        checkedInGuests,
        photoUploadCount: Number(photosRes.count || 0),
        mealChoices,
        cachedAt: new Date().toISOString(),
    };

    await redisJsonSet(key, counters, DASHBOARD_COUNTER_TTL_SECONDS);
    return counters;
}

export async function invalidateDashboardCounters(weddingId: string) {
    await redisDel(dashboardCountersKey(weddingId));
}
