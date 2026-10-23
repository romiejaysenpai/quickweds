import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { isKnownAdminEmail } from '@/lib/admin';
const input = z.object({ requestId: z.string().uuid(), brideName: z.string().trim().min(1).max(100), groomName: z.string().trim().min(1).max(100) });
export async function POST(req: NextRequest) {
    const { user } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
    const parsed = input.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: 'Add both names to start your workspace.' }, { status: 400 });
    try {
        const db = getSupabaseAdminClient() as any;
        const { data: profile, error: profileError } = await db.from('user_app_profiles').select('is_pro,payment_status,account_type').eq('user_id', user.id).maybeSingle();
        if (profileError) throw profileError;
        if (profile?.account_type === 'supplier') return NextResponse.json({ error: 'Use your supplier dashboard.' }, { status: 403 });
        const pro = isKnownAdminEmail(user.email) || profile?.is_pro || profile?.payment_status === 'paid';
        const { data, error } = await db.rpc('quickweds_create_planning_workspace', { p_user_id: user.id, p_id: parsed.data.requestId, p_bride: parsed.data.brideName, p_groom: parsed.data.groomName, p_limit: pro ? null : 3 });
        if (error) {
            if (String(error.message).includes('website_limit_reached')) return NextResponse.json({ error: 'Free accounts include 3 active workspaces. Open an existing wedding or upgrade Account Pro.' }, { status: 402 });
            throw error;
        }
        return NextResponse.json({ id: data });
    } catch (error) {
        console.error('Planning workspace creation failed:', error);
        return NextResponse.json({ error: 'Unable to start this workspace. Please try again.' }, { status: 500 });
    }
}
