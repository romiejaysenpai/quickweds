'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Wand2, Stars, Cloud, Music, Camera } from 'lucide-react';

const MESSAGES = [
    "Curating your unique style...",
    "Sculpting the layout with elegance...",
    "Polishing the digital invitation...",
    "Syncing your special details...",
    "Almost ready to show the world...",
    "Adding a touch of magic...",
    "Preparing for your guests...",
    "Finalizing your love story's digital home..."
];

export default function GenerationLoading() {
    const [messageIndex, setMessageIndex] = useState(0);
    const ornaments = useMemo(() => (
        Array.from({ length: 6 }, (_, i) => ({
            id: i,
            top: `${(i * 29 + 13) % 100}%`,
            left: `${(i * 31 + 17) % 100}%`,
            driftX: (i % 4) * 12 - 18,
            duration: 8 + (i % 5) * 2,
        }))
    ), []);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-neutral/95 backdrop-blur-xl overflow-hidden"
        >
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                {ornaments.map((ornament) => (
                    <motion.div
                        key={ornament.id}
                        className="absolute text-primary/10"
                        style={{
                            top: ornament.top,
                            left: ornament.left,
                        }}
                        animate={{
                            y: [0, -50, 0],
                            x: [0, ornament.driftX, 0],
                            rotate: [0, 360],
                            scale: [1, 1.5, 1],
                            opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{
                            duration: ornament.duration,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        {ornament.id % 3 === 0 ? <Heart className="w-24 h-24 fill-current" /> :
                            ornament.id % 3 === 1 ? <Sparkles className="w-16 h-16" /> :
                                <Stars className="w-20 h-20" />}
                    </motion.div>
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Animated Rings */}
                <div className="relative mb-16">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 w-64 h-64 border-2 border-primary/20 rounded-full"
                    />
                    <motion.div
                        animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                        className="absolute inset-x-[-10px] inset-y-[-10px] w-[280px] h-[280px] border border-primary/10 rounded-full"
                    />

                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="w-64 h-64 border-t-4 border-l-2 border-primary rounded-full flex items-center justify-center"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Heart className="w-20 h-20 text-primary fill-primary/20" />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Messaging */}
                <div className="text-center h-20 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={messageIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-4"
                        >
                            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                                {MESSAGES[messageIndex]}
                            </h2>
                            <div className="flex gap-2 justify-center">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                        className="w-1.5 h-1.5 bg-primary rounded-full"
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
