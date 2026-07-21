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
    const accent = group === 'sponsors' ? color : mixColor(color, '#ffffff', 0.2);
    const darkText = mixColor(color, '#2f2527', 0.85);
    const strokeColor = '#2C2224';
    const isSponsor = group === 'sponsors';

    return (
        <svg viewBox="0 0 340 240" className="mx-auto h-60 w-full max-w-sm select-none transition-transform duration-300 hover:scale-[1.02]" aria-hidden="true">
            <defs>
                <linearGradient id={`gown-grad-${group}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accent} />
                    <stop offset="100%" stopColor={mixColor(color, '#2f2527', 0.35)} />
                </linearGradient>
                <linearGradient id={`barong-grad`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FAF5EE" />
                    <stop offset="100%" stopColor="#EFE4D6" />
                </linearGradient>
                <linearGradient id={`skin-grad-${group}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F9DFD0" />
                    <stop offset="100%" stopColor="#EEC0A7" />
                </linearGradient>
                <linearGradient id={`hair-dark-${group}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4A342E" />
                    <stop offset="100%" stopColor="#2A1B16" />
                </linearGradient>
            </defs>

            {/* Base shadow lines */}
            <ellipse cx="85" cy="208" rx="42" ry="5" fill="#2C2224" opacity="0.08" />
            <ellipse cx="255" cy="208" rx="42" ry="5" fill="#2C2224" opacity="0.08" />

            {isSponsor ? (
                /* PRINCIPAL SPONSORS: HUMANIZED FORMAL GOWN & BARONG AND SLACKS */
                <g>
                    {/* FEMALE FORMAL GOWN */}
                    <g transform="translate(15, 0)">
                        {/* Skin Fills */}
                        <circle cx="64" cy="36" r="10" fill={`url(#skin-grad-${group})`} />
                        <path d="M 58,46 L 70,46 L 68,66 L 60,66 Z" fill={`url(#skin-grad-${group})`} />
                        
                        {/* Hair */}
                        <path d="M 64,20 C 54,20 48,28 50,42 C 52,50 46,60 44,70 C 43,76 46,82 52,86 C 56,82 58,76 56,68 C 54,60 60,52 64,52 C 70,52 78,46 76,36 C 74,26 70,20 64,20 Z" fill={`url(#hair-dark-${group})`} stroke={strokeColor} strokeWidth="1.2" />

                        {/* Gown Color Fill */}
                        <path
                            d="M 62,68 C 50,68 46,78 48,92 C 50,102 58,114 56,128 C 54,142 42,168 35,190 C 32,200 30,206 38,206 C 58,206 82,206 102,206 C 110,206 108,200 105,190 C 98,168 86,142 84,128 C 82,114 90,102 92,92 C 94,78 90,68 78,68 Z"
                            fill={`url(#gown-grad-${group})`}
                        />

                        {/* Facial Contour */}
                        <path d="M 62,34 C 64,36 66,36 68,34 M 66,40 C 64,42 62,42 60,40" stroke="#8C5C4A" strokeWidth="1" strokeLinecap="round" fill="none" />

                        {/* Line Art Overlay & Garment Folds */}
                        <path d="M 50,70 C 58,74 64,74 70,70 C 76,74 84,74 90,70 M 50,70 L 48,94 M 90,70 L 92,94 M 48,94 C 60,98 80,98 92,94" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                        <path d="M 68,74 L 68,96 M 58,72 L 56,95 M 80,72 L 82,95" stroke="#FFFFFF" opacity="0.3" strokeWidth="1" fill="none" />
                        <path d="M 48,94 C 44,106 52,118 64,120 M 92,94 C 96,106 88,118 76,120 M 64,120 L 76,120" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                        <path d="M 50,70 C 40,78 38,88 44,96 M 90,70 C 98,78 96,88 90,96" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                        <path d="M 64,120 C 56,145 42,175 35,206 M 76,120 C 84,145 98,175 105,206 M 70,122 C 70,150 70,180 70,206" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                        <path d="M 55,150 C 50,175 42,195 38,206 M 85,150 C 90,175 98,195 102,206" stroke="#FFFFFF" opacity="0.35" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                        <path d="M 35,206 C 58,208 82,208 105,206" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                    </g>

                    {/* MALE BARONG AND SLACKS */}
                    <g transform="translate(185, 0)">
                        {/* Skin Fills */}
                        <circle cx="70" cy="34" r="10" fill={`url(#skin-grad-${group})`} />
                        <path d="M 64,44 L 76,44 L 74,58 L 66,58 Z" fill={`url(#skin-grad-${group})`} />

                        {/* Hair */}
                        <path d="M 62,20 C 54,20 48,26 50,34 C 52,38 56,38 60,34 C 64,30 74,28 78,32 C 82,36 86,34 84,28 C 82,22 74,20 62,20 Z" fill={`url(#hair-dark-${group})`} stroke={strokeColor} strokeWidth="1.2" />

                        {/* Face Features */}
                        <path d="M 66,34 C 68,36 70,36 72,34 M 68,40 C 69,41 71,41 72,40" stroke="#8C5C4A" strokeWidth="1" strokeLinecap="round" fill="none" />

                        {/* Barong Shirt Fill */}
                        <path d="M 48,64 L 30,76 L 36,132 L 50,134 L 50,138 L 90,138 L 90,134 L 104,132 L 110,76 L 92,64 Z" fill="url(#barong-grad)" />
                        {/* Slacks Fill */}
                        <path d="M 50,136 L 46,206 L 64,206 L 70,150 L 76,150 L 82,206 L 100,206 L 96,136 Z" fill="#232021" />

                        {/* Collar & Embroidery Details */}
                        <path d="M 60,58 L 60,66 L 80,66 L 80,58 M 64,66 L 64,118 L 76,118 L 76,66" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                        <path d="M 56,70 L 56,112 C 56,116 62,118 70,118 C 78,118 84,116 84,112 L 84,70" stroke="#8B7B6B" strokeWidth="1.1" strokeDasharray="3 2" fill="none" />

                        {/* Sleeves & Trousers */}
                        <path d="M 48,64 L 30,76 L 36,132 L 48,134 M 92,64 L 110,76 L 104,132 L 92,134 M 48,134 L 92,134" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                        <path d="M 50,136 L 46,204 L 64,204 M 96,136 L 100,204 L 82,204 M 70,144 L 70,204 M 76,144 L 76,204" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                        {/* Polished Dress Shoes */}
                        <path d="M 42,204 C 44,209 60,209 64,204 M 82,204 C 86,209 102,209 104,204" fill="#111111" stroke={strokeColor} strokeWidth="1.4" />
                    </g>

                    {/* Labels matching screenshot */}
                    <text x="85" y="228" className="text-[11px] font-semibold tracking-wide" fill={darkText} textAnchor="middle">Formal Gown</text>
                    <text x="255" y="228" className="text-[11px] font-semibold tracking-wide" fill={darkText} textAnchor="middle">Barong and Slacks</text>
                </g>
            ) : (
                /* GUESTS: HUMANIZED SEMI-FORMAL (SHIRT & SLACKS + COCKTAIL DRESS) */
                <g>
                    {/* MALE GUEST (SHIRT & SLACKS) */}
                    <g transform="translate(15, 0)">
                        {/* Skin Fill */}
                        <circle cx="60" cy="34" r="10" fill={`url(#skin-grad-${group})`} />
                        <path d="M 54,44 L 66,44 L 64,58 L 56,58 Z" fill={`url(#skin-grad-${group})`} />

                        {/* Hair */}
                        <path d="M 54,20 C 46,20 42,26 44,34 C 46,38 52,36 56,32 C 60,28 68,26 72,30 C 76,34 78,32 76,26 C 74,20 64,20 54,20 Z" fill={`url(#hair-dark-${group})`} stroke={strokeColor} strokeWidth="1.2" />

                        {/* Face Lines */}
                        <path d="M 56,34 C 58,36 60,36 62,34 M 58,40 C 59,41 61,41 62,40" stroke="#8C5C4A" strokeWidth="1" strokeLinecap="round" fill="none" />

                        {/* Tucked-in Shirt Fill */}
                        <path d="M 52,66 L 34,78 L 40,126 L 80,126 L 86,78 L 68,66 Z" fill={mixColor(color, '#ffffff', 0.45)} />
                        {/* Belt */}
                        <rect x="42" y="126" width="36" height="6" fill="#3D2E2B" rx="1" />
                        <rect x="57" y="125" width="6" height="8" fill="#D4AF37" rx="1" />
                        {/* Light Slacks Fill */}
                        <path d="M 42,132 L 38,204 L 56,204 L 60,150 L 62,150 L 66,204 L 84,204 L 80,132 Z" fill="#F4EFEA" />

                        {/* Line Art Overlay */}
                        <path d="M 54,66 L 60,56 L 66,66 M 60,66 L 60,126" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                        <path d="M 52,66 L 34,78 L 40,126 M 68,66 L 86,78 L 80,126" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                        <path d="M 42,132 L 38,204 L 56,204 M 80,132 L 84,204 L 66,204 M 60,146 L 60,204" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                        <path d="M 34,204 C 36,209 52,209 56,204 M 66,204 C 70,209 86,209 88,204" fill="#222222" stroke={strokeColor} strokeWidth="1.4" />
                    </g>

                    {/* FEMALE GUEST (SEMI-FORMAL TIERED DRESS) */}
                    <g transform="translate(185, 0)">
                        {/* Skin Fill (Face, Shoulders, Arms, Legs) */}
                        <circle cx="60" cy="34" r="10" fill={`url(#skin-grad-${group})`} />
                        <path d="M 54,44 L 66,44 L 64,58 L 56,58 Z" fill={`url(#skin-grad-${group})`} />
                        <path d="M 46,148 L 48,202 M 74,148 L 72,202" stroke="#E8B59E" strokeWidth="4" strokeLinecap="round" />

                        {/* Wavy Flowing Hair */}
                        <path d="M 60,20 C 48,20 42,28 44,40 C 46,52 40,62 38,72 M 62,20 C 72,20 78,28 76,40 C 74,52 78,62 80,72" fill={`url(#hair-dark-${group})`} stroke={strokeColor} strokeWidth="1.2" />

                        {/* Face Features */}
                        <path d="M 56,34 C 58,36 60,36 62,34 M 58,40 C 59,41 61,41 62,40" stroke="#8C5C4A" strokeWidth="1" strokeLinecap="round" fill="none" />

                        {/* Tiered Dress Fill */}
                        <path d="M 48,72 C 40,72 38,82 40,96 L 36,112 L 84,112 L 80,96 C 82,82 80,72 72,72 Z" fill={`url(#gown-grad-${group})`} />
                        <path d="M 36,112 C 34,124 38,136 34,148 L 86,148 C 82,136 86,124 84,112 Z" fill={mixColor(color, '#ffffff', 0.25)} />
                        <rect x="42" y="96" width="36" height="7" fill="#5C3D2E" rx="2" />
                        <circle cx="60" cy="99" r="4" fill="#D4AF37" />

                        {/* Dress Details */}
                        <path d="M 48,72 C 56,75 64,75 72,72 M 40,72 L 42,96 L 78,96 L 80,72" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                        <path d="M 38,112 C 48,116 72,116 82,112 M 36,130 C 46,134 74,134 84,130 M 34,148 C 44,152 76,152 86,148" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                        <path d="M 44,72 C 34,80 32,90 38,98 M 76,72 C 86,80 88,90 82,98" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                        <path d="M 44,202 L 50,202 L 48,206 M 68,202 L 74,202 L 72,206" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                    </g>

                    {/* Label matching screenshot */}
                    <text x="170" y="228" className="text-[11px] font-semibold tracking-wide" fill={darkText} textAnchor="middle">Semi-Formal</text>
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
    const visual = getTemplateVisualProfile(wedding.template || 'classic', wedding.motif_color || color, false, wedding.card_style);
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
