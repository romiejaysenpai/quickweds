'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface GallerySectionProps {
    gallery: string[];
    masonry?: boolean;
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
                className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
                onClick={onClose}
            >
                {/* Close */}
                <button onClick={onClose} className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                    <X className="w-6 h-6" />
                </button>

                {/* Download */}
                <button onClick={(e) => { e.stopPropagation(); handleDownload(); }} className="absolute top-6 right-20 z-10 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                    <Download className="w-5 h-5" />
                </button>

                {/* Prev */}
                <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 md:left-8 z-10 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Next */}
                <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 md:right-8 z-10 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                    <ChevronRight className="w-6 h-6" />
                </button>

                {/* Image */}
                <motion.img
                    key={current}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    src={images[current]}
                    className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl"
                    onClick={(e) => e.stopPropagation()}
                />

                {/* Counter */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm font-mono">
                    {current + 1} / {images.length}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function GallerySection({ gallery, masonry = false }: GallerySectionProps) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    if (!gallery || gallery.length === 0) return null;

    return (
        <>
            <section className="py-32">
                <div className="max-w-6xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-20"
                    >
                        <span className="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-4 block">Moments Captured</span>
                        <h2 className="text-6xl font-serif text-[#4A4444]">Our Gallery</h2>
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {gallery.map((img: string, i: number) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="aspect-[4/5] rounded-[2.5rem] overflow-hidden soft-shadow bg-white p-3 border border-primary/5 group cursor-pointer"
                                onClick={() => setLightboxIndex(i)}
                            >
                                <div className="w-full h-full rounded-[2rem] overflow-hidden relative">
                                    <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                        <span className="text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">View</span>
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
                        <img src={img} className="w-full h-full object-cover" />
                    </div>
                ))}
            </div>
        </section>
    );
}
