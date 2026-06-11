'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { Wedding } from '@/types/wedding';
import { useMemo, useSyncExternalStore } from 'react';
import { derivePalette } from '@/lib/theme-engine';

const subscribeToClient = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function PremiumBackgroundLayer({ wedding }: { wedding: Wedding }) {
    const isMounted = useSyncExternalStore(subscribeToClient, getClientSnapshot, getServerSnapshot);
    const reduceMotion = useReducedMotion();

    const motifColor = wedding.motif_color || '#D16C78';
    const palette = useMemo(() => derivePalette(motifColor), [motifColor]);
    const hasVideo = !!wedding.teaser_video && !reduceMotion;

    // Generate random but deterministic positions for aurora blobs
    const blobs = useMemo(() => [
        { id: 1, color: palette.primary, size: 'w-[80%] h-[80%]', initial: { top: '-10%', left: '-10%' }, animate: { x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }, duration: 20 },
        { id: 2, color: palette.secondary, size: 'w-[70%] h-[70%]', initial: { bottom: '10%', right: '-5%' }, animate: { x: [0, -40, 0], y: [0, -60, 0], scale: [1, 1.2, 1] }, duration: 25 },
        { id: 3, color: `${palette.primary}22`, size: 'w-[60%] h-[60%]', initial: { top: '30%', left: '20%' }, animate: { x: [0, 30, 0], y: [0, 40, 0], rotate: [0, 45, 0] }, duration: 30 },
    ], [palette]);

    if (!isMounted) return <div className="fixed inset-0 -z-50 bg-[#fafafa]" />;

    return (
        <div className="fixed inset-0 -z-[100] overflow-hidden bg-[#fcfaf7] pointer-events-none">
            {/* Base Surface Texture (Subtle Grain/Noise) */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply z-50" style={{ backgroundImage: 'var(--qw-paper-texture)' }} />

            {hasVideo ? (
                <>
                    {/* Dynamic Blurred Looping Video Background */}
                    <video 
                        src={wedding.teaser_video} 
                        autoPlay 
                        muted 
                        loop 
                        playsInline 
                        preload="metadata"
                        className="absolute inset-0 hidden h-[120%] w-full scale-125 object-cover opacity-[0.25] blur-[100px] mix-blend-multiply md:block md:blur-[140px]" 
                    />
                    <div 
                        className="absolute inset-0 opacity-10 mix-blend-color" 
                        style={{ backgroundColor: palette.primary }} 
                    />
                </>
            ) : (
                <div className="absolute inset-0">
                    {/* Aurora Mesh Blobs */}
                    {blobs.map((blob) => (
                        <motion.div 
                            key={blob.id}
                            initial={blob.initial}
                            animate={blob.animate}
                            transition={{ duration: blob.duration, repeat: Infinity, ease: "easeInOut" }}
                            className={`absolute ${blob.size} rounded-full blur-[120px] md:blur-[160px] opacity-20 mix-blend-multiply`}
                            style={{ backgroundColor: blob.color }} 
                        />
                    ))}
                    
                    {/* Static Ambient Color wash */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundColor: palette.primary }} />
                </div>
            )}
            
            {/* Depth Gradients & Vignette */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-black/[0.02]" />
            <div className="absolute inset-0 shadow-[inset_0_0_300px_rgba(0,0,0,0.05)]" />
            
            {/* Subtle Grid / Structural Overlay for Modern Vibe */}
            <div className="absolute inset-0 opacity-[0.01] bg-[length:40px_40px] [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)]" />
        </div>
    );
}
