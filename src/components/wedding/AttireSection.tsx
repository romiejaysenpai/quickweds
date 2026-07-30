'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shirt } from 'lucide-react';
import type { Wedding } from '@/types/wedding';
import { useSectionContext } from '@/context/SectionContext';
import { getTemplateVisualProfile } from '@/lib/theme-engine';
import AttireIllustration from '@/components/AttireIllustration';
import { parseDressCodeValue } from '@/lib/dress-code';

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

export default function AttireSection({ wedding, id = 'attire', embedded = false }: { wedding: Wedding; id?: string; embedded?: boolean }) {
    const { registerSection, unregisterSection } = useSectionContext();

    useEffect(() => {
        registerSection(id, 'Attire');
        return () => unregisterSection(id);
    }, [id, registerSection, unregisterSection]);

    const dressCodes = parseDressCodeValue(wedding.dress_code, wedding.motif_color);
    const { sponsors, guests } = dressCodes;
    const visual = getTemplateVisualProfile(wedding.template || 'classic', wedding.motif_color || guests.color);
    const isDark = ['royal', 'midnight', 'cinematic', 'urban', 'glitch', 'film'].includes(wedding.template || '');
    const palette = [
        sponsors.color,
        guests.color,
        wedding.motif_color || guests.color,
        mixColor(guests.color, '#ffffff', 0.5),
        mixColor(sponsors.color, '#2f2527', 0.25),
    ];
    const paletteLabels = ['Sponsors', 'Guests'];

    if (embedded) {
        return (
            <motion.div id={id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className={`h-full overflow-hidden rounded-[2rem] border p-5 shadow-sm backdrop-blur sm:p-7 ${isDark ? 'border-white/10 bg-white/5' : 'border-primary/10 bg-white/80'}`}>
                <div className="mb-6 flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${isDark ? 'border-white/15 bg-white/10' : 'border-primary/15 bg-white'} shadow-sm`}>
                        <Shirt className="h-6 w-6 stroke-[1.6] text-primary" />
                    </div>
                    <div>
                        <p className={`mb-2 text-[10px] font-black uppercase ${visual.eyebrowClass}`}>Dress code</p>
                        <h3 className={`font-serif text-3xl leading-tight sm:text-4xl ${isDark ? 'text-white/90' : 'text-[#4A4444]'}`}>Wedding Attire</h3>
                        <p className={`mt-3 text-sm leading-6 ${isDark ? 'text-white/60' : 'text-[#4A4444]/65'}`}>We Kindly invite you to celebrate with us by dressing in attire that reflects our wedding colors.</p>
                    </div>
                </div>

                <div className="mb-7 flex flex-wrap gap-3">
                    {palette.slice(0, 5).map((swatch, index) => (
                        <div key={`${swatch}-${index}`} className="flex flex-col items-center gap-1">
                            <span className="h-9 w-9 rounded-full border-[3px] border-white shadow-md" style={{ backgroundColor: swatch }} aria-label={paletteLabels[index] ? `${paletteLabels[index]} attire color` : `Wedding color ${index + 1}`} />
                            {paletteLabels[index] && <span className="text-[8px] font-black uppercase tracking-[0.12em] text-primary">{paletteLabels[index]}</span>}
                        </div>
                    ))}
                </div>

                <div className="grid gap-4">
                    <div className={`rounded-3xl border p-4 ${isDark ? 'border-white/10 bg-black/10' : 'border-primary/10 bg-white/70'}`}>
                        <AttireIllustration color={sponsors.color} variant="sponsors" className="max-w-sm" />
                        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">Principal Sponsors</p>
                        <h4 className={`mt-2 font-serif text-xl ${isDark ? 'text-white/90' : 'text-[#4A4444]'}`}>{sponsors.attire}</h4>
                    </div>
                    <div className={`rounded-3xl border p-4 ${isDark ? 'border-white/10 bg-black/10' : 'border-primary/10 bg-white/70'}`}>
                        <AttireIllustration color={guests.color} variant="guests" className="max-w-sm" />
                        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">For Guests</p>
                        <h4 className={`mt-2 font-serif text-xl ${isDark ? 'text-white/90' : 'text-[#4A4444]'}`}>{guests.attire}</h4>
                        <p className={`mt-2 text-sm leading-6 ${isDark ? 'text-white/60' : 'text-[#4A4444]/65'}`}>We warmly invite guests to follow the selected dress code and complement our wedding colors.</p>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <section id={id} className={`relative z-10 overflow-hidden px-4 py-16 sm:px-6 sm:py-24 ${visual.sectionClass}`} style={visual.sectionStyle}>
            <div className="mx-auto max-w-6xl">
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} className="mx-auto mb-12 max-w-3xl text-center">
                    <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border ${isDark ? 'border-white/15 bg-white/10' : 'border-primary/15 bg-white/75'} shadow-sm`}>
                        <Shirt className="h-7 w-7 stroke-[1.6] text-primary" />
                    </div>
                    <div className="mb-3 flex items-center justify-center">
                        <span className={visual.badgeStyleClass || `text-[10px] font-black uppercase ${visual.eyebrowClass}`}>
                            {visual.badgePrefix ? `${visual.badgePrefix}ATTIRE` : 'DRESS CODE'}
                        </span>
                    </div>
                    <h2 className={`text-4xl sm:text-5xl md:text-6xl ${visual.headingClass}`}>Wedding Attire</h2>
                    <p className={`mx-auto mt-5 max-w-2xl text-sm leading-7 sm:text-base ${isDark ? 'text-white/65' : 'text-[#4A4444]/70'}`}>We Kindly invite you to celebrate with us by dressing in attire that reflects our wedding colors.</p>
                </motion.div>

                <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
                    {palette.map((swatch, index) => (
                        <div key={`${swatch}-${index}`} className="flex flex-col items-center gap-2">
                            <span className="h-12 w-12 rounded-full border-4 border-white shadow-lg sm:h-14 sm:w-14" style={{ backgroundColor: swatch }} aria-label={paletteLabels[index] ? `${paletteLabels[index]} attire color` : `Wedding color ${index + 1}`} />
                            {paletteLabels[index] && <span className="text-[9px] font-black uppercase tracking-[0.18em] text-primary">{paletteLabels[index]}</span>}
                        </div>
                    ))}
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`rounded-[2rem] border p-6 text-center shadow-sm backdrop-blur sm:p-8 ${isDark ? 'border-white/10 bg-white/5' : 'border-primary/10 bg-white/75'}`}>
                        <AttireIllustration color={sponsors.color} variant="sponsors" className="max-w-md" />
                        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.28em] text-primary">Principal Sponsors</p>
                        <h3 className={`mt-3 font-serif text-2xl sm:text-3xl ${isDark ? 'text-white/90' : 'text-[#4A4444]'}`}>{sponsors.attire}</h3>
                        <p className={`mx-auto mt-3 max-w-md text-sm leading-6 ${isDark ? 'text-white/60' : 'text-[#4A4444]/65'}`}>We invite our principal sponsors to wear elegant formal attire in shades that complement the wedding palette.</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }} className={`rounded-[2rem] border p-6 text-center shadow-sm backdrop-blur sm:p-8 ${isDark ? 'border-white/10 bg-white/5' : 'border-primary/10 bg-white/75'}`}>
                        <AttireIllustration color={guests.color} variant="guests" className="max-w-md" />
                        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.28em] text-primary">For Guests</p>
                        <h3 className={`mt-3 font-serif text-2xl sm:text-3xl ${isDark ? 'text-white/90' : 'text-[#4A4444]'}`}>{guests.attire}</h3>
                        <p className={`mx-auto mt-3 max-w-md text-sm leading-6 ${isDark ? 'text-white/60' : 'text-[#4A4444]/65'}`}>We warmly invite guests to follow the selected dress code and complement our wedding colors.</p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
