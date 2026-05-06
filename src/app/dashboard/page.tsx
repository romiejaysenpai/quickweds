'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Heart, Plus, Calendar, MapPin, ArrowRight, Loader2, Copy, CheckCheck, ExternalLink, Pencil, Trash2, Settings, LogOut, Users, BookOpen, Menu, X, Sparkles, LifeBuoy, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import UpgradeButton from '@/components/UpgradeButton';
import { acceptWeddingInvite, listSharedWeddings } from '@/lib/wedding-features';
import { getClientAccountProfile, getRoleAwareRedirect } from '@/lib/account';
import { copyToClipboard } from '@/lib/client-clipboard';
import NotificationBell from '@/components/dashboard/NotificationBell';

const WELCOME_CHARACTER_URL = 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/icons/qucky%20welcv0ome.png';

async function copyText(text: string) {
    await copyToClipboard(text);
}

function getFirstName(user: any) {
    const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
    const firstName = fullName.trim().split(/\s+/)[0];
    return firstName || 'there';
}

function DashboardWelcomeHero({
    user,
    weddings,
}: {
    user: any;
    weddings: any[];
}) {
    const hasWeddings = weddings.length > 0;
    const rsvpCount = weddings.reduce((total, wedding) => total + (wedding.rsvps?.length || 0), 0);
    const latestWedding = weddings[0];
    const firstName = getFirstName(user);
    const weddingLabel = `${weddings.length} wedding${weddings.length === 1 ? '' : 's'}`;
    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
    const todayLabel = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    }).format(new Date()).toUpperCase();

    const focusItems = hasWeddings
        ? [
            { label: 'Live sites', value: weddings.length.toString(), icon: Heart },
            { label: 'Guest replies', value: rsvpCount.toString(), icon: Users },
            { label: 'Quick action', value: 'Plan', icon: Calendar },
        ]
        : [
            { label: 'Start', value: 'Site', icon: Heart },
            { label: 'Add', value: 'Details', icon: Calendar },
            { label: 'Share', value: 'RSVPs', icon: Users },
        ];

    const message = hasWeddings
        ? `Your ${weddingLabel} and ${rsvpCount} RSVP${rsvpCount === 1 ? '' : 's'} are ready. Check replies, open planner, or share your guest link.`
        : 'Start your wedding website today. Choose a template, add your details, and publish your guest link when you are ready.';

    return (
        <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative isolate mb-8 overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-2xl shadow-primary/10 sm:mb-12 sm:rounded-[2.25rem]"
        >
            <div className="p-4 sm:p-7 lg:p-9">
                <div className="relative z-[80] flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="inline-flex rounded-full bg-primary/5 px-3 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-primary/70 ring-1 ring-primary/10 sm:text-[10px]">
                            {todayLabel}
                        </p>
                        <h1 className="mt-3 max-w-3xl font-serif text-[2rem] font-black leading-[1.05] text-foreground sm:text-4xl lg:text-5xl">
                            {greeting}, <span className="text-primary">{firstName}</span><span className="text-accent">.</span>
                        </h1>
                    </div>

                    <div className="hidden shrink-0 items-center gap-3 sm:flex">
                        <Link href={hasWeddings && latestWedding ? `/dashboard/${latestWedding.id}/planner` : '/builder'} title={hasWeddings ? 'Open planner' : 'Open builder'} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral text-primary shadow-lg shadow-primary/10 transition hover:-translate-y-0.5 hover:bg-primary hover:text-white">
                            <Calendar className="h-5 w-5" />
                        </Link>
                        <Link href={hasWeddings && latestWedding ? `/dashboard/${latestWedding.id}` : '/user-guide'} title={hasWeddings ? 'Open workspace' : 'Open guide'} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral text-primary shadow-lg shadow-primary/10 transition hover:-translate-y-0.5 hover:bg-primary hover:text-white">
                            <Users className="h-5 w-5" />
                        </Link>
                        <Link href={hasWeddings && latestWedding ? `/builder?edit=${latestWedding.id}` : '/builder'} title="Customize website" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral text-primary shadow-lg shadow-primary/10 transition hover:-translate-y-0.5 hover:bg-primary hover:text-white">
                            <Settings className="h-5 w-5" />
                        </Link>
                    </div>
                </div>

                <div className="relative left-1/2 mt-5 h-[128px] w-screen max-w-[calc(100%+2rem)] -translate-x-1/2 overflow-visible sm:-mx-7 sm:left-auto sm:w-auto sm:max-w-none sm:translate-x-0 sm:mt-8 sm:h-[300px] lg:-mx-9 lg:h-[340px]">
                    <div className="absolute inset-0 bg-primary" />
                    <div
                        className="absolute inset-x-[-32%] top-[-58px] z-10 h-[112px] bg-white sm:inset-x-[-24%] sm:top-[-92px] sm:h-[168px]"
                        style={{ borderRadius: '0 0 50% 50% / 0 0 74% 74%' }}
                    />

                    <img
                        src={WELCOME_CHARACTER_URL}
                        alt="QuickWeds welcome character"
                        className="absolute bottom-0 left-[-14px] z-[60] h-[152px] w-auto object-contain drop-shadow-2xl transition duration-500 hover:-translate-y-2 hover:scale-[1.03] sm:left-[-6px] sm:h-[300px] lg:left-4 lg:h-[360px]"
                    />

                    <div className="absolute left-[52%] right-3 top-[-6px] z-50 rounded-[1.2rem] bg-white px-3 py-2 pr-4 shadow-[0_18px_50px_rgba(122,90,97,0.18)] ring-1 ring-primary/10 sm:left-[50%] sm:right-2 sm:top-8 sm:rounded-[1.75rem] sm:px-6 sm:py-5 sm:pr-7 lg:left-[43%] lg:right-6 lg:max-w-2xl">
                        <span className="absolute left-[-13px] top-1/2 h-0 w-0 -translate-y-1/2 border-y-[12px] border-r-[14px] border-y-transparent border-r-white" />
                        <p className="text-[12px] font-black text-primary sm:text-base">QuickWeds</p>
                        <p className="mt-1 text-[11px] font-semibold leading-[1.45] text-text-secondary sm:mt-2 sm:text-base sm:leading-7">{message}</p>
                    </div>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {focusItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.label} className="group rounded-xl border border-border bg-white p-2 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 sm:rounded-2xl sm:p-3">
                                    <div className="mb-1.5 flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white sm:h-8 sm:w-8 sm:rounded-xl">
                                        <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </div>
                                    <p className="text-[7px] font-black uppercase leading-tight tracking-[0.12em] text-text-secondary/60 sm:text-[9px]">{item.label}</p>
                                    <p className="mt-0.5 font-serif text-base font-bold leading-none text-foreground sm:text-xl">{item.value}</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                        <Link href={hasWeddings && latestWedding ? `/dashboard/${latestWedding.id}` : '/builder'} className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-xl shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-hover">
                            {hasWeddings ? 'Continue Workspace' : 'Create Your Free Site'} <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href={hasWeddings && latestWedding ? `/dashboard/${latestWedding.id}/planner` : '/user-guide'} className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl border border-border bg-white px-6 py-3 text-sm font-bold text-primary transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5">
                            {hasWeddings ? <Calendar className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                            {hasWeddings ? 'Open Planner' : 'View Guide'}
                        </Link>

                    </div>
                </div>
            </div>
        </motion.section>
    );
}

