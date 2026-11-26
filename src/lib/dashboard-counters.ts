import 'server-only';

import { redisDel, redisJsonGet, redisJsonSet } from '@/lib/redis';
import { guestPartySize, isGuestAttending } from '@/lib/guest-counts';

export type DashboardCounters = {
    confirmed: number;
    declined: number;
    pending: number;
    totalGuests: number;
    totalRsvps: number;
    checkedInGuests: number;
    photoUploadCount: number;
    vipCount: number;
    tableFill: Array<{
        tableName: string;
        assignedGuests: number;
        capacity: number | null;
        fillPercent: number | null;
    }>;
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

    const [rsvpsRes, photosRes, tablesRes] = await Promise.all([
        db
            .from('rsvps')
            .select('num_guests, rsvp_status, attendance, checked_in_at, meal_preference, guest_group, table_assignment, plus_one_allowed, plus_one_name, plus_one_rsvp_status')
            .eq('wedding_id', weddingId),
        db
            .from('wedding_photos')
            .select('id', { count: 'exact', head: true })
            .eq('wedding_id', weddingId),
        db
            .from('seating_tables')
            .select('table_name, capacity')
            .eq('wedding_id', weddingId),
    ]);

    if (rsvpsRes.error) throw rsvpsRes.error;
    if (photosRes.error) throw photosRes.error;
    if (tablesRes.error) throw tablesRes.error;

    const rsvps = rsvpsRes.data || [];
    const mealChoices: Record<string, number> = {};
    const assignedByTable = new Map<string, number>();
    const tableCapacities = new Map<string, number | null>();
    let confirmed = 0;
    let declined = 0;
    let pending = 0;
    let totalGuests = 0;
    let checkedInGuests = 0;
    let vipCount = 0;

    for (const table of tablesRes.data || []) {
        tableCapacities.set(String(table.table_name || '').trim(), table.capacity == null ? null : Number(table.capacity));
    }

    for (const rsvp of rsvps) {
        const status = rsvp.rsvp_status || (rsvp.attendance === 'Yes' ? 'confirmed' : rsvp.attendance === 'No' ? 'declined' : 'pending');
        const isDeclined = status === 'declined' || rsvp.attendance === 'No';
        const attending = isGuestAttending(rsvp);
        const partySize = isDeclined ? 0 : guestPartySize(rsvp);

        if (attending) {
            confirmed += 1;
            totalGuests += partySize;
        } else if (isDeclined) {
            declined += 1;
        } else {
            pending += 1;
        }

        if (rsvp.checked_in_at && !isDeclined) checkedInGuests += 1;
        if (String(rsvp.guest_group || '').toLowerCase() === 'vip') vipCount += 1;

        if (!isDeclined) {
            const tableName = String(rsvp.table_assignment || '').trim();
            if (tableName && partySize > 0) {
                assignedByTable.set(tableName, (assignedByTable.get(tableName) || 0) + partySize);
                if (!tableCapacities.has(tableName)) tableCapacities.set(tableName, null);
            }

            if (attending) {
                const meal = rsvp.meal_preference || 'No Preference';
                mealChoices[meal] = (mealChoices[meal] || 0) + Math.max(1, partySize);
            }
        }
    }

    const tableFill = Array.from(tableCapacities.entries())
        .filter(([tableName]) => tableName)
        .map(([tableName, capacity]) => {
            const assignedGuests = assignedByTable.get(tableName) || 0;
            return {
                tableName,
                assignedGuests,
                capacity,
                fillPercent: capacity && capacity > 0 ? Math.round((assignedGuests / capacity) * 100) : null,
            };
        })
        .sort((a, b) => a.tableName.localeCompare(b.tableName));

    const counters: DashboardCounters = {
        confirmed,
        declined,
        pending,
        totalGuests,
        totalRsvps: rsvps.length,
        checkedInGuests,
        photoUploadCount: Number(photosRes.count || 0),
        vipCount,
        tableFill,
        mealChoices,
        cachedAt: new Date().toISOString(),
    };

    await redisJsonSet(key, counters, DASHBOARD_COUNTER_TTL_SECONDS);
    return counters;
}

export async function invalidateDashboardCounters(weddingId: string) {
    await redisDel(dashboardCountersKey(weddingId));
}
