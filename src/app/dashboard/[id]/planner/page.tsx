'use client';

import { useState, useEffect, use, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Circle, Plus, Trash2, ListTodo, Wallet, Users, LayoutDashboard, ArrowLeft, Loader2, PieChart as PieChartIcon, TrendingDown, DollarSign, Layout, Camera, Mail, LockKeyhole, Sparkles, Search, Home, ChevronDown, CalendarDays, Utensils, Clock, Image as ImageIcon, Download, Plane, MapPin, RefreshCw, Link as LinkIcon, Edit2, Save, X, Send, UserCheck, ClipboardCheck, QrCode } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import UpgradeButton from '@/components/UpgradeButton';
import { getClientAccountProfile, getRoleAwareRedirect, hasAccountPro } from '@/lib/account';
import { EMPTY_PLANNER_USAGE, FREE_PLAN_LIMITS, type PlannerUsage } from '@/lib/planner-limits';
import { getCachedSession } from '@/lib/session-cache';
import { DEFAULT_ENTOURAGE_PROPOSAL_TEMPLATE_KEY, ENTOURAGE_PROPOSAL_TEMPLATES, getEntourageProposalTemplate, getEntourageCardTheme } from '@/lib/entourage-proposal-templates';
import { EntourageProposalCustomizerSection } from '@/components/EntourageProposalCustomizerSection';
import { SUPPORTED_CURRENCIES, getCurrencySymbol, normalizeCurrencyCode } from '@/lib/currency';

const SeatingChartBuilder = dynamic(() => import('@/components/dashboard/SeatingChartBuilder'), {
    loading: () => (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-border bg-white p-8 text-center soft-shadow">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-sm font-bold text-text-secondary">Loading seating chart...</p>
        </div>
    ),
});
const PhotoSharingManager = dynamic(() => import('@/components/dashboard/PhotoSharingManager'), {
    loading: () => (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-border bg-white p-8 text-center soft-shadow">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-sm font-bold text-text-secondary">Loading photo sharing...</p>
        </div>
    ),
});
const LazyBudgetPieChart = dynamic(() => import('@/components/dashboard/LazyBudgetPieChart'), {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse rounded-full bg-neutral/50" />,
});

const PLANNER_TABS = ['checklist', 'entourage', 'calendar', 'budget', 'food', 'vendors', 'seating', 'photos', 'thanks', 'honeymoon'] as const;
type PlannerTab = typeof PLANNER_TABS[number];
type VendorPaymentStatus = 'not paid' | 'pending' | 'paid';

const PLANNER_TAB_DETAILS: {
    tab: PlannerTab;
    label: string;
    icon: typeof ListTodo;
    headline: string;
    body: string;
}[] = [
    {
        tab: 'checklist',
        label: 'Checklist',
        icon: ListTodo,
        headline: 'Checklist is part of Planner Pro',
        body: 'Plan every task from the first booking to the final wedding-week details.',
    },
    {
        tab: 'entourage',
        label: 'Entourage',
        icon: UserCheck,
        headline: 'Entourage proposals are part of your planner',
        body: 'Invite your wedding party, sponsors, and special helpers, then track who accepted or declined.',
    },
    {
        tab: 'calendar',
        label: 'Calendar',
        icon: CalendarDays,
        headline: 'Calendar is part of Planner Pro',
        body: 'Keep deadlines, appointments, reminders, and supplier schedules in one place.',
    },
    {
        tab: 'budget',
        label: 'Budgets',
        icon: Wallet,
        headline: 'Budgets is part of Planner Pro',
        body: 'Track estimates, paid suppliers, pending balances, and your total wedding spend.',
    },
    {
        tab: 'food',
        label: 'Food',
        icon: Utensils,
        headline: 'Food is part of Planner Pro',
        body: 'Organize menus, drinks, caterer notes, quantities, and service details.',
    },
    {
        tab: 'vendors',
        label: 'Suppliers',
        icon: Users,
        headline: 'Suppliers is part of Planner Pro',
        body: 'Manage contacts, payment status, supplier roles, notes, and saved directory picks.',
    },
    {
        tab: 'seating',
        label: 'Seating',
        icon: Layout,
        headline: 'Seating is part of Planner Pro',
        body: 'Build tables, place guests, and keep your reception layout organized.',
    },
    {
        tab: 'photos',
        label: 'Photos',
        icon: Camera,
        headline: 'Photos is part of Planner Pro',
        body: 'Collect and review guest photos from your wedding photo sharing portal.',
    },
    {
        tab: 'thanks',
        label: 'Thank You',
        icon: Mail,
        headline: 'Thank You is part of Planner Pro',
        body: 'Prepare post-wedding thank-you messages and keep guest follow-up simple.',
    },
    {
        tab: 'honeymoon',
        label: 'Honeymoon',
        icon: Plane,
        headline: 'Honeymoon is part of Planner Pro',
        body: 'Track bookings, activities, packing items, and travel notes after the wedding.',
    },
];

const VENDOR_PAYMENT_STATUS_OPTIONS: { value: VendorPaymentStatus; label: string }[] = [
    { value: 'not paid', label: 'Not Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
];

const BUDGET_CATEGORIES = [
    'Venue',
    'Catering',
    'Attire',
    'Decor',
    'Photography',
    'Entertainment',
    'Flowers',
    'Beauty',
    'Music',
    'Transport',
    'Stationery',
    'Rings',
    'Cake',
    'Accommodation',
    'Planner',
    'Other',
];

const BUDGET_CATEGORY_COLORS = ['#D16C78', '#CBB26A', '#8EB8A3', '#7C6F8F', '#E2A16F', '#6E8CA0'];

const SMART_BUDGET_ALLOCATIONS = [
    { category: 'Venue', percent: 28, note: 'Venue, rentals, ceremony and reception basics' },
    { category: 'Catering', percent: 24, note: 'Meals, drinks, cake-adjacent food costs' },
    { category: 'Photography', percent: 10, note: 'Photo, video, albums, engagement shoot' },
    { category: 'Decor', percent: 9, note: 'Styling, flowers, signage, rentals' },
    { category: 'Attire', percent: 8, note: 'Dress, suit, accessories, alterations' },
    { category: 'Entertainment', percent: 7, note: 'DJ, band, ceremony music, sound' },
    { category: 'Beauty', percent: 4, note: 'Hair, makeup, prep appointments' },
    { category: 'Transport', percent: 3, note: 'Cars, shuttles, guest movement' },
    { category: 'Stationery', percent: 2, note: 'Invites, menus, place cards, postage' },
    { category: 'Other', percent: 5, note: 'Buffer, fees, gifts, surprise costs' },
];

const PLANNER_DELETE_TABLES: Record<string, string> = {
    task: 'planner_tasks',
    budget: 'planner_budgets',
    vendor: 'planner_vendors',
    event: 'planner_events',
    foodDrink: 'planner_food_drinks',
    honeymoon: 'planner_honeymoon_items',
};

const TASK_META_SEPARATOR = '||QW_TASK_META||';

function decodePlannerTask(task: any) {
    const category = String(task?.category || '');
    if (!category.includes(TASK_META_SEPARATOR)) {
        return {
            ...task,
            section: task?.section || task?.category || 'General',
        };
    }

    const [section, encodedMeta] = category.split(TASK_META_SEPARATOR);
    try {
        const meta = JSON.parse(encodedMeta || '{}');
        return {
            ...task,
            ...meta,
            category: section || meta.section || 'General',
            section: meta.section || section || task?.section || 'General',
        };
    } catch {
        return {
            ...task,
            category: section || 'General',
            section: task?.section || section || 'General',
        };
    }
}

function normalizeVendorPaymentStatus(status?: string | null): VendorPaymentStatus {
    const normalized = status?.toLowerCase();
    if (normalized === 'paid' || normalized === 'pending' || normalized === 'not paid') {
        return normalized;
    }

    return 'not paid';
}

function getVendorPaymentStatusClasses(status?: string | null) {
    const normalized = normalizeVendorPaymentStatus(status);

    if (normalized === 'paid') {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-emerald-900/5 focus:ring-emerald-500/20 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300';
    }

    if (normalized === 'pending') {
        return 'border-amber-200 bg-amber-50 text-amber-700 shadow-amber-900/5 focus:ring-amber-500/20 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300';
    }

    return 'border-border bg-neutral text-text-secondary shadow-primary/5 focus:ring-primary/20 dark:bg-white/5';
}

function VendorPaymentStatusSelect({
    value,
    onChange,
    compact = false,
    className = '',
}: {
    value?: string | null;
    onChange: (status: VendorPaymentStatus) => void;
    compact?: boolean;
    className?: string;
}) {
    const normalized = normalizeVendorPaymentStatus(value);

    return (
        <div className={`relative ${className}`}>
            <select
                value={normalized}
                onChange={(e) => onChange(e.target.value as VendorPaymentStatus)}
                aria-label="Vendor payment status"
                className={`w-full appearance-none rounded-xl border font-sans font-black uppercase leading-none outline-none transition-all duration-200 hover:-translate-y-px hover:shadow-md focus:ring-4 [&>option]:bg-white [&>option]:text-[12px] [&>option]:font-semibold [&>option]:normal-case [&>option]:text-foreground ${
                    compact ? 'min-h-[32px] pl-3 pr-8 py-1 text-[8px] tracking-[0.1em] sm:text-[9px]' : 'min-h-[40px] pl-3.5 pr-9 py-2 text-[9px] tracking-[0.11em] sm:text-[10px]'
                } ${getVendorPaymentStatusClasses(normalized)}`}
            >
                {VENDOR_PAYMENT_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-current opacity-60" />
        </div>
    );
}

async function deletePlannerItem(weddingId: string, type: string, id: string) {
    const table = PLANNER_DELETE_TABLES[type];
    if (!table) throw new Error('Unknown planner item type.');

    const { data: sessionData } = await getCachedSession();
    const token = sessionData.session?.access_token;
    if (!token) throw new Error('Please sign in again before deleting this item.');

    const errors: string[] = [];

    try {
        const response = await fetch('/api/planner/items', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'delete', weddingId, type, id }),
        });

        const data = await response.json().catch(() => ({}));
        if (response.ok) {
            return;
        }
        errors.push(data.error || 'Server delete failed.');
    } catch (err) {
        errors.push(err instanceof Error ? err.message : 'Server delete failed.');
    }

    try {
        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id)
            .eq('wedding_id', weddingId);

        if (error) {
            errors.push(error.message);
        } else {
            return;
        }
    } catch (err) {
        errors.push(err instanceof Error ? err.message : 'Direct delete failed.');
    }

    throw new Error(`Unable to delete planner item. ${errors.join(' ')}`);
}

function getPlannerErrorMessage(err: unknown, fallback: string) {
    if (err instanceof Error && err.message) return err.message;
    if (typeof err === 'object' && err) {
        const record = err as { message?: string; error?: string; details?: string; hint?: string; code?: string };
        return record.message || record.error || record.details || record.hint || record.code || fallback;
    }
    return fallback;
}

async function plannerItemRequest(method: 'POST' | 'PATCH', payload: Record<string, unknown>) {
    const { data: sessionData } = await getCachedSession();
    const token = sessionData.session?.access_token;
    if (!token) throw new Error('Please sign in again before saving this planner item.');

    const response = await fetch('/api/planner/items', {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || 'Unable to save planner item.');
    }

    return data.item;
}

async function createPlannerItem(weddingId: string, type: string, values: Record<string, unknown>) {
    return plannerItemRequest('POST', { action: 'create', weddingId, type, values });
}

async function updatePlannerItem(weddingId: string, type: string, id: string, values: Record<string, unknown>) {
    return plannerItemRequest('PATCH', { weddingId, type, id, values });
}

