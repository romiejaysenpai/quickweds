'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Building2, Heart, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
    getClientAccountProfileForIntent,
    getRoleAwareRedirect,
    getSafeAppPath,
    type AccountType,
} from '@/lib/account';

function AccountTypeLoading() {
    return (
        <div className="mobile-safe-screen flex items-center justify-center bg-neutral">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
}

function AccountTypeOnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isAdmin, adminChecked, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<AccountType | null>(null);
    const [error, setError] = useState('');
    const nextPath = getSafeAppPath(searchParams?.get('next'), '');

    useEffect(() => {
        if (authLoading || !adminChecked) return;

        if (!user) {
            const loginNext = nextPath
                ? `/onboarding/account-type?next=${encodeURIComponent(nextPath)}`
                : '/onboarding/account-type';
            router.replace(`/login?next=${encodeURIComponent(loginNext)}`);
            return;
        }

        if (isAdmin) {
            router.replace(nextPath && !nextPath.startsWith('/onboarding/account-type') ? nextPath : '/dashboard');
            return;
        }

        const loadProfile = async () => {
            setLoading(true);
            setError('');

            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;

            if (!token) {
                setError('Please sign in again to choose your account type.');
                setLoading(false);
                return;
            }

            try {
                const profile = await getClientAccountProfileForIntent(token, nextPath);
                if (profile?.account_type) {
                    router.replace(getRoleAwareRedirect(profile.account_type, nextPath));
                    return;
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unable to load account profile.');
            } finally {
                setLoading(false);
            }
        };

        void loadProfile();
    }, [adminChecked, authLoading, isAdmin, nextPath, router, user]);

    const chooseAccountType = async (accountType: AccountType) => {
        setSaving(accountType);
        setError('');

        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;

        if (!token) {
            setSaving(null);
            setError('Please sign in again to choose your account type.');
            return;
        }

        try {
            const response = await fetch('/api/account/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ account_type: accountType }),
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Unable to save account type.');
            }

            router.replace(getRoleAwareRedirect(accountType, nextPath));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to save account type.');
            setSaving(null);
        }
    };

    if (authLoading || loading) {
        return <AccountTypeLoading />;
    }

    return (
        <div className="mobile-safe-screen bg-neutral px-4 py-8 text-foreground sm:px-6 sm:py-12">
            <div className="mx-auto max-w-5xl">
                <header className="mb-8 flex items-center justify-between">
                    <Link href="/" className="inline-flex items-center" aria-label="QuickWeds">
                        <img src="/logo.png" alt="QuickWeds" className="h-10 w-auto object-contain" />
                    </Link>
                    <span className="rounded-full border border-primary/15 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                        First step
                    </span>
                </header>

                <section className="overflow-hidden rounded-[2rem] border border-border bg-white shadow-2xl shadow-primary/10">
                    <div className="border-b border-border bg-gradient-to-br from-primary/10 via-white to-secondary/10 p-6 text-center sm:p-10">
                        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary shadow-lg shadow-primary/10">
                            <Sparkles className="h-6 w-6" />
                        </span>
                        <h1 className="mt-5 font-serif text-3xl font-bold leading-tight text-foreground sm:text-5xl">
                            How will you use QuickWeds?
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-text-secondary sm:text-base">
                            Choose one account type. This lets us send you to the right workspace every time you log in.
                        </p>
                    </div>

                    {error && (
                        <div className="mx-5 mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 sm:mx-8">
                            {error}
                        </div>
                    )}

                    <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-8">
                        <button
                            type="button"
                            onClick={() => chooseAccountType('couple')}
                            disabled={Boolean(saving)}
                            className="group rounded-2xl border border-border bg-neutral p-5 text-left transition hover:-translate-y-1 hover:border-primary/30 hover:bg-white hover:shadow-xl hover:shadow-primary/10 disabled:opacity-60 sm:p-6"
                        >
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                {saving === 'couple' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Heart className="h-5 w-5" />}
                            </span>
                            <h2 className="mt-5 font-serif text-2xl font-bold text-foreground">I am a couple</h2>
                            <p className="mt-3 text-sm leading-7 text-text-secondary">
                                Create a wedding website, manage RSVPs, use the builder, and unlock planning tools.
                            </p>
                            <span className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                                Go to couple dashboard <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => chooseAccountType('supplier')}
                            disabled={Boolean(saving)}
                            className="group rounded-2xl border border-border bg-neutral p-5 text-left transition hover:-translate-y-1 hover:border-primary/30 hover:bg-white hover:shadow-xl hover:shadow-primary/10 disabled:opacity-60 sm:p-6"
                        >
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                {saving === 'supplier' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Building2 className="h-5 w-5" />}
                            </span>
                            <h2 className="mt-5 font-serif text-2xl font-bold text-foreground">I am a supplier</h2>
                            <p className="mt-3 text-sm leading-7 text-text-secondary">
                                Create a business profile, submit your listing, and manage your supplier directory presence.
                            </p>
                            <span className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                                Go to supplier dashboard <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                            </span>
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default function AccountTypeOnboardingPage() {
    return (
        <Suspense fallback={<AccountTypeLoading />}>
            <AccountTypeOnboardingContent />
        </Suspense>
    );
}
