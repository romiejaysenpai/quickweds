'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    CalendarCheck,
    Check,
    CheckCircle2,
    ClipboardList,
    DollarSign,
    Heart,
    MapPin,
    PartyPopper,
    QrCode,
    Sparkles,
    Users,
    Utensils,
    Globe,
    Layers,
    Clock,
    Camera,
    CheckCheck,
    Loader2,
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
    saveClientOnboardingSurvey,
    setClientAccountType,
    type AccountType,
    type OnboardingDateStatus,
    type OnboardingSurveyData,
} from '@/lib/account';

const LOCAL_STORAGE_DRAFT_KEY = 'quickweds_onboarding_survey_draft_v1';

type SurveyStep = 'account' | 'wedding' | 'journey' | 'about' | 'ready';

const GUEST_COUNT_OPTIONS = [
    { id: 'Under 50', label: 'Under 50', desc: 'Intimate / Micro wedding', count: '<50' },
    { id: '50–100', label: '50–100', desc: 'Small to medium celebration', count: '50-100' },
    { id: '101–200', label: '101–200', desc: 'Classic wedding size', count: '101-200' },
    { id: '201–300', label: '201–300', desc: 'Large celebration', count: '201-300' },
    { id: '300+', label: '300+', desc: 'Grand gala / Big wedding', count: '300+' },
];

const PLANNING_STAGE_OPTIONS = [
    {
        id: 'Just starting',
        title: 'Just starting',
        subtitle: 'Beginning our journey, gathering inspiration and budget ideas.',
        icon: Sparkles,
        accent: 'bg-primary/10 text-primary',
    },
    {
        id: 'Planning already',
        title: 'Planning already',
        subtitle: 'Date or venue in motion, locking in core vendors and details.',
        icon: CalendarCheck,
        accent: 'bg-secondary/25 text-primary',
    },
    {
        id: 'Most things are booked',
        title: 'Most things are booked',
        subtitle: 'Main vendors secured, finalizing guests, RSVPs and seating.',
        icon: CheckCheck,
        accent: 'bg-emerald-50 text-emerald-600',
    },
    {
        id: 'Wedding is coming soon',
        title: 'Wedding is coming soon',
        subtitle: 'Final countdown! Week-of timeline and day-of coordination.',
        icon: Clock,
        accent: 'bg-amber-50 text-amber-600',
    },
    {
        id: 'Already married / post-wedding',
        title: 'Already married / post-wedding',
        subtitle: 'Sharing guest photos, sending thank-you notes, and memories.',
        icon: PartyPopper,
        accent: 'bg-indigo-50 text-indigo-600',
    },
];

const PRIMARY_NEEDS_OPTIONS = [
    { id: 'Wedding website', label: 'Wedding website', icon: Globe },
    { id: 'Guest list & RSVP', label: 'Guest list & RSVP', icon: Users },
    { id: 'Seating arrangement', label: 'Seating arrangement', icon: Layers },
    { id: 'Budget tracking', label: 'Budget tracking', icon: DollarSign },
    { id: 'Wedding checklist', label: 'Wedding checklist', icon: ClipboardList },
    { id: 'Vendor management', label: 'Vendor management', icon: Utensils },
    { id: 'Guest photos', label: 'Guest photos', icon: Camera },
    { id: 'Invitations / QR codes', label: 'Invitations / QR codes', icon: QrCode },
    { id: 'Wedding-day coordination', label: 'Wedding-day coordination', icon: Heart },
];

const USER_ROLE_OPTIONS = [
    { id: 'Bride', label: 'Bride', emoji: '👰' },
    { id: 'Groom', label: 'Groom', emoji: '🤵' },
    { id: 'Couple', label: 'Couple (Both of us)', emoji: '💑' },
    { id: 'Wedding planner / coordinator', label: 'Wedding planner / coordinator', emoji: '📋' },
    { id: 'Family member', label: 'Family member', emoji: '👨‍👩‍👧' },
    { id: 'Other', label: 'Other', emoji: '✨' },
];

const ACQUISITION_SOURCE_OPTIONS = [
    { id: 'Facebook', label: 'Facebook', badge: 'Social' },
    { id: 'TikTok', label: 'TikTok', badge: 'Social' },
    { id: 'Instagram', label: 'Instagram', badge: 'Social' },
    { id: 'Google', label: 'Google Search', badge: 'Search' },
    { id: 'Friend / referral', label: 'Friend / Referral', badge: 'Word of mouth' },
    { id: 'Wedding supplier', label: 'Wedding Supplier', badge: 'Partner' },
    { id: 'Wedding coordinator', label: 'Wedding Coordinator', badge: 'Pro' },
    { id: 'Other', label: 'Other', badge: 'Web' },
];

