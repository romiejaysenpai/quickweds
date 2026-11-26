'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { getTemplateVisualProfile } from '@/lib/theme-engine';

interface VoiceGreetingProps {
    audioUrl: string;
    motifColor: string;
    coupleNames?: string;
    template?: string;
}

export default function VoiceGreeting({ audioUrl, motifColor, coupleNames, template }: VoiceGreetingProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [hasError, setHasError] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const prefersReducedMotion = useReducedMotion();
    const visual = getTemplateVisualProfile(template || 'classic', motifColor || '#D16C78');
    const displayLabel = coupleNames?.trim() || 'The Couple';

    useEffect(() => {
        // Show after a brief delay
        const timer = setTimeout(() => setIsVisible(true), 2400);
        return () => clearTimeout(timer);
    }, []);

    const togglePlay = async () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
            return;
        }

        try {
            setHasError(false);
            await audioRef.current.play();
            setIsPlaying(true);
        } catch {
            setIsPlaying(false);
            setHasError(true);
        }
    };

    if (!audioUrl) return null;

    return (
        <>
            <audio
                ref={audioRef}
                src={audioUrl}
                preload="metadata"
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                onError={() => {
                    setIsPlaying(false);
                    setHasError(true);
                }}
            />

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        data-wedding-media-control="true"
                        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 32 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 32 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="fixed bottom-[calc(5.75rem+var(--safe-area-inset-bottom))] right-3 z-[60] sm:bottom-24 sm:right-6"
                    >
                        <motion.button
                            type="button"
                            data-wedding-control="media"
                            whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
                            whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                            onClick={togglePlay}
                            aria-label={isPlaying ? `Pause voice greeting from ${displayLabel}` : `Play voice greeting from ${displayLabel}`}
                            className={`group flex min-h-[48px] items-center gap-2.5 rounded-full border p-1.5 pr-2 sm:gap-3 sm:px-3.5 sm:py-2 shadow-lg backdrop-blur-md transition-all ${
                                visual.isDark
                                    ? 'border-white/20 bg-[#18181b]/95 text-white'
                                    : 'border-black/15 bg-[#FFFCF7]/95 text-[#352C2C]'
                            }`}
                        >
                            <div
                                data-wedding-overlay="true"
                                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white shadow-md transition-transform group-hover:scale-105"
                                style={{ backgroundColor: motifColor || '#D16C78' }}
                            >
                                {isPlaying ? (
                                    <Pause className="h-4 w-4" aria-hidden="true" />
                                ) : (
                                    <Play className="ml-0.5 h-4 w-4" aria-hidden="true" />
                                )}
                            </div>

                            <div className="hidden min-w-0 text-left sm:block">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] opacity-65">
                                    {hasError ? 'Audio Unavailable' : 'A Note From'}
                                </p>
                                <p className="max-w-[11rem] truncate font-serif text-sm font-medium">{displayLabel}</p>
                            </div>

                            {isPlaying && !prefersReducedMotion && (
                                <div className="ml-1 flex h-4 items-end gap-0.5" aria-hidden="true">
                                    {[1, 2, 3, 4].map((i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ height: [4, 13, 6, 12, 4] }}
                                            transition={{ duration: 0.85, repeat: Infinity, delay: i * 0.12 }}
                                            className="w-[2px] rounded-full"
                                            style={{ backgroundColor: motifColor || '#D16C78' }}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
