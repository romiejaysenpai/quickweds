'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import type { Wedding } from '@/types/wedding';
import { useSectionContext } from '@/context/SectionContext';
import { useEffect } from 'react';

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
    
    // Thematic Categorization
    const isSharp = ['editorial', 'vogue', 'urban', 'glitch', 'minimal', 'artdeco', 'luxury', 'timeline'].includes(template);
    const isDark = ['midnight', 'cinematic', 'royal', 'urban', 'glitch', 'film', 'artdeco'].includes(template);
    const isVintage = ['vintage', 'rustic', 'boho', 'film'].includes(template);

    // Apply negative margin to overlap the hero and break the "blocky" rhythm
    const overlapClass = 'md:-mt-24 pb-24';

    const imageStyle = isSharp 
        ? 'aspect-[3/4] rounded-none border-4 md:border-8 border-primary/10 shadow-2xl grayscale hover:grayscale-0'
        : isVintage
            ? 'aspect-[4/5] rounded-lg border-[12px] md:border-[24px] border-[#f4f1e1] shadow-xl sepia-[0.2]'
            : 'aspect-[4/5] rounded-[2rem] md:rounded-[4rem] border-[8px] md:border-[16px] border-white/80 shadow-2xl backdrop-blur-sm';

    const quoteBoxStyle = isSharp
        ? 'p-6 md:p-10 border-l-4 border-primary bg-black/5 md:ml-0 shadow-none flex flex-col md:flex-row gap-6 items-center md:items-start'
        : 'p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-white/70 backdrop-blur-xl border border-white/55 shadow-[0_24px_80px_rgba(58,42,45,0.08)] flex flex-col md:flex-row gap-6 items-center md:items-start';

    const textColorHeading = isDark ? 'text-white' : 'text-[#4A4444]';
    const textColorBody = isDark ? 'text-white/80' : 'text-[#4A4444]/80';

    return (
        <section id={id} className={`max-w-6xl mx-auto px-4 md:px-6 relative z-20 ${overlapClass}`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-20 items-center">
                <motion.div 
                    initial={{ opacity: 0, x: -50, rotate: isSharp ? 0 : -5 }}
                    whileInView={{ opacity: 1, x: 0, rotate: isSharp ? 0 : -2 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={isSharp ? { duration: 0.8, ease: "easeOut" } : { duration: 1, type: "spring", bounce: 0.4 }}
                    className="relative px-4 md:px-0"
                >
                    {!isSharp && <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent blur-3xl -z-10 rounded-full" />}
                    <div className={`overflow-hidden group hover:-rotate-1 transition-transform duration-700 ${imageStyle}`}>
                        <img
                            src={wedding.couple_photo || wedding.hero_image}
                            alt={`${wedding.bride_name} and ${wedding.groom_name}`}
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
                    <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] font-bold text-primary mb-6 block drop-shadow-sm">Our Story</span>
                    <h2 className={`text-4xl md:text-6xl font-serif mb-8 leading-tight ${textColorHeading}`}>Meant to Be</h2>
                    <div className={`mb-10 md:mb-12 rounded-[2rem] border px-4 py-6 sm:px-6 sm:py-7 md:px-8 md:py-9 ${
                        isDark
                            ? 'border-white/10 bg-white/5 backdrop-blur-md'
                            : 'border-white/55 bg-white/55 shadow-[0_18px_60px_rgba(58,42,45,0.08)] backdrop-blur-xl'
                    }`}>
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
