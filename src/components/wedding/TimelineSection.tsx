'use client';

import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface TimelineSectionProps {
    timeline: string;
}

export default function TimelineSection({ timeline }: TimelineSectionProps) {
    if (!timeline) return null;
    return (
        <section className="py-16 sm:py-24 md:py-32 relative z-10 overflow-hidden">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 relative">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="text-center mb-8 sm:mb-12 md:mb-16"
                >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mb-4 sm:mb-6 shadow-[0_0_50px_rgba(var(--primary),0.1)] rotate-3 min-h-[44px] min-w-[44px]">
                        <Clock className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-[#4A4444] drop-shadow-sm">The Program</h2>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.8, type: 'spring' }}
                    className="relative bg-white/40 backdrop-blur-3xl border border-white/50 p-4 sm:p-8 md:p-16 rounded-2xl sm:rounded-[2rem] md:rounded-[4rem] shadow-2xl shadow-primary/5"
                >
                    <div className="absolute top-10 bottom-10 left-4 sm:left-6 md:left-8 lg:left-12 w-[3px] bg-gradient-to-b from-primary/0 via-primary/30 to-primary/0" />
                    
                    <p className="whitespace-pre-wrap font-serif text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed md:leading-loose text-[#4A4444]/90 relative z-10 pl-6 sm:pl-8 md:pl-12">
                        {timeline}
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
