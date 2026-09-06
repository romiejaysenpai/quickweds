'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface VoiceGreetingProps {
    audioUrl: string;
    motifColor: string;
}

export default function VoiceGreeting({ audioUrl, motifColor }: VoiceGreetingProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Show after a brief delay
        const timer = setTimeout(() => setIsVisible(true), 3500);
        return () => clearTimeout(timer);
    }, []);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    if (!audioUrl) return null;

    return (
        <>
            <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
            
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="fixed bottom-[calc(5.75rem+var(--safe-area-inset-bottom))] right-3 z-[60] sm:bottom-32 sm:right-10"
                    >
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={togglePlay}
                            className={`
                                flex min-h-[44px] items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-4 
                                rounded-full bg-white border border-border/50 
                                shadow-2xl soft-shadow transition-all group
                            `}
                        >
                            <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors"
                                style={{ color: motifColor, backgroundColor: isPlaying ? motifColor : undefined }}
                            >
                                {isPlaying ? (
                                    <Pause className={`w-5 h-5 ${isPlaying ? 'text-white' : ''}`} />
                                ) : (
                                    <Play className="w-5 h-5 ml-1" />
                                )}
                            </div>
                            
                            <div className="hidden text-left sm:block">
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60">A Message From</p>
                                <p className="text-sm font-serif font-bold text-foreground">Bride & Groom</p>
                            </div>

                            {/* Audio Wave Visualizer (Fake but elegant) */}
                            {isPlaying && (
                                <div className="flex items-end gap-1 h-3 ml-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ height: [4, 12, 6, 12, 4] }}
                                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                                            className="w-[2px] bg-primary rounded-full"
                                            style={{ backgroundColor: motifColor }}
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
