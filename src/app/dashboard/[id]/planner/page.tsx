'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Circle, Plus, Trash2, ListTodo, Wallet, Users, LayoutDashboard, ArrowLeft, Loader2, PieChart as PieChartIcon, TrendingDown, DollarSign, Layout, Camera, Mail, LockKeyhole, Sparkles, Search, Home, ChevronDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import SeatingChartBuilder from '@/components/dashboard/SeatingChartBuilder';
import PhotoSharingManager from '@/components/dashboard/PhotoSharingManager';
import ThankYouNoteManager from '@/components/dashboard/ThankYouNoteManager';
import UpgradeButton from '@/components/UpgradeButton';
import { getClientAccountProfile, getRoleAwareRedirect } from '@/lib/account';

const PLANNER_TABS = ['checklist', 'budget', 'vendors', 'seating', 'photos', 'thanks'] as const;
type PlannerTab = typeof PLANNER_TABS[number];
type VendorPaymentStatus = 'not paid' | 'pending' | 'paid';

const VENDOR_PAYMENT_STATUS_OPTIONS: { value: VendorPaymentStatus; label: string }[] = [
    { value: 'not paid', label: 'Not Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
];

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
                className={`w-full appearance-none rounded-xl border pr-9 font-sans font-extrabold uppercase tracking-[0.14em] outline-none transition-all duration-200 hover:-translate-y-px hover:shadow-md focus:ring-4 ${
                    compact ? 'min-h-[40px] px-3 py-2 text-[9px] sm:text-[10px]' : 'min-h-[44px] px-3.5 py-2.5 text-[10px] sm:text-xs'
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
    const [confirmedGuests, setConfirmedGuests] = useState<number>(0);

    useEffect(() => {
        const requestedTab = searchParams?.get('tab');
        if (requestedTab && PLANNER_TABS.includes(requestedTab as PlannerTab)) {
            setActiveTab(requestedTab as PlannerTab);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (!user) return;

        // Wait for admin check to complete before loading planner data
        if (!adminChecked) return;

        const guardAndLoad = async () => {
            setCheckingRole(true);
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;

            if (!token) {
                router.push('/login');
                return;
            }

            try {
                if (!isAdmin) {
                    const accountProfile = await getClientAccountProfile(token);
                    if (accountProfile?.account_type !== 'couple') {
                        router.replace(getRoleAwareRedirect(accountProfile?.account_type, `/dashboard/${weddingId}/planner`));
                        return;
                    }
                }

                setCheckingRole(false);
                await loadPlannerData();
            } catch (err) {
                console.error('Account role check failed:', err);
                router.replace(getRoleAwareRedirect(null, `/dashboard/${weddingId}/planner`));
            }
        };

        void guardAndLoad();
    }, [weddingId, user, authLoading, isAdmin, adminChecked, router]);

    const loadPlannerData = async () => {
        setLoading(true);
        setPlannerError('');
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;

            if (!token) {
                setAccessRole('denied');
                setPlannerError('Your login session was not available. Please sign out and sign in again.');
                return;
            }

            const response = await fetch(`/api/planner/load?weddingId=${encodeURIComponent(weddingId)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();

            setAccessRole(data.accessRole || 'denied');
            setWedding(data.wedding || null);

            if (!response.ok) {
                setPlannerError(data.error || 'Unable to verify planner access.');
            }

            if (data.accessRole !== 'owner') return;

            if (isAdmin) {
                setAccessDebug(`Admin override - isAdmin=${isAdmin}, userEmail=${user?.email}`);
            }

            setTasks(data.tasks || []);
            setBudgets(data.budgets || []);
            setVendors(data.vendors || []);
            setConfirmedGuests(data.confirmedGuests || 0);
        } catch (err) {
            console.error("Error loading planner data:", err);
            setPlannerError(err instanceof Error ? err.message : 'Unable to verify planner access.');
            setAccessRole('denied');
        } finally {
            setLoading(false);
        }
    };

    async function updateVendorStatus(id: string, status: string) {
        try {
            const { error } = await supabase.from('planner_vendors').update({ payment_status: status }).eq('id', id);
            if (error) throw error;
            await loadPlannerData();
        } catch (err: any) {
            alert("Failed to update vendor: " + err.message);
        }
    }

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

     if (!isAdmin && !wedding?.is_premium) {
         return (
             <div className="min-h-screen bg-background px-4 py-10 sm:px-6">
                 <div className="mx-auto max-w-3xl">
                     <div className="flex justify-between items-center mb-6">
                         <Link href={`/dashboard/${weddingId}`} className="inline-flex items-center gap-2 text-sm font-bold text-primary">
                             <ArrowLeft className="h-4 w-4" />
                             Back to dashboard
                         </Link>
                         <Link href="/" className="inline-flex items-center gap-1 text-sm font-bold text-primary" aria-label="Home">
                             <Home className="h-4 w-4" />
                             <span className="hidden sm:inline">Home</span>
                         </Link>
                     </div>

                    <div className="overflow-hidden rounded-[2rem] border border-primary/15 bg-white shadow-2xl shadow-primary/10 sm:rounded-[2.5rem]">
                        <div className="bg-gradient-to-br from-primary/12 via-secondary/10 to-white p-6 text-center sm:p-10">
                            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary shadow-xl shadow-primary/10">
                                <LockKeyhole className="h-7 w-7" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">Planner Pro</p>
                            <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-foreground sm:text-5xl">
                                Unlock the complete wedding planner.
                            </h1>
                            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-text-secondary sm:text-base">
                                Your wedding website, templates, RSVP tools, and builder stay free. Planner Pro is a one-time upgrade for the deeper planning workspace.
                            </p>
                        </div>

                        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-8">
                            {[
                                'Seating chart and guest placement',
                                'Budget tracker with vendor spending',
                                'Checklist and task planning',
                                'Suppliers/vendors organizer',
                                'Collaborator access for your partner or planner',
                                'Photo sharing and thank-you tools',
                            ].map((feature) => (
                                <div key={feature} className="flex items-start gap-3 rounded-2xl bg-neutral p-4 text-sm font-semibold text-foreground">
                                    <Sparkles className="mt-0.5 h-4 w-4 flex-none text-primary" />
                                    {feature}
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col items-center gap-3 border-t border-border p-5 text-center sm:p-8">
                            {accessRole === 'owner' ? (
                                <UpgradeButton weddingId={weddingId} className="justify-center" />
                            ) : (
                                <p className="max-w-md text-sm text-text-secondary">
                                    Ask the wedding owner to unlock Planner Pro for this workspace.
                                </p>
                            )}
                            <p className="text-xs text-text-secondary">One-time payment. No subscription.</p>
                        </div>
                    </div>
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
                            <button onClick={() => setActiveTab('checklist')} className={`flex flex-col md:flex-row items-center md:items-center gap-1.5 md:gap-3 px-2 md:px-4 py-3 md:py-3 rounded-xl font-bold transition-all min-h-[44px] ${activeTab === 'checklist' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-text-secondary hover:bg-neutral dark:hover:bg-neutral/50 hover:text-foreground'}`}>
                                <ListTodo className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> <span className="text-[10px] sm:text-xs md:text-sm text-center md:text-left">Checklist</span>
                            </button>
                            <button onClick={() => setActiveTab('budget')} className={`flex flex-col md:flex-row items-center md:items-center gap-1.5 md:gap-3 px-2 md:px-4 py-3 md:py-3 rounded-xl font-bold transition-all min-h-[44px] ${activeTab === 'budget' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-text-secondary hover:bg-neutral dark:hover:bg-neutral/50 hover:text-foreground'}`}>
                                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> <span className="text-[10px] sm:text-xs md:text-sm text-center md:text-left">Budgets</span>
                            </button>
                            <button onClick={() => setActiveTab('vendors')} className={`flex flex-col md:flex-row items-center md:items-center gap-1.5 md:gap-3 px-2 md:px-4 py-3 md:py-3 rounded-xl font-bold transition-all min-h-[44px] ${activeTab === 'vendors' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-text-secondary hover:bg-neutral dark:hover:bg-neutral/50 hover:text-foreground'}`}>
                                <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> <span className="text-[10px] sm:text-xs md:text-sm text-center md:text-left">Suppliers</span>
                            </button>
                            <button onClick={() => setActiveTab('seating')} className={`flex flex-col md:flex-row items-center md:items-center gap-1.5 md:gap-3 px-2 md:px-4 py-3 md:py-3 rounded-xl font-bold transition-all min-h-[44px] ${activeTab === 'seating' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-text-secondary hover:bg-neutral dark:hover:bg-neutral/50 hover:text-foreground'}`}>
                                <Layout className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> <span className="text-[10px] sm:text-xs md:text-sm text-center md:text-left">Seating</span>
                            </button>
                            <button onClick={() => setActiveTab('photos')} className={`flex flex-col md:flex-row items-center md:items-center gap-1.5 md:gap-3 px-2 md:px-4 py-3 md:py-3 rounded-xl font-bold transition-all min-h-[44px] ${activeTab === 'photos' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-text-secondary hover:bg-neutral dark:hover:bg-neutral/50 hover:text-foreground'}`}>
                                <Camera className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> <span className="text-[10px] sm:text-xs md:text-sm text-center md:text-left">Photos</span>
                            </button>
                            <button onClick={() => setActiveTab('thanks')} className={`flex flex-col md:flex-row items-center md:items-center gap-1.5 md:gap-3 px-2 md:px-4 py-3 md:py-3 rounded-xl font-bold transition-all min-h-[44px] ${activeTab === 'thanks' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-text-secondary hover:bg-neutral dark:hover:bg-neutral/50 hover:text-foreground'}`}>
                                <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> <span className="text-[10px] sm:text-xs md:text-sm text-center md:text-left">Thank You</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 overflow-x-hidden">
                    {activeTab === 'checklist' && <PlannerChecklists weddingId={weddingId} initialTasks={tasks} reload={loadPlannerData} />}
                    {activeTab === 'budget' && <PlannerBudgets weddingId={weddingId} initialBudgets={budgets} wedding={wedding} vendors={vendors} reload={loadPlannerData} updateVendorStatus={updateVendorStatus} />}
                    {activeTab === 'vendors' && <PlannerVendors weddingId={weddingId} initialVendors={vendors} currency={wedding?.currency || 'USD'} reload={loadPlannerData} updateVendorStatus={updateVendorStatus} />}
                    {activeTab === 'seating' && <SeatingChartBuilder weddingId={weddingId} />}
                    {activeTab === 'photos' && <PhotoSharingManager weddingId={weddingId} />}
                    {activeTab === 'thanks' && <ThankYouNoteManager weddingId={weddingId} />}
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------
// CHILD COMPONENTS
// ----------------------------------------------------

function PlannerChecklists({ weddingId, initialTasks, reload }: any) {
    const [newTask, setNewTask] = useState("");
    const [publishing, setPublishing] = useState(false);

    async function addTask(e: any) {
        e.preventDefault();
        if (!newTask.trim() || publishing) return;
        setPublishing(true);
        try {
            const { error } = await supabase.from('planner_tasks').insert({ wedding_id: weddingId, title: newTask.trim() });
            if (error) throw error;
            setNewTask("");
            await reload();
        } catch (err) {
            console.error("Error adding task:", err);
            alert("Failed to add task. Please try again.");
        } finally {
            setPublishing(false);
        }
    }

    async function toggleTask(task: any) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        try {
            const { error } = await supabase.from('planner_tasks').update({ status: newStatus }).eq('id', task.id);
            if (error) throw error;
            await reload();
        } catch (err) {
            console.error("Error toggling task:", err);
        }
    }

    async function deleteTask(id: string) {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            const { error } = await supabase.from('planner_tasks').delete().eq('id', id);
            if (error) throw error;
            await reload();
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    }

    const completedCount = initialTasks.filter((t: any) => t.status === 'completed').length;
    const progress = initialTasks.length > 0 ? Math.round((completedCount / initialTasks.length) * 100) : 0;

    return (
        <div className="bg-white dark:bg-white/5 rounded-2xl sm:rounded-[2.5rem] p-5 md:p-12 soft-shadow border border-border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0 mb-6 sm:mb-8 border-b border-border/50 pb-4 sm:pb-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-1 sm:mb-2">To-Do Checklist</h2>
                    <p className="text-xs sm:text-sm text-text-secondary">Keep track of every tiny detail before the big day.</p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-2xl sm:text-3xl font-serif font-bold text-primary mb-1">{progress}%</p>
                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-text-secondary">Completed</p>
                </div>
            </div>

            <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 sm:mb-10">
                <input 
                    type="text" 
                    value={newTask} 
                    onChange={e => setNewTask(e.target.value)} 
                    placeholder="E.g. Book the florist..." 
                    className="flex-1 bg-neutral border border-border rounded-lg sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-4 outline-none focus:ring-2 focus:ring-primary/20 text-xs sm:text-base min-h-[44px]"
                />
                <button type="submit" disabled={publishing || !newTask.trim()} className="bg-primary text-white rounded-lg sm:rounded-2xl px-4 sm:px-6 py-2 sm:py-4 font-bold disabled:opacity-50 text-xs sm:text-base min-h-[44px]">
                    Add
                </button>
            </form>

            <div className="space-y-1 sm:space-y-3">
                {initialTasks.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 opacity-50 font-serif italic text-xs sm:text-base">Your checklist is beautifully empty. Add your first task above!</div>
                ) : (
                    initialTasks.map((task: any) => (
                        <div key={task.id} className="flex items-center justify-between p-2 sm:p-4 rounded-lg sm:rounded-xl hover:bg-neutral dark:hover:bg-neutral/50 transition-colors group gap-2">
                            <div className="flex items-center gap-2 sm:gap-4 flex-1 cursor-pointer min-w-0" onClick={() => toggleTask(task)}>
                                {task.status === 'completed' ? (
                                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 shrink-0" />
                                ) : (
                                    <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-border group-hover:text-primary transition-colors shrink-0" />
                                )}
                                <span className={`text-sm sm:text-lg font-serif truncate ${task.status === 'completed' ? 'text-text-secondary line-through' : 'text-foreground'}`}>
                                    {task.title}
                                </span>
                            </div>
                            <button onClick={() => deleteTask(task.id)} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-500/10 flex-shrink-0 min-h-[44px] min-w-[44px]">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function PlannerBudgets({ weddingId, initialBudgets, wedding, vendors = [], reload, updateVendorStatus }: any) {
    const [publishing, setPublishing] = useState(false);
    const [newItem, setNewItem] = useState({ category: 'Venue', item_name: '', estimated_cost: '' });

    // Local states for inputs to avoid jitter/focus issues
    const [localBudget, setLocalBudget] = useState(wedding?.total_budget || 0);
    const [localCurrency, setLocalCurrency] = useState(wedding?.currency || 'USD');
    const [localGuestLimit, setLocalGuestLimit] = useState(wedding?.guest_limit || 0);

    useEffect(() => {
        if (wedding) {
            setLocalBudget(wedding.total_budget || 0);
            setLocalCurrency(wedding.currency || 'USD');
            setLocalGuestLimit(wedding.guest_limit || 0);
        }
    }, [wedding]);

    // Standard categories plus any custom ones already in the budget
    const defaultCategories = ['Venue', 'Catering', 'Attire', 'Decor', 'Photography', 'Entertainment', 'Other'];
    const [categories, setCategories] = useState(defaultCategories);

    useEffect(() => {
        const customCats = initialBudgets.map((b: any) => b.category).filter((c: string) => !defaultCategories.includes(c));
        const uniqueCats = Array.from(new Set([...defaultCategories, ...customCats]));
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
            const { error } = await supabase.from('planner_budgets').insert({ 
                wedding_id: weddingId, 
                category: newItem.category, 
                item_name: newItem.item_name,
                estimated_cost: parseFloat(newItem.estimated_cost) || 0
            });
            if (error) throw error;
            setNewItem({ category: newItem.category, item_name: '', estimated_cost: '' });
            await reload();
        } catch (err: any) {
            console.error("Error adding budget item:", err);
            alert("Failed to add budget item: " + err.message);
        } finally {
            setPublishing(false);
        }
    }

    async function saveWeddingBudget(field: string, value: any) {
        try {
            console.log(`Saving ${field}:`, value);
            // 1. Update local states immediately for no-lag feel
            if (field === 'total_budget') setLocalBudget(value);
            if (field === 'currency') setLocalCurrency(value);

            // 2. Persist to Supabase
            const { error, data } = await supabase
                .from('weddings')
                .update({ [field]: value })
                .eq('id', weddingId)
                .select();

            if (error) throw error;
            
            // If data is empty, it means RLS blocked the update
            if (!data || data.length === 0) {
                throw new Error("Update blocked by database permissions (RLS). Please run the Permission Fix SQL script.");
            }

            console.log("Save successful:", data);
            await reload(); 
        } catch (err: any) {
            console.error("Error updating wedding budget:", err);
            alert("Failed to update " + field + ": " + err.message);
            // Revert local state on failure by reloading
            await reload(); 
        }
    }

    async function deleteItem(id: string) {
        if (!confirm("Delete this budget item?")) return;
        try {
            const { error } = await supabase.from('planner_budgets').delete().eq('id', id);
            if (error) throw error;
            await reload();
        } catch (err) {
            console.error("Error deleting budget item:", err);
        }
    }

    const totalEst = initialBudgets.reduce((acc: number, item: any) => acc + (parseFloat(item.estimated_cost) || 0), 0);
    const totalSpentFromVendors = vendors
        .filter((v: any) => v.payment_status?.toLowerCase() === 'paid')
        .reduce((acc: number, v: any) => acc + (parseFloat(v.amount) || 0), 0);
    
    // Total "Committed/Spent" is both the estimates you added AND what you already paid vendors
    const totalCommitted = totalEst + totalSpentFromVendors;
    const budgetRemaining = (parseFloat(wedding?.total_budget) || 0) - totalCommitted;
    const usagePercent = wedding?.total_budget > 0 ? Math.min(100, Math.round((totalCommitted / wedding.total_budget) * 100)) : 0;

    // Chart Data
    const chartData = [
        { name: 'Allocated (Budget List)', value: totalEst },
        { name: 'Paid Vendors', value: totalSpentFromVendors },
        { name: 'Remaining', value: Math.max(0, budgetRemaining) }
    ];
    const COLORS = ['#D16C78', '#CBB26A', '#3A2A2D'];

    // Derive symbol from localCurrency for immediate UI feedback
    const currencySymbol = localCurrency === 'USD' ? '$' : localCurrency === 'Yen' ? '¥' : '₱';

    return (
        <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-5 lg:p-6 soft-shadow border border-border overflow-x-hidden">
            <div className="grid gap-3 xl:grid-cols-[1fr_1.6fr] xl:items-end mb-4 border-b border-border/50 pb-4">
                <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-foreground">Budget Tracker</h2>
                    <p className="mt-1 text-xs sm:text-sm text-text-secondary">Budget, estimates, and paid vendors in one compact view.</p>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-border bg-neutral/40 p-2.5 sm:col-span-2 sm:p-3 xl:col-span-1">
                        <p className="text-[9px] uppercase font-black tracking-widest text-text-secondary">Budget</p>
                        <div className="mt-2 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2">
                            <select 
                                value={localCurrency} 
                                onChange={e => {
                                    setLocalCurrency(e.target.value);
                                    saveWeddingBudget('currency', e.target.value);
                                }}
                                className="h-11 w-full rounded-lg border border-border bg-white px-2 text-[11px] font-bold outline-none focus:ring-primary/20"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="Yen">Yen (¥)</option>
                                <option value="Peso">Peso (₱)</option>
                            </select>
                            <div className="relative min-w-0 flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold text-sm pointer-events-none">{currencySymbol}</span>
                                <input 
                                    type="number" 
                                    value={localBudget}
                                    onChange={e => setLocalBudget(parseFloat(e.target.value) || 0)}
                                    onBlur={e => saveWeddingBudget('total_budget', parseFloat(e.target.value) || 0)}
                                    className="h-11 w-full min-w-0 rounded-lg border border-border bg-white pl-8 pr-3 text-right font-mono text-base font-bold tabular-nums text-primary outline-none focus:ring-primary/20"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-border bg-neutral/40 p-2.5 sm:p-3">
                        <p className="text-[9px] uppercase font-black tracking-widest text-text-secondary">Guests</p>
                        <div className="relative mt-2">
                            <Users className="absolute left-2 top-1/2 -translate-y-1/2 text-primary w-4 h-4 pointer-events-none" />
                            <input 
                                type="number" 
                                value={localGuestLimit}
                                onChange={e => {
                                    const val = parseInt(e.target.value) || 0;
                                    setLocalGuestLimit(val);
                                }}
                                onBlur={e => {
                                    const val = parseInt(e.target.value) || 0;
                                    saveWeddingBudget('guest_limit', val);
                                }}
                                className="h-11 w-full rounded-lg border border-border bg-white pl-8 pr-3 text-right font-mono text-base font-bold tabular-nums text-primary outline-none focus:ring-primary/20"
                            />
                        </div>
                    </div>
                    <div className="rounded-xl border border-border bg-neutral/40 p-2.5 sm:p-3">
                        <p className="text-[9px] uppercase font-black tracking-widest text-text-secondary">Spent</p>
                        <p className={`mt-2 break-words text-lg font-mono font-black leading-tight tabular-nums ${totalCommitted > (wedding?.total_budget || 0) ? 'text-red-500' : 'text-primary'}`}>{currencySymbol}{totalCommitted.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-neutral/40 p-2.5 sm:p-3">
                        <p className="text-[9px] uppercase font-black tracking-widest text-text-secondary">Remaining</p>
                        <p className={`mt-2 break-words text-lg font-mono font-black leading-tight tabular-nums ${budgetRemaining < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {currencySymbol}{budgetRemaining.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-3 sm:gap-4 mb-4">
                {/* Visual Usage */}
                <div className="bg-neutral/30 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-border/50 grid gap-3 sm:grid-cols-[170px_1fr] sm:items-center shadow-inner">
                    <div className="h-[150px] sm:h-[170px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={60}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value: any) => [`${currencySymbol}${value.toLocaleString()}`, 'Amount']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
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
                                    <span className="font-mono font-bold text-xs flex-shrink-0">{currencySymbol}{entry.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Info */}
                <div className="bg-white border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 grid gap-2 soft-shadow sm:grid-cols-3 lg:grid-cols-1">
                    <div className="flex items-center gap-3 rounded-xl bg-neutral/40 p-2.5">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 min-h-[44px] min-w-[44px]">
                            <PieChartIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary">Planned Total</p>
                            <p className="text-base sm:text-lg md:text-xl font-mono font-bold">{currencySymbol}{totalEst.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-neutral/40 p-2.5">
                        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 min-h-[44px] min-w-[44px]">
                            <Users className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                            <p className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary">Paid to Vendors</p>
                            <p className="text-base sm:text-lg md:text-xl font-mono font-bold">{currencySymbol}{totalSpentFromVendors.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-neutral/40 p-2.5">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 min-h-[44px] min-w-[44px]">
                            <TrendingDown className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary">Remaining Cash</p>
                            <p className="text-base sm:text-lg md:text-xl font-mono font-bold text-emerald-600">{currencySymbol}{Math.max(0, budgetRemaining).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={addItem} className="mb-4 bg-neutral/30 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-border/50">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="font-serif text-lg font-bold text-foreground">Add Expense</h3>
                    <div className="hidden gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary sm:flex">
                        <span>Planned {currencySymbol}{totalEst.toLocaleString()}</span>
                        <span>Paid {currencySymbol}{totalSpentFromVendors.toLocaleString()}</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1fr_1.3fr_0.9fr_auto] gap-3">
                    <div className="min-w-0">
                        <label className="block text-[9px] uppercase font-black tracking-widest text-text-secondary mb-1 ml-1">Category</label>
                        <select 
                            value={newItem.category} 
                            onChange={e => e.target.value === 'CUSTOM' ? handleAddCustomCategory() : setNewItem({...newItem, category: e.target.value})}
                            className="w-full bg-white border border-border rounded-lg px-3 py-2.5 outline-none focus:ring-primary/20 text-xs sm:text-sm min-h-[44px]"
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
                            className="w-full bg-white border border-border rounded-lg px-3 py-2.5 outline-none focus:ring-primary/20 text-xs sm:text-sm min-h-[44px]"
                        />
                    </div>
                    <div className="min-w-0">
                        <label className="block text-[9px] uppercase font-black tracking-widest text-text-secondary mb-1 ml-1">Est. Cost ({currencySymbol})</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm font-bold pointer-events-none">{currencySymbol}</span>
                            <input 
                                required
                                type="number" 
                                placeholder="0.00" 
                                value={newItem.estimated_cost}
                                onChange={e => setNewItem({...newItem, estimated_cost: e.target.value})}
                                className="w-full min-w-0 bg-white border border-border rounded-lg pl-8 pr-3 py-2.5 outline-none focus:ring-primary/20 font-mono text-base tabular-nums min-h-[44px]"
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={publishing} className="self-end bg-primary text-white rounded-lg px-5 py-2.5 font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all text-sm min-h-[44px]">
                        {publishing ? 'Adding...' : 'Add'}
                    </button>
                </div>
            </form>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {/* Estimates from Budget Table */}
                <div className="space-y-3">
                    <h3 className="text-base sm:text-lg font-serif font-bold text-foreground flex items-center gap-2">
                        <ListTodo className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" /> Budget Estimates
                    </h3>
                    {categories.map(category => {
                        const items = initialBudgets.filter((b: any) => b.category === category);
                        if (items.length === 0) return null;
                        const catTotal = items.reduce((acc: number, item: any) => acc + Number(item.estimated_cost || 0), 0);
                        
                        return (
                            <div key={category} className="border border-border rounded-lg sm:rounded-xl overflow-hidden bg-white">
                                <div className="bg-neutral/30 px-3 sm:px-4 py-2 flex justify-between items-center border-b border-border gap-2">
                                    <h4 className="font-bold text-xs sm:text-sm text-text-secondary uppercase tracking-widest">{category}</h4>
                                    <span className="font-mono font-bold text-xs sm:text-sm whitespace-nowrap">{currencySymbol}{catTotal.toLocaleString()}</span>
                                </div>
                                <div className="divide-y divide-border/30 max-h-[310px] overflow-y-auto">
                                    {items.map((item: any) => (
                                        <div key={item.id} className="px-3 py-2.5 sm:px-4 flex justify-between items-center group hover:bg-neutral/10 gap-2 text-xs sm:text-sm">
                                            <p className="font-serif truncate">{item.item_name}</p>
                                            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                                                <span className="font-mono text-text-secondary text-xs sm:text-sm whitespace-nowrap">{currencySymbol}{Number(item.estimated_cost).toLocaleString()}</span>
                                                <button onClick={() => deleteItem(item.id)} className="text-red-400 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity min-h-[36px] min-w-[36px] flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))}
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
                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <table className="w-full text-left border-collapse text-xs sm:text-base px-4 sm:px-0">
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
                                            <td className="px-3 sm:px-4 py-2">
                                                <p className="font-bold text-foreground text-xs sm:text-base line-clamp-1">{vendor.name}</p>
                                                <p className="text-[7px] sm:text-[10px] uppercase tracking-widest text-primary font-black opacity-60">{vendor.role}</p>
                                            </td>
                                            <td className="px-3 sm:px-4 py-2 text-right font-mono font-bold text-xs sm:text-sm">
                                                {currencySymbol}{Number(vendor.amount || 0).toLocaleString()}
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

function PlannerVendors({ weddingId, initialVendors, currency, reload, updateVendorStatus }: any) {
    const [publishing, setPublishing] = useState(false);
    const [newItem, setNewItem] = useState({ 
        role: 'Photographer', 
        name: '', 
        contact: '',
        amount: '',
        payment_status: 'not paid',
        payment_method: 'cash'
    });
    
    const currencySymbol = currency === 'USD' ? '$' : currency === 'JPY' ? '¥' : '₱';
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
            const { error } = await supabase.from('planner_vendors').insert({ 
                wedding_id: weddingId, 
                role: newItem.role, 
                name: newItem.name,
                phone: newItem.contact,
                amount: parseFloat(newItem.amount) || 0,
                payment_status: newItem.payment_status,
                payment_method: newItem.payment_method
            });
            if (error) throw error;
            setNewItem({ 
                role: newItem.role, 
                name: '', 
                contact: '', 
                amount: '', 
                payment_status: 'not paid', 
                payment_method: 'cash' 
            });
            await reload();
        } catch (err) {
            console.error("Error adding vendor:", err);
        } finally {
            setPublishing(false);
        }
    }

    // updateVendorStatus moved to parent

    async function deleteItem(id: string) {
        if (!confirm("Delete this supplier/vendor?")) return;
        try {
            const { error } = await supabase.from('planner_vendors').delete().eq('id', id);
            if (error) throw error;
            await reload();
        } catch (err) {
            console.error("Error deleting vendor:", err);
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
                                placeholder="0.00" 
                                value={newItem.amount}
                                onChange={e => setNewItem({...newItem, amount: e.target.value})}
                                className="w-full min-w-0 bg-neutral border border-border rounded-lg sm:rounded-xl pl-8 pr-3 py-2.5 sm:py-3 outline-none focus:ring-primary/20 font-mono text-base tabular-nums min-h-[44px]"
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
                            <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
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

                            <button onClick={() => deleteItem(vendor.id)} className="absolute -top-1.5 -right-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 border border-border shadow-sm">
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