function CopyLinkButton({ id }: { id: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = useCallback(() => {
        const url = `${window.location.origin}/w/${id}`;
        copyText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }).catch(() => {
            // no-op: keep button responsive even on restricted contexts
        });
    }, [id]);

    return (
        <button
            onClick={handleCopy}
            title="Copy guest link"
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl border border-border flex items-center justify-center text-text-secondary hover:bg-primary hover:text-white hover:border-primary transition-all flex-shrink-0"
        >
            <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                    <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <CheckCheck className="w-4 h-4 text-inherit" />
                    </motion.span>
                ) : (
                    <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Copy className="w-4 h-4 text-inherit" />
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    );
}

function StatusBadge({ wedding }: { wedding: any }) {
    const now = new Date();
    const weddingDate = new Date(wedding.wedding_date);
    const rsvpDeadline = new Date(wedding.rsvp_deadline);

    let label = '';
    let colorClass = '';

    if (wedding.is_thank_you_mode) {
        label = 'Thank You';
        colorClass = 'bg-accent/20 text-accent border-accent/30';
    } else if (weddingDate < now) {
        label = 'Completed';
        colorClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    } else if (rsvpDeadline < now) {
        label = 'RSVP Closed';
        colorClass = 'bg-neutral text-text-secondary border-border';
    } else {
        label = 'Live';
        colorClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${colorClass}`}>
            {label === 'Live' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
            {label}
        </span>
    );
}

function DeleteButton({ weddingId, coupleName, onDeleted }: { weddingId: string; coupleName: string; onDeleted: () => void }) {
    const [confirming, setConfirming] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const { error } = await supabase
                .from('weddings')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', weddingId);
            if (!error) onDeleted();
        } catch (e) {
            console.error(e);
        } finally {
            setDeleting(false);
            setConfirming(false);
        }
    };

    if (confirming) {
        return (
            <div className="flex items-center gap-2 bg-error-bg border border-error-text/20 rounded-lg px-3 py-2">
                <span className="text-xs text-error-text font-bold flex-1">Delete wedding?</span>
                <button onClick={handleDelete} disabled={deleting} className="text-xs text-error-text font-black hover:underline disabled:opacity-50">
                    {deleting ? '...' : 'Yes'}
                </button>
                <button onClick={() => setConfirming(false)} className="text-xs text-text-secondary hover:text-foreground font-bold">
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setConfirming(true)}
            title="Delete wedding"
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl border border-border flex items-center justify-center text-text-secondary hover:bg-error-bg hover:text-error-text hover:border-error-text/30 transition-all flex-shrink-0"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    );
}

export default function DashboardRedirect() {
    const { user, isAdmin, adminChecked, loading, logout } = useAuth();
    const router = useRouter();
    const [weddings, setWeddings] = useState<any[]>([]);
    const [sharedWeddings, setSharedWeddings] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [checkingRole, setCheckingRole] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const fetchWeddings = useCallback(async () => {
        if (!user) {
            setFetching(false);
            return;
        }
        setFetching(true);
        try {
            const { data, error } = await supabase
                .from('weddings')
                .select('*, rsvps(id)')
                .eq('user_id', user.id)
                .is('deleted_at', null)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setWeddings(data || []);

            const shared = await listSharedWeddings(user.email);
            setSharedWeddings(shared);
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setFetching(false);
        }
    }, [user]);


    const handleLogout = async () => {
        setIsLoggingOut(true);
        await logout();
        router.replace('/');
    };

    useEffect(() => {
        if (!loading && !user && !isLoggingOut) {
            setCheckingRole(false);
            setFetching(false);
            router.push('/login');
            return;
        }
        if (!user) return;
        if (!adminChecked) return;

        const guardAndFetch = async () => {
            setCheckingRole(true);
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;

            if (!token) {
                setCheckingRole(false);
                setFetching(false);
                router.push('/login');
                return;
            }

            try {
                if (isAdmin) {
                    setCheckingRole(false);
                    await fetchWeddings();
                    return;
                }

                try {
                    const profile = await getClientAccountProfile(token);
                    if (profile?.account_type === 'supplier') {
                        setCheckingRole(false);
                        setFetching(false);
                        router.replace(getRoleAwareRedirect(profile.account_type, '/dashboard'));
                        return;
                    }
                } catch (profileErr) {
                    // Gracefully degrade — if account profile table is missing or API fails,
                    // treat user as a regular couple user and continue loading dashboard.
                    console.warn('Account profile check skipped (table may not exist):', profileErr);
                }

                setCheckingRole(false);
                await fetchWeddings();
            } catch (err) {
                console.error('Dashboard load failed:', err);
                setCheckingRole(false);
                setFetching(false);
            }
        };

        void guardAndFetch();
    }, [user, loading, adminChecked, isAdmin, router, fetchWeddings, isLoggingOut]);



    if (loading || checkingRole || (fetching && weddings.length === 0)) {
        return (
            <div className="mobile-safe-screen flex flex-col items-center justify-center bg-background gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-text-secondary font-serif italic text-sm">Loading your weddings...</p>
            </div>
        );
    }


    return (
        <div className="mobile-safe-screen bg-background pb-16 sm:pb-20 mobile-safe-bottom">
            {/* Top nav */}
            <div className="sticky top-0 z-50 border-b border-border bg-white/85 px-3 py-3 backdrop-blur-md dark:bg-neutral-900/90 sm:p-4">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-2 sm:px-4">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex min-w-[88px] flex-shrink-0 items-center sm:min-w-[104px]" aria-label="QuickWeds">
                            <img src="/logo.png" alt="QuickWeds Logo" className="h-8 w-auto object-contain transition-transform hover:scale-105 sm:h-12" />
                        </Link>
                    </div>

                    <div className="flex min-w-0 flex-1 items-center justify-end gap-2 pl-1 sm:w-auto sm:flex-none sm:pl-0">
                        <Link
                            href="/builder"
                            className="flex min-h-[42px] min-w-[82px] flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover sm:min-h-[44px] sm:min-w-0 sm:rounded-xl sm:px-6 sm:py-2.5 sm:text-sm"
                        >
                            <Plus className="w-4 h-4 flex-shrink-0" />
                            <span className="hidden sm:inline">Create New Wedding</span>
                            <span className="sm:hidden">New</span>
                        </Link>
                        
                        <NotificationBell />

                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg sm:rounded-xl border border-border bg-white text-text-secondary transition hover:border-primary hover:bg-primary/5 hover:text-primary"
                            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Side Burger Menu (Drawer) */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-[100]">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeMobileMenu}
                            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                        />
                        
                        {/* Drawer Panel */}
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute right-0 top-0 h-full w-[280px] sm:w-[320px] bg-white shadow-2xl border-l border-border flex flex-col"
                        >
                            <div className="p-5 flex items-center justify-between border-b border-border bg-neutral/30">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Menu</span>
                                <button onClick={closeMobileMenu} className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center text-text-secondary hover:text-primary transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {[
                                    { label: 'Directory', href: '/suppliers', icon: MapPin },
                                    { label: 'Demo', href: '/demo', icon: PlayCircle },
                                    { label: 'Guide', href: '/user-guide', icon: BookOpen },
                                    { label: 'Planner', href: '/planner', icon: Calendar },
                                    { label: 'Settings', href: '/settings', icon: Settings },
                                    { label: 'Admin Support', href: '/support', icon: LifeBuoy },
                                    { label: 'Wedding Tips', href: '/tips', icon: Sparkles },
                                ].map((item) => (
                                    <Link 
                                        key={item.label}
                                        href={item.href} 
                                        onClick={closeMobileMenu} 
                                        className="flex h-14 items-center justify-between rounded-xl bg-neutral/30 px-4 text-sm font-bold text-text-secondary transition hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20"
                                    >
                                        <span className="flex items-center gap-3">
                                            <item.icon className="w-4 h-4 opacity-50" />
                                            {item.label}
                                        </span>
                                        <ArrowRight className="h-4 w-4 opacity-20" />
                                    </Link>
                                ))}
                            </div>

                            <div className="p-4 border-t border-border bg-neutral/10">
                                <button 
                                    onClick={() => { closeMobileMenu(); handleLogout(); }} 
                                    className="flex h-14 items-center justify-between rounded-xl bg-white px-4 text-sm font-bold text-red-600 transition hover:bg-red-50 border border-border w-full text-left"
                                >
                                    <span className="flex items-center gap-3">
                                        <LogOut className="w-4 h-4 opacity-70" />
                                        Logout
                                    </span>
                                    <ArrowRight className="h-4 w-4 opacity-30" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <main className="max-w-6xl mx-auto px-3 sm:px-6 pt-6 sm:pt-12">
                <DashboardWelcomeHero
                    user={user}
                    weddings={weddings}
                />

                {sharedWeddings.length > 0 && (
                    <section className="mb-8 sm:mb-12">
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <h2 className="text-lg sm:text-2xl font-serif font-bold text-foreground">Shared With You</h2>
                            <span className="text-[10px] uppercase tracking-widest font-black text-text-secondary/60">Partner & Coordinator Access</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {sharedWeddings.map((invite) => (
                                <div key={invite.id} className="bg-white rounded-xl sm:rounded-[2rem] border border-border p-5 sm:p-6 soft-shadow space-y-4">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest font-black text-primary/70 mb-2">
                                            {invite.role} · {invite.status}
                                        </p>
                                        <h3 className="text-lg font-serif font-bold text-foreground">
                                            {invite.wedding?.bride_name} & {invite.wedding?.groom_name}
                                        </h3>
                                        <p className="text-sm text-text-secondary">{invite.wedding?.venue_name || 'Wedding workspace'}</p>
                                    </div>
                                    {invite.status === 'pending' ? (
                                        <button
                                            onClick={async () => {
                                                await acceptWeddingInvite(invite.id);
                                                const refreshed = await listSharedWeddings(user?.email);
                                                setSharedWeddings(refreshed);
                                            }}
                                            className="w-full px-4 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover transition-all min-h-[44px]"
                                        >
                                            Accept Invite
                                        </button>
                                    ) : (
                                        <Link
                                            href={`/dashboard/${invite.wedding_id}`}
                                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-all min-h-[44px]"
                                        >
                                            Open Workspace <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {weddings.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl sm:rounded-[2rem] p-6 sm:p-12 md:p-20 text-center soft-shadow border border-border"
                    >
                        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-8">
                            <Heart className="w-8 h-8 sm:w-12 sm:h-12 text-primary/30" />
                        </div>
                        <h2 className="text-xl sm:text-3xl font-serif font-bold text-foreground mb-3 sm:mb-4">Start your first wedding site</h2>
                        <p className="text-sm sm:text-base text-text-secondary mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed">
                            Create your site, customize the design and wedding details, then share your link so you can manage RSVPs from one dashboard.
                        </p>

                        <div className="grid gap-3 max-w-md mx-auto mb-6 sm:mb-10 text-left">
                            {[
                                'Create your wedding site',
                                'Customize your design, photos, and details',
                                'Share your link and track RSVPs here',
                            ].map((step) => (
                                <div key={step} className="flex items-center gap-3 rounded-2xl bg-neutral px-4 py-3 text-sm font-semibold text-foreground">
                                    <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                                    {step}
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex flex-col items-center gap-6">
                            <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
                                <Link
                                    href="/builder"
                                    className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 min-h-[44px] text-sm sm:text-base"
                                >
                                    Create Your Free Site <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                                </Link>
                                <Link
                                    href="/user-guide"
                                    className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 rounded-xl border border-primary/20 bg-primary/10 text-primary font-bold hover:bg-primary hover:text-white transition-all min-h-[44px] text-sm sm:text-base"
                                >
                                    View User Guide <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                                </Link>
                            </div>

                        </div>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                        <AnimatePresence>
                            {weddings.map((wedding, idx) => (
                                <motion.div
                                    key={wedding.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.08 }}
                                    layout
                                    className="group bg-white rounded-xl sm:rounded-[2rem] overflow-hidden border border-border soft-shadow hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-300"
                                >
                                    {/* Hero image */}
                                    <div className="aspect-[16/10] bg-neutral dark:bg-neutral/50 relative overflow-hidden">
                                        {wedding.hero_image ? (
                                            <img
                                                src={wedding.hero_image}
                                                alt="Wedding"
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Heart className="w-16 sm:w-20 h-16 sm:h-20 text-primary/20 dark:text-primary/10" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3 sm:p-5">
                                            <div className="w-full">
                                                <div className="flex justify-between items-end gap-2">
                                                    <h3 className="text-white text-base sm:text-lg font-serif font-bold line-clamp-1 drop-shadow">
                                                        {wedding.bride_name} & {wedding.groom_name}
                                                    </h3>
                                                    <div className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white text-[10px] font-bold uppercase tracking-widest border border-white/20 flex-shrink-0">
                                                        {wedding.rsvps?.length || 0} RSVPs
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card body */}
                                    <div className="p-4 sm:p-6 space-y-4">
                                        {/* Date + Venue */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs sm:text-sm text-text-secondary font-medium">
                                                <Calendar className="w-4 h-4 text-primary/40 flex-shrink-0" />
                                                <span className="line-clamp-1">
                                                    {new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs sm:text-sm text-text-secondary font-medium">
                                                <MapPin className="w-4 h-4 text-primary/40 flex-shrink-0" />
                                                <span className="line-clamp-1">{wedding.venue_name}</span>
                                            </div>
                                        </div>

                                        {/* Status badge */}
                                        <div className="flex items-center justify-between">
                                            <StatusBadge wedding={wedding} />
                                            <span className="text-[10px] text-text-secondary/50 font-bold uppercase tracking-widest">
                                                {wedding.template || 'classic'}
                                            </span>
                                        </div>

                                        {/* Primary actions row */}
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/dashboard/${wedding.id}`}
                                                className="flex-1 text-center py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/10 hover:bg-primary-hover transition-all min-h-[44px] flex items-center justify-center gap-1.5"
                                            >
                                                <Settings className="w-3.5 h-3.5" />
                                                Manage
                                            </Link>
                                            <Link
                                                href={`/w/${wedding.id}`}
                                                target="_blank"
                                                title="View live page"
                                                className="h-10 sm:h-11 w-10 sm:w-11 rounded-xl border border-border flex items-center justify-center text-text-secondary hover:bg-foreground hover:text-white hover:border-foreground transition-all flex-shrink-0"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                            <CopyLinkButton id={wedding.id} />
                                            <DeleteButton
                                                weddingId={wedding.id}
                                                coupleName={`${wedding.bride_name} & ${wedding.groom_name}`}
                                                onDeleted={() => setWeddings(prev => prev.filter(w => w.id !== wedding.id))}
                                            />
                                        </div>

                                        {/* Secondary actions */}
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/dashboard/${wedding.id}/planner`}
                                                className="flex-1 text-center py-2.5 rounded-xl bg-secondary/20 text-foreground text-xs sm:text-sm font-bold hover:bg-secondary/30 transition-all flex items-center justify-center gap-1.5 min-h-[44px] border border-secondary/30"
                                            >
                                                <Heart className="w-3.5 h-3.5 text-primary" />
                                                {wedding.is_premium || isAdmin ? 'Planner' : 'Planner Pro'}
                                            </Link>
                                            <Link
                                                href={`/builder?edit=${wedding.id}`}
                                                title="Edit design"
                                                className="h-10 sm:h-11 px-3 sm:px-4 rounded-xl border border-primary/20 text-primary text-xs font-bold hover:bg-primary/5 transition-all flex items-center gap-1.5 min-h-[44px]"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">Edit</span>
                                            </Link>
                                        </div>

                                        {/* Planner Pro prompt */}
                                        {!wedding.is_premium && !isAdmin && (
                                            <div className="rounded-2xl border border-primary/15 bg-primary/5 p-3">
                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Ready to plan deeper?</p>
                                                <p className="mt-1 text-xs leading-5 text-text-secondary">
                                                    Unlock budgets, suppliers, seating, tasks, collaborators, reminders, photos, and thank-you tools.
                                                </p>
                                                <UpgradeButton weddingId={wedding.id} className="mt-3 w-full justify-center text-xs sm:text-sm py-2 sm:py-2.5" />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}
