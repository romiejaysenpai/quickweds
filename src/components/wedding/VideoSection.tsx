'use client';

import { motion } from 'framer-motion';

interface VideoSectionProps {
    video?: string;
    poster?: string;
}

export default function VideoSection({ video, poster }: VideoSectionProps) {
    if (!video) return null;
    return (
        <section className="py-24 bg-[#1a1a1a] text-white overflow-hidden">
            <div className="max-w-5xl mx-auto px-6 text-center">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
                    <span className="text-xs uppercase tracking-[0.4em] font-black text-primary mb-6 block opacity-60">Sneak Peek</span>
                    <h2 className="text-4xl md:text-6xl font-serif mb-12">Wedding Teaser</h2>
                    <div className="aspect-video rounded-[3rem] overflow-hidden soft-shadow relative bg-black/40 p-2 md:p-4 border border-white/10 group">
                        <video src={video} className="w-full h-full object-cover rounded-[2.5rem]" controls poster={poster} />
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent group-hover:opacity-0 transition-opacity" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
