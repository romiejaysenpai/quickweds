'use client';

import { useSearchParams } from 'next/navigation';
import { Heart, Users, Share2, ExternalLink, Calendar, CheckCircle2, Loader2, Download, Search, Trash2, Copy, MessageCircle, Mail, X, Music, Baby, Globe, AlertCircle, ListTodo, Wallet, Plus, Coins, ArrowRight, ShieldCheck, Upload, ChevronDown, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useEffect, useState, use, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getWeddingCollaboratorAccess, trackWeddingEvent } from '@/lib/wedding-features';
import AnalyticsPanel from '@/components/dashboard/AnalyticsPanel';
import CollaboratorsPanel from '@/components/dashboard/CollaboratorsPanel';
import GuestImportModal from '@/components/dashboard/GuestImportModal';
import ConfettiCelebration from '@/components/ConfettiCelebration';
import CopyButton from '@/components/CopyButton';
import DarkModeToggle from '@/components/DarkModeToggle';
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
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
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
    const { user, loading: authLoading } = useAuth();
    const created = searchParams?.get('created');

    const [wedding, setWedding] = useState<any>(null);
    const [rsvps, setRsvps] = useState<EnhancedRSVP[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [budgets, setBudgets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [accessRole, setAccessRole] = useState<'owner' | 'partner' | 'coordinator' | 'pending' | 'denied'>('denied');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'declined' | 'pending'>('all');
    const [groupFilter, setGroupFilter] = useState<'all' | GuestGroup>('all');
    const [invitationFilter, setInvitationFilter] = useState<'all' | 'sent' | 'not_sent'>('all');
    const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
    const [isImportGuestModalOpen, setIsImportGuestModalOpen] = useState(false);
    const [importingGuests, setImportingGuests] = useState(false);
    const [newGuest, setNewGuest] = useState<GuestFormState>(emptyGuestForm);
    const [copyToast, setCopyToast] = useState(false);

    const [domainInput, setDomainInput] = useState('');
    const [domainStatus, setDomainStatus] = useState<any>(null);
    const [domainLoading, setDomainLoading] = useState(false);

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

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (!user) return;

        const fetchData = async () => {
            try {
                const { data: weddingData, error: weddingError } = await supabase
                    .from('weddings')
                    .select('*')
                    .eq('id', id)
                    .is('deleted_at', null)
                    .single();

                if (weddingError || !weddingData) { setLoading(false); return; }
                if (weddingData.user_id === user.id) {
                    setAccessRole('owner');
                } else {
                    const collaboratorAccess = await getWeddingCollaboratorAccess(id, user.email);
                    if (!collaboratorAccess) {
                        setAccessRole('denied');
                        setLoading(false);
                        return;
                    }

                    setAccessRole(collaboratorAccess.status === 'accepted' ? collaboratorAccess.role : 'pending');
                    if (collaboratorAccess.status !== 'accepted') {
                        setLoading(false);
                        return;
                    }
                }

                setWedding(weddingData);

                const { data: rsvpsData, error: rsvpsError } = await supabase
                    .from('rsvps').select('*').eq('wedding_id', id).order('created_at', { ascending: false });
                if (rsvpsError) {
                    console.error("Error fetching RSVPs:", rsvpsError);
                }
                setRsvps(rsvpsData || []);

                const { data: vendorsData } = await supabase
                    .from('planner_vendors').select('*').eq('wedding_id', id);
                setVendors(vendorsData || []);

                const { data: budgetsData } = await supabase
                    .from('planner_budgets').select('*').eq('wedding_id', id);
                setBudgets(budgetsData || []);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchData();
    }, [id, user, authLoading, router]);

    const getAccessToken = async () => {
        const { data } = await supabase.auth.getSession();
        return data.session?.access_token || null;
    };

    const checkDomainStatus = async (domain: string) => {
        try {
            const token = await getAccessToken();
            if (!token) return;

            const res = await fetch(`/api/domains?domain=${encodeURIComponent(domain)}&weddingId=${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            setDomainStatus(data);
        } catch (e) { }
    }

    useEffect(() => {
        if (wedding?.custom_domain) {
            checkDomainStatus(wedding.custom_domain);
        }
    }, [wedding?.custom_domain]);

    const handleAddDomain = async () => {
        if (!domainInput.includes('.')) return alert("Please enter a valid domain (e.g. yourname.com)");
        setDomainLoading(true);
        try {
            const token = await getAccessToken();
            if (!token) throw new Error('Please login again and retry.');

            const res = await fetch('/api/domains', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ domain: domainInput.toLowerCase().trim(), weddingId: id })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            await supabase.from('weddings').update({ custom_domain: domainInput.toLowerCase().trim() }).eq('id', wedding.id);
            setWedding({ ...wedding, custom_domain: domainInput.toLowerCase().trim() });
            setDomainInput('');
            checkDomainStatus(domainInput.toLowerCase().trim());
        } catch (e: any) {
            alert(e.message);
        } finally {
            setDomainLoading(false);
        }
    };

    const handleRemoveDomain = async () => {
        if (!confirm('Are you sure you want to decouple this custom domain?')) return;
        setDomainLoading(true);
        try {
            const token = await getAccessToken();
            if (!token) throw new Error('Please login again and retry.');

            const response = await fetch(`/api/domains?domain=${encodeURIComponent(wedding.custom_domain)}&weddingId=${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            await supabase.from('weddings').update({ custom_domain: null }).eq('id', wedding.id);
            setWedding({ ...wedding, custom_domain: null });
            setDomainStatus(null);
        } catch (e: any) {
            alert(e?.message || "Failed to remove domain");
        } finally {
            setDomainLoading(false);
        }
    }

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

    const copyLink = () => {
        void copyText(url);
        void trackWeddingEvent(id, 'share_copy', { source: 'dashboard' });
        setCopyToast(true);
        setTimeout(() => setCopyToast(false), 2000);
    };

    const handleShareWhatsApp = () => {
        void trackWeddingEvent(id, 'share_whatsapp', { source: 'dashboard' });
        openExternal(`https://wa.me/?text=${encodeURIComponent(`You're invited to our wedding!\n${url}`)}`);
    };

    const handleShareEmail = () => {
        void trackWeddingEvent(id, 'share_email', { source: 'dashboard' });
        openExternal(`mailto:?subject=${encodeURIComponent(`You're Invited!`)}&body=${encodeURIComponent(`We'd love for you to join us!\n\n${url}`)}`);
    };

    if (loading) {
        return <div className="mobile-safe-screen flex items-center justify-center bg-neutral/30"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>;
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
            {/* Confetti Celebration */}
            <ConfettiCelebration trigger={showConfetti} />

            {/* Header */}
            <div className="bg-white/80 dark:bg-white/90 border-b border-border p-4 sticky top-0 z-50 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-3 sm:px-4 flex justify-between items-center gap-2 sm:gap-3">
                    <Link href="/" className="flex items-center flex-shrink-0">
                        <img src="/logo.png" alt="QuickWeds Logo" className="h-8 sm:h-10 w-auto object-contain hover:scale-105 transition-transform" />
                    </Link>
                    <div className="flex gap-2 sm:gap-3 items-center">
                        {canManageWorkspace && (
                            <Link href={`/builder?edit=${wedding.id}`} className="flex items-center gap-2 px-3 sm:px-6 py-2 rounded-lg sm:rounded-xl bg-primary text-white text-xs sm:text-sm font-bold shadow-lg shadow-primary/10 hover:bg-primary-hover transition-all min-h-[44px] whitespace-nowrap">
                                Edit Design
                            </Link>
                        )}
                        <Link href={`/dashboard/${wedding.id}/planner`} className="flex items-center gap-2 px-3 sm:px-6 py-2 rounded-lg sm:rounded-xl bg-secondary text-white text-xs sm:text-sm font-bold shadow-lg shadow-secondary/10 hover:opacity-90 transition-all min-h-[44px]">
                            <ListTodo className="w-4 h-4 flex-shrink-0" /> <span className="hidden sm:inline">Planner</span>
                        </Link>
                        <Link href={url} target="_blank" className="flex items-center gap-2 px-3 sm:px-6 py-2 rounded-lg sm:rounded-xl bg-neutral dark:bg-neutral/30 text-primary text-xs sm:text-sm font-bold border border-border hover:border-primary/30 transition-all min-h-[44px]">
                            View <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        </Link>
                        {/* Dark Mode Toggle */}
                        <DarkModeToggle variant="minimal" />
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-3 sm:px-6 pt-6 sm:pt-12 text-left">
                {created && (
                    <div className="mb-8 sm:mb-12 p-4 sm:p-8 rounded-xl sm:rounded-3xl bg-success-bg border border-border flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 pointer-events-none" />
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center text-accent shadow-sm flex-shrink-0 relative">
                            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <div className="relative">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-primary mb-1">Your invitation is live! 🎉</h2>
                            <p className="text-xs sm:text-sm text-text-secondary">Share your special URL below or use the QR code for your physical invitations.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
                    <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                        {/* Planner Promo Card */}
                        <div className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 border border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-6 group soft-shadow relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/5 dark:bg-black/5 pointer-events-none" />
                            <div className="relative">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-foreground mb-1 sm:mb-2 flex items-center gap-2">
                                    <ListTodo className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" /> Smart Wedding Planner
                                </h2>
                                <p className="text-xs sm:text-sm text-text-secondary">Keep everything on track with our new Checklist, Budget Tracker, and Vendor Rolodex.</p>
                            </div>
                            <Link href={`/dashboard/${wedding.id}/planner`} className="relative shrink-0 px-4 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-lg sm:rounded-2xl font-bold shadow-xl shadow-primary/20 group-hover:scale-105 transition-transform flex items-center gap-2 min-h-[44px] text-sm sm:text-base">
                                Open Planner
                            </Link>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                            <div className="p-3 sm:p-6 rounded-lg sm:rounded-2xl bg-white border border-border soft-shadow text-center">
                                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-1 sm:mb-2" />
                                <p className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-foreground">{stats.totalGuests}</p>
                                <p className="text-[8px] sm:text-[10px] uppercase tracking-widest font-bold text-text-secondary/50">Confirmed Guests</p>
                            </div>
                            <div className="p-3 sm:p-6 rounded-lg sm:rounded-2xl bg-white border border-border soft-shadow text-center">
                                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mx-auto mb-1 sm:mb-2" />
                                <p className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-foreground">{stats.confirmed}</p>
                                <p className="text-[8px] sm:text-[10px] uppercase tracking-widest font-bold text-text-secondary/50">Confirmed</p>
                            </div>
                            <div className="p-3 sm:p-6 rounded-lg sm:rounded-2xl bg-white border border-border soft-shadow text-center">
                                <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 mx-auto mb-1 sm:mb-2" />
                                <p className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-foreground">{stats.declined}</p>
                                <p className="text-[8px] sm:text-[10px] uppercase tracking-widest font-bold text-text-secondary/50">Declined</p>
                            </div>
                            <div className="p-3 sm:p-6 rounded-lg sm:rounded-2xl bg-white border border-border soft-shadow text-center">
                                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 mx-auto mb-1 sm:mb-2" />
                                <p className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-foreground">{stats.pending}</p>
                                <p className="text-[8px] sm:text-[10px] uppercase tracking-widest font-bold text-text-secondary/50">Pending</p>
                            </div>
                        </div>

                        {/* Budget Visualization */}
                        <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-3xl bg-white border border-border soft-shadow">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-serif font-bold text-foreground flex items-center gap-2">
                                    <Wallet className="w-5 h-5 text-primary flex-shrink-0" /> Budget Overview
                                </h2>
                                <div className="text-right">
                                    <p className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1">Utilization</p>
                                    <p className="text-lg sm:text-xl md:text-2xl font-mono font-bold text-primary">{stats.budgetPercent}%</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-4 md:gap-6 items-center">
                                <div className="h-32 sm:h-40 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={budgetData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={60}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {budgetData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: any) => `${currencySymbol}${Number(value || 0).toLocaleString()}`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-[10px] uppercase font-bold text-text-secondary">Spent</span>
                                        <span className="text-sm sm:text-base font-bold font-mono text-primary">{currencySymbol}{stats.totalSpent.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="md:col-span-2 grid grid-cols-2 gap-2 sm:gap-3">
                                    <div className="p-3 sm:p-4 rounded-xl bg-neutral/50 dark:bg-neutral/40 border border-border">
                                        <p className="text-[10px] uppercase font-bold text-text-secondary mb-1">Total Budget</p>
                                        <p className="text-sm sm:text-base md:text-lg font-mono font-bold text-foreground">{currencySymbol}{stats.totalBudget.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 sm:p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border-2 border-primary/20 scale-[1.02] shadow-sm">
                                        <p className="text-[10px] uppercase font-bold text-primary mb-1">Spent / Committed</p>
                                        <p className="text-lg sm:text-xl md:text-2xl font-mono font-black text-primary">{currencySymbol}{stats.totalSpent.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 sm:p-4 rounded-xl bg-neutral/50 dark:bg-neutral/40 border border-border">
                                        <p className="text-[10px] uppercase font-bold text-text-secondary mb-1">Remaining</p>
                                        <p className={`text-sm sm:text-base md:text-lg font-mono font-bold ${stats.remainingBudget < 0 ? 'text-red-500' : 'text-emerald-500 dark:text-emerald-400'}`}>
                                            {currencySymbol}{stats.remainingBudget.toLocaleString()}
                                        </p>
                                    </div>
                                    <Link href={`/dashboard/${id}/planner?tab=budget`} className="p-3 sm:p-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-all text-xs sm:text-sm min-h-[44px] flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                                        Open Planner <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Attendance Breakdown + Meal Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {/* Visual Pie Chart */}
                            <div className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-3xl bg-white border border-border soft-shadow">
                                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-text-secondary/50 mb-4 sm:mb-6">RSVP Status</h3>
                                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full relative flex-shrink-0" style={{
                                        background: stats.total > 0
                                            ? `conic-gradient(#22c55e ${attendPct}%, #ef4444 ${attendPct}% ${attendPct + declinePct}%, #f59e0b ${attendPct + declinePct}% ${attendPct + declinePct + pendingPct}%, #3A2A2D ${attendPct + declinePct + pendingPct}% 100%)`
                                            : '#3A2A2D'
                                    }}>
                                        <div className="absolute inset-2 sm:inset-3 bg-white rounded-full flex items-center justify-center">
                                            <span className="text-sm sm:text-xl font-bold">{stats.total}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                                        <div className="flex items-center gap-2"><div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500 flex-shrink-0" /><span>Confirmed ({stats.confirmed})</span></div>
                                        <div className="flex items-center gap-2"><div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-400 flex-shrink-0" /><span>Declined ({stats.declined})</span></div>
                                        <div className="flex items-center gap-2"><div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-amber-500 flex-shrink-0" /><span>Pending ({stats.pending})</span></div>
                                    </div>
                                </div>
                            </div>

                            {/* Meal Summary */}
                            <div className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-3xl bg-white border border-border soft-shadow">
                                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-text-secondary/50 mb-4 sm:mb-6">Meal Preferences</h3>
                                <div className="space-y-2 sm:space-y-3">
                                    {Object.entries(stats.meals).sort((a, b) => b[1] - a[1]).map(([pref, count]) => (
                                        <div key={pref} className="flex items-center justify-between text-xs sm:text-sm gap-2">
                                            <span className="truncate">{pref}</span>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <div className="h-2 bg-primary/20 rounded-full min-w-[40px] sm:min-w-[80px]" style={{ width: `${Math.min((count / stats.total) * 80, 80)}px` }}>
                                                    <div className="h-full bg-primary rounded-full" style={{ width: '100%' }} />
                                                </div>
                                                <span className="text-xs font-bold text-text-secondary/60 min-w-[20px] text-right">{count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Song Requests */}
                        {stats.songs.length > 0 && (
                            <div className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-3xl bg-white border border-border soft-shadow">
                                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-text-secondary/50 mb-4 sm:mb-6 flex items-center gap-2">
                                    <Music className="w-4 h-4 flex-shrink-0" /> Song Requests ({stats.songs.length})
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                    {stats.songs.map((s, i) => (
                                        <div key={i} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-neutral/50 dark:bg-neutral/30 border border-border/10">
                                            <span className="text-base sm:text-lg flex-shrink-0">🎵</span>
                                            <div className="min-w-0">
                                                <p className="font-bold text-xs sm:text-sm line-clamp-1">{s.song}</p>
                                                <p className="text-xs sm:text-xs text-text-secondary/50 line-clamp-1">— {s.name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* RSVP List with Search + Filter + CSV */}
                        <div className="bg-white rounded-lg sm:rounded-3xl border border-border soft-shadow overflow-hidden">
                            <div className="p-3 sm:p-4 md:p-6 border-b border-border space-y-3 sm:space-y-4">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                                    <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground">Guest List ({stats.total})</h3>
                                    <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                                        <span className="px-3 py-2 rounded-xl bg-neutral text-text-secondary text-[10px] font-bold uppercase tracking-widest">
                                            {stats.groupedCount} grouped
                                        </span>
                                        <span className="px-3 py-2 rounded-xl bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                                            {stats.invitedCount} invited
                                        </span>
                                        <span className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest">
                                            {stats.seatedCount} seated
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                    <button onClick={() => setIsAddGuestModalOpen(true)} className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-colors min-h-[44px]">
                                        <Plus className="w-4 h-4 flex-shrink-0" /> <span className="hidden sm:inline">Add Guest</span>
                                    </button>
                                    <button onClick={() => setIsImportGuestModalOpen(true)} className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-secondary/10 dark:bg-secondary/20 text-secondary text-xs font-bold hover:bg-secondary/20 transition-colors min-h-[44px]">
                                        <Upload className="w-4 h-4 flex-shrink-0" /> <span className="hidden sm:inline">{importingGuests ? 'Importing...' : 'Import CSV'}</span>
                                    </button>
                                    <button onClick={exportCSV} className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-primary/10 dark:bg-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-colors min-h-[44px]">
                                        <Download className="w-4 h-4 flex-shrink-0" /> <span className="hidden sm:inline">Export CSV</span>
                                    </button>
                                </div>
                                <div className="flex flex-col xl:flex-row gap-2 sm:gap-3">
                                    <div className="flex-1 relative">
                                        <Search className="w-4 h-4 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-text-secondary/30" />
                                        <input
                                            placeholder="Search guests..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-border focus:border-primary outline-none text-xs sm:text-sm bg-neutral min-h-[44px]"
                                        />
                                    </div>
                                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}
                                        className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-border text-xs sm:text-sm bg-neutral focus:border-primary outline-none min-h-[44px]">
                                        <option value="all">All Guests</option>
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
                                    <select
                                        value={invitationFilter}
                                        onChange={(e) => setInvitationFilter(e.target.value as 'all' | 'sent' | 'not_sent')}
                                        className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-border text-xs sm:text-sm bg-neutral focus:border-primary outline-none min-h-[44px]"
                                    >
                                        <option value="all">All Invites</option>
                                        <option value="sent">Invite Sent</option>
                                        <option value="not_sent">Not Sent</option>
                                    </select>
                                </div>
                            </div>
                            <div className="overflow-x-hidden">
                                <table className="w-full text-left text-xs sm:text-sm">
                                    <thead className="bg-neutral text-text-secondary/60 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold sticky top-0">
                                        <tr>
                                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Guest Name</th>
                                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Status</th>
                                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Guests</th>
                                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 hidden sm:table-cell">Group</th>
                                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 hidden md:table-cell">Invite</th>
                                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 hidden lg:table-cell">Table</th>
                                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredRsvps.slice(0, visibleCount).map((rsvp) => (
                                            <tr key={rsvp.id} className="hover:bg-neutral/30 transition-colors">
                                                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4">
                                                    <p className="font-bold text-foreground text-xs sm:text-sm line-clamp-1">{rsvp.guest_name}</p>
                                                    <p className="text-[10px] text-text-secondary/60 truncate italic">{rsvp.guest_email || 'No email provided'}</p>
                                                    {rsvp.manual_entry && <span className="text-[7px] sm:text-[8px] bg-neutral px-1 sm:px-1.5 py-0.5 rounded uppercase tracking-widest text-text-secondary font-black mt-1 inline-block">Manual</span>}
                                                    {rsvp.plus_one_names && <p className="text-xs text-text-secondary/50 mt-1 line-clamp-1">+{rsvp.plus_one_names}</p>}
                                                    {rsvp.plus_one_allowed && (
                                                        <p className="text-[10px] text-secondary/70 mt-1">
                                                            Plus-one: {rsvp.plus_one_name || getPlusOneStatusLabel(rsvp.plus_one_rsvp_status)}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4">
                                                    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                                                        (rsvp.rsvp_status === 'confirmed' || rsvp.attendance === 'Yes') ? 'bg-green-50 text-green-700' : 
                                                        (rsvp.rsvp_status === 'declined' || rsvp.attendance === 'No') ? 'bg-red-50 text-red-600' :
                                                        'bg-amber-50 text-amber-600'
                                                    }`}>
                                                        { (rsvp.rsvp_status === 'confirmed' || rsvp.attendance === 'Yes') ? 'Confirmed' : 
                                                          (rsvp.rsvp_status === 'declined' || rsvp.attendance === 'No') ? 'Declined' : 'Pending' }
                                                    </span>
                                                </td>
                                                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-text-secondary font-medium text-xs sm:text-sm">
                                                    {rsvp.num_guests}{(rsvp.children_count ?? 0) > 0 && <span className="text-xs text-blue-400 ml-1 hidden sm:inline">+{rsvp.children_count}</span>}
                                                </td>
                                                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 hidden sm:table-cell">
                                                    <select
                                                        value={rsvp.guest_group || ''}
                                                        onChange={(e) => updateRsvp(rsvp.id, { guest_group: (e.target.value || undefined) as GuestGroup | undefined })}
                                                        className="w-full min-w-[160px] px-3 py-2 rounded-xl border border-border bg-white text-xs text-foreground"
                                                    >
                                                        <option value="">Ungrouped</option>
                                                        {GUEST_GROUP_OPTIONS.map((option) => (
                                                            <option key={option.value} value={option.value}>{option.label}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 hidden md:table-cell">
                                                    <button
                                                        onClick={() => updateRsvp(rsvp.id, { invitation_sent: !rsvp.invitation_sent })}
                                                        className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest ${
                                                            rsvp.invitation_sent
                                                                ? 'bg-emerald-50 text-emerald-600'
                                                                : 'bg-neutral text-text-secondary'
                                                        }`}
                                                    >
                                                        {rsvp.invitation_sent ? 'Sent' : 'Not Sent'}
                                                    </button>
                                                    {rsvp.invitation_sent_at && (
                                                        <p className="text-[10px] text-text-secondary mt-1">{new Date(rsvp.invitation_sent_at).toLocaleDateString()}</p>
                                                    )}
                                                </td>
                                                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 hidden lg:table-cell">
                                                    <span className="text-text-secondary text-xs sm:text-sm">{rsvp.table_assignment || 'Unseated'}</span>
                                                </td>
                                                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => updateRsvp(rsvp.id, { plus_one_allowed: !rsvp.plus_one_allowed })}
                                                            className={`px-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest min-h-[44px] ${
                                                                rsvp.plus_one_allowed
                                                                    ? 'bg-secondary/10 text-secondary'
                                                                    : 'bg-neutral text-text-secondary'
                                                            }`}
                                                        >
                                                            +1
                                                        </button>
                                                        <button onClick={() => deleteRsvp(rsvp.id)} className="text-text-secondary/30 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {/* Infinite Scroll Sentinel */}
                                        {filteredRsvps.length > 0 && (
                                            <tr id="guest-list-sentinel">
                                                <td colSpan={7} className="py-4">
                                                    {hasMore && visibleCount < filteredRsvps.length ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                            <span className="text-xs text-text-secondary">Loading more guests...</span>
                                                        </div>
                                                    ) : filteredRsvps.length > ITEMS_PER_PAGE ? (
                                                        <div className="text-center text-xs text-text-secondary">
                                                            Showing {visibleCount} of {filteredRsvps.length} guests
                                                        </div>
                                                    ) : null}
                                                </td>
                                            </tr>
                                        )}
                                        {filteredRsvps.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="px-2 sm:px-6 py-8 sm:py-16 text-center text-text-secondary/30 italic font-serif text-sm sm:text-lg">
                                                    {searchQuery || filterStatus !== 'all' || groupFilter !== 'all' || invitationFilter !== 'all'
                                                        ? 'No matching guests found.'
                                                        : 'No responses yet. Share your link to start collecting RSVPs!'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-4 sm:space-y-6 md:space-y-8">
                        {/* Share Card */}
                        <div className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-3xl bg-primary text-white shadow-xl shadow-primary/20">
                            <Share2 className="w-6 h-6 sm:w-8 sm:h-8 mb-4 sm:mb-6 text-white/40" />
                            <h3 className="text-lg sm:text-xl md:text-2xl font-serif font-bold mb-3 sm:mb-4">Share Invitation</h3>
                            <div className="mb-4 sm:mb-6 border-b border-white/20 pb-3 sm:pb-4">
                                <p className="text-white/70 break-all font-mono text-[10px] sm:text-xs mb-2">{url}</p>
                                <CopyButton 
                                    text={url} 
                                    label="Copy URL"
                                    variant="minimal"
                                    className="text-white/70 hover:text-white"
                                />
                            </div>
                            <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-2xl flex justify-center items-center mb-4 sm:mb-6 shadow-inner aspect-square max-w-[180px] mx-auto">
                                <QRCodeSVG value={qrTrackingUrl} size={140} fgColor="#D16C78" className="w-full h-auto sm:w-[180px]" />
                            </div>

                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                <CopyButton 
                                    text={url}
                                    label="Copy"
                                    className="flex flex-col items-center justify-center gap-1 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 transition-colors min-h-[44px] border-0 text-white"
                                />
                                <button onClick={handleShareWhatsApp} className="flex flex-col items-center justify-center gap-1 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 transition-colors min-h-[44px]">
                                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="text-[8px] sm:text-[10px] font-bold text-center">WhatsApp</span>
                                </button>
                                <button onClick={handleShareEmail} className="flex flex-col items-center justify-center gap-1 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 transition-colors min-h-[44px]">
                                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="text-[8px] sm:text-[10px] font-bold text-center">Email</span>
                                </button>
                            </div>
                        </div>

                        <AnalyticsPanel
                            weddingId={id}
                            rsvpCount={stats.total}
                            pendingGuestCount={stats.pending}
                        />

                        <CollaboratorsPanel
                            weddingId={id}
                            currentUserId={user?.id}
                            currentUserEmail={user?.email}
                            canManage={canManageWorkspace}
                        />

                        {/* Custom Domain Settings */}
                        <div className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-3xl bg-white border border-border soft-shadow">
                            <h3 className="text-lg sm:text-xl font-serif font-bold mb-4 sm:mb-6 text-foreground border-b border-border pb-3 sm:pb-4 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-primary flex-shrink-0" /> Custom Domain
                            </h3>

                            {!canManageWorkspace && (
                                <div className="mb-4 p-3 rounded-xl bg-neutral/50 border border-border text-sm text-text-secondary">
                                    Custom domain controls are available to the wedding owner or partner role.
                                </div>
                            )}

                            {!wedding.custom_domain ? (
                                <div className="space-y-3 sm:space-y-4">
                                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">Connect your own domain name (e.g., <span className="font-bold">amyandjohn.com</span>) to make your website truly yours.</p>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            placeholder="yourdomain.com"
                                            value={domainInput}
                                            onChange={(e) => setDomainInput(e.target.value)}
                                            disabled={!canManageWorkspace}
                                            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-border focus:border-primary outline-none text-xs sm:text-sm bg-neutral min-h-[44px]"
                                        />
                                        <button
                                            onClick={handleAddDomain}
                                            disabled={domainLoading || !domainInput || !canManageWorkspace}
                                            className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-primary text-white font-bold text-xs sm:text-sm hover:bg-primary-hover transition-colors disabled:opacity-50 min-h-[44px]"
                                        >
                                            {domainLoading ? 'Adding...' : 'Connect'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 sm:space-y-6">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-primary/5 rounded-lg sm:rounded-2xl border border-primary/20">
                                        <div>
                                            <p className="font-bold text-foreground text-sm sm:text-base">{wedding.custom_domain}</p>
                                            <p className="text-[8px] sm:text-[10px] uppercase tracking-widest text-text-secondary/60 mt-1">
                                                {domainStatus?.misconfigured === false ? (
                                                    <span className="text-green-500 font-bold flex items-center gap-1">● Active &amp; Verified</span>
                                                ) : (
                                                    <span className="text-yellow-500 font-bold flex items-center gap-1 animate-pulse"><AlertCircle className="w-3 h-3" /> Pending DNS Configuration</span>
                                                )}
                                            </p>
                                        </div>
                                        <button onClick={handleRemoveDomain} disabled={domainLoading || !canManageWorkspace} className="text-xs font-bold px-3 py-2 sm:py-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors min-h-[44px] sm:h-auto whitespace-nowrap disabled:opacity-50">
                                            {domainLoading ? 'Removing...' : 'Disconnect'}
                                        </button>
                                    </div>

                                    {domainStatus?.misconfigured && (() => {
                                        const parts = wedding.custom_domain.split('.');
                                        const isSubdomain = parts.length > 2 && !['co.uk', 'com.au', 'co.in', 'org.uk'].some(ext => wedding.custom_domain.endsWith(ext));
                                        const dnsType = isSubdomain ? 'CNAME' : 'A';
                                        const dnsName = isSubdomain ? parts.slice(0, parts.length - 2).join('.') : '@';
                                        const dnsValue = isSubdomain ? 'cname.vercel-dns.com' : '76.76.21.21';

                                        return (
                                            <div className="p-3 sm:p-5 rounded-lg sm:rounded-2xl bg-neutral space-y-3 sm:space-y-4 border border-border text-xs sm:text-sm">
                                                <p className="font-bold text-foreground">Required DNS Records</p>
                                                <p className="text-text-secondary text-[11px] sm:text-xs">Login to your domain registrar (GoDaddy, Namecheap, etc.) and add this exact {dnsType} Record to point your domain to our servers:</p>

                                                <div className="space-y-2">
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-white p-2 sm:p-3 rounded-lg sm:rounded-xl border border-border group/dns">
                                                        <span className="text-text-secondary font-bold text-[8px] sm:text-[10px] uppercase tracking-widest">Type</span>
                                                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                                            <span className="font-mono text-xs sm:text-sm flex-1 sm:flex-0">{dnsType}</span>
                                                            <button onClick={() => { void copyText(dnsType); alert('Copied Type'); }} className="opacity-0 group-hover/dns:opacity-100 transition-opacity p-1 hover:bg-neutral rounded">
                                                                <Copy className="w-3 h-3 text-text-secondary" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-white p-2 sm:p-3 rounded-lg sm:rounded-xl border border-border group/dns">
                                                        <span className="text-text-secondary font-bold text-[8px] sm:text-[10px] uppercase tracking-widest">Host</span>
                                                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                                            <span className="font-mono text-xs sm:text-sm flex-1 sm:flex-0">{dnsName}</span>
                                                            <button onClick={() => { void copyText(dnsName); alert('Copied Host'); }} className="opacity-0 group-hover/dns:opacity-100 transition-opacity p-1 hover:bg-neutral rounded">
                                                                <Copy className="w-3 h-3 text-text-secondary" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-white p-2 sm:p-3 rounded-lg sm:rounded-xl border border-border group/dns shadow-sm shadow-primary/5">
                                                        <span className="text-text-secondary font-bold text-[8px] sm:text-[10px] uppercase tracking-widest">Value</span>
                                                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                                            <span className="font-mono text-xs sm:text-sm text-primary font-bold flex-1 sm:flex-0">{dnsValue}</span>
                                                            <button onClick={() => { void copyText(dnsValue); alert('Copied Value'); }} className="opacity-0 group-hover/dns:opacity-100 transition-opacity p-1 bg-primary/10 hover:bg-primary/20 rounded">
                                                                <Copy className="w-3 h-3 text-primary" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                                                    <p className="text-[8px] sm:text-[10px] text-text-secondary/60">DNS propagation may take up to 24 hours.</p>
                                                    <button onClick={() => checkDomainStatus(wedding.custom_domain)} className="text-xs text-primary font-bold hover:underline whitespace-nowrap">
                                                        Refresh Status
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* Event Details */}
                        <div className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-3xl bg-white border border-border soft-shadow">
                            <h3 className="text-lg sm:text-xl font-serif font-bold mb-4 sm:mb-6 text-foreground border-b border-border pb-3 sm:pb-4">Event Details</h3>
                            <div className="space-y-4 sm:space-y-6 text-xs sm:text-sm">
                                <div>
                                    <span className="text-text-secondary/60 block text-[8px] sm:text-[10px] uppercase tracking-widest font-bold pb-2">Date &amp; Time</span>
                                    <span className="font-bold text-foreground text-sm sm:text-base">{wedding.wedding_date} @ {wedding.wedding_time}</span>
                                </div>
                                <div>
                                    <span className="text-text-secondary/60 block text-[8px] sm:text-[10px] uppercase tracking-widest font-bold pb-2">Venue</span>
                                    <span className="font-bold text-foreground text-sm sm:text-base line-clamp-2">{wedding.venue_name}</span>
                                </div>
                                <div>
                                    <span className="text-text-secondary/60 block text-[8px] sm:text-[10px] uppercase tracking-widest font-bold pb-2">RSVP Deadline</span>
                                    <span className="font-bold text-primary text-sm sm:text-base">{wedding.rsvp_deadline}</span>
                                </div>
                                <div>
                                    <span className="text-text-secondary/60 block text-[8px] sm:text-[10px] uppercase tracking-widest font-bold pb-2">Template</span>
                                    <span className="font-bold text-foreground text-sm sm:text-base capitalize">{wedding.template}</span>
                                </div>
                            </div>
                        </div>
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
