
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const invalidRefreshTokenPattern = /invalid refresh token|refresh token not found|refresh_token_not_found|refresh_token_already_used/i;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

function clearStoredSupabaseSessions() {
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

function installInvalidRefreshTokenConsoleFilter() {
    if (typeof window === 'undefined') return;

    const marker = '__quickwedsSupabaseAuthConsoleFilterInstalled';
    const globalWindow = window as typeof window & { [marker]?: boolean };
    if (globalWindow[marker]) return;
    globalWindow[marker] = true;

    const originalConsoleError = console.error.bind(console);
    console.error = (...args: unknown[]) => {
        const message = args
            .map((arg) => {
                if (arg instanceof Error) return `${arg.name} ${arg.message}`;
                if (typeof arg === 'string') return arg;
                try {
                    return JSON.stringify(arg);
                } catch {
                    return String(arg);
                }
            })
            .join(' ');

        if (invalidRefreshTokenPattern.test(message)) {
            clearStoredSupabaseSessions();
            return;
        }

        originalConsoleError(...args);
    };
}

installInvalidRefreshTokenConsoleFilter();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
