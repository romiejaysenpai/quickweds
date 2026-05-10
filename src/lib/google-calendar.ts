import { createHmac, timingSafeEqual } from 'crypto';
import { getPublicAppUrl } from '@/lib/site-url';

const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';

function getGoogleClientConfig() {
    const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        throw new Error('Missing Google Calendar OAuth configuration');
    }
    return { clientId, clientSecret };
}

function getStateSecret() {
    return process.env.GOOGLE_OAUTH_STATE_SECRET || process.env.NEXTAUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'quickweds-local-google-calendar-state';
}

export function getGoogleCalendarRedirectUri() {
    return `${getPublicAppUrl()}/api/planner/google-calendar/callback`;
}

export function createGoogleCalendarState(payload: { weddingId: string; userId: string }) {
    const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 10 * 60 * 1000 })).toString('base64url');
    const signature = createHmac('sha256', getStateSecret()).update(body).digest('base64url');
    return `${body}.${signature}`;
}

export function verifyGoogleCalendarState(state: string) {
    const [body, signature] = state.split('.');
    if (!body || !signature) throw new Error('Invalid OAuth state');
    const expected = createHmac('sha256', getStateSecret()).update(body).digest('base64url');
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
        throw new Error('Invalid OAuth state signature');
    }
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as { weddingId: string; userId: string; exp: number };
    if (!payload.weddingId || !payload.userId || payload.exp < Date.now()) {
        throw new Error('Expired OAuth state');
    }
    return payload;
}

export function buildGoogleCalendarAuthUrl(state: string) {
    const { clientId } = getGoogleClientConfig();
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: getGoogleCalendarRedirectUri(),
        response_type: 'code',
        scope: GOOGLE_CALENDAR_SCOPE,
        access_type: 'offline',
        include_granted_scopes: 'true',
        prompt: 'consent',
        state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCalendarCode(code: string) {
    const { clientId, clientSecret } = getGoogleClientConfig();
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: getGoogleCalendarRedirectUri(),
            grant_type: 'authorization_code',
        }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error_description || data.error || 'Unable to connect Google Calendar');
    }
    return data as {
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
        scope?: string;
        token_type?: string;
    };
}

export async function refreshGoogleCalendarAccessToken(refreshToken: string) {
    const { clientId, clientSecret } = getGoogleClientConfig();
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
        }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error_description || data.error || 'Unable to refresh Google Calendar access');
    }
    return data as { access_token: string; expires_in?: number; scope?: string; token_type?: string };
}

export async function upsertGoogleCalendarEvent(accessToken: string, calendarId: string, event: any) {
    const endDate = event.ends_at || new Date(new Date(event.starts_at).getTime() + 60 * 60 * 1000).toISOString();
    const body = {
        summary: event.title,
        location: event.location || undefined,
        description: event.notes || undefined,
        start: { dateTime: new Date(event.starts_at).toISOString() },
        end: { dateTime: new Date(endDate).toISOString() },
        reminders: {
            useDefault: false,
            overrides: event.reminder_minutes ? [{ method: 'popup', minutes: Number(event.reminder_minutes) }] : [],
        },
    };
    const encodedCalendarId = encodeURIComponent(calendarId || 'primary');
    const url = event.google_event_id
        ? `https://www.googleapis.com/calendar/v3/calendars/${encodedCalendarId}/events/${encodeURIComponent(event.google_event_id)}`
        : `https://www.googleapis.com/calendar/v3/calendars/${encodedCalendarId}/events`;
    const response = await fetch(url, {
        method: event.google_event_id ? 'PUT' : 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.message || 'Unable to sync event to Google Calendar');
    }
    return data as { id: string; updated?: string };
}

export async function deleteGoogleCalendarEvent(accessToken: string, calendarId: string, googleEventId: string) {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId || 'primary')}/events/${encodeURIComponent(googleEventId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok && response.status !== 404 && response.status !== 410) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error?.message || 'Unable to delete Google Calendar event');
    }
}
