import { NextResponse } from 'next/server';
import { exchangeGoogleCalendarCode, verifyGoogleCalendarState } from '@/lib/google-calendar';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getPublicAppUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
        return NextResponse.redirect(`${getPublicAppUrl()}/dashboard?googleCalendar=${encodeURIComponent(error)}`);
    }

    try {
        if (!code || !state) throw new Error('Missing Google Calendar authorization response');
        const payload = verifyGoogleCalendarState(state);
        const tokens = await exchangeGoogleCalendarCode(code);
        const db = getSupabaseAdminClient() as any;
        const expiresAt = tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null;

        const { data: existing } = await db
            .from('planner_google_calendar_connections')
            .select('refresh_token')
            .eq('wedding_id', payload.weddingId)
            .eq('user_id', payload.userId)
            .maybeSingle();

        const { error: upsertError } = await db
            .from('planner_google_calendar_connections')
            .upsert({
                wedding_id: payload.weddingId,
                user_id: payload.userId,
                google_calendar_id: 'primary',
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token || existing?.refresh_token || null,
                token_expires_at: expiresAt,
                scope: tokens.scope || null,
                revoked_at: null,
                connected_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }, { onConflict: 'wedding_id,user_id' });

        if (upsertError) throw upsertError;

        return NextResponse.redirect(`${getPublicAppUrl()}/dashboard/${payload.weddingId}/planner?tab=calendar&google=connected`);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to connect Google Calendar';
        return NextResponse.redirect(`${getPublicAppUrl()}/dashboard?googleCalendarError=${encodeURIComponent(message)}`);
    }
}
