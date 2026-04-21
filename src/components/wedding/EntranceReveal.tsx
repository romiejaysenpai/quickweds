'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';

interface EntranceRevealProps {
    initials: string;
    motifColor: string;
    font?: string;
}

export default function EntranceReveal({ initials, motifColor, font = 'serif' }: EntranceRevealProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(false), 2500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] bg-neutral flex flex-col items-center justify-center"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="relative flex flex-col items-center"
                    >
                        {/* Elegant SVG Monogram Drawing Effect */}
                        <svg width="200" height="200" viewBox="0 0 200 200" className="mb-8">
                            <motion.circle
                                cx="100"
                                cy="100"
                                r="80"
                                fill="none"
                                stroke={motifColor}
                                strokeWidth="2"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.3 }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                            />
                            <motion.path
                                d="M60 100 Q100 40 140 100 Q100 160 60 100"
                                fill="none"
                                stroke={motifColor}
                                strokeWidth="1"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2.5, ease: "easeInOut", delay: 0.5 }}
                            />
                        </svg>

                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1, duration: 0.8 }}
                            className="text-5xl md:text-7xl font-serif text-foreground uppercase tracking-[0.2em]"
                            style={{ color: motifColor, fontFamily: `var(--font-${font})` }}
                        >
                            {initials}
                        </motion.h1>

                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: 100 }}
                            transition={{ delay: 1.5, duration: 1 }}
                            className="h-[1px] bg-foreground/20 mt-6"
                            style={{ backgroundColor: motifColor + '40' }}
                        />
                    </motion.div>

                    <motion.div
                        className="absolute bottom-12 flex flex-col items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 }}
                    >
                        <Heart className="w-4 h-4 text-primary animate-pulse" />
                        <p className="text-[10px] uppercase tracking-widest font-bold opacity-30 text-foreground">Established 2026</p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
