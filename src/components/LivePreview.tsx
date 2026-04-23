'use client';

import { Calendar, Heart, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

import DecorativeLayer from './DecorativeLayer';
import { getTemplateMeta } from '@/lib/template-catalog';

const FONT_CLASS_MAP: Record<string, string> = {
    Elegant: 'font-serif',
    Classic: 'font-classic',
    Modern: 'font-modern',
    Romantic: 'font-cursive',
    Traditional: 'font-elegant',
    Renaissance: 'font-eb',
    Luxe: 'font-bodoni',
    Poetic: 'font-prata',
    Storyteller: 'font-lora',
    Academic: 'font-cardo',
    Editorial: 'font-libre',
    Deco: 'font-marcellus',
    Ancient: 'font-forum',
    Fairytale: 'font-alice',
    Artistic: 'font-spectral',
    Nature: 'font-fauna',
    Chic: 'font-tenor',
    Clean: 'font-questrial',
    Bold: 'font-syne',
    Calligraphy: 'font-alex',
    SoftScript: 'font-allura',
    Whimsy: 'font-arizonia',
    Handwritten: 'font-dancing',
    Italian: 'font-italianno',
    PremiumScript: 'font-pinyon',
    MinimalScript: 'font-sacramento',
    Ornate: 'font-tangerine',
    Paris: 'font-parisienne',
    Abril: 'font-abril',
    Upright: 'font-cormorant-upright',
    Vintage: 'font-old-standard',
    Josefin: 'font-josefin',
    Caslon: 'font-caslon',
    Quattro: 'font-quattrocento',
    Saint: 'font-mrs-saint',
    Monsieur: 'font-monsieur',
    Handmade: 'font-homemade',
    Mueller: 'font-herr',
    Lavish: 'font-lavishly',
    RoyalSC: 'font-cormorant-sc',
    ModernGrotesk: 'font-space',
    VogueEdit: 'font-bodoni',
    Estate: 'font-fraunces',
};

const BACKGROUND_COLOR_MAP: Record<string, string> = {
    white: '#FFFFFF',
    cream: '#FFF8F4',
    satin: '#FDF5E6',
    paper: '#F4F1EA',
    minimal: '#F9F9F9',
    rose: '#FFF5F5',
    linen: '#FAF9F6',
};

export default function LivePreview({ formData, previews }: { formData: any; previews: any }) {
    const headingFont = FONT_CLASS_MAP[formData.fontStyle] || 'font-serif';
    const logoFont = FONT_CLASS_MAP[formData.logoFont] || 'font-serif';
    const primaryColor = formData.motifColor || '#C08081';
    const templateMeta = getTemplateMeta(formData.template);

    const bride = formData.brideName || 'Isabella';
    const groom = formData.groomName || 'Julian';
    const date = formData.weddingDate
        ? new Date(formData.weddingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : 'October 24, 2026';
    const venue = formData.venueName || 'The Grand Conservatory';
    const bgColor = BACKGROUND_COLOR_MAP[formData.backgroundStyle] || '#FFFFFF';

    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.85),rgba(255,248,244,0.72))] p-4 shadow-[0_30px_90px_rgba(58,42,45,0.12)] backdrop-blur-sm">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="absolute -left-12 top-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -right-12 bottom-8 h-32 w-32 rounded-full bg-accent/10 blur-3xl" />

            <div className="mb-4 flex items-center justify-between px-1">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary/60">Live Preview</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{templateMeta.name}</p>
                </div>
                <span className="rounded-full border border-primary/15 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-primary shadow-sm">
                    {templateMeta.eyebrow}
                </span>
            </div>

            <div className="relative mx-auto h-[640px] w-full max-w-[360px] overflow-hidden rounded-[2.6rem] border-[10px] border-[#171717] bg-[#111111] shadow-[0_35px_80px_rgba(0,0,0,0.35)]">
                <div className="absolute left-1/2 top-0 z-30 h-7 w-36 -translate-x-1/2 rounded-b-[1.4rem] bg-black" />
                <div className="absolute inset-[3px] overflow-hidden rounded-[2.1rem]" style={{ backgroundColor: bgColor }}>
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: templateMeta.previewGradient,
                        }}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.38),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.7))]" />

                    {formData.accentStyle && formData.accentStyle !== 'none' && (
                        <>
                            <DecorativeLayer type={formData.accentStyle} color={primaryColor} position="top-right" className="absolute -right-6 top-14 z-10 origin-top-right scale-[0.38] opacity-40 mix-blend-multiply pointer-events-none" />
                            <DecorativeLayer type={formData.accentStyle} color={primaryColor} position="bottom-left" className="absolute -left-6 bottom-14 z-10 origin-bottom-left scale-[0.34] opacity-30 mix-blend-multiply pointer-events-none" />
                        </>
                    )}

                    <div className="relative z-20 flex h-full flex-col">
                        <div className="flex items-center justify-between px-6 pb-4 pt-5 text-[9px] font-bold uppercase tracking-[0.3em] text-foreground/45">
                            <span>QuickWeds</span>
                            <span>{templateMeta.tier === 'free' ? 'Included' : 'Premium'}</span>
                        </div>

                        <div className="mx-5 overflow-hidden rounded-[1.9rem] border border-white/50 bg-white/18 shadow-[0_24px_45px_rgba(58,42,45,0.12)] backdrop-blur-[18px]">
                            <div className="relative h-[260px] overflow-hidden">
                                {previews.heroImage ? (
                                    <img src={previews.heroImage} alt="Hero preview" className="h-full w-full object-cover" />
                                ) : (
                                    <div
                                        className="h-full w-full"
                                        style={{
                                            backgroundImage: templateMeta.previewGradient,
                                        }}
                                    />
                                )}

                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,14,14,0.08),rgba(14,14,14,0.45))]" />

                                {formData.logoShape !== 'none' && (
                                    <div
                                        className={`absolute left-1/2 top-5 flex h-16 w-16 -translate-x-1/2 items-center justify-center text-xl leading-none shadow-lg ${
                                            formData.logoShape === 'circle'
                                                ? 'rounded-full border border-white/35 bg-white/15 backdrop-blur-md'
                                                : formData.logoShape === 'square'
                                                    ? 'rounded-[1.25rem] border border-white/35 bg-white/15 backdrop-blur-md'
                                                    : 'bg-transparent'
                                        }`}
                                        style={{ color: formData.logoColor || primaryColor }}
                                    >
                                        <span className={logoFont}>{formData.logoInitials || `${bride[0]}${groom[0]}`}</span>
                                    </div>
                                )}

                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <p className="text-[10px] uppercase tracking-[0.34em] text-white/70">Save the date</p>
                                    <h2 className={`mt-4 text-[2.4rem] leading-[0.88] ${headingFont}`}>
                                        {bride}
                                        <span className="block text-xl italic text-white/80">&amp;</span>
                                        {groom}
                                    </h2>
                                    <div className="mt-4 h-px w-16 bg-white/50" />
                                </div>
                            </div>

                            <div className="space-y-5 px-6 py-6 text-center">
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                    <span className="inline-flex rounded-full border border-primary/15 bg-white/80 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.28em] text-foreground/50">
                                        {templateMeta.mood}
                                    </span>
                                </motion.div>

                                {formData.quote && (
                                    <p className="text-sm italic leading-relaxed text-foreground/65">&ldquo;{formData.quote}&rdquo;</p>
                                )}

                                <div className="grid grid-cols-1 gap-3 text-left text-xs text-foreground/72">
                                    <div className="flex items-center gap-3 rounded-2xl border border-white/55 bg-white/65 px-4 py-3 backdrop-blur-sm">
                                        <Calendar className="h-4 w-4 shrink-0" style={{ color: primaryColor }} />
                                        <span>{date}</span>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-2xl border border-white/55 bg-white/65 px-4 py-3 backdrop-blur-sm">
                                        <MapPin className="h-4 w-4 shrink-0" style={{ color: primaryColor }} />
                                        <span className="line-clamp-1">{venue}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 pt-1">
                                    {[0, 1, 2].map((slot) => (
                                        <div
                                            key={slot}
                                            className="h-16 rounded-[1.2rem] border border-white/50 bg-white/55 backdrop-blur-sm"
                                            style={{
                                                boxShadow: slot === 1 ? `inset 0 0 0 1px ${primaryColor}25` : undefined,
                                            }}
                                        />
                                    ))}
                                </div>

                                <button
                                    className="mt-2 w-full rounded-full px-6 py-3 text-[11px] font-bold uppercase tracking-[0.28em] text-white shadow-[0_14px_30px_rgba(0,0,0,0.16)] transition-transform hover:scale-[1.01]"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    RSVP Now
                                </button>
                            </div>
                        </div>

                        <div className="mt-auto px-6 pb-5 pt-4">
                            <div className="flex items-center justify-between rounded-full border border-white/45 bg-white/55 px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-foreground/40 backdrop-blur-sm">
                                <span>{templateMeta.name}</span>
                                <Heart className="h-3.5 w-3.5" style={{ color: primaryColor }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
