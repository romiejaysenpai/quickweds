'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Music2, Pause, Play, Volume2 } from 'lucide-react';
import { getTemplateVisualProfile } from '@/lib/theme-engine';
import { useCallback, useEffect, useRef, useState } from 'react';

interface BackgroundMusicPlayerProps {
    template?: string;
    audioUrl: string;
    title?: string | null;
    motifColor?: string | null;
}

const START_EVENT = 'quickweds:start-background-music';

export default function BackgroundMusicPlayer({ audioUrl, title, motifColor, template }: BackgroundMusicPlayerProps) {
    const visual = getTemplateVisualProfile(template, motifColor || undefined);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    const playAudio = useCallback(async () => {
        const audio = audioRef.current;
        if (!audio) return;

        setHasInteracted(true);

        try {
            await audio.play();
            setIsPlaying(true);
        } catch {
            setIsPlaying(false);
        }
    }, []);

    const pauseAudio = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.pause();
        setIsPlaying(false);
    }, []);

    const togglePlayback = () => {
        if (isPlaying) {
            pauseAudio();
            return;
        }

        void playAudio();
    };

    useEffect(() => {
        const handleStart = () => {
            void playAudio();
        };

        const handleFirstInteraction = () => {
            if (!hasInteracted) {
                void playAudio();
            }
        };

        window.addEventListener(START_EVENT, handleStart);
        window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
        window.addEventListener('keydown', handleFirstInteraction, { once: true });

        return () => {
            window.removeEventListener(START_EVENT, handleStart);
            window.removeEventListener('pointerdown', handleFirstInteraction);
            window.removeEventListener('keydown', handleFirstInteraction);
        };
    }, [hasInteracted, playAudio]);

    if (!audioUrl) return null;

    return (
        <>
            <audio
                key={audioUrl}
                ref={audioRef}
                src={audioUrl}
                loop
                preload="metadata"
                onLoadStart={() => {
                    setIsReady(false);
                    setIsPlaying(false);
                    setHasInteracted(false);
                }}
                onCanPlay={() => setIsReady(true)}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
            />

            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.96 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="fixed right-3 top-[calc(1rem+var(--safe-area-inset-top))] z-[70] sm:right-6 sm:top-6"
                >
                    <button
                        type="button"
                        onClick={togglePlayback}
                        className={`group flex min-h-12 items-center gap-3 rounded-full border p-1 text-left shadow-sm sm:px-3 sm:py-2 ${visual.isDark ? 'border-white/20 bg-[#18181b] text-white' : 'border-black/15 bg-[#FFFCF7] text-[#352C2C]'}`}
                        aria-label={isPlaying ? 'Pause invitation music' : 'Play invitation music'}
                    >
                        <span
                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white shadow-lg transition-transform group-hover:scale-105"
                            style={{ backgroundColor: motifColor || '#D16C78' }}
                        >
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
                        </span>
                        <span className="hidden min-w-0 sm:block">
                            <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-primary/70">
                                {isPlaying ? <Volume2 className="h-3 w-3" /> : <Music2 className="h-3 w-3" />}
                                Wedding Music
                            </span>
                            <span className="mt-0.5 block max-w-[13rem] truncate text-xs font-medium sm:text-sm">
                                {title?.trim() || (isReady ? 'Tap to play our song' : 'Loading song...')}
                            </span>
                        </span>
                        {isPlaying && (
                            <span className="ml-1 hidden h-5 items-end gap-0.5 sm:flex" aria-hidden="true">
                                {[0, 1, 2, 3].map((index) => (
                                    <motion.span
                                        key={index}
                                        animate={{ height: [5, 16, 8, 14, 5] }}
                                        transition={{ duration: 0.9, repeat: Infinity, delay: index * 0.12 }}
                                        className="w-1 rounded-full"
                                        style={{ backgroundColor: motifColor || '#D16C78' }}
                                    />
                                ))}
                            </span>
                        )}
                    </button>
                </motion.div>
            </AnimatePresence>
        </>
    );
}
