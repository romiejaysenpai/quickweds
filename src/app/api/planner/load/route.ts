import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PlannerAccessRole = 'owner' | 'partner' | 'coordinator' | 'pending' | 'denied';

function isSchemaMissingError(error: any) {
    const text = `${error?.code || ''} ${error?.message || ''} ${error?.details || ''}`.toLowerCase();
    return (
        text.includes('schema cache') ||
        text.includes('does not exist') ||
        text.includes('could not find') ||
        text.includes('column') ||
        error?.code === 'PGRST204' ||
        error?.code === 'PGRST205' ||
        error?.code === '42P01' ||
        error?.code === '42703'
    );
}

async function safePlannerList(query: any, label: string) {
    const result = await query;
    if (result.error) {
        if (isSchemaMissingError(result.error)) {
            console.warn(`Planner load skipped ${label}:`, result.error.message || result.error);
            return [];
        }

        throw result.error;
    }

    return result.data || [];
}

async function safePlannerMaybeSingle(query: any, label: string) {
    const result = await query;
    if (result.error) {
        if (isSchemaMissingError(result.error)) {
            console.warn(`Planner load skipped ${label}:`, result.error.message || result.error);
            return null;
        }

        throw result.error;
    }

    return result.data || null;
}

async function findWeddingById(db: any, weddingId: string) {
    const baseQuery = () => db
        .from('weddings')
        .select('*')
        .eq('id', weddingId);

    const { data, error } = await baseQuery()
        .is('deleted_at', null)
        .maybeSingle();

    if (!error) return { wedding: data, error: null };

    const message = String(error.message || '');
    const shouldRetryWithoutDeletedAt =
        message.includes('deleted_at') ||
        message.includes('schema cache') ||
        message.includes('column') ||
        error.code === 'PGRST204';

    if (!shouldRetryWithoutDeletedAt) {
        return { wedding: null, error };
    }

    const fallback = await baseQuery().maybeSingle();
    return { wedding: fallback.data, error: fallback.error };
}

export async function GET(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) {
        return NextResponse.json({ error, accessRole: 'denied' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const weddingId = searchParams.get('weddingId');

    if (!weddingId) {
        return NextResponse.json({ error: 'Wedding ID is required', accessRole: 'denied' }, { status: 400 });
    }

    try {
        const db = getSupabaseAdminClient() as any;
        const { wedding, error: weddingError } = await findWeddingById(db, weddingId);

        if (weddingError || !wedding) {
            return NextResponse.json({
                error: weddingError?.message || `Wedding not found for ID: ${weddingId}`,
                code: 'wedding_not_found',
                accessRole: 'denied',
                requestedWeddingId: weddingId,
                supabaseProject: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').split('.')[0] || null,
            }, { status: 404 });
        }

        const resolvedWeddingId = wedding.id;
        const isAdmin = isKnownAdminEmail(user.email);
        let accessRole: PlannerAccessRole = 'denied';

        if (wedding.user_id === user.id || isAdmin) {
            accessRole = 'owner';
        } else if (user.email) {
            const { data: collaborator } = await db
                .from('wedding_collaborators')
                .select('status, role')
                .eq('wedding_id', resolvedWeddingId)
                .eq('email', user.email.toLowerCase())
                .maybeSingle();

            if (collaborator) {
                accessRole = collaborator.status === 'accepted' ? collaborator.role : 'pending';
            }
        }

        if (accessRole === 'pending' || accessRole === 'denied') {
            return NextResponse.json({ accessRole, wedding }, { status: 403 });
        }

        const accountProfile = await safePlannerMaybeSingle(
            db
                .from('user_app_profiles')
                .select('is_pro, plan_type, payment_status')
                .eq('user_id', user.id)
                .maybeSingle(),
            'account profile'
        );

        if (accessRole !== 'owner') {
            return NextResponse.json({ accessRole, wedding, accountProfile, tasks: [], budgets: [], vendors: [], events: [], foodDrinks: [], googleCalendar: null, honeymoonItems: [], confirmedGuests: 0 });
        }

        const [tasks, budgets, vendors, events, foodDrinks, googleCalendarConnection, honeymoonItems, rsvps] = await Promise.all([
            safePlannerList(db.from('planner_tasks').select('*').eq('wedding_id', resolvedWeddingId).order('created_at', { ascending: false }), 'checklist tasks'),
            safePlannerList(db.from('planner_budgets').select('*').eq('wedding_id', resolvedWeddingId).order('created_at', { ascending: false }), 'budgets'),
            safePlannerList(db.from('planner_vendors').select('*').eq('wedding_id', resolvedWeddingId), 'vendors'),
            safePlannerList(db.from('planner_events').select('*').eq('wedding_id', resolvedWeddingId).order('starts_at', { ascending: true }), 'calendar events'),
            safePlannerList(db.from('planner_food_drinks').select('*').eq('wedding_id', resolvedWeddingId).order('created_at', { ascending: false }), 'food and drinks'),
            safePlannerMaybeSingle(db.from('planner_google_calendar_connections').select('connected_at, last_synced_at, google_calendar_id, revoked_at').eq('wedding_id', resolvedWeddingId).eq('user_id', user.id).is('revoked_at', null).maybeSingle(), 'Google calendar connection'),
            safePlannerList(db.from('planner_honeymoon_items').select('*').eq('wedding_id', resolvedWeddingId).order('created_at', { ascending: false }), 'honeymoon items'),
            safePlannerList(db.from('rsvps').select('num_guests, rsvp_status, attendance').eq('wedding_id', resolvedWeddingId), 'RSVPs'),
        ]);

        const confirmedGuests = rsvps
            .filter((rsvp: any) => rsvp.rsvp_status === 'confirmed' || rsvp.rsvp_status === 'confirmed_manual' || rsvp.attendance === 'Yes')
            .reduce((count: number, rsvp: any) => count + (rsvp.num_guests || 1), 0);

        return NextResponse.json({
            accessRole,
            wedding,
            accountProfile,
            requestedWeddingId: weddingId,
            resolvedWeddingId,
            tasks,
            budgets,
            vendors,
            events,
            foodDrinks,
            googleCalendar: googleCalendarConnection ? {
                connected: true,
                connectedAt: googleCalendarConnection.connected_at,
                lastSyncedAt: googleCalendarConnection.last_synced_at,
                calendarId: googleCalendarConnection.google_calendar_id,
            } : { connected: false },
            honeymoonItems,
            confirmedGuests,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : (typeof err === 'object' && err ? JSON.stringify(err) : 'Unable to load planner data');
        const code = message.includes('Missing Supabase admin configuration')
            ? 'server_config_missing'
            : 'planner_load_failed';

        return NextResponse.json({ error: message, code, accessRole: 'denied' }, { status: 500 });
    }
}
