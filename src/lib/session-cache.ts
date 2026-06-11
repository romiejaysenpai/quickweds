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

/**
 * Returns the current Supabase session, using a short-lived cache
 * to prevent duplicate network requests within the same page load.
 *
 * - First call fetches from Supabase and caches the result
 * - Subsequent calls within 30s return the cached result
 * - Concurrent calls share the same in-flight promise (deduplication)
 */
export async function getCachedSession(): Promise<SessionResult> {
    const now = Date.now();

    // Return cached result if still fresh
    if (cachedResult && now - cacheTimestamp < CACHE_TTL_MS) {
        return cachedResult;
    }

    // Deduplicate concurrent in-flight requests
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

/**
 * Invalidate the session cache (call after sign-out or token refresh).
 */
export function invalidateSessionCache() {
    cachedResult = null;
    cacheTimestamp = 0;
    pendingPromise = null;
}

/**
 * Returns just the access token string, or null if no session.
 * Convenience wrapper that avoids verbose destructuring at call sites.
 */
export async function getCachedAccessToken(): Promise<string | null> {
    const { data } = await getCachedSession();
    return data.session?.access_token ?? null;
}
