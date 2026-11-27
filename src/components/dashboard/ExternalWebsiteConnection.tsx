'use client';

import { useEffect, useState } from 'react';
import {
    AlertCircle,
    ArrowRight,
    CalendarDays,
    Check,
    CheckCircle2,
    Circle,
    Copy,
    ExternalLink,
    Globe,
    Heart,
    ImagePlus,
    Link2,
    Loader2,
    Lock,
    MapPin,
    Palette,
    Sparkles,
    Trash2,
    Users,
} from 'lucide-react';
import Link from 'next/link';
import { getCachedSession } from '@/lib/session-cache';
import { supabase } from '@/lib/supabase';
import { normalizeExternalWebsiteUrl } from '@/lib/url-safety';
import QrCodeActions from '@/components/dashboard/QrCodeActions';

type ConnectionWedding = {
    id: string;
    bride_name: string | null;
    groom_name: string | null;
    wedding_date: string | null;
    wedding_time: string | null;
    venue_name: string | null;
    rsvp_deadline: string | null;
    motif_color: string | null;
    hero_image?: string | null;
    external_website_url: string | null;
    rsvp_page_enabled: boolean;
    planner_only: boolean;
};

type ConnectionForm = {
    brideName: string;
    groomName: string;
    externalWebsiteUrl: string;
    weddingDate: string;
    weddingTime: string;
    venueName: string;
    rsvpDeadline: string;
    motifColor: string;
    heroImage: string;
    rsvpPageEnabled: boolean;
};

type PlatformTab = 'canva' | 'ghl' | 'other';

const COLOR_PRESETS = [
    { name: 'Dusty Rose', hex: '#D16C78' },
    { name: 'Deep Berry', hex: '#A35165' },
    { name: 'Terracotta', hex: '#B86B52' },
    { name: 'Sage', hex: '#6B8273' },
    { name: 'Champagne Gold', hex: '#B5945B' },
    { name: 'Midnight Navy', hex: '#2F4156' },
];

function toForm(wedding: ConnectionWedding): ConnectionForm {
    return {
        brideName: wedding.bride_name || '',
        groomName: wedding.groom_name || '',
        externalWebsiteUrl: wedding.external_website_url || '',
        weddingDate: wedding.wedding_date?.slice(0, 10) || '',
        weddingTime: wedding.wedding_time?.slice(0, 5) || '',
        venueName: wedding.venue_name || '',
        rsvpDeadline: wedding.rsvp_deadline?.slice(0, 10) || '',
        motifColor: /^#[\da-f]{6}$/i.test(wedding.motif_color || '') ? wedding.motif_color! : '#D16C78',
        heroImage: wedding.hero_image || '',
        rsvpPageEnabled: Boolean(wedding.rsvp_page_enabled),
    };
}

function formatPreviewDate(value: string) {
    if (!value) return 'Your wedding date';
    const date = new Date(`${value.slice(0, 10)}T12:00:00`);
    return Number.isFinite(date.getTime())
        ? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : value;
}

function isFormDirty(form: ConnectionForm | null, saved: ConnectionWedding | null) {
    if (!form || !saved) return false;
    const base = toForm(saved);
    return (
        form.brideName !== base.brideName ||
        form.groomName !== base.groomName ||
        form.externalWebsiteUrl !== base.externalWebsiteUrl ||
        form.weddingDate !== base.weddingDate ||
        form.weddingTime !== base.weddingTime ||
        form.venueName !== base.venueName ||
        form.rsvpDeadline !== base.rsvpDeadline ||
        form.motifColor.toLowerCase() !== base.motifColor.toLowerCase() ||
        form.heroImage !== base.heroImage ||
        form.rsvpPageEnabled !== base.rsvpPageEnabled
    );
}

