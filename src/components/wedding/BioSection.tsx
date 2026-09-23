'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import type { Wedding } from '@/types/wedding';
import { useSectionContext } from '@/context/SectionContext';
import { useEffect } from 'react';
import { getSectionTitleStyle, getTemplateVisualProfile } from '@/lib/theme-engine';
import SafeWeddingImage from './SafeWeddingImage';

interface BioSectionProps {
    wedding: Wedding;
    id: string;
}

export default function BioSection({ wedding, id }: BioSectionProps) {
    const { registerSection, unregisterSection } = useSectionContext();
    
    useEffect(() => {
        registerSection(id, 'Bio');
        return () => unregisterSection(id);
    }, [id, registerSection, unregisterSection]);

    const template = wedding.template || 'classic';
    const motifColor = wedding.motif_color || '#D16C78';
    const visual = getTemplateVisualProfile(template, motifColor, false, wedding.card_style);
    const titleStyle = getSectionTitleStyle(wedding, visual.headingClass);
    const { isSharp, isDark, isVintage } = visual;

    const overlapClass = 'py-16 sm:py-24';

    const imageStyle = `aspect-[4/5] ${visual.imageFrameClass} ${isSharp ? 'grayscale hover:grayscale-0' : isVintage ? 'sepia-[0.16]' : ''}`;

    const quoteBoxStyle = 'border-l border-primary/40 pl-6 flex gap-4 items-start';

    const textColorHeading = isDark ? 'text-white' : 'text-[#4A4444]';
    const textColorBody = isDark ? 'text-white/80' : 'text-[#4A4444]/80';

    return (
        <section id={id} className={`relative z-20 overflow-hidden ${overlapClass}`}>
            <div className="absolute inset-0 -z-10 opacity-80" style={visual.sectionStyle} />
            <div className={`${visual.containerClass} grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-20 items-center`}>
                <motion.div 
                    initial={{ opacity: 0, x: -50, rotate: 0 }}
                    whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={isSharp ? { duration: 0.8, ease: "easeOut" } : { duration: 1, type: "spring", bounce: 0.4 }}
                    className="relative px-4 md:px-0"
                >
                    <div className={`overflow-hidden group ${imageStyle}`}>
                        <SafeWeddingImage
                            src={wedding.couple_photo || wedding.hero_image}
                            alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                            fallbackText={wedding.logo_initials || `${wedding.bride_name?.[0] || ''}${wedding.groom_name?.[0] || ''}`}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-1000"
                        />
                    </div>
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="text-center md:text-left relative z-20"
                >
                    <div className="mb-6 flex items-center justify-center md:justify-start">
                        <span className={visual.badgeStyleClass || `text-[10px] md:text-xs uppercase font-bold block drop-shadow-sm ${visual.eyebrowClass}`}>
                            {visual.badgePrefix ? `${visual.badgePrefix}OUR STORY` : 'Our Story'}
                        </span>
                    </div>
                    <h2 className={`text-4xl md:text-6xl mb-6 leading-tight ${titleStyle.className}`} style={titleStyle.style}>Meant to Be</h2>
                    <div className={`mb-8 ${visual.dividerClass}`} />
                    <div className="mb-8 md:mb-10 max-w-prose">
                        <p className={`text-base md:text-lg leading-[1.85] whitespace-pre-line break-words text-left ${textColorBody}`}>
                            {wedding.story || 'They say when you know, you know. For us, every moment since we met has been a beautiful step towards this day.'}
                        </p>
                    </div>
                    <motion.div 
                        className={quoteBoxStyle}
                    >
                        <Quote className="w-5 h-5 text-primary opacity-65 flex-shrink-0" />
                        <p className={`italic font-serif text-base md:text-xl leading-relaxed ${textColorHeading}`}>
                            {wedding.quote || "A successful marriage requires falling in love many times, always with the same person."}
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
