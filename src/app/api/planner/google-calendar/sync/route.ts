import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { createRateLimitMiddleware, sanitizeWeddingId } from '@/lib/rate-limit';
import {
    decryptGoogleToken,
    deleteGoogleCalendarEvent,
    encryptGoogleToken,
    refreshGoogleCalendarAccessToken,
    upsertGoogleCalendarEvent,
} from '@/lib/google-calendar';

export const dynamic = 'force-dynamic';

class HttpStatusError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

async function getOwnerConnection(db: any, weddingId: string, userId: string) {
    const { data: wedding, error: weddingError } = await db
        .from('weddings')
        .select('id, user_id')
        .eq('id', weddingId)
        .is('deleted_at', null)
        .maybeSingle();
    if (weddingError) throw weddingError;
    if (!wedding || wedding.user_id !== userId) {
        throw new HttpStatusError('Only the wedding owner can sync Google Calendar', 403);
    }

    const { data: connection, error } = await db
        .from('planner_google_calendar_connections')
        .select('*')
        .eq('wedding_id', weddingId)
        .eq('user_id', userId)
        .is('revoked_at', null)
        .maybeSingle();

    if (error) throw error;
    if (!connection?.refresh_token && !connection?.access_token) {
        throw new HttpStatusError('Google Calendar is not connected', 400);
    }
    return connection;
}

async function getAccessToken(db: any, connection: any) {
    const expiresAt = connection.token_expires_at ? new Date(connection.token_expires_at).getTime() : 0;
    const storedAccess = decryptGoogleToken(connection.access_token);
    if (storedAccess && expiresAt > Date.now() + 60 * 1000) {
        return storedAccess;
    }
    const storedRefresh = decryptGoogleToken(connection.refresh_token);
    if (!storedRefresh) {
        throw new HttpStatusError('Google Calendar needs to be reconnected', 400);
    }
    const refreshed = await refreshGoogleCalendarAccessToken(storedRefresh);
    const tokenExpiresAt = refreshed.expires_in ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString() : null;
    const updatePayload: Record<string, unknown> = {
        access_token: encryptGoogleToken(refreshed.access_token),
        token_expires_at: tokenExpiresAt,
        scope: refreshed.scope || connection.scope || null,
        updated_at: new Date().toISOString(),
    };
    if (refreshed.refresh_token) {
        updatePayload.refresh_token = encryptGoogleToken(refreshed.refresh_token);
    }
    const { error: persistTokenError } = await db
        .from('planner_google_calendar_connections')
        .update(updatePayload)
        .eq('id', connection.id);
    if (persistTokenError) throw persistTokenError;
    return refreshed.access_token;
}

export async function POST(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error }, { status: 401 });

    const rateLimit = createRateLimitMiddleware('AUTHENTICATED_DEFAULT');
    const limited = await rateLimit.check(`gcal-sync:${user.id}`);
    if (limited.limited) return limited.response;

    const body = await req.json().catch(() => ({}));
    const weddingId = sanitizeWeddingId(String(body.weddingId || ''));
    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required' }, { status: 400 });

    const db = getSupabaseAdminClient() as any;
    try {
        const connection = await getOwnerConnection(db, weddingId, user.id);
        const accessToken = await getAccessToken(db, connection);
        const { data: events, error: eventsError } = await db
            .from('planner_events')
            .select('*')
            .eq('wedding_id', weddingId)
            .order('starts_at', { ascending: true })
            .limit(500);
        if (eventsError) throw eventsError;

        let synced = 0;
        const errors: string[] = [];
        for (const event of events || []) {
            try {
                const googleEvent = await upsertGoogleCalendarEvent(accessToken, connection.google_calendar_id || 'primary', event);
                const { error: persistEventError } = await db
                    .from('planner_events')
                    .update({
                        google_event_id: googleEvent.id,
                        google_event_updated_at: googleEvent.updated || new Date().toISOString(),
                        google_sync_error: null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', event.id)
                    .eq('wedding_id', weddingId);
                if (persistEventError) throw persistEventError;
                synced += 1;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Google Calendar sync failed';
                errors.push(`${event.title}: ${message}`);
                const { error: logError } = await db.from('planner_events').update({ google_sync_error: message }).eq('id', event.id).eq('wedding_id', weddingId);
                if (logError) console.error('Unable to persist Google sync error:', logError.code);
            }
        }

        if (errors.length === 0) {
            const { error: connectionError } = await db
                .from('planner_google_calendar_connections')
                .update({ last_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
                .eq('id', connection.id);
            if (connectionError) throw connectionError;
        }

        return NextResponse.json({ success: errors.length === 0, synced, errors }, { headers: limited.headers });
    } catch (err) {
        if (err instanceof HttpStatusError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('Google Calendar sync error:', err);
        return NextResponse.json({ error: 'Unable to sync Google Calendar.' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error }, { status: 401 });

    const rateLimit = createRateLimitMiddleware('AUTHENTICATED_DEFAULT');
    const limited = await rateLimit.check(`gcal-delete:${user.id}`);
    if (limited.limited) return limited.response;

    const body = await req.json().catch(() => ({}));
    const weddingId = sanitizeWeddingId(String(body.weddingId || ''));
    const eventId = String(body.eventId || '').trim();
    if (!weddingId || !eventId) return NextResponse.json({ error: 'Wedding ID and event ID are required' }, { status: 400 });

    const db = getSupabaseAdminClient() as any;
    try {
        const connection = await getOwnerConnection(db, weddingId, user.id);
        const accessToken = await getAccessToken(db, connection);
        const { data: event, error: eventError } = await db
            .from('planner_events')
            .select('id, google_event_id')
            .eq('id', eventId)
            .eq('wedding_id', weddingId)
            .maybeSingle();

        if (eventError) throw eventError;
        if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
        if (event.google_event_id) {
            await deleteGoogleCalendarEvent(accessToken, connection.google_calendar_id || 'primary', event.google_event_id);
        }

        return NextResponse.json({ success: true }, { headers: limited.headers });
    } catch (err) {
        if (err instanceof HttpStatusError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('Google Calendar event delete error:', err);
        return NextResponse.json({ error: 'Unable to delete Google Calendar event.' }, { status: 500 });
    }
}
