'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { getClientAccountProfileForIntent, getClientAdminStatus, getPostLoginRedirect, getRoleAwareRedirect, getSafeAppPath } from '@/lib/account';
import { clearLocalSupabaseSession, getSafeSupabaseSession, isInvalidRefreshTokenError } from '@/lib/supabase-auth';
import { invalidateSessionCache } from '@/lib/session-cache';

const inFlightCodeExchanges = new Map<string, ReturnType<typeof supabase.auth.exchangeCodeForSession>>();

function exchangeAuthCodeOnce(code: string) {
    const existing = inFlightCodeExchanges.get(code);
    if (existing) return existing;

    const promise = supabase.auth.exchangeCodeForSession(code).finally(() => {
        invalidateSessionCache();
        window.setTimeout(() => {
            inFlightCodeExchanges.delete(code);
        }, 15_000);
    });
    inFlightCodeExchanges.set(code, promise);
    return promise;
}

export default function AuthCallbackPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [debug, setDebug] = useState<string>('');

    const getSafeNextPath = (value: string | null) => getSafeAppPath(value, '/dashboard');

    useEffect(() => {
        let active = true;
        let cleanupListener: (() => void) | null = null;
        const redirectTimers: number[] = [];

        const scheduleRedirect = (target: string, delayMs = 2000) => {
            const timerId = window.setTimeout(() => {
                if (active) router.replace(target);
            }, delayMs);
            redirectTimers.push(timerId);
        };

        const getNextPath = (url: URL) => {
            const queryNext = getSafeNextPath(url.searchParams.get('next'));
            if (url.searchParams.get('next')) return queryNext;

            const storedNext = window.localStorage.getItem('quickweds_auth_next');
            return getSafeNextPath(storedNext);
        };

        const notifyNewOAuthUser = (user: User, accessToken?: string) => {
            const isNewUser = new Date(user.created_at).getTime() > Date.now() - 30000;

            if (!isNewUser) return;

            void fetch('/api/admin/notify-signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
                body: JSON.stringify({
                    record: {
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'OAuth User',
                        source: 'oauth_signup',
                    }
                })
            }).catch(() => console.error('OAuth signup notification failed.'));
        };

        const resolvePostAuthPath = async (token: string, nextPath: string) => {
            const safeNext = getSafeAppPath(nextPath, '/dashboard');
            try {
                if (await getClientAdminStatus(token)) {
                    return safeNext.startsWith('/onboarding/account-type') ? '/dashboard' : safeNext;
                }

                const profile = await getClientAccountProfileForIntent(token, safeNext);
                if (safeNext !== '/dashboard' && profile?.account_type) {
                    return getRoleAwareRedirect(profile.account_type, safeNext);
                }
                return getPostLoginRedirect(profile, safeNext);
            } catch {
                return safeNext;
            }
        };

        const finishSignIn = async (user: User, token: string, nextPath: string) => {
            notifyNewOAuthUser(user, token);
            window.localStorage.removeItem('quickweds_auth_next');
            const destination = await resolvePostAuthPath(token, nextPath);
            if (!active) return;
            router.replace(destination);
        };

        const waitForSession = (nextPath: string) => {
            setDebug('No authorization code found. Waiting for Supabase to finish the OAuth session.');

            let settled = false;
            let subscription: { unsubscribe: () => void } | null = null;
            const timeout = window.setTimeout(() => {
                if (!active || settled) return;
                settled = true;
                subscription?.unsubscribe();
                window.localStorage.removeItem('quickweds_auth_next');
                setError('Could not complete sign in. Please try again.');
                setDebug('No code or active session was found after waiting for auth state.');
                scheduleRedirect('/login?error=oauth-session-missing', 2000);
            }, 6000);

            const authListener = supabase.auth.onAuthStateChange((_event, session) => {
                if (!active || settled || !session?.user || !session.access_token) return;
                settled = true;
                window.clearTimeout(timeout);
                subscription?.unsubscribe();
                void finishSignIn(session.user, session.access_token, nextPath);
            });

            subscription = authListener.data.subscription;
            if (settled) {
                subscription.unsubscribe();
            }
            cleanupListener = () => {
                window.clearTimeout(timeout);
                subscription?.unsubscribe();
            };
        };

        const handleCallback = async () => {
            try {
                const url = new URL(window.location.href);
                const code = url.searchParams.get('code');
                const errorParam = url.searchParams.get('error');
                const errorDescription = url.searchParams.get('error_description');
                const nextPath = getNextPath(url);

                if (active) setDebug('Completing sign in.');

                if (errorParam) {
                    console.error('OAuth provider returned an error.');
                    if (active) {
                        setError(`${errorParam}: ${errorDescription || 'No description'}`);
                        scheduleRedirect('/login?error=oauth-failed', 2000);
                    }
                    return;
                }

                if (code) {
                    // Deduplicate single-use PKCE exchange across React Strict Mode remounts.
                    const { error: exchangeError } = await exchangeAuthCodeOnce(code);
                    if (!active) return;

                    if (exchangeError) {
                        console.error('OAuth code exchange failed.');
                        setError(`Code exchange failed: ${exchangeError.message}`);
                        setDebug('Authorization code exchange failed. Please sign in again.');
                        await clearLocalSupabaseSession();
                        window.localStorage.removeItem('quickweds_auth_next');

                        const errorCode = /code verifier|pkce|auth code/i.test(exchangeError.message)
                            ? 'oauth-session-missing'
                            : 'exchange-failed';
                        scheduleRedirect(`/login?error=${errorCode}`, 2000);
                        return;
                    }
                }

                // Double-check session. This also handles implicit/hash OAuth callbacks where no code is present.
                const { session, error: sessionError } = await getSafeSupabaseSession();
                if (!active) return;

                if (sessionError) {
                    if (isInvalidRefreshTokenError(sessionError)) {
                        await clearLocalSupabaseSession();
                        window.localStorage.removeItem('quickweds_auth_next');
                        if (active) router.replace('/login?error=session-expired');
                        return;
                    }
                    console.error('OAuth session lookup failed.');
                    setError(`Session error: ${sessionError.message}`);
                    scheduleRedirect('/login?error=session-failed', 2000);
                    return;
                }

                if (session?.user && session.access_token) {
                    await finishSignIn(session.user, session.access_token, nextPath);
                    return;
                }

                waitForSession(nextPath);
            } catch (err: any) {
                if (!active) return;
                if (isInvalidRefreshTokenError(err)) {
                    await clearLocalSupabaseSession();
                    window.localStorage.removeItem('quickweds_auth_next');
                    if (active) router.replace('/login?error=session-expired');
                    return;
                }
                console.error('OAuth callback failed unexpectedly.');
                setError(`Unexpected error: ${err?.message || 'Unknown error'}`);
                setDebug('Please try signing in again.');
                scheduleRedirect('/login?error=unexpected', 2000);
            }
        };

        void handleCallback();

        return () => {
            active = false;
            cleanupListener?.();
            redirectTimers.forEach((timerId) => window.clearTimeout(timerId));
        };
    }, [router]);

    return (
        <div className="mobile-safe-screen flex flex-col items-center justify-center bg-neutral px-4 text-center mobile-safe-bottom">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            {error ? (
                <div className="space-y-2 max-w-md">
                    <p className="text-error-text font-bold text-sm">Authentication Error</p>
                    <p className="text-text-secondary text-xs">{error}</p>
                    <p className="text-text-secondary font-serif italic text-xs">Redirecting to login...</p>
                </div>
            ) : (
                <p className="text-text-secondary font-serif italic">Completing secure sign in...</p>
            )}
            {process.env.NODE_ENV === 'development' && debug && (
                <div className="mt-6 p-3 bg-neutral rounded-lg text-left max-w-md w-full">
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Debug Info</p>
                    <p className="text-[10px] font-mono text-text-secondary break-all">{debug}</p>
                </div>
            )}
        </div>
    );
}
