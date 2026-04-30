'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Heart, Sparkles, X } from 'lucide-react';

import { TEMPLATES } from '@/lib/template-catalog';

export default function ExamplesSection({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] overflow-y-auto bg-black/65 px-4 py-6 backdrop-blur-md sm:px-6 sm:py-10"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="relative mb-8 flex flex-col items-center gap-4 rounded-[1.5rem] border border-white/10 bg-white/10 px-5 py-6 text-center shadow-2xl shadow-black/20 backdrop-blur-xl sm:mb-10 sm:rounded-[2rem] sm:px-8 sm:py-8 md:flex-row md:items-center md:justify-between md:text-left">
                            <div className="max-w-3xl">
                                <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/70 sm:text-xs sm:tracking-[0.28em]">
                                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                                    Templates
                                </span>
                                <h2 className="text-3xl font-serif font-bold leading-tight text-white sm:text-5xl">
                                    Inspiration <span className="text-primary">Gallery</span>
                                </h2>
                                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/65 sm:text-base md:mx-0">
                                    Browse the real QuickWeds template library, then open any design directly in the builder.
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-black sm:h-12 sm:w-12 md:static md:shrink-0"
                                aria-label="Close inspiration gallery"
                            >
                                <X className="h-5 w-5 sm:h-6 sm:w-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {TEMPLATES.map((template, index) => (
                                <motion.article
                                    key={template.id}
                                    initial={{ opacity: 0, y: 18 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.12 }}
                                    transition={{ delay: Math.min(index * 0.025, 0.2), duration: 0.45 }}
                                    className="group relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#171313] p-3 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-white/25 sm:rounded-[1.75rem]"
                                >
                                    <div
                                        className="absolute inset-0 opacity-90 transition-transform duration-700 group-hover:scale-105"
                                        style={{ backgroundImage: template.previewGradient }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-white/20" />

                                    <div className="relative overflow-hidden rounded-[1rem] border border-white/20 bg-white/20 sm:rounded-[1.35rem]">
                                        <div className="relative aspect-[4/5] overflow-hidden">
                                            {template.image ? (
                                                <Image
                                                    src={template.image}
                                                    alt={`${template.name} template preview`}
                                                    fill
                                                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full flex-col justify-between p-5">
                                                    <div className="flex items-center justify-between rounded-full border border-white/45 bg-white/35 px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/85 backdrop-blur-sm">
                                                        <span>{template.eyebrow}</span>
                                                        <Heart className="h-3.5 w-3.5" />
                                                    </div>
                                                    <div className="max-w-[85%] text-white drop-shadow-[0_14px_28px_rgba(0,0,0,0.3)]">
                                                        <Image src="/logo.png" alt="QuickWeds" width={120} height={42} className="h-5 w-auto brightness-0 invert" />
                                                        <h3 className="mt-4 font-serif text-3xl leading-none">{template.name}</h3>
                                                        <p className="mt-3 text-sm leading-6 text-white/80">{template.mood}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="relative p-4 text-white sm:p-5">
                                        <div className="mb-4 flex items-center justify-between gap-3">
                                            <span className="inline-flex min-h-[28px] items-center rounded-full border border-white/15 bg-white/10 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/65">
                                                {template.tier === 'free' ? 'Included' : 'Premium'}
                                            </span>
                                            <span className="h-4 w-4 rounded-full shadow-[0_0_0_4px_rgba(255,255,255,0.12)]" style={{ backgroundColor: template.accent }} />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">{template.eyebrow}</p>
                                        <h3 className="mt-2 font-serif text-2xl font-bold leading-tight">{template.name}</h3>
                                        <p className="mt-2 line-clamp-2 min-h-[48px] text-sm leading-6 text-white/58">{template.desc}</p>
                                        <p className="mt-3 flex gap-2 text-xs font-semibold leading-5 text-white/50">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-primary" />
                                            {template.mood}
                                        </p>
                                        <Link
                                            href={`/builder?template=${template.id}`}
                                            onClick={onClose}
                                            className="mt-5 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-primary hover:text-white"
                                        >
                                            Open Template
                                            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                                        </Link>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
