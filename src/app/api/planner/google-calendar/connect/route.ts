import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { createRateLimitMiddleware, sanitizeWeddingId } from '@/lib/rate-limit';
import {
    buildGoogleCalendarAuthUrl,
    createGoogleCalendarState,
    generateGoogleOAuthNonce,
    GOOGLE_OAUTH_NONCE_COOKIE,
} from '@/lib/google-calendar';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error }, { status: 401 });

    const rateLimit = createRateLimitMiddleware('AUTHENTICATED_DEFAULT');
    const limited = await rateLimit.check(`gcal-connect:${user.id}`);
    if (limited.limited) return limited.response;

    const weddingId = sanitizeWeddingId(new URL(req.url).searchParams.get('weddingId') || '');
    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required' }, { status: 400 });

    const db = getSupabaseAdminClient() as any;
    const { data: wedding, error: weddingError } = await db
        .from('weddings')
        .select('id, user_id')
        .eq('id', weddingId)
        .is('deleted_at', null)
        .maybeSingle();

    if (weddingError || !wedding || wedding.user_id !== user.id) {
        return NextResponse.json({ error: 'Only the wedding owner can connect Google Calendar' }, { status: 403 });
    }

    try {
        const nonce = generateGoogleOAuthNonce();
        const state = createGoogleCalendarState({ weddingId, userId: user.id, nonce });
        const response = NextResponse.json(
            { url: buildGoogleCalendarAuthUrl(state) },
            { headers: { ...limited.headers, 'Cache-Control': 'no-store' } }
        );
        response.cookies.set(GOOGLE_OAUTH_NONCE_COOKIE, nonce, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 600,
            path: '/api/planner/google-calendar/callback',
        });
        return response;
    } catch (err) {
        console.error('Google Calendar connect error:', err);
        return NextResponse.json({ error: 'Unable to start Google Calendar connection' }, { status: 500 });
    }
}
