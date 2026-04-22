'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface ScrollRevealProps {
    children: React.ReactNode;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    delay?: number;
    duration?: number;
    once?: boolean;
    className?: string;
}

export default function ScrollReveal({
    children,
    direction = 'up',
    delay = 0,
    duration = 0.6,
    once = true,
    className = '',
}: ScrollRevealProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, margin: '-100px' });

    const getHidden = () => ({
        opacity: 0,
        y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
        x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
    });

    return (
        <motion.div
            ref={ref}
            initial={getHidden()}
            animate={isInView ? { opacity: 1, y: 0, x: 0 } : getHidden()}
            transition={{ delay, duration, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
}