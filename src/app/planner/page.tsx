'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    ChevronRight,
    ClipboardList,
    Globe,
    Heart,
    Link2,
    Loader2,
    Lock,
    QrCode,
    Sparkles,
    Users,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { getCachedSession } from '@/lib/session-cache';
import { FREE_PLAN_LIMITS } from '@/lib/planner-limits';

type Workspace = {
    id: string;
    bride_name?: string;
    groom_name?: string;
    planner_only?: boolean;
    external_website_url?: string | null;
    rsvp_page_enabled?: boolean;
};

function getInitials(bride?: string, groom?: string) {
    const a = String(bride || '').trim().charAt(0).toUpperCase();
    const b = String(groom || '').trim().charAt(0).toUpperCase();
    if (a && b) return `${a}&${b}`;
    return a || b || 'QW';
}

function PlannerGateway() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const search = useSearchParams();
    const guests = search?.get('goal') === 'guests';
    const external = search?.get('goal') === 'external';
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [ready, setReady] = useState(false);
    const [names, setNames] = useState({ brideName: '', groomName: '' });
    const [externalWebsiteUrl, setExternalWebsiteUrl] = useState('');
    const [requestId] = useState(() => crypto.randomUUID());

    const destination = (id: string) =>
        external ? `/dashboard/${id}/connection` : guests ? `/dashboard/${id}?tab=guests` : `/dashboard/${id}/planner`;

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.replace(
                `/login?next=${encodeURIComponent('/planner' + (external ? '?goal=external' : guests ? '?goal=guests' : ''))}`
            );
            return;
        }
        let active = true;
        (async () => {
            const { data: sessionData } = await getCachedSession();
            const ownQuery = supabase
                .from('weddings')
                .select('id,bride_name,groom_name,planner_only,external_website_url,rsvp_page_enabled')
                .eq('user_id', user.id)
                .is('deleted_at', null)
                .order('created_at', { ascending: false });

            const [ownRaw, shared] = await Promise.all([
                ownQuery,
                fetch('/api/collaborators/shared', {
                    headers: { Authorization: `Bearer ${sessionData.session?.access_token}` },
                }).then(async (r) => {
                    if (!r.ok) throw new Error('Unable to load shared weddings.');
                    return r.json();
                }),
            ]);

            let ownData = ownRaw.data;
            if (ownRaw.error) {
                const code = String(ownRaw.error.code || '');
                if (code === '42703' || code === 'PGRST204') {
                    const fallbackOwn = await supabase
                        .from('weddings')
                        .select('id,bride_name,groom_name')
                        .eq('user_id', user.id)
                        .is('deleted_at', null)
                        .order('created_at', { ascending: false });
                    if (fallbackOwn.error) throw fallbackOwn.error;
                    ownData = (fallbackOwn.data || []).map((row) => ({
                        ...row,
                        planner_only: false,
                        external_website_url: null,
                        rsvp_page_enabled: false,
                    }));
                } else {
                    throw ownRaw.error;
                }
            }

            const all = new Map<string, Workspace>();
            for (const w of ownData || []) all.set(w.id, w);
            for (const invite of shared.sharedWeddings || []) {
                if (invite.status === 'accepted' && invite.wedding) all.set(invite.wedding.id, invite.wedding);
            }
            if (active) setWorkspaces([...all.values()].filter((workspace) => !external || workspace.planner_only));
        })()
            .catch(() => {
                if (active) setError('Unable to load workspaces. Please refresh to try again.');
            })
            .finally(() => {
                if (active) setReady(true);
            });
        return () => {
            active = false;
        };
    }, [user, loading, router, guests, external]);

    async function create(event: React.FormEvent) {
        event.preventDefault();
        if (busy) return;
        setBusy(true);
        setError('');
        try {
            const { data: sessionData } = await getCachedSession();
            const response = await fetch('/api/planner/workspace', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${sessionData.session?.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...names,
                    requestId,
                    ...(external ? { mode: 'external', externalWebsiteUrl } : {}),
                }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok || !result.id) throw new Error(result.error || 'Unable to start your workspace.');
            router.push(destination(result.id));
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Unable to start your workspace.');
            setBusy(false);
        }
    }

    const inputClass =
        'mt-2 min-h-12 w-full min-w-0 rounded-xl border border-border bg-neutral/40 px-4 py-3 text-base text-foreground transition placeholder:text-text-secondary/60 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20';

    const flowSteps = external
        ? [
              {
                  icon: Globe,
                  title: 'Keep your existing site',
                  body: 'Works with Canva, GoHighLevel, Wix, Squarespace, or any HTTPS wedding site.',
              },
              {
                  icon: QrCode,
                  title: 'Link QuickWeds RSVP',
                  body: 'Paste your standalone RSVP link or QR code onto your website RSVP button.',
              },
              {
                  icon: Users,
                  title: 'Syncs to your planner',
                  body: 'Guest replies flow straight into your guest list, meals, seating & check-in.',
              },
          ]
        : [
              {
                  icon: ClipboardList,
                  title: 'Plan privately first',
                  body: 'Organize checklist tasks, budget, vendors, and seating in one calm space.',
              },
              {
                  icon: Users,
                  title: 'Track guests & meals',
                  body: 'Keep RSVPs, households, dietary needs, and seat counts together.',
              },
              {
                  icon: Heart,
                  title: 'Publish or connect later',
                  body: 'Build a QuickWeds website anytime or connect your existing Canva site.',
              },
          ];

    const plannerStats = [
        { label: 'Checklist tasks', value: String(FREE_PLAN_LIMITS.checklistTasks) },
        { label: 'Budget items', value: String(FREE_PLAN_LIMITS.budgetItems) },
        { label: 'Suppliers', value: String(FREE_PLAN_LIMITS.vendors) },
        { label: 'Seating tables', value: String(FREE_PLAN_LIMITS.seatingTables) },
    ];

    return (
        <main className="mobile-safe-screen relative overflow-x-clip bg-neutral text-foreground">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,_rgba(209,108,120,0.14),_rgba(214,184,124,0.08)_45%,_transparent_75%)]"
            />

            <div className="relative mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
                {/* Top navigation */}
                <header className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href="/dashboard"
                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-bold text-text-secondary shadow-sm transition hover:border-primary/40 hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to dashboard
                    </Link>

                    <div className="inline-flex rounded-full border border-border bg-white p-1 shadow-sm">
                        <Link
                            href="/planner"
                            className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-4 text-xs font-bold transition ${
                                !external
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-text-secondary hover:text-foreground'
                            }`}
                        >
                            <ClipboardList className="h-3.5 w-3.5" /> Private Planner
                        </Link>
                        <Link
                            href="/planner?goal=external"
                            className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-4 text-xs font-bold transition ${
                                external
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-text-secondary hover:text-foreground'
                            }`}
                        >
                            <Link2 className="h-3.5 w-3.5" /> Existing Website
                        </Link>
                    </div>
                </header>

                {/* Row 1: Full-width Editorial Hero Banner */}
                <section className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-white p-6 shadow-xl shadow-primary/5 sm:p-8">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
                    />
                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="min-w-0 max-w-2xl">
                            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-primary">
                                {external ? <Link2 className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                                {external
                                    ? 'Canva · GHL · Any Website'
                                    : guests
                                        ? 'Guest & RSVP Workspace'
                                        : 'Private Wedding Workspace'}
                            </span>
                            <h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-foreground sm:text-5xl">
                                {external
                                    ? 'Your website. Your QuickWeds workspace.'
                                    : guests
                                        ? 'Your guest list'
                                        : 'Your wedding planner'}
                            </h1>
                            <p className="mt-3 text-sm leading-7 text-text-secondary sm:text-base">
                                {external
                                    ? 'Keep the wedding website you already designed on Canva, GoHighLevel, or another builder—and let QuickWeds collect RSVPs and sync them into your private planner.'
                                    : 'Start planning privately before building your public invitation, or connect an existing wedding website to QuickWeds RSVP.'}
                            </p>
                        </div>

                        {/* High-visibility External Website CTA directly in the hero */}
                        {!external ? (
                            <div className="shrink-0 lg:max-w-sm">
                                <Link
                                    href="/planner?goal=external"
                                    className="group flex min-h-14 items-center gap-3.5 rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-primary to-primary-hover px-5 py-3.5 text-white shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30"
                                >
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                                        <Link2 className="h-5 w-5" />
                                    </span>
                                    <span className="min-w-0 flex-1 text-left">
                                        <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-white/80">
                                            Canva · GHL · Wix
                                        </span>
                                        <span className="mt-0.5 block text-sm font-bold leading-snug text-white">
                                            Already have a wedding website? Connect it to QuickWeds RSVP.
                                        </span>
                                    </span>
                                    <ArrowRight className="h-5 w-5 shrink-0 text-white transition group-hover:translate-x-1" />
                                </Link>
                            </div>
                        ) : (
                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700">
                                    <CheckCircle2 className="h-4 w-4" /> Free standalone RSVP page
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-neutral px-3.5 py-2 text-xs font-bold text-text-secondary">
                                    <Lock className="h-3.5 w-3.5 text-primary" /> Planner stays private
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Full-width 3-step horizontal flow bar */}
                    <div className="relative mt-6 grid gap-3 border-t border-border/70 pt-6 sm:grid-cols-3">
                        {flowSteps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div
                                    key={step.title}
                                    className="flex items-start gap-3 rounded-2xl border border-border/80 bg-neutral/60 p-4"
                                >
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Icon className="h-4 w-4" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-foreground">
                                            <span className="mr-1 text-primary">{index + 1}.</span>
                                            {step.title}
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-text-secondary">{step.body}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Row 2: Symmetrical, flush-aligned 2-column grid (items-stretch eliminates blank right-side void) */}
                <div className="grid min-w-0 items-stretch gap-6 lg:grid-cols-12">
                    {/* Left Card (7 cols): Primary Creation / Connection Form */}
                    <section className="flex min-w-0 flex-col justify-between rounded-[2rem] border border-primary/20 bg-white p-6 shadow-xl shadow-primary/10 sm:p-8 lg:col-span-7">
                        <div>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    {external ? <Link2 className="h-5 w-5" /> : <Heart className="h-5 w-5" />}
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-neutral px-3 py-1 text-[11px] font-bold text-text-secondary">
                                    <Lock className="h-3 w-3 text-primary" /> Private workspace
                                </span>
                            </div>

                            <h2 className="mt-5 font-serif text-2xl font-bold text-foreground sm:text-3xl">
                                {external ? 'Connect your existing wedding website' : 'Start a private workspace'}
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-text-secondary">
                                {external
                                    ? 'Add your names and published website link, then customize your standalone RSVP page and QR code.'
                                    : 'Your names are enough to begin. Publish your invitation later from the website builder.'}
                            </p>

                            {error && (
                                <div
                                    role="alert"
                                    className="mt-5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                                >
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={create} className="mt-6 min-w-0 space-y-5">
                                <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                                    <label className="block min-w-0 text-sm font-bold text-foreground">
                                        First partner’s name
                                        <input
                                            required
                                            maxLength={100}
                                            placeholder="e.g. Alexandra"
                                            value={names.brideName}
                                            onChange={(e) => setNames({ ...names, brideName: e.target.value })}
                                            className={inputClass}
                                        />
                                    </label>
                                    <label className="block min-w-0 text-sm font-bold text-foreground">
                                        Second partner’s name
                                        <input
                                            required
                                            maxLength={100}
                                            placeholder="e.g. Christopher"
                                            value={names.groomName}
                                            onChange={(e) => setNames({ ...names, groomName: e.target.value })}
                                            className={inputClass}
                                        />
                                    </label>
                                </div>

                                {external && (
                                    <label className="block min-w-0 text-sm font-bold text-foreground">
                                        Existing wedding website
                                        <input
                                            type="url"
                                            pattern="https://.*"
                                            required
                                            maxLength={2048}
                                            placeholder="https://your-wedding-website.com"
                                            value={externalWebsiteUrl}
                                            onChange={(e) => setExternalWebsiteUrl(e.target.value)}
                                            className={inputClass}
                                        />
                                        <span className="mt-2 block text-xs font-normal leading-5 text-text-secondary">
                                            Paste your published{' '}
                                            <code className="rounded bg-neutral px-1.5 py-0.5 font-mono text-[11px]">
                                                https://
                                            </code>{' '}
                                            link from Canva, GoHighLevel, or any site builder.
                                        </span>
                                    </label>
                                )}

                                <button
                                    type="submit"
                                    disabled={busy}
                                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-hover disabled:translate-y-0 disabled:opacity-50"
                                >
                                    {busy ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" /> Starting…
                                        </>
                                    ) : (
                                        <>
                                            {external ? 'Continue to RSVP setup' : 'Start planning'}
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        <p className="mt-6 border-t border-border/70 pt-4 text-center text-xs leading-5 text-text-secondary">
                            Free to start · No credit card required · Your guest list and planner stay private.
                        </p>
                    </section>

                    {/* Right Card (5 cols): Included Planner Lite Tools & Sync Details (stretched flush with left card) */}
                    <aside className="flex min-w-0 flex-col justify-between rounded-[2rem] border border-border bg-white p-6 shadow-lg shadow-primary/5 sm:p-8 lg:col-span-5">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">
                                Included in Planner Lite
                            </p>
                            <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">
                                Everything stays synced automatically
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-text-secondary">
                                Every guest RSVP submitted through QuickWeds updates your headcount, meal counts, seating chart, and wedding-day check-in automatically.
                            </p>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                {plannerStats.map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="rounded-2xl border border-border/80 bg-neutral/60 p-4"
                                    >
                                        <p className="font-serif text-2xl font-bold text-primary">{stat.value}</p>
                                        <p className="mt-1 text-xs font-semibold text-text-secondary">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 space-y-2.5 border-t border-border/70 pt-5">
                            <p className="flex items-center gap-2 text-xs font-semibold text-foreground">
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                Guest confirmation &amp; self-update RSVP receipts
                            </p>
                            <p className="flex items-center gap-2 text-xs font-semibold text-foreground">
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                Back-link button returning guests to your website
                            </p>
                            <p className="flex items-center gap-2 text-xs font-semibold text-foreground">
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                Printable RSVP QR code for invitations &amp; signage
                            </p>
                        </div>
                    </aside>
                </div>

                {/* Row 3: Full-width Existing Workspaces Grid (prevents lopsided columns) */}
                {!ready ? (
                    <div
                        role="status"
                        className="flex items-center gap-2.5 rounded-2xl border border-border bg-white p-4 text-sm font-medium text-text-secondary shadow-sm"
                    >
                        <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading your workspaces…
                    </div>
                ) : workspaces.length > 0 ? (
                    <section className="rounded-[2rem] border border-border bg-white p-6 shadow-lg shadow-primary/5 sm:p-8">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <h2 className="font-serif text-2xl font-bold text-foreground">
                                    {external ? 'Your connected workspaces' : 'Open an existing workspace'}
                                </h2>
                                <p className="mt-1 text-xs text-text-secondary">
                                    Jump right back into a wedding workspace you already started.
                                </p>
                            </div>
                            <span className="rounded-full border border-border bg-neutral px-3 py-1 text-xs font-bold text-text-secondary">
                                {workspaces.length} {workspaces.length === 1 ? 'workspace' : 'workspaces'}
                            </span>
                        </div>

                        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {workspaces.map((w) => (
                                <li key={w.id} className="min-w-0">
                                    <Link
                                        className="group flex h-full items-center gap-3.5 rounded-2xl border border-border bg-neutral/40 p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white hover:shadow-md hover:shadow-primary/5"
                                        href={destination(w.id)}
                                    >
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-serif text-sm font-bold text-primary transition group-hover:bg-primary group-hover:text-white">
                                            {getInitials(w.bride_name, w.groom_name)}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-bold text-foreground">
                                                {[w.bride_name, w.groom_name].filter(Boolean).join(' & ') ||
                                                    'Open wedding workspace'}
                                            </p>
                                            <p className="mt-0.5 truncate text-xs text-text-secondary">
                                                {w.planner_only
                                                    ? w.rsvp_page_enabled
                                                        ? 'External site · RSVP live'
                                                        : 'Private · RSVP draft'
                                                    : 'QuickWeds website & planner'}
                                            </p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 shrink-0 text-text-secondary transition group-hover:translate-x-0.5 group-hover:text-primary" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : null}
            </div>
        </main>
    );
}

export default function PlannerGatewayPage() {
    return (
        <Suspense
            fallback={
                <div className="mobile-safe-screen flex items-center justify-center bg-neutral">
                    <p role="status" className="inline-flex items-center gap-2 text-sm font-bold text-text-secondary">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading planner…
                    </p>
                </div>
            }
        >
            <PlannerGateway />
        </Suspense>
    );
}
