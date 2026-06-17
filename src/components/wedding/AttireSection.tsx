'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shirt } from 'lucide-react';
import type { Wedding } from '@/types/wedding';
import { useSectionContext } from '@/context/SectionContext';
import { getSectionTitleStyle, getTemplateVisualProfile } from '@/lib/theme-engine';

function getDressCodeParts(wedding: Wedding) {
    const [attire = '', color = ''] = (wedding.dress_code || '').split('||');
    return {
        attire: attire.trim() || 'Semi-formal attire',
        color: color.trim() || wedding.motif_color || '#D16C78',
    };
}

function hexToRgb(hex: string) {
    const normalized = hex.replace('#', '').trim();
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return { r: 209, g: 108, b: 120 };
    return {
        r: parseInt(normalized.slice(0, 2), 16),
        g: parseInt(normalized.slice(2, 4), 16),
        b: parseInt(normalized.slice(4, 6), 16),
    };
}

function mixColor(hex: string, target: '#ffffff' | '#2f2527', amount: number) {
    const base = hexToRgb(hex);
    const to = target === '#ffffff' ? { r: 255, g: 255, b: 255 } : { r: 47, g: 37, b: 39 };
    const mix = (from: number, dest: number) => Math.round(from + (dest - from) * amount);
    return `rgb(${mix(base.r, to.r)}, ${mix(base.g, to.g)}, ${mix(base.b, to.b)})`;
}

function AttireCharacters({ color, group }: { color: string; group: 'sponsors' | 'guests' }) {
    const accent = group === 'sponsors' ? color : mixColor(color, '#ffffff', 0.28);
    const dark = mixColor(color, '#2f2527', 0.55);

    return (
        <svg viewBox="0 0 360 210" className="mx-auto h-44 w-full max-w-sm" aria-hidden="true">
            <defs>
                <linearGradient id={`attire-${group}`} x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor={accent} />
                    <stop offset="100%" stopColor={mixColor(color, '#2f2527', 0.25)} />
                </linearGradient>
            </defs>
            <ellipse cx="180" cy="188" rx="132" ry="12" fill={mixColor(color, '#ffffff', 0.72)} opacity="0.7" />

            <g transform="translate(58 20)">
                <circle cx="55" cy="32" r="22" fill="#F2C6A8" />
                <path d="M34 31c5-24 36-27 46-4-9-6-23-7-46 4Z" fill={dark} />
                <path d="M26 161 42 72h27l16 89H26Z" fill={group === 'sponsors' ? dark : `url(#attire-${group})`} />
                <path d="M42 72h27l10 27H32l10-27Z" fill="#fff" opacity="0.92" />
                <path d="M53 75h7l-2 36h-3l-2-36Z" fill={accent} />
                <path d="M42 94 25 133M69 94l18 39" stroke="#F2C6A8" strokeWidth="13" strokeLinecap="round" />
                <path d="M35 161h44" stroke={dark} strokeWidth="10" strokeLinecap="round" />
            </g>

            <g transform="translate(154 16)">
                <circle cx="54" cy="34" r="22" fill="#F3C2A7" />
                <path d="M29 43c0-24 13-37 29-37s29 14 29 37c-15-11-43-11-58 0Z" fill={mixColor(color, '#2f2527', 0.68)} />
                <path d="M18 162 38 78h32l22 84H18Z" fill={`url(#attire-${group})`} />
                <path d="M38 78c10 16 22 16 32 0l7 25H31l7-25Z" fill="#fff" opacity="0.9" />
                <path d="M33 100 17 135M75 100l17 35" stroke="#F3C2A7" strokeWidth="12" strokeLinecap="round" />
                <path d="M29 162h56" stroke={mixColor(color, '#2f2527', 0.3)} strokeWidth="10" strokeLinecap="round" />
            </g>

            {group === 'guests' && (
                <g transform="translate(242 34)">
                    <circle cx="36" cy="27" r="18" fill="#E9B99D" />
                    <path d="M18 27c7-20 30-21 39-2-11-4-23-3-39 2Z" fill={dark} />
                    <path d="M12 143 25 64h24l14 79H12Z" fill={mixColor(color, '#ffffff', 0.18)} />
                    <path d="M25 64h24l7 20H18l7-20Z" fill="#fff" opacity="0.9" />
                    <path d="M25 88 11 119M49 88l15 31" stroke="#E9B99D" strokeWidth="11" strokeLinecap="round" />
                </g>
            )}
        </svg>
    );
}

