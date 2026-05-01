import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

type PlannerAccessRole = 'owner' | 'partner' | 'coordinator' | 'pending' | 'denied';

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

        if (accessRole !== 'owner') {
            return NextResponse.json({ accessRole, wedding, tasks: [], budgets: [], vendors: [], confirmedGuests: 0 });
        }

        const [tasksRes, budgetsRes, vendorsRes, rsvpsRes] = await Promise.all([
            db.from('planner_tasks').select('*').eq('wedding_id', resolvedWeddingId).order('created_at', { ascending: false }),
            db.from('planner_budgets').select('*').eq('wedding_id', resolvedWeddingId).order('created_at', { ascending: false }),
            db.from('planner_vendors').select('*').eq('wedding_id', resolvedWeddingId),
            db.from('rsvps').select('num_guests, rsvp_status, attendance').eq('wedding_id', resolvedWeddingId),
        ]);

        if (tasksRes.error) throw tasksRes.error;
        if (budgetsRes.error) throw budgetsRes.error;
        if (vendorsRes.error) throw vendorsRes.error;
        if (rsvpsRes.error) throw rsvpsRes.error;

        const confirmedGuests = (rsvpsRes.data || [])
            .filter((rsvp: any) => rsvp.rsvp_status === 'confirmed' || rsvp.rsvp_status === 'confirmed_manual' || rsvp.attendance === 'Yes')
            .reduce((count: number, rsvp: any) => count + (rsvp.num_guests || 1), 0);

        return NextResponse.json({
            accessRole,
            wedding,
            requestedWeddingId: weddingId,
            resolvedWeddingId,
            tasks: tasksRes.data || [],
            budgets: budgetsRes.data || [],
            vendors: vendorsRes.data || [],
            confirmedGuests,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load planner data';
        const code = message.includes('Missing Supabase admin configuration')
            ? 'server_config_missing'
            : 'planner_load_failed';

        return NextResponse.json({ error: message, code, accessRole: 'denied' }, { status: 500 });
    }
}
