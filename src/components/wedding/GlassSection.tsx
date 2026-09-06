'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassSectionProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    intensity?: 'light' | 'medium' | 'strong';
}

export default function GlassSection({ children, className = "", delay = 0, intensity = 'medium' }: GlassSectionProps) {
    const blurMap = {
        light: 'backdrop-blur-sm bg-white/30',
        medium: 'backdrop-blur-md bg-white/50',
        strong: 'backdrop-blur-xl bg-white/70'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay, ease: "easeOut" }}
            className={`
                ${blurMap[intensity]} 
                border border-white/40 
                rounded-[2rem] md:rounded-[3rem] 
                shadow-xl shadow-primary/5
                overflow-hidden
                ${className}
            `}
        >
            {children}
        </motion.div>
    );
}
