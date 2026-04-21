'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Heart, Plus, Calendar, MapPin, ArrowRight, Loader2, Copy, CheckCheck, ExternalLink, Pencil, Trash2, Settings, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import UpgradeButton from '@/components/UpgradeButton';
import { acceptWeddingInvite, listSharedWeddings } from '@/lib/wedding-features';

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
        colorClass = 'bg-emerald-50 text-emerald-600 border-emerald-200';
    } else if (rsvpDeadline < now) {
        label = 'RSVP Closed';
        colorClass = 'bg-neutral text-text-secondary border-border';
    } else {
        label = 'Live';
        colorClass = 'bg-emerald-50 text-emerald-600 border-emerald-200';
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
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const [weddings, setWeddings] = useState<any[]>([]);
    const [sharedWeddings, setSharedWeddings] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    const fetchWeddings = useCallback(async () => {
        if (!user) return;
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

    const handleClaimWedding = async () => {
        const weddingId = window.prompt("Enter your 8-character Wedding ID (from your invitation URL):");
        if (!weddingId || weddingId.length < 5) return;

        setIsSyncing(true);
        try {
            // First check if it exists and who it belongs to
            const { data: wedding, error: fetchError } = await supabase
                .from('weddings')
                .select('id, user_id, bride_name, groom_name')
                .eq('id', weddingId)
                .single();

            if (fetchError || !wedding) {
                alert("Wedding not found. Please double-check the ID.");
                return;
            }

            if (wedding.user_id && wedding.user_id !== user?.id) {
                const confirmClaim = window.confirm(`This wedding (${wedding.bride_name} & ${wedding.groom_name}) is already linked to another account. Would you like to link it to your current account?`);
                if (!confirmClaim) return;
            }

            // Link it to the current user
            const { error: updateError } = await supabase
                .from('weddings')
                .update({ user_id: user?.id })
                .eq('id', weddingId);

            if (updateError) throw updateError;

            alert("Wedding successfully linked to your account!");
            fetchWeddings();
        } catch (err: any) {
            alert("Error linking wedding: " + err.message);
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }
        if (user) fetchWeddings();
    }, [user, loading, router, fetchWeddings]);

    if (loading || (fetching && weddings.length === 0)) {
        return (
            <div className="mobile-safe-screen flex flex-col items-center justify-center bg-neutral/30 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-text-secondary font-serif italic text-sm">Loading your weddings...</p>
            </div>
        );
    }

    return (
        <div className="mobile-safe-screen bg-neutral pb-16 sm:pb-20 mobile-safe-bottom">
            {/* Top nav */}
            <div className="bg-white/80 backdrop-blur-md border-b border-border p-3 sm:p-4 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-2 sm:px-4 flex justify-between items-center gap-2 sm:gap-4">
                    <Link href="/" className="flex items-center flex-shrink-0">
                        <img src="/logo.png" alt="QuickWeds Logo" className="h-10 sm:h-12 w-auto object-contain hover:scale-105 transition-transform" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleClaimWedding}
                            disabled={isSyncing}
                            className="hidden sm:flex px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-primary/20 text-primary text-xs sm:text-sm font-bold hover:bg-primary/5 transition-all items-center gap-2 min-h-[44px]"
                        >
                            {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            Sync Missing
                        </button>
                        <Link
                            href="/builder"
                            className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-primary text-white text-xs sm:text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center gap-2 min-h-[44px] whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4 flex-shrink-0" />
                            <span className="hidden sm:inline">Create New Wedding</span>
                            <span className="sm:hidden">New</span>
                        </Link>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-3 sm:px-6 pt-6 sm:pt-12">
                <header className="mb-8 sm:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground mb-1">
                            Welcome, {user?.user_metadata?.full_name?.split(' ')[0] || 'Bride & Groom'} 👋
                        </h1>
                        <p className="text-sm sm:text-base text-text-secondary">
                            {weddings.length > 0
                                ? `You have ${weddings.length} wedding${weddings.length > 1 ? 's' : ''} · ${weddings.reduce((a, w) => a + (w.rsvps?.length || 0), 0)} total RSVPs`
                                : 'Create your first wedding site below'}
                        </p>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end gap-1">
                        <p className="text-[10px] text-text-secondary font-mono opacity-50 uppercase tracking-tighter">ID: {user?.id.slice(0, 12)}...</p>
                        <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">{user?.email}</p>
                    </div>
                </header>

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
                        <h2 className="text-xl sm:text-3xl font-serif font-bold text-foreground mb-3 sm:mb-4">No weddings yet</h2>
                        <p className="text-sm sm:text-base text-text-secondary mb-6 sm:mb-10 max-w-sm mx-auto">
                            Create your first beautiful wedding landing page and invitation in minutes.
                        </p>
                        
                        <div className="flex flex-col items-center gap-6">
                            <Link
                                href="/builder"
                                className="inline-flex items-center gap-2 px-8 sm:px-12 py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 min-h-[44px] text-sm sm:text-base"
                            >
                                Create Your First Wedding <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                            </Link>
                            
                            <div className="pt-8 border-t border-border w-full max-w-md">
                                <h3 className="text-sm font-bold text-foreground mb-2">Missing your existing weddings?</h3>
                                <p className="text-xs text-text-secondary mb-4 leading-relaxed">
                                    If you created a wedding but don't see it here, you might have signed in with a different account method (Google vs Email).
                                </p>
                                <button 
                                    onClick={handleClaimWedding}
                                    className="text-primary text-sm font-black uppercase tracking-widest hover:underline flex items-center gap-2 mx-auto"
                                >
                                    <Sparkles className="w-4 h-4" /> Sync Missing Wedding
                                </button>
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
                                    <div className="aspect-[16/10] bg-neutral relative overflow-hidden">
                                        {wedding.hero_image ? (
                                            <img
                                                src={wedding.hero_image}
                                                alt="Wedding"
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Heart className="w-16 sm:w-20 h-16 sm:h-20 text-primary/10" />
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
                                                Planner
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

                                        {/* Upgrade prompt */}
                                        {!wedding.is_premium && !isAdmin && (
                                            <UpgradeButton weddingId={wedding.id} className="w-full text-xs sm:text-sm py-2 sm:py-2.5" />
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
