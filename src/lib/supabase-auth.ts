import { supabase } from '@/lib/supabase';

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
