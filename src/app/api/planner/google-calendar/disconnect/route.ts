import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error }, { status: 401 });

    const { weddingId } = await req.json().catch(() => ({}));
    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required' }, { status: 400 });

    const db = getSupabaseAdminClient() as any;
    const { data: wedding } = await db.from('weddings').select('id, user_id').eq('id', weddingId).maybeSingle();
    if (!wedding || wedding.user_id !== user.id) {
        return NextResponse.json({ error: 'Only the wedding owner can disconnect Google Calendar' }, { status: 403 });
    }

    const { error: updateError } = await db
        .from('planner_google_calendar_connections')
        .update({
            access_token: null,
            refresh_token: null,
            revoked_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('wedding_id', weddingId)
        .eq('user_id', user.id);

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
