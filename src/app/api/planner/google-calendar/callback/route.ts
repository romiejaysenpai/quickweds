import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
    encryptGoogleToken,
    exchangeGoogleCalendarCode,
    GOOGLE_OAUTH_NONCE_COOKIE,
    verifyGoogleCalendarState,
} from '@/lib/google-calendar';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getPublicAppUrl } from '@/lib/site-url';
import { sanitizeWeddingId } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

function clearNonceCookie(response: NextResponse) {
    response.cookies.set(GOOGLE_OAUTH_NONCE_COOKIE, '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,
        path: '/api/planner/google-calendar/callback',
    });
    return response;
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
        return clearNonceCookie(
            NextResponse.redirect(`${getPublicAppUrl()}/dashboard?googleCalendar=${encodeURIComponent(error)}`)
        );
    }

    try {
        if (!code || !state) throw new Error('Missing Google Calendar authorization response');
        const cookieNonce = req.cookies.get(GOOGLE_OAUTH_NONCE_COOKIE)?.value || null;
        const payload = verifyGoogleCalendarState(state, cookieNonce);
        const safeWeddingId = sanitizeWeddingId(payload.weddingId);
        if (!safeWeddingId) throw new Error('Invalid wedding ID');

        const db = getSupabaseAdminClient() as any;
        const { data: wedding, error: weddingError } = await db
            .from('weddings')
            .select('id, user_id')
            .eq('id', safeWeddingId)
            .is('deleted_at', null)
            .maybeSingle();

        if (weddingError || !wedding || wedding.user_id !== payload.userId) {
            throw new Error('Unauthorized wedding calendar connection');
        }

        const tokens = await exchangeGoogleCalendarCode(code);
        const expiresAt = tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null;

        const { data: existing } = await db
            .from('planner_google_calendar_connections')
            .select('refresh_token')
            .eq('wedding_id', safeWeddingId)
            .eq('user_id', payload.userId)
            .maybeSingle();

        const encryptedAccessToken = encryptGoogleToken(tokens.access_token);
        const encryptedRefreshToken = tokens.refresh_token
            ? encryptGoogleToken(tokens.refresh_token)
            : (existing?.refresh_token || null);

        const { error: upsertError } = await db
            .from('planner_google_calendar_connections')
            .upsert({
                wedding_id: safeWeddingId,
                user_id: payload.userId,
                google_calendar_id: 'primary',
                access_token: encryptedAccessToken,
                refresh_token: encryptedRefreshToken,
                token_expires_at: expiresAt,
                scope: tokens.scope || null,
                revoked_at: null,
                connected_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }, { onConflict: 'wedding_id,user_id' });

        if (upsertError) throw upsertError;

        return clearNonceCookie(
            NextResponse.redirect(`${getPublicAppUrl()}/dashboard/${safeWeddingId}/planner?tab=calendar&google=connected`)
        );
    } catch (err) {
        console.error('Google Calendar OAuth callback error:', err);
        return clearNonceCookie(
            NextResponse.redirect(`${getPublicAppUrl()}/dashboard?googleCalendarError=${encodeURIComponent('Unable to connect Google Calendar. Please try again.')}`)
        );
    }
}
