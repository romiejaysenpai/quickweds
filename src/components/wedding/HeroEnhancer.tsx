'use client';

import { motion } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import type { Wedding } from '@/types/wedding';
import { useMemo } from 'react';

export default function HeroEnhancer({ wedding }: { wedding: Wedding }) {
    const particles = useMemo(() => (
        Array.from({ length: 15 }, (_, i) => ({
            id: i,
            top: `${(i * 13 + 9) % 100}%`,
            left: `${(i * 19 + 5) % 100}%`,
            driftX: (i % 5) * 10 - 20,
            peakScale: 0.6 + (i % 4) * 0.2,
            duration: 10 + (i % 6) * 1.5,
            delay: (i % 5) * 0.8,
        }))
    ), []);

    return (
        <div className="absolute top-0 left-0 w-full h-[100dvh] pointer-events-none z-50 overflow-hidden">
            {/* Cinematic Gradient Overlay */}
            <div 
                className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-neutral/90" 
                style={{
                    background: `linear-gradient(to bottom, ${wedding.motif_color}11 0%, transparent 40%, #00000022 100%)`
                }}
            />

            {/* Floating Magical Particles */}
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute"
                    style={{
                        top: particle.top,
                        left: particle.left,
                    }}
                    animate={{
                        y: [0, -200, 0],
                        x: [0, particle.driftX, 0],
                        opacity: [0, 0.6, 0],
                        scale: [0.5, particle.peakScale, 0.5]
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        delay: particle.delay,
                        ease: "easeInOut"
                    }}
                >
                    <Sparkles className="w-3 h-3 md:w-5 md:h-5 text-white/50 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                </motion.div>
            ))}

            {/* Glowing Light Leak at bottom of hero */}
            <motion.div 
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-32 blur-[80px] rounded-[100%]"
                style={{ backgroundColor: `${wedding.motif_color}44` }}
            />

            {/* Animated Scroll Prompt */}
            <motion.div 
                className="absolute bottom-4 sm:bottom-8 lg:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 1 }}
            >
                <span className="rounded-full border border-white/35 bg-black/55 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.4em] text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-md sm:text-xs">Scroll to Explore</span>
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="flex h-12 min-h-[44px] w-8 min-w-[32px] items-start justify-center rounded-full border border-white/70 bg-black/45 p-2 text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-md sm:h-14"
                >
                    <ChevronDown className="h-5 w-4 text-white drop-shadow sm:h-6 sm:w-5" />
                </motion.div>
            </motion.div>
        </div>
    );
}
