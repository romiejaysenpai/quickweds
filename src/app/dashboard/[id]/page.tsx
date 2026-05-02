'use client';

import { useSearchParams } from 'next/navigation';
import { Heart, Users, Share2, ExternalLink, Calendar, CheckCircle2, Loader2, Download, Search, Trash2, Copy, MessageCircle, Mail, X, Music, Baby, AlertCircle, ListTodo, Wallet, Plus, Coins, ArrowRight, ShieldCheck, Upload, ChevronDown, Sparkles, LayoutDashboard, PieChartIcon, Settings, Smartphone, Printer, QrCode, LogOut } from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useEffect, useState, use, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getWeddingCollaboratorAccess, trackWeddingEvent } from '@/lib/wedding-features';
import AnalyticsPanel from '@/components/dashboard/AnalyticsPanel';
import CollaboratorsPanel from '@/components/dashboard/CollaboratorsPanel';
import GuestImportModal from '@/components/dashboard/GuestImportModal';
import ConfettiCelebration from '@/components/ConfettiCelebration';
import CopyButton from '@/components/CopyButton';
import DarkModeToggle from '@/components/DarkModeToggle';
import UpgradeButton from '@/components/UpgradeButton';
import { getClientAccountProfile, getRoleAwareRedirect } from '@/lib/account';
import { copyToClipboard } from '@/lib/client-clipboard';
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

async function copyText(text: string) {
    await copyToClipboard(text);
}

