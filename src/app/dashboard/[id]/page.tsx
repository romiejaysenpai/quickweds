'use client';

import { useSearchParams } from 'next/navigation';
import { Heart, Users, Share2, ExternalLink, Calendar, CheckCircle2, Loader2, Download, Search, Trash2, Copy, MessageCircle, Mail, X, Music, Baby, AlertCircle, ListTodo, Wallet, Plus, Coins, ArrowRight, ShieldCheck, Upload, ChevronDown, Sparkles, LayoutDashboard, PieChartIcon, Settings, Smartphone, Printer, QrCode, LogOut, Menu, MapPin, BookOpen, LifeBuoy, PlayCircle, Bell, BellOff, Info, Camera } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { useEffect, useState, use, useMemo, useRef, useCallback, useDeferredValue } from 'react';
import { useAuth } from '@/context/AuthContext';
import { trackWeddingEvent } from '@/lib/wedding-features';
import ConfettiCelebration from '@/components/ConfettiCelebration';
import CopyButton from '@/components/CopyButton';
import DarkModeToggle from '@/components/DarkModeToggle';
import UpgradeButton from '@/components/UpgradeButton';
import { motion, AnimatePresence } from 'framer-motion';
import { getClientAccountProfile, hasAccountPro } from '@/lib/account';
import { copyToClipboard } from '@/lib/client-clipboard';
import NotificationBell from '@/components/dashboard/NotificationBell';
import { EMPTY_PLANNER_USAGE, FREE_PLAN_LIMITS, type PlannerUsage } from '@/lib/planner-limits';
import { getWeddingPublicUrl } from '@/lib/wedding-slugs';
import { openExternalUrl } from '@/lib/native-actions';
import {
    GUEST_GROUP_OPTIONS,
    getGuestGroupLabel,
    getPlusOneStatusLabel,
    type EnhancedRSVP,
    type GuestGroup,
    type ImportedGuestRow,
    type PlusOneRsvpStatus,
    escapeCsvCell,
} from '@/lib/guest-list';
import { getCachedSession } from '@/lib/session-cache';
import QrCodeActions from '@/components/dashboard/QrCodeActions';

const AnalyticsPanel = dynamic(() => import('@/components/dashboard/AnalyticsPanel'), {
    loading: () => <DashboardPanelLoading label="Loading analytics..." />,
});
const CollaboratorsPanel = dynamic(() => import('@/components/dashboard/CollaboratorsPanel'), {
    loading: () => <DashboardPanelLoading label="Loading team tools..." />,
});
const LazyBudgetPieChart = dynamic(() => import('@/components/dashboard/LazyBudgetPieChart'), {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse rounded-full bg-neutral/50" />,
});
const GuestImportModal = dynamic(() => import('@/components/dashboard/GuestImportModal'));

const WELCOME_CHARACTER_URL = 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/icons/dahsboard%20quivkyt.png';

function DashboardPanelLoading({ label }: { label: string }) {
    return (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-border bg-white p-6 text-center soft-shadow">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm font-bold text-text-secondary">{label}</p>
        </div>
    );
}

function getFirstName(user: any) {
    const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
    const firstName = fullName.trim().split(/\s+/)[0];
    return firstName || 'there';
}

async function copyText(text: string) {
    await copyToClipboard(text);
}

function openExternal(url: string) {
    void openExternalUrl(url);
}

type GuestFormState = {
    guest_name: string;
    guest_email: string;
    rsvp_status: 'pending' | 'confirmed' | 'declined';
    num_guests: number;
    guest_group: GuestGroup | '';
    invitation_sent: boolean;
    plus_one_allowed: boolean;
    plus_one_name: string;
    plus_one_email: string;
    plus_one_rsvp_status: PlusOneRsvpStatus;
    table_assignment: string;
};

type CachedDashboardCounters = {
    confirmed: number;
    declined: number;
    pending: number;
    totalGuests: number;
    totalRsvps: number;
    checkedInGuests: number;
    photoUploadCount: number;
    vipCount?: number;
    tableFill?: Array<{
        tableName: string;
        assignedGuests: number;
        capacity: number | null;
        fillPercent: number | null;
    }>;
    mealChoices: Record<string, number>;
};

const emptyGuestForm: GuestFormState = {
    guest_name: '',
    guest_email: '',
    rsvp_status: 'pending',
    num_guests: 1,
    guest_group: '',
    invitation_sent: false,
    plus_one_allowed: false,
    plus_one_name: '',
    plus_one_email: '',
    plus_one_rsvp_status: 'not_invited',
    table_assignment: '',
};

