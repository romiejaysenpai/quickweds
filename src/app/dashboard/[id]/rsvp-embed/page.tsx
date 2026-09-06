'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    ChevronDown,
    Clipboard,
    Code2,
    ExternalLink,
    Globe2,
    Link2,
    Loader2,
    PauseCircle,
    PlayCircle,
    ShieldCheck,
    Smartphone,
} from 'lucide-react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import LoadingState from '@/components/ui/LoadingState';
import { useAuth } from '@/context/AuthContext';
import { getCachedSession } from '@/lib/session-cache';
import {
    createRsvpEmbedCode,
    getRsvpEmbedPlatform,
    RSVP_EMBED_PLATFORMS,
    type RsvpEmbedPlatform,
} from '@/lib/rsvp-embed';
import { getRsvpEmbedPath } from '@/lib/wedding-slugs';

type EmbedWedding = {
    id: string;
    public_slug?: string | null;
    bride_name?: string | null;
    groom_name?: string | null;
    external_website_url?: string | null;
    external_platform?: string | null;
    rsvp_embed_enabled?: boolean;
    is_published?: boolean;
};

async function getToken() {
    const { data } = await getCachedSession();
    return data.session?.access_token || '';
}

function getSafeWebsiteUrl(value: string | null | undefined) {
    if (!value) return '';
    try {
        const url = new URL(value);
        return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch {
        return '';
    }
}

function StepNumber({ children }: { children: string }) {
    return (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-white shadow-md shadow-primary/20">
            {children}
        </span>
    );
}

export default function RsvpEmbedSettingsPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const weddingId = params?.id || '';
    const [wedding, setWedding] = useState<EmbedWedding | null>(null);
    const [canEdit, setCanEdit] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [origin, setOrigin] = useState('');
    const [showCode, setShowCode] = useState(false);

    const loadSettings = useCallback(async () => {
        const token = await getToken();
        if (!token) return router.push('/login');

        setLoading(true);
        setError('');
        try {
            const response = await fetch(`/api/weddings/${encodeURIComponent(weddingId)}/rsvp-embed`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error || 'Unable to load RSVP embed settings.');
            setWedding(result.wedding || null);
            setCanEdit(Boolean(result.canEdit));
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Unable to load RSVP embed settings.');
        } finally {
            setLoading(false);
        }
    }, [router, weddingId]);

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    useEffect(() => {
        if (!authLoading && !user) return router.push('/login');
        if (user && weddingId) void loadSettings();
    }, [authLoading, loadSettings, router, user, weddingId]);

    const embedPath = wedding ? getRsvpEmbedPath(wedding) : '';
    const embedUrl = origin && embedPath ? `${origin}${embedPath}` : embedPath;
    const embedCode = useMemo(
        () => createRsvpEmbedCode(embedUrl, wedding?.id || weddingId),
        [embedUrl, wedding?.id, weddingId]
    );
    const selectedPlatform = getRsvpEmbedPlatform(wedding?.external_platform);
    const websiteUrl = getSafeWebsiteUrl(wedding?.external_website_url);
    const isPublished = wedding?.is_published === true;
    const isLive = wedding?.rsvp_embed_enabled === true && isPublished;
    const isConfigured = Boolean(selectedPlatform);

    const updateWedding = (patch: Partial<EmbedWedding>) => {
        setWedding((current) => current ? { ...current, ...patch } : current);
        setStatus('');
    };

    const saveSettings = async (enabled: boolean, successMessage: string) => {
        if (!wedding || !canEdit) return false;

        const token = await getToken();
        if (!token) {
            router.push('/login');
            return false;
        }

        setSaving(true);
        setError('');
        setStatus('');
        try {
            const response = await fetch(`/api/weddings/${encodeURIComponent(weddingId)}/rsvp-embed`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    external_website_url: wedding.external_website_url || '',
                    external_platform: wedding.external_platform || '',
                    rsvp_embed_enabled: enabled,
                }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error || 'Unable to save RSVP embed settings.');

            setWedding(result.wedding);
            setStatus(successMessage);
            return true;
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Unable to save RSVP embed settings.');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const copy = async (value: string, label: string) => {
        if (!value) return;
        setError('');
        try {
            await navigator.clipboard.writeText(value);
            setStatus(`${label} copied. Paste it into your website builder.`);
        } catch {
            setError(`Unable to copy ${label.toLowerCase()}.`);
        }
    };

    if (loading || authLoading) {
        return <main className="flex min-h-screen items-center justify-center bg-[#FFF8F9] px-4"><LoadingState label="Loading RSVP embed settings…" className="max-w-lg" /></main>;
    }

    const primaryMethod = selectedPlatform?.recommendedMethod || 'link';
    const primaryValue = primaryMethod === 'embed' ? embedCode : embedUrl;
    const primaryLabel = primaryMethod === 'embed' ? 'RSVP embed' : 'RSVP link';

    return (
        <DashboardShell
            weddingId={weddingId}
            weddingSlug={wedding?.public_slug}
            weddingTitle={wedding ? `${wedding.bride_name || 'Wedding'} & ${wedding.groom_name || 'Partner'}` : undefined}
            canManageWorkspace={canEdit}
        >
            <main className="min-h-screen flex-1 bg-[#FFF8F9] px-3 py-6 text-foreground sm:px-6">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-bold text-text-secondary">
                        <Link href={`/dashboard/${weddingId}`} className="hover:text-primary"><ArrowLeft className="mr-1 inline h-3.5 w-3.5" />Workspace</Link>
                        <span>/</span><span>Guests &amp; RSVP</span><span>/</span><span className="text-primary">Embed &amp; Share</span>
                    </div>

                    <section className="rounded-3xl border border-primary/15 bg-white p-5 shadow-xl shadow-primary/10 sm:p-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Guests &amp; RSVP</p>
                                <h1 className="mt-1 font-serif text-3xl font-bold sm:text-4xl">Embed &amp; Share</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">Connect QuickWeds to the website you already have. Guests RSVP there, and every response continues flowing into this wedding dashboard.</p>
                            </div>
                            {wedding && (
                                <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-xs font-black uppercase tracking-wider ${isLive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral text-text-secondary'}`}>
                                    <span className={`h-2 w-2 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-text-secondary/40'}`} />
                                    {isLive ? 'Live' : 'Not active'}
                                </span>
                            )}
                        </div>

                        {wedding && !canEdit && <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">You can view and copy these settings, but only the wedding owner or partner can change them.</p>}
                        {error && <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 sm:flex-row sm:items-center sm:justify-between"><span>{error}</span>{!wedding && <button type="button" onClick={() => void loadSettings()} className="min-h-10 rounded-xl border border-rose-300 px-4">Try again</button>}</div>}
                        {status && <p role="status" className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"><Check className="mr-2 inline h-4 w-4" />{status}</p>}
                    </section>

                    {wedding && (
                        <div className="mt-5 space-y-5">
                            <section className="rounded-3xl border border-border bg-white p-5 shadow-lg shadow-primary/5 sm:p-7">
                                <div className="flex items-start gap-3">
                                    <StepNumber>1</StepNumber>
                                    <div>
                                        <h2 className="font-serif text-2xl font-bold">Connect your existing website</h2>
                                        <p className="mt-1 text-sm leading-6 text-text-secondary">Choose your website builder so QuickWeds can recommend the simplest installation method.</p>
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="external-platform" className="text-xs font-black uppercase tracking-wider text-text-secondary">Website platform</label>
                                        <select
                                            id="external-platform"
                                            value={wedding.external_platform || ''}
                                            disabled={!canEdit}
                                            onChange={(event) => updateWedding({ external_platform: event.target.value as RsvpEmbedPlatform })}
                                            className="mt-2 min-h-12 w-full rounded-xl border border-border bg-neutral px-4 text-sm font-semibold outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            <option value="">Choose your platform</option>
                                            {RSVP_EMBED_PLATFORMS.map((platform) => <option key={platform.value} value={platform.value}>{platform.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="external-website-url" className="text-xs font-black uppercase tracking-wider text-text-secondary">Website URL <span className="normal-case tracking-normal text-text-secondary/60">(optional)</span></label>
                                        <input
                                            id="external-website-url"
                                            type="url"
                                            value={wedding.external_website_url || ''}
                                            disabled={!canEdit}
                                            onChange={(event) => updateWedding({ external_website_url: event.target.value })}
                                            placeholder="https://your-wedding-site.com"
                                            className="mt-2 min-h-12 w-full rounded-xl border border-border bg-neutral px-4 text-sm outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-70"
                                        />
                                    </div>
                                </div>

                                {canEdit && (
                                    <div className="mt-5 flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => void saveSettings(isLive, 'Website details saved.')}
                                            disabled={!isConfigured || saving}
                                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Save website details
                                        </button>
                                        {!isConfigured && <span className="text-xs font-semibold text-amber-700">Choose a platform to continue.</span>}
                                        {websiteUrl && <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-bold text-text-secondary"><ExternalLink className="h-4 w-4" />Open website</a>}
                                    </div>
                                )}
                            </section>

                            <section className={`rounded-3xl border bg-white p-5 shadow-lg shadow-primary/5 sm:p-7 ${isConfigured ? 'border-border' : 'border-dashed border-border opacity-75'}`}>
                                <div className="flex items-start gap-3">
                                    <StepNumber>2</StepNumber>
                                    <div>
                                        <h2 className="font-serif text-2xl font-bold">Add the RSVP form</h2>
                                        <p className="mt-1 text-sm leading-6 text-text-secondary">Use the recommended option, then follow the three steps for your website builder.</p>
                                    </div>
                                </div>

                                {!selectedPlatform ? (
                                    <div className="mt-6 rounded-2xl border border-dashed border-border bg-neutral/50 p-6 text-center text-sm font-semibold text-text-secondary">Choose your website platform in step 1 to see the best installation method.</div>
                                ) : (
                                    <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                                        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5">
                                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Recommended for {selectedPlatform.label}</p>
                                            <h3 className="mt-2 text-xl font-bold">{primaryMethod === 'embed' ? 'Embed the form on your page' : 'Link an RSVP button to QuickWeds'}</h3>
                                            <p className="mt-2 text-xs leading-5 text-text-secondary">{primaryMethod === 'embed' ? 'Guests complete the form without leaving your website. The snippet includes automatic height resizing and a safe fixed-height fallback.' : 'This is the most reliable option when a website builder restricts custom HTML or scripts.'}</p>
                                            <button
                                                type="button"
                                                onClick={() => void copy(primaryValue, primaryLabel)}
                                                disabled={!primaryValue}
                                                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-md shadow-primary/20 disabled:opacity-50"
                                            >
                                                <Clipboard className="h-4 w-4" />Copy {primaryMethod === 'embed' ? 'RSVP embed' : 'RSVP link'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => void copy(primaryMethod === 'embed' ? embedUrl : embedCode, primaryMethod === 'embed' ? 'RSVP link' : 'RSVP embed')}
                                                disabled={!embedUrl || !embedCode}
                                                className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-bold text-text-secondary disabled:opacity-50"
                                            >
                                                {primaryMethod === 'embed' ? <Link2 className="h-4 w-4" /> : <Code2 className="h-4 w-4" />}
                                                {primaryMethod === 'embed' ? 'Use RSVP link instead' : 'Use embed code instead'}
                                            </button>
                                        </div>

                                        <div className="rounded-2xl border border-border p-5">
                                            <h3 className="text-sm font-black uppercase tracking-wider text-text-secondary">How to install it</h3>
                                            <ol className="mt-4 space-y-4">
                                                {selectedPlatform.instructions.map((instruction, index) => (
                                                    <li key={instruction} className="flex gap-3 text-sm leading-6 text-text-secondary">
                                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral text-xs font-black text-primary">{index + 1}</span>
                                                        <span>{instruction}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    </div>
                                )}

                                {selectedPlatform && (
                                    <div className="mt-5 rounded-2xl border border-border bg-[#201A1B] text-white">
                                        <button type="button" onClick={() => setShowCode((current) => !current)} className="flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-white/80">
                                            <span className="inline-flex items-center gap-2"><Code2 className="h-4 w-4" />View embed code</span>
                                            <ChevronDown className={`h-4 w-4 transition-transform ${showCode ? 'rotate-180' : ''}`} />
                                        </button>
                                        {showCode && <div className="max-h-64 overflow-auto border-t border-white/10 p-4 text-xs leading-6 text-white/75"><code className="break-all whitespace-pre-wrap">{embedCode}</code></div>}
                                    </div>
                                )}
                            </section>

                            <section className="rounded-3xl border border-border bg-white p-5 shadow-lg shadow-primary/5 sm:p-7">
                                <div className="flex items-start gap-3">
                                    <StepNumber>3</StepNumber>
                                    <div>
                                        <h2 className="font-serif text-2xl font-bold">Activate and test</h2>
                                        <p className="mt-1 text-sm leading-6 text-text-secondary">Activation controls whether the public embedded form accepts responses.</p>
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
                                    <div className={`rounded-2xl border p-5 ${isLive ? 'border-emerald-200 bg-emerald-50' : 'border-border bg-neutral/50'}`}>
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className={`text-xs font-black uppercase tracking-wider ${isLive ? 'text-emerald-700' : 'text-text-secondary'}`}>{isLive ? 'RSVP form is live' : 'RSVP form is not active'}</p>
                                                <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">{isLive ? 'Guests can submit through your external website or the direct RSVP link. Responses appear in Guests & RSVP.' : 'Finish the website setup, then activate the form when you are ready to receive responses.'}</p>
                                            </div>
                                            {isLive ? <CheckCircle2 className="h-10 w-10 shrink-0 text-emerald-600" /> : <Globe2 className="h-10 w-10 shrink-0 text-text-secondary/40" />}
                                        </div>

                                        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                                            {canEdit && (
                                                <button
                                                    type="button"
                                                    onClick={() => void saveSettings(!isLive, isLive ? 'RSVP form paused.' : 'RSVP form is live.')}
                                                    disabled={saving || (!isLive && (!isConfigured || !isPublished))}
                                                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${isLive ? 'bg-foreground' : 'bg-primary shadow-md shadow-primary/20'}`}
                                                >
                                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isLive ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                                                    {isLive ? 'Pause RSVP form' : 'Activate RSVP form'}
                                                </button>
                                            )}
                                            <a
                                                href={isLive ? embedUrl : undefined}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-disabled={!isLive}
                                                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 text-sm font-bold text-text-secondary ${!isLive ? 'pointer-events-none opacity-50' : ''}`}
                                            >
                                                <ExternalLink className="h-4 w-4" />Open test form
                                            </a>
                                        </div>
                                    </div>

                                    {!isPublished && <p role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Publish your wedding in QuickWeds before activating the RSVP form. <Link href={`/dashboard/${weddingId}`} className="font-bold underline">Open wedding dashboard</Link></p>}
                                    <div className="rounded-2xl border border-border p-5">
                                        <h3 className="text-sm font-black uppercase tracking-wider text-text-secondary">Before sharing</h3>
                                        <ul className="mt-4 space-y-3 text-sm text-text-secondary">
                                            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Confirm the couple names and RSVP deadline.</li>
                                            <li className="flex items-start gap-2"><Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Test the published website on a phone.</li>
                                            <li className="flex items-start gap-2"><ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Open the live form before sending invitations.</li>
                                        </ul>
                                    </div>
                                </div>

                                <p className="mt-5 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs leading-5 text-emerald-800"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />The embed contains no Supabase keys or account credentials. RSVP validation, duplicate protection, deadlines, and response storage stay securely inside QuickWeds.</p>
                            </section>
                        </div>
                    )}
                </div>
            </main>
        </DashboardShell>
    );
}
