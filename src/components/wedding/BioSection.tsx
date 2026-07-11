'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import type { Wedding } from '@/types/wedding';
import { useSectionContext } from '@/context/SectionContext';
import { useEffect } from 'react';
import { getTemplateVisualProfile } from '@/lib/theme-engine';
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
    const visual = getTemplateVisualProfile(template, motifColor);
    const { isSharp, isDark, isVintage } = visual;

    // Apply negative margin to overlap the hero and break the "blocky" rhythm
    const overlapClass = 'md:-mt-24 pb-24';

    const imageStyle = `aspect-[4/5] ${visual.imageFrameClass} ${isSharp ? 'grayscale hover:grayscale-0' : isVintage ? 'sepia-[0.16]' : ''}`;

    const quoteBoxStyle = isSharp
        ? `p-6 md:p-10 border-l-4 border-primary md:ml-0 flex flex-col md:flex-row gap-6 items-center md:items-start ${visual.cardClass}`
        : `p-6 md:p-10 flex flex-col md:flex-row gap-6 items-center md:items-start ${visual.accentCardClass}`;

    const textColorHeading = isDark ? 'text-white' : 'text-[#4A4444]';
    const textColorBody = isDark ? 'text-white/80' : 'text-[#4A4444]/80';

    return (
        <section id={id} className={`relative z-20 overflow-hidden ${overlapClass}`}>
            <div className="absolute inset-0 -z-10 opacity-80" style={visual.sectionStyle} />
            {visual.ornament !== 'none' && (
                <div className="pointer-events-none absolute right-0 top-8 -z-10 text-[18vw] font-black uppercase leading-none opacity-[0.025]">
                    {visual.ornament === 'editorial' ? 'STORY' : visual.ornament === 'film' ? 'FRAME' : visual.ornament === 'royal' ? 'VOWS' : 'LOVE'}
                </div>
            )}
            <div className={`${visual.containerClass} grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-20 items-center`}>
                <motion.div 
                    initial={{ opacity: 0, x: -50, rotate: isSharp ? 0 : -5 }}
                    whileInView={{ opacity: 1, x: 0, rotate: isSharp ? 0 : -2 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={isSharp ? { duration: 0.8, ease: "easeOut" } : { duration: 1, type: "spring", bounce: 0.4 }}
                    className="relative px-4 md:px-0"
                >
                    {!isSharp && <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent blur-3xl -z-10 rounded-full" />}
                    <div className={`overflow-hidden group hover:-rotate-1 transition-transform duration-700 ${imageStyle}`}>
                        <SafeWeddingImage
                            src={wedding.couple_photo || wedding.hero_image}
                            alt={`${wedding.bride_name} and ${wedding.groom_name}`}
                            fallbackText={wedding.logo_initials || `${wedding.bride_name?.[0] || ''}${wedding.groom_name?.[0] || ''}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
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
                    <span className={`text-[10px] md:text-xs uppercase font-bold mb-6 block drop-shadow-sm ${visual.eyebrowClass}`}>Our Story</span>
                    <h2 className={`text-4xl md:text-6xl mb-8 leading-tight ${visual.headingClass}`}>Meant to Be</h2>
                    <div className={`mb-10 md:mb-12 px-4 py-6 sm:px-6 sm:py-7 md:px-8 md:py-9 ${visual.cardClass}`}>
                        <p className={`text-lg md:text-xl leading-relaxed font-serif italic break-words text-center md:text-left ${textColorBody}`}>
                            {wedding.story || 'They say when you know, you know. For us, every moment since we met has been a beautiful step towards this day.'}
                        </p>
                    </div>
                    <motion.div 
                        whileHover={isSharp ? { x: 10 } : { scale: 1.02 }}
                        className={quoteBoxStyle}
                    >
                        <Quote className="w-10 h-10 md:w-12 md:h-12 text-primary opacity-30 flex-shrink-0" />
                        <p className={`italic font-serif text-base md:text-xl leading-relaxed ${textColorHeading}`}>
                            {wedding.quote || "A successful marriage requires falling in love many times, always with the same person."}
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
