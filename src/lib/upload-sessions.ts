import 'server-only';

import { randomUUID } from 'crypto';
import { getRedisClient, redisDel, redisJsonGet, redisJsonSet } from '@/lib/redis';

export type UploadSession = {
    sessionId: string;
    weddingId: string;
    guestId?: string | null;
    anonymousSessionId?: string | null;
    createdAt: string;
    maxUploads: number;
};

const SESSION_TTL_SECONDS = 60 * 60;
const DEFAULT_MAX_UPLOADS = 20;

export function hasUploadSessionStore() {
    return Boolean(getRedisClient());
}

function sessionKey(sessionId: string) {
    return `quickweds:upload-session:${sessionId}`;
}

function countKey(sessionId: string) {
    return `quickweds:upload-count:${sessionId}`;
}

export async function createUploadSession(
    weddingId: string,
    guestIdOrAnonymousSessionId: string,
    maxUploads = DEFAULT_MAX_UPLOADS
) {
    const sessionId = randomUUID();
    const session: UploadSession = {
        sessionId,
        weddingId,
        anonymousSessionId: guestIdOrAnonymousSessionId || null,
        createdAt: new Date().toISOString(),
        maxUploads: Math.min(100, Math.max(1, Number(maxUploads || DEFAULT_MAX_UPLOADS))),
    };

    await redisJsonSet(sessionKey(sessionId), session, SESSION_TTL_SECONDS);
    await redisJsonSet(countKey(sessionId), 0, SESSION_TTL_SECONDS);
    return session;
}

export async function validateUploadSession(sessionId: string) {
    if (!sessionId) return null;
    return redisJsonGet<UploadSession>(sessionKey(sessionId));
}

export async function incrementUploadCount(sessionId: string) {
    const session = await validateUploadSession(sessionId);
    if (!session) return { ok: false, currentUploads: 0, maxUploads: DEFAULT_MAX_UPLOADS, reason: 'invalid_session' as const };

    const current = Number((await redisJsonGet<number>(countKey(sessionId))) || 0);
    if (current >= session.maxUploads) {
        return { ok: false, currentUploads: current, maxUploads: session.maxUploads, reason: 'limit_reached' as const };
    }

    const next = current + 1;
    await redisJsonSet(countKey(sessionId), next, SESSION_TTL_SECONDS);
    await redisJsonSet(sessionKey(sessionId), session, SESSION_TTL_SECONDS);
    return { ok: true, currentUploads: next, maxUploads: session.maxUploads, reason: null };
}

export async function closeUploadSession(sessionId: string) {
    await redisDel(sessionKey(sessionId), countKey(sessionId));
}
