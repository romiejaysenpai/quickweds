import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { EMPTY_PLANNER_USAGE, getPlannerUsage } from '@/lib/planner-limits';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PlannerAccessRole = 'owner' | 'partner' | 'coordinator' | 'pending' | 'denied';

const WEDDING_REQUIRED_COLUMNS = [
    'id',
    'user_id',
] as const;

const WEDDING_OPTIONAL_COLUMNS = [
    'bride_name',
    'groom_name',
    'wedding_date',
    'wedding_time',
    'venue_name',
    'venue_address',
    'template',
    'hero_image',
    'custom_domain',
    'public_slug',
    'is_published',
    'total_budget',
    'currency',
    'guest_limit',
    'notify_on_rsvp',
    'notify_on_updates',
    'is_premium',
    'payment_status',
    'deleted_at',
    'public_seat_finder_token',
    'seat_finder_enabled',
    'planner_calendar_token',
] as const;

const WEDDING_OPTIONAL_COLUMN_SET = new Set<string>(WEDDING_OPTIONAL_COLUMNS);

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

function getMissingColumnName(error: any) {
    const text = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`;
    const quotedMatch = text.match(/'([^']+)'\s+column/i);
    if (quotedMatch?.[1]) return quotedMatch[1];

    const qualifiedMatch = text.match(/column\s+(?:public\.)?(?:weddings\.)?([a-zA-Z0-9_]+)\s+does not exist/i);
    if (qualifiedMatch?.[1]) return qualifiedMatch[1];

    const unqualifiedMatch = text.match(/column\s+([a-zA-Z0-9_]+)\s+does not exist/i);
    if (unqualifiedMatch?.[1]) return unqualifiedMatch[1];

    return null;
}

async function findWeddingById(db: any, weddingId: string) {
    const omittedColumns = new Set<string>();
    let includeDeletedAtFilter = true;

    for (let attempt = 0; attempt < WEDDING_OPTIONAL_COLUMNS.length + 3; attempt += 1) {
        const selectColumns = [
            ...WEDDING_REQUIRED_COLUMNS,
            ...WEDDING_OPTIONAL_COLUMNS.filter((column) => !omittedColumns.has(column)),
        ].join(', ');

        let query = db
            .from('weddings')
            .select(selectColumns)
            .eq('id', weddingId);

        if (includeDeletedAtFilter && !omittedColumns.has('deleted_at')) {
            query = query.is('deleted_at', null);
        }

        const { data, error } = await query.maybeSingle();
        if (!error) return { wedding: data, error: null };

        if (!isSchemaMissingError(error)) {
            return { wedding: null, error };
        }

        const missingColumn = getMissingColumnName(error);
        if (missingColumn && WEDDING_OPTIONAL_COLUMN_SET.has(missingColumn) && !omittedColumns.has(missingColumn)) {
            omittedColumns.add(missingColumn);
            console.warn(`Planner wedding lookup retrying without missing weddings.${missingColumn} column.`);
            continue;
        }

        if (includeDeletedAtFilter) {
            includeDeletedAtFilter = false;
            omittedColumns.add('deleted_at');
            console.warn('Planner wedding lookup retrying without deleted_at filter.');
            continue;
        }

        return { wedding: null, error };
    }

    return { wedding: null, error: new Error('Unable to load wedding after retrying optional schema columns.') };
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
            return NextResponse.json({ accessRole }, { status: 403 });
        }

        const accountProfile = await safePlannerMaybeSingle(
            db
                .from('user_app_profiles')
                .select('is_pro, plan_type, payment_status')
                .eq('user_id', user.id)
                .maybeSingle(),
            'account profile'
        );

        const entourageInvitationsForAccess = await safePlannerList(
            db
                .from('entourage_invitations')
                .select('id, wedding_id, member_key, name, email, role, message, template_key, status, sent_at, responded_at, created_at, updated_at')
                .eq('wedding_id', resolvedWeddingId)
                .order('created_at', { ascending: false }),
            'entourage invitations'
        );

        if (accessRole !== 'owner') {
            return NextResponse.json({ accessRole, wedding, accountProfile, planUsage: EMPTY_PLANNER_USAGE, tasks: [], budgets: [], vendors: [], events: [], foodDrinks: [], googleCalendar: null, honeymoonItems: [], confirmedGuests: 0, entourageInvitations: entourageInvitationsForAccess });
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

        const planUsage = await getPlannerUsage(db, resolvedWeddingId);

        return NextResponse.json({
            accessRole,
            wedding,
            accountProfile,
            planUsage,
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
            entourageInvitations: entourageInvitationsForAccess,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : (typeof err === 'object' && err ? JSON.stringify(err) : 'Unable to load planner data');
        const code = message.includes('Missing Supabase admin configuration')
            ? 'server_config_missing'
            : 'planner_load_failed';

        return NextResponse.json({ error: message, code, accessRole: 'denied' }, { status: 500 });
    }
}
