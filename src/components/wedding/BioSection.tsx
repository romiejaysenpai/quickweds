'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import type { Wedding } from '@/types/wedding';

interface BioSectionProps {
    wedding: Wedding;
}

export default function BioSection({ wedding }: BioSectionProps) {
    return (
        <section className="max-w-6xl mx-auto px-4 md:px-6 py-24 md:py-32 overflow-hidden relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-20 items-center">
                <motion.div 
                    initial={{ opacity: 0, x: -50, rotate: -5 }}
                    whileInView={{ opacity: 1, x: 0, rotate: -2 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 1, type: "spring", bounce: 0.4 }}
                    className="relative px-4 md:px-0"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent blur-3xl -z-10 rounded-full" />
                    <div className="aspect-[4/5] rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-2xl shadow-black/10 border-[8px] md:border-[16px] border-white/80 backdrop-blur-sm group hover:-rotate-1 transition-transform duration-700">
                        <img src={wedding.couple_photo || wedding.hero_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    </div>
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="text-center md:text-left"
                >
                    <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] font-bold text-primary mb-6 block drop-shadow-sm">Our Love Story</span>
                    <h2 className="text-5xl md:text-7xl font-serif mb-8 text-[#4A4444] leading-tight">Meant to Be</h2>
                    <p className="text-lg md:text-xl leading-relaxed text-[#4A4444]/80 font-serif italic mb-10 md:mb-12 drop-shadow-sm px-4 md:px-0">
                        {wedding.story || "They say when you know, you know. For us, every moment since we met has been a beautiful step towards this day."}
                    </p>
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl shadow-primary/5 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left mx-4 md:mx-0"
                    >
                        <Quote className="w-10 h-10 md:w-12 md:h-12 text-primary opacity-30 flex-shrink-0" />
                        <p className="italic text-[#4A4444] font-serif text-base md:text-xl leading-relaxed">
                            {wedding.quote || "A successful marriage requires falling in love many times, always with the same person."}
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