export default function ExternalWebsiteConnection({ weddingId }: { weddingId: string }) {
    const [saved, setSaved] = useState<ConnectionWedding | null>(null);
    const [form, setForm] = useState<ConnectionForm | null>(null);
    const [canManage, setCanManage] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [reload, setReload] = useState(0);
    const [origin, setOrigin] = useState('');
    const [copiedLink, setCopiedLink] = useState(false);
    const [platformTab, setPlatformTab] = useState<PlatformTab>('canva');
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    async function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file || !form || !canManage || uploadingPhoto) return;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a JPG, PNG, or WebP photo.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('Please choose a photo smaller than 10 MB.');
            return;
        }
        setUploadingPhoto(true);
        setError('');
        setStatus('');
        try {
            const { data } = await getCachedSession();
            const userId = data.session?.user?.id;
            if (!userId) throw new Error('Please sign in again to upload a photo.');
            const ext = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) || 'jpg';
            const filePath = `${userId}/${weddingId}/hero-${crypto.randomUUID()}.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from('quickweds')
                .upload(filePath, file, { upsert: false, contentType: file.type });
            if (uploadError) throw uploadError;
            const { data: urlData } = supabase.storage.from('quickweds').getPublicUrl(filePath);
            if (!urlData?.publicUrl) throw new Error('Unable to read the uploaded photo link.');
            setForm((current) => (current ? { ...current, heroImage: urlData.publicUrl } : current));
            setStatus('Photo uploaded. Click Save connection to display it on your RSVP page and confirmation emails.');
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Unable to upload photo. Please try again.');
        } finally {
            setUploadingPhoto(false);
        }
    }

    useEffect(() => {
        let active = true;
        const controller = new AbortController();
        setOrigin(window.location.origin);
        setLoading(true);
        setError('');
        void (async () => {
            const { data } = await getCachedSession();
            const token = data.session?.access_token;
            if (!token) throw new Error('Please sign in again to manage your RSVP page.');
            const response = await fetch(`/api/planner/connection?weddingId=${encodeURIComponent(weddingId)}`, {
                headers: { Authorization: `Bearer ${token}` },
                signal: controller.signal,
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok || !result.wedding) throw new Error(result.error || 'Unable to load your website connection.');
            if (active) {
                setSaved(result.wedding);
                setForm(toForm(result.wedding));
                setCanManage(Boolean(result.canManage));
            }
        })()
            .catch((reason) => {
                if (active) setError(reason instanceof Error ? reason.message : 'Unable to load your website connection.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
            controller.abort();
        };
    }, [weddingId, reload]);

    async function save(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!form || saving || !canManage) return;
        setSaving(true);
        setError('');
        setStatus('');
        try {
            const { data } = await getCachedSession();
            const token = data.session?.access_token;
            if (!token) throw new Error('Please sign in again to save your RSVP page.');
            const response = await fetch('/api/planner/connection', {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ weddingId, ...form }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok || !result.wedding) throw new Error(result.error || 'Unable to save your website connection.');
            setSaved(result.wedding);
            setForm(toForm(result.wedding));
            setStatus(
                result.wedding.rsvp_page_enabled
                    ? 'Saved. Your RSVP page is ready to share.'
                    : 'Saved. Your RSVP page is turned off.'
            );
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Unable to save your website connection.');
        } finally {
            setSaving(false);
        }
    }

    async function copyQuickLink() {
        if (!rsvpUrl) return;
        try {
            await navigator.clipboard.writeText(rsvpUrl);
            setCopiedLink(true);
            setStatus('Copied your QuickWeds RSVP link. Paste it into your website RSVP button.');
            setTimeout(() => setCopiedLink(false), 2500);
        } catch {
            setStatus('Select and copy the RSVP link below.');
        }
    }

    const inputClass =
        'mt-2 min-h-11 w-full min-w-0 rounded-xl border border-border bg-neutral/40 px-3.5 py-2.5 text-base text-foreground transition placeholder:text-text-secondary/60 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-neutral disabled:text-text-secondary';
    const rsvpUrl = saved?.rsvp_page_enabled && origin ? `${origin}/rsvp/${encodeURIComponent(saved.id)}` : '';
    const externalUrl = saved?.external_website_url?.startsWith('https://') ? saved.external_website_url : '';
    const dirty = isFormDirty(form, saved);
    const previewColor = form?.motifColor && /^#[\da-f]{6}$/i.test(form.motifColor) ? form.motifColor : '#D16C78';
    const previewHeroPhoto = form?.heroImage ? normalizeExternalWebsiteUrl(form.heroImage) : null;

    const checklistItems = form
        ? [
              { label: 'Published HTTPS wedding website link', done: form.externalWebsiteUrl.trim().startsWith('https://') },
              { label: 'Both partner names added', done: Boolean(form.brideName.trim() && form.groomName.trim()) },
              { label: 'Wedding date selected', done: Boolean(form.weddingDate) },
              { label: 'RSVP deadline set on or before wedding date', done: Boolean(form.rsvpDeadline && (!form.weddingDate || form.rsvpDeadline <= form.weddingDate)) },
              { label: 'Public RSVP page enabled & saved', done: Boolean(saved?.rsvp_page_enabled) },
          ]
        : [];

    return (
        <section className="min-w-0 space-y-6">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-white p-5 shadow-xl shadow-primary/5 sm:p-8">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
                />
                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                            <Link2 className="h-3.5 w-3.5" /> Your website + QuickWeds
                        </span>
                        <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-foreground sm:text-4xl">
                            Keep the wedding website you love
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                            Connect the website you made with Canva, GoHighLevel, or another builder. QuickWeds collects your RSVPs and keeps your guest list, seating, and planning together automatically.
                        </p>
                    </div>

                    {!loading && saved?.planner_only && (
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                            <span
                                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold ${
                                    saved.rsvp_page_enabled
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                        : 'border-amber-200 bg-amber-50 text-amber-800'
                                }`}
                            >
                                <span
                                    className={`h-2 w-2 rounded-full ${
                                        saved.rsvp_page_enabled ? 'bg-emerald-500' : 'bg-amber-500'
                                    }`}
                                />
                                {saved.rsvp_page_enabled ? 'RSVP page live' : 'RSVP page private'}
                            </span>
                            {dirty && (
                                <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                                    Unsaved changes
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Visual data-flow bar */}
                <div className="relative mt-6 grid gap-2.5 rounded-2xl border border-border/80 bg-neutral/60 p-3.5 sm:grid-cols-3 sm:gap-3">
                    <div className="flex items-center gap-2.5 rounded-xl bg-white px-3.5 py-2.5 shadow-sm">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Globe className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground">1. Your Website</p>
                            <p className="truncate text-[11px] text-text-secondary">Guest taps RSVP button</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 rounded-xl bg-white px-3.5 py-2.5 shadow-sm">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Heart className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground">2. QuickWeds RSVP</p>
                            <p className="truncate text-[11px] text-text-secondary">Collects guests & meals</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 rounded-xl bg-white px-3.5 py-2.5 shadow-sm">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Users className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground">3. Your Planner</p>
                            <p className="truncate text-[11px] text-text-secondary">Syncs guests, seating & counts</p>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div
                    role="alert"
                    className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1">{error}</span>
                    {!form && (
                        <button
                            type="button"
                            onClick={() => setReload((value) => value + 1)}
                            className="min-h-11 rounded-xl border border-red-200 bg-white px-3.5 text-xs font-bold text-red-700"
                        >
                            Try again
                        </button>
                    )}
                </div>
            )}

            {status && (
                <p
                    role="status"
                    className="flex items-center gap-2.5 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm font-semibold text-primary"
                >
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{status}</span>
                </p>
            )}

            {!loading && saved && !saved.planner_only && (
                <div className="rounded-2xl border border-border bg-white p-6 text-sm leading-6 shadow-sm">
                    <p className="font-semibold text-foreground">
                        This wedding already has a QuickWeds website.{' '}
                        <Link href="/planner?goal=external" className="font-bold text-primary underline">
                            Start a private workspace
                        </Link>{' '}
                        to connect an external website.
                    </p>
                </div>
            )}

            {loading ? (
                <div
                    role="status"
                    className="flex items-center justify-center gap-2.5 rounded-3xl border border-border bg-white p-10 text-sm font-semibold text-text-secondary"
                >
                    <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading website connection…
                </div>
            ) : (
                form &&
                saved?.planner_only && (
                    <div className="grid min-w-0 items-start gap-6 lg:grid-cols-12">
                        {/* Left Column: Settings Form */}
                        <div className="min-w-0 space-y-4 lg:col-span-7">
                            {!canManage && (
                                <p className="flex items-center gap-2 rounded-2xl border border-border bg-white p-4 text-sm font-medium text-text-secondary">
                                    <Lock className="h-4 w-4 shrink-0 text-primary" />
                                    Only the wedding owner or partner can change this connection.
                                </p>
                            )}

                            <form
                                onSubmit={save}
                                className="min-w-0 rounded-[2rem] border border-border bg-white p-5 shadow-lg shadow-primary/5 sm:p-7"
                            >
                                <fieldset disabled={!canManage || saving} className="min-w-0 space-y-6">
                                    <div className="border-b border-border/70 pb-4">
                                        <legend className="font-serif text-2xl font-bold text-foreground">
                                            RSVP page details
                                        </legend>
                                        <p className="mt-1 text-xs leading-5 text-text-secondary">
                                            Customize the invitation details guests see when they open your standalone RSVP page.
                                        </p>
                                    </div>

                                    {/* Website URL */}
                                    <div className="min-w-0 space-y-2">
                                        <label className="block min-w-0 text-sm font-bold text-foreground">
                                            Your existing wedding website
                                            <input
                                                type="url"
                                                pattern="https://.*"
                                                required={form.rsvpPageEnabled}
                                                maxLength={2048}
                                                placeholder="https://your-wedding-website.com"
                                                value={form.externalWebsiteUrl}
                                                onChange={(event) =>
                                                    setForm({ ...form, externalWebsiteUrl: event.target.value })
                                                }
                                                className={inputClass}
                                                aria-describedby="external-website-help"
                                            />
                                        </label>
                                        <p id="external-website-help" className="text-xs leading-5 text-text-secondary">
                                            Use the published HTTPS link. Guests can return to this website right after submitting their RSVP.
                                        </p>
                                    </div>

                                    {/* Couple & Event Details */}
                                    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                                        <label className="min-w-0 text-sm font-bold text-foreground">
                                            First partner’s name
                                            <input
                                                required
                                                maxLength={100}
                                                value={form.brideName}
                                                onChange={(event) => setForm({ ...form, brideName: event.target.value })}
                                                className={inputClass}
                                            />
                                        </label>
                                        <label className="min-w-0 text-sm font-bold text-foreground">
                                            Second partner’s name
                                            <input
                                                required
                                                maxLength={100}
                                                value={form.groomName}
                                                onChange={(event) => setForm({ ...form, groomName: event.target.value })}
                                                className={inputClass}
                                            />
                                        </label>
                                        <label className="min-w-0 text-sm font-bold text-foreground">
                                            Wedding date
                                            <input
                                                type="date"
                                                required={form.rsvpPageEnabled}
                                                value={form.weddingDate}
                                                onChange={(event) => setForm({ ...form, weddingDate: event.target.value })}
                                                className={inputClass}
                                            />
                                        </label>
                                        <label className="min-w-0 text-sm font-bold text-foreground">
                                            Wedding time <span className="font-normal text-text-secondary">(optional)</span>
                                            <input
                                                type="time"
                                                value={form.weddingTime}
                                                onChange={(event) => setForm({ ...form, weddingTime: event.target.value })}
                                                className={inputClass}
                                            />
                                        </label>
                                        <label className="min-w-0 text-sm font-bold text-foreground">
                                            RSVP deadline
                                            <input
                                                type="date"
                                                required={form.rsvpPageEnabled}
                                                max={form.weddingDate || undefined}
                                                value={form.rsvpDeadline}
                                                onChange={(event) => setForm({ ...form, rsvpDeadline: event.target.value })}
                                                className={inputClass}
                                            />
                                        </label>
                                        <div className="min-w-0">
                                            <label className="block min-w-0 text-sm font-bold text-foreground">
                                                Accent color
                                                <input
                                                    type="color"
                                                    value={form.motifColor}
                                                    onChange={(event) =>
                                                        setForm({ ...form, motifColor: event.target.value })
                                                    }
                                                    className={`${inputClass} h-11 cursor-pointer p-1`}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Quick color swatches */}
                                    {canManage && (
                                        <div className="min-w-0 rounded-2xl border border-border/70 bg-neutral/50 p-3.5">
                                            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">
                                                <Palette className="h-3.5 w-3.5 text-primary" /> Match your website palette
                                            </p>
                                            <div className="mt-2.5 flex flex-wrap gap-2">
                                                {COLOR_PRESETS.map((preset) => {
                                                    const active =
                                                        form.motifColor.toLowerCase() === preset.hex.toLowerCase();
                                                    return (
                                                        <button
                                                            key={preset.hex}
                                                            type="button"
                                                            onClick={() => setForm({ ...form, motifColor: preset.hex })}
                                                            title={preset.name}
                                                            className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold transition ${
                                                                active
                                                                    ? 'border-foreground bg-white text-foreground shadow-sm'
                                                                    : 'border-border bg-white/80 text-text-secondary hover:border-primary/40'
                                                            }`}
                                                        >
                                                            <span
                                                                className="h-3.5 w-3.5 rounded-full border border-black/10"
                                                                style={{ backgroundColor: preset.hex }}
                                                            />
                                                            {preset.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <label className="block min-w-0 text-sm font-bold text-foreground">
                                        Venue <span className="font-normal text-text-secondary">(optional)</span>
                                        <input
                                            maxLength={300}
                                            placeholder="e.g. Botanical Conservatory Gardens"
                                            value={form.venueName}
                                            onChange={(event) => setForm({ ...form, venueName: event.target.value })}
                                            className={inputClass}
                                        />
                                    </label>

                                    {/* Couple / Email Photo Upload */}
                                    <div className="min-w-0 rounded-2xl border border-border/80 bg-neutral/50 p-4">
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-foreground">
                                                    Couple photo{' '}
                                                    <span className="font-normal text-text-secondary">
                                                        (for RSVP page &amp; emails)
                                                    </span>
                                                </p>
                                                <p className="mt-1 text-xs leading-5 text-text-secondary">
                                                    Add 1 photo to personalize your standalone RSVP page, guest RSVP confirmation emails, and thank-you notes.
                                                </p>
                                            </div>
                                        </div>

                                        {previewHeroPhoto ? (
                                            <div className="mt-3.5 flex flex-col gap-3 sm:flex-row sm:items-center">
                                                <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm sm:w-40 sm:shrink-0">
                                                    <img
                                                        src={previewHeroPhoto}
                                                        alt="Couple photo preview"
                                                        className="h-28 w-full object-cover"
                                                    />
                                                </div>
                                                {canManage && (
                                                    <div className="flex flex-wrap gap-2">
                                                        <label className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 text-xs font-bold text-foreground shadow-sm transition hover:border-primary/40 hover:text-primary">
                                                            <input
                                                                type="file"
                                                                accept="image/jpeg,image/png,image/webp"
                                                                onChange={handlePhotoUpload}
                                                                disabled={uploadingPhoto || saving}
                                                                className="sr-only"
                                                            />
                                                            {uploadingPhoto ? (
                                                                <>
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ImagePlus className="h-3.5 w-3.5 text-primary" /> Change photo
                                                                </>
                                                            )}
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => setForm({ ...form, heroImage: '' })}
                                                            disabled={uploadingPhoto || saving}
                                                            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 text-xs font-bold text-text-secondary transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" /> Remove
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : canManage ? (
                                            <label className="mt-3.5 flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-primary/35 bg-white px-4 py-5 text-center transition hover:border-primary hover:bg-primary/[0.03]">
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    onChange={handlePhotoUpload}
                                                    disabled={uploadingPhoto || saving}
                                                    className="sr-only"
                                                />
                                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                    {uploadingPhoto ? (
                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                    ) : (
                                                        <ImagePlus className="h-5 w-5" />
                                                    )}
                                                </span>
                                                <span className="text-xs font-bold text-foreground">
                                                    {uploadingPhoto ? 'Uploading your photo…' : 'Upload a wedding or couple photo'}
                                                </span>
                                                <span className="text-[11px] text-text-secondary">
                                                    JPG, PNG, or WebP · up to 10 MB
                                                </span>
                                            </label>
                                        ) : (
                                            <p className="mt-3 text-xs text-text-secondary">No photo added yet.</p>
                                        )}
                                    </div>

                                    {/* Publish toggle */}
                                    <label
                                        className={`flex min-w-0 cursor-pointer items-start gap-3.5 rounded-2xl border p-4 text-sm transition ${
                                            form.rsvpPageEnabled
                                                ? 'border-primary/35 bg-primary/[0.06]'
                                                : 'border-border bg-neutral/50 hover:border-primary/25'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={form.rsvpPageEnabled}
                                            onChange={(event) =>
                                                setForm({ ...form, rsvpPageEnabled: event.target.checked })
                                            }
                                            className="mt-1 h-4 w-4 shrink-0 accent-primary"
                                        />
                                        <span className="min-w-0">
                                            <span className="block font-bold text-foreground">
                                                Enable public RSVP page
                                            </span>
                                            <span className="mt-1 block text-xs leading-5 text-text-secondary">
                                                Your names and event details above will appear on the guest RSVP page. Your planner, budget, and guest list remain private. Save to apply.
                                            </span>
                                        </span>
                                    </label>

                                    {canManage && (
                                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                                            <button
                                                type="submit"
                                                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-hover disabled:translate-y-0 disabled:opacity-60 sm:w-auto"
                                            >
                                                {saving ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                                                    </>
                                                ) : (
                                                    'Save connection'
                                                )}
                                            </button>
                                            {dirty && (
                                                <span className="text-xs font-medium text-text-secondary">
                                                    Click Save connection to update your live page.
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </fieldset>
                            </form>
                        </div>

                        {/* Right Column: Live Guest Preview + Share & Platform Setup */}
                        <div className="min-w-0 space-y-6 lg:sticky lg:top-6 lg:col-span-5">
                            {/* Live Guest Page Preview Card */}
                            <div className="overflow-hidden rounded-[2rem] border border-border bg-white shadow-lg shadow-primary/5">
                                <div className="flex items-center justify-between border-b border-border/70 bg-neutral/60 px-5 py-3">
                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-text-secondary">
                                        <Sparkles className="h-3.5 w-3.5 text-primary" /> Live guest card preview
                                    </span>
                                    <span
                                        className="h-3 w-3 rounded-full border border-black/10"
                                        style={{ backgroundColor: previewColor }}
                                        aria-hidden="true"
                                    />
                                </div>

                                <div
                                    className="p-5 sm:p-6"
                                    style={{
                                        background: `radial-gradient(circle at top, color-mix(in srgb, ${previewColor} 12%, #FFF8F4), #FFF8F4 75%)`,
                                    }}
                                >
                                    <div className="rounded-3xl border bg-white p-5 text-center shadow-sm" style={{ borderColor: `color-mix(in srgb, ${previewColor} 28%, #EAD6DA)` }}>
                                        {previewHeroPhoto ? (
                                            <div className="mb-4 overflow-hidden rounded-2xl border border-border/70 bg-neutral">
                                                <img
                                                    src={previewHeroPhoto}
                                                    alt="Guest RSVP photo preview"
                                                    className="h-36 w-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <span
                                                className="mx-auto flex h-9 w-9 items-center justify-center rounded-full"
                                                style={{
                                                    backgroundColor: `color-mix(in srgb, ${previewColor} 12%, white)`,
                                                    color: previewColor,
                                                }}
                                            >
                                                <Heart className="h-4 w-4" strokeWidth={1.5} />
                                            </span>
                                        )}
                                        <p
                                            className="mt-3 text-[10px] font-bold uppercase tracking-[0.26em]"
                                            style={{ color: previewColor }}
                                        >
                                            You’re invited
                                        </p>
                                        <p className="mt-2 break-words font-serif text-2xl font-bold leading-snug text-foreground">
                                            {form.brideName.trim() || 'Partner One'}{' '}
                                            <span className="italic" style={{ color: previewColor }}>
                                                &amp;
                                            </span>{' '}
                                            {form.groomName.trim() || 'Partner Two'}
                                        </p>
                                        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-text-secondary">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-neutral px-2.5 py-1">
                                                <CalendarDays className="h-3 w-3 shrink-0" style={{ color: previewColor }} />
                                                {formatPreviewDate(form.weddingDate)}
                                                {form.weddingTime ? ` · ${form.weddingTime.slice(0, 5)}` : ''}
                                            </span>
                                            {form.venueName.trim() && (
                                                <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-neutral px-2.5 py-1">
                                                    <MapPin className="h-3 w-3 shrink-0" style={{ color: previewColor }} />
                                                    <span className="truncate">{form.venueName.trim()}</span>
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-4 border-t border-border/70 pt-3.5">
                                            <span
                                                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white"
                                                style={{ backgroundColor: previewColor }}
                                            >
                                                Will you celebrate with us? <ArrowRight className="h-3.5 w-3.5" />
                                            </span>
                                            {form.rsvpDeadline && (
                                                <p className="mt-2 text-[11px] text-text-secondary">
                                                    Kindly reply by {formatPreviewDate(form.rsvpDeadline)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Share & Setup Guide Card */}
                            <div className="min-w-0 rounded-[2rem] border border-border bg-white p-5 shadow-lg shadow-primary/5 sm:p-7">
                                <h2 className="font-serif text-2xl font-bold text-foreground">
                                    Connect your Canva RSVP button
                                </h2>

                                {rsvpUrl ? (
                                    <>
                                        <p className="mt-2 text-sm leading-6 text-text-secondary">
                                            Copy this QuickWeds RSVP link onto the RSVP button on your existing website. Every response lands right inside your QuickWeds guest list and planner.
                                        </p>

                                        {/* Quick copy URL box */}
                                        <div className="mt-4 flex min-w-0 items-center gap-2 rounded-2xl border border-primary/20 bg-neutral/70 p-2 pl-3.5">
                                            <p className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
                                                {rsvpUrl}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => void copyQuickLink()}
                                                className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl bg-white px-3.5 text-xs font-bold text-foreground shadow-sm transition hover:border-primary hover:text-primary"
                                            >
                                                {copiedLink ? (
                                                    <>
                                                        <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-3.5 w-3.5" /> Copy link
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2.5">
                                            <a
                                                href={rsvpUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/20 transition hover:bg-primary-hover"
                                            >
                                                Preview guest RSVP page <ExternalLink className="h-4 w-4" />
                                            </a>
                                            {externalUrl && (
                                                <a
                                                    href={externalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-bold text-foreground transition hover:border-primary/40 hover:text-primary"
                                                >
                                                    Open wedding website <ExternalLink className="h-4 w-4" />
                                                </a>
                                            )}
                                        </div>

                                        <div className="mt-6 rounded-2xl border border-border/80 bg-neutral/40 p-4">
                                            <QrCodeActions
                                                value={rsvpUrl}
                                                title="Wedding RSVP QR"
                                                fileName={`quickweds-rsvp-${weddingId}.png`}
                                                description="Guests can scan this QR to reply to your wedding invitation."
                                                showUrl
                                                className="relative min-w-0"
                                                qrClassName="mx-auto w-fit max-w-full rounded-2xl border border-border bg-white p-4 shadow-sm"
                                                onStatus={setStatus}
                                            />
                                        </div>

                                        {/* Platform-specific setup tabs */}
                                        <div className="mt-6 border-t border-border/70 pt-5">
                                            <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-neutral p-1">
                                                {(
                                                    [
                                                        { id: 'canva', label: 'Canva' },
                                                        { id: 'ghl', label: 'GoHighLevel' },
                                                        { id: 'other', label: 'Wix / Other' },
                                                    ] as const
                                                ).map((tab) => (
                                                    <button
                                                        key={tab.id}
                                                        type="button"
                                                        onClick={() => setPlatformTab(tab.id)}
                                                        className={`min-h-9 flex-1 rounded-lg px-3 text-xs font-bold transition ${
                                                            platformTab === tab.id
                                                                ? 'bg-white text-foreground shadow-sm'
                                                                : 'text-text-secondary hover:text-foreground'
                                                        }`}
                                                    >
                                                        {tab.label}
                                                    </button>
                                                ))}
                                            </div>

                                            {platformTab === 'canva' && (
                                                <ol className="mt-4 space-y-3 text-sm leading-6 text-text-secondary">
                                                    <li className="flex items-start gap-2.5">
                                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-black text-primary">
                                                            1
                                                        </span>
                                                        <span>Open your Canva wedding design and select the RSVP text, image, or button.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2.5">
                                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-black text-primary">
                                                            2
                                                        </span>
                                                        <span>Choose the link option (or Ctrl / Cmd + K), paste your QuickWeds RSVP link, and apply it.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2.5">
                                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-black text-primary">
                                                            3
                                                        </span>
                                                        <span>Publish your Canva website changes. Open the published website on your phone and tap RSVP to test it.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2.5">
                                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-black text-primary">
                                                            4
                                                        </span>
                                                        <span>Guests reply on the QuickWeds page, then can return to your Canva wedding website. Find their replies in your QuickWeds guest list.</span>
                                                    </li>
                                                </ol>
                                            )}

                                            {platformTab === 'ghl' && (
                                                <ol className="mt-4 space-y-3 text-sm leading-6 text-text-secondary">
                                                    <li className="flex items-start gap-2.5">
                                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-black text-primary">
                                                            1
                                                        </span>
                                                        <span>Open your GoHighLevel funnel or site editor and select your RSVP button.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2.5">
                                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-black text-primary">
                                                            2
                                                        </span>
                                                        <span>Set Button Action to Website URL and paste your QuickWeds RSVP link.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2.5">
                                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-black text-primary">
                                                            3
                                                        </span>
                                                        <span>Save and publish. Every guest who replies appears immediately in your QuickWeds guest list and planner.</span>
                                                    </li>
                                                </ol>
                                            )}

                                            {platformTab === 'other' && (
                                                <ol className="mt-4 space-y-3 text-sm leading-6 text-text-secondary">
                                                    <li className="flex items-start gap-2.5">
                                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-black text-primary">
                                                            1
                                                        </span>
                                                        <span>In Wix, Squarespace, Webflow, or Notion, select your RSVP button or link text.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2.5">
                                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-black text-primary">
                                                            2
                                                        </span>
                                                        <span>Paste your QuickWeds RSVP link as an external web address and publish your site.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2.5">
                                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-black text-primary">
                                                            3
                                                        </span>
                                                        <span>You can also download the QR code above for printed invitations or table signage.</span>
                                                    </li>
                                                </ol>
                                            )}

                                            <p className="mt-4 rounded-2xl bg-neutral p-3.5 text-xs leading-5 text-text-secondary">
                                                This setup uses a linked RSVP page. A form filled out inside Canva or another service does not automatically sync to QuickWeds—use your QuickWeds link on the RSVP button so all replies go straight into your planner.
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="mt-4 space-y-4">
                                        <p className="text-sm leading-6 text-text-secondary">
                                            Complete the details on the left, enable the public RSVP page, and click{' '}
                                            <strong className="text-foreground">Save connection</strong> to generate your shareable RSVP link and QR code.
                                        </p>
                                        <ul className="space-y-2.5 rounded-2xl border border-border/80 bg-neutral/60 p-4">
                                            {checklistItems.map((item) => (
                                                <li
                                                    key={item.label}
                                                    className="flex items-center gap-2.5 text-xs font-semibold text-foreground"
                                                >
                                                    {item.done ? (
                                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                                    ) : (
                                                        <Circle className="h-4 w-4 shrink-0 text-border" />
                                                    )}
                                                    <span className={item.done ? 'text-foreground' : 'text-text-secondary'}>
                                                        {item.label}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            )}
        </section>
    );
}
