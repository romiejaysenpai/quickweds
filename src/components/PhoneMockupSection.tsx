'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TEMPLATES } from './BuilderForm'; // Import the templates
import { Heart } from 'lucide-react';

// --- Simplified Template Previews (Mimicking the real ones) ---
// Since the real templates are complex and dependent on wedding data, 
// we create lightweight visual representations for the mockup.

const MockWeddingData = {
    bride_name: 'Isabella',
    groom_name: 'Julian',
    wedding_date: '2026-06-15',
    venue_name: 'The Ritz, Paris',
    hashtag: 'BellaJulian',
    motif_color: '#D4AF37'
};

const TemplatePreview = ({ templateId }: { templateId: string }) => {
    switch (templateId) {
        case 'minimal':
            return (
                <div className="h-full bg-white text-black p-4 flex flex-col items-center justify-center text-center font-sans">
                    <div className="text-xs uppercase tracking-[0.3em] mb-4 border-b border-black pb-1">The Union</div>
                    <h2 className="text-3xl font-bold uppercase tracking-tighter leading-none mb-2">{MockWeddingData.bride_name}</h2>
                    <span className="text-xl italic font-serif">&</span>
                    <h2 className="text-3xl font-bold uppercase tracking-tighter leading-none mt-2">{MockWeddingData.groom_name}</h2>
                    <div className="mt-8 text-xs font-mono">{MockWeddingData.wedding_date}</div>
                </div>
            );
        case 'royal':
            return (
                <div className="h-full bg-[#121212] text-[#D6B87C] p-4 flex flex-col items-center justify-center text-center font-serif relative overflow-hidden">
                    <div className="absolute inset-2 border border-[#D6B87C]/30 pointer-events-none" />
                    <span className="text-[8px] uppercase tracking-[0.5em] mb-6 opacity-60">Royal Invitation</span>
                    <h2 className="text-4xl font-serif italic mb-2">{MockWeddingData.bride_name}</h2>
                    <span className="text-xl my-2">&</span>
                    <h2 className="text-4xl font-serif italic mb-6">{MockWeddingData.groom_name}</h2>
                    <div className="w-8 h-[1px] bg-[#D6B87C] mb-4" />
                    <div className="text-[10px] uppercase tracking-widest">{MockWeddingData.wedding_date}</div>
                </div>
            );
        case 'boho':
            return (
                <div className="h-full bg-[#faefe8] text-[#8b5a2b] p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#e6ccb2] rounded-full blur-2xl opacity-50 -translate-y-10 translate-x-10" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#d4a373] rounded-full blur-3xl opacity-30 translate-y-10 -translate-x-10" />

                    <h2 className="text-4xl font-serif mb-1 z-10">{MockWeddingData.bride_name}</h2>
                    <span className="text-sm italic opacity-70 z-10">and</span>
                    <h2 className="text-4xl font-serif mt-1 mb-8 z-10">{MockWeddingData.groom_name}</h2>
                    <div className="px-6 py-2 border border-[#8b5a2b] rounded-full z-10">
                        <div className="text-[10px] uppercase tracking-widest font-bold">Save the Date</div>
                    </div>
                </div>
            );
        case 'urban':
            return (
                <div className="h-full bg-black text-white p-4 flex flex-col justify-between font-mono relative">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20" />
                    <div className="flex justify-between text-[8px] uppercase tracking-widest opacity-50 pt-2">
                        <span>NYC</span>
                        <span>VIP</span>
                    </div>
                    <div className="my-auto">
                        <h2 className="text-4xl font-black uppercase tracking-tighter leading-[0.8] mb-4 mix-blend-difference">
                            {MockWeddingData.bride_name}<br />
                            <span className="text-[#ff3e3e]">+</span><br />
                            {MockWeddingData.groom_name}
                        </h2>
                    </div>
                    <div className="text-[8px] uppercase border-t border-white/20 pt-2 flex justify-between">
                        <span>{MockWeddingData.wedding_date}</span>
                        <span>→ RSVP</span>
                    </div>
                </div>
            );
        case 'tropical':
            return (
                <div className="h-full bg-[#e0f2f1] text-[#00695c] p-4 flex flex-col items-center justify-center text-center relative font-serif">
                    <h2 className="text-4xl mb-2 tracking-tighter leading-none">{MockWeddingData.bride_name}</h2>
                    <div className="text-2xl italic text-[#26a69a]">&</div>
                    <h2 className="text-4xl mt-2 mb-6 tracking-tighter leading-none">{MockWeddingData.groom_name}</h2>
                    <div className="w-full h-32 absolute bottom-0 bg-[#00695c] rounded-t-[2rem] opacity-10" />
                    <button className="px-6 py-2 bg-[#00695c] text-white rounded-full text-[8px] uppercase font-black tracking-widest shadow-lg transform -rotate-2">
                        Lets Party
                    </button>
                </div>
            );
        default: // Classic
            return (
                <div className="h-full bg-[#FFF8F4] text-[#4A4444] p-4 flex flex-col items-center justify-center text-center font-serif">
                    <div className="w-12 h-12 border border-[#D16C78]/30 rounded-full flex items-center justify-center mb-6">
                        <Heart className="w-4 h-4 text-[#D16C78]" />
                    </div>
                    <h2 className="text-3xl mb-1">{MockWeddingData.bride_name}</h2>
                    <span className="text-lg italic font-light text-[#D16C78]">&</span>
                    <h2 className="text-3xl mt-1 mb-6">{MockWeddingData.groom_name}</h2>
                    <p className="text-[10px] uppercase tracking-[0.2em]">{MockWeddingData.wedding_date}</p>
                </div>
            );
    }
};

