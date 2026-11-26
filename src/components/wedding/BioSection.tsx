'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import type { Wedding } from '@/types/wedding';
import { useSectionActions } from '@/context/SectionContext';
import { useEffect } from 'react';
import { getSectionTitleStyle, getTemplateVisualProfile } from '@/lib/theme-engine';
import SafeWeddingImage from './SafeWeddingImage';
import { SectionTemplateElement } from './SectionTemplateElement';

interface BioSectionProps {
    wedding: Wedding;
    id: string;
    hideStory?: boolean;
    hideQuote?: boolean;
}

function getStoryHeading(mood: string) {
    if (mood === 'dark' || mood === 'cinematic' || mood === 'celestial') return 'The Story of Us';
    if (mood === 'organic' || mood === 'vintage' || mood === 'playful' || mood === 'romantic') return 'How It Began';
    return 'Our Story';
}

export default function BioSection({ wedding, id, hideStory = false, hideQuote = false }: BioSectionProps) {
    const { registerSection, unregisterSection } = useSectionActions();

    useEffect(() => {
        registerSection(id, 'Bio');
        return () => unregisterSection(id);
    }, [id, registerSection, unregisterSection]);

    const template = wedding.template || 'classic';
    const motifColor = wedding.motif_color || '#D16C78';
    const visual = getTemplateVisualProfile(template, motifColor, false, wedding.card_style);
    const titleStyle = getSectionTitleStyle(wedding, visual.headingClass);
    const { isSharp, isDark, isVintage } = visual;

    const primaryPhoto = wedding.couple_photo?.trim() || wedding.hero_image?.trim() || '';
    const secondaryInsetPhoto =
        wedding.couple_photo?.trim() &&
        wedding.hero_image?.trim() &&
        wedding.couple_photo.trim() !== wedding.hero_image.trim()
            ? wedding.hero_image.trim()
            : '';

    const storyText =
        wedding.story?.trim() ||
        'They say when you know, you know. For us, every moment since we met has been a quiet step toward this day.';
    const useDropCap = storyText.length > 90;

    const imageStyle = `aspect-[4/5] ${visual.imageFrameClass} ${isVintage ? 'sepia-[0.12]' : ''}`;
    const textColorHeading = isDark ? 'text-white' : 'text-[#352C2C]';
    const textColorBody = isDark ? 'text-white/80' : 'text-[#4A4444]/82';

    return (
        <section
            data-wedding-section="BioSection"
            id={id}
            className={`relative z-20 overflow-hidden py-16 sm:py-24 md:py-28 ${visual.sectionClass}`}
            style={visual.sectionStyle}
        >
            <div className={`${visual.containerClass} grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16`}>
                {/* Editorial Portrait / Overlapping Collage */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className={`relative px-2 md:px-0 lg:col-span-6 ${secondaryInsetPhoto ? 'pb-10 sm:pb-12' : ''}`}
                >
                    <div className={`group relative overflow-hidden ${imageStyle}`}>
                        <SectionTemplateElement wedding={wedding} isDark={isDark} placement="corner-bottom-left" className="z-10 sm:h-24 sm:w-24" />
                        <SafeWeddingImage
                            src={primaryPhoto}
                            alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                            fallbackText={wedding.logo_initials || `${wedding.bride_name?.[0] || ''}${wedding.groom_name?.[0] || ''}`}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover object-[50%_25%] transition-transform duration-1000 group-hover:scale-[1.03]"
                        />
                    </div>

                    {secondaryInsetPhoto && (
                        <div
                            className={`absolute -bottom-2 right-0 z-20 w-32 overflow-hidden border-4 shadow-xl sm:right-2 sm:w-44 ${
                                isSharp ? 'rounded-none' : 'rounded-2xl'
                            } ${isDark ? 'border-[#151315]' : 'border-white'}`}
                        >
                            <div className="aspect-[4/5] w-full">
                                <SafeWeddingImage
                                    src={secondaryInsetPhoto}
                                    alt={`${wedding.bride_name} and ${wedding.groom_name} keepsake`}
                                    loading="lazy"
                                    decoding="async"
                                    className="h-full w-full object-cover object-[50%_25%]"
                                />
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Story Narrative */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-20 text-center md:text-left lg:col-span-6"
                >
                    <SectionTemplateElement wedding={wedding} isDark={isDark} placement="header-crest" className="mb-4 md:mx-0" />
                    <div className="mb-5 flex items-center justify-center md:justify-start">
                        <span
                            data-wedding-badge="true"
                            className={visual.badgeStyleClass || `text-[11px] uppercase font-medium block ${visual.eyebrowClass}`}
                        >
                            {visual.badgePrefix ? `${visual.badgePrefix}Our Story` : 'Our Story'}
                        </span>
                    </div>
                    <h2 className={`mb-6 text-4xl leading-tight md:text-5xl lg:text-6xl ${titleStyle.className}`} style={titleStyle.style}>
                        {getStoryHeading(visual.mood)}
                    </h2>
                    <div data-wedding-divider="true" className={`mx-auto mb-8 md:mx-0 ${visual.dividerClass}`} />
                    {!hideStory && (
                        <div className="mb-8 max-w-prose md:mb-10">
                            <p
                                className={`whitespace-pre-line break-words text-left text-base leading-[1.9] md:text-lg ${textColorBody} ${
                                    useDropCap
                                        ? 'first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-serif first-letter:text-5xl first-letter:leading-[0.82] first-letter:text-primary'
                                        : ''
                                }`}
                            >
                                {storyText}
                            </p>
                        </div>
                    )}
                    {!hideQuote && (
                        <div className="flex items-start gap-4 border-l border-primary/40 pl-6 text-left">
                            <Quote className="mt-1 h-4 w-4 shrink-0 text-primary opacity-65" aria-hidden="true" />
                            <p className={`font-serif text-base italic leading-relaxed md:text-xl ${textColorHeading}`}>
                                {wedding.quote || 'A successful marriage requires falling in love many times, always with the same person.'}
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