export default function DashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isAdmin, adminChecked, loading: authLoading, logout } = useAuth();
    const created = searchParams?.get('created');

    const [wedding, setWedding] = useState<any>(null);
    const [accountIsPro, setAccountIsPro] = useState(false);
    const [rsvps, setRsvps] = useState<EnhancedRSVP[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [budgets, setBudgets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [accessRole, setAccessRole] = useState<'owner' | 'partner' | 'coordinator' | 'pending' | 'denied'>('denied');
    const [accessDebug, setAccessDebug] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const deferredSearchQuery = useDeferredValue(searchQuery);
    const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'declined' | 'pending'>('all');
    const [groupFilter, setGroupFilter] = useState<'all' | GuestGroup>('all');
    const [invitationFilter, setInvitationFilter] = useState<'all' | 'sent' | 'not_sent'>('all');
    const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
    const [isImportGuestModalOpen, setIsImportGuestModalOpen] = useState(false);
    const [importingGuests, setImportingGuests] = useState(false);
    const [planUsage, setPlanUsage] = useState<PlannerUsage>(EMPTY_PLANNER_USAGE);
    const [cachedCounters, setCachedCounters] = useState<CachedDashboardCounters | null>(null);
    const [newGuest, setNewGuest] = useState<GuestFormState>(emptyGuestForm);
    const [copyToast, setCopyToast] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [checkingRole, setCheckingRole] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [qrStatus, setQrStatus] = useState('');

    const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

    // Feature: Confetti state
    const [showConfetti, setShowConfetti] = useState(false);

    // Trigger confetti on successful creation
    useEffect(() => {
        if (created) {
            setShowConfetti(true);
            // Hide confetti after animation completes
            const timer = setTimeout(() => setShowConfetti(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [created]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await logout();
        router.replace('/');
    };

    useEffect(() => {
        if (!authLoading && !user && !isLoggingOut) {
            router.push('/login');
            return;
        }

        if (!user) return;

        // Wait for admin check to complete before fetching data
        if (!adminChecked) return;

        const fetchData = async () => {
            try {
                setCheckingRole(true);
                const { data: sessionData } = await getCachedSession();
                const token = sessionData.session?.access_token;

                if (!token) {
                    router.push('/login');
                    return;
                }

                if (!isAdmin) {
                    await getClientAccountProfile(token).catch((profileErr) => {
                        console.warn('Account profile check skipped before workspace load:', profileErr);
                        return null;
                    });
                }

                setCheckingRole(false);

                const workspaceResponse = await fetch(`/api/planner/load?weddingId=${encodeURIComponent(id)}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const workspaceResult = await workspaceResponse.json().catch(() => ({}));
                const weddingData = workspaceResult.wedding;

                if (!weddingData) {
                    setLoading(false);
                    return;
                }

                // Deterministic access check — no timing issues
                let role: 'owner' | 'partner' | 'coordinator' | 'pending' | 'denied';
                if (workspaceResult.accessRole === 'owner' || workspaceResult.accessRole === 'partner' || workspaceResult.accessRole === 'coordinator' || workspaceResult.accessRole === 'pending') {
                    role = workspaceResult.accessRole;
                } else if (weddingData.user_id === user.id) {
                    role = 'owner';
                } else if (isAdmin) {
                    // Admins automatically get owner access
                    role = 'owner';
                    setAccessDebug(`Admin override — isAdmin=${isAdmin}, user=${user.email}`);
                } else {
                    role = 'denied';
                }

                if (role === 'pending' || role === 'denied') {
                    setAccessRole(role);
                    setLoading(false);
                    return;
                }

                setAccessRole(role);
                setWedding(weddingData);
                setAccountIsPro(hasAccountPro(workspaceResult.accountProfile));
                setPlanUsage(workspaceResult.planUsage || EMPTY_PLANNER_USAGE);

                const [rsvpsRes, vendorsRes, budgetsRes, countersRes] = await Promise.all([
                    supabase.from('rsvps').select('*').eq('wedding_id', id).order('created_at', { ascending: false }),
                    supabase.from('planner_vendors').select('*').eq('wedding_id', id),
                    supabase.from('planner_budgets').select('*').eq('wedding_id', id),
                    fetch(`/api/dashboard/counters?weddingId=${encodeURIComponent(id)}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }).then((response) => response.ok ? response.json() : null).catch(() => null),
                ]);

                if (rsvpsRes.data) setRsvps(rsvpsRes.data);
                if (vendorsRes.data) setVendors(vendorsRes.data);
                if (budgetsRes.data) setBudgets(budgetsRes.data);
                if (countersRes?.counters) setCachedCounters(countersRes.counters);
            } catch (err) {
                console.error(err);
                setCheckingRole(false);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, user, authLoading, isAdmin, adminChecked, router, isLoggingOut]);

    // Computed stats
    const stats = useMemo(() => {
        const confirmed = rsvps.filter(r => r.rsvp_status === 'confirmed' || r.attendance === 'Yes');
        const declined = rsvps.filter(r => r.rsvp_status === 'declined' || r.attendance === 'No');
        const pending = rsvps.filter(r => r.rsvp_status === 'pending');

        const totalGuests = confirmed.reduce((acc, r) => acc + (r.num_guests || 1), 0);
        const totalChildren = rsvps.reduce((acc, r) => acc + (r.children_count || 0), 0);
        const invitedCount = rsvps.filter(r => r.invitation_sent).length;
        const seatedCount = rsvps.filter(r => r.table_assignment).length;
        const groupedCount = rsvps.filter(r => r.guest_group).length;

        // Meal preferences
        const meals: Record<string, number> = {};
        rsvps.forEach(r => {
            const pref = r.meal_preference || 'No Preference';
            meals[pref] = (meals[pref] || 0) + 1;
        });

        const groups: Record<string, number> = {};
        rsvps.forEach((rsvp) => {
            const label = getGuestGroupLabel(rsvp.guest_group);
            groups[label] = (groups[label] || 0) + 1;
        });

        // Song requests
        const songs = rsvps.filter(r => r.song_request).map(r => ({ name: r.guest_name, song: r.song_request }));

        // Budget stats
        const totalBudget = parseFloat(wedding?.total_budget) || 0;
        const totalEst = budgets.reduce((acc, b) => acc + (parseFloat(b.estimated_cost) || 0), 0);
        const totalSpentFromVendors = vendors
            .filter(v => v.payment_status?.toLowerCase() === 'paid')
            .reduce((acc, v) => acc + (parseFloat(v.amount) || 0), 0);

        const totalCommitted = totalEst + totalSpentFromVendors;
        const remainingBudget = totalBudget - totalCommitted;
        const budgetPercent = totalBudget > 0 ? Math.min(100, Math.round((totalCommitted / totalBudget) * 100)) : 0;

        return {
            confirmed: cachedCounters?.confirmed ?? confirmed.length,
            declined: cachedCounters?.declined ?? declined.length,
            pending: cachedCounters?.pending ?? pending.length,
            totalGuests: cachedCounters?.totalGuests ?? totalGuests,
            totalChildren,
            invitedCount,
            seatedCount,
            groupedCount,
            meals: cachedCounters?.mealChoices ?? meals,
            groups,
            songs,
            total: cachedCounters?.totalRsvps ?? rsvps.length,
            totalBudget,
            totalSpent: totalCommitted, // Using Committed as "Spent" for the dashboard overview
            remainingBudget,
            budgetPercent,
            totalEst,
            totalSpentFromVendors
        };
    }, [rsvps, vendors, wedding, budgets, cachedCounters]);

    // Filtered list
    const filteredRsvps = useMemo(() => {
        return rsvps.filter(r => {
            const normalizedQuery = deferredSearchQuery.toLowerCase();
            const matchSearch = [
                r.guest_name,
                r.guest_email,
                r.table_assignment,
                getGuestGroupLabel(r.guest_group),
                r.plus_one_name,
            ].some((value) => (value || '').toLowerCase().includes(normalizedQuery));
            let matchStatus = true;
            if (filterStatus === 'confirmed') matchStatus = r.rsvp_status === 'confirmed' || r.attendance === 'Yes';
            else if (filterStatus === 'declined') matchStatus = r.rsvp_status === 'declined' || r.attendance === 'No';
            else if (filterStatus === 'pending') matchStatus = r.rsvp_status === 'pending';
            const matchGroup = groupFilter === 'all' ? true : r.guest_group === groupFilter;
            const matchInvitation = invitationFilter === 'all'
                ? true
                : invitationFilter === 'sent'
                    ? Boolean(r.invitation_sent)
                    : !r.invitation_sent;
            return matchSearch && matchStatus && matchGroup && matchInvitation;
        });
    }, [rsvps, deferredSearchQuery, filterStatus, groupFilter, invitationFilter]);

    // Feature: Infinite scroll state and logic (must be after filteredRsvps)
    const [visibleCount, setVisibleCount] = useState(20);
    const [hasMore, setHasMore] = useState(true);
    const guestListRef = useRef<HTMLDivElement>(null);
    const ITEMS_PER_PAGE = 20;

    // Infinite scroll handler
    const loadMore = useCallback(() => {
        if (filteredRsvps.length > visibleCount) {
            setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredRsvps.length));
        } else {
            setHasMore(false);
        }
    }, [filteredRsvps.length, visibleCount]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        const sentinel = document.getElementById('guest-list-sentinel');
        if (sentinel) {
            observer.observe(sentinel);
        }

        return () => observer.disconnect();
    }, [loadMore, hasMore]);

    // Reset visible count when filters change
    useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE);
        setHasMore(filteredRsvps.length > ITEMS_PER_PAGE);
    }, [deferredSearchQuery, filterStatus, groupFilter, invitationFilter, filteredRsvps.length]);

    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [activeTab, setActiveTab] = useState<'home' | 'guests' | 'analytics' | 'team' | 'settings'>('home');

    // CSV Export
    const exportCSV = () => {
        if (!hasPlannerPro) {
            alert('CSV export is part of Planner Pro. Upgrade when you need downloadable guest lists for final planning.');
            return;
        }

        const headers = [
            'Guest Name',
            'Email',
            'Attendance',
            'RSVP Status',
            'Guests',
            'Guest Group',
            'Invitation Sent',
            'Invitation Sent At',
            'Table Assignment',
            'Plus-One Allowed',
            'Plus-One Name',
            'Plus-One Email',
            'Plus-One Status',
            'Children',
            'Meal Preference',
            'Dietary Details',
            'Plus One Names',
            'Song Request',
            'Message',
            'Date',
        ];
        const rows = rsvps.map(r => [
            r.guest_name,
            r.guest_email || '',
            r.attendance || '',
            r.rsvp_status || '',
            r.num_guests,
            getGuestGroupLabel(r.guest_group),
            r.invitation_sent ? 'Yes' : 'No',
            r.invitation_sent_at ? new Date(r.invitation_sent_at).toLocaleString() : '',
            r.table_assignment || '',
            r.plus_one_allowed ? 'Yes' : 'No',
            r.plus_one_name || '',
            r.plus_one_email || '',
            getPlusOneStatusLabel(r.plus_one_rsvp_status),
            r.children_count || 0,
            r.meal_preference || '',
            r.dietary_details || '',
            r.plus_one_names || '',
            r.song_request || '',
            r.message || '',
            new Date(r.created_at).toLocaleDateString(),
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.map((c) => escapeCsvCell(c)).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rsvp-${wedding?.bride_name}-${wedding?.groom_name}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Delete RSVP
    const toggleNotification = async (field: 'notify_on_rsvp' | 'notify_on_updates') => {
        if (!wedding || isSavingSettings) return;

        const newValue = !wedding[field];
        setIsSavingSettings(true);

        const { error } = await supabase
            .from('weddings')
            .update({ [field]: newValue })
            .eq('id', id);

        if (error) {
            alert('Failed to update notification settings.');
        } else {
            setWedding({ ...wedding, [field]: newValue });
        }
        setIsSavingSettings(false);
    };

    const sendTestNotification = async () => {
        if (!user || !wedding) return;
        setIsSavingSettings(true);

        const { error } = await (supabase as any)
            .from('user_notifications')
            .insert({
                user_id: user.id,
                wedding_id: id,
                title: '🔔 Test Notification Successful!',
                message: 'Your in-app notification system is working perfectly. You will receive alerts like this for new RSVPs and app updates.',
                type: 'info',
                link: `/dashboard/${id}`
            });

        if (error) {
            alert('Error sending test notification: ' + error.message);
        }
        setIsSavingSettings(false);
    };

    const plannerGuestRequest = async (body: Record<string, unknown>) => {
        const { data: sessionData } = await getCachedSession();
        const token = sessionData.session?.access_token;
        if (!token) throw new Error('Please sign in again to manage the guest list.');

        const response = await fetch('/api/planner/guests', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ weddingId: id, ...body }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(result.error || 'Unable to update guest list.');
        }
        return result;
    };

    const deleteRsvp = async (rsvpId: string) => {
        if (!confirm('Remove this guest from the list?')) return;
        try {
            await plannerGuestRequest({ action: 'delete', id: rsvpId });
            setCachedCounters(null);
            setRsvps(prev => prev.filter(r => r.id !== rsvpId));
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Unable to delete guest.');
        }
    };

    const updateRsvp = async (rsvpId: string, patch: Partial<EnhancedRSVP>) => {
        const normalizedPatch: Record<string, unknown> = { ...patch };
        if (Object.prototype.hasOwnProperty.call(patch, 'invitation_sent')) {
            normalizedPatch.invitation_sent_at = patch.invitation_sent ? new Date().toISOString() : null;
        }

        try {
            const result = await plannerGuestRequest({ action: 'update', id: rsvpId, patch: normalizedPatch });
            setCachedCounters(null);
            setRsvps((prev) => prev.map((rsvp) => (rsvp.id === rsvpId ? result.guest : rsvp)));
        } catch (error) {
            alert(`Error updating guest: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleAddManualGuest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGuest.guest_name) return;

        const isAddingGuestEmail = Boolean(newGuest.guest_email.trim());
        const currentGuestEmailCount = rsvps.filter((guest) => Boolean(guest.guest_email)).length;
        if (!hasPlannerPro && isAddingGuestEmail && currentGuestEmailCount >= FREE_PLAN_LIMITS.guestEmails) {
            alert('Your guest list is ready for Pro. Free weddings include 50 guests with email addresses; extra guests can still be tracked manually without email.');
            return;
        }

        try {
            const result = await plannerGuestRequest({
                action: 'create',
                guest: {
            guest_name: newGuest.guest_name,
            guest_email: newGuest.guest_email || null,
            rsvp_status: newGuest.rsvp_status,
            num_guests: newGuest.num_guests,
            guest_group: newGuest.guest_group || null,
            invitation_sent: newGuest.invitation_sent,
            invitation_sent_at: newGuest.invitation_sent ? new Date().toISOString() : null,
            plus_one_allowed: newGuest.plus_one_allowed,
            plus_one_name: newGuest.plus_one_name || null,
            plus_one_email: newGuest.plus_one_email || null,
            plus_one_rsvp_status: newGuest.plus_one_allowed ? newGuest.plus_one_rsvp_status : 'not_invited',
            table_assignment: newGuest.table_assignment || null,
            manual_entry: true,
            attendance: newGuest.rsvp_status === 'confirmed' ? 'Yes' : newGuest.rsvp_status === 'declined' ? 'No' : null
                },
            });
            const data = result.guest;
            setCachedCounters(null);
            setRsvps([data, ...rsvps]);
            if (data?.guest_email) {
                setPlanUsage((current) => ({ ...current, guestEmailCount: current.guestEmailCount + 1 }));
            }
            setNewGuest(emptyGuestForm);
            setIsAddGuestModalOpen(false);
        } catch (error) {
            alert("Error adding guest: " + (error instanceof Error ? error.message : 'Unknown error'));
        }
    };

    const handleImportGuests = async (rows: ImportedGuestRow[]) => {
        const currentGuestEmailCount = rsvps.filter((guest) => Boolean(guest.guest_email)).length;
        const incomingGuestEmails = rows.filter((row) => Boolean(row.guest_email)).length;

        if (!hasPlannerPro && currentGuestEmailCount + incomingGuestEmails > FREE_PLAN_LIMITS.guestEmails) {
            throw new Error(`Free CSV import is limited to ${FREE_PLAN_LIMITS.guestEmails} guests with email addresses. Remove email addresses from extra rows or upgrade to Planner Pro for unlimited imports.`);
        }

        setImportingGuests(true);
        let data: EnhancedRSVP[] = [];
        try {
            const result = await plannerGuestRequest({ action: 'import', guests: rows });
            data = result.guests || [];
        } catch (error) {
            throw new Error(`${error instanceof Error ? error.message : 'Unable to import guests.'}. Apply supabase-guest-list-enhancements.sql before using the new guest management fields.`);
        } finally {
            setImportingGuests(false);
        }

        setCachedCounters(null);
        setRsvps((prev) => [...(data || []), ...prev]);
        if (data?.length) {
            const importedGuestEmails = data.filter((row: EnhancedRSVP) => Boolean(row.guest_email)).length;
            setPlanUsage((current) => ({ ...current, guestEmailCount: current.guestEmailCount + importedGuestEmails }));
        }
    };

    // Copy & Share
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://quickweds.site';
    const url = wedding ? getWeddingPublicUrl(appBaseUrl, wedding) : '';
    const qrTrackingUrl = url ? `${url}${url.includes('?') ? '&' : '?'}src=qr` : '';
    const canManageWorkspace = accessRole === 'owner' || accessRole === 'partner';
    const hasPlannerPro = isAdmin || accountIsPro || Boolean(wedding?.is_premium);

    const handleShareWhatsApp = () => {
        void trackWeddingEvent(id, 'share_whatsapp', { source: 'dashboard' });
        openExternal(`https://wa.me/?text=${encodeURIComponent(`You're invited to our wedding!\n${url}`)}`);
    };

    const handleShareEmail = () => {
        void trackWeddingEvent(id, 'share_email', { source: 'dashboard' });
        openExternal(`mailto:?subject=${encodeURIComponent(`You're Invited!`)}&body=${encodeURIComponent(`We'd love for you to join us!\n\n${url}`)}`);
    };

    if (checkingRole || loading) {
        return <div className="mobile-safe-screen flex items-center justify-center bg-neutral/30"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>;
    }

    // DEBUG: Show access info in development
    if (process.env.NODE_ENV === 'development' && accessDebug) {
        console.log('Dashboard render:', { accessRole, isAdmin, accessDebug });
    }

    if (accessRole === 'pending') {
        return <div className="mobile-safe-screen bg-neutral flex items-center justify-center px-6"><div className="max-w-xl w-full bg-white rounded-[2rem] border border-border soft-shadow p-8 text-center space-y-4"><ShieldCheck className="w-12 h-12 text-primary mx-auto" /><h1 className="text-2xl font-serif font-bold text-foreground">Invitation Pending</h1><p className="text-text-secondary">This workspace has been shared with you. Accept the invite from the dashboard home screen first.</p><Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-all min-h-[44px]">Back to Dashboard <ArrowRight className="w-4 h-4" /></Link></div></div>;
    }
    if (accessRole === 'denied') {
        return <div className="mobile-safe-screen bg-neutral flex items-center justify-center px-6"><div className="max-w-xl w-full bg-white rounded-[2rem] border border-border soft-shadow p-8 text-center space-y-4"><ShieldCheck className="w-12 h-12 text-red-400 mx-auto" /><h1 className="text-2xl font-serif font-bold text-foreground">Access Restricted</h1><p className="text-text-secondary">You do not currently have access to this wedding workspace.</p><Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-all min-h-[44px]">Back to Dashboard <ArrowRight className="w-4 h-4" /></Link></div></div>;
    }
    if (!wedding) {
        return <div className="p-20 text-center">Wedding not found.</div>;
    }

    // Pie chart angles
    const attendPct = stats.total > 0 ? (stats.confirmed / stats.total) * 100 : 0;
    const declinePct = stats.total > 0 ? (stats.declined / stats.total) * 100 : 0;
    const pendingPct = stats.total > 0 ? (stats.pending / stats.total) * 100 : 0;

    const budgetData = [
        { name: 'Spent', value: stats.totalSpent },
        { name: 'Remaining', value: Math.max(0, stats.remainingBudget) }
    ];
    const COLORS = ['#D16C78', '#E5E7EB'];
    const currencySymbol = wedding?.currency === 'USD' ? '$' : wedding?.currency === 'JPY' ? '¥' : '₱';

    return (
        <div className="mobile-safe-screen bg-background pb-20 mobile-safe-bottom">
            {/* Dev debug banner */}
            {process.env.NODE_ENV === 'development' && accessDebug && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-accent text-white p-2 text-xs text-center">
                    {accessDebug}
                </div>
            )}

            {/* Confetti Celebration */}
            <ConfettiCelebration trigger={showConfetti} />

            {/* Header */}
            <div className="sticky top-0 z-50 border-b border-border bg-white/85 px-3 py-3 backdrop-blur-md dark:bg-white/90 sm:p-4">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-2 sm:px-4">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex min-w-[88px] flex-shrink-0 items-center sm:min-w-[104px]" aria-label="QuickWeds">
                            <img src="/logo.png" alt="QuickWeds Logo" className="h-8 w-auto object-contain transition-transform hover:scale-105 sm:h-12" />
                        </Link>
                    </div>

                    <div className="flex min-w-0 flex-1 items-center justify-end gap-2 pl-1 sm:w-auto sm:flex-none sm:pl-0">
                        {canManageWorkspace && (
                            <Link
                                href={`/builder?edit=${wedding.id}`}
                                className="flex min-h-[42px] min-w-[82px] flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover sm:min-h-[44px] sm:min-w-0 sm:rounded-xl sm:px-6 sm:py-2.5 sm:text-sm"
                            >
                                <Sparkles className="w-4 h-4 flex-shrink-0" />
                                <span className="hidden sm:inline">Edit Design</span>
                                <span className="sm:hidden">Edit</span>
                            </Link>
                        )}

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
                    <div className="fixed inset-0 z-[150]">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeMobileMenu}
                            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
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
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Workspace Menu</span>
                                <button onClick={closeMobileMenu} className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center text-text-secondary hover:text-primary transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                <div className="mb-4">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary/50 mb-3 ml-1">Tools & Planning</p>
                                    <div className="grid gap-2">
                                        <Link
                                            href={`/dashboard/${wedding.id}/planner`}
                                            onClick={closeMobileMenu}
                                            className="flex h-14 items-center justify-between rounded-xl bg-primary/5 px-4 text-sm font-bold text-primary transition hover:bg-primary/10 border border-primary/10"
                                        >
                                            <span className="flex items-center gap-3">
                                                <ListTodo className="w-4 h-4" />
                                                Planner
                                            </span>
                                            <ArrowRight className="h-4 w-4 opacity-30" />
                                        </Link>
                                        <Link
                                            href={`/dashboard/${wedding.id}/wedding-day?from=dashboard`}
                                            onClick={closeMobileMenu}
                                            className="flex h-14 items-center justify-between rounded-xl bg-neutral/30 px-4 text-sm font-bold text-text-secondary transition hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20"
                                        >
                                            <span className="flex items-center gap-3">
                                                <Bell className="w-4 h-4" />
                                                Wedding Day Mode
                                            </span>
                                            <ArrowRight className="h-4 w-4 opacity-20" />
                                        </Link>
                                        <Link
                                            href={`/dashboard/${wedding.id}/check-in`}
                                            onClick={closeMobileMenu}
                                            className="flex h-14 items-center justify-between rounded-xl bg-neutral/30 px-4 text-sm font-bold text-text-secondary transition hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20"
                                        >
                                            <span className="flex items-center gap-3">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Check-In
                                            </span>
                                            <ArrowRight className="h-4 w-4 opacity-20" />
                                        </Link>
                                        <Link
                                            href={`/dashboard/${wedding.id}/qr-kit?from=dashboard`}
                                            onClick={closeMobileMenu}
                                            className="flex h-14 items-center justify-between rounded-xl bg-neutral/30 px-4 text-sm font-bold text-text-secondary transition hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20"
                                        >
                                            <span className="flex items-center gap-3">
                                                <QrCode className="w-4 h-4" />
                                                QR Kit
                                            </span>
                                            <ArrowRight className="h-4 w-4 opacity-20" />
                                        </Link>
                                        <Link
                                            href={`/dashboard/${wedding.id}/photo-uploads`}
                                            onClick={closeMobileMenu}
                                            className="flex h-14 items-center justify-between rounded-xl bg-neutral/30 px-4 text-sm font-bold text-text-secondary transition hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20"
                                        >
                                            <span className="flex items-center gap-3">
                                                <Camera className="w-4 h-4" />
                                                Photo Uploads
                                            </span>
                                            <ArrowRight className="h-4 w-4 opacity-20" />
                                        </Link>
                                        <Link
                                            href={`/dashboard/${wedding.id}/thank-you?from=dashboard`}
                                            onClick={closeMobileMenu}
                                            className="flex h-14 items-center justify-between rounded-xl bg-neutral/30 px-4 text-sm font-bold text-text-secondary transition hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20"
                                        >
                                            <span className="flex items-center gap-3">
                                                <Mail className="w-4 h-4" />
                                                Thank You
                                            </span>
                                            <ArrowRight className="h-4 w-4 opacity-20" />
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                closeMobileMenu();
                                                openExternal(url);
                                            }}
                                            className="flex h-14 items-center justify-between rounded-xl bg-neutral/30 px-4 text-sm font-bold text-text-secondary transition hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20"
                                        >
                                            <span className="flex items-center gap-3">
                                                <ExternalLink className="w-4 h-4" />
                                                Guest View
                                            </span>
                                            <ArrowRight className="h-4 w-4 opacity-20" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary/50 mb-3 ml-1">General</p>
                                    <div className="grid gap-2">
                                        {[
                                            { label: 'Directory', href: '/suppliers', icon: MapPin },
                                            { label: 'User Guide', href: '/user-guide', icon: BookOpen },
                                            { label: 'Settings', href: '/settings', icon: Settings },
                                            { label: 'Support', href: '/support', icon: LifeBuoy },
                                            { label: 'Community', href: 'https://chat.whatsapp.com/K30P5s5I03f4wPI30URaRP', icon: MessageCircle },
                                        ].map((item) => (
                                            <Link
                                                key={item.label}
                                                href={item.href}
                                                onClick={closeMobileMenu}
                                                className="flex h-12 items-center justify-between rounded-xl bg-neutral/20 px-4 text-xs font-bold text-text-secondary transition hover:bg-primary/5 hover:text-primary border border-transparent"
                                            >
                                                <span className="flex items-center gap-3">
                                                    <item.icon className="w-4 h-4 opacity-50" />
                                                    {item.label}
                                                </span>
                                                <ArrowRight className="h-4 w-4 opacity-20" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
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

            <main className="max-w-6xl mx-auto px-3 sm:px-6 pt-4 sm:pt-12 text-left">
                {/* Mobile Tab Navigation (Fixed Bottom) */}
                <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-white/90 backdrop-blur-md border-t border-border z-[100] flex justify-around items-center p-2 pb-safe shadow-2xl">
                    <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'home' ? 'text-primary' : 'text-text-secondary/50'}`}>
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Overview</span>
                    </button>
                    <button onClick={() => setActiveTab('guests')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'guests' ? 'text-primary' : 'text-text-secondary/50'}`}>
                        <Users className="w-5 h-5" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Guests</span>
                    </button>
                    <button onClick={() => setActiveTab('analytics')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'analytics' ? 'text-primary' : 'text-text-secondary/50'}`}>
                        <PieChartIcon className="w-5 h-5" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Stats</span>
                    </button>
                    <button onClick={() => setActiveTab('team')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'team' ? 'text-primary' : 'text-text-secondary/50'}`}>
                        <Share2 className="w-5 h-5" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Team</span>
                    </button>
                    <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'settings' ? 'text-primary' : 'text-text-secondary/50'}`}>
                        <Settings className="w-5 h-5" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Setup</span>
                    </button>
                </div>



                {/* Desktop Tab Navigation */}
                <div className="hidden sm:flex items-center gap-1 mb-8 p-1.5 bg-neutral/50 dark:bg-neutral/70 rounded-2xl border border-border w-fit">
                    {[
                        { id: 'home', label: 'Overview', icon: LayoutDashboard },
                        { id: 'guests', label: 'Guests', icon: Users },
                        { id: 'analytics', label: 'Analytics', icon: PieChartIcon },
                        { id: 'team', label: 'Team', icon: Share2 },
                        { id: 'settings', label: 'Settings', icon: Settings },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                activeTab === tab.id
                                    ? 'bg-white dark:bg-white text-primary shadow-sm ring-1 ring-primary/10 dark:ring-white/5'
                                    : 'text-text-secondary/60 hover:text-text-secondary hover:bg-white/50 dark:hover:bg-white/70'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
                    <div className="lg:col-span-2 space-y-6 sm:space-y-8">



                        {created && activeTab === 'home' && (
                            <div className="mb-8 p-4 rounded-xl bg-success-bg border border-border flex flex-row items-center gap-4 relative overflow-hidden sm:hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 pointer-events-none" />
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-white flex items-center justify-center text-accent shadow-sm flex-shrink-0 relative">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div className="relative">
                                    <h2 className="text-sm font-serif font-bold text-primary">Invitation is live! 🎉</h2>
                                    <p className="text-[10px] text-text-secondary">Ready to share your special URL.</p>
                                </div>
                            </div>
                        )}

                        {/* Desktop Only / Mobile Home Hero */}
                        {activeTab === 'home' && (
                            <motion.section
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative isolate mb-5 overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-2xl shadow-primary/10 sm:mb-7 sm:rounded-[2.25rem]"
                            >
                                <div className="p-4 sm:p-6 lg:p-7">
                                    <div className="relative z-10 flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="inline-flex rounded-full bg-primary/5 px-3 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-primary/70 ring-1 ring-primary/10 sm:text-[10px]">
                                                {wedding.wedding_date}
                                            </p>
                                            <h1 className="mt-3 max-w-3xl font-serif text-[1.5rem] sm:text-[2rem] font-black leading-[1.1] text-foreground sm:text-4xl">
                                                Workspace: <span className="text-primary">{wedding.bride_name} & {wedding.groom_name}</span><span className="text-accent">.</span>
                                            </h1>
                                            <p className="mt-2 text-xs sm:text-sm text-text-secondary max-w-sm">
                                                Welcome back, {getFirstName(user)}! Your wedding workspace is ready for updates.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative left-1/2 mt-4 h-[128px] w-screen max-w-[calc(100%+2rem)] -translate-x-1/2 overflow-visible sm:-mx-6 sm:left-auto sm:w-auto sm:max-w-none sm:translate-x-0 sm:mt-6 sm:h-[240px] lg:-mx-7 lg:h-[270px]">
                                        <div className="absolute inset-0 bg-primary" />
                                        <div
                                            className="absolute inset-x-[-32%] top-[-58px] z-10 h-[112px] bg-white sm:inset-x-[-24%] sm:top-[-92px] sm:h-[168px]"
                                            style={{ borderRadius: '0 0 50% 50% / 0 0 74% 74%' }}
                                        />

                                        <img
                                            src={WELCOME_CHARACTER_URL}
                                            alt="QuickWeds welcome character"
                                            className="absolute bottom-0 left-[-14px] z-[60] h-[152px] w-auto object-contain drop-shadow-2xl transition duration-500 hover:-translate-y-2 hover:scale-[1.03] sm:left-[-6px] sm:h-[250px] lg:left-4 lg:h-[300px]"
                                        />

                                        <div className="absolute left-[52%] right-3 top-[-6px] z-50 rounded-[1.2rem] bg-white px-3 py-2 pr-4 shadow-[0_18px_50px_rgba(122,90,97,0.18)] ring-1 ring-primary/10 sm:left-[50%] sm:right-2 sm:top-8 sm:rounded-[1.75rem] sm:px-6 sm:py-5 sm:pr-7 lg:left-[43%] lg:right-6 lg:max-w-2xl">
                                            <span className="absolute left-[-13px] top-1/2 h-0 w-0 -translate-y-1/2 border-y-[12px] border-r-[14px] border-y-transparent border-r-white" />
                                            <p className="text-[12px] font-black text-primary sm:text-base">Workspace Pro</p>
                                            <p className="mt-1 text-[11px] font-semibold leading-[1.45] text-text-secondary sm:mt-2 sm:text-base sm:leading-7">
                                                Track budgets, vendors, seating, and RSVPs all in one place. Your special day is coming soon!
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-4">
                                        <Link href={`/dashboard/${wedding.id}/planner`} className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/15 transition-all hover:-translate-y-0.5 hover:bg-primary-hover sm:text-sm">
                                            <ListTodo className="w-4 h-4" /> Open Planner
                                        </Link>
                                        <Link href={`/dashboard/${wedding.id}/wedding-day?from=dashboard`} className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary transition-all hover:-translate-y-0.5 hover:bg-primary hover:text-white sm:text-sm">
                                            <Bell className="w-4 h-4" /> Wedding Day
                                        </Link>
                                        <Link href={`/dashboard/${wedding.id}/thank-you?from=dashboard`} className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white px-4 py-2.5 text-xs font-bold text-primary transition-all hover:-translate-y-0.5 hover:bg-primary hover:text-white sm:text-sm">
                                            <Mail className="w-4 h-4" /> Thank You
                                        </Link>
                                        <button type="button" onClick={() => openExternal(url)} className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-xs font-bold text-text-secondary transition-all hover:-translate-y-0.5 hover:bg-neutral hover:text-foreground sm:text-sm">
                                            <ExternalLink className="w-4 h-4" /> Guest View
                                        </button>
                                    </div>
                                </div>
                            </motion.section>
                        )}

                        {/* Mobile Home Hub / Widgets - Even smaller now */}
                        {activeTab === 'home' && (
                            <div className="grid grid-cols-2 sm:hidden gap-2 mb-4 animate-in fade-in slide-in-from-bottom-2">
                                <Link
                                    href={`/builder?edit=${wedding.id}`}
                                    className="flex flex-col items-center justify-center p-3 bg-white dark:bg-white rounded-3xl border border-border soft-shadow text-center relative overflow-hidden group active:scale-95 transition-transform"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1.5">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground">Edit Page</span>
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-active:opacity-100 transition-opacity" />
                                </Link>
                                <Link
                                    href={`/dashboard/${wedding.id}/planner`}
                                    className="flex flex-col items-center justify-center p-3 bg-white dark:bg-white rounded-3xl border border-border soft-shadow text-center relative overflow-hidden group active:scale-95 transition-transform"
                                >
                                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-1.5">
                                        <ListTodo className="w-4 h-4" />
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground">{hasPlannerPro ? 'Planner' : 'Planner Pro'}</span>
                                    <div className="absolute inset-0 bg-secondary/5 opacity-0 group-active:opacity-100 transition-opacity" />
                                </Link>
                                <button
                                    onClick={() => setActiveTab('guests')}
                                    className="flex flex-col items-center justify-center p-3 bg-white dark:bg-white rounded-3xl border border-border soft-shadow text-center relative overflow-hidden group active:scale-95 transition-transform"
                                >
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-1.5">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground">Guest List</span>
                                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-active:opacity-100 transition-opacity" />
                                </button>
                                <button
                                    onClick={() => setActiveTab('analytics')}
                                    className="flex flex-col items-center justify-center p-3 bg-white dark:bg-white rounded-3xl border border-border soft-shadow text-center relative overflow-hidden group active:scale-95 transition-transform"
                                >
                                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 mb-1.5">
                                        <PieChartIcon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground">Insights</span>
                                    <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-active:opacity-100 transition-opacity" />
                                </button>
                            </div>
                        )}

                        {/* Mobile Home Quick Stats Summary - Even smaller now */}
                        {activeTab === 'home' && (
                            <div className="sm:hidden grid grid-cols-2 gap-2 mb-4">
                                <div className="p-4 rounded-3xl bg-white dark:bg-white border border-border soft-shadow text-center">
                                    <p className="text-[7px] uppercase font-black tracking-widest text-text-secondary/50 mb-0.5">Guests</p>
                                    <p className="text-2xl font-serif font-bold text-primary">{stats.confirmed}</p>
                                    <p className="text-[7px] font-bold text-text-secondary/40 uppercase tracking-widest">Confirmed</p>
                                </div>
                                <div className="p-4 rounded-3xl bg-white dark:bg-white border border-border soft-shadow text-center">
                                    <p className="text-[7px] uppercase font-black tracking-widest text-text-secondary/50 mb-0.5">Budget</p>
                                    <p className="text-2xl font-serif font-bold text-secondary">{stats.budgetPercent}%</p>
                                    <p className="text-[7px] font-bold text-text-secondary/40 uppercase tracking-widest">Utilized</p>
                                </div>
                            </div>
                        )}

                        {/* Full Stats Cards - Mobile: Analytics only, Desktop: All */}
                        {(activeTab === 'analytics' || activeTab === 'home') && (
                            <div className={`${activeTab === 'home' ? 'hidden sm:grid' : 'grid'} grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 animate-in fade-in`}>
                                <div className="group p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-white border border-border soft-shadow text-center hover:border-primary/30 transition-all">
                                    <div className="w-10 h-10 rounded-full bg-primary/5 dark:bg-primary/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <Users className="w-5 h-5 text-primary" />
                                    </div>
                                    <p className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground">{stats.totalGuests}</p>
                                    <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-black text-text-secondary/40">Total Guests</p>
                                </div>
                                <div className="group p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-white border border-border soft-shadow text-center hover:border-green-500/30 transition-all">
                                    <div className="w-10 h-10 rounded-full bg-green-500/5 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    </div>
                                    <p className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground">{stats.confirmed}</p>
                                    <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-black text-text-secondary/40">Confirmed</p>
                                </div>
                                <div className="group p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-white border border-border soft-shadow text-center hover:border-red-400/30 transition-all">
                                    <div className="w-10 h-10 rounded-full bg-red-400/5 dark:bg-red-400/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <X className="w-5 h-5 text-red-400" />
                                    </div>
                                    <p className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground">{stats.declined}</p>
                                    <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-black text-text-secondary/40">Declined</p>
                                </div>
                                <div className="group p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-white border border-border soft-shadow text-center hover:border-amber-500/30 transition-all">
                                    <div className="w-10 h-10 rounded-full bg-amber-500/5 dark:bg-amber-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <AlertCircle className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <p className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground">{stats.pending}</p>
                                    <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-black text-text-secondary/40">Pending</p>
                                </div>
                            </div>
                        )}

                        {/* Budget Visualization - Mobile: Analytics only, Desktop: All */}
                        {(activeTab === 'analytics' || activeTab === 'home') && (
                            <div className={`${activeTab === 'home' ? 'hidden sm:block' : 'block'} p-6 sm:p-10 rounded-3xl bg-white dark:bg-white border border-border soft-shadow animate-in fade-in`}>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground flex items-center gap-3">
                                            <Wallet className="w-6 h-6 text-primary flex-shrink-0" /> Financial Health
                                        </h2>
                                        <p className="text-xs text-text-secondary mt-1">Real-time overview of your wedding investments.</p>
                                    </div>
                                    <div className="text-right bg-neutral/50 dark:bg-neutral/30 px-4 py-2 rounded-2xl border border-border">
                                        <p className="text-[10px] uppercase font-black tracking-widest text-text-secondary/50 mb-1">Total Utilization</p>
                                        <p className="text-2xl font-mono font-black text-primary">{stats.budgetPercent}%</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                                    <div className="relative h-44 min-h-[1px] w-full min-w-[1px]">
                                        <LazyBudgetPieChart
                                            data={budgetData}
                                            colors={COLORS}
                                            currencySymbol={currencySymbol}
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={8}
                                            tooltipRadius={16}
                                        />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-[10px] uppercase font-black tracking-widest text-text-secondary/40">Spent</span>
                                            <span className="text-lg font-black font-mono text-primary">{currencySymbol}{stats.totalSpent.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-2xl bg-neutral/30 dark:bg-neutral/20 border border-border hover:border-primary/20 transition-all group">
                                                <p className="text-[10px] uppercase font-black tracking-widest text-text-secondary/50 mb-2">Total Budget</p>
                                                <p className="text-xl font-mono font-bold text-foreground group-hover:text-primary transition-colors">{currencySymbol}{stats.totalBudget.toLocaleString()}</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-primary/5 dark:bg-primary/20 border-2 border-primary/10 shadow-sm relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-bl-full" />
                                                <p className="text-[10px] uppercase font-black tracking-widest text-primary mb-2">Committed</p>
                                                <p className="text-xl font-mono font-black text-primary">{currencySymbol}{stats.totalSpent.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral/30 dark:bg-neutral/20 border border-border">
                                            <div>
                                                <p className="text-[10px] uppercase font-black tracking-widest text-text-secondary/50 mb-1">Remaining Balance</p>
                                                <p className={`text-xl font-mono font-black ${stats.remainingBudget < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                    {currencySymbol}{stats.remainingBudget.toLocaleString()}
                                                </p>
                                            </div>
                                            <Link href={`/dashboard/${id}/planner?tab=budget`} className="px-6 py-3 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] hover:bg-primary-hover transition-all flex items-center gap-2 shadow-lg">
                                                Details <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Detailed Charts - Mobile: Analytics only, Desktop: All */}
                        {(activeTab === 'analytics' || activeTab === 'home') && (
                            <div className={`${activeTab === 'home' ? 'hidden sm:grid' : 'grid'} grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 animate-in fade-in`}>
                                {/* Attendance Breakdown */}
                                <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-white border border-border soft-shadow">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary/40 mb-8 flex items-center gap-2">
                                        <PieChartIcon className="w-4 h-4 text-primary" /> RSVP Distribution
                                    </h3>
                                    <div className="flex flex-row items-center gap-8">
                                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full relative flex-shrink-0 p-1 bg-neutral/10 dark:bg-neutral/80" style={{
                                            background: stats.total > 0
                                                ? `conic-gradient(#22c55e ${attendPct}%, #ef4444 ${attendPct}% ${attendPct + declinePct}%, #f59e0b ${attendPct + declinePct}% ${attendPct + declinePct + pendingPct}%, #3A2A2D ${attendPct + declinePct + pendingPct}% 100%)`
                                                : '#3A2A2D'
                                        }}>
                                            <div className="absolute inset-2 sm:inset-4 bg-white dark:bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                                                <span className="text-xl sm:text-2xl font-black text-foreground">{stats.total}</span>
                                                <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary/40">Total</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" />
                                                <div>
                                                    <p className="text-xs font-black text-foreground">{stats.confirmed}</p>
                                                    <p className="text-[8px] font-bold uppercase text-text-secondary/50">Confirmed</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm" />
                                                <div>
                                                    <p className="text-xs font-black text-foreground">{stats.declined}</p>
                                                    <p className="text-[8px] font-bold uppercase text-text-secondary/50">Declined</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
                                                <div>
                                                    <p className="text-xs font-black text-foreground">{stats.pending}</p>
                                                    <p className="text-[8px] font-bold uppercase text-text-secondary/50">Pending</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Meal Summary */}
                                <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-white border border-border soft-shadow">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary/40 mb-8 flex items-center gap-2">
                                        <Smartphone className="w-4 h-4 text-secondary" /> Dining Preferences
                                    </h3>
                                    <div className="space-y-4">
                                        {Object.entries(stats.meals).length > 0 ? Object.entries(stats.meals).sort((a, b) => b[1] - a[1]).map(([pref, count]) => (
                                            <div key={pref} className="space-y-1">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                    <span className="text-text-secondary truncate max-w-[150px]">{pref}</span>
                                                    <span className="text-primary">{count} guests</span>
                                                </div>
                                                <div className="h-1.5 bg-neutral/20 dark:bg-neutral/70 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${(count / stats.total) * 100}%` }} />
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 opacity-30">
                                                <Smartphone className="w-8 h-8" />
                                                <p className="text-xs font-bold uppercase tracking-widest italic">Waiting for RSVPs</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Guest List Section - Mobile: guests only, Desktop: All */}
                        {(activeTab === 'guests' || activeTab === 'home') && (
                            <div className={`${activeTab === 'home' ? 'hidden sm:block' : 'block'} animate-in fade-in`}>
                                {/* Song Requests */}
                                {stats.songs.length > 0 && (
                                    <div className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-3xl bg-white border border-border soft-shadow mb-6 sm:mb-8">
                                        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-text-secondary/50 mb-4 sm:mb-6 flex items-center gap-2">
                                            <Music className="w-4 h-4 flex-shrink-0" /> Song Requests ({stats.songs.length})
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                            {stats.songs.map((s, i) => (
                                                <div key={i} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-neutral/50 dark:bg-neutral/30 border border-border/10">
                                                    <span className="text-base sm:text-lg flex-shrink-0">🎵</span>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-xs sm:text-sm line-clamp-1 italic">&quot;{s.song}&quot;</p>
                                                        <p className="text-xs sm:text-xs text-text-secondary/50 line-clamp-1">— {s.name}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="bg-white rounded-xl sm:rounded-3xl border border-border soft-shadow overflow-hidden">
                                    <div className="p-4 sm:p-6 md:p-8 border-b border-border space-y-6">
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground">Guest List ({stats.total})</h3>
                                                <div className="flex flex-wrap gap-2 w-full lg:w-auto mt-2">
                                                    <span className="px-2 py-1.5 rounded-lg bg-neutral text-text-secondary text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">
                                                        {stats.groupedCount} grouped
                                                    </span>
                                                    <span className="px-2 py-1.5 rounded-lg bg-primary/10 text-primary text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">
                                                        {stats.invitedCount} invited
                                                    </span>
                                                    {!hasPlannerPro && (
                                                        <>
                                                            <span className="px-2 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">
                                                                {planUsage.guestEmailCount} / {FREE_PLAN_LIMITS.guestEmails} guest emails
                                                            </span>
                                                            <span className="px-2 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">
                                                                {planUsage.userTriggeredEmailsUsed} / {FREE_PLAN_LIMITS.userTriggeredEmails} sends
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 w-full sm:w-auto overflow-x-auto pb-1 no-scrollbar">
                                            <button onClick={() => setIsAddGuestModalOpen(true)} className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-colors min-h-[44px]">
                                                <Plus className="w-4 h-4 flex-shrink-0" /> <span>Add</span>
                                            </button>
                                            <button onClick={() => setIsImportGuestModalOpen(true)} className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-secondary/10 dark:bg-secondary/20 text-secondary text-xs font-bold hover:bg-secondary/20 transition-colors min-h-[44px]">
                                                <Upload className="w-4 h-4 flex-shrink-0" /> <span>Import</span>
                                            </button>
                                            <button onClick={exportCSV} className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-primary/10 dark:bg-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-colors min-h-[44px] ml-auto">
                                                <Download className="w-4 h-4 flex-shrink-0" /> <span>Export</span>
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-2 sm:gap-3">
                                            <div className="xl:col-span-2 relative">
                                                <Search className="w-4 h-4 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-text-secondary/30 pointer-events-none" />
                                                <input
                                                    placeholder="Search guests..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full pl-14 sm:pl-16 pr-3 sm:pr-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-border focus:border-primary outline-none text-xs sm:text-sm bg-neutral min-h-[44px]"
                                                />
                                            </div>
                                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}
                                                className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-border text-xs sm:text-sm bg-neutral focus:border-primary outline-none min-h-[44px]">
                                                <option value="all">All Status</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="declined">Declined</option>
                                                <option value="pending">Pending</option>
                                            </select>
                                            <select
                                                value={groupFilter}
                                                onChange={(e) => setGroupFilter(e.target.value as 'all' | GuestGroup)}
                                                className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-border text-xs sm:text-sm bg-neutral focus:border-primary outline-none min-h-[44px]"
                                            >
                                                <option value="all">All Groups</option>
                                                {GUEST_GROUP_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs sm:text-sm">
                                            <thead className="bg-neutral text-text-secondary/60 text-[8px] sm:text-[10px] uppercase tracking-widest font-black sticky top-0">
                                                <tr>
                                                    <th className="px-3 sm:px-6 py-2 sm:py-3">Guest</th>
                                                    <th className="px-3 sm:px-6 py-2 sm:py-3">Status</th>
                                                    <th className="px-3 sm:px-6 py-2 sm:py-3 hidden sm:table-cell">Details</th>
                                                    <th className="px-3 sm:px-6 py-2 sm:py-3"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/50">
                                                {filteredRsvps.slice(0, visibleCount).map((rsvp) => (
                                                    <tr key={rsvp.id} className="hover:bg-neutral/30 transition-colors group/row">
                                                        <td className="px-3 sm:px-6 py-3 sm:py-5">
                                                            <div className="flex items-center gap-3 sm:gap-4">
                                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl bg-primary/5 dark:bg-primary/20 flex items-center justify-center text-primary font-black text-[10px] sm:text-xs">
                                                                    {rsvp.guest_name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-foreground text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{rsvp.guest_name}</p>
                                                                    <p className="text-[10px] text-text-secondary/40 truncate italic max-w-[120px] sm:max-w-none">{rsvp.guest_email || 'No email provided'}</p>
                                                                    {rsvp.num_guests > 1 && <span className="text-[7px] bg-primary/5 text-primary px-1.5 py-0.5 rounded font-black mt-1 inline-block uppercase tracking-widest">+{rsvp.num_guests - 1} party</span>}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 sm:px-6 py-3 sm:py-5">
                                                            <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter sm:tracking-widest ${
                                                                (rsvp.rsvp_status === 'confirmed' || rsvp.attendance === 'Yes') ? 'bg-emerald-50 text-emerald-600' :
                                                                (rsvp.rsvp_status === 'declined' || rsvp.attendance === 'No') ? 'bg-red-50 text-red-600' :
                                                                'bg-amber-50 text-amber-600'
                                                            }`}>
                                                                { (rsvp.rsvp_status === 'confirmed' || rsvp.attendance === 'Yes') ? 'YES' :
                                                                  (rsvp.rsvp_status === 'declined' || rsvp.attendance === 'No') ? 'NO' : '?' }
                                                            </span>
                                                        </td>
                                                        <td className="px-3 sm:px-6 py-3 sm:py-5 hidden sm:table-cell">
                                                            <div className="text-[10px] text-text-secondary">
                                                                <p className="font-black uppercase tracking-widest text-[8px] text-text-secondary/60">{getGuestGroupLabel(rsvp.guest_group)}</p>
                                                                <p className="mt-1">{rsvp.table_assignment || 'No Table'}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 sm:px-6 py-3 sm:py-5 text-right">
                                                            <button onClick={() => deleteRsvp(rsvp.id)} className="text-text-secondary/20 hover:text-red-500 transition-colors">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {filteredRsvps.length === 0 && (
                                            <div className="py-20 text-center">
                                                <Search className="w-8 h-8 text-text-secondary/20 mx-auto mb-4" />
                                                <p className="text-sm font-bold text-text-secondary/30 uppercase tracking-[0.2em]">No guests found</p>
                                            </div>
                                        )}
                                    </div>
                                    <div id="guest-list-sentinel" className="h-4" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6 sm:space-y-8">
                        {/* QR & Share Hub */}
                        {(activeTab === 'home') && (
                            <div className="p-6 sm:p-10 rounded-[2.5rem] bg-primary text-white shadow-2xl relative overflow-hidden group animate-in fade-in slide-in-from-right-4">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[80px] -mr-24 -mt-24" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-[60px] -ml-16 -mb-16" />

                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-full flex justify-between items-center mb-8">
                                        <div className="p-3 rounded-2xl bg-white/10 border border-white/20">
                                            <QrCode className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                                            Invite Hub
                                        </div>
                                    </div>

                                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-center mb-2 leading-tight text-white">Digital & <span className="italic text-white underline decoration-white/30 underline-offset-8">Physical</span></h3>
                                    <p className="text-xs text-white/70 text-center mb-10 max-w-[220px]">Scan for the website, print on your invitations, or share via chat.</p>

                                    <div className="w-full space-y-3">
                                        <QrCodeActions
                                            value={qrTrackingUrl}
                                            openUrl={qrTrackingUrl}
                                            title="Wedding Website QR"
                                            description={`Scan this to view ${wedding?.bride_name || 'the couple'} & ${wedding?.groom_name || 'their partner'}'s wedding website.`}
                                            fileName={`wedding-qr-${wedding?.bride_name || 'bride'}-${wedding?.groom_name || 'groom'}.png`.replace(/[^a-z0-9.-]+/gi, '-').toLowerCase()}
                                            previewSize={160}
                                            canvasSize={1024}
                                            fgColor="#D16C78"
                                            level="H"
                                            compact
                                            className="relative group/qr mb-10"
                                            qrClassName="relative mx-auto w-fit rounded-[2.5rem] border-4 border-white/10 bg-white p-8 shadow-2xl transition-transform duration-500 hover:scale-105"
                                            actionsClassName="grid grid-cols-2 gap-3"
                                            onStatus={setQrStatus}
                                        />
                                        {qrStatus && <p className="text-center text-[10px] font-bold leading-5 text-white/65">{qrStatus}</p>}

                                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 text-center sm:hidden">Tip: use Preview, then long press QR code to save to gallery</p>

                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={handleShareWhatsApp}
                                                className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/20 transition-colors group/wa"
                                            >
                                                <MessageCircle className="w-5 h-5 text-white group-hover/wa:scale-110 transition-transform" />
                                                <span className="text-[8px] font-black uppercase tracking-widest text-white/80">WhatsApp</span>
                                            </button>
                                            <button
                                                onClick={handleShareEmail}
                                                className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/20 transition-colors group/email"
                                            >
                                                <Mail className="w-5 h-5 text-white group-hover/email:scale-110 transition-transform" />
                                                <span className="text-[8px] font-black uppercase tracking-widest text-white/80">Email</span>
                                            </button>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-white/10 border border-white/5 flex items-center justify-between group/link">
                                            <p className="text-[10px] font-mono text-white/50 truncate max-w-[120px]">{url}</p>
                                            <CopyButton
                                                text={url}
                                                label="Copy"
                                                variant="minimal"
                                                className="text-white font-black uppercase tracking-widest text-[10px] hover:scale-110 transition-transform"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'home' && (
                            <div className="sm:block hidden">
                                <AnalyticsPanel
                                    weddingId={id}
                                    rsvpCount={stats.total}
                                    pendingGuestCount={stats.pending}
                                    hasPlannerPro={hasPlannerPro}
                                    guestEmailsUsed={planUsage.userTriggeredEmailsUsed}
                                />
                            </div>
                        )}

                        {(activeTab === 'team' || activeTab === 'home') && (
                            <div className={`${activeTab === 'home' ? 'hidden sm:block' : 'block'} animate-in fade-in`}>
                                <CollaboratorsPanel
                                    weddingId={id}
                                    currentUserId={user?.id}
                                    currentUserEmail={user?.email}
                                    canManage={canManageWorkspace}
                                    hasPlannerPro={hasPlannerPro}
                                />
                            </div>
                        )}

                        {(activeTab === 'settings' || activeTab === 'home') && (
                            <div className="space-y-4 sm:space-y-6">
                                <div className="p-4 sm:p-8 rounded-3xl bg-white dark:bg-white border border-border soft-shadow animate-in fade-in">
                                    <h3 className="text-lg sm:text-xl font-serif font-bold mb-4 sm:mb-6 text-foreground border-b border-border pb-4 flex items-center justify-between">
                                        Notifications
                                        {isSavingSettings && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                                    </h3>
                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-neutral/30 dark:bg-neutral/90 border border-border group transition-all hover:border-primary/20">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${wedding?.notify_on_rsvp !== false ? 'bg-primary/10 text-primary' : 'bg-text-secondary/10 text-text-secondary'}`}>
                                                    {wedding?.notify_on_rsvp !== false ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">RSVP Email Alerts</p>
                                                    <p className="text-[10px] text-text-secondary">Get notified instantly when a guest RSVPs.</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleNotification('notify_on_rsvp')}
                                                disabled={isSavingSettings}
                                                role="switch"
                                                aria-checked={wedding?.notify_on_rsvp !== false}
                                                aria-label="Toggle RSVP email alerts"
                                                className={`grid h-9 w-[78px] shrink-0 grid-cols-2 rounded-lg border p-0.5 text-[9px] font-black uppercase tracking-widest transition-colors focus:outline-none focus:ring-4 focus:ring-primary/15 disabled:opacity-60 ${
                                                    wedding?.notify_on_rsvp !== false ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border bg-white text-text-secondary'
                                                }`}
                                            >
                                                <span className={`flex items-center justify-center rounded-md transition ${wedding?.notify_on_rsvp === false ? 'bg-neutral text-foreground shadow-sm' : ''}`}>Off</span>
                                                <span className={`flex items-center justify-center rounded-md transition ${wedding?.notify_on_rsvp !== false ? 'bg-primary text-white shadow-sm' : ''}`}>On</span>
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-neutral/30 dark:bg-neutral/90 border border-border group transition-all hover:border-primary/20">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${wedding?.notify_on_updates !== false ? 'bg-accent/10 text-accent' : 'bg-text-secondary/10 text-text-secondary'}`}>
                                                    <Info className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">System Updates</p>
                                                    <p className="text-[10px] text-text-secondary">Stay updated with new features and app improvements.</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleNotification('notify_on_updates')}
                                                disabled={isSavingSettings}
                                                role="switch"
                                                aria-checked={wedding?.notify_on_updates !== false}
                                                aria-label="Toggle system update notifications"
                                                className={`grid h-9 w-[78px] shrink-0 grid-cols-2 rounded-lg border p-0.5 text-[9px] font-black uppercase tracking-widest transition-colors focus:outline-none focus:ring-4 focus:ring-accent/15 disabled:opacity-60 ${
                                                    wedding?.notify_on_updates !== false ? 'border-accent/40 bg-accent/10 text-accent' : 'border-border bg-white text-text-secondary'
                                                }`}
                                            >
                                                <span className={`flex items-center justify-center rounded-md transition ${wedding?.notify_on_updates === false ? 'bg-neutral text-foreground shadow-sm' : ''}`}>Off</span>
                                                <span className={`flex items-center justify-center rounded-md transition ${wedding?.notify_on_updates !== false ? 'bg-accent text-white shadow-sm' : ''}`}>On</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 sm:p-8 rounded-3xl bg-white dark:bg-white border border-border soft-shadow animate-in fade-in">
                                    <h3 className="text-lg sm:text-xl font-serif font-bold mb-4 sm:mb-6 text-foreground border-b border-border pb-4">Event Details</h3>
                                    <div className="space-y-6">
                                        <div>
                                            <span className="text-text-secondary/40 block text-[8px] uppercase tracking-[0.3em] font-black pb-2">Date & Time</span>
                                            <span className="font-serif italic text-foreground text-sm">{wedding.wedding_date} @ {wedding.wedding_time}</span>
                                        </div>
                                        <div>
                                            <span className="text-text-secondary/40 block text-[8px] uppercase tracking-[0.3em] font-black pb-2">Venue</span>
                                            <span className="font-serif italic text-foreground text-sm line-clamp-1">{wedding.venue_name}</span>
                                        </div>
                                        <div>
                                            <span className="text-text-secondary/40 block text-[8px] uppercase tracking-[0.3em] font-black pb-2">Template</span>
                                            <span className="font-serif italic text-foreground text-sm capitalize">{wedding.template}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Add Guest Modal */}
            {isAddGuestModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-foreground/55 backdrop-blur-sm">
                    <div className="bg-white rounded-lg sm:rounded-[2.5rem] p-4 sm:p-8 md:p-12 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300 relative shadow-2xl">
                        <div className="flex justify-between items-start sm:items-center gap-4 mb-4 sm:mb-8 sticky top-0 bg-white">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-foreground">Add Guest</h2>
                            <button onClick={() => setIsAddGuestModalOpen(false)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral text-text-secondary flex items-center justify-center hover:bg-neutral/80 transition-colors flex-shrink-0 min-h-[44px] min-w-[44px]">
                                <X className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAddManualGuest} className="space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                                <div>
                                    <label className="block text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary mb-2">Guest Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newGuest.guest_name}
                                        onChange={e => setNewGuest({...newGuest, guest_name: e.target.value})}
                                        placeholder="Full name..."
                                        className="w-full bg-neutral border border-border rounded-lg sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-4 outline-none focus:ring-primary/20 text-xs sm:text-base min-h-[44px]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={newGuest.guest_email}
                                        onChange={e => setNewGuest({...newGuest, guest_email: e.target.value})}
                                        placeholder="email@example.com"
                                        className="w-full bg-neutral border border-border rounded-lg sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-4 outline-none focus:ring-primary/20 text-xs sm:text-base min-h-[44px]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                                <div>
                                    <label className="block text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary mb-2">RSVP Status</label>
                                    <select
                                        value={newGuest.rsvp_status}
                                        onChange={e => setNewGuest({...newGuest, rsvp_status: e.target.value as 'pending' | 'confirmed' | 'declined'})}
                                        className="w-full bg-neutral border border-border rounded-lg sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-4 outline-none focus:ring-primary/20 text-xs sm:text-base min-h-[44px]"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="declined">Declined</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary mb-2">Number of Guests</label>
                                    <input
                                        type="number"
                                        min="1"
                                        inputMode="numeric"
                                        placeholder="0"
                                        value={newGuest.num_guests === 0 ? '' : newGuest.num_guests}
                                        onChange={e => setNewGuest({...newGuest, num_guests: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                                        className="w-full bg-neutral border border-border rounded-lg sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-4 outline-none focus:ring-primary/20 font-mono text-xs sm:text-base min-h-[44px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                                <div>
                                    <label className="block text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary mb-2">Guest Group</label>
                                    <select
                                        value={newGuest.guest_group}
                                        onChange={e => setNewGuest({ ...newGuest, guest_group: e.target.value as GuestGroup | '' })}
                                        className="w-full bg-neutral border border-border rounded-lg sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-4 outline-none focus:ring-primary/20 text-xs sm:text-base min-h-[44px]"
                                    >
                                        <option value="">Ungrouped</option>
                                        {GUEST_GROUP_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary mb-2">Table Assignment</label>
                                    <input
                                        type="text"
                                        value={newGuest.table_assignment}
                                        onChange={e => setNewGuest({ ...newGuest, table_assignment: e.target.value })}
                                        placeholder="Table 1, VIP, Garden..."
                                        className="w-full bg-neutral border border-border rounded-lg sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-4 outline-none focus:ring-primary/20 text-xs sm:text-base min-h-[44px]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                                <label className="flex items-center justify-between gap-3 bg-neutral border border-border rounded-lg sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 min-h-[44px]">
                                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-text-secondary">Invitation Sent</span>
                                    <input
                                        type="checkbox"
                                        checked={newGuest.invitation_sent}
                                        onChange={e => setNewGuest({ ...newGuest, invitation_sent: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                </label>
                                <label className="flex items-center justify-between gap-3 bg-neutral border border-border rounded-lg sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 min-h-[44px]">
                                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-text-secondary">Plus-One Allowed</span>
                                    <input
                                        type="checkbox"
                                        checked={newGuest.plus_one_allowed}
                                        onChange={e => setNewGuest({ ...newGuest, plus_one_allowed: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                </label>
                            </div>

                            {newGuest.plus_one_allowed && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                                    <div>
                                        <label className="block text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary mb-2">Plus-One Name</label>
                                        <input
                                            type="text"
                                            value={newGuest.plus_one_name}
                                            onChange={e => setNewGuest({ ...newGuest, plus_one_name: e.target.value })}
                                            placeholder="Guest companion"
                                            className="w-full bg-neutral border border-border rounded-lg sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-4 outline-none focus:ring-primary/20 text-xs sm:text-base min-h-[44px]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary mb-2">Plus-One Email</label>
                                        <input
                                            type="email"
                                            value={newGuest.plus_one_email}
                                            onChange={e => setNewGuest({ ...newGuest, plus_one_email: e.target.value })}
                                            placeholder="optional@email.com"
                                            className="w-full bg-neutral border border-border rounded-lg sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-4 outline-none focus:ring-primary/20 text-xs sm:text-base min-h-[44px]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary mb-2">Plus-One Status</label>
                                        <select
                                            value={newGuest.plus_one_rsvp_status}
                                            onChange={e => setNewGuest({ ...newGuest, plus_one_rsvp_status: e.target.value as PlusOneRsvpStatus })}
                                            className="w-full bg-neutral border border-border rounded-lg sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-4 outline-none focus:ring-primary/20 text-xs sm:text-base min-h-[44px]"
                                        >
                                            <option value="not_invited">Not Invited</option>
                                            <option value="invited">Invited</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="declined">Declined</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="w-full bg-primary text-white rounded-lg sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-5 font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm sm:text-lg mt-2 sm:mt-4 min-h-[44px]">
                                Add to Guest List
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <GuestImportModal
                open={isImportGuestModalOpen}
                onClose={() => setIsImportGuestModalOpen(false)}
                onImport={handleImportGuests}
            />
        </div>
    );
}
