import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

type PlannerAccessRole = 'owner' | 'partner' | 'coordinator' | 'pending' | 'denied';

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
        const { data: wedding, error: weddingError } = await db
            .from('weddings')
            .select('id, user_id, total_budget, currency, guest_limit, is_premium, plan_type')
            .eq('id', weddingId)
            .is('deleted_at', null)
            .single();

        if (weddingError || !wedding) {
            return NextResponse.json({ error: 'Wedding not found', accessRole: 'denied' }, { status: 404 });
        }

        const isAdmin = isKnownAdminEmail(user.email);
        let accessRole: PlannerAccessRole = 'denied';

        if (wedding.user_id === user.id || isAdmin) {
            accessRole = 'owner';
        } else if (user.email) {
            const { data: collaborator } = await db
                .from('wedding_collaborators')
                .select('status, role')
                .eq('wedding_id', weddingId)
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
            db.from('planner_tasks').select('*').eq('wedding_id', weddingId).order('created_at', { ascending: false }),
            db.from('planner_budgets').select('*').eq('wedding_id', weddingId).order('created_at', { ascending: false }),
            db.from('planner_vendors').select('*').eq('wedding_id', weddingId),
            db.from('rsvps').select('num_guests, rsvp_status, attendance').eq('wedding_id', weddingId),
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
            tasks: tasksRes.data || [],
            budgets: budgetsRes.data || [],
            vendors: vendorsRes.data || [],
            confirmedGuests,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load planner data';
        return NextResponse.json({ error: message, accessRole: 'denied' }, { status: 500 });
    }
}
