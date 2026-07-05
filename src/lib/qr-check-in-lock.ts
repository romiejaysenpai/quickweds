import 'server-only';

import { redisSetNxEx } from '@/lib/redis';

const QR_LOCK_TTL_SECONDS = 20;

export async function acquireQrCheckInLock(weddingId: string, guestId: string) {
    const lockKey = `quickweds:qr-scan-lock:${weddingId}:${guestId}`;
    return redisSetNxEx(lockKey, new Date().toISOString(), QR_LOCK_TTL_SECONDS);
}
