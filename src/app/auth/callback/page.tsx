'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // For OAuth (Google, Apple), Supabase uses PKCE flow with code in URL params
                // The Supabase client automatically detects the code in the URL and exchanges it
                const url = new URL(window.location.href);
                const code = url.searchParams.get('code');
                const errorParam = url.searchParams.get('error');
                const errorDescription = url.searchParams.get('error_description');

                if (errorParam) {
                    console.error('OAuth error:', errorParam, errorDescription);
                    setError(errorDescription || errorParam);
                    setTimeout(() => router.push('/login?error=auth-callback-failed'), 2000);
                    return;
                }

                if (code) {
                    // Exchange the authorization code for a session
                    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                    if (exchangeError) {
                        console.error('Code exchange error:', exchangeError);
                        setError(exchangeError.message);
                        setTimeout(() => router.push('/login?error=auth-callback-failed'), 2000);
                        return;
                    }
                }

                // Check if we now have a valid session
                const { data, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Session error:', sessionError);
                    setError(sessionError.message);
                    setTimeout(() => router.push('/login?error=auth-callback-failed'), 2000);
                    return;
                }

                if (data?.session) {
                    // Successfully authenticated - redirect to dashboard
                    router.push('/dashboard');
                } else {
                    // No session found - might be a hash-based redirect (implicit flow)
                    // Wait briefly for onAuthStateChange to pick up the session
                    const timeout = setTimeout(() => {
                        router.push('/login');
                    }, 3000);

                    // Listen for auth state changes
                    const { data: { subscription } } = supabase.auth.onAuthStateChange(
                        (event, session) => {
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
                setError(err.message || 'Authentication failed');
                setTimeout(() => router.push('/login?error=auth-callback-failed'), 2000);
            }
        };

        void handleCallback();
    }, [router]);

    return (
        <div className="mobile-safe-screen flex flex-col items-center justify-center bg-neutral px-4 text-center mobile-safe-bottom">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            {error ? (
                <div className="space-y-2">
                    <p className="text-error-text font-bold text-sm">Authentication Error</p>
                    <p className="text-text-secondary text-xs">{error}</p>
                    <p className="text-text-secondary font-serif italic text-xs">Redirecting to login...</p>
                </div>
            ) : (
                <p className="text-text-secondary font-serif italic">Completing secure sign in...</p>
            )}
        </div>
    );
}
