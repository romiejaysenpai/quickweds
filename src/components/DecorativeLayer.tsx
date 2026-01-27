'use client';

import { motion } from 'framer-motion';

interface DecorativeLayerProps {
    type: 'floral' | 'boho' | 'royal' | 'tropical' | 'sakura' | 'minimal';
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    color: string;
    opacity?: number;
    className?: string;
}

export default function DecorativeLayer({ type, position, color, opacity = 0.2, className = '' }: DecorativeLayerProps) {
    const getSVG = () => {
        switch (type) {
            case 'floral':
                return (
                    <svg viewBox="0 0 200 200" className="w-full h-full" style={{ fill: color }}>
                        <path d="M40,60 C40,40 60,30 80,40 C100,20 120,20 140,40 C160,30 180,40 180,60 C180,100 100,180 100,180 C100,180 20,100 20,60" />
                    </svg>
                );
            case 'boho':
                return (
                    <svg viewBox="0 0 200 200" className="w-full h-full" style={{ fill: color }}>
                        <path d="M100,20 Q120,40 100,60 Q80,40 100,20 M60,60 Q80,80 60,100 Q40,80 60,60 M140,60 Q160,80 140,100 Q120,80 140,60 M100,100 Q120,130 100,160 Q80,130 100,100" />
                    </svg>
                );
            case 'tropical':
                return (
                    <svg viewBox="0 0 200 200" className="w-full h-full" style={{ fill: color }}>
                        <path d="M100,10 C120,50 180,80 190,120 C195,140 170,160 140,160 C120,160 100,140 100,140 C100,140 80,160 60,160 C30,160 5,140 10,120 C20,80 80,50 100,10" />
                    </svg>
                );
            case 'sakura':
                return (
                    <svg viewBox="0 0 200 200" className="w-full h-full" style={{ fill: color }}>
                        <circle cx="100" cy="100" r="20" />
                        <circle cx="100" cy="70" r="25" />
                        <circle cx="130" cy="100" r="25" />
                        <circle cx="100" cy="130" r="25" />
                        <circle cx="70" cy="100" r="25" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const positionClasses = {
        'top-left': 'top-0 left-0 -translate-x-1/4 -translate-y-1/4',
        'top-right': 'top-0 right-0 translate-x-1/4 -translate-y-1/4 rotate-90',
        'bottom-left': 'bottom-0 left-0 -translate-x-1/4 translate-y-1/4 -rotate-90',
        'bottom-right': 'bottom-0 right-0 translate-x-1/4 translate-y-1/4 rotate-180',
        'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity, scale: 1 }}
            viewport={{ once: true }}
            className={`absolute w-64 h-64 pointer-events-none -z-10 ${positionClasses[position]} ${className}`}
        >
            {getSVG()}
        </motion.div>
    );
}
