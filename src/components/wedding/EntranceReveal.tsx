'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

interface EntranceRevealProps {
    weddingId: string;
    initials: string;
    motifColor: string;
    coupleNames: string;
    weddingDate: string;
    venueName?: string;
    heroImage?: string;
    template?: string;
}

function formatDateLabel(date: string) {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
        return 'A memorable day awaits';
    }

    return parsedDate.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function EntranceReveal({
    weddingId,
    initials,
    motifColor,
    coupleNames,
    weddingDate,
    venueName,
    heroImage,
    template = 'classic',
}: EntranceRevealProps) {
    const reduceMotion = useReducedMotion();
    const [isVisible, setIsVisible] = useState(false);

    const particles = useMemo(
        () =>
            Array.from({ length: 10 }, (_, index) => ({
                id: index,
                top: `${10 + (index * 9) % 76}%`,
                left: `${8 + (index * 11) % 82}%`,
                delay: index * 0.18,
                duration: 5 + (index % 4),
            })),
        []
    );

    useEffect(() => {
        if (typeof window === 'undefined') return;

        setIsVisible(!window.sessionStorage.getItem(`quickweds_entrance_seen_${weddingId}`));
    }, [weddingId]);

    useEffect(() => {
        if (typeof window === 'undefined' || !isVisible) return;

        const storageKey = `quickweds_entrance_seen_${weddingId}`;

        const timer = window.setTimeout(() => {
            window.sessionStorage.setItem(storageKey, '1');
            setIsVisible(false);
        }, reduceMotion ? 1400 : 3600);

        return () => window.clearTimeout(timer);
    }, [isVisible, reduceMotion, weddingId]);

    const dismissEntrance = () => {
        if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(`quickweds_entrance_seen_${weddingId}`, '1');
        }
        setIsVisible(false);
    };

    // Determine if the template is naturally dark
    const isDarkTheme = ['urban', 'midnight', 'vogue', 'cinematic', 'glitch', 'royal', 'luxury', 'artdeco', 'editorial'].includes(template.toLowerCase());
    
    // Theme colors
    const bgBase = isDarkTheme ? '#120f10' : '#FFF8F4';
    const bgGradient = isDarkTheme 
        ? `radial-gradient(circle at top, ${motifColor}33 0%, transparent 34%), linear-gradient(180deg, rgba(7,7,7,0.28) 0%, rgba(10,10,10,0.74) 45%, rgba(7,7,7,0.96) 100%)`
        : `radial-gradient(circle at top, ${motifColor}22 0%, transparent 34%), linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,248,244,0.8) 45%, rgba(255,248,244,1) 100%)`;
    
    const textColor = isDarkTheme ? 'text-white' : 'text-[#4A4444]';
    const textMuted = isDarkTheme ? 'text-white/65' : 'text-[#4A4444]/65';
    const borderMuted = isDarkTheme ? 'border-white/18' : 'border-[#4A4444]/15';
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0.35 : 0.8, ease: 'easeInOut' }}
                    className="fixed inset-0 z-[9999] overflow-hidden"
                    onClick={dismissEntrance}
                >
                    <div className="absolute inset-0" style={{ backgroundColor: bgBase }} />

                    {heroImage ? (
                        <motion.div
                            className="absolute inset-0 opacity-30"
                            initial={{ scale: 1.08, filter: 'blur(14px)' }}
                            animate={{ scale: 1, filter: 'blur(0px)' }}
                            transition={{ duration: reduceMotion ? 0.5 : 2.4, ease: 'easeOut' }}
                        >
                            <Image
                                src={heroImage}
                                alt={`${coupleNames} invitation cover`}
                                fill
                                priority
                                sizes="100vw"
                                className="object-cover"
                            />
                        </motion.div>
                    ) : null}

                    <div
                        className="absolute inset-0"
                        style={{ background: bgGradient }}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(150,150,150,0.03)_1px,transparent_1px),linear-gradient(rgba(150,150,150,0.03)_1px,transparent_1px)] bg-[size:42px_42px] opacity-25" />

                    {!reduceMotion &&
                        particles.map((particle) => (
                            <motion.div
                                key={particle.id}
                                className="absolute"
                                style={{ top: particle.top, left: particle.left }}
                                animate={{
                                    y: [0, -22, 0],
                                    opacity: [0.15, 0.55, 0.15],
                                    scale: [0.8, 1.15, 0.8],
                                }}
                                transition={{
                                    duration: particle.duration,
                                    repeat: Infinity,
                                    delay: particle.delay,
                                    ease: 'easeInOut',
                                }}
                            >
                                <Sparkles className={`h-3.5 w-3.5 ${isDarkTheme ? 'text-white/45' : 'text-foreground/20'}`} />
                            </motion.div>
                        ))}

                    <motion.div
                        initial={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ duration: reduceMotion ? 0.35 : 0.85, ease: [0.76, 0, 0.24, 1] }}
                        className="absolute inset-y-0 left-0 w-1/2 border-r border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] backdrop-blur-[2px]"
                    />
                    <motion.div
                        initial={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ duration: reduceMotion ? 0.35 : 0.85, ease: [0.76, 0, 0.24, 1] }}
                        className="absolute inset-y-0 right-0 w-1/2 border-l border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] backdrop-blur-[2px]"
                    />

                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            dismissEntrance();
                        }}
                        className={`absolute right-5 top-5 z-20 rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em] backdrop-blur-md transition-colors 
                            ${isDarkTheme 
                                ? 'border-white/15 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white' 
                                : 'border-black/10 bg-black/5 text-black/60 hover:bg-black/10 hover:text-black'}`}
                    >
                        Skip
                    </button>

                    <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
                        <motion.div
                            initial={{ opacity: 0, y: 32, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -22, scale: 0.98 }}
                            transition={{ duration: reduceMotion ? 0.3 : 1, ease: 'easeOut' }}
                            className="w-full max-w-2xl"
                        >
                            <div className={`rounded-[2.4rem] border p-6 shadow-2xl backdrop-blur-2xl sm:p-10 ${isDarkTheme ? 'border-white/18 bg-white/[0.08]' : 'border-black/5 bg-white/40'}`}>
                                <div className={`rounded-[2rem] border px-6 py-10 text-center sm:px-10 sm:py-14 ${isDarkTheme ? 'border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03))]' : 'border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(255,255,255,0.4))]'}`}>
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15, duration: 0.6 }}
                                        className={`text-[10px] font-bold uppercase tracking-[0.45em] ${textMuted}`}
                                    >
                                        Wedding Invitation
                                    </motion.p>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.86 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.28, duration: reduceMotion ? 0.25 : 0.75 }}
                                        className="relative mx-auto mt-8 flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32"
                                    >
                                        <motion.div
                                            animate={reduceMotion ? undefined : { rotate: 360 }}
                                            transition={reduceMotion ? undefined : { duration: 18, repeat: Infinity, ease: 'linear' }}
                                            className={`absolute inset-0 rounded-full border ${borderMuted}`}
                                        />
                                        <motion.div
                                            animate={reduceMotion ? undefined : { rotate: -360 }}
                                            transition={reduceMotion ? undefined : { duration: 24, repeat: Infinity, ease: 'linear' }}
                                            className="absolute inset-[8px] rounded-full border border-dashed"
                                            style={{ borderColor: `${motifColor}90` }}
                                        />
                                        <div
                                            className="absolute inset-[18px] rounded-full border"
                                            style={{ borderColor: `${motifColor}40`, backgroundColor: `${motifColor}12` }}
                                        />
                                        <span
                                            className="relative text-4xl font-serif uppercase tracking-[0.18em] sm:text-5xl"
                                            style={{ color: motifColor }}
                                        >
                                            {initials}
                                        </span>
                                    </motion.div>

                                    <motion.h1
                                        initial={{ opacity: 0, y: 14 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.48, duration: 0.7 }}
                                        className={`mt-8 text-4xl font-serif leading-tight sm:text-6xl break-words ${textColor}`}
                                    >
                                        {coupleNames}
                                    </motion.h1>

                                    <motion.div
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: 132, opacity: 1 }}
                                        transition={{ delay: 0.68, duration: 0.75 }}
                                        className="mx-auto mt-6 h-px"
                                        style={{
                                            background: `linear-gradient(90deg, transparent 0%, ${motifColor} 48%, transparent 100%)`,
                                        }}
                                    />

                                    <motion.p
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.82, duration: 0.65 }}
                                        className={`mt-6 text-sm uppercase tracking-[0.35em] sm:text-[13px] break-words ${textMuted}`}
                                    >
                                        {formatDateLabel(weddingDate)}
                                    </motion.p>

                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1, duration: 0.65 }}
                                        className={`mx-auto mt-4 max-w-lg text-sm leading-relaxed sm:text-base break-words ${isDarkTheme ? 'text-white/58' : 'text-[#4A4444]/70'}`}
                                    >
                                        {venueName || 'A beautifully crafted celebration is about to unfold.'}
                                    </motion.p>

                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1.2, duration: 0.6 }}
                                        className={`mt-10 flex items-center justify-center gap-3 ${isDarkTheme ? 'text-white/58' : 'text-[#4A4444]/50'}`}
                                    >
                                        <div className={`h-px w-10 ${isDarkTheme ? 'bg-white/16' : 'bg-black/10'}`} />
                                        <Heart className="h-3.5 w-3.5 fill-current" style={{ color: motifColor }} />
                                        <div className={`h-px w-10 ${isDarkTheme ? 'bg-white/16' : 'bg-black/10'}`} />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1.34, duration: 0.6 }}
                                        className="mt-8"
                                    >
                                        <div className={`mx-auto h-[3px] w-full max-w-[240px] overflow-hidden rounded-full ${isDarkTheme ? 'bg-white/10' : 'bg-black/5'}`}>
                                            <motion.div
                                                initial={{ width: '0%' }}
                                                animate={{ width: '100%' }}
                                                transition={{ duration: reduceMotion ? 0.9 : 2.4, ease: 'easeInOut' }}
                                                className="h-full rounded-full"
                                                style={{
                                                    background: `linear-gradient(90deg, ${motifColor}99 0%, ${motifColor} 55%, ${isDarkTheme ? '#ffffff' : motifColor} 100%)`,
                                                }}
                                            />
                                        </div>
                                        <p className={`mt-4 mb-2 text-[10px] font-bold uppercase tracking-[0.34em] ${isDarkTheme ? 'text-white/40' : 'text-black/30'}`}>
                                            Loading complete
                                        </p>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); dismissEntrance(); }}
                                            className={`mt-4 px-8 py-3 rounded-full border text-xs font-bold uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-xl backdrop-blur-md
                                                ${isDarkTheme 
                                                    ? 'border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/40' 
                                                    : 'border-black/10 bg-black/5 text-black hover:bg-black/10 hover:border-black/30'
                                                }`}
                                            style={{
                                                boxShadow: `0 8px 32px -8px ${motifColor}60`
                                            }}
                                        >
                                            Tap to Open
                                        </button>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
