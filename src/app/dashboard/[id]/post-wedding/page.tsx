'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Camera,
    CheckCircle2,
    ExternalLink,
    Heart,
    Image as ImageIcon,
    Loader2,
    Mail,
    MessageSquareHeart,
    PartyPopper,
    RefreshCw,
    Save,
    Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getCachedSession } from '@/lib/session-cache';

type PostWeddingSettings = {
    is_thank_you_mode: boolean;
    thank_you_message: string;
    photo_album_link: string;
    show_photos_in_thank_you_mode: boolean;
    show_guestbook_in_thank_you_mode: boolean;
    photo_recap_style: 'polaroid' | 'grid';
};

type Counters = {
    approvedPhotos: number;
    pendingPhotos: number;
    guestbookWishes: number;
};

type WeddingSummary = {
    id: string;
    bride_name?: string | null;
    groom_name?: string | null;
    wedding_date?: string | null;
    public_slug?: string | null;
};

const DEFAULT_SETTINGS: PostWeddingSettings = {
    is_thank_you_mode: false,
    thank_you_message: '',
    photo_album_link: '',
    show_photos_in_thank_you_mode: true,
    show_guestbook_in_thank_you_mode: true,
    photo_recap_style: 'polaroid',
};

const PRESET_MESSAGES = [
    {
        label: 'Classic Heartfelt',
        text: 'Thank you so much for celebrating our special day with us. Your love, laughter, and presence made our wedding unforgettable. We are forever grateful to have you in our lives!',
    },
    {
        label: 'Warm & Candid',
        text: 'What a magical celebration! Thank you from the bottom of our hearts for dancing, cheering, and making our wedding day the happiest day of our lives. We love you all!',
    },
    {
        label: 'Honeymoon Gratitude',
        text: 'Looking back on our wedding day fills our hearts with so much joy. Thank you for your warmth, blessings, and generous wishes as we begin this new adventure together as husband and wife!',
    },
];

async function getToken() {
    const { data } = await getCachedSession();
    return data.session?.access_token || '';
}