export default function AttireSection({ wedding, id = 'attire', embedded = false }: { wedding: Wedding; id?: string; embedded?: boolean }) {
    const { registerSection, unregisterSection } = useSectionContext();

    useEffect(() => {
        registerSection(id, 'Attire');
        return () => unregisterSection(id);
    }, [id, registerSection, unregisterSection]);

    const { attire, color } = getDressCodeParts(wedding);
    const visual = getTemplateVisualProfile(wedding.template || 'classic', wedding.motif_color || color);
    const titleStyle = getSectionTitleStyle(wedding, visual.headingClass);
    const isDark = ['royal', 'midnight', 'cinematic', 'urban', 'glitch', 'film'].includes(wedding.template || '');
    const palette = [
        color,
        wedding.motif_color || color,
        mixColor(color, '#ffffff', 0.42),
        mixColor(color, '#ffffff', 0.7),
        mixColor(color, '#2f2527', 0.35),
    ];

    if (embedded) {
        return (
            <motion.div
                id={id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                className={`h-full overflow-hidden rounded-[2rem] border p-5 shadow-sm backdrop-blur sm:p-7 ${isDark ? 'border-white/10 bg-white/5' : 'border-primary/10 bg-white/80'}`}
            >
                <div className="mb-6 flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${isDark ? 'border-white/15 bg-white/10' : 'border-primary/15 bg-white'} shadow-sm`}>
                        <Shirt className="h-6 w-6 stroke-[1.6] text-primary" />
                    </div>
                    <div>
                        <p className={`mb-2 text-[10px] font-black uppercase ${visual.eyebrowClass}`}>Dress code</p>
                        <h3 className={`font-serif text-3xl leading-tight sm:text-4xl ${isDark ? 'text-white/90' : 'text-[#4A4444]'}`}>Wedding Attire</h3>
                        <p className={`mt-3 text-sm leading-6 ${isDark ? 'text-white/76' : 'text-[#4A4444]/74'}`}>
                            We Kindly invite you to celebrate with us by dressing in attire that reflects our wedding colors.
                        </p>
                    </div>
                </div>

                <div className="mb-7 flex flex-wrap gap-2">
                    {palette.slice(0, 5).map((swatch, index) => (
                        <span
                            key={`${swatch}-${index}`}
                            className="h-9 w-9 rounded-full border-[3px] border-white shadow-md"
                            style={{ backgroundColor: swatch }}
                            aria-label={`Wedding color ${index + 1}`}
                        />
                    ))}
                </div>

                <div className="grid gap-4">
                    <div className={`rounded-3xl border p-4 ${isDark ? 'border-white/10 bg-black/10' : 'border-primary/10 bg-white/70'}`}>
                        <AttireCharacters color={color} group="sponsors" />
                        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">Principal Sponsors</p>
                        <h4 className={`mt-2 font-serif text-xl ${isDark ? 'text-white/90' : 'text-[#4A4444]'}`}>Formal wedding attire</h4>
                    </div>

                    <div className={`rounded-3xl border p-4 ${isDark ? 'border-white/10 bg-black/10' : 'border-primary/10 bg-white/70'}`}>
                        <AttireCharacters color={color} group="guests" />
                        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">For Guests</p>
                        <h4 className={`mt-2 font-serif text-xl ${isDark ? 'text-white/90' : 'text-[#4A4444]'}`}>{attire}</h4>
                        <p className={`mt-2 text-sm leading-6 ${isDark ? 'text-white/76' : 'text-[#4A4444]/74'}`}>
                            Semi-formal attire that complements our wedding colors is warmly encouraged.
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <section id={id} className={`relative z-10 overflow-hidden px-4 py-16 sm:px-6 sm:py-24 ${visual.sectionClass}`} style={visual.sectionStyle}>
            <div className="mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    className="mx-auto mb-12 max-w-3xl text-center"
                >
                    <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border ${isDark ? 'border-white/15 bg-white/10' : 'border-primary/15 bg-white/75'} shadow-sm`}>
                        <Shirt className="h-7 w-7 stroke-[1.6] text-primary" />
                    </div>
                    <p className={`mb-3 text-[10px] font-black uppercase ${visual.eyebrowClass}`}>Dress code</p>
                    <h2 className={`text-4xl sm:text-5xl md:text-6xl ${titleStyle.className}`} style={titleStyle.style}>Wedding Attire</h2>
                    <p className={`mx-auto mt-5 max-w-2xl text-sm leading-7 sm:text-base ${isDark ? 'text-white/78' : 'text-[#4A4444]/76'}`}>
                        We Kindly invite you to celebrate with us by dressing in attire that reflects our wedding colors.
                    </p>
                </motion.div>

                <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
                    {palette.map((swatch, index) => (
                        <div key={`${swatch}-${index}`} className="flex flex-col items-center gap-2">
                            <span
                                className="h-12 w-12 rounded-full border-4 border-white shadow-lg sm:h-14 sm:w-14"
                                style={{ backgroundColor: swatch }}
                                aria-label={`Wedding color ${index + 1}`}
                            />
                            {index === 0 && <span className="text-[9px] font-black uppercase tracking-[0.18em] text-primary">Selected</span>}
                        </div>
                    ))}
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={`rounded-[2rem] border p-6 text-center shadow-sm backdrop-blur sm:p-8 ${isDark ? 'border-white/10 bg-white/5' : 'border-primary/10 bg-white/75'}`}
                    >
                        <AttireCharacters color={color} group="sponsors" />
                        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.28em] text-primary">Principal Sponsors</p>
                        <h3 className={`mt-3 font-serif text-2xl sm:text-3xl ${isDark ? 'text-white/90' : 'text-[#4A4444]'}`}>Formal wedding attire</h3>
                        <p className={`mx-auto mt-3 max-w-md text-sm leading-6 ${isDark ? 'text-white/76' : 'text-[#4A4444]/74'}`}>
                            We invite our principal sponsors to wear elegant formal attire in shades that complement the wedding palette.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.08 }}
                        className={`rounded-[2rem] border p-6 text-center shadow-sm backdrop-blur sm:p-8 ${isDark ? 'border-white/10 bg-white/5' : 'border-primary/10 bg-white/75'}`}
                    >
                        <AttireCharacters color={color} group="guests" />
                        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.28em] text-primary">For Guests</p>
                        <h3 className={`mt-3 font-serif text-2xl sm:text-3xl ${isDark ? 'text-white/90' : 'text-[#4A4444]'}`}>{attire}</h3>
                        <p className={`mx-auto mt-3 max-w-md text-sm leading-6 ${isDark ? 'text-white/76' : 'text-[#4A4444]/74'}`}>
                            Semi-formal attire that complements our wedding colors is warmly encouraged.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
