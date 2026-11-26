'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Wedding } from '@/types/wedding';
import { useSectionActions } from '@/context/SectionContext';
import { getSectionTitleStyle, getTemplateVisualProfile } from '@/lib/theme-engine';
import { SectionTemplateElement } from './SectionTemplateElement';
import AttireIllustration from '@/components/AttireIllustration';
import { describeWeddingColor, parseDressCodeValue } from '@/lib/dress-code';

function ColorSwatchStrip({
    colors,
    isDark,
    size = 'md',
}: {
    colors: string[];
    isDark: boolean;
    size?: 'sm' | 'md';
}) {
    const uniqueColors = Array.from(new Set(colors.filter(Boolean)));
    if (uniqueColors.length === 0) return null;

    const shadeNames = Array.from(new Set(uniqueColors.map((hex) => describeWeddingColor(hex))));
    const swatchSize = size === 'sm' ? 'h-7 w-7' : 'h-11 w-11 sm:h-12 sm:w-12';

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center -space-x-2">
                {uniqueColors.map((swatch, idx) => {
                    const shadeName = describeWeddingColor(swatch);
                    return (
                        <span
                            key={`${swatch}-${idx}`}
                            title={shadeName}
                            aria-label={`Wedding color: ${shadeName}`}
                            className={`${swatchSize} rounded-full ring-2 transition-transform duration-300 hover:z-10 hover:scale-110 ${
                                isDark ? 'ring-[#151315] shadow-[0_8px_22px_rgba(0,0,0,0.45)]' : 'ring-white shadow-[0_8px_22px_rgba(58,42,45,0.14)]'
                            }`}
                            style={{
                                backgroundColor: swatch,
                                backgroundImage: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.28), transparent 62%)',
                            }}
                        />
                    );
                })}
            </div>
            <p className={`text-xs font-serif italic tracking-wide ${isDark ? 'text-white/70' : 'text-[#4A4444]/72'}`}>
                {shadeNames.join(' · ')}
            </p>
        </div>
    );
}

