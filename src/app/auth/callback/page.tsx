'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { getClientAccountProfileForIntent, getRoleAwareRedirect, getSafeAppPath } from '@/lib/account';
import { isKnownAdminEmail } from '@/lib/admin';
import { clearLocalSupabaseSession, isInvalidRefreshTokenError } from '@/lib/supabase-auth';

export default function AuthCallbackPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [debug, setDebug] = useState<string>('');

    const getSafeNextPath = (value: string | null) => getSafeAppPath(value, '/dashboard');

    useEffect(() => {
        let cleanupListener: (() => void) | null = null;

        const getNextPath = (url: URL) => {
            const queryNext = getSafeNextPath(url.searchParams.get('next'));
            if (url.searchParams.get('next')) return queryNext;

            const storedNext = window.localStorage.getItem('quickweds_auth_next');
            return getSafeNextPath(storedNext);
        };

        const notifyNewOAuthUser = (user: User) => {
            const isNewUser = new Date(user.created_at).getTime() > Date.now() - 30000;

            if (!isNewUser) return;

            void fetch('/api/admin/notify-signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    record: {
                        email: user.email,
                        full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'OAuth User',
                        source: 'oauth_signup',
                    }
                })
            }).catch(err => console.error('OAuth Notification Error:', err));
        };

        const resolvePostAuthPath = async (token: string, nextPath: string, userEmail?: string | null) => {
            if (isKnownAdminEmail(userEmail)) {
                const safeNext = getSafeAppPath(nextPath, '/dashboard');
                return safeNext.startsWith('/onboarding/account-type') ? '/dashboard' : safeNext;
            }

            try {
                const profile = await getClientAccountProfileForIntent(token, nextPath);
                return getRoleAwareRedirect(profile?.account_type, nextPath);
            } catch {
                // Gracefully degrade — if account profile table is missing, go to default path
                return getSafeAppPath(nextPath, '/dashboard');
            }
        };

        const finishSignIn = async (user: User, token: string, nextPath: string) => {
            console.log('User authenticated:', user.email);
            notifyNewOAuthUser(user);
            window.localStorage.removeItem('quickweds_auth_next');
            router.replace(await resolvePostAuthPath(token, nextPath, user.email));
        };

        const waitForSession = (nextPath: string) => {
            console.log('Waiting for Supabase auth state from OAuth callback...');
            setDebug('No authorization code found. Waiting for Supabase to finish the OAuth session.');

            let subscription: { unsubscribe: () => void } | null = null;
            const timeout = window.setTimeout(() => {
                subscription?.unsubscribe();
                window.localStorage.removeItem('quickweds_auth_next');
                setError('Could not complete Google sign in. Please try again.');
                setDebug('No code or active session was found after waiting for auth state.');
                setTimeout(() => router.replace('/login?error=oauth-session-missing'), 2000);
            }, 6000);

            const authListener = supabase.auth.onAuthStateChange((_event, session) => {
                if (!session?.user || !session.access_token) return;
                window.clearTimeout(timeout);
                subscription?.unsubscribe();
                void finishSignIn(session.user, session.access_token, nextPath);
            });

            subscription = authListener.data.subscription;
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

                setDebug(`Path: ${url.pathname}?${url.searchParams.toString()}${url.hash ? '#...' : ''}`);

                if (errorParam) {
                    console.error('OAuth error from provider:', errorParam, errorDescription);
                    setError(`${errorParam}: ${errorDescription || 'No description'}`);
                    setTimeout(() => router.push('/login?error=oauth-failed'), 2000);
                    return;
                }

                if (code) {
                    // Exchange the authorization code for a session when Supabase uses PKCE/code flow.
                    const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

                    if (exchangeError) {
                        console.error('Code exchange error:', exchangeError);
                        setError(`Code exchange failed: ${exchangeError.message}`);
                        setDebug(`Error details: ${JSON.stringify(exchangeError)}`);
                        setTimeout(() => router.replace('/login?error=exchange-failed'), 2000);
                        return;
                    }

                    console.log('Exchange successful:', exchangeData);
                }

                // Double-check session. This also handles implicit/hash OAuth callbacks where no code is present.
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    if (isInvalidRefreshTokenError(sessionError)) {
                        await clearLocalSupabaseSession();
                        window.localStorage.removeItem('quickweds_auth_next');
                        router.replace('/login?error=session-expired');
                        return;
                    }
                    console.error('Session error:', sessionError);
                    setError(`Session error: ${sessionError.message}`);
                    setTimeout(() => router.replace('/login?error=session-failed'), 2000);
                    return;
                }

                if (sessionData.session?.user && sessionData.session.access_token) {
                    await finishSignIn(sessionData.session.user, sessionData.session.access_token, nextPath);
                    return;
                }

                waitForSession(nextPath);
            } catch (err: any) {
                if (isInvalidRefreshTokenError(err)) {
                    await clearLocalSupabaseSession();
                    window.localStorage.removeItem('quickweds_auth_next');
                    router.replace('/login?error=session-expired');
                    return;
                }
                console.error('Auth callback unexpected error:', err);
                setError(`Unexpected error: ${err.message}`);
                setDebug(`Stack: ${err.stack?.split('\n')[0]}`);
                setTimeout(() => router.replace('/login?error=unexpected'), 2000);
            }
        };

        void handleCallback();

        return () => {
            cleanupListener?.();
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
