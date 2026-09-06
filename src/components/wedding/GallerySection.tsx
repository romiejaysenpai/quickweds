'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { getTypography, BENTO_PRESETS, getTemplateVisualProfile, parseSectionStyles, resolveSectionBackground } from '@/lib/theme-engine';
import { useSectionContext } from '@/context/SectionContext';
import type { SectionStylesMap } from '@/types/wedding';

interface GallerySectionProps {
    gallery: string[];
    masonry?: boolean;
    template?: string;
    motifColor?: string;
    cardStyle?: string;
    galleryLayout?: string;
    id: string;
    sectionStyles?: SectionStylesMap | string;
}

type GalleryLayout = 'auto' | 'bento' | 'vertical' | 'horizontal' | 'grid';

function normalizeGalleryLayout(layout?: string): GalleryLayout {
    if (layout === 'bento' || layout === 'vertical' || layout === 'horizontal' || layout === 'grid') {
        return layout;
    }
    return 'auto';
}

function getDefaultGalleryLayout(template: string, masonry: boolean): Exclude<GalleryLayout, 'auto'> {
    const normalized = template.toLowerCase();
    if (masonry || ['editorial', 'vogue', 'minimal', 'luxury', 'garden', 'tropical', 'sakura'].includes(normalized)) {
        return 'bento';
    }
    if (['film', 'cinematic', 'urban', 'glitch'].includes(normalized)) {
        return 'horizontal';
    }
    if (['boho', 'romantic', 'elopement', 'whimsical'].includes(normalized)) {
        return 'vertical';
    }
    return 'grid';
}

function GalleryImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
    const [isLoaded, setIsLoaded] = useState(false);
    return (
        <>
            <div className={`absolute inset-0 bg-black/5 animate-pulse transition-opacity duration-700 ${isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} />
            <Image
                src={src}
                alt={alt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                decoding="async"
                onLoad={() => setIsLoaded(true)}
                className={`h-full w-full object-cover transition-all duration-[1200ms] ease-out ${className || ''} ${isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-110'}`}
            />
        </>
    );
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
                    alt={`Wedding gallery image ${current + 1}`}
                    decoding="async"
                    className="max-w-[95vw] max-h-[80vh] sm:max-h-[85vh] object-contain rounded-lg sm:rounded-2xl"
                    onClick={(e) => e.stopPropagation()}
                />

                {/* Counter */}
                <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-mono text-white sm:text-sm">
                    {current + 1} / {images.length}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function GallerySection({ gallery, masonry = false, template = 'classic', motifColor = '#D16C78', cardStyle, galleryLayout = 'auto', id, sectionStyles }: GallerySectionProps) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const { registerSection, unregisterSection } = useSectionContext();

    useEffect(() => {
        if (gallery && gallery.length > 0) {
            registerSection(id, 'Gallery');
        }
        return () => unregisterSection(id);
    }, [id, gallery, registerSection, unregisterSection]);

    if (!gallery || gallery.length === 0) return null;

    const typography = getTypography(template);
    const visual = getTemplateVisualProfile(template, motifColor, false, cardStyle);
    
    const isSharp = visual.isSharp || ['editorial', 'vogue', 'urban', 'minimal'].includes(template);
    const selectedLayout = normalizeGalleryLayout(galleryLayout);
    const resolvedLayout = selectedLayout === 'auto' ? (visual.galleryLayoutVariant || getDefaultGalleryLayout(template, masonry)) : selectedLayout;
    const isBento = resolvedLayout === 'bento';
    const layoutClasses = isBento ? BENTO_PRESETS.gallery : Array(gallery.length).fill("");
    const itemRadiusClass = isSharp ? 'rounded-none' : 'rounded-[1.8rem]';

    const renderGalleryItem = (img: string, i: number, modeClass = '') => (
        <motion.button
            key={`${img}-${i}`}
            type="button"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.06, 0.36), duration: 0.5 }}
            className={`group cursor-pointer overflow-hidden p-2 text-left transition-all duration-500 hover:-translate-y-1 ${visual.cardClass} ${modeClass}`}
            onClick={() => setLightboxIndex(i)}
            aria-label={`Open wedding gallery image ${i + 1}`}
        >
            <div className={`relative w-full overflow-hidden ${itemRadiusClass} ${
                resolvedLayout === 'horizontal'
                    ? 'aspect-[4/5] min-h-[20rem]'
                    : resolvedLayout === 'vertical'
                        ? 'aspect-[4/5] min-h-[20rem] sm:aspect-[16/10]'
                        : isBento
                            ? 'min-h-[18rem] sm:min-h-[22rem] md:h-full md:min-h-[16rem] lg:min-h-[18rem]'
                            : 'aspect-square min-h-[16rem] sm:min-h-[18rem] lg:aspect-[4/5]'
            }`}>
                <GalleryImage
                    src={img}
                    alt={`Wedding gallery image ${i + 1}`}
                    className="group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/8 to-transparent opacity-100 transition-opacity duration-500 sm:opacity-0 sm:group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4 opacity-100 transition-all duration-500 sm:translate-y-4 sm:p-5 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                    <span className="rounded-full border border-white/55 bg-black/45 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md sm:px-4 sm:text-[10px] sm:tracking-[0.24em]">
                        Memory {i + 1}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-lg ring-1 ring-black/10">
                        <ChevronRight className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </motion.button>
    );

    const sectionStylesMap = parseSectionStyles(sectionStyles);
    const customBg = resolveSectionBackground(sectionStylesMap[id] || sectionStylesMap['gallery']);

    return (
        <>
        <section
            id={id}
            className={`py-24 sm:py-32 relative overflow-hidden ${customBg.hasCustomBackground ? '' : visual.sectionClass} ${customBg.textColorClass || ''}`}
            style={customBg.hasCustomBackground ? customBg.style : visual.sectionStyle}
        >
            {customBg.overlayStyle && <div style={customBg.overlayStyle} />}
                <div className={visual.containerClass}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-12 sm:mb-20"
                    >
                        <div className="mb-4 flex items-center justify-center">
                            <span className={visual.badgeStyleClass || `text-xs uppercase font-bold block ${visual.eyebrowClass}`}>
                                {visual.badgePrefix ? `${visual.badgePrefix}GALLERY` : 'Moments Captured'}
                            </span>
                        </div>
                        <h2 className={`text-4xl sm:text-6xl ${typography.heading} ${visual.headingClass}`}>{visual.galleryTitle}</h2>
                        <div className={`mx-auto mt-6 ${visual.dividerClass}`} />
                        <p className={`mx-auto mt-5 max-w-2xl text-sm leading-relaxed sm:text-base ${visual.bodyClass}`}>
                            A curated look at the people, places, and details that shaped the celebration.
                        </p>
                    </motion.div>

                    {resolvedLayout === 'horizontal' ? (
                        <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto overscroll-x-contain px-4 pb-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
                            {gallery.map((img: string, i: number) => renderGalleryItem(
                                img,
                                i,
                                'w-[78vw] max-w-[22rem] shrink-0 snap-center sm:w-[42vw] md:w-[min(34vw,26rem)]'
                            ))}
                        </div>
                    ) : resolvedLayout === 'vertical' ? (
                        <div className="mx-auto max-w-4xl space-y-5 sm:space-y-7">
                            {gallery.map((img: string, i: number) => renderGalleryItem(img, i, 'w-full'))}
                        </div>
                    ) : (
                        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 ${
                            isBento ? 'md:grid-cols-4 md:auto-rows-[16rem] lg:auto-rows-[18rem]' : 'lg:grid-cols-3'
                        }`}>
                            {gallery.map((img: string, i: number) => renderGalleryItem(
                                img,
                                i,
                                `${isBento ? 'md:h-full' : ''} ${layoutClasses[i % layoutClasses.length]}`
                            ))}
                        </div>
                    )}
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
                    <div key={i} className="relative w-[400px] h-[300px] shrink-0 grayscale hover:grayscale-0 transition-all duration-500 overflow-hidden">
                        <GalleryImage src={img} alt={`Wedding gallery image ${i + 1}`} />
                    </div>
                ))}
            </div>
        </section>
    );
}
