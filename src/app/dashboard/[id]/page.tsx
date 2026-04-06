'use client';

import { useSearchParams } from 'next/navigation';
import { Heart, Users, Share2, ExternalLink, Calendar, CheckCircle2, Loader2, Download, Search, Trash2, Copy, MessageCircle, Mail, X, Music, Baby, Globe, AlertCircle, ListTodo, Wallet, Plus, Coins, ArrowRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useEffect, useState, use, useMemo } from 'react';

export default function DashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const created = searchParams?.get('created');

    const [wedding, setWedding] = useState<any>(null);
    const [rsvps, setRsvps] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [budgets, setBudgets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'declined' | 'pending'>('all');
    const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
    const [newGuest, setNewGuest] = useState({ guest_name: '', rsvp_status: 'pending', num_guests: 1 });
    const [copyToast, setCopyToast] = useState(false);

    const [domainInput, setDomainInput] = useState('');
    const [domainStatus, setDomainStatus] = useState<any>(null);
    const [domainLoading, setDomainLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: weddingData, error: weddingError } = await supabase
                    .from('weddings').select('*').eq('id', id).single();

                if (weddingError || !weddingData) { setLoading(false); return; }
                setWedding(weddingData);

                const { data: rsvpsData } = await supabase
                    .from('rsvps').select('*').eq('wedding_id', id).order('created_at', { ascending: false });
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
    }, [id]);

    const checkDomainStatus = async (domain: string) => {
        try {
            const res = await fetch(`/api/domains?domain=${domain}`);
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
            const res = await fetch('/api/domains', {
                method: 'POST', body: JSON.stringify({ domain: domainInput.toLowerCase().trim() })
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
            await fetch(`/api/domains?domain=${wedding.custom_domain}`, { method: 'DELETE' });
            await supabase.from('weddings').update({ custom_domain: null }).eq('id', wedding.id);
            setWedding({ ...wedding, custom_domain: null });
            setDomainStatus(null);
        } catch (e) {
            alert("Failed to remove domain");
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

        // Meal preferences
        const meals: Record<string, number> = {};
        rsvps.forEach(r => {
            const pref = r.meal_preference || 'No Preference';
            meals[pref] = (meals[pref] || 0) + 1;
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
            meals, 
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
            const matchSearch = r.guest_name.toLowerCase().includes(searchQuery.toLowerCase());
            let matchStatus = true;
            if (filterStatus === 'confirmed') matchStatus = r.rsvp_status === 'confirmed' || r.attendance === 'Yes';
            else if (filterStatus === 'declined') matchStatus = r.rsvp_status === 'declined' || r.attendance === 'No';
            else if (filterStatus === 'pending') matchStatus = r.rsvp_status === 'pending';
            return matchSearch && matchStatus;
        });
    }, [rsvps, searchQuery, filterStatus]);

    // CSV Export
    const exportCSV = () => {
        const headers = ['Guest Name', 'Attendance', 'Guests', 'Children', 'Meal Preference', 'Dietary Details', 'Plus One Names', 'Song Request', 'Message', 'Date'];
        const rows = rsvps.map(r => [
            r.guest_name, r.attendance, r.num_guests, r.children_count || 0,
            r.meal_preference || '', r.dietary_details || '', r.plus_one_names || '',
            r.song_request || '', (r.message || '').replace(/"/g, '""'),
            new Date(r.created_at).toLocaleDateString(),
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.map((c: any) => `"${c}"`).join(','))].join('\n');
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

    const handleAddManualGuest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGuest.guest_name) return;
        
        const { data, error } = await supabase.from('rsvps').insert({
            wedding_id: id,
            guest_name: newGuest.guest_name,
            rsvp_status: newGuest.rsvp_status,
            num_guests: newGuest.num_guests,
            manual_entry: true,
            attendance: newGuest.rsvp_status === 'confirmed' ? 'Yes' : newGuest.rsvp_status === 'declined' ? 'No' : null
        }).select().single();

        if (error) {
            alert("Error adding guest: " + error.message);
        } else {
            setRsvps([data, ...rsvps]);
            setNewGuest({ guest_name: '', rsvp_status: 'pending', num_guests: 1 });
            setIsAddGuestModalOpen(false);
        }
    };

    // Copy & Share
    const domain = wedding?.custom_domain ? `https://${wedding.custom_domain}` : (process.env.NEXT_PUBLIC_BASE_URL || 'https://quickweds.vercel.app');
    const url = wedding?.custom_domain ? domain : (wedding ? `${domain}/w/${wedding.id}` : '');

    const copyLink = () => {
        navigator.clipboard.writeText(url);
        setCopyToast(true);
        setTimeout(() => setCopyToast(false), 2000);
    };

    const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(`You're invited to our wedding! 💍\n${url}`)}`);
    const shareEmail = () => window.open(`mailto:?subject=${encodeURIComponent(`You're Invited!`)}&body=${encodeURIComponent(`We'd love for you to join us!\n\n${url}`)}`);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-neutral/30"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>;
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
    const currencySymbol = wedding?.currency === 'USD' ? '$' : wedding?.currency === 'Yen' ? '¥' : '₱';

    return (
        <div className="min-h-screen bg-neutral pb-20">
            {/* Header */}
            <div className="bg-white border-b border-border p-4 sticky top-0 z-50 backdrop-blur-md bg-white/80">
            <div className="max-w-6xl mx-auto px-3 sm:px-4 flex justify-between items-center gap-2 sm:gap-3">
                    <Link href="/" className="flex items-center flex-shrink-0">
                        <img src="/logo.png" alt="QuickWeds Logo" className="h-8 sm:h-10 w-auto object-contain hover:scale-105 transition-transform" />
                    </Link>
                    <div className="flex gap-2 sm:gap-3">
                        <Link href={`/builder?edit=${wedding.id}`} className="flex items-center gap-2 px-3 sm:px-6 py-2 rounded-lg sm:rounded-xl bg-primary text-white text-xs sm:text-sm font-bold shadow-lg shadow-primary/10 hover:bg-primary-hover transition-all min-h-[44px] whitespace-nowrap">
                            Edit Design
                        </Link>
                        <Link href={`/dashboard/${wedding.id}/planner`} className="flex items-center gap-2 px-3 sm:px-6 py-2 rounded-lg sm:rounded-xl bg-secondary text-white text-xs sm:text-sm font-bold shadow-lg shadow-secondary/10 hover:opacity-90 transition-all min-h-[44px]">
                            <ListTodo className="w-4 h-4 flex-shrink-0" /> <span className="hidden sm:inline">Planner</span>
                        </Link>
                        <Link href={url} target="_blank" className="flex items-center gap-2 px-3 sm:px-6 py-2 rounded-lg sm:rounded-xl bg-neutral text-primary text-xs sm:text-sm font-bold border border-border hover:border-primary/30 transition-all min-h-[44px]">
                            View <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        </Link>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-3 sm:px-6 pt-6 sm:pt-12 text-left">
                {created && (
                    <div className="mb-8 sm:mb-12 p-4 sm:p-8 rounded-xl sm:rounded-3xl bg-success-bg border border-border flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center text-accent shadow-sm flex-shrink-0">
                            <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-primary mb-1">Your invitation is live!</h2>
                            <p className="text-xs sm:text-sm text-text-secondary">Share your special URL below or use the QR code for your physical invitations.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
                    <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                        {/* Planner Promo Card */}
                        <div className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-6 group soft-shadow">
                            <div>
                                <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-foreground mb-1 sm:mb-2 flex items-center gap-2">
                                    <ListTodo className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" /> Smart Wedding Planner
                                </h2>
                                <p className="text-xs sm:text-sm text-text-secondary">Keep everything on track with our new Checklist, Budget Tracker, and Vendor Rolodex.</p>
                            </div>
                            <Link href={`/dashboard/${wedding.id}/planner`} className="shrink-0 px-4 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-lg sm:rounded-2xl font-bold shadow-xl shadow-primary/20 group-hover:scale-105 transition-transform flex items-center gap-2 min-h-[44px] text-sm sm:text-base">
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
                        <div className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-3xl bg-white border border-border soft-shadow">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6 sm:mb-8">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                                    <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" /> Budget Overview
                                </h2>
                                <div className="text-right">
                                    <p className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1">Utilization</p>
                                    <p className="text-lg sm:text-xl md:text-2xl font-mono font-bold text-primary">{stats.budgetPercent}%</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 items-start md:items-center">
                                <div className="h-40 sm:h-48 relative">
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
                                        <span className="text-[8px] sm:text-[10px] uppercase font-bold text-text-secondary">Spent</span>
                                        <span className="text-xs sm:text-sm md:text-base font-bold font-mono">{currencySymbol}{stats.totalSpent.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="md:col-span-2 grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                                    <div className="p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-neutral/50 border border-border">
                                        <p className="text-[8px] sm:text-[10px] uppercase font-bold text-text-secondary mb-1">Total Budget</p>
                                        <p className="text-sm sm:text-base md:text-lg font-mono font-bold text-foreground">{currencySymbol}{stats.totalBudget.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-neutral/50 border border-border">
                                        <p className="text-[8px] sm:text-[10px] uppercase font-bold text-text-secondary mb-1">Spent / Committed</p>
                                        <p className="text-sm sm:text-base md:text-lg font-mono font-bold text-primary">{currencySymbol}{stats.totalSpent.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-neutral/50 border border-border">
                                        <p className="text-[8px] sm:text-[10px] uppercase font-bold text-text-secondary mb-1">Remaining</p>
                                        <p className={`text-sm sm:text-base md:text-lg font-mono font-bold ${stats.remainingBudget < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                            {currencySymbol}{stats.remainingBudget.toLocaleString()}
                                        </p>
                                    </div>
                                    <Link href={`/dashboard/${id}/planner?tab=budget`} className="p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center gap-2 text-primary font-bold hover:bg-primary/10 transition-all text-xs sm:text-sm min-h-[44px]">
                                        Manage Budget <ArrowRight className="w-4 h-4" />
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
                                            ? `conic-gradient(#22c55e ${attendPct}%, #ef4444 ${attendPct}% ${attendPct + declinePct}%, #f59e0b ${attendPct + declinePct}% ${attendPct + declinePct + pendingPct}%, #e5e7eb ${attendPct + declinePct + pendingPct}% 100%)`
                                            : '#e5e7eb'
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
                                        <div key={i} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-neutral/50">
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
                                    <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground">Guest List ({stats.total})</h3>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <button onClick={() => setIsAddGuestModalOpen(true)} className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold hover:bg-emerald-100 transition-colors min-h-[44px]">
                                            <Plus className="w-4 h-4 flex-shrink-0" /> <span className="hidden sm:inline">Add Guest</span>
                                        </button>
                                        <button onClick={exportCSV} className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors min-h-[44px]">
                                            <Download className="w-4 h-4 flex-shrink-0" /> <span className="hidden sm:inline">Export CSV</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
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
                                </div>
                            </div>
                            <div className="overflow-x-auto -mx-4 sm:mx-0">
                                <table className="w-full text-left text-xs sm:text-sm px-4 sm:px-0">
                                    <thead className="bg-neutral text-text-secondary/60 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold sticky top-0">
                                        <tr>
                                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Guest Name</th>
                                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Status</th>
                                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Guests</th>
                                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 hidden sm:table-cell">Meal</th>
                                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 hidden md:table-cell">Song</th>
                                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 hidden lg:table-cell">Message</th>
                                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredRsvps.map((rsvp: any) => (
                                            <tr key={rsvp.id} className="hover:bg-neutral/30 transition-colors">
                                                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4">
                                                    <p className="font-bold text-foreground text-xs sm:text-sm line-clamp-1">{rsvp.guest_name}</p>
                                                    {rsvp.manual_entry && <span className="text-[7px] sm:text-[8px] bg-neutral px-1 sm:px-1.5 py-0.5 rounded uppercase tracking-widest text-text-secondary font-black">Manual</span>}
                                                    {rsvp.plus_one_names && <p className="text-xs text-text-secondary/50 mt-1 line-clamp-1">+{rsvp.plus_one_names}</p>}
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
                                                    {rsvp.num_guests}{rsvp.children_count > 0 && <span className="text-xs text-blue-400 ml-1 hidden sm:inline">+{rsvp.children_count}</span>}
                                                </td>
                                                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-text-secondary text-xs sm:text-sm hidden sm:table-cell truncate">{rsvp.meal_preference || '-'}</td>
                                                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-text-secondary/50 text-xs sm:text-sm italic max-w-[80px] sm:max-w-[120px] truncate hidden md:table-cell">{rsvp.song_request || '-'}</td>
                                                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-text-secondary/50 italic text-xs sm:text-sm max-w-[100px] truncate hidden lg:table-cell">{rsvp.message || '-'}</td>
                                                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4">
                                                    <button onClick={() => deleteRsvp(rsvp.id)} className="text-text-secondary/30 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredRsvps.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="px-2 sm:px-6 py-8 sm:py-16 text-center text-text-secondary/30 italic font-serif text-sm sm:text-lg">
                                                    {searchQuery || filterStatus !== 'all' ? 'No matching guests found.' : 'No responses yet. Share your link to start collecting RSVPs!'}
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
                            <p className="text-white/70 mb-4 sm:mb-6 border-b border-white/20 pb-3 sm:pb-4 break-all font-mono text-[10px] sm:text-xs">{url}</p>
                            <div className="bg-white p-3 sm:p-6 rounded-lg sm:rounded-2xl flex justify-center mb-4 sm:mb-6 shadow-inner">
                                <QRCodeSVG value={url} size={120} fgColor="#D16C78" className="sm:w-[180px] w-[120px]" />
                            </div>

                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                <button onClick={copyLink} className="flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 transition-colors min-h-[44px]">
                                    <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="text-[8px] sm:text-[10px] font-bold">{copyToast ? 'Copied!' : 'Copy'}</span>
                                </button>
                                <button onClick={shareWhatsApp} className="flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 transition-colors min-h-[44px]">
                                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="text-[8px] sm:text-[10px] font-bold">WhatsApp</span>
                                </button>
                                <button onClick={shareEmail} className="flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 transition-colors min-h-[44px]">
                                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="text-[8px] sm:text-[10px] font-bold">Email</span>
                                </button>
                            </div>
                        </div>

                        {/* Custom Domain Settings */}
                        <div className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-3xl bg-white border border-border soft-shadow">
                            <h3 className="text-lg sm:text-xl font-serif font-bold mb-4 sm:mb-6 text-foreground border-b border-border pb-3 sm:pb-4 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-primary flex-shrink-0" /> Custom Domain
                            </h3>

                            {!wedding.custom_domain ? (
                                <div className="space-y-3 sm:space-y-4">
                                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">Connect your own domain name (e.g., <span className="font-bold">amyandjohn.com</span>) to make your website truly yours.</p>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            placeholder="yourdomain.com"
                                            value={domainInput}
                                            onChange={(e) => setDomainInput(e.target.value)}
                                            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-border focus:border-primary outline-none text-xs sm:text-sm bg-neutral min-h-[44px]"
                                        />
                                        <button
                                            onClick={handleAddDomain}
                                            disabled={domainLoading || !domainInput}
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
                                        <button onClick={handleRemoveDomain} disabled={domainLoading} className="text-xs font-bold px-3 py-2 sm:py-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors min-h-[44px] sm:h-auto whitespace-nowrap">
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
                                                            <button onClick={() => { navigator.clipboard.writeText(dnsType); alert('Copied Type'); }} className="opacity-0 group-hover/dns:opacity-100 transition-opacity p-1 hover:bg-neutral rounded">
                                                                <Copy className="w-3 h-3 text-text-secondary" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-white p-2 sm:p-3 rounded-lg sm:rounded-xl border border-border group/dns">
                                                        <span className="text-text-secondary font-bold text-[8px] sm:text-[10px] uppercase tracking-widest">Host</span>
                                                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                                            <span className="font-mono text-xs sm:text-sm flex-1 sm:flex-0">{dnsName}</span>
                                                            <button onClick={() => { navigator.clipboard.writeText(dnsName); alert('Copied Host'); }} className="opacity-0 group-hover/dns:opacity-100 transition-opacity p-1 hover:bg-neutral rounded">
                                                                <Copy className="w-3 h-3 text-text-secondary" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-white p-2 sm:p-3 rounded-lg sm:rounded-xl border border-border group/dns shadow-sm shadow-primary/5">
                                                        <span className="text-text-secondary font-bold text-[8px] sm:text-[10px] uppercase tracking-widest">Value</span>
                                                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                                            <span className="font-mono text-xs sm:text-sm text-primary font-bold flex-1 sm:flex-0">{dnsValue}</span>
                                                            <button onClick={() => { navigator.clipboard.writeText(dnsValue); alert('Copied Value'); }} className="opacity-0 group-hover/dns:opacity-100 transition-opacity p-1 bg-primary/10 hover:bg-primary/20 rounded">
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
                            <div>
                                <label className="block text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary mb-2">Guest Name</label>
                                <input 
                                    required
                                    type="text" 
                                    value={newGuest.guest_name}
                                    onChange={e => setNewGuest({...newGuest, guest_name: e.target.value})}
                                    placeholder="Enter guest name..."
                                    className="w-full bg-neutral border border-border rounded-lg sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-4 outline-none focus:ring-primary/20 text-xs sm:text-lg min-h-[44px]"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                                <div>
                                    <label className="block text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary mb-2">RSVP Status</label>
                                    <select 
                                        value={newGuest.rsvp_status}
                                        onChange={e => setNewGuest({...newGuest, rsvp_status: e.target.value})}
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

                            <button type="submit" className="w-full bg-primary text-white rounded-lg sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-5 font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm sm:text-lg mt-2 sm:mt-4 min-h-[44px]">
                                Add to Guest List
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
