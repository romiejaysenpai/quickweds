'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { derivePalette, getTypography, BENTO_PRESETS } from '@/lib/theme-engine';

interface GallerySectionProps {
    gallery: string[];
    masonry?: boolean;
    template?: string;
    motifColor?: string;
}

function Lightbox({ images, index, onClose }: { images: string[]; index: number; onClose: () => void }) {
    const [current, setCurrent] = useState(index);

    const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
    const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

    const handleDownload = () => {
        const a = document.createElement('a');
        a.href = images[current];
        a.download = `wedding-photo-${current + 1}.jpg`;
        a.target = '_blank';
        a.click();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 pt-16 sm:pt-0"
                onClick={onClose}
            >
                {/* Close */}
                <button onClick={onClose} className="absolute top-4 sm:top-6 right-4 sm:right-6 z-10 w-10 sm:w-12 h-10 sm:h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors min-h-[44px] min-w-[44px]">
                    <X className="w-5 sm:w-6 h-5 sm:h-6" />
                </button>

                {/* Download */}
                <button onClick={(e) => { e.stopPropagation(); handleDownload(); }} className="absolute top-4 sm:top-6 right-16 sm:right-20 z-10 w-10 sm:w-12 h-10 sm:h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors min-h-[44px] min-w-[44px]">
                    <Download className="w-5 sm:w-5 h-5 sm:h-5" />
                </button>

                {/* Prev */}
                <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-2 sm:left-4 md:left-8 z-10 w-10 sm:w-12 h-10 sm:h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors min-h-[44px] min-w-[44px]">
                    <ChevronLeft className="w-5 sm:w-6 h-5 sm:h-6" />
                </button>

                {/* Next */}
                <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-2 sm:right-4 md:right-8 z-10 w-10 sm:w-12 h-10 sm:h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors min-h-[44px] min-w-[44px]">
                    <ChevronRight className="w-5 sm:w-6 h-5 sm:h-6" />
                </button>

                {/* Image */}
                <motion.img
                    key={current}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    src={images[current]}
                    className="max-w-[95vw] max-h-[80vh] sm:max-h-[85vh] object-contain rounded-lg sm:rounded-2xl"
                    onClick={(e) => e.stopPropagation()}
                />

                {/* Counter */}
                <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-xs sm:text-sm font-mono">
                    {current + 1} / {images.length}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function GallerySection({ gallery, masonry = false, template = 'classic', motifColor = '#D16C78' }: GallerySectionProps) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    if (!gallery || gallery.length === 0) return null;

    const palette = derivePalette(motifColor);
    const typography = getTypography(template);
    
    const isSharp = ['editorial', 'vogue', 'urban', 'minimal'].includes(template);
    const isBento = ['editorial', 'vogue', 'minimal', 'urban', 'boho', 'luxury'].includes(template);
    const layoutClasses = isBento ? BENTO_PRESETS.gallery : Array(gallery.length).fill("");

    return (
        <>
            <section className="py-24 sm:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-12 sm:mb-20"
                    >
                        <span className="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-4 block">Moments Captured</span>
                        <h2 className={`text-4xl sm:text-6xl ${typography.heading} text-[#4A4444]`}>Our Gallery</h2>
                        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-foreground/55 sm:text-base">
                            A curated look at the people, places, and details that shaped the celebration.
                        </p>
                    </motion.div>

                    <div className={`grid grid-cols-1 sm:grid-cols-2 ${isBento ? 'md:grid-cols-4' : 'lg:grid-cols-3'} gap-4 sm:gap-6`}>
                        {gallery.map((img: string, i: number) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className={`group cursor-pointer overflow-hidden border border-white/60 bg-white/65 p-2 shadow-xl backdrop-blur-sm transition-all duration-500 hover:shadow-2xl ${
                                    isSharp ? 'rounded-none' : 'rounded-[2rem]'
                                } ${layoutClasses[i % layoutClasses.length]}`}
                                onClick={() => setLightboxIndex(i)}
                            >
                                <div className={`relative h-full w-full overflow-hidden ${isSharp ? 'rounded-none' : 'rounded-[1.8rem]'}`}>
                                    <img
                                        src={img}
                                        alt={`Wedding gallery image ${i + 1}`}
                                        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                        <span className="rounded-full border border-white/35 bg-white/15 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-white backdrop-blur-md">
                                            Memory {i + 1}
                                        </span>
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-lg">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {lightboxIndex !== null && (
                <Lightbox images={gallery} index={lightboxIndex} onClose={() => setLightboxIndex(null)} />
            )}
        </>
    );
}

export function MinimalGallery({ gallery }: { gallery: string[] }) {
    if (gallery.length === 0) return null;
    return (
        <section className="py-24 border-y border-black/5 overflow-hidden">
            <div className="flex gap-12 px-6 animate-marquee whitespace-nowrap">
                {gallery.concat(gallery).map((img: string, i: number) => (
                    <div key={i} className="w-[400px] h-[300px] shrink-0 grayscale hover:grayscale-0 transition-all duration-500">
                        <img src={img} alt={`Wedding gallery image ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                ))}
            </div>
        </section>
    );
}
