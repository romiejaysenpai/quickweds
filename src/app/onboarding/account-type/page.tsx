'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowRight,
    Building2,
    CalendarCheck,
    CheckCircle2,
    ClipboardList,
    Heart,
    ImagePlus,
    PartyPopper,
    Send,
    Sparkles,
    Users,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import LoadingState from '@/components/ui/LoadingState';
import { hasStoredSupabaseSession } from '@/lib/supabase-auth';
import { getCachedSession } from '@/lib/session-cache';
import {
    getClientAccountProfileForIntent,
    getRoleAwareRedirect,
    getSafeAppPath,
    setClientAccountType,
    type AccountType,
} from '@/lib/account';

type OnboardingStep = 'account' | 'goal' | 'ready';

const coupleGoals = [
    {
        id: 'site',
        title: 'Create our wedding site',
        body: 'Choose a design, add your details, and make a guest-ready home for the celebration.',
        icon: Heart,
        accent: 'bg-primary/10 text-primary',
    },
    {
        id: 'guests',
        title: 'Organize guests and RSVPs',
        body: 'Start with the moving parts that usually sprawl across texts, notes, and spreadsheets.',
        icon: Users,
        accent: 'bg-secondary/25 text-primary',
    },
    {
        id: 'planner',
        title: 'Open the planning checklist',
        body: 'Bring tasks, dates, budget notes, and vendors into one calm place.',
        icon: ClipboardList,
        accent: 'bg-accent/20 text-foreground',
    },
];

function AccountTypeLoading() {
    return (
        <div className="mobile-safe-screen flex items-center justify-center bg-neutral px-4">
            <LoadingState
                label="Loading your account…"
                description="Getting your next step ready."
                className="max-w-lg"
            />
        </div>
    );
}