export default function PhoneMockupSection() {
    const [currentIndex, setCurrentIndex] = useState(0);
    // Select a few diverse templates for the carousel
    const showcaseTemplates = ['classic', 'minimal', 'royal', 'boho', 'urban', 'tropical'];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % showcaseTemplates.length);
        }, 4000); // Change every 4 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-24 px-6 overflow-hidden relative">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-24">

                {/* Left Side: Text Content */}
                <div className="flex-1 text-center md:text-left z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <span className="text-primary font-bold tracking-widest uppercase text-xs mb-4 block">Mobile First Design</span>
                        <h2 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
                            Perfect on <br />
                            <span className="italic text-primary">Every Device</span>
                        </h2>
                        <p className="text-lg text-text-secondary font-light leading-relaxed mb-8 max-w-lg mx-auto md:mx-0">
                            Your guests are on their phones. Your wedding invitation should be too.
                            We obsess over every pixel to ensure a flawless experience on iOS and Android.
                        </p>

                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            <div className="px-4 py-2 bg-neutral rounded-lg text-xs font-bold text-text-secondary flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500" /> Fast Loading
                            </div>
                            <div className="px-4 py-2 bg-neutral rounded-lg text-xs font-bold text-text-secondary flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500" /> Touch Optimized
                            </div>
                            <div className="px-4 py-2 bg-neutral rounded-lg text-xs font-bold text-text-secondary flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-500" /> App-Like Feel
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Side: Phone Mockup */}
                <div className="relative flex-1 flex justify-center items-center">
                    {/* Decorative Blobs */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative w-[300px] h-[600px] bg-gray-900 rounded-[3rem] border-[8px] border-gray-900 shadow-2xl overflow-hidden ring-4 ring-black/10"
                    >
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20" />

                        {/* Screen Content */}
                        <div className="w-full h-full bg-white relative overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={showcaseTemplates[currentIndex]}
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="w-full h-full"
                                >
                                    <TemplatePreview templateId={showcaseTemplates[currentIndex]} />
                                </motion.div>
                            </AnimatePresence>

                            {/* Fake UI Elements */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full z-20" />
                        </div>
                    </motion.div>

                    {/* Floating Design Badge */}
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-20 -left-12 bg-white p-4 rounded-2xl shadow-xl border border-border z-20 md:block hidden"
                    >
                        <div className="text-xs uppercase font-bold text-text-secondary mb-1">Current Style</div>
                        <div className="text-lg font-serif font-bold text-primary">
                            {TEMPLATES.find(t => t.id === showcaseTemplates[currentIndex])?.name || 'Custom Design'}
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
