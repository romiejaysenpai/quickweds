'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shirt } from 'lucide-react';
import type { Wedding } from '@/types/wedding';
import { useSectionContext } from '@/context/SectionContext';
import { getTemplateVisualProfile } from '@/lib/theme-engine';
import AttireIllustration from '@/components/AttireIllustration';
import { parseDressCodeValue } from '@/lib/dress-code';

export default function AttireSection({ wedding, id = 'attire', embedded = false }: { wedding: Wedding; id?: string; embedded?: boolean }) {
    const { registerSection, unregisterSection } = useSectionContext();

    useEffect(() => {
        registerSection(id, 'Attire');
        return () => unregisterSection(id);
    }, [id, registerSection, unregisterSection]);

    const dressCodes = parseDressCodeValue(wedding.dress_code, wedding.motif_color);
    const { sponsors, guests } = dressCodes;
    const visual = getTemplateVisualProfile(wedding.template || 'classic', wedding.motif_color || guests.color, false, wedding.card_style);
    const isDark = visual.isDark;
    const palette = [sponsors.color, guests.color];
    const paletteLabels = ['Sponsors', 'Guests'];

    if (embedded) {
        return (
            <motion.div id={id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className={`h-full overflow-hidden p-5 sm:p-7 ${visual.cardClass}`}>
                <div className="mb-6 flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${isDark ? 'border-white/15 bg-white/10' : 'border-primary/15 bg-white'} shadow-sm`}>
                        <Shirt className="h-6 w-6 stroke-[1.6] text-primary" />
                    </div>
                    <div>
                        <p className={`mb-2 text-xs font-black uppercase ${visual.eyebrowClass}`}>Dress code</p>
                        <h3 className={`font-serif text-3xl leading-tight sm:text-4xl ${isDark ? 'text-white/90' : 'text-[#4A4444]'}`}>Wedding Attire</h3>
                        <p className={`mt-3 text-sm leading-6 ${isDark ? 'text-white/60' : 'text-[#4A4444]/65'}`}>We kindly invite you to celebrate with us by dressing in attire that reflects our wedding colors.</p>
                    </div>
                </div>

                <div className="mb-7 flex flex-wrap gap-3">
                    {palette.slice(0, 5).map((swatch, index) => (
                        <div key={`${swatch}-${index}`} className="flex flex-col items-center gap-1">
                            <span className="h-9 w-9 rounded-full border-[3px] border-white shadow-md" style={{ backgroundColor: swatch }} aria-label={paletteLabels[index] ? `${paletteLabels[index]} attire color` : `Wedding color ${index + 1}`} />
                            {paletteLabels[index] && <span className="text-xs font-black uppercase tracking-[0.12em] text-primary">{paletteLabels[index]}</span>}
                        </div>
                    ))}
                </div>

                <div className="grid gap-4">
                    <div className={`border-t px-1 py-5 ${isDark ? 'border-white/15' : 'border-black/10'}`}>
                        <AttireIllustration color={sponsors.color} variant="sponsors" className="max-w-sm" />
                        <p className="mt-2 text-xs font-black uppercase tracking-[0.24em] text-primary">Principal Sponsors</p>
                        <h4 className={`mt-2 font-serif text-xl ${isDark ? 'text-white/90' : 'text-[#4A4444]'}`}>{sponsors.attire}</h4>
                    </div>
                    <div className={`border-t px-1 py-5 ${isDark ? 'border-white/15' : 'border-black/10'}`}>
                        <AttireIllustration color={guests.color} variant="guests" className="max-w-sm" />
                        <p className="mt-2 text-xs font-black uppercase tracking-[0.24em] text-primary">For Guests</p>
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
                        <span className={visual.badgeStyleClass || `text-xs font-black uppercase ${visual.eyebrowClass}`}>
                            {visual.badgePrefix ? `${visual.badgePrefix}ATTIRE` : 'DRESS CODE'}
                        </span>
                    </div>
                    <h2 className={`text-4xl sm:text-5xl md:text-6xl ${visual.headingClass}`}>Wedding Attire</h2>
                    <p className={`mx-auto mt-5 max-w-2xl text-sm leading-7 sm:text-base ${isDark ? 'text-white/65' : 'text-[#4A4444]/70'}`}>We kindly invite you to celebrate with us by dressing in attire that reflects our wedding colors.</p>
                </motion.div>

                <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
                    {palette.map((swatch, index) => (
                        <div key={`${swatch}-${index}`} className="flex flex-col items-center gap-2">
                            <span className="h-12 w-12 rounded-full border-4 border-white shadow-lg sm:h-14 sm:w-14" style={{ backgroundColor: swatch }} aria-label={paletteLabels[index] ? `${paletteLabels[index]} attire color` : `Wedding color ${index + 1}`} />
                            {paletteLabels[index] && <span className="text-xs font-black uppercase tracking-[0.18em] text-primary">{paletteLabels[index]}</span>}
                        </div>
                    ))}
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`border-t p-6 text-center sm:p-8 ${isDark ? 'border-white/15' : 'border-black/10'}`}>
                        <AttireIllustration color={sponsors.color} variant="sponsors" className="max-w-md" />
                        <p className="mt-4 text-xs font-black uppercase tracking-[0.28em] text-primary">Principal Sponsors</p>
                        <h3 className={`mt-3 font-serif text-2xl sm:text-3xl ${isDark ? 'text-white/90' : 'text-[#4A4444]'}`}>{sponsors.attire}</h3>
                        <p className={`mx-auto mt-3 max-w-md text-sm leading-6 ${isDark ? 'text-white/60' : 'text-[#4A4444]/65'}`}>We invite our principal sponsors to wear elegant formal attire in shades that complement the wedding palette.</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }} className={`border-t p-6 text-center sm:p-8 ${isDark ? 'border-white/15' : 'border-black/10'}`}>
                        <AttireIllustration color={guests.color} variant="guests" className="max-w-md" />
                        <p className="mt-4 text-xs font-black uppercase tracking-[0.28em] text-primary">For Guests</p>
                        <h3 className={`mt-3 font-serif text-2xl sm:text-3xl ${isDark ? 'text-white/90' : 'text-[#4A4444]'}`}>{guests.attire}</h3>
                        <p className={`mx-auto mt-3 max-w-md text-sm leading-6 ${isDark ? 'text-white/60' : 'text-[#4A4444]/65'}`}>We warmly invite guests to follow the selected dress code and complement our wedding colors.</p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