export default function AttireSection({ wedding, id = 'attire', embedded = false }: { wedding: Wedding; id?: string; embedded?: boolean }) {
    const { registerSection, unregisterSection } = useSectionActions();

    useEffect(() => {
        registerSection(id, 'Attire');
        return () => unregisterSection(id);
    }, [id, registerSection, unregisterSection]);

    const dressCodes = parseDressCodeValue(wedding.dress_code, wedding.motif_color);
    const { sponsors, guests, bridesmaids } = dressCodes;
    const visual = getTemplateVisualProfile(wedding.template || 'classic', wedding.motif_color || guests.color, false, wedding.card_style);
    const titleStyle = getSectionTitleStyle(wedding, visual.headingClass);
    const isDark = visual.isDark;

    // Collect all swatches across sponsors, guests, and bridesmaids
    const allSwatches = Array.from(new Set([
        ...(sponsors.colors || [sponsors.color]),
        ...(guests.colors || [guests.color]),
        ...(bridesmaids ? (bridesmaids.colors || [bridesmaids.color]) : []),
    ])).filter(Boolean);

    const cardGroups = [
        {
            key: 'sponsors',
            eyebrow: 'Principal Sponsors',
            variant: 'sponsors' as const,
            data: sponsors,
            fallbackNote: 'We invite our principal sponsors to wear elegant formal attire in shades that complement our palette.',
            delay: 0,
        },
        {
            key: 'guests',
            eyebrow: 'For Guests',
            variant: 'guests' as const,
            data: guests,
            fallbackNote: 'We warmly invite guests to dress in our celebration attire and complement our wedding colors.',
            delay: 0.08,
        },
        ...(bridesmaids
            ? [
                  {
                      key: 'bridesmaids',
                      eyebrow: 'Bridesmaids',
                      variant: 'bridesmaids' as const,
                      data: bridesmaids,
                      fallbackNote: '',
                      delay: 0.16,
                  },
              ]
            : []),
    ];

    if (embedded) {
        return (
            <motion.div
                id={id}
                data-wedding-card="true"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                className={`h-full overflow-hidden p-5 sm:p-7 ${visual.cardClass}`}
            >
                <div className="mb-6 text-center">
                    <p className={`mb-2 text-[11px] font-medium uppercase ${visual.eyebrowClass}`}>Dress Code</p>
                    <h3 className={`font-serif text-3xl leading-tight sm:text-4xl ${isDark ? 'text-white/95' : 'text-[#4A4444]'}`}>Wedding Attire</h3>
                    <p className={`mx-auto mt-3 max-w-md text-sm leading-6 ${isDark ? 'text-white/65' : 'text-[#4A4444]/68'}`}>
                        We kindly invite you to celebrate with us in attire that reflects our wedding palette.
                    </p>
                </div>

                <div className="mb-7">
                    <ColorSwatchStrip colors={allSwatches.slice(0, 8)} isDark={isDark} size="sm" />
                </div>

                <div className="grid gap-4">
                    {cardGroups.map((group) => (
                        <div key={group.key} className={`border-t px-1 py-5 text-center ${isDark ? 'border-white/15' : 'border-black/10'}`}>
                            <AttireIllustration
                                color={group.data.dressColor || group.data.color}
                                suitColor={group.data.suitColor}
                                variant={group.variant}
                                className="mx-auto max-w-sm"
                            />
                            <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.24em] text-primary">{group.eyebrow}</p>
                            <h4 className={`mt-1.5 font-serif text-xl ${isDark ? 'text-white/95' : 'text-[#4A4444]'}`}>{group.data.attire}</h4>
                            {group.data.notes && <p className={`mt-1.5 text-xs italic ${isDark ? 'text-white/60' : 'text-[#4A4444]/65'}`}>{group.data.notes}</p>}
                            {group.data.colors && group.data.colors.length > 0 && (
                                <div className="mt-3">
                                    <ColorSwatchStrip colors={group.data.colors} isDark={isDark} size="sm" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>
        );
    }

    return (
        <section
            data-wedding-section="AttireSection"
            id={id}
            className={`relative z-10 overflow-hidden px-4 py-16 sm:px-6 sm:py-24 ${visual.sectionClass}`}
            style={visual.sectionStyle}
        >
            <SectionTemplateElement wedding={wedding} isDark={isDark} placement="corner-top-right" />
            <div className="relative z-10 mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    className="mx-auto mb-10 max-w-3xl text-center sm:mb-12"
                >
                    <div className="mb-4 flex items-center justify-center">
                        <span data-wedding-badge="true" className={visual.badgeStyleClass || `text-[11px] font-medium uppercase ${visual.eyebrowClass}`}>
                            {visual.badgePrefix ? `${visual.badgePrefix}Attire` : 'Dress Code'}
                        </span>
                    </div>
                    <h2 className={`text-4xl sm:text-5xl md:text-6xl ${titleStyle.className}`} style={titleStyle.style}>
                        Wedding Attire
                    </h2>
                    <p className={`mx-auto mt-5 max-w-xl text-sm leading-7 sm:text-base ${isDark ? 'text-white/70' : 'text-[#4A4444]/72'}`}>
                        We kindly invite you to celebrate with us in attire inspired by our wedding palette.
                    </p>
                    <SectionTemplateElement wedding={wedding} isDark={isDark} placement="divider" className="mt-6" />
                </motion.div>

                {/* Unified editorial color palette */}
                <div className="mb-12">
                    <ColorSwatchStrip colors={allSwatches} isDark={isDark} />
                </div>

                <div className={`grid gap-6 ${bridesmaids ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
                    {cardGroups.map((group) => (
                        <motion.div
                            key={group.key}
                            data-wedding-card="true"
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: group.delay }}
                            className={`flex flex-col items-center p-6 text-center sm:p-8 md:p-10 ${visual.cardClass}`}
                        >
                            <AttireIllustration
                                color={group.data.dressColor || group.data.color}
                                suitColor={group.data.suitColor}
                                variant={group.variant}
                                className="max-w-md"
                            />
                            <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.26em] text-primary">
                                {group.eyebrow}
                            </p>
                            <h3 className={`mt-2.5 font-serif text-2xl sm:text-3xl ${isDark ? 'text-white/95' : 'text-[#4A4444]'}`}>
                                {group.data.attire}
                            </h3>
                            {(group.data.notes || group.fallbackNote) && (
                                <p className={`mx-auto mt-3 max-w-md text-sm leading-6 ${isDark ? 'text-white/68' : 'text-[#4A4444]/70'}`}>
                                    {group.data.notes || group.fallbackNote}
                                </p>
                            )}
                            <div className="mt-6 pt-4 border-t border-current/10 w-full flex justify-center">
                                <ColorSwatchStrip colors={group.data.colors || [group.data.color]} isDark={isDark} size="sm" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