function openExternal(url: string) {
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
        window.location.href = url;
    }
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
    const [rsvps, setRsvps] = useState<EnhancedRSVP[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [budgets, setBudgets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [accessRole, setAccessRole] = useState<'owner' | 'partner' | 'coordinator' | 'pending' | 'denied'>('denied');
    const [accessDebug, setAccessDebug] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'declined' | 'pending'>('all');
    const [groupFilter, setGroupFilter] = useState<'all' | GuestGroup>('all');
    const [invitationFilter, setInvitationFilter] = useState<'all' | 'sent' | 'not_sent'>('all');
    const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
    const [isImportGuestModalOpen, setIsImportGuestModalOpen] = useState(false);
    const [importingGuests, setImportingGuests] = useState(false);
    const [newGuest, setNewGuest] = useState<GuestFormState>(emptyGuestForm);
    const [copyToast, setCopyToast] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [checkingRole, setCheckingRole] = useState(true);

    // Download QR Code function
    const downloadQRCode = () => {
        const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
        if (!canvas) return;
        
        const pngUrl = canvas
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream");
        
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `wedding-qr-${wedding?.bride_name}-${wedding?.groom_name}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    // Share QR Code function (for mobile)
    const shareQRCode = async () => {
        const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
        if (!canvas) return;

        try {
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
            if (!blob) return downloadQRCode();

            const file = new File([blob], 'wedding-qr.png', { type: 'image/png' });
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Wedding QR Code',
                    text: `Scan this to view ${wedding?.bride_name} & ${wedding?.groom_name}'s wedding website!`
                });
            } else {
                downloadQRCode();
            }
        } catch (err) {
            console.error('Error sharing:', err);
            downloadQRCode();
        }
    };

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
                const { data: sessionData } = await supabase.auth.getSession();
                const token = sessionData.session?.access_token;

                if (!token) {
                    router.push('/login');
                    return;
                }

                if (!isAdmin) {
                    const accountProfile = await getClientAccountProfile(token);
                    if (accountProfile?.account_type !== 'couple') {
                        router.replace(getRoleAwareRedirect(accountProfile?.account_type, `/dashboard/${id}`));
                        return;
                    }
                }

                setCheckingRole(false);

                const { data: weddingData, error: weddingError } = await supabase
                    .from('weddings')
                    .select('*')
                    .eq('id', id)
                    .is('deleted_at', null)
                    .single();

                if (weddingError || !weddingData) {
                    setLoading(false);
                    return;
                }

                // Deterministic access check — no timing issues
                let role: 'owner' | 'partner' | 'coordinator' | 'pending' | 'denied';
                if (weddingData.user_id === user.id) {
                    role = 'owner';
                } else if (isAdmin) {
                    // Admins automatically get owner access
                    role = 'owner';
                    setAccessDebug(`Admin override — isAdmin=${isAdmin}, user=${user.email}`);
                } else {
                    const collaboratorAccess = await getWeddingCollaboratorAccess(id, user.email);
                    if (!collaboratorAccess) {
                        role = 'denied';
                    } else {
                        role = collaboratorAccess.status === 'accepted' ? collaboratorAccess.role : 'pending';
                        if (collaboratorAccess.status !== 'accepted') {
                            setAccessRole(role);
                            setLoading(false);
                            return;
                        }
                    }
                }

                setAccessRole(role);
                setWedding(weddingData);

                if (role !== 'owner') {
                    setLoading(false);
                    return;
                }

                if (role !== 'owner') {
                    setLoading(false);
                    return;
                }

                const [rsvpsRes, vendorsRes, budgetsRes] = await Promise.all([
                    supabase.from('rsvps').select('*').eq('wedding_id', id).order('created_at', { ascending: false }),
                    supabase.from('planner_vendors').select('*').eq('wedding_id', id),
                    supabase.from('planner_budgets').select('*').eq('wedding_id', id),
                ]);

                if (rsvpsRes.data) setRsvps(rsvpsRes.data);
                if (vendorsRes.data) setVendors(vendorsRes.data);
                if (budgetsRes.data) setBudgets(budgetsRes.data);
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
            confirmed: confirmed.length, 
            declined: declined.length, 
            pending: pending.length,
            totalGuests, 
            totalChildren, 
            invitedCount,
            seatedCount,
            groupedCount,
            meals, 
            groups,
            songs, 
            total: rsvps.length,
            totalBudget,
            totalSpent: totalCommitted, // Using Committed as "Spent" for the dashboard overview
            remainingBudget,
            budgetPercent,
            totalEst,
            totalSpentFromVendors
        };
    }, [rsvps, vendors, wedding, budgets]);

    // Filtered list
    const filteredRsvps = useMemo(() => {
        return rsvps.filter(r => {
            const normalizedQuery = searchQuery.toLowerCase();
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
    }, [rsvps, searchQuery, filterStatus, groupFilter, invitationFilter]);

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
    }, [searchQuery, filterStatus, groupFilter, invitationFilter, filteredRsvps.length]);

    const [activeTab, setActiveTab] = useState<'home' | 'guests' | 'analytics' | 'team' | 'settings'>('home');

    // CSV Export
    const exportCSV = () => {
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
    const deleteRsvp = async (rsvpId: string) => {
        if (!confirm('Remove this guest from the list?')) return;
        await supabase.from('rsvps').delete().eq('id', rsvpId);
        setRsvps(prev => prev.filter(r => r.id !== rsvpId));
    };

    const updateRsvp = async (rsvpId: string, patch: Partial<EnhancedRSVP>) => {
        const normalizedPatch: Record<string, unknown> = { ...patch };
        if (Object.prototype.hasOwnProperty.call(patch, 'invitation_sent')) {
            normalizedPatch.invitation_sent_at = patch.invitation_sent ? new Date().toISOString() : null;
        }

        const { data, error } = await supabase.from('rsvps').update(normalizedPatch).eq('id', rsvpId).select().single();
        if (error) {
            alert(`Error updating guest: ${error.message}`);
            return;
        }

        setRsvps((prev) => prev.map((rsvp) => (rsvp.id === rsvpId ? data : rsvp)));
    };

    const handleAddManualGuest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGuest.guest_name) return;
        
        const { data, error } = await supabase.from('rsvps').insert({
            wedding_id: id,
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
        }).select().single();

        if (error) {
            alert("Error adding guest: " + error.message);
        } else {
            setRsvps([data, ...rsvps]);
            setNewGuest(emptyGuestForm);
            setIsAddGuestModalOpen(false);
        }
    };

    const handleImportGuests = async (rows: ImportedGuestRow[]) => {
        setImportingGuests(true);
        const payload = rows.map((row) => ({
            ...row,
            wedding_id: id,
        }));

        const { data, error } = await supabase.from('rsvps').insert(payload).select('*');
        setImportingGuests(false);

        if (error) {
            throw new Error(`${error.message}. Apply supabase-guest-list-enhancements.sql before using the new guest management fields.`);
        }

        setRsvps((prev) => [...(data || []), ...prev]);
    };

    // Copy & Share
    const domain = wedding?.custom_domain ? `https://${wedding.custom_domain}` : (process.env.NEXT_PUBLIC_APP_URL || 'https://quickweds.site');
    const url = wedding?.custom_domain ? domain : (wedding ? `${domain}/w/${wedding.id}` : '');
    const qrTrackingUrl = `${url}${url.includes('?') ? '&' : '?'}src=qr`;
    const canManageWorkspace = accessRole === 'owner' || accessRole === 'partner';
    const hasPlannerPro = isAdmin || Boolean(wedding?.is_premium);

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
            <div className="bg-white/80 dark:bg-neutral-900/80 border-b border-border px-3 py-3 sm:p-4 sticky top-0 z-50 backdrop-blur-md">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 sm:gap-3 sm:px-4">
                    <Link href="/" className="flex min-w-[96px] flex-shrink-0 items-center" aria-label="QuickWeds">
                        <img src="/logo.png" alt="QuickWeds Logo" className="h-8 sm:h-10 w-auto object-contain hover:scale-105 transition-transform" />
                    </Link>
                    <div className="flex min-w-0 flex-1 items-center justify-end gap-2 overflow-x-auto pb-1 pl-2 sm:w-auto sm:flex-none sm:overflow-visible sm:pb-0 sm:pl-0 sm:gap-3">
                        {canManageWorkspace && (
                            <Link href={`/builder?edit=${wedding.id}`} className="flex min-h-[44px] flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white shadow-lg shadow-primary/10 transition-all hover:bg-primary-hover sm:rounded-xl sm:px-6 sm:text-sm">
                                Edit Design
                            </Link>
                        )}
                        <Link href={`/dashboard/${wedding.id}/planner`} className={`flex min-h-[44px] flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold shadow-lg transition-all sm:rounded-xl sm:px-6 sm:text-sm ${hasPlannerPro ? 'bg-secondary text-white shadow-secondary/10 hover:opacity-90' : 'bg-white text-primary border border-primary/20 shadow-primary/10 hover:bg-primary/5'}`}>
                            <ListTodo className="w-4 h-4 flex-shrink-0" /> <span className="hidden sm:inline">{hasPlannerPro ? 'Planner' : 'Planner Pro'}</span>
                        </Link>
                        <Link href={url} target="_blank" className="flex min-h-[44px] flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-border bg-neutral px-3 py-2 text-xs font-bold text-primary transition-all hover:border-primary/30 dark:bg-neutral/30 sm:rounded-xl sm:px-6 sm:text-sm">
                            View <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        </Link>
                        {/* Dark Mode Toggle */}
                        <DarkModeToggle variant="minimal" />
                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="inline-flex min-h-[44px] min-w-[44px] flex-shrink-0 items-center justify-center rounded-lg border border-border bg-white px-3 text-text-secondary transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-60 sm:rounded-xl sm:px-4"
                            aria-label="Log out"
                            title="Log out"
                        >
                            {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                            <span className="ml-2 hidden text-xs font-bold md:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-3 sm:px-6 pt-4 sm:pt-12 text-left">
                {/* Mobile Tab Navigation (Fixed Bottom) */}
                <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-t border-border z-[100] flex justify-around items-center p-2 pb-safe shadow-2xl">
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

                {/* Mobile View Switching Header */}
                <div className="sm:hidden mb-6 flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-foreground">
                            {activeTab === 'home' ? 'Dashboard' : activeTab === 'guests' ? 'Guest List' : activeTab === 'analytics' ? 'Insights' : activeTab === 'team' ? 'Collaborators' : 'Settings'}
                        </h2>
                        <p className="text-[10px] font-bold text-text-secondary/50 uppercase tracking-widest">
                            {wedding.bride_name} & {wedding.groom_name}
                        </p>
                    </div>
                    {activeTab !== 'home' && (
                        <button onClick={() => setActiveTab('home')} className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-1">
                            Overview <ArrowRight className="w-3 h-3" />
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
                    <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                        
                        {/* Mobile Home Hub / Widgets */}
                        {activeTab === 'home' && (
                            <div className="grid grid-cols-2 sm:hidden gap-3 mb-2 animate-in fade-in slide-in-from-bottom-2">
                                <Link 
                                    href={`/builder?edit=${wedding.id}`}
                                    className="flex flex-col items-center justify-center p-6 bg-white dark:bg-neutral-800 rounded-3xl border border-border soft-shadow text-center relative overflow-hidden group active:scale-95 transition-transform"
                                >
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Edit Page</span>
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-active:opacity-100 transition-opacity" />
                                </Link>
                                <Link 
                                    href={`/dashboard/${wedding.id}/planner`}
                                    className="flex flex-col items-center justify-center p-6 bg-white dark:bg-neutral-800 rounded-3xl border border-border soft-shadow text-center relative overflow-hidden group active:scale-95 transition-transform"
                                >
                                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-3">
                                        <ListTodo className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">{hasPlannerPro ? 'Planner' : 'Planner Pro'}</span>
                                    <div className="absolute inset-0 bg-secondary/5 opacity-0 group-active:opacity-100 transition-opacity" />
                                </Link>
                                <button 
                                    onClick={() => setActiveTab('guests')}
                                    className="flex flex-col items-center justify-center p-6 bg-white dark:bg-neutral-800 rounded-3xl border border-border soft-shadow text-center relative overflow-hidden group active:scale-95 transition-transform"
                                >
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-3">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Guest List</span>
                                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-active:opacity-100 transition-opacity" />
                                </button>
                                <button 
                                    onClick={() => setActiveTab('analytics')}
                                    className="flex flex-col items-center justify-center p-6 bg-white dark:bg-neutral-800 rounded-3xl border border-border soft-shadow text-center relative overflow-hidden group active:scale-95 transition-transform"
                                >
                                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 mb-3">
                                        <PieChartIcon className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Insights</span>
                                    <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-active:opacity-100 transition-opacity" />
                                </button>
                            </div>
                        )}

                        {created && activeTab === 'home' && (
                            <div className="mb-8 p-4 rounded-xl bg-success-bg border border-border flex flex-row items-center gap-4 relative overflow-hidden sm:hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 pointer-events-none" />
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center text-accent shadow-sm flex-shrink-0 relative">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div className="relative">
                                    <h2 className="text-sm font-serif font-bold text-primary">Invitation is live! 🎉</h2>
                                    <p className="text-[10px] text-text-secondary">Ready to share your special URL.</p>
                                </div>
                            </div>
                        )}

                        {/* Desktop Only / Mobile Home Hero */}
                        {(activeTab === 'home') && (
                            <div className="hidden sm:flex p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 border border-primary/20 flex-col md:flex-row items-start md:items-center justify-between gap-6 group soft-shadow relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/5 dark:bg-black/5 pointer-events-none" />
                                
                                <div className="relative z-10 space-y-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                        <Sparkles className="w-3 h-3" /> Planner Pro
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground mb-2 leading-tight">
                                        Smart Wedding <span className="italic text-primary">Planner</span>
                                    </h2>
                                    <p className="text-sm sm:text-base text-text-secondary max-w-md">
                                        {hasPlannerPro
                                            ? 'Track budgets, vendors, seating, tasks, collaborators, and post-wedding details in one workspace.'
                                            : 'Your website builder is free. Unlock Planner Pro once for budgets, vendors, seating, tasks, collaborators, and thank-you tools.'}
                                    </p>
                                </div>
                                
                                {hasPlannerPro ? (
                                    <Link href={`/dashboard/${wedding.id}/planner`} className="relative z-10 shrink-0 px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                                        Open Planner <ArrowRight className="w-5 h-5" />
                                    </Link>
                                ) : (
                                    <UpgradeButton weddingId={wedding.id} className="relative z-10 shrink-0 justify-center px-8 py-4 rounded-2xl text-sm uppercase tracking-widest" />
                                )}
                            </div>
                        )}

                        {/* Mobile Home Quick Stats Summary */}
                        {activeTab === 'home' && (
                            <div className="sm:hidden grid grid-cols-2 gap-3 mb-6">
                                <div className="p-5 rounded-[2rem] bg-white dark:bg-neutral-800 border border-border soft-shadow">
                                    <p className="text-[8px] uppercase font-black tracking-widest text-text-secondary/50 mb-1">Guests</p>
                                    <p className="text-3xl font-serif font-bold text-primary">{stats.confirmed}</p>
                                    <p className="text-[8px] font-bold text-text-secondary/40 mt-1 uppercase tracking-widest">Confirmed</p>
                                </div>
                                <div className="p-5 rounded-[2rem] bg-white dark:bg-neutral-800 border border-border soft-shadow">
                                    <p className="text-[8px] uppercase font-black tracking-widest text-text-secondary/50 mb-1">Budget</p>
                                    <p className="text-3xl font-serif font-bold text-secondary">{stats.budgetPercent}%</p>
                                    <p className="text-[8px] font-bold text-text-secondary/40 mt-1 uppercase tracking-widest">Utilized</p>
                                </div>
                            </div>
                        )}

                        {/* Full Stats Cards - Mobile: Analytics only, Desktop: All */}
                        {(activeTab === 'analytics' || activeTab === 'home') && (
                            <div className={`${activeTab === 'home' ? 'hidden sm:grid' : 'grid'} grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 animate-in fade-in`}>
                                <div className="group p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-neutral-800 border border-border soft-shadow text-center hover:border-primary/30 transition-all">
                                    <div className="w-10 h-10 rounded-full bg-primary/5 dark:bg-primary/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <Users className="w-5 h-5 text-primary" />
                                    </div>
                                    <p className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground">{stats.totalGuests}</p>
                                    <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-black text-text-secondary/40">Total Guests</p>
                                </div>
                                <div className="group p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-neutral-800 border border-border soft-shadow text-center hover:border-green-500/30 transition-all">
                                    <div className="w-10 h-10 rounded-full bg-green-500/5 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    </div>
                                    <p className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground">{stats.confirmed}</p>
                                    <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-black text-text-secondary/40">Confirmed</p>
                                </div>
                                <div className="group p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-neutral-800 border border-border soft-shadow text-center hover:border-red-400/30 transition-all">
                                    <div className="w-10 h-10 rounded-full bg-red-400/5 dark:bg-red-400/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <X className="w-5 h-5 text-red-400" />
                                    </div>
                                    <p className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground">{stats.declined}</p>
                                    <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-black text-text-secondary/40">Declined</p>
                                </div>
                                <div className="group p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-neutral-800 border border-border soft-shadow text-center hover:border-amber-500/30 transition-all">
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
                            <div className={`${activeTab === 'home' ? 'hidden sm:block' : 'block'} p-6 sm:p-10 rounded-3xl bg-white dark:bg-neutral-800 border border-border soft-shadow animate-in fade-in`}>
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
                                    <div className="h-44 relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={budgetData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={70}
                                                    paddingAngle={8}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {budgetData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="outline-none" />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                    formatter={(value: any) => [`${currencySymbol}${Number(value || 0).toLocaleString()}`, 'Amount']} 
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
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
                                            <Link href={`/dashboard/${id}/planner?tab=budget`} className="px-6 py-3 rounded-xl bg-neutral-900 text-white font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all flex items-center gap-2 shadow-lg">
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
                                <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-neutral-800 border border-border soft-shadow">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary/40 mb-8 flex items-center gap-2">
                                        <PieChartIcon className="w-4 h-4 text-primary" /> RSVP Distribution
                                    </h3>
                                    <div className="flex flex-row items-center gap-8">
                                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full relative flex-shrink-0 p-1 bg-neutral/10 dark:bg-neutral/80" style={{
                                            background: stats.total > 0
                                                ? `conic-gradient(#22c55e ${attendPct}%, #ef4444 ${attendPct}% ${attendPct + declinePct}%, #f59e0b ${attendPct + declinePct}% ${attendPct + declinePct + pendingPct}%, #3A2A2D ${attendPct + declinePct + pendingPct}% 100%)`
                                                : '#3A2A2D'
                                        }}>
                                            <div className="absolute inset-2 sm:inset-4 bg-white dark:bg-neutral-800 rounded-full flex flex-col items-center justify-center shadow-inner">
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
                                <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-neutral-800 border border-border soft-shadow">
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

                                    <div className="relative group/qr mb-10">
                                        <div className="absolute -inset-4 bg-white rounded-[3rem] blur-xl opacity-20 group-hover/qr:opacity-40 transition-opacity duration-700" />
                                        <div className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl hover:scale-105 transition-transform duration-500 cursor-pointer overflow-hidden border-4 border-white/10">
                                            <div className="absolute inset-0 bg-primary/90 opacity-0 group-hover/qr:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-6 text-center">
                                                <Smartphone className="w-10 h-10 mb-3 animate-bounce" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Scan to Preview</p>
                                            </div>
                                            
                                            <QRCodeSVG 
                                                value={qrTrackingUrl} 
                                                size={160} 
                                                fgColor="#D16C78" 
                                                level="H"
                                                includeMargin={false}
                                                className="w-full h-auto"
                                            />
                                            <div className="hidden">
                                                <QRCodeCanvas 
                                                    id="qr-canvas"
                                                    value={qrTrackingUrl} 
                                                    size={1024} 
                                                    level="H"
                                                    fgColor="#D16C78"
                                                    includeMargin={true}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <button 
                                                onClick={downloadQRCode}
                                                className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-white text-primary font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-neutral-50 active:scale-95 transition-all group/btn"
                                            >
                                                <Download className="w-4 h-4 group-hover/btn:translate-y-0.5 transition-transform" /> Download PNG
                                            </button>
                                            <button 
                                                onClick={shareQRCode}
                                                className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 font-black uppercase tracking-widest text-[10px] hover:bg-white/30 active:scale-95 transition-all group/share"
                                            >
                                                <Share2 className="w-4 h-4 group-hover/share:scale-110 transition-transform" /> Share Image
                                            </button>
                                        </div>
                                        
                                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 text-center sm:hidden">Tip: Long press QR code to save to gallery</p>
                                        
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
                                />
                            </div>
                        )}

                        {(activeTab === 'settings' || activeTab === 'home') && (
                            <div className={`${activeTab === 'home' ? 'hidden sm:block' : 'block'} p-4 sm:p-8 rounded-3xl bg-white dark:bg-neutral-800 border border-border soft-shadow animate-in fade-in`}>
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
                        )}
                    </div>
                </div>
            </main>

            {/* Add Guest Modal */}
            {isAddGuestModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
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
                                        value={newGuest.num_guests}
                                        onChange={e => setNewGuest({...newGuest, num_guests: parseInt(e.target.value) || 1})}
                                        className="w-full bg-neutral border border-border rounded-lg sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-4 outline-none focus:ring-primary/20 font-mono text-xs sm:text-base min-h-[44px]"
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
