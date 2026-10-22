import 'server-only';
import { createHash, createHmac, timingSafeEqual } from 'crypto';

const LIFETIME_SECONDS = 30 * 60;
type Claims = { purpose: 'rsvp-edit'; weddingId: string; rsvpId: string; emailDigest: string; expires: number };
function signingKey() {
    const secret = process.env.RSVP_ACCESS_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE;
    if (!secret) throw new Error('RSVP access signing is unavailable');
    return createHmac('sha256', secret).update('quickweds:rsvp-edit:v1').digest();
}
function emailDigest(email: string) { return createHash('sha256').update(email.trim().toLowerCase()).digest('hex'); }
export function createRsvpAccessToken(weddingId: string, rsvpId: string, email: string, now = Date.now()) {
    const claims: Claims = { purpose: 'rsvp-edit', weddingId, rsvpId, emailDigest: emailDigest(email), expires: Math.floor(now / 1000) + LIFETIME_SECONDS };
    const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
    return `${payload}.${createHmac('sha256', signingKey()).update(payload).digest('base64url')}`;
}
export function verifyRsvpAccessToken(token: string, weddingId: string, rsvpId: string, email: string, now = Date.now()): boolean {
    if (typeof token !== 'string' || token.length > 2048 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/.test(token)) return false;
    try {
        const [payload, signature] = token.split('.');
        const actual = Buffer.from(signature, 'base64url');
        const expected = createHmac('sha256', signingKey()).update(payload).digest();
        if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
        const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Claims;
        const current = Math.floor(now / 1000);
        return claims.purpose === 'rsvp-edit' && claims.weddingId === weddingId && claims.rsvpId === rsvpId && claims.emailDigest === emailDigest(email) && Number.isInteger(claims.expires) && claims.expires > current && claims.expires <= current + LIFETIME_SECONDS;
    } catch { return false; }
}
export function getRsvpManageUrl(weddingId: string, rsvpId: string, token: string) {
    const origin = process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'quickweds.site'}`;
    const url = new URL('/rsvp/manage', origin);
    url.hash = new URLSearchParams({ weddingId, rsvpId, token }).toString();
    return url.toString();
}
