'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shirt, Sparkles } from 'lucide-react';
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
    const { sponsors, guests, bridesmaids } = dressCodes;
    const visual = getTemplateVisualProfile(wedding.template || 'classic', wedding.motif_color || guests.color, false, wedding.card_style);
    const isDark = visual.isDark;

    // Collect all swatches across sponsors, guests, and bridesmaids
    const allSwatches = Array.from(new Set([
        ...(sponsors.colors || [sponsors.color]),
        ...(guests.colors || [guests.color]),
        ...(bridesmaids ? (bridesmaids.colors || [bridesmaids.color]) : []),
    ])).filter(Boolean);

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
                    {allSwatches.slice(0, 8).map((swatch, index) => (
                        <div key={`${swatch}-${index}`} className="flex flex-col items-center gap-1">
                            <span className="h-9 w-9 rounded-full border-[3px] border-white shadow-md transition-transform hover:scale-110" style={{ backgroundColor: swatch }} aria-label={`Wedding color ${swatch}`} />
                            <span className="font-mono text-[10px] uppercase text-text-secondary">{swatch}</span>
                        </div>
                    ))}
                </div>

                <div className="grid gap-4">
                    <div className={`border-t px-1 py-5 ${isDark ? 'border-white/15' : 'border-black/10'}`}>
                        <AttireIllustration color={sponsors.dressColor || sponsors.color} suitColor={sponsors.suitColor} variant="sponsors" className="max-w-sm" />
                        <p className="mt-2 text-xs font-black uppercase tracking-[0.24em] text-primary">Principal Sponsors</p>
                        <h4 className={`mt-2 font-serif text-xl ${isDark ? 'text-white/90' : 'text-[#4A4444]'}`}>{sponsors.attire}</h4>
                        {sponsors.notes && <p className={`mt-1 text-xs italic ${isDark ? 'text-white/50' : 'text-[#4A4444]/60'}`}>{sponsors.notes}</p>}
                        {sponsors.colors && sponsors.colors.length > 1 && (
                            <div className="mt-3 flex items-center gap-2">
                                {sponsors.colors.map((c, i) => (
                                    <span key={i} className="h-5 w-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }} title={c} />
                                ))}
                            </div>
                        )}
                    </div>
                    <div className={`border-t px-1 py-5 ${isDark ? 'border-white/15' : 'border-black/10'}`}>
                        <AttireIllustration color={guests.dressColor || guests.color} suitColor={guests.suitColor} variant="guests" className="max-w-sm" />
                        <p className="mt-2 text-xs font-black uppercase tracking-[0.24em] text-primary">For Guests</p>
                        <h4 className={`mt-2 font-serif text-xl ${isDark ? 'text-white/90' : 'text-[#4A4444]'}`}>{guests.attire}</h4>
                        {guests.notes && <p className={`mt-1 text-xs italic ${isDark ? 'text-white/50' : 'text-[#4A4444]/60'}`}>{guests.notes}</p>}
                        {guests.colors && guests.colors.length > 1 && (
                            <div className="mt-3 flex items-center gap-2">
                                {guests.colors.map((c, i) => (
                                    <span key={i} className="h-5 w-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }} title={c} />
                                ))}
                            </div>
                        )}
                    </div>
                    {bridesmaids && (
                        <div className={`border-t px-1 py-5 ${isDark ? 'border-white/15' : 'border-black/10'}`}>
                            <AttireIllustration color={bridesmaids.dressColor || bridesmaids.color} variant="bridesmaids" className="max-w-sm mb-2" />
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Bridesmaids Attire</p>
                            </div>
                            <h4 className={`mt-2 font-serif text-xl ${isDark ? 'text-white/90' : 'text-[#4A4444]'}`}>{bridesmaids.attire}</h4>
                            {bridesmaids.notes && <p className={`mt-1 text-xs italic ${isDark ? 'text-white/50' : 'text-[#4A4444]/60'}`}>{bridesmaids.notes}</p>}
                            <div className="mt-3 flex items-center gap-2">
                                {(bridesmaids.colors || [bridesmaids.color]).map((c, i) => (
                                    <div key={i} className="flex items-center gap-1.5 rounded-full border border-border/60 bg-white/50 px-2 py-0.5 shadow-sm">
                                        <span className="h-4 w-4 rounded-full border border-white" style={{ backgroundColor: c }} />
                                        <span className="font-mono text-[10px] uppercase text-text-secondary">{c}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    }

    return (
        <section data-wedding-section="AttireSection" id={id} className={`relative z-10 overflow-hidden px-4 py-16 sm:px-6 sm:py-24 ${visual.sectionClass}`} style={visual.sectionStyle}>
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
                    <p className={`mx-auto mt-5 max-w-2xl text-sm leading-7 sm:text-base ${isDark ? 'text-white/65' : 'text-[#4A4444]/70'}`}>
                        We kindly invite you to celebrate with us by dressing in attire that reflects our wedding colors.
                    </p>
                </motion.div>

                {/* Unified color palette strip */}
                <div className="mb-12 flex flex-wrap items-center justify-center gap-4">
                    {allSwatches.map((swatch, index) => (
                        <div key={`${swatch}-${index}`} className="flex flex-col items-center gap-2">
                            <span
                                className="h-12 w-12 rounded-full border-4 border-white shadow-lg transition-transform duration-200 hover:scale-110 sm:h-14 sm:w-14"
                                style={{ backgroundColor: swatch }}
                                aria-label={`Wedding color ${swatch}`}
                            />
                            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-primary">{swatch}</span>
                        </div>
                    ))}
                </div>

                <div className={`grid gap-6 ${bridesmaids ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
                    {/* Principal Sponsors Card */}
                    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`rounded-3xl border border-border/80 bg-white/60 p-6 text-center shadow-sm backdrop-blur-sm sm:p-8 ${isDark ? 'border-white/15 bg-white/10' : ''}`}>
                        <AttireIllustration color={sponsors.dressColor || sponsors.color} suitColor={sponsors.suitColor} variant="sponsors" className="max-w-md" />
                        <p className="mt-4 text-xs font-black uppercase tracking-[0.28em] text-primary">Principal Sponsors</p>
                        <h3 className={`mt-3 font-serif text-2xl sm:text-3xl ${isDark ? 'text-white/90' : 'text-[#4A4444]'}`}>{sponsors.attire}</h3>
                        {sponsors.notes ? (
                            <p className={`mx-auto mt-3 max-w-md text-sm leading-6 ${isDark ? 'text-white/60' : 'text-[#4A4444]/65'}`}>{sponsors.notes}</p>
                        ) : (
                            <p className={`mx-auto mt-3 max-w-md text-sm leading-6 ${isDark ? 'text-white/60' : 'text-[#4A4444]/65'}`}>
                                We invite our principal sponsors to wear elegant formal attire in shades that complement the wedding palette.
                            </p>
                        )}
                        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                            {(sponsors.colors || [sponsors.color]).map((swatch, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-2.5 py-1 shadow-xs">
                                    <span className="h-4 w-4 rounded-full border border-white" style={{ backgroundColor: swatch }} />
                                    <span className="font-mono text-[10px] font-semibold uppercase text-text-secondary">{swatch}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Wedding Guests Card */}
                    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }} className={`rounded-3xl border border-border/80 bg-white/60 p-6 text-center shadow-sm backdrop-blur-sm sm:p-8 ${isDark ? 'border-white/15 bg-white/10' : ''}`}>
                        <AttireIllustration color={guests.dressColor || guests.color} suitColor={guests.suitColor} variant="guests" className="max-w-md" />
                        <p className="mt-4 text-xs font-black uppercase tracking-[0.28em] text-primary">For Guests</p>
                        <h3 className={`mt-3 font-serif text-2xl sm:text-3xl ${isDark ? 'text-white/90' : 'text-[#4A4444]'}`}>{guests.attire}</h3>
                        {guests.notes ? (
                            <p className={`mx-auto mt-3 max-w-md text-sm leading-6 ${isDark ? 'text-white/60' : 'text-[#4A4444]/65'}`}>{guests.notes}</p>
                        ) : (
                            <p className={`mx-auto mt-3 max-w-md text-sm leading-6 ${isDark ? 'text-white/60' : 'text-[#4A4444]/65'}`}>
                                We warmly invite guests to follow the selected dress code and complement our wedding colors.
                            </p>
                        )}
                        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                            {(guests.colors || [guests.color]).map((swatch, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-2.5 py-1 shadow-xs">
                                    <span className="h-4 w-4 rounded-full border border-white" style={{ backgroundColor: swatch }} />
                                    <span className="font-mono text-[10px] font-semibold uppercase text-text-secondary">{swatch}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Bridesmaids Card (Optional) */}
                    {bridesmaids && (
                        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.16 }} className={`rounded-3xl border border-border/80 bg-white/60 p-6 text-center shadow-sm backdrop-blur-sm sm:p-8 ${isDark ? 'border-white/15 bg-white/10' : ''}`}>
                            <AttireIllustration color={bridesmaids.dressColor || bridesmaids.color} variant="bridesmaids" className="max-w-md" />
                            <p className="mt-4 text-xs font-black uppercase tracking-[0.28em] text-primary">Bridesmaids Attire</p>
                            <h3 className={`mt-3 font-serif text-2xl sm:text-3xl ${isDark ? 'text-white/90' : 'text-[#4A4444]'}`}>{bridesmaids.attire}</h3>
                            {bridesmaids.notes && (
                                <p className={`mx-auto mt-3 max-w-md text-sm leading-6 ${isDark ? 'text-white/60' : 'text-[#4A4444]/65'}`}>{bridesmaids.notes}</p>
                            )}
                            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                                {(bridesmaids.colors || [bridesmaids.color]).map((swatch, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-2.5 py-1 shadow-xs">
                                        <span className="h-4 w-4 rounded-full border border-white" style={{ backgroundColor: swatch }} />
                                        <span className="font-mono text-[10px] font-semibold uppercase text-text-secondary">{swatch}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
}
