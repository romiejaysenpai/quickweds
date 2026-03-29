'use client';

import { motion } from 'framer-motion';
import type { Wedding } from '@/types/wedding';
import { useEffect, useState } from 'react';

export default function PremiumBackgroundLayer({ wedding }: { wedding: Wedding }) {
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const motifColor = wedding.motif_color || '#D16C78';
    const hasVideo = !!wedding.teaser_video;

    if (!isMounted) return <div className="fixed inset-0 -z-50 bg-[#fafafa]" />;

    return (
        <div className="fixed inset-0 -z-[100] overflow-hidden bg-[#fafafa] pointer-events-none">
            {hasVideo ? (
                <>
                    {/* Dynamic Blurred Looping Video Background */}
                    <video 
                        src={wedding.teaser_video} 
                        autoPlay 
                        muted 
                        loop 
                        playsInline 
                        className="absolute inset-0 w-full h-[120%] object-cover scale-125 blur-[60px] md:blur-[100px] opacity-[0.35] mix-blend-multiply" 
                    />
                    <div 
                        className="absolute inset-0 opacity-20 mix-blend-color" 
                        style={{ backgroundColor: motifColor }} 
                    />
                </>
            ) : (
                <>
                    <div className="absolute inset-0 opacity-20 mix-blend-multiply" style={{ backgroundColor: `${motifColor}11` }} />
                    <motion.div 
                        animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.4, 1], rotate: [0, 90, 0] }} 
                        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }} 
                        className="absolute -top-[20%] -left-[10%] w-[80%] md:w-[60%] aspect-square rounded-full blur-[100px] md:blur-[140px]" 
                        style={{ backgroundColor: `${motifColor}44` }} 
                    />
                    <motion.div 
                        animate={{ opacity: [0.1, 0.25, 0.1], scale: [1, 1.1, 1] }} 
                        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }} 
                        className="absolute bottom-[10%] -right-[10%] w-[70%] md:w-[50%] aspect-square rounded-full blur-[120px] md:blur-[150px]" 
                        style={{ backgroundColor: `${motifColor}33` }} 
                    />
                </>
            )}
            
            {/* Soft vignette framework */}
            <div className="absolute inset-0 shadow-[inset_0_0_250px_rgba(0,0,0,0.03)] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5" />
        </div>
    );
}
