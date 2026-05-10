import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { deleteGoogleCalendarEvent, refreshGoogleCalendarAccessToken, upsertGoogleCalendarEvent } from '@/lib/google-calendar';

export const dynamic = 'force-dynamic';

async function getOwnerConnection(db: any, weddingId: string, userId: string) {
    const { data: wedding } = await db.from('weddings').select('id, user_id').eq('id', weddingId).maybeSingle();
    if (!wedding || wedding.user_id !== userId) {
        throw new Error('Only the wedding owner can sync Google Calendar');
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
        throw new Error('Google Calendar is not connected');
    }
    return connection;
}

async function getAccessToken(db: any, connection: any) {
    const expiresAt = connection.token_expires_at ? new Date(connection.token_expires_at).getTime() : 0;
    if (connection.access_token && expiresAt > Date.now() + 60 * 1000) {
        return connection.access_token;
    }
    if (!connection.refresh_token) {
        throw new Error('Google Calendar needs to be reconnected');
    }
    const refreshed = await refreshGoogleCalendarAccessToken(connection.refresh_token);
    const tokenExpiresAt = refreshed.expires_in ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString() : null;
    await db
        .from('planner_google_calendar_connections')
        .update({
            access_token: refreshed.access_token,
            token_expires_at: tokenExpiresAt,
            scope: refreshed.scope || connection.scope || null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', connection.id);
    return refreshed.access_token;
}

export async function POST(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error }, { status: 401 });

    const { weddingId } = await req.json().catch(() => ({}));
    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required' }, { status: 400 });

    const db = getSupabaseAdminClient() as any;
    try {
        const connection = await getOwnerConnection(db, weddingId, user.id);
        const accessToken = await getAccessToken(db, connection);
        const { data: events, error: eventsError } = await db
            .from('planner_events')
            .select('*')
            .eq('wedding_id', weddingId)
            .order('starts_at', { ascending: true });
        if (eventsError) throw eventsError;

        let synced = 0;
        const errors: string[] = [];
        for (const event of events || []) {
            try {
                const googleEvent = await upsertGoogleCalendarEvent(accessToken, connection.google_calendar_id || 'primary', event);
                await db
                    .from('planner_events')
                    .update({
                        google_event_id: googleEvent.id,
                        google_event_updated_at: googleEvent.updated || new Date().toISOString(),
                        google_sync_error: null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', event.id);
                synced += 1;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Google Calendar sync failed';
                errors.push(`${event.title}: ${message}`);
                await db.from('planner_events').update({ google_sync_error: message }).eq('id', event.id);
            }
        }

        await db
            .from('planner_google_calendar_connections')
            .update({ last_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
            .eq('id', connection.id);

        return NextResponse.json({ success: errors.length === 0, synced, errors });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to sync Google Calendar';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error }, { status: 401 });

    const { weddingId, eventId } = await req.json().catch(() => ({}));
    if (!weddingId || !eventId) return NextResponse.json({ error: 'Wedding ID and event ID are required' }, { status: 400 });

    const db = getSupabaseAdminClient() as any;
    try {
        const connection = await getOwnerConnection(db, weddingId, user.id);
        const accessToken = await getAccessToken(db, connection);
        const { data: event } = await db
            .from('planner_events')
            .select('id, google_event_id')
            .eq('id', eventId)
            .eq('wedding_id', weddingId)
            .maybeSingle();

        if (event?.google_event_id) {
            await deleteGoogleCalendarEvent(accessToken, connection.google_calendar_id || 'primary', event.google_event_id);
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to delete Google Calendar event';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
