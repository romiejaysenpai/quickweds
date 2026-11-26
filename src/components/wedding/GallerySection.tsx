'use client';

import { useState, useEffect, useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download, ImageOff } from 'lucide-react';
import { getTypography, BENTO_PRESETS, getSectionTitleStyle, getTemplateVisualProfile } from '@/lib/theme-engine';
import { useSectionActions } from '@/context/SectionContext';
import type { Wedding } from '@/types/wedding';

interface GallerySectionProps {
    gallery: string[];
    masonry?: boolean;
    template?: string;
    motifColor?: string;
    cardStyle?: string;
    galleryLayout?: string;
    wedding?: Wedding;
    id: string;
}

const subscribeNoop = () => () => {};

type GalleryLayout = 'auto' | 'bento' | 'vertical' | 'horizontal' | 'grid';

function normalizeGalleryLayout(layout?: string): GalleryLayout {
    if (layout === 'bento' || layout === 'vertical' || layout === 'horizontal' || layout === 'grid') {
        return layout;
    }
    if (layout === 'editorial' || layout === 'masonry') {
        return 'bento';
    }
    if (layout === 'film') {
        return 'horizontal';
    }
    return 'auto';
}

function getDefaultGalleryLayout(template: string, masonry: boolean): Exclude<GalleryLayout, 'auto'> {
    const normalized = template.toLowerCase();
    if (
        masonry ||
        [
            'editorial',
            'vogue',
            'minimal',
            'luxury',
            'garden',
            'tropical',
            'sakura',
            'editorial-luxe',
            'velure-editorial',
            'pearl-coastal',
            'riviera',
            'nordic',
            'monochrome',
            'noir-atelier',
        ].includes(normalized)
    ) {
        return 'bento';
    }
    if (['film', 'cinematic', 'cinematic-vow', 'urban', 'glitch', 'celestial', 'midnight'].includes(normalized)) {
        return 'horizontal';
    }
    if (
        [
            'boho',
            'romantic',
            'elopement',
            'whimsical',
            'editorial-romance',
            'watercolor-meadow',
            'torn-paper-terracotta',
            'envelope-wax-seal',
            'botanical-arch',
            'heirloom',
        ].includes(normalized)
    ) {
        return 'vertical';
    }
    return 'grid';
}

function GalleryImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
    const trimmedSrc = typeof src === 'string' ? src.trim() : '';
    const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
    const [erroredSrc, setErroredSrc] = useState<string | null>(null);
    const isLoaded = loadedSrc === trimmedSrc;
    const hasError = erroredSrc === trimmedSrc;
    const canOptimize = trimmedSrc.startsWith('/') || trimmedSrc.includes('.supabase.co') || trimmedSrc.includes('res.cloudinary.com');

    if (!trimmedSrc || hasError) {
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/5 px-4 text-center text-current/45">
                <ImageOff className="h-6 w-6" aria-hidden="true" />
                <span className="text-[11px] uppercase tracking-[0.18em]">Photo unavailable</span>
            </div>
        );
    }

    return (
        <>
            <div className={`absolute inset-0 bg-black/5 animate-pulse transition-opacity duration-700 ${isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} />
            <Image
                src={trimmedSrc}
                alt={alt}
                fill
                unoptimized={!canOptimize}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                decoding="async"
                onLoad={() => setLoadedSrc(trimmedSrc)}
                onError={() => {
                    setErroredSrc(trimmedSrc);
                    setLoadedSrc(trimmedSrc);
                }}
                className={`h-full w-full object-cover object-[50%_25%] transition-all duration-[900ms] ease-out ${className || ''} ${isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-105'}`}
            />
        </>
    );
}

export function Lightbox({ images, index, onClose }: { images: string[]; index: number; onClose: () => void }) {
    const canPortal = useSyncExternalStore(subscribeNoop, () => true, () => false);
    const [current, setCurrent] = useState(index);
    const touchStartX = useRef<number | null>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setCurrent(index);
    }, [index]);

    const prev = useCallback(() => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1)), [images.length]);
    const next = useCallback(() => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1)), [images.length]);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        document.body.style.overflow = 'hidden';
        closeRef.current?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
            else if (event.key === 'ArrowLeft') prev();
            else if (event.key === 'ArrowRight') next();
            else if (event.key === 'Tab' && dialogRef.current) {
                const controls = Array.from(dialogRef.current.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
                const first = controls[0];
                const last = controls[controls.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last?.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first?.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKeyDown);
            previouslyFocused?.focus();
        };
    }, [next, onClose, prev]);

    const handleDownload = async () => {
        const url = images[current];
        if (!url) return;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('download_failed');
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = `wedding-photo-${current + 1}.jpg`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        } catch {
            const a = document.createElement('a');
            a.href = url;
            a.download = `wedding-photo-${current + 1}.jpg`;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.click();
        }
    };

    const handleTouchStart = (event: React.TouchEvent) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
    };

    const handleTouchEnd = (event: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const deltaX = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(deltaX) > 48) {
            if (deltaX > 0) prev();
            else next();
        }
    };

    if (!canPortal) return null;

    return createPortal(
        <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Wedding photo viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 p-4 backdrop-blur-md"
            onClick={onClose}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Top bar */}
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
                <span aria-live="polite" aria-atomic="true" className="font-serif text-sm tracking-widest text-white/75 tabular-nums">
                    <span className="sr-only">Photo </span>
                    {String(current + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
                </span>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        aria-label="Download photo"
                        onClick={(e) => {
                            e.stopPropagation();
                            void handleDownload();
                        }}
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                    >
                        <Download className="h-5 w-5" />
                    </button>
                    <button
                        ref={closeRef}
                        type="button"
                        aria-label="Close photo"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Prev / Next */}
            {images.length > 1 && (
                <>
                    <button
                        type="button"
                        aria-label="Previous photo"
                        onClick={(e) => {
                            e.stopPropagation();
                            prev();
                        }}
                        className="absolute left-2 sm:left-4 md:left-8 z-10 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                        type="button"
                        aria-label="Next photo"
                        onClick={(e) => {
                            e.stopPropagation();
                            next();
                        }}
                        className="absolute right-2 sm:right-4 md:right-8 z-10 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </>
            )}

            {/* Active Photo */}
            <motion.img
                key={current}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                src={images[current]}
                alt={`Wedding gallery image ${current + 1}`}
                decoding="async"
                className="max-h-[65dvh] max-w-[92vw] rounded-lg object-contain sm:max-h-[76vh]"
                onClick={(e) => e.stopPropagation()}
            />

            {/* Subtle thumbnail filmstrip */}
            {images.length > 1 && (
                <div
                    className="no-scrollbar absolute bottom-4 left-1/2 flex max-w-[92vw] -translate-x-1/2 items-center gap-2 overflow-x-auto px-2 py-1"
                    onClick={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                >
                    {images.map((thumb, idx) => (
                        <button
                            key={`${thumb}-${idx}`}
                            type="button"
                            aria-label={`View photo ${idx + 1}`}
                            aria-current={idx === current ? 'true' : undefined}
                            onClick={() => setCurrent(idx)}
                            className={`relative h-11 w-11 shrink-0 overflow-hidden rounded-md border transition-all ${
                                idx === current ? 'border-white opacity-100 scale-105' : 'border-white/20 opacity-45 hover:opacity-80'
                            }`}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
                        </button>
                    ))}
                </div>
            )}
        </motion.div>,
        document.body
    );
}

