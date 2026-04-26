'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { LANDING_TEMPLATE_IDS, TEMPLATES } from '@/lib/template-catalog';

const CURATED_TEMPLATES = LANDING_TEMPLATE_IDS
    .map((id) => TEMPLATES.find((template) => template.id === id))
    .filter((template): template is (typeof TEMPLATES)[number] => Boolean(template));

export default function TemplatesSection() {
    return (
        <section className="relative overflow-hidden bg-[linear-gradient(180deg,#fffdf9_0%,#fff6f1_48%,#fbefe8_100%)] py-24">
            <div className="absolute inset-0 opacity-70">
                <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-6">
                <div className="mx-auto mb-16 max-w-3xl text-center">
                    <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.32em] text-primary shadow-sm backdrop-blur-sm">
                        <Sparkles className="h-3.5 w-3.5" />
                        Designer Template Library
                    </span>
                    <h2 className="text-4xl font-serif font-bold tracking-tight text-foreground md:text-6xl">
                        Choose a visual language that feels
                        <span className="italic text-primary"> worthy of the day</span>
                    </h2>
                    <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
                        Every template now leans more editorial, more tactile, and more premium. Start with a direction,
                        then personalize the colors, fonts, media, and story until it feels unmistakably yours.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                    {CURATED_TEMPLATES.map((template, index) => (
                        <motion.article
                            key={template.id}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ delay: index * 0.06, duration: 0.7 }}
                            className="group relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/65 p-4 shadow-[0_24px_80px_rgba(58,42,45,0.08)] backdrop-blur-sm"
                        >
                            <div
                                className="absolute inset-0 opacity-90 transition-transform duration-700 group-hover:scale-105"
                                style={{ backgroundImage: template.previewGradient }}
                            />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.65),transparent_35%)]" />

                            <div className="relative z-10 rounded-[1.7rem] border border-white/60 bg-white/35 p-5 backdrop-blur-sm">
                                <div className="mb-5 flex items-start justify-between gap-4">
                                    <div>
                                        <span className="inline-flex rounded-full border border-white/80 bg-white/75 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-foreground/55">
                                            {template.eyebrow}
                                        </span>
                                        <div className="mt-3 flex items-center gap-2">
                                            <div
                                                className="h-2.5 w-2.5 rounded-full shadow-[0_0_0_5px_rgba(255,255,255,0.45)]"
                                                style={{ backgroundColor: template.accent }}
                                            />
                                            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/45">
                                                {template.tier === 'free' ? 'Included' : 'Premium'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/80 text-primary shadow-sm">
                                        <Heart className="h-4 w-4" />
                                    </div>
                                </div>

                                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-white/60 bg-black/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                                    {template.image ? (
                                        <img
                                            src={template.image}
                                            alt={template.name}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                                        />
                                    ) : (
                                        <div className="relative flex h-full w-full items-end overflow-hidden p-6">
                                            <div className="absolute inset-x-4 top-4 flex items-center justify-between rounded-full border border-white/45 bg-white/35 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-white/85 backdrop-blur-sm">
                                                <span>{template.eyebrow}</span>
                                                <span>{template.name.split(' ')[0]}</span>
                                            </div>
                                            <div className="relative z-10 max-w-[75%] text-white drop-shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
                                                <img src="/logo.png" alt="QuickWeds" className="h-3 w-auto grayscale invert brightness-200 opacity-80" />
                                                <h3 className="mt-3 font-serif text-3xl leading-none">{template.name}</h3>
                                                <p className="mt-4 text-sm leading-relaxed text-white/80">{template.mood}</p>
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 space-y-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-2xl font-serif text-foreground">{template.name}</h3>
                                            <p className="mt-1 text-sm text-foreground/55">{template.desc}</p>
                                        </div>
                                        <span className="rounded-full border border-white/75 bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-foreground/45">
                                            {template.mood}
                                        </span>
                                    </div>

                                    <Link
                                        href={`/builder?template=${template.id}`}
                                        className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.24em] text-foreground transition-colors hover:text-primary"
                                    >
                                        Open This Template
                                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
