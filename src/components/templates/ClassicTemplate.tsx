'use client';

import { motion, AnimatePresence } from 'framer-motion';

import {
    BioSection,
    CountdownTimer,
    DetailsSection,
    GallerySection,
    GiftSection,
    TimelineSection,
    VideoSection,
} from '@/components/wedding';
import type { TemplateProps } from '@/types/wedding';

import { SharedNewSections } from './shared';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.3,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8 },
    },
};

export default function ClassicTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const motifColor = wedding.motif_color || '#C5A059';
    
    return (
        <>
            <section className="h-screen relative flex items-center justify-center overflow-hidden">
                {wedding.hero_image ? (
                    <img
                        src={wedding.hero_image}
                        className="absolute inset-0 w-full h-full object-cover brightness-75 scale-105"
                        alt="Wedding Hero"
                    />
                ) : (
                    <div 
                        className="absolute inset-0" 
                        style={{ backgroundColor: motifColor + '20' }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="relative text-center text-white z-10 px-4 sm:px-6"
                >
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.span 
                            variants={itemVariants}
                            className="text-xs sm:text-sm uppercase tracking-[0.4em] font-bold mb-6 sm:mb-7 md:mb-8 block opacity-80"
                        >
                            The Wedding of
                        </motion.span>
                        
                        <motion.h1 
                            variants={itemVariants}
                            className="text-3xl sm:text-5xl md:text-7xl lg:text-9xl font-serif mb-8 sm:mb-10 md:mb-12 leading-tight"
                        >
                            {wedding.bride_name} <br />
                            <span 
                                className="text-xl sm:text-3xl md:text-5xl italic font-light serif"
                                style={{ color: motifColor }}
                            >
                                &
                            </span>{' '}
                            <br />
                            {wedding.groom_name}
                        </motion.h1>
                        
                        <motion.div 
                            variants={itemVariants}
                            className="w-12 sm:w-16 md:w-20 h-[1px] mx-auto mb-8 sm:mb-10 md:mb-12"
                            style={{ backgroundColor: motifColor }}
                        />
                        
                        <motion.p 
                            variants={itemVariants}
                            className="text-lg sm:text-xl md:text-2xl font-serif italic tracking-wide"
                        >
                            {new Date(wedding.wedding_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </motion.p>
                    </motion.div>
                </motion.div>
                
                <motion.div 
                    className="absolute bottom-12 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <div className="w-[1px] h-12 opacity-40" style={{ backgroundColor: motifColor }} />
                </motion.div>
            </section>

            <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection id="bio" wedding={wedding} />
            <DetailsSection id="details" wedding={wedding} />
            {!wedding.is_thank_you_mode && (
                <CountdownTimer id="countdown"
                    weddingDate={wedding.wedding_date}
                    weddingTime={wedding.wedding_time}
                    brideName={wedding.bride_name}
                    groomName={wedding.groom_name}
                    venueName={wedding.venue_name}
                    venueAddress={wedding.venue_address}
                    template={wedding.template}
                    motifColor={wedding.motif_color}
                />
            )}
            <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />
            <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </>
    );
}