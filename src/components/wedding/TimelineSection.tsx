'use client';

import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useSectionContext } from '@/context/SectionContext';
import { useEffect } from 'react';
import { getTemplateVisualProfile } from '@/lib/theme-engine';

interface TimelineSectionProps {
    timeline: string;
    wedding?: any;
    id: string;
}

interface TimelineItem {
    time: string;
    event: string;
}

/**
 * Parses a free-text program timeline into structured {time, event} pairs.
 * Supports formats like:
 *   "2:00 PM - Guest Arrival"
 *   "14:00 Ceremony begins"
 *   "3pm | Reception"
 *   Plain lines with no time are rendered as-is in the event column.
 */
function parseTimeline(raw: string): TimelineItem[] {
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    return lines.map(line => {
        // Pattern: optional time prefix + delimiter + event name
        const match = line.match(
            /^(\d{1,2}(?::\d{2})?(?:\s?[apAP][mM])?)\s*[-–|:•]\s*(.+)$/
        );
        if (match) {
            return { time: match[1].trim(), event: match[2].trim() };
        }
        // No time detected — treat full line as event with empty time
        return { time: '', event: line };
    });
}

export default function TimelineSection({ timeline, wedding, id }: TimelineSectionProps) {
    const { registerSection, unregisterSection } = useSectionContext();
    
    useEffect(() => {
        registerSection(id, 'Timeline');
        return () => unregisterSection(id);
    }, [id, registerSection, unregisterSection]);
    
    if (!timeline) return null;

    const items = parseTimeline(timeline);
    const hasAnyTime = items.some(i => i.time !== '');

    const template = wedding?.template || 'classic';
    const motifColor = wedding?.motif_color || '#D16C78';
    const visual = getTemplateVisualProfile(template, motifColor);
    const isSharp = ['editorial', 'urban', 'minimal', 'vogue', 'glitch', 'film'].includes(template);
    const isDark = ['royal', 'midnight', 'cinematic'].includes(template);
    const isVintage = ['vintage', 'rustic', 'boho', 'artdeco'].includes(template);

    const containerClass = isSharp
        ? `p-8 md:p-14 ${visual.cardClass}`
        : isDark
            ? `p-8 md:p-14 ${visual.cardClass}`
            : isVintage
                ? `p-8 md:p-14 ${visual.cardClass}`
                : `relative p-4 sm:p-8 md:p-16 ${visual.cardClass}`;

    const dotClass = isDark
        ? 'border-2 border-primary bg-[#121212]'
        : 'border-2 border-primary bg-white';

    return (
        <section id={id} className={`py-16 sm:py-24 md:py-32 relative z-10 overflow-hidden ${visual.sectionClass}`} style={visual.sectionStyle}>
            {visual.ornament === 'film' && <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.12)_0_12px,transparent_12px_26px)]" />}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 relative">
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="text-center mb-8 sm:mb-12 md:mb-16"
                >
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto flex items-center justify-center mb-4 sm:mb-6 min-h-[44px] min-w-[44px] ${isSharp ? 'border border-black/10 bg-white' : isDark ? 'border border-white/20 bg-white/10 backdrop-blur-xl' : 'bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl shadow-primary/10 rotate-3'}`}>
                        <Clock className={`w-6 h-6 sm:w-8 sm:h-8 ${isDark ? 'text-primary' : 'text-primary'}`} />
                    </div>
                    <p className={`mb-4 text-[10px] font-black uppercase ${visual.eyebrowClass}`}>Event flow</p>
                    <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl drop-shadow-sm ${visual.headingClass}`}>
                        {visual.timelineTitle}
                    </h2>
                    {isVintage && (
                        <div className="flex items-center justify-center gap-3 mt-4 opacity-40">
                            <div className="h-px w-16 bg-primary" />
                            <span className="text-primary text-xs tracking-widest uppercase">✦</span>
                            <div className="h-px w-16 bg-primary" />
                        </div>
                    )}
                </motion.div>

                {/* Timeline body */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.7, type: 'spring' }}
                    className={containerClass}
                >
                    {/* Fallback: if no parseable items, render raw text elegantly */}
                    {!hasAnyTime && items.length > 0 ? (
                        <div className="space-y-4">
                            {items.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`flex items-start gap-4 py-4 border-b last:border-0 ${isDark ? 'border-white/5' : 'border-primary/10'}`}
                                >
                                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-primary`} />
                                    <p className={`font-serif text-base sm:text-lg leading-relaxed ${isDark ? 'text-primary/70' : 'text-[#4A4444]/90'}`}>
                                        {item.event}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        /* Structured timeline with time + vertical line + event */
                        <div className="relative">
                            {/* Vertical timeline spine */}
                            <div
                                className="absolute top-4 bottom-4 w-px bg-gradient-to-b from-primary/0 via-primary/30 to-primary/0"
                                style={{ left: hasAnyTime ? '7rem' : '1.5rem' }}
                            />

                            <div className="space-y-0">
                                {items.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.06 }}
                                        className={`flex items-start gap-0 group py-5 border-b last:border-0 ${isDark ? 'border-white/5' : 'border-primary/8'}`}
                                    >
                                        {/* Time column */}
                                        {hasAnyTime && (
                                            <div className="w-20 sm:w-28 flex-shrink-0 pr-2 sm:pr-4 text-right">
                                                {item.time && (
                                                    <span
                                                        className="text-[10px] sm:text-xs font-black uppercase tracking-widest break-words block"
                                                        style={{ color: 'var(--primary)' }}
                                                    >
                                                        {item.time}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Dot */}
                                        <div className="relative flex-shrink-0" style={{ width: '1.2rem' }}>
                                            <div
                                                className={`w-2.5 h-2.5 rounded-full mt-1.5 mx-auto transition-transform group-hover:scale-125 ${dotClass}`}
                                                style={{ borderColor: 'var(--primary)' }}
                                            />
                                        </div>

                                        {/* Event */}
                                        <div className="flex-1 pl-3 sm:pl-4">
                                            <p className={`font-serif text-sm sm:text-lg leading-relaxed break-words ${isDark ? 'text-primary/80' : 'text-[#4A4444]/90'}`}>
                                                {item.event}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
