'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUp, Check, Copy } from 'lucide-react';
import { MonogramMark } from '@/components/MonogramMark';
import { copyToClipboard } from '@/lib/client-clipboard';
import { getTemplateVisualProfile } from '@/lib/theme-engine';
import type { Wedding } from '@/types/wedding';
import { SectionTemplateElement } from './SectionTemplateElement';

const FOOTER_LINK_CANDIDATES = [
    { id: 'bio', label: 'Story' },
    { id: 'details', label: 'Details' },
    { id: 'timeline', label: 'Schedule' },
    { id: 'attire', label: 'Attire' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'gift', label: 'Registry' },
    { id: 'rsvp', label: 'RSVP' },
];

const LIGHT_BACKGROUND_STYLES = new Set(['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen']);

function formatFooterDate(dateValue?: string | null) {
    if (!dateValue) return '';
    const trimmed = dateValue.trim();
    const normalized = /^\d{4}-\d{2}-\d{2}/.test(trimmed) ? `${trimmed.slice(0, 10)}T12:00:00` : trimmed;
    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function WeddingFooter({ wedding }: { wedding: Wedding }) {
    const hasLightOverride = Boolean(
        wedding.template_style === 'luxury-planner' ||
        wedding.template === 'luxury-planner' ||
        (wedding.background_style && LIGHT_BACKGROUND_STYLES.has(wedding.background_style))
    );
    const effectiveTemplate = hasLightOverride ? 'classic' : wedding.template;
    const visual = getTemplateVisualProfile(effectiveTemplate, wedding.motif_color);
    const [copiedHashtag, setCopiedHashtag] = useState(false);
    const [availableLinks, setAvailableLinks] = useState<typeof FOOTER_LINK_CANDIDATES>([]);

    useEffect(() => {
        let debounceTimer: number | null = null;
        const refresh = () => {
            const next = FOOTER_LINK_CANDIDATES.filter((item) => document.getElementById(item.id));
            setAvailableLinks((prev) => (prev.map((i) => i.id).join(',') === next.map((i) => i.id).join(',') ? prev : next));
        };
        const scheduleRefresh = () => {
            if (debounceTimer !== null) window.clearTimeout(debounceTimer);
            debounceTimer = window.setTimeout(refresh, 120);
        };
        const timer = window.setTimeout(refresh, 50);
        const observer = new MutationObserver(scheduleRefresh);
        const root = document.querySelector('.wedding-page');
        if (root) observer.observe(root, { childList: true, subtree: true });
        return () => {
            window.clearTimeout(timer);
            if (debounceTimer !== null) window.clearTimeout(debounceTimer);
            observer.disconnect();
        };
    }, [wedding.template, wedding.template_style]);

    useEffect(() => {
        if (!copiedHashtag) return;
        const timer = window.setTimeout(() => setCopiedHashtag(false), 2000);
        return () => window.clearTimeout(timer);
    }, [copiedHashtag]);

    const cleanHashtag = wedding.hashtag ? `#${wedding.hashtag.trim().replace(/^#/, '')}` : '';
    const formattedDate = formatFooterDate(wedding.wedding_date);
    const showMonogram = Boolean(wedding.logo_initials?.trim() || (wedding.logo_shape && wedding.logo_shape !== 'minimal'));

    const handleCopyHashtag = async () => {
        if (!cleanHashtag) return;
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(cleanHashtag);
            } else {
                await copyToClipboard(cleanHashtag);
            }
            setCopiedHashtag(true);
        } catch {
            try {
                await copyToClipboard(cleanHashtag);
                setCopiedHashtag(true);
            } catch {
                setCopiedHashtag(false);
            }
        }
    };

    const scrollToSection = (id: string) => {
        const target = document.getElementById(id);
        if (!target) return;
        const offset = window.innerWidth >= 768 ? 88 : 72;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
            top,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        });
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        });
    };

    return (
        <footer
            data-wedding-footer="true"
            className={`wedding-signature relative overflow-x-clip px-6 pb-28 pt-16 text-center md:pb-16 md:pt-20 ${visual.sectionClass}`}
            style={visual.sectionStyle}
        >
            <div className="mx-auto max-w-2xl border-t border-current/15 pt-14">
                <SectionTemplateElement wedding={wedding} isDark={visual.isDark} placement="divider" className="mb-7" />

                {showMonogram && (
                    <MonogramMark
                        initials={wedding.logo_initials}
                        brideName={wedding.bride_name}
                        groomName={wedding.groom_name}
                        shape={wedding.logo_shape}
                        animation={wedding.logo_animation}
                        fontFamily={wedding.logo_font ? `var(--font-${wedding.logo_font.toLowerCase()}, var(--font-serif))` : undefined}
                        color={wedding.logo_color}
                        motifColor={wedding.motif_color}
                        size="md"
                        className="mx-auto mb-6"
                    />
                )}

                <p className={`text-[11px] font-medium uppercase tracking-[0.28em] opacity-75 ${visual.bodyClass}`}>
                    {wedding.is_thank_you_mode ? 'With endless gratitude' : 'With all our love'}
                </p>

                <p className="mt-4 break-words font-serif text-3xl leading-tight sm:text-5xl">
                    {wedding.bride_name}{' '}
                    <span className="font-light italic opacity-75">&amp;</span>{' '}
                    {wedding.groom_name}
                </p>

                {(formattedDate || wedding.venue_name) && (
                    <p className={`mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.22em] opacity-75 ${visual.bodyClass}`}>
                        {formattedDate && <span>{formattedDate}</span>}
                        {formattedDate && wedding.venue_name && <span aria-hidden="true">&middot;</span>}
                        {wedding.venue_name && <span className="break-words">{wedding.venue_name}</span>}
                    </p>
                )}

                {cleanHashtag && (
                    <div className="mt-6 flex justify-center">
                        <button
                            data-wedding-control="quiet"
                            type="button"
                            onClick={handleCopyHashtag}
                            className={`inline-flex min-h-10 items-center gap-2 border border-current/15 px-4 py-1.5 text-xs tracking-[0.14em] opacity-85 transition-opacity hover:opacity-100 ${
                                visual.isSharp ? 'rounded-none' : 'rounded-full'
                            }`}
                            aria-label={`Copy wedding hashtag ${cleanHashtag}`}
                        >
                            <span className="font-serif text-sm italic tracking-normal">{cleanHashtag}</span>
                            {copiedHashtag ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.18em]">
                                    <Check className="h-3 w-3" aria-hidden="true" />
                                    Copied
                                </span>
                            ) : (
                                <Copy className="h-3 w-3 opacity-60" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                )}

                {availableLinks.length > 0 && (
                    <div className="mt-9 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-y border-current/10 py-4">
                        {availableLinks.map((item) => (
                            <button
                                key={item.id}
                                data-wedding-control="quiet"
                                type="button"
                                onClick={() => scrollToSection(item.id)}
                                className="min-h-10 px-1 text-[11px] font-medium uppercase tracking-[0.22em] opacity-70 transition-opacity hover:opacity-100"
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}

                <div className="mt-8 flex flex-col items-center gap-5">
                    <button
                        data-wedding-control="quiet"
                        type="button"
                        onClick={scrollToTop}
                        className="inline-flex min-h-10 items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.24em] opacity-65 transition-opacity hover:opacity-100"
                    >
                        <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                        Back to top
                    </button>

                    <Link
                        data-wedding-control="secondary"
                        href="/"
                        aria-label="Made with QuickWeds"
                        className="inline-flex min-h-11 items-center gap-2.5 opacity-55 transition-opacity hover:opacity-95"
                    >
                        <span className="text-[10px] uppercase tracking-[0.24em]">Crafted with</span>
                        <Image
                            src="/logo.png"
                            alt="QuickWeds"
                            width={92}
                            height={32}
                            className={`h-4 w-auto grayscale ${visual.isDark ? 'brightness-0 invert' : ''}`}
                        />
                    </Link>
                </div>
            </div>
        </footer>
    );
}