function StepBadge({ step }: { step: OnboardingStep }) {
    const steps = [
        { id: 'account', label: 'Role' },
        { id: 'goal', label: 'Goal' },
        { id: 'ready', label: 'Ready' },
    ] as const;
    const activeIndex = steps.findIndex((item) => item.id === step);

    return (
        <div className="flex items-center justify-center gap-2">
            {steps.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                    <span
                        className={`flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-[10px] font-black uppercase tracking-[0.16em] transition ${
                            index <= activeIndex
                                ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                                : 'border-border bg-white text-text-secondary/70'
                        }`}
                    >
                        {item.label}
                    </span>
                    {index < steps.length - 1 && (
                        <span className={`h-px w-5 sm:w-8 ${index < activeIndex ? 'bg-primary' : 'bg-border'}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

function AccountTypeOnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isAdmin, adminChecked, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<AccountType | 'complete' | null>(null);
    const [error, setError] = useState('');
    const [step, setStep] = useState<OnboardingStep>('account');
    const [selectedGoal, setSelectedGoal] = useState(coupleGoals[0].id);
    const nextPath = useMemo(() => getSafeAppPath(searchParams?.get('next'), ''), [searchParams]);
    const selectedGoalDetail = coupleGoals.find((goal) => goal.id === selectedGoal) || coupleGoals[0];

    useEffect(() => {
        if (user || hasStoredSupabaseSession()) return;

        const loginNext = nextPath
            ? `/onboarding/account-type?next=${encodeURIComponent(nextPath)}`
            : '/onboarding/account-type';
        window.location.replace(`/login?next=${encodeURIComponent(loginNext)}`);
    }, [nextPath, user]);

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

            const { data } = await getCachedSession();
            const token = data.session?.access_token;

            if (!token) {
                setError('Please sign in again to choose your account type.');
                setLoading(false);
                return;
            }

            try {
                const profile = await getClientAccountProfileForIntent(token, nextPath);
                if (profile?.account_type === 'supplier') {
                    router.replace(getRoleAwareRedirect(profile.account_type, nextPath));
                    return;
                }

                if (profile?.account_type === 'couple') {
                    if (profile.onboarding_completed) {
                        router.replace(getRoleAwareRedirect(profile.account_type, nextPath));
                        return;
                    }

                    setStep('goal');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unable to load account profile.');
            } finally {
                setLoading(false);
            }
        };

        void loadProfile();
    }, [adminChecked, authLoading, isAdmin, nextPath, router, user]);

    const getAccessToken = async () => {
        const { data } = await getCachedSession();
        return data.session?.access_token || '';
    };

    const chooseAccountType = async (accountType: AccountType) => {
        setSaving(accountType);
        setError('');

        const token = await getAccessToken();

        if (!token) {
            setSaving(null);
            setError('Please sign in again to choose your account type.');
            return;
        }

        try {
            await setClientAccountType(token, accountType);

            if (accountType === 'supplier') {
                router.replace(getRoleAwareRedirect(accountType, nextPath));
                return;
            }

            setStep('goal');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to save account type.');
        } finally {
            setSaving(null);
        }
    };

    if (authLoading || loading) {
        return <AccountTypeLoading />;
    }

    return (
        <div className="mobile-safe-screen overflow-hidden bg-neutral px-4 py-6 text-foreground sm:px-6 sm:py-10">
            <div className="noise-overlay" />
            <div className="relative mx-auto max-w-6xl">
                <header className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
                    <Link href="/" className="inline-flex items-center" aria-label="QuickWeds">
                        <img src="/logo.png" alt="QuickWeds" className="h-10 w-auto object-contain transition hover:scale-105 sm:h-12" />
                    </Link>
                    <span className="rounded-full border border-primary/15 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-sm">
                        Welcome
                    </span>
                </header>

                <section className="relative overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-2xl shadow-primary/10 sm:rounded-[2rem]">
                    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-primary/12 via-white to-accent/20" />
                    <div className="relative grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
                        <aside className="border-b border-border bg-primary p-6 text-white sm:p-8 lg:border-b-0 lg:border-r">
                            <div className="flex min-h-full flex-col justify-between gap-8">
                                <div>
                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-white/80">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Quick start
                                    </span>
                                    <h1 className="mt-5 font-serif text-4xl font-black leading-tight sm:text-5xl">
                                        Your wedding workspace, gently set up.
                                    </h1>
                                    <p className="mt-4 max-w-md text-sm font-semibold leading-7 text-white/78 sm:text-base">
                                        We will point you toward the right first move, then you can build, plan, and share at your pace.
                                    </p>
                                </div>

                                <div className="grid gap-3">
                                    {[
                                        { label: 'Site', icon: Heart },
                                        { label: 'Details', icon: ImagePlus },
                                        { label: 'RSVPs', icon: Send },
                                        { label: 'Planner', icon: CalendarCheck },
                                    ].map((item) => (
                                        <div key={item.label} className="group flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-lg shadow-black/10">
                                                <item.icon className="h-4 w-4" />
                                            </span>
                                            <span className="text-sm font-black">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>

                        <div className="relative p-5 sm:p-8 lg:p-10">
                            <StepBadge step={step} />

                            {error && (
                                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                                    {error}
                                </div>
                            )}

                            <AnimatePresence mode="wait">
                                {step === 'account' && (
                                    <motion.div
                                        key="account"
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -12 }}
                                        className="pt-8"
                                    >
                                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">First step</p>
                                        <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-foreground sm:text-5xl">
                                            How will you use QuickWeds?
                                        </h2>
                                        <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary sm:text-base">
                                            Choose one account type. Couples get the guided wedding setup. Suppliers go straight to their profile workspace.
                                        </p>

                                        <div className="mt-7 grid gap-4 sm:grid-cols-2">
                                            <button
                                                type="button"
                                                onClick={() => chooseAccountType('couple')}
                                                disabled={Boolean(saving)}
                                                className="group rounded-2xl border border-primary/15 bg-neutral p-5 text-left transition hover:-translate-y-1 hover:border-primary/40 hover:bg-white hover:shadow-xl hover:shadow-primary/10 disabled:opacity-60 sm:p-6"
                                            >
                                                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                                                    {saving === 'couple' ? <LoadingState variant="inline" label="Creating couple account…" /> : <Heart className="h-5 w-5" />}
                                                </span>
                                                <h3 className="mt-5 font-serif text-2xl font-bold text-foreground">I am a couple</h3>
                                                <p className="mt-3 text-sm leading-7 text-text-secondary">
                                                    Create your wedding website, organize details, manage RSVPs, and start your planner.
                                                </p>
                                                <span className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                                                    Begin setup <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                                                </span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => chooseAccountType('supplier')}
                                                disabled={Boolean(saving)}
                                                className="group rounded-2xl border border-border bg-white p-5 text-left transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 disabled:opacity-60 sm:p-6"
                                            >
                                                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                                                    {saving === 'supplier' ? <LoadingState variant="inline" label="Creating supplier account…" /> : <Building2 className="h-5 w-5" />}
                                                </span>
                                                <h3 className="mt-5 font-serif text-2xl font-bold text-foreground">I am a supplier</h3>
                                                <p className="mt-3 text-sm leading-7 text-text-secondary">
                                                    Create a business profile, submit your listing, and manage your directory presence.
                                                </p>
                                                <span className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                                                    Go to supplier dashboard <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                                                </span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 'goal' && (
                                    <motion.div
                                        key="goal"
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -12 }}
                                        className="pt-8"
                                    >
                                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Your first move</p>
                                        <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-foreground sm:text-5xl">
                                            What would feel best to set up first?
                                        </h2>
                                        <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary sm:text-base">
                                            Pick the goal that matches where your head is today. You can use every QuickWeds tool later.
                                        </p>

                                        <div className="mt-7 grid gap-3">
                                            {coupleGoals.map((goal) => {
                                                const Icon = goal.icon;
                                                const isSelected = selectedGoal === goal.id;
                                                return (
                                                    <button
                                                        key={goal.id}
                                                        type="button"
                                                        onClick={() => setSelectedGoal(goal.id)}
                                                        className={`group flex items-start gap-4 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10 ${
                                                            isSelected ? 'border-primary/40 bg-primary/5' : 'border-border bg-white hover:border-primary/25'
                                                        }`}
                                                    >
                                                        <span className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${goal.accent}`}>
                                                            <Icon className="h-5 w-5" />
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block font-serif text-xl font-bold text-foreground">{goal.title}</span>
                                                            <span className="mt-1 block text-sm leading-6 text-text-secondary">{goal.body}</span>
                                                        </span>
                                                        <span className={`mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border transition ${isSelected ? 'border-primary bg-primary text-white' : 'border-border text-transparent'}`}>
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                                            <button
                                                type="button"
                                                onClick={() => setStep('ready')}
                                                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-xl shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-hover"
                                            >
                                                Continue <ArrowRight className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setStep('account')}
                                                className="inline-flex min-h-[52px] items-center justify-center rounded-2xl border border-border bg-white px-6 py-3 text-sm font-bold text-text-secondary transition hover:border-primary/30 hover:text-primary"
                                            >
                                                Back
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 'ready' && (
                                    <motion.div
                                        key="ready"
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -12 }}
                                        className="pt-8"
                                    >
                                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <PartyPopper className="h-7 w-7" />
                                        </span>
                                        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.24em] text-primary">Ready when you are</p>
                                        <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-foreground sm:text-5xl">
                                            Start with: {selectedGoalDetail.title.toLowerCase()}.
                                        </h2>
                                        <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary sm:text-base">
                                            We will keep a small dashboard checklist available until you mark onboarding complete.
                                        </p>

                                        <div className="mt-7 rounded-2xl border border-primary/15 bg-neutral p-4">
                                            <div className="flex items-start gap-3">
                                                <Sparkles className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                                                <div>
                                                    <p className="font-serif text-xl font-bold text-foreground">Your dashboard will stay flexible.</p>
                                                    <p className="mt-1 text-sm leading-6 text-text-secondary">
                                                        Build the site first, or open the dashboard to explore planner tools, guests, and sharing.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                                            <button
                                                type="button"
                                                onClick={() => router.replace('/builder')}
                                                disabled={saving === 'complete'}
                                                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-xl shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-hover disabled:opacity-70"
                                            >
                                                {saving === 'complete' ? <LoadingState variant="inline" label="Opening your site builder…" /> : <Heart className="h-4 w-4" />}
                                                Create Your Free Site
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => router.replace('/dashboard')}
                                                disabled={saving === 'complete'}
                                                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-6 py-3 text-sm font-bold text-primary transition hover:-translate-y-0.5 hover:bg-primary hover:text-white disabled:opacity-70"
                                            >
                                                Open Dashboard <ArrowRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
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