export default function PostWeddingModePage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    const weddingId = params?.id || '';

    const [wedding, setWedding] = useState<WeddingSummary | null>(null);
    const [settings, setSettings] = useState<PostWeddingSettings>(DEFAULT_SETTINGS);
    const [counters, setCounters] = useState<Counters>({ approvedPhotos: 0, pendingPhotos: 0, guestbookWishes: 0 });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const coupleNames = useMemo(() => {
        if (!wedding) return 'Wedding';
        return [wedding.bride_name, wedding.groom_name].filter(Boolean).join(' & ') || 'Wedding';
    }, [wedding]);

    const openedFrom = searchParams?.get('from');
    const backHref = openedFrom === 'planner' ? `/dashboard/${weddingId}/planner` : `/dashboard/${weddingId}`;
    const backLabel = openedFrom === 'planner' ? 'Wedding Planner' : 'Dashboard';

    const loadData = useCallback(async () => {
        const token = await getToken();
        if (!token) {
            router.push('/login');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/post-wedding/settings?weddingId=${encodeURIComponent(weddingId)}`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Failed to load post-wedding settings.');

            if (data.wedding) setWedding(data.wedding);
            if (data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
            if (data.counters) setCounters(data.counters);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load post-wedding settings.');
        } finally {
            setLoading(false);
        }
    }, [router, weddingId]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (user && weddingId) void loadData();
    }, [authLoading, user, weddingId, router, loadData]);

    const saveSettings = async (nextSettings = settings) => {
        const token = await getToken();
        if (!token) return router.push('/login');

        setSaving(true);
        setError('');
        setMessage('');
        try {
            const res = await fetch('/api/post-wedding/settings', {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ weddingId, ...nextSettings }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Failed to save settings.');

            setSettings((prev) => ({ ...prev, ...(data.settings || {}) }));
            setMessage('Post-wedding settings updated successfully!');
            setTimeout(() => setMessage(''), 4000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to save settings.');
            throw err;
        } finally {
            setSaving(false);
        }
    };

    const toggleMode = async () => {
        const previousSettings = settings;
        const next = { ...settings, is_thank_you_mode: !settings.is_thank_you_mode };
        setSettings(next);
        try {
            await saveSettings(next);
        } catch {
            setSettings(previousSettings);
        }
    };


    const publicUrl = wedding?.public_slug ? `/w/${wedding.public_slug}` : `/w/${weddingId}`;

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-3 text-text-secondary">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm font-medium">Loading Post-Wedding Mode...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-foreground pb-24">
            {/* ── Top Bar ────────────────────────────────────────────── */}
            <div className="sticky top-0 z-30 border-b border-border/80 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
                    <Link
                        href={backHref}
                        className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-foreground transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to {backLabel}</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <a
                            href={publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 py-1.5 text-xs font-bold text-text-secondary shadow-xs hover:border-primary/40 hover:text-primary transition"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Preview Live Site</span>
                        </a>
                        <button
                            type="button"
                            onClick={() => saveSettings()}
                            disabled={saving}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-primary-hover disabled:opacity-50 transition"
                        >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            <span>Save Changes</span>
                        </button>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
                {/* ── Header Banner ──────────────────────────────────────── */}
                <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-white to-amber-50/40 p-6 sm:p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-2 max-w-2xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white/80 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-primary shadow-xs">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>After The Celebration</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-foreground">
                                Post-Wedding Mode
                            </h1>
                            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                                Transform your wedding website for <span className="font-bold text-foreground">{coupleNames}</span> into a digital memory book with thank-you notes, approved disposable camera photos, and the guestbook Wall of Love.
                            </p>
                        </div>

                        {/* Master Toggle */}
                        <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-black uppercase tracking-wider text-text-secondary">
                                    {settings.is_thank_you_mode ? 'Active' : 'Inactive'}
                                </span>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={settings.is_thank_you_mode}
                                    onClick={toggleMode}
                                    className={`grid h-10 w-20 shrink-0 grid-cols-2 rounded-xl border p-1 text-[9px] font-black uppercase tracking-widest transition-colors focus:ring-2 focus:ring-primary/20 ${
                                        settings.is_thank_you_mode
                                            ? 'border-primary/40 bg-primary/10 text-primary'
                                            : 'border-border bg-white text-text-secondary'
                                    }`}
                                >
                                    <span className={`flex items-center justify-center rounded-lg transition ${!settings.is_thank_you_mode ? 'bg-neutral text-foreground shadow-sm' : ''}`}>Off</span>
                                    <span className={`flex items-center justify-center rounded-lg transition ${settings.is_thank_you_mode ? 'bg-primary text-white shadow-sm' : ''}`}>On</span>
                                </button>
                            </div>
                            <p className="text-[11px] text-text-secondary/80">
                                {settings.is_thank_you_mode ? 'Public site displays post-wedding recap' : 'Public site displays pre-wedding RSVP'}
                            </p>
                        </div>
                    </div>

                    {/* Alerts / Feedback */}
                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-bold text-emerald-800"
                            >
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>{message}</span>
                            </motion.div>
                        )}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mt-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs font-bold text-red-800"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Quick Stats Grid ───────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Approved Photos</span>
                            <div className="rounded-full bg-primary/10 p-2 text-primary">
                                <Camera className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="mt-2 text-2xl font-serif font-black text-foreground">{counters.approvedPhotos}</p>
                        <Link
                            href={`/dashboard/${weddingId}/photo-uploads`}
                            className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                        >
                            <span>Manage photos</span>
                            <ExternalLink className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Pending Review</span>
                            <div className={`rounded-full p-2 ${counters.pendingPhotos > 0 ? 'bg-amber-100 text-amber-700' : 'bg-neutral text-text-secondary'}`}>
                                <ImageIcon className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="mt-2 text-2xl font-serif font-black text-foreground">{counters.pendingPhotos}</p>
                        <p className="mt-2 text-[11px] text-text-secondary">
                            {counters.pendingPhotos > 0 ? 'Guest uploads awaiting approval' : 'All guest uploads reviewed'}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Guestbook Wishes</span>
                            <div className="rounded-full bg-rose-50 p-2 text-rose-500">
                                <Heart className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="mt-2 text-2xl font-serif font-black text-foreground">{counters.guestbookWishes}</p>
                        <p className="mt-2 text-[11px] text-text-secondary">Heartfelt notes on the Wall of Love</p>
                    </div>
                </div>

                {/* ── Section 1: Thank You Message ────────────────────────── */}
                <div className="rounded-3xl border border-border bg-white p-6 sm:p-8 space-y-4 shadow-xs">
                    <div className="flex items-center gap-2.5">
                        <div className="rounded-xl bg-primary/10 p-2 text-primary">
                            <PartyPopper className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-foreground">Thank You Message</h2>
                            <p className="text-xs text-text-secondary">The primary message displayed at the top of your post-wedding website.</p>
                        </div>
                    </div>

                    {/* Presets */}
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block mb-2">
                            Quick Inspo Presets
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {PRESET_MESSAGES.map((preset) => (
                                <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => setSettings((prev) => ({ ...prev, thank_you_message: preset.text }))}
                                    className="rounded-xl border border-border bg-neutral/40 px-3 py-1.5 text-xs font-bold text-text-secondary hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition"
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <textarea
                        value={settings.thank_you_message}
                        onChange={(e) => setSettings((prev) => ({ ...prev, thank_you_message: e.target.value }))}
                        placeholder="Thank you so much for celebrating our special day with us..."
                        rows={4}
                        className="w-full rounded-2xl border border-border bg-neutral/30 p-4 text-sm leading-relaxed outline-none focus:border-primary focus:bg-white transition"
                    />
                </div>

                {/* ── Section 2: Disposable Camera & Photos ──────────────── */}
                <div className="rounded-3xl border border-border bg-white p-6 sm:p-8 space-y-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="rounded-xl bg-primary/10 p-2 text-primary">
                                <Camera className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-foreground">Disposable Camera &amp; Guest Photos</h2>
                                <p className="text-xs text-text-secondary">Display candid snapshots approved from your Disposable Camera portal.</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            role="switch"
                            aria-checked={settings.show_photos_in_thank_you_mode}
                            onClick={() => setSettings((prev) => ({ ...prev, show_photos_in_thank_you_mode: !prev.show_photos_in_thank_you_mode }))}
                            className={`grid h-9 w-[76px] shrink-0 grid-cols-2 rounded-xl border p-0.5 text-[9px] font-black uppercase tracking-widest transition-colors ${
                                settings.show_photos_in_thank_you_mode
                                    ? 'border-primary/40 bg-primary/10 text-primary'
                                    : 'border-border bg-white text-text-secondary'
                            }`}
                        >
                            <span className={`flex items-center justify-center rounded-lg transition ${!settings.show_photos_in_thank_you_mode ? 'bg-neutral text-foreground shadow-sm' : ''}`}>Off</span>
                            <span className={`flex items-center justify-center rounded-lg transition ${settings.show_photos_in_thank_you_mode ? 'bg-primary text-white shadow-sm' : ''}`}>On</span>
                        </button>
                    </div>

                    {settings.show_photos_in_thank_you_mode && (
                        <div className="space-y-4 pt-4 border-t border-border">
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block mb-2">
                                    Display Layout
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSettings((prev) => ({ ...prev, photo_recap_style: 'polaroid' }))}
                                        className={`p-4 rounded-2xl border text-left transition ${
                                            settings.photo_recap_style !== 'grid'
                                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                : 'border-border bg-white hover:border-text-secondary'
                                        }`}
                                    >
                                        <p className="font-bold text-sm text-foreground">Polaroid Film Roll</p>
                                        <p className="text-xs text-text-secondary mt-1">
                                            Retro Polaroid frames with guest captions, uploader name badge, and nostalgic disposable camera date stamps.
                                        </p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setSettings((prev) => ({ ...prev, photo_recap_style: 'grid' }))}
                                        className={`p-4 rounded-2xl border text-left transition ${
                                            settings.photo_recap_style === 'grid'
                                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                : 'border-border bg-white hover:border-text-secondary'
                                        }`}
                                    >
                                        <p className="font-bold text-sm text-foreground">Clean Modern Grid</p>
                                        <p className="text-xs text-text-secondary mt-1">
                                            Sleek, edge-to-edge responsive masonry photo grid with hover previews and lightbox viewer.
                                        </p>
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-2xl bg-neutral/40 p-4 border border-border">
                                <div className="text-xs text-text-secondary">
                                    <p className="font-bold text-foreground">Need to review guest photos?</p>
                                    <p>Approve candid photos before they appear on your live site.</p>
                                </div>
                                <Link
                                    href={`/dashboard/${weddingId}/photo-uploads`}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-border px-3.5 py-2 text-xs font-bold text-primary shadow-xs hover:border-primary transition"
                                >
                                    <Camera className="w-3.5 h-3.5" />
                                    <span>Open Photo Manager</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Section 3: Wall of Love (Guestbook) ────────────────── */}
                <div className="rounded-3xl border border-border bg-white p-6 sm:p-8 space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="rounded-xl bg-rose-50 p-2 text-rose-500">
                                <MessageSquareHeart className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-foreground">Wall of Love (Guestbook Wishes)</h2>
                                <p className="text-xs text-text-secondary">Showcase heartfelt messages from guests and allow late visitors to leave blessings.</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            role="switch"
                            aria-checked={settings.show_guestbook_in_thank_you_mode}
                            onClick={() => setSettings((prev) => ({ ...prev, show_guestbook_in_thank_you_mode: !prev.show_guestbook_in_thank_you_mode }))}
                            className={`grid h-9 w-[76px] shrink-0 grid-cols-2 rounded-xl border p-0.5 text-[9px] font-black uppercase tracking-widest transition-colors ${
                                settings.show_guestbook_in_thank_you_mode
                                    ? 'border-primary/40 bg-primary/10 text-primary'
                                    : 'border-border bg-white text-text-secondary'
                            }`}
                        >
                            <span className={`flex items-center justify-center rounded-lg transition ${!settings.show_guestbook_in_thank_you_mode ? 'bg-neutral text-foreground shadow-sm' : ''}`}>Off</span>
                            <span className={`flex items-center justify-center rounded-lg transition ${settings.show_guestbook_in_thank_you_mode ? 'bg-primary text-white shadow-sm' : ''}`}>On</span>
                        </button>
                    </div>
                </div>

                {/* ── Section 4: Official Photo Album Link ───────────────── */}
                <div className="rounded-3xl border border-border bg-white p-6 sm:p-8 space-y-3 shadow-xs">
                    <div className="flex items-center gap-2.5">
                        <div className="rounded-xl bg-primary/10 p-2 text-primary">
                            <ImageIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-foreground">Official Photo Album Link (Optional)</h2>
                            <p className="text-xs text-text-secondary">Link to your professional photographer gallery, Google Drive, or Dropbox.</p>
                        </div>
                    </div>

                    <input
                        type="url"
                        value={settings.photo_album_link}
                        onChange={(e) => setSettings((prev) => ({ ...prev, photo_album_link: e.target.value }))}
                        placeholder="https://photos.google.com/... or https://pixieset.com/..."
                        className="w-full rounded-2xl border border-border bg-neutral/30 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white transition"
                    />
                </div>

                {/* ── Section 5: Unified Thank-You Email Dispatch ────────── */}
                <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/5 via-white to-amber-50/20 p-6 sm:p-8 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-1.5 max-w-xl">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                                <Mail className="w-4 h-4" />
                                <span>Guest Communication</span>
                            </div>
                            <h3 className="text-lg font-bold text-foreground">Send Thank-You Notes by Email</h3>
                            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                                Reach out directly to your attended guests with personalized thank-you emails, your couple signature, and links to your post-wedding gallery.
                            </p>
                        </div>

                        <Link
                            href={`/dashboard/${weddingId}/thank-you?from=post-wedding`}
                            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-primary-hover hover:-translate-y-0.5 transition"
                        >
                            <Mail className="w-4 h-4" />
                            <span>Open Thank-You Email Composer</span>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