const POPULAR_COUNTRIES = [
    'United States',
    'Philippines',
    'United Kingdom',
    'Canada',
    'Australia',
    'Singapore',
    'New Zealand',
];

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
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

function SurveyProgressBar({ currentStep }: { currentStep: 'wedding' | 'journey' | 'about' }) {
    const stepNumber = currentStep === 'wedding' ? 1 : currentStep === 'journey' ? 2 : 3;
    const progressPercent = currentStep === 'wedding' ? 33 : currentStep === 'journey' ? 66 : 100;

    return (
        <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.16em] text-text-secondary">
                <span className="text-primary font-bold">Step {stepNumber} of 3</span>
                <span>{currentStep === 'wedding' ? 'Your Wedding' : currentStep === 'journey' ? 'Planning Journey' : 'About You'}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-primary/10">
                <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: `${progressPercent - 30}%` }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
}

function AccountTypeOnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isAdmin, adminChecked, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState<SurveyStep>('account');

    // Survey Form State
    const [dateStatus, setDateStatus] = useState<OnboardingDateStatus>('exact');
    const [exactDate, setExactDate] = useState('');
    const [monthVal, setMonthVal] = useState('June');
    const [yearVal, setYearVal] = useState(new Date().getFullYear().toString());
    const [country, setCountry] = useState('');
    const [city, setCity] = useState('');
    const [guestCount, setGuestCount] = useState('101–200');
    const [planningStage, setPlanningStage] = useState('Just starting');
    const [primaryNeeds, setPrimaryNeeds] = useState<string[]>(['Wedding website', 'Guest list & RSVP']);
    const [userRole, setUserRole] = useState('Bride');
    const [acquisitionSource, setAcquisitionSource] = useState('Instagram');

    const nextPath = useMemo(() => getSafeAppPath(searchParams?.get('next'), ''), [searchParams]);

    const currentYear = new Date().getFullYear();
    const years = useMemo(() => Array.from({ length: 6 }, (_, i) => (currentYear + i).toString()), [currentYear]);

    // Format computed wedding date based on status
    const computedWeddingDate = useMemo(() => {
        if (dateStatus === 'exact') return exactDate || null;
        if (dateStatus === 'month_year') return `${monthVal} ${yearVal}`;
        return 'Not decided yet';
    }, [dateStatus, exactDate, monthVal, yearVal]);

    // Restore draft from localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const raw = localStorage.getItem(LOCAL_STORAGE_DRAFT_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.dateStatus) setDateStatus(parsed.dateStatus);
                if (parsed.exactDate) setExactDate(parsed.exactDate);
                if (parsed.monthVal) setMonthVal(parsed.monthVal);
                if (parsed.yearVal) setYearVal(parsed.yearVal);
                if (parsed.country) setCountry(parsed.country);
                if (parsed.city) setCity(parsed.city);
                if (parsed.guestCount) setGuestCount(parsed.guestCount);
                if (parsed.planningStage) setPlanningStage(parsed.planningStage);
                if (Array.isArray(parsed.primaryNeeds)) setPrimaryNeeds(parsed.primaryNeeds);
                if (parsed.userRole) setUserRole(parsed.userRole);
                if (parsed.acquisitionSource) setAcquisitionSource(parsed.acquisitionSource);
                if (parsed.step && ['wedding', 'journey', 'about'].includes(parsed.step)) {
                    setStep(parsed.step as SurveyStep);
                }
            }
        } catch {
            // Ignore parse errors
        }
    }, []);

    // Sync draft to localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const draft = {
                step,
                dateStatus,
                exactDate,
                monthVal,
                yearVal,
                country,
                city,
                guestCount,
                planningStage,
                primaryNeeds,
                userRole,
                acquisitionSource,
            };
            localStorage.setItem(LOCAL_STORAGE_DRAFT_KEY, JSON.stringify(draft));
        } catch {
            // Ignore storage errors
        }
    }, [step, dateStatus, exactDate, monthVal, yearVal, country, city, guestCount, planningStage, primaryNeeds, userRole, acquisitionSource]);

    // Redirect unauthenticated users
    useEffect(() => {
        if (user || hasStoredSupabaseSession()) return;

        const loginNext = nextPath
            ? `/onboarding/account-type?next=${encodeURIComponent(nextPath)}`
            : '/onboarding/account-type';
        window.location.replace(`/login?next=${encodeURIComponent(loginNext)}`);
    }, [nextPath, user]);

    // Check account status and handle existing users
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
                setError('Please sign in again to continue onboarding.');
                setLoading(false);
                return;
            }

            try {
                const profile = await getClientAccountProfileForIntent(token, nextPath);
                if (!profile?.account_type) {
                    setStep('account');
                } else if (profile.account_type === 'supplier') {
                    router.replace(getRoleAwareRedirect(profile.account_type, nextPath));
                    return;
                } else if (profile.account_type === 'couple') {
                    if (profile.onboarding_completed) {
                        router.replace(getRoleAwareRedirect(profile.account_type, nextPath));
                        return;
                    }

                    // Restore saved server state if available
                    if (profile.wedding_country) setCountry(profile.wedding_country);
                    if (profile.wedding_city) setCity(profile.wedding_city);
                    if (profile.planning_stage) setPlanningStage(profile.planning_stage);
                    if (profile.primary_needs?.length) setPrimaryNeeds(profile.primary_needs);
                    if (profile.estimated_guest_count) setGuestCount(profile.estimated_guest_count);
                    if (profile.user_role) setUserRole(profile.user_role);
                    if (profile.acquisition_source) setAcquisitionSource(profile.acquisition_source);

                    setStep((prev) => (prev === 'account' ? 'wedding' : prev));
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
        setSaving(true);
        setError('');

        const token = await getAccessToken();

        if (!token) {
            setSaving(false);
            setError('Please sign in again to continue.');
            return;
        }

        try {
            await setClientAccountType(token, accountType);

            if (accountType === 'supplier') {
                router.replace(getRoleAwareRedirect(accountType, nextPath));
                return;
            }

            setStep('wedding');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to save account type.');
        } finally {
            setSaving(false);
        }
    };

    const toggleNeed = (needId: string) => {
        setPrimaryNeeds((prev) =>
            prev.includes(needId) ? prev.filter((id) => id !== needId) : [...prev, needId]
        );
    };

    const handleCompleteSurvey = async () => {
        setSaving(true);
        setError('');

        const token = await getAccessToken();
        if (!token) {
            setSaving(false);
            setError('Please sign in again to finalize your space.');
            return;
        }

        const surveyPayload: OnboardingSurveyData = {
            wedding_date: computedWeddingDate,
            wedding_date_status: dateStatus,
            wedding_country: country.trim() || null,
            wedding_city: city.trim() || null,
            planning_stage: planningStage,
            primary_needs: primaryNeeds.length > 0 ? primaryNeeds : ['Wedding website'],
            estimated_guest_count: guestCount,
            user_role: userRole,
            acquisition_source: acquisitionSource,
            onboarding_draft: null,
        };

        try {
            await saveClientOnboardingSurvey(token, surveyPayload, true);
            if (typeof window !== 'undefined') {
                localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
            }
            setStep('ready');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to complete onboarding. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleFinishAndEnterDashboard = () => {
        router.replace(nextPath && !nextPath.startsWith('/onboarding/account-type') ? nextPath : '/dashboard');
    };

    if (authLoading || loading) {
        return <AccountTypeLoading />;
    }

    return (
        <div className="mobile-safe-screen overflow-hidden bg-[#FFF8F9] px-4 py-6 text-foreground sm:px-6 sm:py-10">
            <div className="noise-overlay" />
            <div className="relative mx-auto max-w-4xl">
                {/* Header */}
                <header className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
                    <Link href="/" className="inline-flex items-center gap-2" aria-label="QuickWeds">
                        <img src="/logo.png" alt="QuickWeds" className="h-9 w-auto object-contain transition hover:scale-105 sm:h-11" />
                        <span className="font-serif font-black text-xl text-primary tracking-tight">QuickWeds</span>
                    </Link>
                    <span className="rounded-full border border-primary/15 bg-white px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-sm">
                        Smart Setup
                    </span>
                </header>

                {error && (
                    <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 shadow-sm">
                        {error}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {/* STEP 0: Role Selection */}
                    {step === 'account' && (
                        <motion.section
                            key="step-account"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="rounded-3xl border border-primary/15 bg-white p-6 shadow-2xl shadow-primary/10 sm:p-10"
                        >
                            <div className="max-w-2xl">
                                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Welcome to QuickWeds
                                </span>
                                <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                    How will you use QuickWeds?
                                </h1>
                                <p className="mt-2 text-sm leading-6 text-text-secondary sm:text-base">
                                    Choose your account role so we can tailor your workspace.
                                </p>
                            </div>

                            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => void chooseAccountType('couple')}
                                    disabled={saving}
                                    className="group relative flex flex-col justify-between rounded-2xl border-2 border-primary/25 bg-white p-6 text-left shadow-lg shadow-primary/5 transition hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/15 disabled:opacity-50"
                                >
                                    <div>
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                                            <Heart className="h-6 w-6" />
                                        </div>
                                        <h3 className="mt-4 font-serif text-xl font-bold text-foreground">
                                            I am a Couple / Organizing My Wedding
                                        </h3>
                                        <p className="mt-2 text-xs leading-5 text-text-secondary">
                                            Create a free wedding website, manage RSVPs, seating charts, checklists, and budgets.
                                        </p>
                                    </div>
                                    <div className="mt-6 flex items-center gap-2 text-xs font-bold text-primary">
                                        <span>Continue with Couple setup</span>
                                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => void chooseAccountType('supplier')}
                                    disabled={saving}
                                    className="group relative flex flex-col justify-between rounded-2xl border border-border bg-white p-6 text-left transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 disabled:opacity-50"
                                >
                                    <div>
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral text-text-secondary transition group-hover:bg-primary/10 group-hover:text-primary">
                                            <Building2 className="h-6 w-6" />
                                        </div>
                                        <h3 className="mt-4 font-serif text-xl font-bold text-foreground">
                                            I am a Wedding Supplier / Vendor
                                        </h3>
                                        <p className="mt-2 text-xs leading-5 text-text-secondary">
                                            List your services in our vendor directory and connect with couples planning their big day.
                                        </p>
                                    </div>
                                    <div className="mt-6 flex items-center gap-2 text-xs font-bold text-text-secondary group-hover:text-primary">
                                        <span>Go to Supplier Dashboard</span>
                                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                                    </div>
                                </button>
                            </div>
                        </motion.section>
                    )}

                    {/* STEP 1: Your Wedding */}
                    {step === 'wedding' && (
                        <motion.section
                            key="step-wedding"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="rounded-3xl border border-primary/15 bg-white p-6 shadow-2xl shadow-primary/10 sm:p-10"
                        >
                            <SurveyProgressBar currentStep="wedding" />

                            <div className="mt-6">
                                <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                    Tell us about your wedding
                                </h1>
                                <p className="mt-1 text-xs sm:text-sm text-text-secondary">
                                    These details help us customize your timeline, RSVP countdown, and guest limits.
                                </p>
                            </div>

                            <div className="mt-8 space-y-6">
                                {/* 1. Wedding Date */}
                                <div className="space-y-3">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                                        1. When is your wedding?
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'exact', label: 'Exact Date' },
                                            { id: 'month_year', label: 'Month & Year' },
                                            { id: 'undecided', label: 'Not Decided' },
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setDateStatus(opt.id as OnboardingDateStatus)}
                                                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                                                    dateStatus === opt.id
                                                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                                                        : 'bg-neutral/50 text-text-secondary border-border hover:bg-neutral'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>

                                    {dateStatus === 'exact' && (
                                        <div className="mt-3">
                                            <input
                                                type="date"
                                                value={exactDate}
                                                onChange={(e) => setExactDate(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-border bg-neutral/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
                                            />
                                        </div>
                                    )}

                                    {dateStatus === 'month_year' && (
                                        <div className="mt-3 grid grid-cols-2 gap-3">
                                            <select
                                                value={monthVal}
                                                onChange={(e) => setMonthVal(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-border bg-neutral/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
                                            >
                                                {MONTHS.map((m) => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                            <select
                                                value={yearVal}
                                                onChange={(e) => setYearVal(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-border bg-neutral/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
                                            >
                                                {years.map((y) => (
                                                    <option key={y} value={y}>{y}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {dateStatus === 'undecided' && (
                                        <p className="text-xs text-text-secondary/70 italic bg-neutral/30 p-3 rounded-xl border border-border/60">
                                            No worries! You can set or change your wedding date anytime from your workspace.
                                        </p>
                                    )}
                                </div>

                                {/* 2. Wedding Location */}
                                <div className="space-y-3 pt-4 border-t border-border/70">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                                        2. Where will your wedding be?
                                    </label>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-text-secondary mb-1">Country</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Philippines, United States"
                                                value={country}
                                                onChange={(e) => setCountry(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-border bg-neutral/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
                                            />
                                            {/* Quick pills */}
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {POPULAR_COUNTRIES.slice(0, 4).map((c) => (
                                                    <button
                                                        key={c}
                                                        type="button"
                                                        onClick={() => setCountry(c)}
                                                        className="text-[10px] px-2 py-0.5 rounded-md bg-neutral border border-border/80 text-text-secondary hover:text-primary hover:border-primary/40 transition-colors"
                                                    >
                                                        {c}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold text-text-secondary mb-1">City / Province / Prefecture</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Tagaytay, New York, Bali"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-border bg-neutral/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Estimated Guest Count */}
                                <div className="space-y-3 pt-4 border-t border-border/70">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                                        3. Estimated number of guests
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                        {GUEST_COUNT_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setGuestCount(opt.id)}
                                                className={`p-3 rounded-2xl border text-center transition-all ${
                                                    guestCount === opt.id
                                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]'
                                                        : 'bg-white border-border text-foreground hover:border-primary/40 hover:bg-neutral/40'
                                                }`}
                                            >
                                                <p className="font-bold text-sm">{opt.label}</p>
                                                <p className={`text-[10px] mt-0.5 ${guestCount === opt.id ? 'text-white/80' : 'text-text-secondary'}`}>{opt.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-between pt-6 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setStep('account')}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-text-secondary hover:text-foreground"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep('journey')}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
                                >
                                    Next: Planning Journey <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.section>
                    )}

                    {/* STEP 2: Planning Journey */}
                    {step === 'journey' && (
                        <motion.section
                            key="step-journey"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="rounded-3xl border border-primary/15 bg-white p-6 shadow-2xl shadow-primary/10 sm:p-10"
                        >
                            <SurveyProgressBar currentStep="journey" />

                            <div className="mt-6">
                                <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                    Your Planning Journey
                                </h1>
                                <p className="mt-1 text-xs sm:text-sm text-text-secondary">
                                    We’ll highlight the right tools at the right moment for your stage.
                                </p>
                            </div>

                            <div className="mt-8 space-y-6">
                                {/* 4. Planning Stage */}
                                <div className="space-y-3">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                                        4. What stage are you currently in?
                                    </label>
                                    <div className="grid gap-2.5 sm:grid-cols-2">
                                        {PLANNING_STAGE_OPTIONS.map((stage) => {
                                            const Icon = stage.icon;
                                            const isSelected = planningStage === stage.id;
                                            return (
                                                <button
                                                    key={stage.id}
                                                    type="button"
                                                    onClick={() => setPlanningStage(stage.id)}
                                                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                                                        isSelected
                                                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                                                            : 'border-border bg-white hover:border-primary/30 hover:bg-neutral/30'
                                                    }`}
                                                >
                                                    <div className={`p-2.5 rounded-xl shrink-0 ${stage.accent}`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-sm text-foreground">{stage.title}</p>
                                                        <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{stage.subtitle}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 5. Primary Needs */}
                                <div className="space-y-3 pt-4 border-t border-border/70">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                                            5. What do you need the most help with?
                                        </label>
                                        <span className="text-[10px] text-text-secondary font-semibold">Select all that apply</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                        {PRIMARY_NEEDS_OPTIONS.map((need) => {
                                            const Icon = need.icon;
                                            const isSelected = primaryNeeds.includes(need.id);
                                            return (
                                                <button
                                                    key={need.id}
                                                    type="button"
                                                    onClick={() => toggleNeed(need.id)}
                                                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                                                        isSelected
                                                            ? 'bg-primary text-white border-primary shadow-md shadow-primary/15 scale-[1.01]'
                                                            : 'bg-neutral/40 border-border text-foreground hover:border-primary/40 hover:bg-white'
                                                    }`}
                                                >
                                                    <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-xs font-bold line-clamp-1">{need.label}</span>
                                                    {isSelected && <Check className="w-3.5 h-3.5 ml-auto shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-between pt-6 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setStep('wedding')}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-text-secondary hover:text-foreground"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep('about')}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
                                >
                                    Next: About You <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.section>
                    )}

                    {/* STEP 3: About You */}
                    {step === 'about' && (
                        <motion.section
                            key="step-about"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="rounded-3xl border border-primary/15 bg-white p-6 shadow-2xl shadow-primary/10 sm:p-10"
                        >
                            <SurveyProgressBar currentStep="about" />

                            <div className="mt-6">
                                <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                    Almost done! Tell us about you
                                </h1>
                                <p className="mt-1 text-xs sm:text-sm text-text-secondary">
                                    Help us personalize your dashboard greeting and recommendations.
                                </p>
                            </div>

                            <div className="mt-8 space-y-6">
                                {/* 6. User Role */}
                                <div className="space-y-3">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                                        6. Who are you?
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                        {USER_ROLE_OPTIONS.map((role) => (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() => setUserRole(role.id)}
                                                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                                                    userRole === role.id
                                                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/15 scale-[1.01]'
                                                        : 'bg-white border-border text-foreground hover:border-primary/40 hover:bg-neutral/40'
                                                }`}
                                            >
                                                <span className="text-xl">{role.emoji}</span>
                                                <span className="text-xs font-bold line-clamp-1">{role.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 7. Acquisition Source */}
                                <div className="space-y-3 pt-4 border-t border-border/70">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                                        7. How did you hear about QuickWeds?
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                        {ACQUISITION_SOURCE_OPTIONS.map((src) => (
                                            <button
                                                key={src.id}
                                                type="button"
                                                onClick={() => setAcquisitionSource(src.id)}
                                                className={`p-3 rounded-2xl border text-center transition-all ${
                                                    acquisitionSource === src.id
                                                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/15 scale-[1.01]'
                                                        : 'bg-white border-border text-foreground hover:border-primary/40 hover:bg-neutral/40'
                                                }`}
                                            >
                                                <p className="text-xs font-bold">{src.label}</p>
                                                <span className={`inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded ${
                                                    acquisitionSource === src.id ? 'bg-white/20 text-white' : 'bg-neutral text-text-secondary'
                                                }`}>
                                                    {src.badge}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-between pt-6 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setStep('journey')}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-text-secondary hover:text-foreground"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCompleteSurvey}
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white text-sm font-bold shadow-xl shadow-primary/25 hover:bg-primary-hover transition-all disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Preparing Your Space...
                                        </>
                                    ) : (
                                        <>
                                            Complete Setup 🎉
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.section>
                    )}

                    {/* READY / CELEBRATION SCREEN */}
                    {step === 'ready' && (
                        <motion.section
                            key="step-ready"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-3xl border border-primary/15 bg-white p-8 text-center shadow-2xl shadow-primary/15 sm:p-12"
                        >
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-primary">
                                <PartyPopper className="w-10 h-10 animate-bounce" />
                            </div>

                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black uppercase tracking-wider mb-3">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Setup Complete
                            </span>

                            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                                Your QuickWeds space is ready 🎉
                            </h1>

                            <p className="mt-3 max-w-lg mx-auto text-sm sm:text-base text-text-secondary leading-relaxed">
                                We’ve tailored your workspace for {guestCount} guests, prioritizing your key needs in <span className="font-bold text-foreground">{primaryNeeds.slice(0, 2).join(' & ')}</span>.
                            </p>

                            {/* Summary Cards */}
                            <div className="mt-8 grid sm:grid-cols-3 gap-3 max-w-xl mx-auto text-left">
                                <div className="p-3.5 rounded-2xl bg-neutral/40 border border-border">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-text-secondary">Wedding Date</p>
                                    <p className="font-bold text-sm text-foreground mt-0.5 truncate">{computedWeddingDate}</p>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-neutral/40 border border-border">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-text-secondary">Location</p>
                                    <p className="font-bold text-sm text-foreground mt-0.5 truncate">{city ? `${city}, ${country}` : country || 'Location Pending'}</p>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-neutral/40 border border-border">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-text-secondary">Stage</p>
                                    <p className="font-bold text-sm text-foreground mt-0.5 truncate">{planningStage}</p>
                                </div>
                            </div>

                            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleFinishAndEnterDashboard}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-bold text-base shadow-xl shadow-primary/25 hover:bg-primary-hover transition-all"
                                >
                                    Enter My Dashboard <ArrowRight className="w-5 h-5" />
                                </button>
                                <Link
                                    href="/builder"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-primary/20 bg-primary/5 text-primary font-bold text-base hover:bg-primary/10 transition-all"
                                >
                                    Create Wedding Website
                                </Link>
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>
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
