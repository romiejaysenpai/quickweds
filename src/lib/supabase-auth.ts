import { supabase } from '@/lib/supabase';

export function isInvalidRefreshTokenError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error || '');
    return /invalid refresh token|refresh token not found/i.test(message);
}

export async function clearLocalSupabaseSession() {
    try {
        await supabase.auth.signOut({ scope: 'local' });
    } catch {
        // The session is already invalid; clear browser storage below.
    }

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
