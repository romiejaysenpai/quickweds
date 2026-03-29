'use client';

import { motion } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import type { Wedding } from '@/types/wedding';
import { useEffect, useState } from 'react';

export default function HeroEnhancer({ wedding }: { wedding: Wedding }) {
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <div className="absolute top-0 left-0 w-full h-[100vh] pointer-events-none z-50 overflow-hidden mix-blend-screen">
            {/* Cinematic Gradient Overlay */}
            <div 
                className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-neutral/90" 
                style={{
                    background: `linear-gradient(to bottom, ${wedding.motif_color}11 0%, transparent 40%, #00000022 100%)`
                }}
            />

            {/* Floating Magical Particles */}
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -200, 0],
                        x: [0, Math.random() * 40 - 20, 0],
                        opacity: [0, 0.6, 0],
                        scale: [0.5, Math.random() * 1 + 0.5, 0.5]
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        delay: Math.random() * 5,
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
                className="absolute bottom-8 lg:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 1 }}
            >
                <span className="text-[9px] uppercase tracking-[0.4em] text-white/70 font-bold backdrop-blur-sm px-3 py-1 rounded-full bg-black/10">Scroll to Explore</span>
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-8 h-12 rounded-full border border-white/30 flex items-start justify-center p-2 bg-black/10 backdrop-blur-md"
                >
                    <ChevronDown className="w-4 h-4 text-white" />
                </motion.div>
            </motion.div>
        </div>
    );
}
