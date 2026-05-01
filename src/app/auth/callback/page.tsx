'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [debug, setDebug] = useState<string>('');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const url = new URL(window.location.href);
                const code = url.searchParams.get('code');
                const errorParam = url.searchParams.get('error');
                const errorDescription = url.searchParams.get('error_description');

                setDebug(`Path: ${url.pathname}?${url.searchParams.toString()}`);

                if (errorParam) {
                    console.error('OAuth error from provider:', errorParam, errorDescription);
                    setError(`${errorParam}: ${errorDescription || 'No description'}`);
                    setTimeout(() => router.push('/login?error=oauth-failed'), 2000);
                    return;
                }

                if (!code) {
                    setError('No authorization code in URL');
                    setDebug('Expected ?code=... but got none');
                    setTimeout(() => router.push('/login?error=no-code'), 2000);
                    return;
                }

                // Exchange the authorization code for a session
                const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                
                if (exchangeError) {
                    console.error('Code exchange error:', exchangeError);
                    setError(`Code exchange failed: ${exchangeError.message}`);
                    setDebug(`Error details: ${JSON.stringify(exchangeError)}`);
                    setTimeout(() => router.push('/login?error=exchange-failed'), 2000);
                    return;
                }

                console.log('Exchange successful:', exchangeData);

                // Double-check session
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Session error:', sessionError);
                    setError(`Session error: ${sessionError.message}`);
                    setTimeout(() => router.push('/login?error=session-failed'), 2000);
                    return;
                }

                if (sessionData?.session) {
                    const user = sessionData.session.user;
                    console.log('User authenticated:', user.email);
                    
                    const isNewUser = new Date(user.created_at).getTime() > Date.now() - 30000;

                    if (isNewUser) {
                        void fetch('/api/admin/notify-signup', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                record: {
                                    email: user.email,
                                    full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'OAuth User',
                                }
                            })
                        }).catch(err => console.error('OAuth Notification Error:', err));
                    }

                    router.push('/dashboard');
                } else {
                    // Fallback: wait for onAuthStateChange
                    console.log('No immediate session, waiting for onAuthStateChange...');
                    const timeout = setTimeout(() => {
                        router.push('/login');
                    }, 5000);

                    const { data: { subscription } } = supabase.auth.onAuthStateChange(
                        (event, session) => {
                            console.log('Auth state change:', event, session?.user?.email);
                            if (session) {
                                clearTimeout(timeout);
                                subscription.unsubscribe();
                                router.push('/dashboard');
                            }
                        }
                    );

                    return () => {
                        clearTimeout(timeout);
                        subscription.unsubscribe();
                    };
                }
            } catch (err: any) {
                console.error('Auth callback unexpected error:', err);
                setError(`Unexpected error: ${err.message}`);
                setDebug(`Stack: ${err.stack?.split('\n')[0]}`);
                setTimeout(() => router.push('/login?error=unexpected'), 2000);
            }
        };

        void handleCallback();
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
