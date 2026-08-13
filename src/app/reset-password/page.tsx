'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2, KeyRound, TriangleAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getSafeSupabaseSession } from '@/lib/supabase-auth';
import LoadingState from '@/components/ui/LoadingState';

type RecoveryState = 'checking' | 'ready' | 'invalid' | 'complete';

function hasRecoveryParameters() {
    if (typeof window === 'undefined') return false;

    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const query = new URLSearchParams(window.location.search);
    return hash.get('type') === 'recovery' || query.get('type') === 'recovery' || query.has('code');
}

export default function ResetPasswordPage() {
    const [recoveryState, setRecoveryState] = useState<RecoveryState>('checking');
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let active = true;
        const arrivedFromRecoveryLink = hasRecoveryParameters();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!active) return;

            if (event === 'PASSWORD_RECOVERY') {
                setRecoveryState('ready');
                setError('');
            } else if (!session && event === 'SIGNED_OUT') {
                setRecoveryState((current) => current === 'complete' ? current : 'invalid');
            }
        });

        void getSafeSupabaseSession().then(({ session, error: sessionError }) => {
            if (!active) return;

            if (sessionError) {
                setError('We could not validate this recovery link. Please request a new one.');
                setRecoveryState('invalid');
                return;
            }

            setRecoveryState((current) => {
                if (current === 'ready' || current === 'complete') return current;
                return session && arrivedFromRecoveryLink ? 'ready' : 'invalid';
            });
        });

        return () => {
            active = false;
            subscription.unsubscribe();
        };
    }, []);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Use at least 8 characters for your new password.');
            return;
        }

        if (password !== confirmation) {
            setError('The passwords do not match.');
            return;
        }

        setSubmitting(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({ password });
            if (updateError) throw updateError;

            setRecoveryState('complete');
            setPassword('');
            setConfirmation('');
            await supabase.auth.signOut({ scope: 'local' });
        } catch (updateError) {
            setError(updateError instanceof Error ? updateError.message : 'Unable to update your password.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="mobile-safe-screen flex items-center justify-center bg-neutral px-4 py-10 sm:px-6 mobile-safe-bottom">
            <section className="w-full max-w-md rounded-[2rem] border border-border bg-white p-6 shadow-xl shadow-primary/10 sm:p-10" aria-labelledby="reset-password-title">
                <div className="mb-8 text-center">
                    <Link href="/" aria-label="QuickWeds home" className="inline-block">
                        <img src="/logo.png" alt="QuickWeds" className="mx-auto mb-4 h-20 w-auto object-contain" />
                    </Link>
                    <h1 id="reset-password-title" className="font-serif text-3xl font-bold text-primary">Reset your password</h1>
                    <p className="mt-2 text-sm text-text-secondary">Choose a secure password and get back to planning.</p>
                </div>

                {recoveryState === 'checking' && <LoadingState variant="panel" label="Checking your recovery link…" showProgress={false} />}

                {recoveryState === 'invalid' && (
                    <div className="space-y-6 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                            <TriangleAlert className="h-8 w-8" aria-hidden="true" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Reset link unavailable</h2>
                            <p className="mt-2 text-sm leading-6 text-text-secondary">
                                {error || 'This password reset link is missing, expired, or has already been used.'}
                            </p>
                        </div>
                        <Link href="/forgot-password" className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-primary px-5 py-3 font-bold text-white transition hover:bg-primary-hover">
                            Request a new reset link
                        </Link>
                    </div>
                )}

                {recoveryState === 'complete' && (
                    <div className="space-y-6 text-center" role="status">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-bg text-accent">
                            <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Password updated</h2>
                            <p className="mt-2 text-sm leading-6 text-text-secondary">Your new password is ready. Sign in again to continue.</p>
                        </div>
                        <Link href="/login" className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-primary px-5 py-3 font-bold text-white transition hover:bg-primary-hover">
                            Return to login
                        </Link>
                    </div>
                )}

                {recoveryState === 'ready' && (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</div>
                        )}

                        <div>
                            <label htmlFor="new-password" className="mb-2 block text-sm font-bold text-text-secondary">New password</label>
                            <div className="relative">
                                <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/50" aria-hidden="true" />
                                <input
                                    id="new-password"
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    autoComplete="new-password"
                                    minLength={8}
                                    required
                                    className="w-full rounded-2xl border border-border bg-neutral py-4 pl-12 pr-4 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
                                />
                            </div>
                            <p className="mt-2 text-xs text-text-secondary">Use at least 8 characters.</p>
                        </div>

                        <div>
                            <label htmlFor="confirm-password" className="mb-2 block text-sm font-bold text-text-secondary">Confirm new password</label>
                            <input
                                id="confirm-password"
                                type="password"
                                value={confirmation}
                                onChange={(event) => setConfirmation(event.target.value)}
                                autoComplete="new-password"
                                minLength={8}
                                required
                                className="w-full rounded-2xl border border-border bg-neutral px-4 py-4 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
                            />
                        </div>

                        <button type="submit" disabled={submitting} className="inline-flex min-h-[52px] w-full items-center justify-center gap-3 rounded-2xl bg-primary px-5 py-3 font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70">
                            {submitting && <LoadingState variant="inline" label="Updating password…" className="[&>svg]:h-5 [&>svg]:w-5" />}
                            {submitting ? 'Updating password…' : 'Update password'}
                        </button>
                    </form>
                )}
            </section>
        </main>
    );
}

