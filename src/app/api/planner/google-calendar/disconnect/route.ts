import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { createRateLimitMiddleware, sanitizeWeddingId } from '@/lib/rate-limit';
import { decryptGoogleToken, revokeGoogleCalendarToken } from '@/lib/google-calendar';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error }, { status: 401 });

    const rateLimit = createRateLimitMiddleware('AUTHENTICATED_DEFAULT');
    const limited = await rateLimit.check(`gcal-disconnect:${user.id}`);
    if (limited.limited) return limited.response;

    const body = await req.json().catch(() => ({}));
    const weddingId = sanitizeWeddingId(String(body.weddingId || ''));
    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required' }, { status: 400 });

    const db = getSupabaseAdminClient() as any;
    const { data: wedding } = await db
        .from('weddings')
        .select('id, user_id')
        .eq('id', weddingId)
        .is('deleted_at', null)
        .maybeSingle();

    if (!wedding || wedding.user_id !== user.id) {
        return NextResponse.json({ error: 'Only the wedding owner can disconnect Google Calendar' }, { status: 403 });
    }

    const { data: existing } = await db
        .from('planner_google_calendar_connections')
        .select('access_token, refresh_token')
        .eq('wedding_id', weddingId)
        .eq('user_id', user.id)
        .maybeSingle();

    if (existing) {
        try {
            const rawToken = decryptGoogleToken(existing.refresh_token) || decryptGoogleToken(existing.access_token);
            await revokeGoogleCalendarToken(rawToken);
        } catch {
            // Continue clearing DB credentials even if remote revoke fails
        }
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

    if (updateError) {
        console.error('Google Calendar disconnect error:', updateError);
        return NextResponse.json({ error: 'Unable to disconnect Google Calendar.' }, { status: 500 });
    }
    return NextResponse.json({ success: true }, { headers: limited.headers });
}