export default function PlannerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: weddingId } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isAdmin, adminChecked, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<PlannerTab>('checklist');
    const [loading, setLoading] = useState(true);
    const [accessRole, setAccessRole] = useState<'owner' | 'partner' | 'coordinator' | 'pending' | 'denied'>('denied');
    const [accessDebug, setAccessDebug] = useState<string>('');
    const [plannerError, setPlannerError] = useState('');
    const [checkingRole, setCheckingRole] = useState(true);

    // Data States
    const [wedding, setWedding] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [budgets, setBudgets] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [foodDrinks, setFoodDrinks] = useState<any[]>([]);
    const [googleCalendar, setGoogleCalendar] = useState<any>(null);
    const [honeymoonItems, setHoneymoonItems] = useState<any[]>([]);
    const [entourageInvitations, setEntourageInvitations] = useState<any[]>([]);
    const [accountIsPro, setAccountIsPro] = useState(false);
    const [confirmedGuests, setConfirmedGuests] = useState<number>(0);
    const [planUsage, setPlanUsage] = useState<PlannerUsage>(EMPTY_PLANNER_USAGE);
    const lastGuardKeyRef = useRef('');
    const plannerLoadRef = useRef<{ key: string; promise: Promise<void> } | null>(null);

    useEffect(() => {
        const requestedTab = searchParams?.get('tab');
        if (requestedTab && PLANNER_TABS.includes(requestedTab as PlannerTab)) {
            setActiveTab(requestedTab as PlannerTab);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!authLoading && !user) {
            setCheckingRole(false);
            setLoading(false);
            router.push('/login');
            return;
        }

        if (!user) return;

        // Wait for admin check to complete before loading planner data
        if (!adminChecked) return;

        const guardKey = `${weddingId}:${user.id}:${isAdmin ? 'admin' : 'user'}`;
        if (lastGuardKeyRef.current === guardKey) return;
        lastGuardKeyRef.current = guardKey;

        const guardAndLoad = async () => {
            setCheckingRole(true);
            const { data: sessionData } = await getCachedSession();
            const token = sessionData.session?.access_token;

            if (!token) {
                setCheckingRole(false);
                setLoading(false);
                router.push('/login');
                return;
            }

            try {
                if (!isAdmin) {
                    try {
                        const accountProfile = await getClientAccountProfile(token);
                        if (accountProfile?.account_type === 'supplier') {
                            setCheckingRole(false);
                            setLoading(false);
                            router.replace(getRoleAwareRedirect(accountProfile.account_type, `/dashboard/${weddingId}/planner`));
                            return;
                        }
                    } catch (profileErr) {
                        // Gracefully degrade — if account profile table is missing or API fails,
                        // treat user as a regular couple user and continue loading.
                        console.warn('Account profile check skipped (table may not exist):', profileErr);
                    }
                }

                setCheckingRole(false);
                await loadPlannerData();
            } catch (err) {
                console.error('Planner load failed:', err);
                lastGuardKeyRef.current = '';
                setCheckingRole(false);
                setLoading(false);
            }
        };

        void guardAndLoad();
    }, [weddingId, user, authLoading, isAdmin, adminChecked, router]);

    const loadPlannerData = async (showGlobalLoading = true) => {
        const loadKey = `${weddingId}:${user?.id || 'anonymous'}:${isAdmin ? 'admin' : 'user'}`;
        if (plannerLoadRef.current?.key === loadKey) {
            return plannerLoadRef.current.promise;
        }

        const promise: Promise<void> = (async () => {
            if (showGlobalLoading) setLoading(true);
            setPlannerError('');
            try {
                const { data: sessionData } = await getCachedSession();
                const token = sessionData.session?.access_token;

                if (!token) {
                    setAccessRole('denied');
                    setPlannerError('Your login session was not available. Please sign out and sign in again.');
                    return;
                }

                const response = await fetch(`/api/planner/load?weddingId=${encodeURIComponent(weddingId)}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store',
                });
                const data = await response.json();

                setAccessRole(data.accessRole || 'denied');
                setWedding(data.wedding || null);
                setAccountIsPro(hasAccountPro(data.accountProfile));
                setPlanUsage(data.planUsage || EMPTY_PLANNER_USAGE);
                setEntourageInvitations(data.entourageInvitations || []);

                if (!response.ok) {
                    setPlannerError(data.error || 'Unable to verify planner access.');
                }

                if (data.accessRole !== 'owner') return;

                if (isAdmin) {
                    setAccessDebug(`Admin override - isAdmin=${isAdmin}, userEmail=${user?.email}`);
                }

                setTasks((data.tasks || []).map(decodePlannerTask));
                setBudgets(data.budgets || []);
                setVendors(data.vendors || []);
                setEvents(data.events || []);
                setFoodDrinks(data.foodDrinks || []);
                setGoogleCalendar(data.googleCalendar || null);
                setHoneymoonItems(data.honeymoonItems || []);
                setConfirmedGuests(data.confirmedGuests || 0);
            } catch (err) {
                console.error("Error loading planner data:", err);
                setPlannerError(err instanceof Error ? err.message : 'Unable to verify planner access.');
                setAccessRole('denied');
            } finally {
                if (showGlobalLoading) setLoading(false);
                if (plannerLoadRef.current?.key === loadKey) {
                    plannerLoadRef.current = null;
                }
            }
        })();

        plannerLoadRef.current = { key: loadKey, promise };
        return promise;
    };

    async function updateVendorStatus(id: string, status: string) {
        let previousVendors: any[] = [];
        try {
            setVendors((current: any[]) => {
                previousVendors = current;
                return current.map((vendor: any) => vendor.id === id ? { ...vendor, payment_status: status } : vendor);
            });
            const updatedVendor = await updatePlannerItem(weddingId, 'vendor', id, { payment_status: status });
            if (updatedVendor) {
                setVendors((current: any[]) => current.map((vendor: any) => vendor.id === id ? { ...vendor, ...updatedVendor } : vendor));
            }
        } catch (err) {
            if (previousVendors.length > 0) setVendors(previousVendors);
            const message = getPlannerErrorMessage(err, 'Failed to update vendor.');
            alert("Failed to update vendor: " + message);
        }
    }

    const hasPlannerPro = isAdmin || accountIsPro || Boolean(wedding?.is_premium);
    const refreshPlannerData = () => loadPlannerData(false);

    if (checkingRole || loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>;
    }

    // Dev debug logging
    if (process.env.NODE_ENV === 'development') {
        console.log('Planner render:', { accessRole, isAdmin, weddingId });
    }

    if (accessRole === 'pending' || accessRole === 'denied') {
        return (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6">
                <div className="max-w-xl w-full bg-white rounded-[2rem] border border-border p-8 text-center soft-shadow space-y-4">
                    <h1 className="text-2xl font-serif font-bold text-foreground">
                        {accessRole === 'pending' ? 'Planner Invite Pending' : 'Planner Access Restricted'}
                    </h1>
                    <p className="text-text-secondary">
                        {accessRole === 'pending'
                            ? 'Accept the wedding workspace invite from your dashboard home screen to use the planner.'
                            : isAdmin && plannerError.includes('Missing Supabase admin configuration')
                                ? 'Your admin email is recognized, but the server is missing the Supabase service role key required to load planner data for admin accounts.'
                                : 'You do not currently have access to this wedding planner.'}
                    </p>
                    {plannerError && (
                        <div className="rounded-2xl border border-border bg-neutral p-4 text-left">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Access diagnostic</p>
                            <p className="mt-2 break-words text-xs leading-6 text-text-secondary">{plannerError}</p>
                            {isAdmin && (
                                <p className="mt-2 text-xs leading-6 text-text-secondary">
                                    Admin user: {user?.email || 'unknown'}
                                </p>
                            )}
                        </div>
                    )}
                    <Link href="/dashboard" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-white font-bold min-h-[44px]">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Top Navigation Bar */}
            <div className="bg-white/80 dark:bg-white/90 backdrop-blur-md border-b border-border sticky top-0 z-40 overflow-hidden">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                        <button onClick={() => router.push(`/dashboard/${weddingId}`)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-neutral dark:hover:bg-neutral/50 flex items-center justify-center transition-colors flex-shrink-0 min-h-[44px] min-w-[44px]">
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-text-secondary" />
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-base sm:text-lg md:text-xl font-serif font-bold text-foreground truncate">Wedding Planner</h1>
                        </div>
                    </div>
                    {/* Home button (go to QuickWeds landing) */}
                    <Link href="/" className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral text-foreground text-sm font-bold border border-border hover:bg-neutral-hover transition-all min-h-[44px]">
                        <Home className="w-4 h-4" />
                        <span>Home</span>
                    </Link>
                    {/* Mobile home icon */}
                    <Link href="/" className="sm:hidden w-9 h-9 rounded-full hover:bg-neutral dark:hover:bg-neutral/50 flex items-center justify-center transition-colors flex-shrink-0 min-h-[44px] min-w-[44px]" aria-label="Home">
                        <Home className="w-5 h-5 text-text-secondary" />
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-6">
                {/* Sidebar - Mobile: Grid, Desktop: Vertical stack */}
                <div className="w-full md:w-56 lg:w-64 shrink-0">
                    <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl p-2 sm:p-4 md:p-6 soft-shadow border border-border sticky top-20 md:top-24 flex-shrink-0">
                        <div className="grid grid-cols-3 md:flex md:flex-col gap-2 md:gap-2">
                            {PLANNER_TAB_DETAILS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.tab;

                                return (
                                    <button
                                        key={tab.tab}
                                        onClick={() => setActiveTab(tab.tab)}
                                        className={`relative flex flex-col md:flex-row items-center md:items-center gap-1.5 md:gap-3 px-2 md:px-4 py-3 md:py-3 rounded-xl font-bold transition-all min-h-[44px] ${
                                            isActive
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                                                : 'text-text-secondary hover:bg-neutral dark:hover:bg-neutral/50 hover:text-foreground'
                                        }`}
                                    >
                                        {!hasPlannerPro && tab.tab === 'thanks' && (
                                            <span className={`absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full md:static md:h-auto md:w-auto md:rounded-none md:bg-transparent ${
                                                isActive ? 'bg-white/20 md:text-white' : 'bg-primary/10 text-primary'
                                            }`}>
                                                <LockKeyhole className="h-2.5 w-2.5 md:h-3.5 md:w-3.5" />
                                            </span>
                                        )}
                                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                        <span className="text-[10px] sm:text-xs md:text-sm text-center md:text-left">{tab.label}</span>
                                        {!hasPlannerPro && tab.tab === 'thanks' && (
                                            <span className={`hidden md:inline-flex ml-auto rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                                                isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                                            }`}>
                                                Pro
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                            <Link href={`/dashboard/${weddingId}/wedding-day?from=planner`} title="Open Wedding Day Mode" className="relative flex flex-col md:flex-row items-center md:items-center gap-1.5 md:gap-3 px-2 md:px-4 py-3 md:py-3 rounded-xl font-bold transition-all min-h-[44px] text-text-secondary hover:bg-neutral dark:hover:bg-neutral/50 hover:text-foreground">
                                <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                <span className="text-[10px] sm:text-xs md:text-sm text-center md:text-left">Wedding Day</span>
                            </Link>
                            <Link href={`/dashboard/${weddingId}/qr-kit?from=planner`} title="Open QR Kit" className="relative flex flex-col md:flex-row items-center md:items-center gap-1.5 md:gap-3 px-2 md:px-4 py-3 md:py-3 rounded-xl font-bold transition-all min-h-[44px] text-text-secondary hover:bg-neutral dark:hover:bg-neutral/50 hover:text-foreground">
                                <QrCode className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                <span className="text-[10px] sm:text-xs md:text-sm text-center md:text-left">QR Kit</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 overflow-x-hidden">
                    {!hasPlannerPro && activeTab === 'thanks' ? (
                        <LockedPlannerFeature
                            activeTab={activeTab}
                            accessRole={accessRole}
                            weddingId={weddingId}
                            onSelectTab={setActiveTab}
                        />
                    ) : (
                        <>
                            <PlannerLiteUsageBanner activeTab={activeTab} hasPlannerPro={hasPlannerPro} usage={planUsage} weddingId={weddingId} />
                            {activeTab === 'checklist' && <PlannerChecklists weddingId={weddingId} initialTasks={tasks} setTasks={setTasks} vendors={vendors} wedding={wedding} reload={refreshPlannerData} />}
                            {activeTab === 'entourage' && <EntourageProposalPlanner weddingId={weddingId} wedding={wedding} invitations={entourageInvitations} setInvitations={setEntourageInvitations} reload={refreshPlannerData} />}
                            {activeTab === 'calendar' && <PlannerCalendar weddingId={weddingId} events={events} setEvents={setEvents} tasks={tasks} wedding={wedding} googleCalendar={googleCalendar} reload={refreshPlannerData} hasPlannerPro={hasPlannerPro} />}
                            {activeTab === 'budget' && <PlannerBudgets weddingId={weddingId} initialBudgets={budgets} setBudgets={setBudgets} setWedding={setWedding} wedding={wedding} vendors={vendors} foodDrinks={foodDrinks} reload={refreshPlannerData} updateVendorStatus={updateVendorStatus} />}
                            {activeTab === 'food' && <FoodDrinksPlanner weddingId={weddingId} foodDrinks={foodDrinks} setFoodDrinks={setFoodDrinks} vendors={vendors} currency={wedding?.currency || 'USD'} reload={refreshPlannerData} />}
                            {activeTab === 'vendors' && <PlannerVendors weddingId={weddingId} initialVendors={vendors} setVendors={setVendors} currency={wedding?.currency || 'USD'} reload={refreshPlannerData} updateVendorStatus={updateVendorStatus} />}
                            {activeTab === 'seating' && (
                                <SeatingChartBuilder
                                    weddingId={weddingId}
                                    hasPlannerPro={hasPlannerPro}
                                    initialPublicSeatFinderToken={wedding?.public_seat_finder_token || ''}
                                    initialSeatFinderEnabled={wedding?.seat_finder_enabled !== false && Boolean(wedding?.public_seat_finder_token)}
                                />
                            )}
                            {activeTab === 'photos' && <PhotoSharingManager weddingId={weddingId} hasPlannerPro={hasPlannerPro} />}
                            {activeTab === 'thanks' && <ThankYouPlannerLauncher weddingId={weddingId} confirmedGuests={confirmedGuests} />}
                            {activeTab === 'honeymoon' && <HoneymoonPlanner weddingId={weddingId} items={honeymoonItems} setHoneymoonItems={setHoneymoonItems} currency={wedding?.currency || 'USD'} reload={refreshPlannerData} />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function ThankYouPlannerLauncher({ weddingId, confirmedGuests }: { weddingId: string; confirmedGuests: number }) {
    return (
        <section className="rounded-3xl border border-primary/15 bg-white p-5 shadow-xl shadow-primary/10 sm:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Mail className="h-6 w-6" />
                    </div>
                    <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-primary">Post-wedding</p>
                    <h2 className="mt-1 font-serif text-2xl font-bold text-foreground sm:text-3xl">Thank You Card Builder</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                        Build a card-style email, send a test, and deliver it only to confirmed guests. Current confirmed headcount: {confirmedGuests}.
                    </p>
                </div>
                <Link href={`/dashboard/${weddingId}/thank-you?from=planner`} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover">
                    <Sparkles className="h-4 w-4" />
                    Open Builder
                </Link>
            </div>
        </section>
    );
}

function LockedPlannerFeature({
    activeTab,
    accessRole,
    weddingId,
    onSelectTab,
}: {
    activeTab: PlannerTab;
    accessRole: 'owner' | 'partner' | 'coordinator' | 'pending' | 'denied';
    weddingId: string;
    onSelectTab: (tab: PlannerTab) => void;
}) {
    const activeFeature = PLANNER_TAB_DETAILS.find((feature) => feature.tab === activeTab) || PLANNER_TAB_DETAILS[0];
    const ActiveIcon = activeFeature.icon;

    return (
        <div className="space-y-4 sm:space-y-6">
            <section className="overflow-hidden rounded-[1.75rem] border border-primary/15 bg-white shadow-2xl shadow-primary/10">
                <div className="bg-gradient-to-br from-primary/12 via-secondary/10 to-white p-5 sm:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                            <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-white text-primary shadow-xl shadow-primary/10 sm:h-16 sm:w-16">
                                <ActiveIcon className="h-7 w-7" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">Planner Pro</p>
                                <h2 className="mt-2 font-serif text-2xl font-bold leading-tight text-foreground sm:text-4xl">
                                    {activeFeature.headline}
                                </h2>
                                <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary sm:text-base">
                                    {activeFeature.body} Your wedding website, builder, RSVP tools, and guest tracking stay free.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-stretch gap-2 sm:items-start lg:items-end">
                            {accessRole === 'owner' ? (
                                <UpgradeButton weddingId={weddingId} className="justify-center" />
                            ) : (
                                <p className="max-w-sm rounded-2xl border border-border bg-white/80 p-4 text-sm font-semibold leading-6 text-text-secondary">
                                    Ask the wedding owner to unlock Planner Pro for this workspace.
                                </p>
                            )}
                            <p className="text-center text-xs font-semibold text-text-secondary sm:text-left lg:text-right">One-time payment. No subscription.</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
                    {PLANNER_TAB_DETAILS.map((feature) => {
                        const Icon = feature.icon;
                        const isActive = feature.tab === activeTab;

                        return (
                            <button
                                key={feature.tab}
                                type="button"
                                onClick={() => onSelectTab(feature.tab)}
                                className={`group flex min-h-[116px] items-start gap-3 rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                                    isActive
                                        ? 'border-primary/30 bg-primary/5 shadow-lg shadow-primary/10'
                                        : 'border-border bg-neutral hover:border-primary/20'
                                }`}
                            >
                                <span className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl ${
                                    isActive ? 'bg-primary text-white' : 'bg-white text-primary group-hover:bg-primary group-hover:text-white'
                                }`}>
                                    <Icon className="h-5 w-5" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="flex items-center gap-2 text-sm font-black text-foreground">
                                        {feature.label}
                                        <LockKeyhole className="h-3.5 w-3.5 text-primary" />
                                    </span>
                                    <span className="mt-1 block text-xs leading-5 text-text-secondary">{feature.body}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}

function readWeddingParty(value: unknown) {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string' || !value.trim()) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function getMemberKey(member: any, index: number) {
    return String(member?.memberKey || member?.id || `${member?.name || 'member'}-${member?.role || 'role'}-${index}`).toLowerCase();
}

function getProposalStatusClasses(status: string) {
    if (status === 'accepted') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (status === 'declined') return 'bg-red-50 text-red-700 border-red-100';
    if (status === 'sent') return 'bg-amber-50 text-amber-700 border-amber-100';
    return 'bg-neutral text-text-secondary border-border';
}

function EntourageProposalPlanner({ weddingId, wedding, invitations, setInvitations, reload }: any) {
    const [sendingKey, setSendingKey] = useState<string | null>(null);
    const [customizingRowIndex, setCustomizingRowIndex] = useState<number | null>(null);
    const members = readWeddingParty(wedding?.wedding_party);
    const invitationByKey = new Map((invitations || []).map((invite: any) => [String(invite.member_key), invite]));
    const rows = members.map((member: any, index: number) => {
        const memberKey = getMemberKey(member, index);
        const invite = invitationByKey.get(memberKey);
        return { member, memberKey, invite };
    });
    const counts = rows.reduce((acc: Record<string, number>, row: any) => {
        const status = row.invite?.status || 'draft';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, { draft: 0, sent: 0, accepted: 0, declined: 0 });

    async function sendProposal(member: any, memberKey: string, customOverrides?: any) {
        if (!member.email) return;
        setSendingKey(memberKey);
        try {
            const { data: sessionData } = await getCachedSession();
            const token = sessionData.session?.access_token;
            if (!token) throw new Error('Please sign in again before sending this proposal.');

            const template = getEntourageProposalTemplate(customOverrides?.proposalTemplateKey || member.proposalTemplateKey || DEFAULT_ENTOURAGE_PROPOSAL_TEMPLATE_KEY);
            const response = await fetch('/api/entourage/invitations/send', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    weddingId,
                    memberKey,
                    name: member.name,
                    email: member.email,
                    role: member.role || 'Wedding Entourage',
                    message: customOverrides?.proposalMessage || member.proposalMessage || template.defaultMessage,
                    templateKey: template.key,
                    cardTheme: customOverrides?.proposalCardTheme || member.proposalCardTheme || 'classic',
                    proposalTitle: customOverrides?.proposalTitle || member.proposalTitle || template.defaultTitle,
                    heroImageUrl: customOverrides ? (customOverrides.proposalHeroImage || '') : (member.proposalHeroImage || undefined),
                    requestAttireSize: customOverrides?.requestAttireSize ?? member.requestAttireSize ?? true,
                    requestDietaryNotes: customOverrides?.requestDietaryNotes ?? member.requestDietaryNotes ?? true,
                    requestPhoneNumber: customOverrides?.requestPhoneNumber ?? member.requestPhoneNumber ?? false,
                }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Unable to send proposal.');

            setInvitations((current: any[]) => {
                const next = current.filter((invite: any) => String(invite.member_key) !== memberKey);
                return [data.invitation, ...next];
            });
            void reload();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Unable to send proposal.');
        } finally {
            setSendingKey(null);
        }
    }

    return (
        <div className="rounded-2xl border border-border bg-white p-5 soft-shadow sm:rounded-[2.5rem] md:p-10">
            <div className="flex flex-col gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Entourage Proposals</h2>
                    <p className="mt-1 text-xs text-text-secondary sm:text-sm">Customize card themes, send proposal emails, and track responses.</p>
                </div>
                <Link href={`/builder?edit=${weddingId}`} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-white">
                    <Edit2 className="h-4 w-4" /> Edit in Builder
                </Link>
            </div>

            <div className="my-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                    ['draft', 'Not Sent'],
                    ['sent', 'Sent'],
                    ['accepted', 'Accepted'],
                    ['declined', 'Declined'],
                ].map(([status, label]) => (
                    <div key={status} className="rounded-2xl border border-border bg-neutral/40 p-4 text-center">
                        <p className="font-serif text-3xl font-bold text-primary">{counts[status] || 0}</p>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-text-secondary">{label}</p>
                    </div>
                ))}
            </div>

            {rows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-neutral/40 p-8 text-center">
                    <Users className="mx-auto h-10 w-10 text-primary/50" />
                    <p className="mt-4 font-serif text-lg font-bold text-foreground">No entourage members yet</p>
                    <p className="mt-2 text-sm leading-7 text-text-secondary">Add your wedding party in the builder, then return here to send proposal emails.</p>
                </div>
            ) : (
                <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
                    {rows.map(({ member, memberKey, invite }: any, index: number) => {
                        const status = invite?.status || 'draft';
                        const template = getEntourageProposalTemplate(member.proposalTemplateKey || invite?.template_key || DEFAULT_ENTOURAGE_PROPOSAL_TEMPLATE_KEY);
                        const cardTheme = getEntourageCardTheme(member.proposalCardTheme || invite?.card_theme || 'classic');
                        const canSend = Boolean(member.email);
                        const responseDetails = invite?.response_details;

                        return (
                            <div key={memberKey} className="grid gap-4 bg-white p-4 lg:grid-cols-[1fr_auto] lg:items-center">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="break-words font-serif text-lg font-bold text-foreground">{member.name || 'Unnamed member'}</h3>
                                        <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getProposalStatusClasses(status)}`}>{status === 'draft' ? 'Not Sent' : status}</span>
                                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${cardTheme.badgeBg} ${cardTheme.badgeText}`}>
                                            {cardTheme.label}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-text-secondary">{[member.role, member.email].filter(Boolean).join(' - ') || 'Role and email not set'}</p>
                                    <p className="mt-2 text-xs leading-6 text-text-secondary">
                                        {template.label} template
                                        {invite?.sent_at ? ` - sent ${new Date(invite.sent_at).toLocaleDateString()}` : ''}
                                        {invite?.responded_at ? ` - responded ${new Date(invite.responded_at).toLocaleDateString()}` : ''}
                                    </p>

                                    {/* Display response details if member accepted */}
                                    {status === 'accepted' && responseDetails && (
                                        <div className="mt-3 grid gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-xs text-emerald-950">
                                            <p className="font-bold text-[10px] uppercase tracking-wider text-emerald-800">Accepted Response Details:</p>
                                            {responseDetails.attireSize && <p>👔 <strong>Attire Size:</strong> {responseDetails.attireSize}</p>}
                                            {responseDetails.dietaryNotes && <p>🥗 <strong>Dietary Notes:</strong> {responseDetails.dietaryNotes}</p>}
                                            {responseDetails.phoneNumber && <p>📱 <strong>Phone Number:</strong> {responseDetails.phoneNumber}</p>}
                                            {responseDetails.personalNote && <p>💬 <strong>Note to Couple:</strong> {responseDetails.personalNote}</p>}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setCustomizingRowIndex(index)}
                                        className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3.5 py-2 text-sm font-bold text-text-secondary hover:border-primary/40 hover:text-primary transition-colors"
                                    >
                                        <Sparkles className="h-4 w-4 text-primary" /> Open Proposal Editor
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!canSend || sendingKey === memberKey}
                                        onClick={() => void sendProposal(member, memberKey)}
                                        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {sendingKey === memberKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        {status === 'sent' || status === 'accepted' || status === 'declined' ? 'Resend' : 'Send Proposal'}
                                    </button>
                                    {!canSend && (
                                        <Link href={`/builder?edit=${weddingId}`} className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold text-text-secondary hover:border-primary/30 hover:text-primary">
                                            Add Email
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {customizingRowIndex !== null && rows[customizingRowIndex] && (
                <EntourageProposalCustomizerSection
                    member={{ ...rows[customizingRowIndex].member, proposalHeroImage: (rows[customizingRowIndex].invite as any)?.proposal_hero_image_url || rows[customizingRowIndex].member.proposalHeroImage }}
                    coupleNames={[wedding?.bride_name || 'Bride', wedding?.groom_name || 'Groom'].join(' & ')}
                    weddingDate={wedding?.wedding_date || 'To be announced'}
                    venueName={wedding?.venue_name || 'To be announced'}
                    couplePhotoUrl={wedding?.couple_photo || ''}
                    weddingHeroImageUrl={wedding?.hero_image || ''}
                    onUploadHeroImage={async (file) => {
                        const { data: sessionData } = await getCachedSession();
                        const userId = sessionData.session?.user?.id;
                        if (!userId) throw new Error('Please sign in again before uploading an image.');

                        const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-');
                        const filePath = `${userId}/${weddingId}/entourage-proposals/${Date.now()}-${safeFileName}`;
                        const { error: uploadError } = await supabase.storage
                            .from('quickweds')
                            .upload(filePath, file, { contentType: file.type });
                        if (uploadError) throw uploadError;

                        const { data } = supabase.storage.from('quickweds').getPublicUrl(filePath);
                        return data.publicUrl;
                    }}
                    onClose={() => setCustomizingRowIndex(null)}
                    onSave={(updatedMember) => {
                        const targetRow = rows[customizingRowIndex];
                        void sendProposal(updatedMember, targetRow.memberKey, updatedMember);
                    }}
                />
            )}
        </div>
    );
}

function PlannerLiteUsageBanner({
    activeTab,
    hasPlannerPro,
    usage,
    weddingId,
}: {
    activeTab: PlannerTab;
    hasPlannerPro: boolean;
    usage: PlannerUsage;
    weddingId: string;
}) {
    if (hasPlannerPro) return null;

    const usageByTab: Partial<Record<PlannerTab, { label: string; used: number; limit: number }>> = {
        checklist: { label: 'Checklist tasks', used: usage.tasks, limit: FREE_PLAN_LIMITS.checklistTasks },
        calendar: { label: 'Calendar events', used: usage.events, limit: FREE_PLAN_LIMITS.calendarEvents },
        budget: { label: 'Budget items', used: usage.budgets, limit: FREE_PLAN_LIMITS.budgetItems },
        food: { label: 'Food and drink items', used: usage.foodDrinks, limit: FREE_PLAN_LIMITS.foodDrinks },
        vendors: { label: 'Saved suppliers', used: usage.vendors, limit: FREE_PLAN_LIMITS.vendors },
        seating: { label: 'Seating tables', used: usage.seatingTables, limit: FREE_PLAN_LIMITS.seatingTables },
        honeymoon: { label: 'Honeymoon items', used: usage.honeymoonItems, limit: FREE_PLAN_LIMITS.honeymoonItems },
    };

    const activeUsage = usageByTab[activeTab];

    return (
        <div className="mb-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:mb-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="grid gap-2 sm:grid-cols-2">
                    {activeUsage && (
                        <div className="rounded-xl border border-primary/10 bg-white px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{activeUsage.label}</p>
                            <p className="mt-1 font-serif text-xl font-bold text-foreground">{activeUsage.used} / {activeUsage.limit}</p>
                        </div>
                    )}
                    <div className="rounded-xl border border-primary/10 bg-white px-4 py-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Guest emails</p>
                        <p className="mt-1 font-serif text-xl font-bold text-foreground">{usage.userTriggeredEmailsUsed} / {FREE_PLAN_LIMITS.userTriggeredEmails}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-2 lg:items-end">
                    <p className="max-w-xl text-sm font-semibold leading-6 text-text-secondary">
                        Planner Lite is free with useful starter limits. Upgrade when guests, suppliers, seating, and reminders need to go unlimited.
                    </p>
                    <UpgradeButton weddingId={weddingId} className="justify-center text-sm" />
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------
// CHILD COMPONENTS
// ----------------------------------------------------

const CHECKLIST_SECTIONS = ['12-Month Wedding Plan', 'Entourage', 'Parents', 'Bride Attire', 'Groom Attire', 'General'];
const TWELVE_MONTH_TASKS = [
    ['12m-budget', 'Set wedding budget and guest target', 12, 'Couple'],
    ['12m-venue', 'Book ceremony and reception venue', 11, 'Couple'],
    ['12m-suppliers', 'Shortlist priority suppliers', 10, 'Coordinator'],
    ['12m-entourage', 'Confirm entourage and parents attire needs', 9, 'Couple'],
    ['12m-photo', 'Book photo and video team', 8, 'Coordinator'],
    ['12m-attire', 'Choose bride and groom wedding attire', 7, 'Couple'],
    ['12m-menu', 'Plan catering, food, and drinks options', 6, 'Couple'],
    ['12m-invites', 'Finalize invitation and RSVP details', 5, 'Couple'],
    ['12m-rings', 'Prepare rings and accessories', 4, 'Couple'],
    ['12m-seating', 'Draft seating and program flow', 3, 'Coordinator'],
    ['12m-final', 'Confirm final supplier payments and schedules', 2, 'Coordinator'],
    ['12m-week', 'Prepare wedding week checklist', 1, 'Couple'],
];

function getChecklistDueDate(weddingDateValue: string | null | undefined, monthsBefore: number) {
    if (!weddingDateValue) return null;
    const weddingDate = new Date(weddingDateValue);
    if (Number.isNaN(weddingDate.getTime())) return null;
    const due = new Date(weddingDate);
    due.setMonth(due.getMonth() - monthsBefore);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (due < today) return today.toISOString().slice(0, 10);
    return due.toISOString().slice(0, 10);
}

function PlannerChecklists({ weddingId, initialTasks, setTasks, vendors = [], wedding, reload }: any) {
    const [publishing, setPublishing] = useState(false);
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [savingTaskId, setSavingTaskId] = useState<string | null>(null);
    const [editTask, setEditTask] = useState({
        title: '',
        section: 'General',
        due_date: '',
        assigned_to: '',
        planner_vendor_id: '',
        custom_supplier_name: '',
        notes: '',
    });
    const [newTask, setNewTask] = useState({
        title: '',
        section: 'General',
        due_date: '',
        assigned_to: '',
        planner_vendor_id: '',
        custom_supplier_name: '',
        notes: '',
    });

    async function addTask(e: any) {
        e.preventDefault();
        if (!newTask.title.trim() || publishing) return;
        setPublishing(true);
        try {
            const createdTask = await createPlannerItem(weddingId, 'task', {
                title: newTask.title.trim(),
                section: newTask.section,
                status: 'pending',
                due_date: newTask.due_date || null,
                assigned_to: newTask.assigned_to.trim() || null,
                planner_vendor_id: newTask.planner_vendor_id || null,
                custom_supplier_name: newTask.custom_supplier_name.trim() || null,
                notes: newTask.notes.trim() || null,
            });
            if (setTasks && createdTask) {
                setTasks((current: any[]) => [...current, decodePlannerTask(createdTask)]);
            }
            setNewTask((current) => ({ ...current, title: '', assigned_to: '', custom_supplier_name: '', notes: '' }));
            void reload();
        } catch (err) {
            const message = getPlannerErrorMessage(err, 'Failed to add checklist item.');
            console.warn('Error adding checklist item:', message);
            alert(`Failed to add checklist item: ${message}`);
        } finally {
            setPublishing(false);
        }
    }

    function startEditingTask(task: any) {
        setEditingTaskId(task.id);
        setEditTask({
            title: task.title || '',
            section: task.section || task.category || 'General',
            due_date: task.due_date ? String(task.due_date).slice(0, 10) : '',
            assigned_to: task.assigned_to || '',
            planner_vendor_id: task.planner_vendor_id || '',
            custom_supplier_name: task.custom_supplier_name || '',
            notes: task.notes || '',
        });
    }

    function cancelEditingTask() {
        setEditingTaskId(null);
        setSavingTaskId(null);
        setEditTask({
            title: '',
            section: 'General',
            due_date: '',
            assigned_to: '',
            planner_vendor_id: '',
            custom_supplier_name: '',
            notes: '',
        });
    }

    async function saveTaskDetails(task: any) {
        if (!editTask.title.trim() || savingTaskId) return;
        setSavingTaskId(task.id);
        try {
            const updatedTask = await updatePlannerItem(weddingId, 'task', task.id, {
                title: editTask.title.trim(),
                section: editTask.section,
                category: editTask.section,
                due_date: editTask.due_date || null,
                assigned_to: editTask.assigned_to.trim() || null,
                planner_vendor_id: editTask.planner_vendor_id || null,
                custom_supplier_name: editTask.custom_supplier_name.trim() || null,
                notes: editTask.notes.trim() || null,
            });
            if (setTasks && updatedTask) {
                const decodedTask = decodePlannerTask(updatedTask);
                setTasks((current: any[]) => current.map((item: any) => (
                    item.id === task.id
                        ? {
                            ...item,
                            ...decodedTask,
                            title: decodedTask.title || editTask.title.trim(),
                            section: decodedTask.section || decodedTask.category || editTask.section,
                            due_date: decodedTask.due_date ?? (editTask.due_date || null),
                            assigned_to: decodedTask.assigned_to ?? (editTask.assigned_to.trim() || null),
                            planner_vendor_id: decodedTask.planner_vendor_id ?? (editTask.planner_vendor_id || null),
                            custom_supplier_name: decodedTask.custom_supplier_name ?? (editTask.custom_supplier_name.trim() || null),
                            notes: decodedTask.notes ?? (editTask.notes.trim() || null),
                        }
                        : item
                )));
            }
            cancelEditingTask();
            void reload();
        } catch (err) {
            const message = getPlannerErrorMessage(err, 'Unable to update checklist item.');
            console.warn('Error updating checklist item:', message);
            alert(`Unable to update checklist item: ${message}`);
        } finally {
            setSavingTaskId(null);
        }
    }

    async function updateTask(task: any, patch: Record<string, unknown>) {
        let previousTasks: any[] = [];
        try {
            if (setTasks) {
                setTasks((current: any[]) => {
                    previousTasks = current;
                    return current.map((item: any) => item.id === task.id ? decodePlannerTask({ ...item, ...patch }) : item);
                });
            }
            const updatedTask = await updatePlannerItem(weddingId, 'task', task.id, patch);
            if (setTasks && updatedTask) {
                setTasks((current: any[]) => current.map((item: any) => item.id === task.id ? decodePlannerTask({ ...item, ...updatedTask }) : item));
            }
            void reload();
        } catch (err) {
            if (previousTasks.length > 0 && setTasks) setTasks(previousTasks);
            const message = getPlannerErrorMessage(err, 'Unable to update checklist item.');
            console.warn('Error updating checklist item:', message);
            alert(`Unable to update checklist item: ${message}`);
        }
    }

    async function seedTwelveMonthChecklist() {
        const existingKeys = new Set(initialTasks.map((task: any) => task.template_key).filter(Boolean));
        const existingTitles = new Set(initialTasks.map((task: any) => `${task.section || 'General'}:${String(task.title || '').trim().toLowerCase()}`));
        const rows = TWELVE_MONTH_TASKS
            .filter(([key, title]) => !existingKeys.has(key) && !existingTitles.has(`12-Month Wedding Plan:${String(title).trim().toLowerCase()}`))
            .map(([template_key, title, monthsBefore, assignedTo]) => {
                return {
                    wedding_id: weddingId,
                    title,
                    template_key,
                    section: '12-Month Wedding Plan',
                    status: 'pending',
                    due_date: getChecklistDueDate(wedding?.wedding_date, Number(monthsBefore)),
                    assigned_to: assignedTo,
                };
            });

        if (rows.length === 0) return alert('The 12-month checklist is already loaded.');
        try {
            const createdTasks = await Promise.all(rows.map((row) => createPlannerItem(weddingId, 'task', row)));
            if (setTasks) {
                setTasks((current: any[]) => [
                    ...current,
                    ...createdTasks.filter(Boolean).map((task: any) => decodePlannerTask(task)),
                ]);
            }
        } catch (err) {
            const message = getPlannerErrorMessage(err, 'Failed to load checklist.');
            console.warn('Error loading 12-month checklist:', message);
            alert(`Failed to load checklist: ${message}`);
            return;
        }
        void reload();
    }

    async function deleteTask(id: string) {
        if (deletingTaskId) return;
        setDeletingTaskId(id);
        try {
            await deletePlannerItem(weddingId, 'task', id);
            if (setTasks) setTasks((current: any[]) => current.filter((task: any) => task.id !== id));
            void reload();
        } catch (err) {
            const message = getPlannerErrorMessage(err, 'Unable to delete checklist item.');
            console.warn('Error deleting checklist item:', message);
            alert(message);
        } finally {
            setDeletingTaskId(null);
        }
    }

    const preparedCount = initialTasks.filter((t: any) => t.status === 'prepared' || t.status === 'completed').length;
    const progress = initialTasks.length > 0 ? Math.round((preparedCount / initialTasks.length) * 100) : 0;

    return (
        <div className="bg-white dark:bg-white/5 rounded-2xl sm:rounded-[2.5rem] p-5 md:p-10 soft-shadow border border-border">
            <div className="flex flex-col gap-4 border-b border-border/50 pb-6 mb-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Planner Checklist</h2>
                    <p className="text-xs sm:text-sm text-text-secondary mt-1">Track entourage, parents, attire, suppliers, and wedding-month tasks.</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="rounded-2xl border border-border bg-neutral/40 px-5 py-3 text-center">
                        <p className="text-2xl font-serif font-bold text-primary">{progress}%</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Done</p>
                    </div>
                    <div className="text-center sm:text-left">
                        <button type="button" onClick={() => void seedTwelveMonthChecklist()} className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-white sm:w-auto">
                            <Sparkles className="h-4 w-4" /> Load 12-Month List
                        </button>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Recommended template checklist</p>
                    </div>
                </div>
            </div>

            <form onSubmit={addTask} className="mb-8 grid gap-3 rounded-2xl border border-border bg-neutral/30 p-4 lg:grid-cols-3">
                <input required value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="Checklist item" className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]" />
                <select value={newTask.section} onChange={(e) => setNewTask({ ...newTask, section: e.target.value })} className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]">
                    {CHECKLIST_SECTIONS.map(section => <option key={section} value={section}>{section}</option>)}
                </select>
                <input type="date" value={newTask.due_date} onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })} className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]" />
                <input value={newTask.assigned_to} onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })} placeholder="Assigned person / role" className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]" />
                <select value={newTask.planner_vendor_id} onChange={(e) => setNewTask({ ...newTask, planner_vendor_id: e.target.value })} className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]">
                    <option value="">Select supplier/vendor</option>
                    {vendors.map((vendor: any) => <option key={vendor.id} value={vendor.id}>{vendor.name} - {vendor.role}</option>)}
                </select>
                <input value={newTask.custom_supplier_name} onChange={(e) => setNewTask({ ...newTask, custom_supplier_name: e.target.value })} placeholder="Custom supplier" className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]" />
                <input value={newTask.notes} onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })} placeholder="Notes" className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]" />
                <button type="submit" disabled={publishing} className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-50 min-h-[44px]">{publishing ? 'Adding...' : 'Add Checklist Item'}</button>
            </form>

            <div className="space-y-5">
                {CHECKLIST_SECTIONS.map((section) => {
                    const sectionTasks = initialTasks.filter((task: any) => (task.section || 'General') === section);
                    if (sectionTasks.length === 0) return null;
                    return (
                        <div key={section} className="rounded-2xl border border-border bg-white overflow-hidden">
                            <div className="flex items-center justify-between gap-3 border-b border-border bg-neutral/30 px-4 py-3">
                                <h3 className="font-serif text-lg font-bold text-foreground">{section}</h3>
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">{sectionTasks.length} items</span>
                            </div>
                            <div className="divide-y divide-border/40">
                                {sectionTasks.map((task: any) => {
                                    const linkedVendor = vendors.find((vendor: any) => vendor.id === task.planner_vendor_id);
                                    const prepared = task.status === 'prepared' || task.status === 'completed';
                                    return (
                                        <div key={task.id} className="grid grid-cols-[auto_1fr] gap-3 p-4 sm:flex sm:items-start">
                                            <button type="button" onClick={() => void updateTask(task, { status: prepared ? 'pending' : 'completed' })} aria-label={prepared ? 'Mark checklist item as not done' : 'Mark checklist item as done'} className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-full hover:bg-primary/10">
                                                {prepared ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-border" />}
                                            </button>
                                            <div className="min-w-0 flex-1">
                                                {editingTaskId === task.id ? (
                                                    <div className="grid gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-3 lg:grid-cols-2">
                                                        <input value={editTask.title} onChange={(e) => setEditTask({ ...editTask, title: e.target.value })} placeholder="Checklist item" className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px] lg:col-span-2" />
                                                        <select value={editTask.section} onChange={(e) => setEditTask({ ...editTask, section: e.target.value })} className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]">
                                                            {CHECKLIST_SECTIONS.map(sectionOption => <option key={sectionOption} value={sectionOption}>{sectionOption}</option>)}
                                                        </select>
                                                        <input type="date" value={editTask.due_date} onChange={(e) => setEditTask({ ...editTask, due_date: e.target.value })} className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]" />
                                                        <input value={editTask.assigned_to} onChange={(e) => setEditTask({ ...editTask, assigned_to: e.target.value })} placeholder="Assigned person / role" className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]" />
                                                        <select value={editTask.planner_vendor_id} onChange={(e) => setEditTask({ ...editTask, planner_vendor_id: e.target.value })} className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]">
                                                            <option value="">Select supplier/vendor</option>
                                                            {vendors.map((vendor: any) => <option key={vendor.id} value={vendor.id}>{vendor.name} - {vendor.role}</option>)}
                                                        </select>
                                                        <input value={editTask.custom_supplier_name} onChange={(e) => setEditTask({ ...editTask, custom_supplier_name: e.target.value })} placeholder="Custom supplier" className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]" />
                                                        <input value={editTask.notes} onChange={(e) => setEditTask({ ...editTask, notes: e.target.value })} placeholder="Notes" className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]" />
                                                        <div className="flex flex-col gap-2 sm:flex-row lg:col-span-2">
                                                            <button type="button" disabled={savingTaskId === task.id || !editTask.title.trim()} onClick={() => void saveTaskDetails(task)} className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                                                                {savingTaskId === task.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                                Save Changes
                                                            </button>
                                                            <button type="button" onClick={cancelEditingTask} className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold text-text-secondary hover:border-primary/30 hover:text-primary">
                                                                <X className="h-4 w-4" />
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex min-w-0 items-start gap-3">
                                                            <p className={`min-w-0 break-words font-serif text-base font-bold leading-snug ${prepared ? 'text-text-secondary line-through' : 'text-foreground'}`}>{task.title}</p>
                                                        </div>
                                                        <p className="mt-1 break-words text-xs leading-5 text-text-secondary">
                                                            {[task.assigned_to, task.due_date ? new Date(task.due_date).toLocaleDateString() : null, linkedVendor?.name || task.custom_supplier_name].filter(Boolean).join(' - ') || 'No details yet'}
                                                        </p>
                                                        {task.notes && <p className="mt-1 break-words text-xs italic leading-5 text-text-secondary">{task.notes}</p>}
                                                    </>
                                                )}
                                            </div>
                                            {editingTaskId !== task.id && (
                                                <div className="col-span-2 grid grid-cols-2 gap-2 sm:col-auto sm:flex sm:flex-none sm:items-start">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEditingTask(task)}
                                                        className="flex min-h-[44px] w-full touch-manipulation items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-bold text-text-secondary hover:border-primary/30 hover:text-primary sm:w-auto sm:min-w-[44px] sm:px-3"
                                                        aria-label="Edit checklist item"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                        <span className="sm:hidden">Edit</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={deletingTaskId === task.id}
                                                        onClick={() => void deleteTask(task.id)}
                                                        className="flex min-h-[44px] w-full touch-manipulation items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 text-sm font-bold text-red-600 disabled:opacity-50 sm:w-auto sm:min-w-[44px] sm:bg-white sm:px-3 sm:hover:bg-red-50"
                                                        aria-label="Delete checklist item"
                                                    >
                                                        {deletingTaskId === task.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                        <span className="sm:hidden">{deletingTaskId === task.id ? 'Deleting...' : 'Delete'}</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
                {initialTasks.length === 0 && <div className="text-center py-12 opacity-50 font-serif italic text-sm">Your checklist is empty. Add an item or load the 12-month list.</div>}
            </div>
        </div>
    );
}

function PlannerCalendar({ weddingId, events = [], setEvents, tasks = [], wedding, googleCalendar, reload, hasPlannerPro = false }: any) {
    const [publishing, setPublishing] = useState(false);
    const [syncingGoogle, setSyncingGoogle] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        starts_at: '',
        ends_at: '',
        location: '',
        notes: '',
        planner_task_id: '',
        reminder_minutes: '1440',
    });

    const feedUrl = wedding?.planner_calendar_token
        ? `/api/planner/calendar?weddingId=${encodeURIComponent(weddingId)}&token=${encodeURIComponent(wedding.planner_calendar_token)}`
        : '';

    async function getAuthToken() {
        const { data } = await getCachedSession();
        return data.session?.access_token || '';
    }

    async function connectGoogleCalendar() {
        if (!hasPlannerPro) return alert('Google Calendar sync is part of Planner Pro.');
        const token = await getAuthToken();
        if (!token) return alert('Please sign in again before connecting Google Calendar.');
        const response = await fetch(`/api/planner/google-calendar/connect?weddingId=${encodeURIComponent(weddingId)}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
        const data = await response.json();
        if (!response.ok || !data.url) {
            alert(data.error || 'Google Calendar connection is not configured yet.');
            return;
        }
        window.location.href = data.url;
    }

    async function syncGoogleCalendar(silent = false) {
        if (!hasPlannerPro) {
            if (!silent) alert('Google Calendar sync is part of Planner Pro.');
            return;
        }
        if (!googleCalendar?.connected) return;
        setSyncingGoogle(true);
        try {
            const token = await getAuthToken();
            const response = await fetch('/api/planner/google-calendar/sync', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ weddingId }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Unable to sync Google Calendar.');
            if (!silent) alert(`Synced ${data.synced || 0} schedule items to Google Calendar.`);
            void reload();
        } catch (err) {
            console.error('Google Calendar sync failed:', err);
            if (!silent) alert(err instanceof Error ? err.message : 'Unable to sync Google Calendar.');
        } finally {
            setSyncingGoogle(false);
        }
    }

    async function disconnectGoogleCalendar() {
        if (!confirm('Disconnect Google Calendar for this planner?')) return;
        const token = await getAuthToken();
        const response = await fetch('/api/planner/google-calendar/disconnect', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ weddingId }),
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            alert(data.error || 'Unable to disconnect Google Calendar.');
            return;
        }
        void reload();
    }

    async function deleteGoogleCalendarEvent(eventId: string) {
        if (!googleCalendar?.connected) return;
        const token = await getAuthToken();
        await fetch('/api/planner/google-calendar/sync', {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ weddingId, eventId }),
        });
    }

    async function addEvent(e: any) {
        e.preventDefault();
        if (!newEvent.title || !newEvent.starts_at || publishing) return;
        setPublishing(true);
        try {
            const createdEvent = await createPlannerItem(weddingId, 'event', {
                title: newEvent.title.trim(),
                starts_at: new Date(newEvent.starts_at).toISOString(),
                ends_at: newEvent.ends_at ? new Date(newEvent.ends_at).toISOString() : null,
                location: newEvent.location.trim() || null,
                notes: newEvent.notes.trim() || null,
                planner_task_id: newEvent.planner_task_id || null,
                reminder_minutes: Number(newEvent.reminder_minutes) || 1440,
            });
            if (setEvents && createdEvent) {
                setEvents((current: any[]) => [...current, createdEvent].sort((a: any, b: any) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()));
            }
            setNewEvent({ title: '', starts_at: '', ends_at: '', location: '', notes: '', planner_task_id: '', reminder_minutes: '1440' });
            void reload();
            void syncGoogleCalendar(true);
        } catch (err) {
            const message = getPlannerErrorMessage(err, 'Failed to add schedule.');
            console.error('Error adding planner event:', message);
            alert(`Failed to add schedule: ${message}`);
        } finally {
            setPublishing(false);
        }
    }

    async function deleteEvent(id: string) {
        if (!confirm('Delete this schedule?')) return;
        try {
            await deleteGoogleCalendarEvent(id);
            await deletePlannerItem(weddingId, 'event', id);
            if (setEvents) setEvents((current: any[]) => current.filter((event: any) => event.id !== id));
            void reload();
        } catch (err) {
            const message = getPlannerErrorMessage(err, 'Unable to delete schedule.');
            console.warn('Error deleting schedule:', message);
            alert(message);
        }
    }

    const today = new Date();
    const upcoming = events.filter((event: any) => new Date(event.starts_at) >= today).slice(0, 6);
    const grouped: Record<string, any[]> = events.reduce((acc: Record<string, any[]>, event: any) => {
        const key = new Date(event.starts_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        acc[key] = acc[key] || [];
        acc[key].push(event);
        return acc;
    }, {});

    return (
        <div className="space-y-5">
            <div className="rounded-2xl border border-border bg-white p-4 soft-shadow sm:rounded-[2rem] sm:p-6 md:p-10">
                <div className="mb-5 flex flex-col gap-4 border-b border-border/50 pb-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0">
                        <h2 className="font-serif text-2xl font-bold leading-tight text-foreground sm:text-3xl">Schedule Calendar</h2>
                        <p className="mt-1 max-w-2xl text-xs leading-5 text-text-secondary sm:text-sm">Plan fittings, tastings, supplier meetings, and wedding week schedules.</p>
                    </div>
                    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:w-auto lg:flex lg:flex-row">
                        {hasPlannerPro && googleCalendar?.connected ? (
                            <>
                                <button type="button" onClick={() => void syncGoogleCalendar()} disabled={syncingGoogle} className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white disabled:opacity-50 sm:w-auto">
                                    <RefreshCw className={`h-4 w-4 ${syncingGoogle ? 'animate-spin' : ''}`} /> {syncingGoogle ? 'Syncing...' : 'Sync Google'}
                                </button>
                                <button type="button" onClick={() => void disconnectGoogleCalendar()} className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold text-text-secondary hover:bg-neutral sm:w-auto">
                                    Disconnect
                                </button>
                            </>
                        ) : hasPlannerPro ? (
                            <button type="button" onClick={() => void connectGoogleCalendar()} className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-white sm:w-auto">
                                <CalendarDays className="h-4 w-4" /> Connect Google Calendar
                            </button>
                        ) : (
                            <UpgradeButton weddingId={weddingId} variant="outlined" className="justify-center text-sm" label="Unlock Google Sync" />
                        )}
                        {feedUrl && (
                            <a href={feedUrl} className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-white sm:w-auto">
                                <Download className="h-4 w-4" /> Export .ics
                            </a>
                        )}
                    </div>
                </div>

                <form onSubmit={addEvent} className="mb-6 grid min-w-0 gap-3 rounded-2xl border border-border bg-neutral/30 p-3 sm:p-4 lg:grid-cols-3">
                    <label className="min-w-0 space-y-1">
                        <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-text-secondary">Title</span>
                        <input required value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Schedule title" className="min-h-[46px] w-full min-w-0 rounded-xl border border-border bg-white px-4 py-3 text-base outline-none focus:border-primary sm:text-sm" />
                    </label>
                    <label className="min-w-0 space-y-1">
                        <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-text-secondary">Starts</span>
                        <input required type="datetime-local" value={newEvent.starts_at} onChange={(e) => setNewEvent({ ...newEvent, starts_at: e.target.value })} className="min-h-[46px] w-full min-w-0 rounded-xl border border-border bg-white px-3 py-3 text-base outline-none focus:border-primary sm:text-sm" />
                    </label>
                    <label className="min-w-0 space-y-1">
                        <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-text-secondary">Ends</span>
                        <input type="datetime-local" value={newEvent.ends_at} onChange={(e) => setNewEvent({ ...newEvent, ends_at: e.target.value })} className="min-h-[46px] w-full min-w-0 rounded-xl border border-border bg-white px-3 py-3 text-base outline-none focus:border-primary sm:text-sm" />
                    </label>
                    <label className="min-w-0 space-y-1">
                        <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-text-secondary">Location</span>
                        <input value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="Location" className="min-h-[46px] w-full min-w-0 rounded-xl border border-border bg-white px-4 py-3 text-base outline-none focus:border-primary sm:text-sm" />
                    </label>
                    <label className="min-w-0 space-y-1">
                        <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-text-secondary">Checklist Link</span>
                        <select value={newEvent.planner_task_id} onChange={(e) => setNewEvent({ ...newEvent, planner_task_id: e.target.value })} className="min-h-[46px] w-full min-w-0 rounded-xl border border-border bg-white px-4 py-3 text-base outline-none focus:border-primary sm:text-sm">
                            <option value="">Related checklist item</option>
                            {tasks.map((task: any) => <option key={task.id} value={task.id}>{task.title}</option>)}
                        </select>
                    </label>
                    <label className="min-w-0 space-y-1">
                        <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-text-secondary">Reminder</span>
                        <select value={newEvent.reminder_minutes} onChange={(e) => setNewEvent({ ...newEvent, reminder_minutes: e.target.value })} className="min-h-[46px] w-full min-w-0 rounded-xl border border-border bg-white px-4 py-3 text-base outline-none focus:border-primary sm:text-sm">
                            <option value="60">Remind 1 hour before</option>
                            <option value="720">Remind 12 hours before</option>
                            <option value="1440">Remind 1 day before</option>
                            <option value="4320">Remind 3 days before</option>
                        </select>
                    </label>
                    <label className="min-w-0 space-y-1 lg:col-span-2">
                        <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-text-secondary">Notes</span>
                        <input value={newEvent.notes} onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })} placeholder="Notes" className="min-h-[46px] w-full min-w-0 rounded-xl border border-border bg-white px-4 py-3 text-base outline-none focus:border-primary sm:text-sm" />
                    </label>
                    <button disabled={publishing} className="min-h-[46px] rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{publishing ? 'Adding...' : 'Add Schedule'}</button>
                </form>

                <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
                    <div className="rounded-2xl border border-border bg-neutral/30 p-4">
                        <h3 className="mb-3 flex items-center gap-2 font-serif text-lg font-bold"><Clock className="h-5 w-5 text-primary" /> Upcoming</h3>
                        <div className="space-y-2">
                            {upcoming.length === 0 ? <p className="py-8 text-center text-sm italic text-text-secondary">No upcoming schedules.</p> : upcoming.map((event: any) => (
                                <div key={event.id} className="min-w-0 rounded-xl bg-white p-3 text-sm">
                                    <p className="break-words font-bold text-foreground">{event.title}</p>
                                    <p className="text-xs text-text-secondary">{new Date(event.starts_at).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        {Object.entries(grouped).map(([month, monthEvents]) => (
                            <div key={month} className="overflow-hidden rounded-2xl border border-border bg-white">
                                <div className="border-b border-border bg-neutral/30 px-4 py-3 font-serif font-bold">{month}</div>
                                <div className="divide-y divide-border/40">
                                    {monthEvents.map((event: any) => (
                                        <div key={event.id} className="grid min-w-0 gap-3 p-4 sm:grid-cols-[140px_minmax(0,1fr)_44px] sm:items-center">
                                            <p className="text-xs font-black uppercase tracking-widest text-primary">{new Date(event.starts_at).toLocaleDateString()}<br />{new Date(event.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            <div className="min-w-0">
                                                <p className="break-words font-bold text-foreground">{event.title}</p>
                                                <p className="break-words text-xs leading-5 text-text-secondary">{[event.location, event.notes].filter(Boolean).join(' - ')}</p>
                                            </div>
                                            <button onClick={() => void deleteEvent(event.id)} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-100 text-sm font-bold text-red-500 hover:bg-red-50 sm:w-11 sm:border-0" aria-label="Delete schedule">
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sm:hidden">Delete</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function PlannerBudgets({ weddingId, initialBudgets, setBudgets, setWedding, wedding, vendors = [], foodDrinks = [], reload, updateVendorStatus }: any) {
    const [publishing, setPublishing] = useState(false);
    const [newItem, setNewItem] = useState({ category: 'Venue', item_name: '', estimated_cost: '', due_date: '' });
    const [savingBudgetItemId, setSavingBudgetItemId] = useState<string | null>(null);
    const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
    const [currencyMenuPosition, setCurrencyMenuPosition] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);
    const currencyButtonRef = useRef<HTMLButtonElement | null>(null);
    const currencyMenuRef = useRef<HTMLDivElement | null>(null);

    // Local states for inputs to avoid jitter/focus issues and handle empty strings nicely
    const [localBudget, setLocalBudget] = useState<string | number>(wedding?.total_budget || '');
    const [localCurrency, setLocalCurrency] = useState(normalizeCurrencyCode(wedding?.currency));
    const [localGuestLimit, setLocalGuestLimit] = useState<string | number>(wedding?.guest_limit || '');
    const [scenarioGuests, setScenarioGuests] = useState<string | number>(wedding?.guest_limit || '');

    useEffect(() => {
        if (wedding) {
            setLocalBudget(wedding.total_budget || '');
            setLocalCurrency(normalizeCurrencyCode(wedding.currency));
            setLocalGuestLimit(wedding.guest_limit || '');
            setScenarioGuests(wedding.guest_limit || '');
        }
    }, [wedding]);

    const positionCurrencyMenu = useCallback(() => {
        if (typeof window === 'undefined') return;
        const trigger = currencyButtonRef.current;
        if (!trigger) return;

        const rect = trigger.getBoundingClientRect();
        const viewportPadding = 12;
        const preferredWidth = Math.min(360, window.innerWidth - viewportPadding * 2);
        const width = Math.max(Math.min(preferredWidth, 360), Math.min(rect.width, window.innerWidth - viewportPadding * 2));
        const left = Math.min(
            Math.max(viewportPadding, rect.left),
            Math.max(viewportPadding, window.innerWidth - width - viewportPadding),
        );
        const preferredMaxHeight = Math.min(390, window.innerHeight - viewportPadding * 2);
        const opensUp = rect.bottom + 10 + preferredMaxHeight > window.innerHeight && rect.top > preferredMaxHeight;
        const top = opensUp
            ? Math.max(viewportPadding, rect.top - preferredMaxHeight - 10)
            : Math.min(rect.bottom + 10, window.innerHeight - 120);
        const maxHeight = opensUp
            ? Math.min(preferredMaxHeight, Math.max(220, rect.top - viewportPadding * 2))
            : Math.min(preferredMaxHeight, Math.max(220, window.innerHeight - top - viewportPadding));

        setCurrencyMenuPosition({ top, left, width, maxHeight });
    }, []);

    useEffect(() => {
        if (!currencyMenuOpen || typeof document === 'undefined') return;
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setCurrencyMenuOpen(false);
        };
        const closeOnOutsidePointer = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node | null;
            if (!target) return;
            if (currencyButtonRef.current?.contains(target) || currencyMenuRef.current?.contains(target)) return;
            setCurrencyMenuOpen(false);
        };
        const reposition = () => positionCurrencyMenu();

        positionCurrencyMenu();
        window.addEventListener('keydown', closeOnEscape);
        window.addEventListener('resize', reposition);
        window.addEventListener('scroll', reposition, true);
        document.addEventListener('mousedown', closeOnOutsidePointer);
        document.addEventListener('touchstart', closeOnOutsidePointer);

        return () => {
            window.removeEventListener('keydown', closeOnEscape);
            window.removeEventListener('resize', reposition);
            window.removeEventListener('scroll', reposition, true);
            document.removeEventListener('mousedown', closeOnOutsidePointer);
            document.removeEventListener('touchstart', closeOnOutsidePointer);
        };
    }, [currencyMenuOpen, positionCurrencyMenu]);

    // Standard categories plus any custom ones already in the budget
    const [categories, setCategories] = useState(BUDGET_CATEGORIES);

    useEffect(() => {
        const customCats = initialBudgets.map((b: any) => b.category).filter((c: string) => c && !BUDGET_CATEGORIES.includes(c));
        const uniqueCats = Array.from(new Set([...BUDGET_CATEGORIES, ...customCats]));
        setCategories(uniqueCats);
    }, [initialBudgets]);
    
    const handleAddCustomCategory = () => {
        const cat = prompt("Enter custom budget category:");
        if (cat) {
            if (!categories.includes(cat)) {
                setCategories([...categories, cat]);
            }
            setNewItem({...newItem, category: cat});
        }
    };

    async function addItem(e: any) {
        e.preventDefault();
        if (!newItem.item_name || publishing) return;
        setPublishing(true);
        try {
            const estimatedCost = Math.max(0, parseFloat(newItem.estimated_cost) || 0);
            const createdBudget = await createPlannerItem(weddingId, 'budget', {
                category: newItem.category, 
                item_name: newItem.item_name,
                estimated_cost: estimatedCost,
                due_date: newItem.due_date || null,
            });
            if (setBudgets && createdBudget) {
                setBudgets((current: any[]) => [...current, createdBudget]);
            }
            setNewItem({ category: newItem.category, item_name: '', estimated_cost: '', due_date: '' });
            void reload();
        } catch (err) {
            const message = getPlannerErrorMessage(err, 'Failed to add budget item.');
            console.error("Error adding budget item:", message);
            alert(`Failed to add budget item: ${message}`);
        } finally {
            setPublishing(false);
        }
    }

    async function saveWeddingBudget(field: 'total_budget' | 'currency' | 'guest_limit', value: number | string) {
        const previousValue = field === 'total_budget'
            ? localBudget
            : field === 'currency'
                ? localCurrency
                : localGuestLimit;
        const normalizedValue = field === 'currency' ? normalizeCurrencyCode(String(value)) : value;

        try {
            if (field === 'total_budget') setLocalBudget(normalizedValue);
            if (field === 'currency') setLocalCurrency(normalizeCurrencyCode(String(normalizedValue)));
            if (field === 'guest_limit') setLocalGuestLimit(normalizedValue);
            if (setWedding) {
                setWedding((current: any) => current ? { ...current, [field]: normalizedValue } : current);
            }

            const { data: sessionData } = await getCachedSession();
            const token = sessionData.session?.access_token;
            if (!token) throw new Error('Please sign in again before saving budget settings.');

            const response = await fetch('/api/planner/settings', {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ weddingId, [field]: normalizedValue }),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || 'Unable to save budget settings.');
            }
        } catch (err) {
            const message = getPlannerErrorMessage(err, 'Failed to save budget settings.');
            console.error("Error updating wedding budget:", err);
            alert("Failed to update " + field + ": " + message);
            if (field === 'total_budget') setLocalBudget(previousValue);
            if (field === 'currency') setLocalCurrency(normalizeCurrencyCode(String(previousValue)));
            if (field === 'guest_limit') setLocalGuestLimit(previousValue);
            if (setWedding) {
                setWedding((current: any) => current ? { ...current, [field]: previousValue } : current);
            }
        }
    }

    async function deleteItem(id: string) {
        if (!confirm("Delete this budget item?")) return;
        try {
            await deletePlannerItem(weddingId, 'budget', id);
            if (setBudgets) setBudgets((current: any[]) => current.filter((item: any) => item.id !== id));
            void reload();
        } catch (err) {
            const message = getPlannerErrorMessage(err, 'Unable to delete budget item.');
            console.warn('Error deleting budget item:', message);
            alert(message);
        }
    }

    async function updateBudgetItem(id: string, values: Record<string, unknown>) {
        setSavingBudgetItemId(id);
        try {
            const updatedItem = await updatePlannerItem(weddingId, 'budget', id, values);
            if (setBudgets && updatedItem) {
                setBudgets((current: any[]) => current.map((item: any) => item.id === id ? { ...item, ...updatedItem } : item));
            }
            void reload();
        } catch (err) {
            const message = getPlannerErrorMessage(err, 'Unable to update budget item.');
            console.warn('Error updating budget item:', message);
            alert(message);
        } finally {
            setSavingBudgetItemId(null);
        }
    }

    const foodDrinkBudgetTotal = foodDrinks
        .filter((item: any) => !item.planner_vendor_id)
        .reduce((acc: number, item: any) => acc + (parseFloat(item.estimated_cost) || 0), 0);
    const budgetEstimateTotal = initialBudgets.reduce((acc: number, item: any) => acc + (parseFloat(item.estimated_cost) || 0), 0);
    const budgetActualTotal = initialBudgets.reduce((acc: number, item: any) => acc + (parseFloat(item.actual_cost) || 0), 0);
    const projectedBudgetItemTotal = initialBudgets.reduce((acc: number, item: any) => {
        const actual = parseFloat(item.actual_cost) || 0;
        const estimated = parseFloat(item.estimated_cost) || 0;
        return acc + (actual > 0 ? actual : estimated);
    }, 0);
    const projectedVariance = projectedBudgetItemTotal - budgetEstimateTotal;
    const paidBudgetItemTotal = initialBudgets
        .filter((item: any) => Boolean(item.is_paid))
        .reduce((acc: number, item: any) => acc + ((parseFloat(item.actual_cost) || 0) || (parseFloat(item.estimated_cost) || 0)), 0);
    const totalEst = budgetEstimateTotal + foodDrinkBudgetTotal;
    const totalSpentFromVendors = vendors
        .filter((v: any) => v.payment_status?.toLowerCase() === 'paid')
        .reduce((acc: number, v: any) => acc + (parseFloat(v.amount) || 0), 0);
    const outstandingVendorTotal = vendors
        .filter((v: any) => v.payment_status?.toLowerCase() !== 'paid')
        .reduce((acc: number, v: any) => acc + (parseFloat(v.amount) || 0), 0);
    
    const totalCommitted = totalEst + totalSpentFromVendors;
    const totalBudgetValue = parseFloat(String(localBudget)) || 0;
    const guestTargetValue = parseInt(String(localGuestLimit), 10) || 0;
    const budgetRemaining = totalBudgetValue - totalCommitted;
    const usagePercent = totalBudgetValue > 0 ? Math.min(100, Math.round((totalCommitted / totalBudgetValue) * 100)) : 0;
    const hasBudgetActivity = totalBudgetValue > 0 || totalCommitted > 0;
    const perGuestBudget = guestTargetValue > 0 && totalBudgetValue > 0 ? totalBudgetValue / guestTargetValue : 0;
    const trackedPerGuest = guestTargetValue > 0 && totalCommitted > 0 ? totalCommitted / guestTargetValue : 0;
    const money = (amount: number) => amount.toLocaleString(undefined, { maximumFractionDigits: 0 });
    const getItemPayableAmount = (item: any) => (parseFloat(item.actual_cost) || 0) || (parseFloat(item.estimated_cost) || 0);
    const getBudgetDueDate = (item: any) => {
        if (!item?.due_date) return null;
        const date = new Date(`${String(item.due_date).slice(0, 10)}T00:00:00`);
        return Number.isNaN(date.getTime()) ? null : date;
    };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const unpaidBudgetItems = initialBudgets.filter((item: any) => !item.is_paid);
    const overdueBudgetItems = unpaidBudgetItems
        .filter((item: any) => {
            const dueDate = getBudgetDueDate(item);
            return dueDate && dueDate < today;
        })
        .sort((a: any, b: any) => (getBudgetDueDate(a)?.getTime() || 0) - (getBudgetDueDate(b)?.getTime() || 0));
    const dueSoonBudgetItems = unpaidBudgetItems
        .filter((item: any) => {
            const dueDate = getBudgetDueDate(item);
            return dueDate && dueDate >= today && dueDate <= thirtyDaysFromNow;
        })
        .sort((a: any, b: any) => (getBudgetDueDate(a)?.getTime() || 0) - (getBudgetDueDate(b)?.getTime() || 0));
    const upcomingPayments = [...overdueBudgetItems, ...dueSoonBudgetItems];
    const upcomingPaymentTotal = upcomingPayments.reduce((acc: number, item: any) => acc + getItemPayableAmount(item), 0);
    const cateringBudgetTotal = initialBudgets
        .filter((item: any) => String(item.category || '').toLowerCase() === 'catering')
        .reduce((acc: number, item: any) => acc + (parseFloat(item.estimated_cost) || 0), 0);
    const guestSensitiveTotal = foodDrinkBudgetTotal + cateringBudgetTotal;
    const variableCostPerGuest = guestTargetValue > 0 ? guestSensitiveTotal / guestTargetValue : 0;
    const scenarioGuestCount = Math.max(0, parseInt(String(scenarioGuests), 10) || 0);
    const scenarioGuestDelta = scenarioGuestCount - guestTargetValue;
    const scenarioBudgetImpact = variableCostPerGuest * scenarioGuestDelta;
    const scenarioProjectedTotal = totalCommitted + scenarioBudgetImpact;
    const categoryTotals = initialBudgets.reduce((totals: Record<string, number>, item: any) => {
        const category = String(item.category || 'Other');
        totals[category] = (totals[category] || 0) + (parseFloat(item.estimated_cost) || 0);
        return totals;
    }, {});
    categoryTotals['Food & Drinks'] = foodDrinkBudgetTotal;
    const allocationSuggestions = SMART_BUDGET_ALLOCATIONS.map((allocation) => {
        const planned = allocation.category === 'Decor'
            ? (categoryTotals.Decor || 0) + (categoryTotals.Flowers || 0)
            : (categoryTotals[allocation.category] || 0);
        const target = totalBudgetValue * (allocation.percent / 100);
        return {
            ...allocation,
            planned,
            target,
            delta: planned - target,
            percentOfBudget: totalBudgetValue > 0 ? Math.round((planned / totalBudgetValue) * 100) : 0,
        };
    });
    const categoryBreakdown = [
        ...categories.map((category, index) => {
            const total = initialBudgets
                .filter((item: any) => item.category === category)
                .reduce((acc: number, item: any) => acc + Number(item.estimated_cost || 0), 0);

            return {
                category,
                total,
                color: BUDGET_CATEGORY_COLORS[index % BUDGET_CATEGORY_COLORS.length],
                percent: totalEst > 0 ? Math.round((total / totalEst) * 100) : 0,
            };
        }),
        {
            category: 'Food & Drinks',
            total: foodDrinkBudgetTotal,
            color: BUDGET_CATEGORY_COLORS[categories.length % BUDGET_CATEGORY_COLORS.length],
            percent: totalEst > 0 ? Math.round((foodDrinkBudgetTotal / totalEst) * 100) : 0,
        },
    ]
        .filter((entry) => entry.total > 0)
        .sort((a, b) => b.total - a.total);
    const budgetStatus = totalBudgetValue <= 0
        ? {
            label: 'Budget not set',
            className: 'border-border bg-neutral text-text-secondary',
        }
        : budgetRemaining < 0
            ? {
                label: `Over by ${getCurrencySymbol(localCurrency)}${money(Math.abs(budgetRemaining))}`,
                className: 'border-red-200 bg-red-50 text-red-700',
            }
            : usagePercent >= 90
                ? {
                    label: 'Nearly allocated',
                    className: 'border-amber-200 bg-amber-50 text-amber-700',
                }
                : {
                    label: 'On track',
                    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
                };

    // Chart Data
    const chartData = [
        { name: 'Allocated (Budget + Food)', value: totalEst },
        { name: 'Paid Vendors', value: totalSpentFromVendors },
        { name: 'Remaining', value: Math.max(0, budgetRemaining) }
    ];
    const COLORS = ['#D16C78', '#CBB26A', '#3A2A2D'];

    // Derive symbol from localCurrency for immediate UI feedback
    const currencySymbol = getCurrencySymbol(localCurrency);
    const selectedCurrency = SUPPORTED_CURRENCIES.find((currency) => currency.code === localCurrency) ?? SUPPORTED_CURRENCIES[0];
    const changeBudgetCurrency = (currencyCode: string) => {
        const nextCurrency = normalizeCurrencyCode(currencyCode);
        setCurrencyMenuOpen(false);
        if (nextCurrency === localCurrency) return;
        void saveWeddingBudget('currency', nextCurrency);
    };
    const csvCell = (value: unknown) => {
        const text = String(value ?? '').replace(/"/g, '""');
        return `"${text}"`;
    };
    const downloadBudgetCsv = () => {
        const rows = [
            ['Type', 'Category/Role', 'Item', 'Estimated', 'Actual/Paid', 'Variance', 'Status', 'Due date'],
            ...initialBudgets.map((item: any) => {
                const estimated = parseFloat(item.estimated_cost) || 0;
                const actual = parseFloat(item.actual_cost) || 0;
                return [
                    'Budget item',
                    item.category || '',
                    item.item_name || '',
                    estimated,
                    actual,
                    actual > 0 ? actual - estimated : '',
                    item.is_paid ? 'Paid' : 'Unpaid',
                    item.due_date ? String(item.due_date).slice(0, 10) : '',
                ];
            }),
            ...foodDrinks.filter((item: any) => !item.planner_vendor_id).map((item: any) => [
                'Food & drink',
                item.item_type || 'Food & Drinks',
                item.item_name || '',
                parseFloat(item.estimated_cost) || 0,
                '',
                '',
                'Included in budget',
                '',
            ]),
            ...vendors.map((vendor: any) => [
                'Supplier',
                vendor.role || '',
                vendor.name || '',
                parseFloat(vendor.amount) || 0,
                vendor.payment_status?.toLowerCase() === 'paid' ? (parseFloat(vendor.amount) || 0) : '',
                '',
                vendor.payment_status || 'not paid',
                '',
            ]),
        ];
        const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `quickweds-budget-${weddingId}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="overflow-x-hidden rounded-xl border border-border bg-white p-4 soft-shadow sm:rounded-2xl sm:p-6 md:rounded-3xl lg:p-8">
            <div className="mb-5 border-b border-border/50 pb-5">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0">
                        <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">Budget Tracker</h2>
                        <p className="mt-1 text-sm text-text-secondary">Set the whole wedding budget, then compare estimates, food costs, and paid vendors.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={downloadBudgetCsv} className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary transition hover:bg-primary hover:text-white">
                            <Download className="h-4 w-4" />
                            CSV
                        </button>
                        <button type="button" onClick={() => window.print()} className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-text-secondary transition hover:border-primary/30 hover:text-primary">
                            <Download className="h-4 w-4" />
                            PDF
                        </button>
                        <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest ${budgetStatus.className}`}>
                            <Wallet className="h-4 w-4" />
                            {budgetStatus.label}
                        </div>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(21rem,2fr)_repeat(3,minmax(9rem,1fr))]">
                    <div className="rounded-2xl border border-primary/15 bg-neutral/40 p-3 sm:col-span-2 sm:p-4 lg:col-span-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Whole Wedding Budget</p>
                        <div className="mt-2 grid grid-cols-[minmax(8.25rem,0.95fr)_minmax(7.75rem,1fr)] gap-2 sm:grid-cols-[11rem_minmax(10rem,1fr)]">
                            <div className="relative min-w-0">
                                <button
                                    ref={currencyButtonRef}
                                    type="button"
                                    aria-haspopup="listbox"
                                    aria-expanded={currencyMenuOpen}
                                    aria-label="Budget currency"
                                    onClick={() => {
                                        if (currencyMenuOpen) {
                                            setCurrencyMenuOpen(false);
                                            return;
                                        }
                                        positionCurrencyMenu();
                                        setCurrencyMenuOpen(true);
                                    }}
                                    className="group flex h-12 w-full items-center justify-between gap-2 rounded-xl border border-primary/40 bg-white/85 px-2.5 text-left shadow-[0_12px_30px_rgba(209,108,120,0.2)] outline-none ring-1 ring-primary/15 backdrop-blur-xl transition hover:border-primary/60 hover:bg-white focus:border-primary focus:ring-2 focus:ring-primary/25"
                                >
                                    <span className="flex min-w-0 items-center gap-2">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-sm font-black text-primary ring-1 ring-primary/15">
                                            {selectedCurrency.symbol}
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-black text-foreground">{selectedCurrency.code}</span>
                                            <span className="block truncate text-[10px] font-bold leading-tight text-text-secondary">{selectedCurrency.label}</span>
                                        </span>
                                    </span>
                                    <ChevronDown className={`h-4 w-4 shrink-0 text-primary transition-transform ${currencyMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                            <div className="relative min-w-0 flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold text-sm pointer-events-none">{currencySymbol}</span>
                                <input 
                                    type="number" 
                                    inputMode="decimal"
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                    value={localBudget}
                                    onChange={e => setLocalBudget(e.target.value)}
                                    onBlur={e => {
                                        const val = parseFloat(e.target.value) || 0;
                                        saveWeddingBudget('total_budget', val);
                                    }}
                                    aria-label="Whole wedding budget amount"
                                    className="icon-field-left-compact h-12 w-full min-w-0 rounded-xl border border-border bg-white pl-8 pr-3 text-right font-mono text-lg font-bold tabular-nums text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                        </div>
                    </div>
                    {currencyMenuOpen && currencyMenuPosition && typeof document !== 'undefined' && createPortal(
                        <div
                            ref={currencyMenuRef}
                            role="listbox"
                            aria-label="Budget currencies"
                            style={{
                                top: currencyMenuPosition.top,
                                left: currencyMenuPosition.left,
                                width: currencyMenuPosition.width,
                                maxHeight: currencyMenuPosition.maxHeight,
                            }}
                            className="fixed z-[9999] overflow-y-auto rounded-[1.35rem] border border-primary/30 bg-white/90 p-2 text-foreground shadow-[0_24px_80px_rgba(58,42,45,0.32)] ring-4 ring-primary/10 backdrop-blur-2xl"
                        >
                            <div className="mb-2 flex items-center justify-between gap-3 rounded-2xl border border-white/70 bg-[#3A2A2D]/90 px-3 py-3 text-white shadow-inner backdrop-blur-xl">
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/65">Budget Currency</p>
                                    <p className="truncate font-serif text-lg font-bold text-white drop-shadow-sm">Choose currency</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCurrencyMenuOpen(false)}
                                    className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full border border-white/20 bg-white/15 text-white shadow-sm backdrop-blur transition hover:bg-white/25"
                                    aria-label="Close currency selector"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="space-y-1.5">
                                {SUPPORTED_CURRENCIES.map((currency) => {
                                    const selected = currency.code === selectedCurrency.code;
                                    return (
                                        <button
                                            key={currency.code}
                                            type="button"
                                            role="option"
                                            aria-selected={selected}
                                            onClick={() => changeBudgetCurrency(currency.code)}
                                            className={`flex min-h-[52px] w-full items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-left shadow-sm backdrop-blur transition ${selected ? 'border-primary/25 bg-primary/10 text-primary' : 'border-border/70 bg-white/80 text-foreground hover:border-primary/25 hover:bg-primary/5'}`}
                                        >
                                            <span className="flex min-w-0 items-center gap-3">
                                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-black ring-1 ${selected ? 'bg-white text-primary ring-primary/20' : 'bg-neutral text-text-secondary ring-border'}`}>
                                                    {currency.symbol}
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block text-sm font-black">{currency.code}</span>
                                                    <span className={`block truncate text-[11px] font-bold ${selected ? 'text-primary/70' : 'text-text-secondary'}`}>{currency.label}</span>
                                                </span>
                                            </span>
                                            {selected && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>,
                        document.body,
                    )}
                    <div className="rounded-2xl border border-border bg-neutral/40 p-3 sm:p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Guests</p>
                        <div className="relative mt-2">
                            <Users className="absolute left-2 top-1/2 -translate-y-1/2 text-primary w-4 h-4 pointer-events-none" />
                                <input 
                                    type="number" 
                                    inputMode="numeric"
                                    min="0"
                                    step="1"
                                    placeholder="0"
                                    value={localGuestLimit}
                                    onChange={e => setLocalGuestLimit(e.target.value)}
                                    onBlur={e => {
                                        const val = parseInt(e.target.value) || 0;
                                        saveWeddingBudget('guest_limit', val);
                                    }}
                                    aria-label="Guest target"
                                    className="icon-field-left-compact h-12 w-full rounded-xl border border-border bg-white pl-8 pr-3 text-right font-mono text-lg font-bold tabular-nums text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                        </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-neutral/40 p-3 sm:p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Tracked</p>
                        <p className={`mt-3 break-words font-mono text-xl font-black leading-tight tabular-nums ${totalCommitted > totalBudgetValue && totalBudgetValue > 0 ? 'text-red-500' : 'text-primary'}`}>{currencySymbol}{money(totalCommitted)}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-neutral/40 p-3 sm:p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Remaining</p>
                        <p className={`mt-3 break-words font-mono text-xl font-black leading-tight tabular-nums ${budgetRemaining < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {budgetRemaining < 0 ? '-' : ''}{currencySymbol}{money(Math.abs(budgetRemaining))}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-3 sm:gap-4 mb-4">
                {/* Visual Usage */}
                <div className="bg-neutral/30 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-border/50 grid gap-3 sm:grid-cols-[170px_1fr] sm:items-center shadow-inner">
                    <div className="h-[150px] min-h-[1px] w-full min-w-[1px] sm:h-[170px]">
                        {hasBudgetActivity ? (
                            <LazyBudgetPieChart
                                data={chartData}
                                colors={COLORS}
                                currencySymbol={currencySymbol}
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={5}
                                tooltipRadius={12}
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center rounded-full border border-dashed border-primary/25 bg-white text-primary">
                                <Wallet className="h-10 w-10" />
                            </div>
                        )}
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-end gap-2">
                            <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-text-secondary">Overall Usage</h3>
                            <span className={`text-lg sm:text-2xl font-black ${usagePercent > 90 ? 'text-red-500' : 'text-primary'}`}>{usagePercent}%</span>
                        </div>
                        <div className="w-full h-2 sm:h-3 bg-white rounded-full overflow-hidden border border-border/50">
                            <div className={`h-full transition-all duration-1000 ${usagePercent > 90 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${usagePercent}%` }} />
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {chartData.map((entry, i) => (
                                <div key={entry.name} className="flex justify-between items-center text-xs gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i] }} />
                                        <span className="text-text-secondary font-bold truncate">{entry.name}</span>
                                    </div>
                                    <span className="font-mono font-bold text-xs flex-shrink-0">{currencySymbol}{money(entry.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Info */}
                <div className="bg-white border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 grid gap-2 soft-shadow sm:grid-cols-2 lg:grid-cols-1">
                    <div className="flex items-center gap-3 rounded-xl bg-neutral/40 p-2.5">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 min-h-[44px] min-w-[44px]">
                            <PieChartIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary">Planned Total</p>
                            <p className="text-base sm:text-lg md:text-xl font-mono font-bold">{currencySymbol}{money(totalEst)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-neutral/40 p-2.5">
                        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 min-h-[44px] min-w-[44px]">
                            <Users className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                            <p className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary">Paid to Vendors</p>
                            <p className="text-base sm:text-lg md:text-xl font-mono font-bold">{currencySymbol}{money(totalSpentFromVendors)}</p>
                            {outstandingVendorTotal > 0 && (
                                <p className="mt-0.5 text-[10px] font-bold text-text-secondary">Outstanding {currencySymbol}{money(outstandingVendorTotal)}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-neutral/40 p-2.5">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 min-h-[44px] min-w-[44px]">
                            <TrendingDown className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary">Remaining Cash</p>
                            <p className="text-base sm:text-lg md:text-xl font-mono font-bold text-emerald-600">{currencySymbol}{money(Math.max(0, budgetRemaining))}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-neutral/40 p-2.5">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 min-h-[44px] min-w-[44px]">
                            <Users className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary">Per Guest Budget</p>
                            <p className="text-base sm:text-lg md:text-xl font-mono font-bold">
                                {guestTargetValue > 0 ? `${currencySymbol}${money(perGuestBudget)}` : '--'}
                            </p>
                            {guestTargetValue > 0 && trackedPerGuest > 0 && (
                                <p className="mt-0.5 text-[10px] font-bold text-text-secondary">Tracked {currencySymbol}{money(trackedPerGuest)}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_1fr]">
                <div className="rounded-2xl border border-border/60 bg-white p-4 soft-shadow">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h3 className="font-serif text-lg font-bold text-foreground">Estimate vs Actual</h3>
                            <p className="text-xs text-text-secondary">Actuals override estimates for projection once entered.</p>
                        </div>
                        <span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${projectedVariance > 0 ? 'bg-red-50 text-red-700' : projectedVariance < 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral text-text-secondary'}`}>
                            {projectedVariance > 0 ? 'Over estimate' : projectedVariance < 0 ? 'Under estimate' : 'Matched'}
                        </span>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                        <div className="rounded-xl bg-neutral/40 p-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Estimated</p>
                            <p className="mt-2 font-mono text-lg font-black text-foreground">{currencySymbol}{money(budgetEstimateTotal)}</p>
                        </div>
                        <div className="rounded-xl bg-neutral/40 p-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Projected</p>
                            <p className="mt-2 font-mono text-lg font-black text-primary">{currencySymbol}{money(projectedBudgetItemTotal)}</p>
                            {budgetActualTotal > 0 && <p className="mt-1 text-[10px] font-bold text-text-secondary">Actual entered {currencySymbol}{money(budgetActualTotal)}</p>}
                        </div>
                        <div className="rounded-xl bg-neutral/40 p-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Variance</p>
                            <p className={`mt-2 font-mono text-lg font-black ${projectedVariance > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                                {projectedVariance < 0 ? '-' : ''}{currencySymbol}{money(Math.abs(projectedVariance))}
                            </p>
                            {paidBudgetItemTotal > 0 && <p className="mt-1 text-[10px] font-bold text-text-secondary">Paid line items {currencySymbol}{money(paidBudgetItemTotal)}</p>}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-white p-4 soft-shadow">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h3 className="font-serif text-lg font-bold text-foreground">Payment Schedule</h3>
                            <p className="text-xs text-text-secondary">Unpaid line items due now or in the next 30 days.</p>
                        </div>
                        <p className="font-mono text-sm font-black text-primary">{currencySymbol}{money(upcomingPaymentTotal)}</p>
                    </div>
                    <div className="mt-4 space-y-2">
                        {upcomingPayments.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-primary/20 bg-neutral/30 p-4 text-sm text-text-secondary">
                                No unpaid budget items are due in the next 30 days.
                            </div>
                        ) : upcomingPayments.slice(0, 5).map((item: any) => {
                            const dueDate = getBudgetDueDate(item);
                            const isOverdue = Boolean(dueDate && dueDate < today);
                            return (
                                <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-neutral/35 p-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-foreground">{item.item_name}</p>
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${isOverdue ? 'text-red-600' : 'text-text-secondary'}`}>
                                            {isOverdue ? 'Overdue' : 'Due soon'} {dueDate ? dueDate.toLocaleDateString() : ''}
                                        </p>
                                    </div>
                                    <p className="shrink-0 font-mono text-sm font-black text-primary">{currencySymbol}{money(getItemPayableAmount(item))}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_1fr]">
                <div className="rounded-2xl border border-primary/15 bg-neutral/30 p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h3 className="font-serif text-lg font-bold text-foreground">Guest Count Simulator</h3>
                            <p className="text-xs text-text-secondary">Uses catering and food/drink estimates to model guest-count changes.</p>
                        </div>
                        <label className="mt-2 block w-full sm:mt-0 sm:w-36">
                            <span className="sr-only">Scenario guest count</span>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={scenarioGuests}
                                onChange={(e) => setScenarioGuests(e.target.value)}
                                className="h-11 w-full rounded-xl border border-border bg-white px-3 text-right font-mono text-sm font-black outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                            />
                        </label>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                        <div className="rounded-xl bg-white p-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Variable / Guest</p>
                            <p className="mt-2 font-mono text-lg font-black text-primary">{guestTargetValue > 0 ? `${currencySymbol}${money(variableCostPerGuest)}` : '--'}</p>
                        </div>
                        <div className="rounded-xl bg-white p-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Guest Change</p>
                            <p className={`mt-2 font-mono text-lg font-black ${scenarioGuestDelta > 0 ? 'text-red-500' : scenarioGuestDelta < 0 ? 'text-emerald-600' : 'text-foreground'}`}>
                                {scenarioGuestDelta > 0 ? '+' : ''}{scenarioGuestDelta}
                            </p>
                        </div>
                        <div className="rounded-xl bg-white p-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Budget Impact</p>
                            <p className={`mt-2 font-mono text-lg font-black ${scenarioBudgetImpact > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                                {scenarioBudgetImpact < 0 ? '-' : ''}{currencySymbol}{money(Math.abs(scenarioBudgetImpact))}
                            </p>
                        </div>
                    </div>
                    <p className="mt-3 text-xs font-semibold text-text-secondary">
                        Scenario tracked total: {currencySymbol}{money(Math.max(0, scenarioProjectedTotal))}
                    </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-white p-4 soft-shadow">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h3 className="font-serif text-lg font-bold text-foreground">Smart Allocation</h3>
                            <p className="text-xs text-text-secondary">Suggested category targets based on your whole wedding budget.</p>
                        </div>
                        <p className="font-mono text-sm font-black text-primary">{totalBudgetValue > 0 ? `${currencySymbol}${money(totalBudgetValue)}` : 'Set budget'}</p>
                    </div>
                    <div className="mt-4 space-y-2">
                        {allocationSuggestions.slice(0, 5).map((allocation) => {
                            const overTarget = allocation.delta > totalBudgetValue * 0.03;
                            return (
                                <div key={allocation.category} className="rounded-xl border border-border/60 bg-neutral/25 p-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-foreground">{allocation.category}</p>
                                            <p className="text-[10px] font-bold text-text-secondary">{allocation.note}</p>
                                        </div>
                                        <p className={`shrink-0 font-mono text-sm font-black ${overTarget ? 'text-red-500' : 'text-primary'}`}>{allocation.percentOfBudget}%</p>
                                    </div>
                                    <div className="mt-2 flex flex-wrap justify-between gap-2 text-[10px] font-bold text-text-secondary">
                                        <span>Target {currencySymbol}{money(allocation.target)}</span>
                                        <span>Planned {currencySymbol}{money(allocation.planned)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {categoryBreakdown.length > 0 && (
                <div className="mb-5 rounded-2xl border border-border/50 bg-white p-4 soft-shadow">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h3 className="font-serif text-lg font-bold text-foreground">Category Breakdown</h3>
                            <p className="text-xs text-text-secondary">Largest planned categories by estimate.</p>
                        </div>
                        <p className="font-mono text-sm font-black text-primary">{currencySymbol}{money(totalEst)} planned</p>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {categoryBreakdown.slice(0, 6).map((entry) => (
                            <div key={entry.category} className="rounded-xl border border-border/60 bg-neutral/25 p-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-foreground">{entry.category}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{entry.percent}% of planned</p>
                                    </div>
                                    <p className="shrink-0 font-mono text-sm font-black text-primary">{currencySymbol}{money(entry.total)}</p>
                                </div>
                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, entry.percent)}%`, backgroundColor: entry.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={addItem} className="mb-5 rounded-2xl border border-border/50 bg-neutral/30 p-4 lg:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="font-serif text-lg font-bold text-foreground">Add Expense</h3>
                    <div className="hidden gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary sm:flex">
                        <span>Planned {currencySymbol}{money(totalEst)}</span>
                        <span>Food {currencySymbol}{money(foodDrinkBudgetTotal)}</span>
                        <span>Paid {currencySymbol}{money(totalSpentFromVendors)}</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1.35fr_minmax(9rem,0.8fr)_minmax(9rem,0.85fr)_minmax(8rem,auto)] xl:items-end">
                    <div className="min-w-0">
                        <label className="block text-[9px] uppercase font-black tracking-widest text-text-secondary mb-1 ml-1">Category</label>
                        <select 
                            value={newItem.category} 
                            onChange={e => e.target.value === 'CUSTOM' ? handleAddCustomCategory() : setNewItem({...newItem, category: e.target.value})}
                            className="min-h-[46px] w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            <option value="CUSTOM">+ Add Custom</option>
                        </select>
                    </div>
                    <div className="min-w-0">
                        <label className="block text-[9px] uppercase font-black tracking-widest text-text-secondary mb-1 ml-1">Expense</label>
                        <input 
                            required
                            type="text" 
                            placeholder="e.g. Venue Rental" 
                            value={newItem.item_name}
                            onChange={e => setNewItem({...newItem, item_name: e.target.value})}
                            className="min-h-[46px] w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                        />
                    </div>
                    <div className="min-w-0">
                        <label className="block text-[9px] uppercase font-black tracking-widest text-text-secondary mb-1 ml-1">Est. Cost ({currencySymbol})</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm font-bold pointer-events-none">{currencySymbol}</span>
                            <input 
                                required
                                type="number" 
                                inputMode="decimal"
                                min="0"
                                step="0.01"
                                placeholder="0" 
                                value={newItem.estimated_cost}
                                onChange={e => setNewItem({...newItem, estimated_cost: e.target.value})}
                                className="icon-field-left-compact min-h-[46px] w-full min-w-0 rounded-xl border border-border bg-white py-2.5 pl-8 pr-3 font-mono text-base tabular-nums outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                        </div>
                    </div>
                    <div className="min-w-0">
                        <label className="block text-[9px] uppercase font-black tracking-widest text-text-secondary mb-1 ml-1">Payment Due</label>
                        <input
                            type="date"
                            value={newItem.due_date}
                            onChange={(e) => setNewItem({ ...newItem, due_date: e.target.value })}
                            className="min-h-[46px] w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                        />
                    </div>
                    <button type="submit" disabled={publishing} className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60">
                        <Plus className="h-4 w-4" />
                        {publishing ? 'Adding...' : 'Add Expense'}
                    </button>
                </div>
            </form>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {/* Estimates from Budget Table */}
                <div className="space-y-3">
                    <h3 className="text-base sm:text-lg font-serif font-bold text-foreground flex items-center gap-2">
                        <ListTodo className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" /> Budget Estimates
                    </h3>
                    {initialBudgets.length === 0 && (
                        <div className="rounded-xl border border-dashed border-primary/25 bg-neutral/30 p-6 text-center">
                            <Wallet className="mx-auto h-8 w-8 text-primary" />
                            <p className="mt-3 font-serif text-lg font-bold text-foreground">No expense estimates yet.</p>
                            <p className="mt-1 text-sm text-text-secondary">Add the first line item above to start building your wedding budget.</p>
                        </div>
                    )}
                    {categories.map(category => {
                        const items = initialBudgets.filter((b: any) => b.category === category);
                        if (items.length === 0) return null;
                        const catTotal = items.reduce((acc: number, item: any) => acc + Number(item.estimated_cost || 0), 0);
                        
                        return (
                            <div key={category} className="border border-border rounded-lg sm:rounded-xl overflow-hidden bg-white">
                                <div className="bg-neutral/30 px-3 sm:px-4 py-2 flex justify-between items-center border-b border-border gap-2">
                                    <h4 className="font-bold text-xs sm:text-sm text-text-secondary uppercase tracking-widest">{category}</h4>
                                    <span className="font-mono font-bold text-xs sm:text-sm whitespace-nowrap">{currencySymbol}{money(catTotal)}</span>
                                </div>
                                <div className="divide-y divide-border/30 max-h-[520px] overflow-y-auto">
                                    {items.map((item: any) => {
                                        const estimated = Number(item.estimated_cost || 0);
                                        const actual = Number(item.actual_cost || 0);
                                        const effectiveActual = actual > 0 ? actual : estimated;
                                        const variance = effectiveActual - estimated;
                                        const itemDueDate = item.due_date ? String(item.due_date).slice(0, 10) : '';
                                        const isSaving = savingBudgetItemId === item.id;

                                        return (
                                            <div key={item.id} className="grid gap-3 px-3 py-3 sm:px-4 lg:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(6rem,0.75fr))_44px] lg:items-center">
                                                <div className="min-w-0">
                                                    <p className="font-serif text-sm font-bold text-foreground break-words">{item.item_name}</p>
                                                    <p className={`mt-1 inline-flex rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-widest ${item.is_paid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                                        {item.is_paid ? 'Paid' : 'Unpaid'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-[8px] font-black uppercase tracking-widest text-text-secondary">Estimate</label>
                                                    <p className="mt-1 font-mono text-sm font-black text-text-secondary">{currencySymbol}{money(estimated)}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-[8px] font-black uppercase tracking-widest text-text-secondary">Actual</label>
                                                    <div className="relative mt-1">
                                                        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-text-secondary">{currencySymbol}</span>
                                                        <input
                                                            type="number"
                                                            inputMode="decimal"
                                                            min="0"
                                                            step="0.01"
                                                            defaultValue={actual || ''}
                                                            onBlur={(e) => {
                                                                const nextActual = Math.max(0, parseFloat(e.target.value) || 0);
                                                                if (nextActual !== actual) {
                                                                    updateBudgetItem(item.id, { actual_cost: nextActual });
                                                                }
                                                            }}
                                                            className="h-10 w-full rounded-lg border border-border bg-white pl-6 pr-2 text-right font-mono text-sm font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[8px] font-black uppercase tracking-widest text-text-secondary">Variance</label>
                                                    <p className={`mt-1 font-mono text-sm font-black ${variance > 0 ? 'text-red-500' : variance < 0 ? 'text-emerald-600' : 'text-text-secondary'}`}>
                                                        {variance < 0 ? '-' : ''}{currencySymbol}{money(Math.abs(variance))}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-[8px] font-black uppercase tracking-widest text-text-secondary">Due</label>
                                                    <input
                                                        type="date"
                                                        defaultValue={itemDueDate}
                                                        onBlur={(e) => {
                                                            if (e.target.value !== itemDueDate) {
                                                                updateBudgetItem(item.id, { due_date: e.target.value || null });
                                                            }
                                                        }}
                                                        className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-2 text-xs font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between gap-2 lg:justify-center">
                                                    <label className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-border bg-white px-3 text-xs font-bold text-text-secondary">
                                                        <input
                                                            type="checkbox"
                                                            checked={Boolean(item.is_paid)}
                                                            onChange={(e) => updateBudgetItem(item.id, { is_paid: e.target.checked })}
                                                            className="h-4 w-4 accent-primary"
                                                        />
                                                        Paid
                                                    </label>
                                                    <button type="button" onClick={() => deleteItem(item.id)} disabled={isSaving} className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50" aria-label="Delete budget item">
                                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Actual Spending from Vendors */}
                <div className="space-y-3">
                    <h3 className="text-base sm:text-lg font-serif font-bold text-foreground flex items-center gap-2">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" /> Actual Vendor Spending
                    </h3>
                    <div className="bg-white border border-border rounded-lg sm:rounded-xl overflow-hidden soft-shadow">
                        <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs sm:text-base">
                            <thead>
                                <tr className="bg-neutral/30 border-b border-border sticky top-0">
                                    <th className="px-3 sm:px-4 py-2 text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary">Vendor / Role</th>
                                    <th className="px-3 sm:px-4 py-2 text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary text-right">Amount</th>
                                    <th className="px-3 sm:px-4 py-2 text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {vendors.length === 0 ? (
                                    <tr><td colSpan={3} className="px-3 sm:px-4 py-8 text-center text-text-secondary italic font-serif text-xs sm:text-base">No vendors added yet.</td></tr>
                                ) : (
                                    vendors.map((vendor: any) => (
                                        <tr key={vendor.id} className="hover:bg-neutral/10 transition-colors">
                                            <td className="px-3 sm:px-4 py-2 min-w-[120px] sm:min-w-0">
                                                <p className="font-bold text-foreground text-xs sm:text-base whitespace-normal break-words leading-tight">{vendor.name}</p>
                                                <p className="text-[7px] sm:text-[10px] uppercase tracking-widest text-primary font-black opacity-60 mt-0.5">{vendor.role}</p>
                                            </td>
                                            <td className="px-3 sm:px-4 py-2 text-right font-mono font-bold text-xs sm:text-sm">
                                                {currencySymbol}{money(Number(vendor.amount || 0))}
                                            </td>
                                            <td className="px-3 sm:px-4 py-2 text-center">
                                                <VendorPaymentStatusSelect
                                                    value={vendor.payment_status}
                                                    onChange={(status) => updateVendorStatus(vendor.id, status)}
                                                    compact
                                                    className="mx-auto w-[118px] sm:w-[136px]"
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FoodDrinksPlanner({ weddingId, foodDrinks = [], setFoodDrinks, vendors = [], currency, reload }: any) {
    const [publishing, setPublishing] = useState(false);
    const [uploadingReference, setUploadingReference] = useState(false);
    const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
    const [newItem, setNewItem] = useState({
        item_type: 'food',
        item_name: '',
        serving_category: '',
        reference_image_url: '',
        estimated_cost: '',
        planner_vendor_id: '',
        custom_supplier_name: '',
        notes: '',
    });

    const currencySymbol = getCurrencySymbol(currency);
    const cateringVendors = vendors.filter((vendor: any) => /cater|food|drink|bar|dessert|cake/i.test(`${vendor.role} ${vendor.name}`));
    const includedTotal = foodDrinks
        .filter((item: any) => !item.planner_vendor_id)
        .reduce((sum: number, item: any) => sum + Number(item.estimated_cost || 0), 0);

    async function uploadReference(file: File) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }
        if (file.size > 8 * 1024 * 1024) {
            alert('Food reference photo must be 8MB or smaller.');
            return;
        }
        setUploadingReference(true);
        try {
            const safeName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
            const path = `planner-food/${weddingId}/${Date.now()}-${safeName}`;
            const { error } = await supabase.storage.from('quickweds').upload(path, file, { contentType: file.type, upsert: true });
            if (error) throw error;
            const { data } = supabase.storage.from('quickweds').getPublicUrl(path);
            setNewItem((current) => ({ ...current, reference_image_url: data.publicUrl }));
        } catch (err) {
            console.error('Food reference upload failed:', err);
            alert(err instanceof Error ? err.message : 'Unable to upload food reference photo.');
        } finally {
            setUploadingReference(false);
        }
    }

    async function addItem(e: any) {
        e.preventDefault();
        if (!newItem.item_name || publishing) return;
        setPublishing(true);
        try {
            const createdFoodDrink = await createPlannerItem(weddingId, 'foodDrink', {
                item_type: newItem.item_type,
                item_name: newItem.item_name.trim(),
                serving_category: newItem.serving_category.trim() || null,
                reference_image_url: newItem.reference_image_url.trim() || null,
                estimated_cost: parseFloat(newItem.estimated_cost) || 0,
                planner_vendor_id: newItem.planner_vendor_id || null,
                custom_supplier_name: newItem.custom_supplier_name.trim() || null,
                notes: newItem.notes.trim() || null,
            });
            if (setFoodDrinks && createdFoodDrink) {
                setFoodDrinks((current: any[]) => [...current, createdFoodDrink]);
            }
            setNewItem({ item_type: 'food', item_name: '', serving_category: '', reference_image_url: '', estimated_cost: '', planner_vendor_id: '', custom_supplier_name: '', notes: '' });
            void reload();
        } catch (err) {
            const message = getPlannerErrorMessage(err, 'Failed to add food or drink.');
            console.warn('Error adding food/drink item:', message);
            alert(`Failed to add food or drink: ${message}`);
        } finally {
            setPublishing(false);
        }
    }

    async function deleteItem(id: string) {
        if (deletingItemId) return;
        setDeletingItemId(id);
        try {
            await deletePlannerItem(weddingId, 'foodDrink', id);
            if (setFoodDrinks) setFoodDrinks((current: any[]) => current.filter((item: any) => item.id !== id));
            void reload();
        } catch (err) {
            const message = getPlannerErrorMessage(err, 'Unable to delete food or drink item.');
            console.warn('Error deleting food or drink item:', message);
            alert(message);
        } finally {
            setDeletingItemId(null);
        }
    }

    return (
        <div className="rounded-2xl sm:rounded-[2.5rem] border border-border bg-white p-5 md:p-10 soft-shadow">
            <div className="mb-6 flex flex-col gap-3 border-b border-border/50 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Food & Drinks Planner</h2>
                    <p className="mt-1 text-xs text-text-secondary sm:text-sm">Plan menu items, drink service, reference photos, suppliers, and custom costs.</p>
                </div>
                <div className="rounded-2xl border border-border bg-neutral/40 px-5 py-3 text-center">
                    <p className="font-mono text-xl font-black text-primary">{currencySymbol}{includedTotal.toLocaleString()}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Added to budget</p>
                </div>
            </div>

            <form onSubmit={addItem} className="mb-8 grid gap-3 rounded-2xl border border-border bg-neutral/30 p-4 lg:grid-cols-3">
                <select value={newItem.item_type} onChange={(e) => setNewItem({ ...newItem, item_type: e.target.value })} className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]">
                    <option value="food">Food</option>
                    <option value="drink">Drink</option>
                    <option value="dessert">Dessert</option>
                    <option value="other">Other</option>
                </select>
                <input required value={newItem.item_name} onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })} placeholder="Item name" className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]" />
                <input value={newItem.serving_category} onChange={(e) => setNewItem({ ...newItem, serving_category: e.target.value })} placeholder="Course / serving category" className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]" />
                <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-text-secondary">{currencySymbol}</span>
                    <input type="number" inputMode="decimal" value={newItem.estimated_cost} onChange={(e) => setNewItem({ ...newItem, estimated_cost: e.target.value })} placeholder="Cost" className="icon-field-left-compact w-full rounded-xl border border-border bg-white py-3 pl-8 pr-4 text-sm outline-none min-h-[44px]" />
                </div>
                <select value={newItem.planner_vendor_id} onChange={(e) => setNewItem({ ...newItem, planner_vendor_id: e.target.value })} className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]">
                    <option value="">No catering supplier / custom</option>
                    {cateringVendors.map((vendor: any) => <option key={vendor.id} value={vendor.id}>{vendor.name} - {vendor.role}</option>)}
                </select>
                <input value={newItem.custom_supplier_name} onChange={(e) => setNewItem({ ...newItem, custom_supplier_name: e.target.value })} placeholder="Custom supplier" className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]" />
                <label className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-white px-4 py-3 text-sm font-bold text-primary">
                    {uploadingReference ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                    {uploadingReference ? 'Uploading...' : newItem.reference_image_url ? 'Photo selected' : 'Upload from gallery'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && void uploadReference(e.target.files[0])} />
                </label>
                <div className="flex min-h-[44px] items-center rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-secondary">
                    {newItem.reference_image_url ? 'Reference photo uploaded' : 'No photo uploaded'}
                </div>
                <input value={newItem.notes} onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })} placeholder="Notes" className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]" />
                <button disabled={publishing} className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-50 min-h-[44px]">{publishing ? 'Adding...' : 'Add Food / Drink'}</button>
            </form>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {foodDrinks.length === 0 ? (
                    <div className="col-span-full py-12 text-center font-serif text-sm italic text-text-secondary">No food or drink items yet.</div>
                ) : foodDrinks.map((item: any) => {
                    const linkedVendor = vendors.find((vendor: any) => vendor.id === item.planner_vendor_id);
                    return (
                        <div key={item.id} className="overflow-hidden rounded-2xl border border-border bg-white soft-shadow">
                            <div className="aspect-[4/3] bg-neutral/40">
                                {item.reference_image_url ? <img src={item.reference_image_url} alt={item.item_name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-text-secondary/30"><Utensils className="h-10 w-10" /></div>}
                            </div>
                            <div className="p-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary">{item.item_type} {item.serving_category ? `- ${item.serving_category}` : ''}</p>
                                <h3 className="mt-1 font-serif text-lg font-bold text-foreground">{item.item_name}</h3>
                                <p className="mt-1 text-xs text-text-secondary">{linkedVendor ? `Supplier: ${linkedVendor.name}` : item.custom_supplier_name ? `Custom: ${item.custom_supplier_name}` : 'No supplier linked'}</p>
                                <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                                    <div>
                                        <p className="font-mono font-bold text-primary">{currencySymbol}{Number(item.estimated_cost || 0).toLocaleString()}</p>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-text-secondary">{item.planner_vendor_id ? 'Supplier cost excluded' : 'Included in budget'}</p>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={deletingItemId === item.id}
                                        onClick={() => void deleteItem(item.id)}
                                        className="flex min-h-[44px] min-w-[92px] touch-manipulation items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 text-sm font-bold text-red-600 disabled:opacity-50 sm:min-w-[44px] sm:bg-white sm:px-2 sm:hover:bg-red-50"
                                        aria-label="Delete food or drink item"
                                    >
                                        {deletingItemId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        <span className="sm:hidden">{deletingItemId === item.id ? 'Deleting...' : 'Delete'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function HoneymoonPlanner({ weddingId, items = [], setHoneymoonItems, currency, reload }: any) {
    const [publishing, setPublishing] = useState(false);
    const [newItem, setNewItem] = useState({
        category: 'destination',
        title: '',
        destination: '',
        start_date: '',
        end_date: '',
        estimated_cost: '',
        status: 'idea',
        supplier_name: '',
        booking_link: '',
        notes: '',
    });

    const currencySymbol = getCurrencySymbol(currency);
    const categories = ['destination', 'flight', 'hotel', 'activity', 'transport', 'documents', 'packing', 'other'];
    const totalEstimated = items.reduce((sum: number, item: any) => sum + Number(item.estimated_cost || 0), 0);
    const bookedCount = items.filter((item: any) => item.status === 'booked' || item.status === 'paid').length;
    const topDestination = items.find((item: any) => item.destination)?.destination || 'Not selected';

    async function addItem(e: any) {
        e.preventDefault();
        if (!newItem.title.trim() || publishing) return;
        setPublishing(true);
        try {
            const createdHoneymoonItem = await createPlannerItem(weddingId, 'honeymoon', {
                category: newItem.category,
                title: newItem.title.trim(),
                destination: newItem.destination.trim() || null,
                start_date: newItem.start_date || null,
                end_date: newItem.end_date || null,
                estimated_cost: parseFloat(newItem.estimated_cost) || 0,
                status: newItem.status,
                supplier_name: newItem.supplier_name.trim() || null,
                booking_link: newItem.booking_link.trim() || null,
                notes: newItem.notes.trim() || null,
            });
            if (setHoneymoonItems && createdHoneymoonItem) {
                setHoneymoonItems((current: any[]) => [...current, createdHoneymoonItem]);
            }
            setNewItem({ category: newItem.category, title: '', destination: '', start_date: '', end_date: '', estimated_cost: '', status: 'idea', supplier_name: '', booking_link: '', notes: '' });
            void reload();
        } catch (err) {
            const message = getPlannerErrorMessage(err, 'Failed to add honeymoon item.');
            console.error('Error adding honeymoon item:', message);
            alert(`Failed to add honeymoon item: ${message}`);
        } finally {
            setPublishing(false);
        }
    }

    async function updateItem(item: any, patch: Record<string, unknown>) {
        let previousItems: any[] = [];
        if (setHoneymoonItems) {
            setHoneymoonItems((current: any[]) => {
                previousItems = current;
                return current.map((currentItem: any) => currentItem.id === item.id ? { ...currentItem, ...patch } : currentItem);
            });
        }
        try {
            const updatedItem = await updatePlannerItem(weddingId, 'honeymoon', item.id, patch);
            if (setHoneymoonItems && updatedItem) {
                setHoneymoonItems((current: any[]) => current.map((currentItem: any) => currentItem.id === item.id ? { ...currentItem, ...updatedItem } : currentItem));
            }
            void reload();
        } catch (err) {
            if (previousItems.length > 0 && setHoneymoonItems) setHoneymoonItems(previousItems);
            const message = getPlannerErrorMessage(err, 'Unable to update honeymoon item.');
            console.warn('Error updating honeymoon item:', message);
            alert(message);
        }
    }

    async function deleteItem(id: string) {
        if (!confirm('Delete this honeymoon item?')) return;
        try {
            await deletePlannerItem(weddingId, 'honeymoon', id);
            if (setHoneymoonItems) setHoneymoonItems((current: any[]) => current.filter((item: any) => item.id !== id));
            void reload();
        } catch (err) {
            const message = getPlannerErrorMessage(err, 'Unable to delete honeymoon item.');
            console.warn('Error deleting honeymoon item:', message);
            alert(message);
        }
    }

    return (
        <div className="rounded-2xl sm:rounded-[2.5rem] border border-border bg-white p-5 md:p-10 soft-shadow">
            <div className="mb-6 flex flex-col gap-4 border-b border-border/50 pb-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Honeymoon Planner</h2>
                    <p className="mt-1 text-xs text-text-secondary sm:text-sm">Plan destination ideas, bookings, travel documents, activities, and honeymoon budget.</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-neutral/40 px-4 py-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Destination</p>
                        <p className="mt-1 truncate font-serif text-lg font-bold text-foreground">{topDestination}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-neutral/40 px-4 py-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Estimated</p>
                        <p className="mt-1 font-mono text-lg font-black text-primary">{currencySymbol}{totalEstimated.toLocaleString()}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-neutral/40 px-4 py-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Booked</p>
                        <p className="mt-1 font-serif text-lg font-bold text-foreground">{bookedCount}/{items.length}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={addItem} className="mb-8 grid gap-3 rounded-2xl border border-border bg-neutral/30 p-4 lg:grid-cols-3">
                <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]">
                    {categories.map((category) => <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>)}
                </select>
                <input required value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} placeholder="Plan item, e.g. Resort booking" className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]" />
                <input value={newItem.destination} onChange={(e) => setNewItem({ ...newItem, destination: e.target.value })} placeholder="Destination / city" className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]" />
                <input type="date" value={newItem.start_date} onChange={(e) => setNewItem({ ...newItem, start_date: e.target.value })} className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]" />
                <input type="date" value={newItem.end_date} onChange={(e) => setNewItem({ ...newItem, end_date: e.target.value })} className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]" />
                <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-text-secondary">{currencySymbol}</span>
                    <input type="number" inputMode="decimal" value={newItem.estimated_cost} onChange={(e) => setNewItem({ ...newItem, estimated_cost: e.target.value })} placeholder="Budget / cost" className="icon-field-left-compact w-full rounded-xl border border-border bg-white py-3 pl-8 pr-4 text-sm outline-none min-h-[44px]" />
                </div>
                <select value={newItem.status} onChange={(e) => setNewItem({ ...newItem, status: e.target.value })} className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]">
                    <option value="idea">Idea</option>
                    <option value="researching">Researching</option>
                    <option value="booked">Booked</option>
                    <option value="paid">Paid</option>
                </select>
                <input value={newItem.supplier_name} onChange={(e) => setNewItem({ ...newItem, supplier_name: e.target.value })} placeholder="Airline, hotel, agency, supplier" className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]" />
                <input value={newItem.booking_link} onChange={(e) => setNewItem({ ...newItem, booking_link: e.target.value })} placeholder="Booking link" className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px]" />
                <input value={newItem.notes} onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })} placeholder="Notes, inclusions, reminders" className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none min-h-[44px] lg:col-span-2" />
                <button disabled={publishing} className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-50 min-h-[44px]">{publishing ? 'Adding...' : 'Add Honeymoon Item'}</button>
            </form>

            <div className="grid gap-4 lg:grid-cols-2">
                {items.length === 0 ? (
                    <div className="lg:col-span-2 py-12 text-center font-serif text-sm italic text-text-secondary">No honeymoon plans yet.</div>
                ) : items.map((item: any) => (
                    <div key={item.id} className="rounded-2xl border border-border bg-white p-4 soft-shadow">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary">{item.category}</p>
                                <h3 className="mt-1 font-serif text-lg font-bold text-foreground">{item.title}</h3>
                                <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary"><MapPin className="h-3.5 w-3.5" /> {item.destination || 'Destination not set'}</p>
                            </div>
                            <button onClick={() => void deleteItem(item.id)} className="flex h-10 w-10 flex-none items-center justify-center rounded-xl text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-xl bg-neutral/40 p-3">
                                <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Dates</p>
                                <p className="mt-1 text-xs font-bold text-foreground">{[item.start_date, item.end_date].filter(Boolean).join(' to ') || 'Not set'}</p>
                            </div>
                            <div className="rounded-xl bg-neutral/40 p-3">
                                <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Cost</p>
                                <p className="mt-1 font-mono text-sm font-black text-primary">{currencySymbol}{Number(item.estimated_cost || 0).toLocaleString()}</p>
                            </div>
                            <div className="rounded-xl bg-neutral/40 p-3">
                                <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Status</p>
                                <select value={item.status || 'idea'} onChange={(e) => void updateItem(item, { status: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-xs font-bold outline-none">
                                    <option value="idea">Idea</option>
                                    <option value="researching">Researching</option>
                                    <option value="booked">Booked</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>
                        </div>
                        {(item.supplier_name || item.booking_link || item.notes) && (
                            <div className="mt-4 border-t border-border pt-3 text-xs text-text-secondary">
                                {item.supplier_name && <p><span className="font-bold text-foreground">Supplier:</span> {item.supplier_name}</p>}
                                {item.booking_link && <a href={item.booking_link} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 font-bold text-primary"><LinkIcon className="h-3.5 w-3.5" /> Booking link</a>}
                                {item.notes && <p className="mt-1 italic">{item.notes}</p>}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function PlannerVendors({ weddingId, initialVendors, setVendors, currency, reload, updateVendorStatus }: any) {
    const [publishing, setPublishing] = useState(false);
    const [newItem, setNewItem] = useState({ 
        role: 'Photographer', 
        name: '', 
        contact: '',
        amount: '',
        payment_status: 'not paid',
        payment_method: 'cash'
    });
    
    const currencySymbol = getCurrencySymbol(currency);
    const [roles, setRoles] = useState(['Photographer', 'Videographer', 'Florist', 'Caterer', 'Coordinator', 'DJ/Band', 'Hair & Makeup', 'Supplier']);
    
    const handleAddCustomRole = () => {
        const customRole = prompt("Enter custom vendor role (e.g. Ring Maker):");
        if (customRole && !roles.includes(customRole)) {
            setRoles([...roles, customRole]);
            setNewItem({...newItem, role: customRole});
        }
    };

    async function addItem(e: any) {
        e.preventDefault();
        if (!newItem.name || publishing) return;
        setPublishing(true);
        try {
            const createdVendor = await createPlannerItem(weddingId, 'vendor', {
                role: newItem.role, 
                name: newItem.name,
                phone: newItem.contact,
                amount: parseFloat(newItem.amount) || 0,
                payment_status: newItem.payment_status,
                payment_method: newItem.payment_method
            });
            if (setVendors && createdVendor) {
                setVendors((current: any[]) => [...current, createdVendor]);
            }
            setNewItem({ 
                role: newItem.role, 
                name: '', 
                contact: '', 
                amount: '', 
                payment_status: 'not paid', 
                payment_method: 'cash' 
            });
            void reload();
        } catch (err) {
            const message = getPlannerErrorMessage(err, 'Failed to add supplier/vendor.');
            console.error("Error adding vendor:", message);
            alert(`Failed to add supplier/vendor: ${message}`);
        } finally {
            setPublishing(false);
        }
    }

    // updateVendorStatus moved to parent

    async function deleteItem(id: string) {
        if (!confirm("Delete this supplier/vendor?")) return;
        try {
            await deletePlannerItem(weddingId, 'vendor', id);
            if (setVendors) setVendors((current: any[]) => current.filter((vendor: any) => vendor.id !== id));
            void reload();
        } catch (err) {
            const message = getPlannerErrorMessage(err, 'Unable to delete supplier/vendor.');
            console.warn('Error deleting vendor:', message);
            alert(message);
        }
    }

    return (
        <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-8 md:p-10 soft-shadow border border-border overflow-x-hidden">
            <div className="mb-5 flex flex-col gap-4 border-b border-border/50 pb-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:pb-6">
                <div>
                    <h2 className="mb-1 text-xl font-serif font-bold text-foreground sm:text-2xl md:text-3xl">Suppliers/Vendors</h2>
                    <p className="text-xs text-text-secondary sm:text-sm">Keep booked suppliers and vendor contacts organized.</p>
                </div>
                <Link href="/suppliers" className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary hover:text-white">
                    <Search className="h-4 w-4" />
                    Find Suppliers
                </Link>
            </div>

            <form onSubmit={addItem} className="space-y-4 sm:space-y-5 mb-6 sm:mb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div className="min-w-0">
                        <label className="block text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1 ml-1">Supplier/Vendor Type</label>
                        <select 
                            value={newItem.role} 
                            onChange={e => e.target.value === 'CUSTOM' ? handleAddCustomRole() : setNewItem({...newItem, role: e.target.value})}
                            className="w-full bg-neutral border border-border rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 outline-none focus:ring-primary/20 text-xs sm:text-sm min-h-[44px]"
                        >
                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                            <option value="CUSTOM">+ Add Custom</option>
                        </select>
                    </div>
                    <div className="min-w-0">
                        <label className="block text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1 ml-1">Business Name</label>
                        <input 
                            required
                            type="text" 
                            placeholder="Name" 
                            value={newItem.name}
                            onChange={e => setNewItem({...newItem, name: e.target.value})}
                            className="w-full bg-neutral border border-border rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 outline-none focus:ring-primary/20 text-xs sm:text-sm min-h-[44px]"
                        />
                    </div>
                    <div className="min-w-0">
                        <label className="block text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1 ml-1">Contact</label>
                        <input 
                            type="text" 
                            placeholder="Email or Phone" 
                            value={newItem.contact}
                            onChange={e => setNewItem({...newItem, contact: e.target.value})}
                            className="w-full bg-neutral border border-border rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 outline-none focus:ring-primary/20 text-xs sm:text-sm min-h-[44px]"
                        />
                    </div>
                    <div className="min-w-0">
                        <label className="block text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1 ml-1">Amount ({currencySymbol})</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm font-bold pointer-events-none">{currencySymbol}</span>
                            <input 
                                type="number" 
                                inputMode="decimal"
                                placeholder="0" 
                                value={newItem.amount}
                                onChange={e => setNewItem({...newItem, amount: e.target.value})}
                                className="icon-field-left-compact w-full min-w-0 bg-neutral border border-border rounded-lg sm:rounded-xl pl-8 pr-3 py-2.5 sm:py-3 outline-none focus:ring-primary/20 font-mono text-base tabular-nums min-h-[44px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                        </div>
                    </div>
                    <div className="min-w-0">
                        <label className="block text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1 ml-1">Status</label>
                        <VendorPaymentStatusSelect
                            value={newItem.payment_status}
                            onChange={(status) => setNewItem({...newItem, payment_status: status})}
                        />
                    </div>
                    <div className="min-w-0">
                        <label className="block text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1 ml-1">Method</label>
                        <select 
                            value={newItem.payment_method}
                            onChange={e => setNewItem({...newItem, payment_method: e.target.value})}
                            className="w-full bg-neutral border border-border rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 outline-none focus:ring-primary/20 text-xs sm:text-sm capitalize min-h-[44px]"
                        >
                            <option value="cash">Cash</option>
                            <option value="g-cash">G-Cash</option>
                            <option value="bank transfer">Bank Transfer</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
                <button type="submit" disabled={publishing} className="w-full bg-primary text-white rounded-xl sm:rounded-2xl px-4 py-3 sm:py-4 font-bold disabled:opacity-50 shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all text-sm sm:text-base min-h-[44px]">
                    {publishing ? 'Adding...' : 'Add Supplier/Vendor'}
                </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
                {initialVendors.length === 0 ? (
                    <div className="col-span-full text-center py-8 sm:py-12 opacity-50 font-serif italic text-sm sm:text-base">No suppliers or vendors booked yet. Add one above or find one from the directory.</div>
                ) : (
                    initialVendors.map((vendor: any) => (
                        <div key={vendor.id} className="border border-border rounded-xl sm:rounded-2xl p-4 sm:p-5 group relative bg-white hover:border-primary/30 transition-all soft-shadow overflow-hidden">
                            <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2 pr-10">
                                <div className="min-w-0 flex-1">
                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary block mb-0.5 truncate">{vendor.role}</span>
                                    <h3 className="font-serif text-base sm:text-lg font-bold text-foreground truncate">{vendor.name}</h3>
                                    {vendor.directory_supplier_id && (
                                        <p className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] text-emerald-600">From supplier directory</p>
                                    )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="font-mono font-bold text-sm sm:text-base text-primary">{currencySymbol}{Number(vendor.amount || 0).toLocaleString()}</p>
                                    <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-text-secondary/50 font-bold">{vendor.payment_method}</p>
                                </div>
                            </div>
                            
                            <p className="text-xs sm:text-sm font-mono text-text-secondary mb-3 sm:mb-4 truncate">{vendor.phone || vendor.email || 'No contact'}</p>
                            
                            <div className="flex items-center gap-2 pt-2 sm:pt-3 border-t border-border/50">
                                <VendorPaymentStatusSelect
                                    value={vendor.payment_status}
                                    onChange={(status) => updateVendorStatus(vendor.id, status)}
                                    compact
                                    className="min-w-0 flex-1"
                                />
                            </div>

                            <button type="button" onClick={() => deleteItem(vendor.id)} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-red-100 bg-white text-red-500 shadow-sm transition-colors hover:bg-red-50" aria-label="Delete supplier or vendor">
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