export default function GallerySection({ gallery, masonry = false, template = 'classic', motifColor = '#D16C78', cardStyle, galleryLayout = 'auto', wedding, id }: GallerySectionProps) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const { registerSection, unregisterSection } = useSectionActions();
    const validGallery = useMemo(
        () => (Array.isArray(gallery) ? gallery.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : []),
        [gallery]
    );
    const handleCloseLightbox = useCallback(() => setLightboxIndex(null), []);

    useEffect(() => {
        if (validGallery.length > 0) {
            registerSection(id, 'Gallery');
        }
        return () => unregisterSection(id);
    }, [id, validGallery.length, registerSection, unregisterSection]);

    if (validGallery.length === 0) return null;

    const typography = getTypography(template);
    const visual = getTemplateVisualProfile(template, motifColor, false, cardStyle);
    const titleStyle = wedding ? getSectionTitleStyle(wedding, visual.headingClass) : { className: visual.headingClass, style: undefined };

    const isSharp = visual.isSharp || ['editorial', 'vogue', 'urban', 'minimal'].includes(template);
    const selectedLayout = normalizeGalleryLayout(galleryLayout);
    const resolvedLayout = selectedLayout === 'auto' ? getDefaultGalleryLayout(template, masonry) : selectedLayout;
    const isBento = resolvedLayout === 'bento';
    const layoutClasses = isBento ? BENTO_PRESETS.gallery : Array(validGallery.length).fill('');
    const itemRadiusClass = isSharp ? 'rounded-none' : 'rounded-2xl';
    const showIndexNumber = isSharp || visual.ornament === 'film';

    const renderGalleryItem = (img: string, i: number, modeClass = '') => (
        <motion.button
            key={`${img}-${i}`}
            type="button"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.5 }}
            className={`group cursor-pointer overflow-hidden text-left transition-transform duration-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current ${itemRadiusClass} ${modeClass}`}
            onClick={() => setLightboxIndex(i)}
            aria-label={`Open wedding gallery image ${i + 1}`}
        >
            <div className={`relative w-full overflow-hidden ${itemRadiusClass} ${
                resolvedLayout === 'horizontal'
                    ? 'aspect-[4/5] min-h-[20rem]'
                    : resolvedLayout === 'vertical'
                        ? 'aspect-[4/5] min-h-[20rem] sm:aspect-[16/10]'
                        : isBento
                            ? 'aspect-[4/5] sm:min-h-[22rem] md:aspect-auto md:h-full md:min-h-[16rem] lg:min-h-[18rem]'
                            : 'aspect-[4/5] sm:min-h-[18rem]'
            }`}>
                <GalleryImage
                    src={img}
                    alt={`Wedding gallery image ${i + 1}`}
                    className="group-hover:scale-[1.03]"
                />
                {showIndexNumber && (
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-3 left-3 bg-black/55 px-2 py-0.5 font-mono text-[10px] tracking-[0.2em] text-white/90 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100"
                    >
                        {String(i + 1).padStart(2, '0')}
                    </span>
                )}
            </div>
        </motion.button>
    );

    return (
        <>
            <section data-wedding-section="GallerySection" id={id} className={`py-20 sm:py-28 ${visual.sectionClass}`} style={visual.sectionStyle}>
                <div className={visual.containerClass}>
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{ duration: 0.8 }}
                        className="mb-12 text-center sm:mb-16"
                    >
                        <div className="mb-4 flex items-center justify-center">
                            <span data-wedding-badge="true" className={visual.badgeStyleClass || `text-[11px] uppercase font-medium block ${visual.eyebrowClass}`}>
                                {visual.badgePrefix ? `${visual.badgePrefix}Gallery` : 'Moments Captured'}
                            </span>
                        </div>
                        <h2 className={`text-4xl sm:text-5xl md:text-6xl ${typography.heading} ${titleStyle.className}`} style={titleStyle.style}>
                            {visual.galleryTitle}
                        </h2>
                        <div data-wedding-divider="true" className={`mx-auto mt-6 ${visual.dividerClass}`} />
                        <p className={`mt-5 text-xs tracking-wide ${visual.bodyClass}`}>
                            {validGallery.length === 1 ? 'Select the photo to view it' : `Explore ${validGallery.length} photos`}
                        </p>
                    </motion.div>

                    {resolvedLayout === 'horizontal' ? (
                        <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto overscroll-x-contain px-4 pb-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
                            {validGallery.map((img: string, i: number) => renderGalleryItem(
                                img,
                                i,
                                'w-[78vw] max-w-[22rem] shrink-0 snap-center sm:w-[42vw] md:w-[min(34vw,26rem)]'
                            ))}
                        </div>
                    ) : resolvedLayout === 'vertical' ? (
                        <div className="mx-auto max-w-4xl space-y-5 sm:space-y-7">
                            {validGallery.map((img: string, i: number) => renderGalleryItem(img, i, 'w-full'))}
                        </div>
                    ) : (
                        <div className={`grid grid-cols-2 gap-3 sm:gap-6 ${
                            isBento ? 'md:grid-cols-4 md:auto-rows-[16rem] lg:auto-rows-[18rem]' : 'lg:grid-cols-3'
                        }`}>
                            {validGallery.map((img: string, i: number) => renderGalleryItem(
                                img,
                                i,
                                `${isBento ? 'md:h-full' : ''} ${layoutClasses[i % layoutClasses.length]}`
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <AnimatePresence>
                {lightboxIndex !== null && (
                    <Lightbox key="gallery-lightbox" images={validGallery} index={lightboxIndex} onClose={handleCloseLightbox} />
                )}
            </AnimatePresence>
        </>
    );
}

export function MinimalGallery({ gallery }: { gallery: string[] }) {
    if (gallery.length === 0) return null;
    return (
        <section className="py-24 border-y border-black/5 overflow-hidden">
            <div className="flex gap-12 px-6 animate-marquee whitespace-nowrap">
                {gallery.concat(gallery).map((img: string, i: number) => (
                    <div key={i} className="relative w-[400px] h-[300px] shrink-0 overflow-hidden">
                        <GalleryImage src={img} alt={`Wedding gallery image ${i + 1}`} />
                    </div>
                ))}
            </div>
        </section>
    );
}
