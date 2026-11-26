'use client';

import { motion } from 'framer-motion';
import { Camera, Church, Music, Sparkles, Utensils, Wine } from 'lucide-react';
import { useSectionActions } from '@/context/SectionContext';
import { useEffect } from 'react';
import { getSectionTitleStyle, getTemplateVisualProfile } from '@/lib/theme-engine';
import { timelineIconKind, type TimelineIconKind } from '@/lib/wedding-timeline';
import { SectionTemplateElement } from './SectionTemplateElement';

interface TimelineSectionProps {
    timeline: string;
    wedding?: any;
    id: string;
}

interface TimelineItem {
    time: string;
    event: string;
    isDayHeader?: boolean;
}

const TIMELINE_ICONS: Record<TimelineIconKind, typeof Church> = {
    ceremony: Church,
    drinks: Wine,
    meal: Utensils,
    photo: Camera,
    music: Music,
    celebration: Sparkles,
};

const TEMPLATE_TIMELINE_COPY: Record<string, { eyebrow: string; title: string }> = {
    minimal: { eyebrow: 'Schedule', title: 'Order of Events' },
    editorial: { eyebrow: 'The Itinerary', title: 'Order of the Day' },
    'editorial-luxe': { eyebrow: 'The Itinerary', title: 'Order of the Day' },
    'velure-editorial': { eyebrow: 'The Itinerary', title: 'Order of the Day' },
    vogue: { eyebrow: 'Run of Show', title: 'The Schedule' },
    monochrome: { eyebrow: 'Schedule', title: 'Order of Events' },
    luxury: { eyebrow: 'Black-Tie Timing', title: 'The Evening Program' },
    artdeco: { eyebrow: 'Evening Order', title: 'The Grand Program' },
    royal: { eyebrow: 'Ceremonial Order', title: 'The Evening Program' },
    midnight: { eyebrow: 'After-Hours Order', title: 'Midnight Program' },
    cinematic: { eyebrow: 'Run of Show', title: 'The Wedding Reel' },
    'cinematic-vow': { eyebrow: 'Run of Show', title: 'The Celebration' },
    film: { eyebrow: 'Sequence', title: 'The Day in Frames' },
    elopement: { eyebrow: 'The Quiet Path', title: 'Our Day Together' },
    traditional: { eyebrow: 'Ceremonial Order', title: 'The Formal Program' },
    garden: { eyebrow: 'Garden Schedule', title: 'Order of the Day' },
    'botanical-arch': { eyebrow: 'Garden Schedule', title: 'Order of the Day' },
    'watercolor-meadow': { eyebrow: 'Garden Schedule', title: 'Order of the Day' },
    'envelope-wax-seal': { eyebrow: 'The Itinerary', title: 'Order of the Day' },
    riviera: { eyebrow: 'Weekend Itinerary', title: 'The Celebration' },
    'pearl-coastal': { eyebrow: 'By the Sea', title: 'Order of the Day' },
    tropical: { eyebrow: 'Island Schedule', title: 'Order of the Day' },
    nordic: { eyebrow: 'Schedule', title: 'Order of the Day' },
    boho: { eyebrow: 'Celebration Flow', title: 'Order of the Day' },
    rustic: { eyebrow: 'Gathered Day', title: 'Order of the Day' },
    'torn-paper-terracotta': { eyebrow: 'The Itinerary', title: 'Order of the Day' },
    vintage: { eyebrow: 'Keepsake Program', title: 'Order of the Day' },
    romantic: { eyebrow: 'The Celebration', title: 'Order of the Day' },
    'editorial-romance': { eyebrow: 'The Itinerary', title: 'Order of the Day' },
    sakura: { eyebrow: 'Spring Schedule', title: 'Order of the Day' },
    celestial: { eyebrow: 'Evening Program', title: 'Under the Stars' },
};

function isDayHeadingLine(line: string): boolean {
    return /^(day\s*\d+|friday|saturday|sunday|monday|tuesday|wednesday|thursday|welcome|rehearsal|farewell|brunch)\b.*[:—–-]?$/i.test(line)
        && (line.endsWith(':') || line.length <= 36)
        && !/\d{1,2}:\d{2}/.test(line);
}

function parseTimeline(raw: string): TimelineItem[] {
    const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
    return lines.map((line) => {
        const match = line.match(/^(\d{1,2}(?::\d{2})?(?:\s?[apAP][mM])?)\s*[-–|:•]\s*(.+)$/);
        if (match) {
            return { time: match[1].trim(), event: match[2].trim() };
        }
        if (isDayHeadingLine(line)) {
            return { time: '', event: line.replace(/:$/, '').trim(), isDayHeader: true };
        }
        return { time: '', event: line };
    });
}

