import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

export function isInvalidRefreshTokenError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error || '');
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
