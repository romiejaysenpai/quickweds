'use client';

import { useSearchParams } from 'next/navigation';
import { Heart, Users, Share2, ExternalLink, Calendar, CheckCircle2, Loader2, Download, Search, Trash2, Copy, MessageCircle, Mail, X, Music, Baby } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useEffect, useState, use, useMemo } from 'react';

export default function DashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const created = searchParams.get('created');

    const [wedding, setWedding] = useState<any>(null);
    const [rsvps, setRsvps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'Yes' | 'No'>('all');
    const [copyToast, setCopyToast] = useState(false);

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
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchData();
    }, [id]);

    // Computed stats
    const stats = useMemo(() => {
        const attending = rsvps.filter(r => r.attendance === 'Yes');
        const declined = rsvps.filter(r => r.attendance === 'No');
        const totalGuests = attending.reduce((acc, r) => acc + (r.num_guests || 1), 0);
        const totalChildren = rsvps.reduce((acc, r) => acc + (r.children_count || 0), 0);

        // Meal preferences
        const meals: Record<string, number> = {};
        rsvps.forEach(r => {
            const pref = r.meal_preference || 'No Preference';
            meals[pref] = (meals[pref] || 0) + 1;
        });

        // Song requests
        const songs = rsvps.filter(r => r.song_request).map(r => ({ name: r.guest_name, song: r.song_request }));

        return { attending: attending.length, declined: declined.length, totalGuests, totalChildren, meals, songs, total: rsvps.length };
    }, [rsvps]);

    // Filtered list
    const filteredRsvps = useMemo(() => {
        return rsvps.filter(r => {
            const matchSearch = r.guest_name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus = filterStatus === 'all' || r.attendance === filterStatus;
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
        if (!confirm('Remove this RSVP entry?')) return;
        await supabase.from('rsvps').delete().eq('id', rsvpId);
        setRsvps(prev => prev.filter(r => r.id !== rsvpId));
    };

    // Copy & Share
    const domain = process.env.NEXT_PUBLIC_BASE_URL || 'https://quickweds.vercel.app';
    const url = wedding ? `${domain}/w/${wedding.id}` : '';

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
    const attendPct = stats.total > 0 ? (stats.attending / stats.total) * 100 : 0;
    const declinePct = stats.total > 0 ? (stats.declined / stats.total) * 100 : 0;

    return (
        <div className="min-h-screen bg-neutral pb-20">
            {/* Header */}
            <div className="bg-white border-b border-border p-4 sticky top-0 z-50 backdrop-blur-md bg-white/80">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <Link href="/" className="flex items-center">
                        <img src="/logo.png" alt="QuickWeds Logo" className="h-10 w-auto object-contain hover:scale-105 transition-transform" />
                    </Link>
                    <div className="flex gap-3">
                        <Link href={`/builder?edit=${wedding.id}`} className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/10 hover:bg-primary-hover transition-all">
                            Edit Design
                        </Link>
                        <Link href={url} target="_blank" className="flex items-center gap-2 px-6 py-2 rounded-xl bg-neutral text-primary text-sm font-bold border border-border hover:border-primary/30 transition-all">
                            View Live <ExternalLink className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 pt-12 text-left">
                {created && (
                    <div className="mb-12 p-8 rounded-3xl bg-success-bg border border-border flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-accent shadow-sm">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-primary mb-1">Your invitation is live!</h2>
                            <p className="text-text-secondary">Share your special URL below or use the QR code for your physical invitations.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-6 rounded-2xl bg-white border border-border soft-shadow text-center">
                                <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                                <p className="text-3xl font-serif font-bold text-foreground">{stats.totalGuests}</p>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-text-secondary/50">Confirmed Guests</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white border border-border soft-shadow text-center">
                                <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-2" />
                                <p className="text-3xl font-serif font-bold text-foreground">{stats.attending}</p>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-text-secondary/50">Attending</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white border border-border soft-shadow text-center">
                                <X className="w-6 h-6 text-red-400 mx-auto mb-2" />
                                <p className="text-3xl font-serif font-bold text-foreground">{stats.declined}</p>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-text-secondary/50">Declined</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white border border-border soft-shadow text-center">
                                <Baby className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                                <p className="text-3xl font-serif font-bold text-foreground">{stats.totalChildren}</p>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-text-secondary/50">Children</p>
                            </div>
                        </div>

                        {/* Attendance Breakdown + Meal Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Visual Pie Chart */}
                            <div className="p-8 rounded-3xl bg-white border border-border soft-shadow">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary/50 mb-6">Attendance</h3>
                                <div className="flex items-center gap-8">
                                    <div className="w-28 h-28 rounded-full relative" style={{
                                        background: stats.total > 0
                                            ? `conic-gradient(#22c55e ${attendPct}%, #ef4444 ${attendPct}% ${attendPct + declinePct}%, #e5e7eb ${attendPct + declinePct}% 100%)`
                                            : '#e5e7eb'
                                    }}>
                                        <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center">
                                            <span className="text-xl font-bold">{stats.total}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /><span>Attending ({stats.attending})</span></div>
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-400" /><span>Declined ({stats.declined})</span></div>
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-200" /><span>Pending</span></div>
                                    </div>
                                </div>
                            </div>

                            {/* Meal Summary */}
                            <div className="p-8 rounded-3xl bg-white border border-border soft-shadow">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary/50 mb-6">Meal Preferences</h3>
                                <div className="space-y-3">
                                    {Object.entries(stats.meals).sort((a, b) => b[1] - a[1]).map(([pref, count]) => (
                                        <div key={pref} className="flex items-center justify-between">
                                            <span className="text-sm">{pref}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 bg-primary/20 rounded-full" style={{ width: `${(count / stats.total) * 80}px` }}>
                                                    <div className="h-full bg-primary rounded-full" style={{ width: '100%' }} />
                                                </div>
                                                <span className="text-xs font-bold text-text-secondary/60">{count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Song Requests */}
                        {stats.songs.length > 0 && (
                            <div className="p-8 rounded-3xl bg-white border border-border soft-shadow">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary/50 mb-6 flex items-center gap-2">
                                    <Music className="w-4 h-4" /> Song Requests ({stats.songs.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {stats.songs.map((s, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-neutral/50">
                                            <span className="text-lg">🎵</span>
                                            <div>
                                                <p className="font-bold text-sm">{s.song}</p>
                                                <p className="text-xs text-text-secondary/50">— {s.name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* RSVP List with Search + Filter + CSV */}
                        <div className="bg-white rounded-3xl border border-border soft-shadow overflow-hidden">
                            <div className="p-6 border-b border-border space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-serif font-bold text-foreground">Guest List</h3>
                                    <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">
                                        <Download className="w-4 h-4" /> Export CSV
                                    </button>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/30" />
                                        <input
                                            placeholder="Search guests..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border focus:border-primary outline-none text-sm bg-neutral"
                                        />
                                    </div>
                                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}
                                        className="px-4 py-3 rounded-xl border border-border text-sm bg-neutral focus:border-primary outline-none">
                                        <option value="all">All</option>
                                        <option value="Yes">Attending</option>
                                        <option value="No">Declined</option>
                                    </select>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-neutral text-text-secondary/60 text-[10px] uppercase tracking-widest font-bold">
                                        <tr>
                                            <th className="px-6 py-3">Guest Name</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3">Guests</th>
                                            <th className="px-6 py-3">Meal</th>
                                            <th className="px-6 py-3">Song</th>
                                            <th className="px-6 py-3">Message</th>
                                            <th className="px-6 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredRsvps.map((rsvp: any) => (
                                            <tr key={rsvp.id} className="hover:bg-neutral/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-foreground">{rsvp.guest_name}</p>
                                                    {rsvp.plus_one_names && <p className="text-xs text-text-secondary/50 mt-1">+{rsvp.plus_one_names}</p>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${rsvp.attendance === 'Yes' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                                        {rsvp.attendance === 'Yes' ? 'Attending' : 'Declined'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-text-secondary font-medium">
                                                    {rsvp.num_guests}{rsvp.children_count > 0 && <span className="text-xs text-blue-400 ml-1">+{rsvp.children_count} kids</span>}
                                                </td>
                                                <td className="px-6 py-4 text-text-secondary text-sm">{rsvp.meal_preference || '-'}</td>
                                                <td className="px-6 py-4 text-text-secondary/50 text-sm italic max-w-[120px] truncate">{rsvp.song_request || '-'}</td>
                                                <td className="px-6 py-4 text-text-secondary/50 italic text-sm max-w-[150px] truncate">{rsvp.message || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <button onClick={() => deleteRsvp(rsvp.id)} className="text-text-secondary/30 hover:text-red-500 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredRsvps.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-16 text-center text-text-secondary/30 italic font-serif text-lg">
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
                    <div className="space-y-8">
                        {/* Share Card */}
                        <div className="p-8 rounded-3xl bg-primary text-white shadow-xl shadow-primary/20">
                            <Share2 className="w-8 h-8 mb-6 text-white/40" />
                            <h3 className="text-2xl font-serif font-bold mb-4">Share Invitation</h3>
                            <p className="text-white/70 mb-6 border-b border-white/20 pb-4 break-all font-mono text-xs">{url}</p>
                            <div className="bg-white p-6 rounded-2xl flex justify-center mb-6 shadow-inner">
                                <QRCodeSVG value={url} size={180} fgColor="#D16C78" />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <button onClick={copyLink} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                                    <Copy className="w-5 h-5" />
                                    <span className="text-[10px] font-bold">{copyToast ? 'Copied!' : 'Copy'}</span>
                                </button>
                                <button onClick={shareWhatsApp} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                                    <MessageCircle className="w-5 h-5" />
                                    <span className="text-[10px] font-bold">WhatsApp</span>
                                </button>
                                <button onClick={shareEmail} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                                    <Mail className="w-5 h-5" />
                                    <span className="text-[10px] font-bold">Email</span>
                                </button>
                            </div>
                        </div>

                        {/* Event Details */}
                        <div className="p-8 rounded-3xl bg-white border border-border soft-shadow">
                            <h3 className="text-xl font-serif font-bold mb-6 text-foreground border-b border-border pb-4">Event Details</h3>
                            <div className="space-y-6 text-sm">
                                <div>
                                    <span className="text-text-secondary/60 block text-[10px] uppercase tracking-widest font-bold pb-2">Date &amp; Time</span>
                                    <span className="font-bold text-foreground text-base">{wedding.wedding_date} @ {wedding.wedding_time}</span>
                                </div>
                                <div>
                                    <span className="text-text-secondary/60 block text-[10px] uppercase tracking-widest font-bold pb-2">Venue</span>
                                    <span className="font-bold text-foreground text-base">{wedding.venue_name}</span>
                                </div>
                                <div>
                                    <span className="text-text-secondary/60 block text-[10px] uppercase tracking-widest font-bold pb-2">RSVP Deadline</span>
                                    <span className="font-bold text-primary text-base">{wedding.rsvp_deadline}</span>
                                </div>
                                <div>
                                    <span className="text-text-secondary/60 block text-[10px] uppercase tracking-widest font-bold pb-2">Template</span>
                                    <span className="font-bold text-foreground text-base capitalize">{wedding.template}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
