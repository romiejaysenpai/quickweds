import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { buildGoogleCalendarAuthUrl, createGoogleCalendarState } from '@/lib/google-calendar';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error }, { status: 401 });

    const weddingId = new URL(req.url).searchParams.get('weddingId');
    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required' }, { status: 400 });

    const db = getSupabaseAdminClient() as any;
    const { data: wedding, error: weddingError } = await db
        .from('weddings')
        .select('id, user_id')
        .eq('id', weddingId)
        .maybeSingle();

    if (weddingError || !wedding || wedding.user_id !== user.id) {
        return NextResponse.json({ error: 'Only the wedding owner can connect Google Calendar' }, { status: 403 });
    }

    try {
        const state = createGoogleCalendarState({ weddingId, userId: user.id });
        return NextResponse.json({ url: buildGoogleCalendarAuthUrl(state) });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to start Google Calendar connection';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
