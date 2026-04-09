'use client';

import { motion } from 'framer-motion';

export type AccentType = 'none' | 'eucalyptus' | 'pampas' | 'ribbon' | 'monstera' | 'sakura' | 'gold-arch';

interface DecorativeLayerProps {
    type: AccentType | string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'top-edge' | 'bottom-edge';
    color: string;
    opacity?: number;
    className?: string;
}

export default function DecorativeLayer({ type, position, color, opacity = 1, className = '' }: DecorativeLayerProps) {
    if (type === 'none' || !type) return null;

    const getSVG = () => {
        switch (type) {
            case 'eucalyptus': // Botanical / Eucalyptus Foliage
                return (
                    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl" stroke="currentColor" fill="none">
                        <path d="M100 200 Q 110 100 80 20" stroke={color} strokeWidth="2" fill="none"/>
                        <path d="M98 160 Q 130 150 140 120 Q 110 120 95 150" fill={color} opacity="0.6" stroke="none"/>
                        <path d="M100 130 Q 70 120 60 90 Q 90 90 102 120" fill={color} opacity="0.8" stroke="none"/>
                        <path d="M102 100 Q 140 90 150 50 Q 110 60 95 90" fill={color} opacity="0.7" stroke="none"/>
                        <path d="M95 70 Q 60 70 50 30 Q 90 40 98 60" fill={color} opacity="0.9" stroke="none"/>
                    </svg>
                );
            case 'pampas': // Boho / Pampas Grass
                return (
                    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg">
                        <path d="M100 200 Q 95 100 100 0 M100 150 Q 130 120 160 90 M100 140 Q 70 110 40 80 M100 120 Q 140 90 180 50 M100 110 Q 60 80 20 40" stroke={color} strokeWidth="1.5" fill="none" opacity="0.8" />
                        <path d="M100 100 Q 120 70 140 30 M100 90 Q 80 60 60 20" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
                        <path d="M100 80 Q 110 50 120 10 M100 70 Q 90 40 80 5" stroke={color} strokeWidth="1" fill="none" opacity="0.4" />
                    </svg>
                );
            case 'ribbon': // Textile / Silk Ribbon
                return (
                    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                        <path d="M20 180 Q 80 200 120 100 T 180 20" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" opacity="0.5"/>
                        <path d="M20 180 Q 80 200 120 100 T 180 20" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" opacity="0.8"/>
                        <path d="M40 190 Q 90 160 140 60" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" opacity="0.3"/>
                    </svg>
                );
            case 'monstera': // Tropical / Monstera
                return (
                    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg" fill={color}>
                        <path d="M100,20 C140,20 180,60 180,110 C180,160 140,180 100,180 C60,180 20,160 20,110 C20,60 60,20 100,20 M140,50 C120,60 110,80 110,80 C110,80 150,90 170,80 C150,70 140,50 140,50 M60,50 C80,60 90,80 90,80 C90,80 50,90 30,80 C50,70 60,50 60,50 M150,130 C130,120 120,110 120,110 C120,110 140,150 150,160 M50,130 C70,120 80,110 80,110 C80,110 60,150 50,160" opacity="0.85"/>
                        <path d="M100 20 L100 180" stroke="#fff" strokeWidth="2" opacity="0.3" fill="none"/>
                    </svg>
                );
            case 'sakura': // Cherry Blossom
                return (
                    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg" fill={color}>
                        <path d="M100 10 C120 30 130 50 100 60 C70 50 80 30 100 10" opacity="0.9" />
                        <path d="M100 110 C120 90 130 70 100 60 C70 70 80 90 100 110" opacity="0.7" />
                        <path d="M150 60 C130 80 110 90 100 60 C110 30 130 40 150 60" opacity="0.8" />
                        <path d="M50 60 C70 80 90 90 100 60 C90 30 70 40 50 60" opacity="0.8" />
                        <circle cx="100" cy="60" r="10" fill="#fff" opacity="0.5"/>
                    </svg>
                );
            case 'gold-arch': // Minimal Geometric Arch
                return (
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                        <path d="M50 200 L50 100 A50 50 0 0 1 150 100 L150 200" fill="none" stroke={color} strokeWidth="2" opacity="0.6"/>
                        <path d="M60 200 L60 100 A40 40 0 0 1 140 100 L140 200" fill="none" stroke={color} strokeWidth="1" opacity="0.4"/>
                        <path d="M100 40 L100 60 M40 100 L60 100 M140 100 L160 100" stroke={color} strokeWidth="1.5" opacity="0.8"/>
                    </svg>
                );
            // Legacy fallbacks mapping
            case 'floral':
            case 'boho':
            case 'tropical':
            case 'minimal':
                return (
                    <svg viewBox="0 0 200 200" className="w-full h-full" style={{ fill: color }}>
                        <path d="M40,60 C40,40 60,30 80,40 C100,20 120,20 140,40 C160,30 180,40 180,60 C180,100 100,180 100,180 C100,180 20,100 20,60" opacity="0.6" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const positionClasses = {
        'top-left': 'top-0 left-0 -translate-x-[20%] -translate-y-[20%]',
        'top-right': 'top-0 right-0 translate-x-[20%] -translate-y-[20%] scale-x-[-1]',
        'bottom-left': 'bottom-0 left-0 -translate-x-[10%] translate-y-[10%] scale-y-[-1]',
        'bottom-right': 'bottom-0 right-0 translate-x-[10%] translate-y-[10%] scale-x-[-1] scale-y-[-1]',
        'top-edge': 'top-0 left-1/2 -translate-x-1/2 -translate-y-[30%] rotate-90',
        'bottom-edge': 'bottom-0 left-1/2 -translate-x-1/2 translate-y-[30%] -rotate-90',
        'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={{ 
                opacity: opacity, 
                scale: [1, 1.05, 1], 
                rotate: [0, 3, -1, 0],
                y: [0, -10, 0]
            }}
            transition={{ 
                opacity: { duration: 1.2, ease: "easeOut" },
                scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 12, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
            }}
            className={`absolute w-40 md:w-56 h-40 md:h-56 pointer-events-none z-0 ${positionClasses[position]} ${className}`}
        >
            {getSVG()}
        </motion.div>
    );
}
