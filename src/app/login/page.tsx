'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPublicRedirectUrl } from '@/lib/site-url';
import { getClientAccountProfileForIntent, getClientAdminStatus, getPostLoginRedirect, getRoleAwareRedirect, getSafeAppPath } from '@/lib/account';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
    'exchange-failed': 'Google sign in could not be completed. Please try again from this page.',
    'oauth-session-missing': 'Google sign in expired before it could finish. Please try again.',
    'oauth-failed': 'Google did not authorize the sign in. Please try again.',
    'session-failed': 'We could not load your sign in session. Please try again.',
    'session-expired': 'Your previous session expired. Please sign in again.',
    unexpected: 'Something went wrong while signing you in. Please try again.',
};

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const errorCode = new URLSearchParams(window.location.search).get('error');
        if (errorCode) {
            setError(AUTH_ERROR_MESSAGES[errorCode] || 'Google sign in failed. Please try again.');
        }
    }, []);

    const getSafeNextPath = () => {
        if (typeof window === 'undefined') return '/dashboard';
        return getSafeAppPath(new URLSearchParams(window.location.search).get('next'), '/dashboard');
    };

    const resolvePostAuthPath = async (token: string, nextPath: string) => {
        if (await getClientAdminStatus(token)) {
            const safeNext = getSafeAppPath(nextPath, '/dashboard');
            return safeNext.startsWith('/onboarding/account-type') ? '/dashboard' : safeNext;
        }

        try {
            const profile = await getClientAccountProfileForIntent(token, nextPath);
            return getPostLoginRedirect(profile, nextPath);
        } catch {
            // Gracefully degrade — if account profile table is missing, go to default path
            return '/dashboard';
        }
    };

    const rememberNextPath = () => {
        const nextPath = getSafeNextPath();
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('quickweds_auth_next', nextPath);
        }
        return nextPath;
    };

    const getSignupHref = () => {
        const nextPath = getSafeNextPath();
        return nextPath === '/dashboard' ? '/signup' : `/signup?next=${encodeURIComponent(nextPath)}`;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const normalizedEmail = email.trim().toLowerCase();
            const rateResponse = await fetch('/api/auth/rate-limit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'login', email: normalizedEmail }),
            });
            if (!rateResponse.ok) {
                const rateData = await rateResponse.json().catch(() => ({}));
                throw new Error(rateData.error || 'Too many requests. Please try again later.');
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email: normalizedEmail,
                password,
            });
            if (error) throw error;

            // Always send returning users to the welcome dashboard.
            // The dashboard page itself handles showing the correct view
            // (wedding list, empty state, or onboarding) based on the user's profile.
            // Only honor the `next` param for onboarding-related paths.
            const nextPath = getSafeNextPath();
            const redirectPath = nextPath.startsWith('/onboarding/account-type')
                ? nextPath
                : '/dashboard';

            router.replace(redirectPath);
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'apple') => {
        setLoading(true);
        setError('');
        try {
            rememberNextPath();
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: getPublicRedirectUrl('/auth/callback'),
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'select_account',
                    },
                }
            });
            if (error) throw error;
        } catch (err: any) {
            console.error(`${provider} Login Error:`, err);
            setError(`Failed to sign in with ${provider}. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mobile-safe-screen flex items-center justify-center bg-neutral px-4 sm:px-6 mobile-safe-bottom">
            <div className="noise-overlay" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-[2rem] p-6 sm:p-10 soft-shadow relative z-10 border border-border"
            >
                <div className="flex flex-col items-center mb-10">
                    <Link href="/">
                        <img src="/logo.png" alt="QuickWeds Logo" className="h-20 w-auto object-contain mb-4 hover:scale-105 transition-transform" />
                    </Link>
                    <p className="text-text-secondary text-sm italic">Continue creating your dream <span className="text-primary">wedding</span></p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-error-bg text-error-text text-sm rounded-xl border border-border italic">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 pointer-events-none" />
                            <input
                                type="email"
                                required
                                inputMode="email"
                                autoComplete="email"
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck={false}
                                className="icon-field-left w-full pl-14 pr-4 py-4 rounded-2xl bg-neutral border border-border focus:border-primary focus:bg-white outline-none transition-all placeholder:text-text-secondary/30"
                                placeholder="hello@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary">Password</label>
                            <Link href="/forgot-password" title="Forgot Password" className="inline-flex min-h-[44px] items-center text-xs font-bold text-primary hover:underline">Forgot?</Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 pointer-events-none" />
                            <input
                                type="password"
                                required
                                autoComplete="current-password"
                                className="icon-field-left w-full pl-14 pr-4 py-4 rounded-2xl bg-neutral border border-border focus:border-primary focus:bg-white outline-none transition-all placeholder:text-text-secondary/30"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:bg-primary-disabled"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Login <ArrowRight className="w-5 h-5" /></>}
                    </button>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-4 text-text-secondary font-bold tracking-widest">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('google')}
                            disabled={loading}
                            className="flex items-center justify-center gap-3 py-4 rounded-2xl border border-border hover:bg-neutral transition-all font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                            Google
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('apple')}
                            disabled={loading}
                            className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-black text-white hover:bg-gray-800 transition-all font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M17.05 20.28c-.96.95-2.05 1.72-3.17 1.72-1.21 0-1.63-.73-3.08-.73-1.47 0-1.94.71-3.08.73-1.08 0-2.31-.89-3.23-1.83C2.59 18.25 1 15.11 1 12.18c0-4.63 3.01-7.07 5.95-7.07 1.56 0 3.04.98 4.02.98.96 0 2.76-1.16 4.67-1.16 2.01 0 3.51.74 4.54 2.22-4.14 2-.96 7.42 2.62 9 a8.5 8.5 0 0 1-1.75 4.13zM12.03 5.09c.04-2.36 1.96-4.22 4.21-4.22.25 0 .5.03.73.08a4.1 4.1 0 0 1-4.94 4.14z" />
                            </svg>
                            Apple
                        </button>
                    </div>
                </form>

                <p className="mt-8 text-center text-text-secondary">
                    Don&apos;t have an account?{' '}
                    <Link
                        href="/signup"
                        onClick={(event) => {
                            event.preventDefault();
                            router.push(getSignupHref());
                        }}
                        className="inline-flex min-h-[44px] items-center font-bold text-primary hover:underline"
                    >
                        Sign Up
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
