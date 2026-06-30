'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Music2, Pause, Play, Volume2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface BackgroundMusicPlayerProps {
    audioUrl: string;
    title?: string | null;
    motifColor?: string | null;
}

const START_EVENT = 'quickweds:start-background-music';

export default function BackgroundMusicPlayer({ audioUrl, title, motifColor }: BackgroundMusicPlayerProps) {
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
        setIsPlaying(false);
        setHasInteracted(false);
    }, [audioUrl]);

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
                ref={audioRef}
                src={audioUrl}
                loop
                preload="metadata"
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
                    className="fixed bottom-[calc(1rem+var(--safe-area-inset-bottom))] left-3 z-[70] sm:bottom-8 sm:left-8"
                >
                    <button
                        type="button"
                        onClick={togglePlayback}
                        className="group flex min-h-[48px] max-w-[calc(100vw-1.5rem)] items-center gap-3 rounded-full border border-white/55 bg-white/85 px-3 py-2 text-left shadow-[0_20px_60px_rgba(58,42,45,0.20)] backdrop-blur-xl transition-all hover:bg-white sm:max-w-sm sm:px-4"
                        aria-label={isPlaying ? 'Pause invitation music' : 'Play invitation music'}
                    >
                        <span
                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white shadow-lg transition-transform group-hover:scale-105"
                            style={{ backgroundColor: motifColor || '#D16C78' }}
                        >
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
                        </span>
                        <span className="min-w-0">
                            <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-primary/70">
                                {isPlaying ? <Volume2 className="h-3 w-3" /> : <Music2 className="h-3 w-3" />}
                                Wedding Music
                            </span>
                            <span className="mt-0.5 block max-w-[13rem] truncate text-xs font-bold text-foreground sm:text-sm">
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
