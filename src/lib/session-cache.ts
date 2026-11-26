'use client';

/**
 * Session Cache
 *
 * Caches the result of supabase.auth.getSession() for a short TTL (30s)
 * to avoid redundant Supabase round-trips when multiple components/hooks
 * on the same page each call getSession() independently.
 */

import { supabase } from './supabase';

type SessionResult = Awaited<ReturnType<typeof supabase.auth.getSession>>;

let cachedResult: SessionResult | null = null;
let cacheTimestamp = 0;
let pendingPromise: Promise<SessionResult> | null = null;

const CACHE_TTL_MS = 30_000; // 30 seconds
const EXPIRY_SAFETY_BUFFER_MS = 30_000; // Refresh if JWT expires within 30s

function isCachedSessionValid(result: SessionResult, now: number): boolean {
    if (now - cacheTimestamp >= CACHE_TTL_MS) return false;
    const expiresAtSec = result.data?.session?.expires_at;
    if (typeof expiresAtSec === 'number' && expiresAtSec * 1000 <= now + EXPIRY_SAFETY_BUFFER_MS) {
        return false;
    }
    return true;
}

export async function getCachedSession(): Promise<SessionResult> {
    const now = Date.now();

    if (cachedResult && isCachedSessionValid(cachedResult, now)) {
        return cachedResult;
    }

    if (pendingPromise) {
        return pendingPromise;
    }

    pendingPromise = supabase.auth.getSession().then((result) => {
        cachedResult = result;
        cacheTimestamp = Date.now();
        pendingPromise = null;
        return result;
    }).catch((err) => {
        pendingPromise = null;
        throw err;
    });

    return pendingPromise;
}

export function invalidateSessionCache() {
    cachedResult = null;
    cacheTimestamp = 0;
    pendingPromise = null;
}

export async function getCachedAccessToken(): Promise<string | null> {
    const { data } = await getCachedSession();
    return data.session?.access_token ?? null;
}