export default function TimelineSection({ timeline, wedding, id }: TimelineSectionProps) {
    const { registerSection, unregisterSection } = useSectionActions();

    useEffect(() => {
        if (!timeline) return;
        registerSection(id, 'Timeline');
        return () => unregisterSection(id);
    }, [id, timeline, registerSection, unregisterSection]);

    if (!timeline) return null;

    const items = parseTimeline(timeline);
    const template = (wedding?.template || 'classic').toLowerCase();
    const motifColor = wedding?.motif_color || '#D16C78';
    const visual = getTemplateVisualProfile(template, motifColor, false, wedding?.card_style);
    const titleStyle = getSectionTitleStyle(wedding || {}, visual.headingClass);
    const isDark = visual.isDark;
    const isSharp = visual.isSharp;
    const copy = TEMPLATE_TIMELINE_COPY[template] || { eyebrow: 'The Itinerary', title: 'Order of the Day' };

    return (
        <section
            data-wedding-section="TimelineSection"
            id={id}
            className={`relative z-10 overflow-hidden py-16 sm:py-24 md:py-28 ${visual.sectionClass}`}
            style={visual.sectionStyle}
        >
            {visual.ornament === 'film' && (
                <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.1)_0_10px,transparent_10px_24px)]" />
            )}

            <div className="relative mx-auto max-w-4xl px-4 sm:px-6 md:px-8">
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="mb-10 text-center sm:mb-14"
                >
                    <div className="mb-4 flex items-center justify-center">
                        <span data-wedding-badge="true" className={visual.badgeStyleClass || `text-[11px] font-medium uppercase ${visual.eyebrowClass}`}>
                            {copy.eyebrow}
                        </span>
                    </div>
                    <h2
                        className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl ${titleStyle.className}`}
                        style={titleStyle.style}
                    >
                        {copy.title}
                    </h2>
                    <SectionTemplateElement wedding={wedding} isDark={isDark} placement="divider" className="mt-6" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.7 }}
                    data-wedding-card="timeline"
                    className={`relative overflow-hidden px-5 py-8 sm:px-10 sm:py-12 md:px-14 ${visual.cardClass}`}
                >
                    <SectionTemplateElement wedding={wedding} isDark={isDark} placement="corner-top-right" />

                    <ol className="relative mx-auto max-w-2xl">
                        {/* Delicate vertical timeline rail */}
                        <span
                            aria-hidden="true"
                            className={`pointer-events-none absolute bottom-6 left-[1.15rem] top-6 w-px sm:left-[1.35rem] ${
                                isDark ? 'bg-white/15' : 'bg-current opacity-15'
                            }`}
                        />

                        {items.map((item, idx) => {
                            if (item.isDayHeader) {
                                return (
                                    <li
                                        key={`day-${item.event}-${idx}`}
                                        className={`relative py-5 first:pt-0 ${idx > 0 ? 'mt-4 border-t border-current/10 pt-7' : ''}`}
                                    >
                                        <span className="inline-block bg-transparent pl-12 text-[11px] font-medium uppercase tracking-[0.28em] text-primary sm:pl-14">
                                            {item.event}
                                        </span>
                                    </li>
                                );
                            }

                            const iconKey = timelineIconKind(item.event, idx);
                            const Icon = TIMELINE_ICONS[iconKey];

                            return (
                                <motion.li
                                    key={`${item.time}-${item.event}-${idx}`}
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: Math.min(idx * 0.04, 0.24) }}
                                    className={`relative flex items-start gap-4 border-b py-5 last:border-b-0 sm:gap-6 sm:py-6 ${
                                        isDark ? 'border-white/12' : 'border-black/10'
                                    }`}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`relative z-10 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border sm:h-11 sm:w-11 ${
                                            isSharp ? 'rounded-none' : 'rounded-full'
                                        } ${
                                            isDark
                                                ? 'border-white/20 bg-[#151417] text-primary'
                                                : 'border-primary/25 bg-[#fffdfb] text-primary'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4 stroke-[1.4] sm:h-[18px] sm:w-[18px]" />
                                    </span>

                                    <div className="min-w-0 flex-1 pt-0.5 sm:grid sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-baseline sm:gap-6">
                                        {item.time ? (
                                            <time className="block text-xs font-medium uppercase tracking-[0.18em] text-primary tabular-nums sm:text-sm">
                                                {item.time}
                                            </time>
                                        ) : (
                                            <span className="hidden sm:block" />
                                        )}
                                        <p className={`mt-1 break-words font-serif text-xl leading-snug sm:mt-0 sm:text-2xl ${isDark ? 'text-white/95' : ''}`}>
                                            {item.event}
                                        </p>
                                    </div>
                                </motion.li>
                            );
                        })}
                    </ol>
                </motion.div>
            </div>
        </section>
    );
}
