import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

export function isInvalidRefreshTokenError(error: unknown) {
    if (!error) return false;

    let message = '';
    if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === 'object') {
        const record = error as Record<string, unknown>;
        message = String(record.message || record.error_description || record.error || JSON.stringify(record));
    } else {
        message = String(error);
    }

    return /invalid refresh token|refresh token not found/i.test(message);
}

function clearStoredSupabaseAuth() {
    if (typeof window === 'undefined') return;

    const clearAuthKeys = (storage: Storage) => {
        for (let index = storage.length - 1; index >= 0; index -= 1) {
            const key = storage.key(index);
            if (!key) continue;
            if ((key.startsWith('sb-') && key.endsWith('-auth-token')) || key.includes('supabase.auth.token')) {
                storage.removeItem(key);
            }
        }
    };

    clearAuthKeys(window.localStorage);
    clearAuthKeys(window.sessionStorage);

    // Also clear supabase auth cookies if present
    if (typeof document !== 'undefined') {
        try {
            const cookies = document.cookie.split(';');
            for (const cookie of cookies) {
                const eqPos = cookie.indexOf('=');
                const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim();
                if (name.startsWith('sb-') || name.includes('auth-token') || name.includes('supabase')) {
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                }
            }
        } catch (e) {
            console.warn('Failed to clear local auth cookies:', e);
        }
    }
}

export async function clearLocalSupabaseSession() {
    // Clear storage first so signOut does not try to refresh a stale token.
    clearStoredSupabaseAuth();

    try {
        await supabase.auth.signOut({ scope: 'local' });
    } catch {
        // The session is already invalid; local storage is the source of truth here.
    } finally {
        clearStoredSupabaseAuth();
    }
}

export async function getSafeSupabaseSession(): Promise<{ session: Session | null; error: Error | null }> {
    try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            if (isInvalidRefreshTokenError(error)) {
                await clearLocalSupabaseSession();
            }
            return { session: null, error };
        }

        return { session: data.session ?? null, error: null };
    } catch (error) {
        if (isInvalidRefreshTokenError(error)) {
            await clearLocalSupabaseSession();
        }

        return {
            session: null,
            error: error instanceof Error ? error : new Error(String(error || 'Unable to load session')),
        };
    }
}
