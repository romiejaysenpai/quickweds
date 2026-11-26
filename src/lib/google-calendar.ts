import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { getPublicAppUrl } from '@/lib/site-url';

const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';
const TOKEN_ENCRYPTION_PREFIX = 'enc:v1:';
export const GOOGLE_OAUTH_NONCE_COOKIE = 'qw_gcal_oauth_nonce';

function getGoogleClientConfig() {
    const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        throw new Error('Missing Google Calendar OAuth configuration');
    }
    return { clientId, clientSecret };
}

function getStateSecret(): Buffer {
    const configured = process.env.GOOGLE_OAUTH_STATE_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();
    if (!configured || configured.length < 16) {
        throw new Error('GOOGLE_OAUTH_STATE_SECRET must be configured.');
    }
    return createHash('sha256').update(`quickweds:google-oauth-state:${configured}`).digest();
}

function getTokenEncryptionKey(): Buffer | null {
    const raw = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY?.trim() || process.env.GOOGLE_OAUTH_STATE_SECRET?.trim();
    if (!raw || raw.length < 16) return null;
    return createHash('sha256').update(`quickweds:google-token-enc:${raw}`).digest();
}

export function encryptGoogleToken(token?: string | null): string | null {
    if (!token) return null;
    if (token.startsWith(TOKEN_ENCRYPTION_PREFIX)) return token;
    const key = getTokenEncryptionKey();
    if (!key) return token;

    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${TOKEN_ENCRYPTION_PREFIX}${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

export function decryptGoogleToken(stored?: string | null): string | null {
    if (!stored) return null;
    if (!stored.startsWith(TOKEN_ENCRYPTION_PREFIX)) {
        // Backward compatibility for existing plaintext tokens already stored in production
        return stored;
    }
    const key = getTokenEncryptionKey();
    if (!key) {
        throw new Error('Missing Google token decryption key');
    }
    const parts = stored.slice(TOKEN_ENCRYPTION_PREFIX.length).split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted Google token format');
    }
    const [ivB64, tagB64, dataB64] = parts;
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivB64, 'base64url'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64url'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64url')), decipher.final()]);
    return decrypted.toString('utf8');
}

export function getGoogleCalendarRedirectUri() {
    return `${getPublicAppUrl()}/api/planner/google-calendar/callback`;
}

export function generateGoogleOAuthNonce() {
    return randomBytes(24).toString('base64url');
}

export function createGoogleCalendarState(payload: { weddingId: string; userId: string; nonce: string }) {
    const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 10 * 60 * 1000 })).toString('base64url');
    const signature = createHmac('sha256', getStateSecret()).update(body).digest('base64url');
    return `${body}.${signature}`;
}

export function verifyGoogleCalendarState(state: string, expectedNonce?: string | null) {
    const parts = state.split('.');
    if (parts.length !== 2) throw new Error('Invalid OAuth state');
    const [body, signature] = parts;
    if (!body || !signature) throw new Error('Invalid OAuth state');

    const expected = createHmac('sha256', getStateSecret()).update(body).digest('base64url');
    const sigBuf = Buffer.from(signature, 'utf8');
    const expBuf = Buffer.from(expected, 'utf8');
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
        throw new Error('Invalid OAuth state signature');
    }

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
        weddingId: string;
        userId: string;
        nonce?: string;
        exp: number;
    };

    if (!payload.weddingId || !payload.userId || !payload.nonce || payload.exp < Date.now()) {
        throw new Error('Expired OAuth state');
    }

    if (!expectedNonce) {
        throw new Error('Missing OAuth session cookie');
    }

    const nonceBuf = Buffer.from(payload.nonce, 'utf8');
    const expectedNonceBuf = Buffer.from(expectedNonce, 'utf8');
    if (nonceBuf.length !== expectedNonceBuf.length || !timingSafeEqual(nonceBuf, expectedNonceBuf)) {
        throw new Error('OAuth session mismatch');
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
    const data = await response.json().catch(() => ({}));
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
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error_description || data.error || 'Unable to refresh Google Calendar access');
    }
    return data as { access_token: string; refresh_token?: string; expires_in?: number; scope?: string; token_type?: string };
}

export async function revokeGoogleCalendarToken(token?: string | null) {
    if (!token) return;
    try {
        await fetch('https://oauth2.googleapis.com/revoke', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ token }),
        });
    } catch {
        // Best-effort revocation; local disconnect should still succeed
    }
}

export async function upsertGoogleCalendarEvent(accessToken: string, calendarId: string, event: any) {
    const endDate = event.ends_at || new Date(new Date(event.starts_at).getTime() + 60 * 60 * 1000).toISOString();
    const stableId = createHash('sha256').update(`quickweds:${event.id}`).digest('hex');
    const body = {
        ...(!event.google_event_id ? { id: stableId } : {}),
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
    let response = await fetch(url, {
        method: event.google_event_id ? 'PUT' : 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    if (!event.google_event_id && response.status === 409) {
        response = await fetch(`${url}/${stableId}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
    }
    const data = await response.json().catch(() => ({}));
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
