import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getWeddingAccess } from '@/lib/wedding-access';
import { FREE_PLAN_LIMITS, hasPlannerProAccess } from '@/lib/planner-limits';
import { isKnownAdminEmail } from '@/lib/admin';
const schema = z.object({ weddingId: z.string().min(1).max(100), rows: z.array(z.object({ title: z.string().trim().min(1).max(200), template_key: z.string().min(1).max(100), section: z.string().min(1).max(100), due_date: z.string().nullable().optional(), assigned_to: z.string().max(200).nullable().optional() })).min(1).max(100) });
export async function POST(req: NextRequest) {
    const { user } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: 'Invalid checklist.' }, { status: 400 });
    try {
        const db = getSupabaseAdminClient() as any;
        const { wedding, canManage } = await getWeddingAccess(db, user, parsed.data.weddingId, { select: 'id,user_id,is_premium,payment_status' });
        if (!wedding || !canManage) return NextResponse.json({ error: 'Wedding not found or access denied.' }, { status: 403 });
        const { data: profile, error: profileError } = await db.from('user_app_profiles').select('is_pro,payment_status').eq('user_id', wedding.user_id).maybeSingle();
        if (profileError) throw profileError;
        const pro = hasPlannerProAccess({ wedding, accountProfile: profile, isAdmin: isKnownAdminEmail(user.email) });
        const { data, error } = await db.rpc('quickweds_seed_checklist', { p_wedding_id: wedding.id, p_rows: parsed.data.rows, p_limit: pro ? null : FREE_PLAN_LIMITS.checklistTasks });
        if (error) {
            if (String(error.message).includes('planner_limit_reached')) return NextResponse.json({ error: 'This checklist exceeds the remaining Free task allowance. Remove tasks or upgrade before adding the full checklist.' }, { status: 402 });
            throw error;
        }
        return NextResponse.json({ tasks: data || [] });
    } catch (error) {
        console.error('Checklist creation failed:', error);
        return NextResponse.json({ error: 'Unable to create the checklist. Please try again.' }, { status: 500 });
    }
}
