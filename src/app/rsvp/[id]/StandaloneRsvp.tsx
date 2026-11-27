'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { ArrowLeft, CalendarDays, Clock, Heart, Loader2, Lock, MapPin, RefreshCw } from 'lucide-react';
import RSVPForm from '@/components/RSVPForm';
import { normalizeExternalWebsiteUrl } from '@/lib/url-safety';
import { isRsvpDeadlineExpired } from '@/lib/rsvp-deadline';
import type { Wedding } from '@/types/wedding';

type RsvpWedding = Pick<
    Wedding,
    | 'id'
    | 'bride_name'
    | 'groom_name'
    | 'wedding_date'
    | 'wedding_time'
    | 'venue_name'
    | 'rsvp_deadline'
    | 'motif_color'
    | 'hero_image'
    | 'rsvp_events'
    | 'rsvp_allow_plus_ones'
    | 'rsvp_allow_children'
    | 'rsvp_search_guest_list'
    | 'external_website_url'
>;

function dayLabel(value: string) {
    const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
    return Number.isFinite(date.getTime())
        ? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : '';
}

export default function StandaloneRsvp({ weddingId }: { weddingId: string }) {
    const [attempt, setAttempt] = useState(0);
    const requestKey = `${weddingId}:${attempt}`;
    const [result, setResult] = useState<{ key: string; wedding?: RsvpWedding; error?: string } | null>(null);
    const current = result?.key === requestKey ? result : null;
    const wedding = current?.wedding || null;
    const error = current?.error || '';

    useEffect(() => {
        const controller = new AbortController();
        fetch(`/api/public/rsvp/page?weddingId=${encodeURIComponent(weddingId)}`, {
            cache: 'no-store',
            signal: controller.signal,
        })
            .then(async (response) => {
                const data = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(data.error || 'Unable to load this RSVP page.');
                return data;
            })
            .then((data) => {
                if (!controller.signal.aborted) setResult({ key: requestKey, wedding: data.wedding });
            })
            .catch((reason) => {
                if (!controller.signal.aborted) {
                    setResult({
                        key: requestKey,
                        error: reason instanceof Error ? reason.message : 'Unable to load this RSVP page.',
                    });
                }
            });
        return () => controller.abort();
    }, [weddingId, requestKey]);

    const website = wedding?.external_website_url ? normalizeExternalWebsiteUrl(wedding.external_website_url) : null;
    const heroPhoto = wedding?.hero_image ? normalizeExternalWebsiteUrl(wedding.hero_image) : null;
    const color = /^#[0-9a-f]{6}$/i.test(wedding?.motif_color || '') ? wedding!.motif_color : '#A35165';
    const closed = wedding && isRsvpDeadlineExpired(wedding.rsvp_deadline);

    return (
        <main
            className="min-h-screen overflow-x-clip px-4 py-7 text-[#3A2A2D] sm:px-6 sm:py-14"
            style={
                {
                    '--primary': color,
                    '--color-primary': color,
                    background: `radial-gradient(ellipse at top, color-mix(in srgb, ${color} 11%, #FFF8F4), #FFF8F4 58%, #FCF5F0 100%)`,
                } as CSSProperties
            }
        >
            <div className="mx-auto max-w-2xl min-w-0">
                {/* Top navigation bar */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    {website ? (
                        <a
                            href={website}
                            rel="noreferrer"
                            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-white/95 px-4 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/40 hover:text-primary"
                        >
                            <ArrowLeft className="h-4 w-4 shrink-0" /> Our wedding website
                        </a>
                    ) : (
                        <span />
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">
                        <Lock className="h-3 w-3 text-primary" /> Guest RSVP
                    </span>
                </div>

                {/* Stationery Invitation Card */}
                <section
                    className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-white shadow-2xl shadow-primary/10"
                    aria-label="Wedding RSVP"
                >
                    {/* Top motif accent bar */}
                    <div
                        aria-hidden="true"
                        className="h-1.5 w-full"
                        style={{
                            background: `linear-gradient(90deg, color-mix(in srgb, ${color} 35%, white), ${color}, color-mix(in srgb, ${color} 35%, white))`,
                        }}
                    />

                    <div className="p-5 sm:p-10">
                        {error ? (
                            <div className="py-12 text-center">
                                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Heart className="h-6 w-6" strokeWidth={1.5} />
                                </span>
                                <h1 className="mt-5 font-serif text-3xl font-bold text-foreground">
                                    RSVP page unavailable
                                </h1>
                                <p role="alert" className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-secondary">
                                    {error}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setAttempt((value) => value + 1)}
                                    className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-white px-5 text-sm font-bold text-foreground shadow-sm transition hover:border-primary/40 hover:text-primary"
                                >
                                    <RefreshCw className="h-4 w-4" /> Try again
                                </button>
                            </div>
                        ) : !wedding ? (
                            <div role="status" className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
                                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                </span>
                                <p className="text-sm font-semibold text-text-secondary">Loading your invitation…</p>
                            </div>
                        ) : (
                            <>
                                <header className="mb-8 border-b border-border/80 pb-8 text-center">
                                    {heroPhoto ? (
                                        <div className="mb-6 overflow-hidden rounded-2xl border border-primary/15 bg-neutral shadow-sm">
                                            <img
                                                src={heroPhoto}
                                                alt={`${wedding.bride_name} & ${wedding.groom_name}`}
                                                className="h-52 w-full object-cover sm:h-64"
                                            />
                                        </div>
                                    ) : (
                                        <span
                                            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border"
                                            style={{
                                                backgroundColor: `color-mix(in srgb, ${color} 10%, white)`,
                                                borderColor: `color-mix(in srgb, ${color} 25%, white)`,
                                                color,
                                            }}
                                        >
                                            <Heart className="h-5 w-5" strokeWidth={1.5} />
                                        </span>
                                    )}
                                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
                                        You’re invited
                                    </p>
                                    <h1 className="mt-4 break-words font-serif text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                                        {wedding.bride_name}{' '}
                                        <span className="font-serif italic font-normal text-primary">&amp;</span>{' '}
                                        {wedding.groom_name}
                                    </h1>

                                    {(wedding.wedding_date || wedding.venue_name) && (
                                        <div className="mt-6 flex flex-wrap justify-center gap-2.5 text-sm text-text-secondary">
                                            {wedding.wedding_date && (
                                                <p className="inline-flex min-w-0 items-center gap-2 rounded-full border border-border/80 bg-neutral/80 px-4 py-1.5 font-medium text-foreground">
                                                    <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
                                                    <span>
                                                        {dayLabel(wedding.wedding_date)}
                                                        {wedding.wedding_time ? ` · ${wedding.wedding_time.slice(0, 5)}` : ''}
                                                    </span>
                                                </p>
                                            )}
                                            {wedding.venue_name && (
                                                <p className="inline-flex max-w-full min-w-0 items-center gap-2 rounded-full border border-border/80 bg-neutral/80 px-4 py-1.5 font-medium text-foreground">
                                                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                                                    <span className="break-words">{wedding.venue_name}</span>
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </header>

                                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
                                            {closed ? 'RSVPs have closed' : 'Will you celebrate with us?'}
                                        </h2>
                                        {!closed && (
                                            <p className="mt-1.5 text-sm text-text-secondary">
                                                {wedding.rsvp_deadline
                                                    ? `Kindly reply by ${dayLabel(wedding.rsvp_deadline)}.`
                                                    : 'We look forward to hearing from you.'}
                                            </p>
                                        )}
                                    </div>
                                    {!closed && wedding.rsvp_deadline && (
                                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                                            <Clock className="h-3.5 w-3.5" /> Reply by {dayLabel(wedding.rsvp_deadline)}
                                        </span>
                                    )}
                                </div>

                                {closed ? (
                                    <div className="rounded-2xl border border-border bg-neutral/60 p-5 text-sm leading-6 text-text-secondary">
                                        Please contact the couple directly if you need to update your plans.
                                    </div>
                                ) : (
                                    <RSVPForm
                                        weddingId={wedding.id}
                                        wedding={{ ...wedding, template: 'romantic', background_style: 'cream' }}
                                    />
                                )}

                                {website && (
                                    <a
                                        href={website}
                                        rel="noreferrer"
                                        className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-neutral/50 px-5 py-3 text-center text-sm font-bold text-foreground transition hover:border-primary/40 hover:bg-white hover:text-primary"
                                    >
                                        <ArrowLeft className="h-4 w-4 shrink-0" /> Back to our wedding website
                                    </a>
                                )}
                            </>
                        )}
                    </div>
                </section>

                <p className="mt-6 text-center text-xs font-medium tracking-wide text-text-secondary">
                    RSVP powered by QuickWeds
                </p>
            </div>
        </main>
    );
}
