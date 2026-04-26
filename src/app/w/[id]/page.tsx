'use client';

import { Suspense, useEffect, useState, use, type CSSProperties } from 'react';
import { notFound } from 'next/navigation';
import { Heart } from 'lucide-react';
import DecorativeLayer from '@/components/DecorativeLayer';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
    HeroEnhancer,
    PremiumBackgroundLayer,
    EntranceReveal,
    VoiceGreeting,
    TemplateNavigation,
} from '@/components/wedding';
import {
    ClassicTemplate,
    MinimalTemplate,
    VintageTemplate,
    EditorialTemplate,
    RoyalTemplate,
    WhimsicalTemplate,
    UrbanTemplate,
    TropicalTemplate,
    MidnightTemplate,
    SakuraTemplate,
    VogueTemplate,
    RusticTemplate,
    FilmTemplate,
    GlitchTemplate,
    GardenTemplate,
    RomanticTemplate,
    LuxuryTemplate,
    ElopementTemplate,
    TraditionalTemplate,
    TimelineTemplate,
    RSVPFocusTemplate,
    CinematicTemplate,
    EleganceTemplate,
    ArtDecoTemplate,
    BohoTemplate
} from '@/components/templates';
import type { Wedding } from '@/types/wedding';
import { trackWeddingEvent } from '@/lib/wedding-features';

function safeParseArray<T>(value: unknown): T[] {
    if (Array.isArray(value)) return value as T[];
    if (typeof value !== 'string') return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed as T[] : [];
    } catch {
        return [];
    }
}

type ThemeFontVars = Record<'--font-serif' | '--font-sans', string>;
type WeddingPageStyle = CSSProperties & Record<'--primary', string> & ThemeFontVars;

export default function WeddingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [wedding, setWedding] = useState<Wedding | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data, error } = await supabase
                    .from('weddings')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    console.error("Supabase error:", error);
                    setWedding(null);
                } else {
                    setWedding(data);
                }
            } catch (err) {
                console.error(err);
                setWedding(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        if (!id || typeof window === 'undefined') return;

        const visitKey = `quickweds_visit_${id}`;
        if (window.sessionStorage.getItem(visitKey)) return;

        window.sessionStorage.setItem(visitKey, '1');

        const params = new URLSearchParams(window.location.search);
        const source = params.get('src') || 'direct';
        const eventType = source === 'qr' ? 'qr_scan' : 'visit';

        void trackWeddingEvent(id, 'visit', { source });
        if (eventType === 'qr_scan') {
            void trackWeddingEvent(id, 'qr_scan', { source });
        }
    }, [id]);

    if (loading) return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#120f10]">
            <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex flex-col items-center gap-5"
            >
                <div className="h-14 w-14 rounded-full border border-white/10 flex items-center justify-center bg-white/5 p-3">
                    <img src="/logo.png" alt="Loading" className="h-full w-full object-contain grayscale invert opacity-70" />
                </div>
                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/40">
                    Preparing Experience
                </p>
            </motion.div>
        </div>
    );

    if (!wedding) {
        notFound();
    }

    const isExpired = new Date(wedding.rsvp_deadline) < new Date();
    const gallery = safeParseArray<string>(wedding.gallery_images);
    const template = wedding.template || 'classic';

    const getTemplateContent = () => {
        const props = { wedding, gallery, isExpired };
        switch (template) {
            case 'minimal': return <MinimalTemplate {...props} />;
            case 'vintage': return <VintageTemplate {...props} />;
            case 'artdeco': return <ArtDecoTemplate {...props} />;
            case 'boho': return <BohoTemplate {...props} />;
            case 'editorial': return <EditorialTemplate {...props} />;
            case 'royal': return <RoyalTemplate {...props} />;
            case 'whimsical': return <WhimsicalTemplate {...props} />;
            case 'urban': return <UrbanTemplate {...props} />;
            case 'tropical': return <TropicalTemplate {...props} />;
            case 'midnight': return <MidnightTemplate {...props} />;
            case 'sakura': return <SakuraTemplate {...props} />;
            case 'vogue': return <VogueTemplate {...props} />;
            case 'rustic': return <RusticTemplate {...props} />;
            case 'film': return <FilmTemplate {...props} />;
            case 'glitch': return <GlitchTemplate {...props} />;
            case 'garden': return <GardenTemplate {...props} />;
            case 'romantic': return <RomanticTemplate {...props} />;
            case 'luxury': return <LuxuryTemplate {...props} />;
            case 'elopement': return <ElopementTemplate {...props} />;
            case 'traditional': return <TraditionalTemplate {...props} />;
            case 'timeline': return <TimelineTemplate {...props} />;
            case 'rsvpfocus': return <RSVPFocusTemplate {...props} />;
            case 'cinematic': return <CinematicTemplate {...props} />;
            case 'elegance': return <EleganceTemplate {...props} />;
            default: return <ClassicTemplate {...props} />;
        }
    };

    const getFontVariables = (style: string): ThemeFontVars => {
        switch (style) {
            case 'Elegant': return { '--font-serif': 'var(--font-playfair)', '--font-sans': 'var(--font-inter)' };
            case 'Classic': return { '--font-serif': 'var(--font-cinzel)', '--font-sans': 'var(--font-cormorant)' };
            case 'Modern': return { '--font-serif': 'var(--font-montserrat)', '--font-sans': 'var(--font-inter)' };
            case 'Romantic': return { '--font-serif': 'var(--font-script)', '--font-sans': 'var(--font-playfair)' };
            case 'Traditional': return { '--font-serif': 'var(--font-cormorant)', '--font-sans': 'var(--font-inter)' };
            case 'Renaissance': return { '--font-serif': 'var(--font-eb)', '--font-sans': 'var(--font-cormorant)' };
            case 'Luxe': return { '--font-serif': 'var(--font-bodoni)', '--font-sans': 'var(--font-inter)' };
            case 'Poetic': return { '--font-serif': 'var(--font-prata)', '--font-sans': 'var(--font-lora)' };
            case 'Storyteller': return { '--font-serif': 'var(--font-lora)', '--font-sans': 'var(--font-inter)' };
            case 'Academic': return { '--font-serif': 'var(--font-cardo)', '--font-sans': 'var(--font-eb)' };
            case 'Editorial': return { '--font-serif': 'var(--font-libre)', '--font-sans': 'var(--font-inter)' };
            case 'Deco': return { '--font-serif': 'var(--font-marcellus)', '--font-sans': 'var(--font-montserrat)' };
            case 'Ancient': return { '--font-serif': 'var(--font-forum)', '--font-sans': 'var(--font-cardo)' };
            case 'Fairytale': return { '--font-serif': 'var(--font-alice)', '--font-sans': 'var(--font-montserrat)' };
            case 'Artistic': return { '--font-serif': 'var(--font-spectral)', '--font-sans': 'var(--font-syne)' };
            case 'Nature': return { '--font-serif': 'var(--font-fauna)', '--font-sans': 'var(--font-lora)' };
            case 'Chic': return { '--font-serif': 'var(--font-tenor)', '--font-sans': 'var(--font-lora)' };
            case 'Clean': return { '--font-serif': 'var(--font-questrial)', '--font-sans': 'var(--font-inter)' };
            case 'Bold': return { '--font-serif': 'var(--font-syne)', '--font-sans': 'var(--font-inter)' };
            case 'Calligraphy': return { '--font-serif': 'var(--font-alex)', '--font-sans': 'var(--font-playfair)' };
            case 'SoftScript': return { '--font-serif': 'var(--font-allura)', '--font-sans': 'var(--font-eb)' };
            case 'Whimsy': return { '--font-serif': 'var(--font-arizonia)', '--font-sans': 'var(--font-inter)' };
            case 'Handwritten': return { '--font-serif': 'var(--font-dancing)', '--font-sans': 'var(--font-montserrat)' };
            case 'Italian': return { '--font-serif': 'var(--font-italianno)', '--font-sans': 'var(--font-cinzel)' };
            case 'PremiumScript': return { '--font-serif': 'var(--font-pinyon)', '--font-sans': 'var(--font-playfair)' };
            case 'MinimalScript': return { '--font-serif': 'var(--font-sacramento)', '--font-sans': 'var(--font-inter)' };
            case 'Ornate': return { '--font-serif': 'var(--font-tangerine)', '--font-sans': 'var(--font-cormorant)' };
            case 'Paris': return { '--font-serif': 'var(--font-parisienne)', '--font-sans': 'var(--font-montserrat)' };
            case 'Abril': return { '--font-serif': 'var(--font-abril)', '--font-sans': 'var(--font-inter)' };
            case 'Upright': return { '--font-serif': 'var(--font-cormorant-upright)', '--font-sans': 'var(--font-lora)' };
            case 'Vintage': return { '--font-serif': 'var(--font-old-standard)', '--font-sans': 'var(--font-eb-garamond)' };
            case 'Josefin': return { '--font-serif': 'var(--font-playfair)', '--font-sans': 'var(--font-josefin)' };
            case 'Caslon': return { '--font-serif': 'var(--font-caslon)', '--font-sans': 'var(--font-inter)' };
            case 'Quattro': return { '--font-serif': 'var(--font-quattrocento)', '--font-sans': 'var(--font-lora)' };
            case 'Saint': return { '--font-serif': 'var(--font-mrs-saint)', '--font-sans': 'var(--font-playfair)' };
            case 'Monsieur': return { '--font-serif': 'var(--font-monsieur)', '--font-sans': 'var(--font-eb-garamond)' };
            case 'Handmade': return { '--font-serif': 'var(--font-homemade)', '--font-sans': 'var(--font-inter)' };
            case 'Mueller': return { '--font-serif': 'var(--font-herr)', '--font-sans': 'var(--font-playfair)' };
            case 'Lavish': return { '--font-serif': 'var(--font-lavishly)', '--font-sans': 'var(--font-outfit)' };
            case 'RoyalSC': return { '--font-serif': 'var(--font-cormorant-sc)', '--font-sans': 'var(--font-montserrat)' };
            case 'ModernGrotesk': return { '--font-serif': 'var(--font-fraunces)', '--font-sans': 'var(--font-space)' };
            case 'VogueEdit': return { '--font-serif': 'var(--font-bodoni)', '--font-sans': 'var(--font-outfit)' };
            case 'Estate': return { '--font-serif': 'var(--font-fraunces)', '--font-sans': 'var(--font-inter)' };
            default: return { '--font-serif': 'var(--font-playfair)', '--font-sans': 'var(--font-inter)' };
        }
    };

    const fontVars = getFontVariables(wedding.font_style);
    const pageStyle: WeddingPageStyle = {
        '--primary': wedding.motif_color,
        backgroundColor: '#FFF8F4',
        backgroundImage: 'radial-gradient(circle at top, rgba(255,255,255,0.65), transparent 32%), linear-gradient(180deg, #fffaf6 0%, #fff5ef 52%, #f8ece7 100%)',
        ...fontVars,
    };

    return (
        <div
            className={`min-h-screen relative selection-dynamic template-${template} overflow-x-hidden`}
            style={pageStyle}
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-40 bg-gradient-to-b from-white/70 to-transparent" />
            <div className="pointer-events-none absolute inset-0 z-0 opacity-80">
                <div className="absolute left-[8%] top-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-32 right-[8%] h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
            </div>
            <div className="pointer-events-none fixed inset-x-6 top-6 bottom-6 z-[1] hidden rounded-[2.5rem] border border-white/35 opacity-50 md:block" />
            <div className="noise-overlay" />
            <div className="paper-texture" />

            <EntranceReveal 
                weddingId={wedding.id}
                initials={wedding.logo_initials || (`${wedding.bride_name[0]}${wedding.groom_name[0]}`)} 
                motifColor={wedding.motif_color}
                coupleNames={`${wedding.bride_name} & ${wedding.groom_name}`}
                weddingDate={wedding.wedding_date}
                venueName={wedding.venue_name}
                heroImage={wedding.hero_image || wedding.couple_photo}
                template={template}
            />

            <PremiumBackgroundLayer wedding={wedding} />

            {wedding.voice_greeting_url && (
                <VoiceGreeting audioUrl={wedding.voice_greeting_url} motifColor={wedding.motif_color} />
            )}

            {wedding.accent_style && wedding.accent_style !== 'none' && (
                <>
                    <DecorativeLayer type={wedding.accent_style} color={wedding.motif_color} position="top-right" className="fixed top-12 right-0 w-64 h-64 opacity-20 pointer-events-none z-50" />
                    <DecorativeLayer type={wedding.accent_style} color={wedding.motif_color} position="bottom-left" className="fixed bottom-0 left-0 w-64 h-64 opacity-20 pointer-events-none z-30 rotate-180" />
                </>
            )}

            {!wedding.is_thank_you_mode && <HeroEnhancer wedding={wedding} />}

            <Suspense fallback={<div className="h-screen flex items-center justify-center font-serif italic text-primary">Refining layout...</div>}>
                {getTemplateContent()}
            </Suspense>

            <TemplateNavigation wedding={wedding} />

            <footer className="relative z-10 px-6 py-14 md:py-24">
                <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/45 bg-white/45 px-8 py-12 text-center shadow-[0_24px_80px_rgba(58,42,45,0.10)] backdrop-blur-xl">
                    {wedding.logo_initials ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="mb-10"
                        >
                            <div
                                className={`mx-auto flex h-20 w-20 items-center justify-center transition-all md:h-28 md:w-28 ${
                                    wedding.logo_shape === 'circle'
                                        ? 'rounded-full'
                                        : wedding.logo_shape === 'square'
                                            ? 'rounded-[2rem]'
                                            : ''
                                } ${wedding.logo_shape !== 'minimal' ? 'border-2 bg-white/60 shadow-xl shadow-primary/10 backdrop-blur-sm' : ''}`}
                                style={{
                                    color: wedding.logo_color || wedding.motif_color,
                                    borderColor: wedding.logo_color || wedding.motif_color,
                                }}
                            >
                                <span className="text-3xl uppercase tracking-tighter md:text-4xl" style={{ fontFamily: `var(--font-${wedding.logo_font?.toLowerCase() || 'serif'})` }}>
                                    {wedding.logo_initials}
                                </span>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="mx-auto mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Heart className="h-5 w-5 fill-primary text-primary" />
                        </div>
                    )}

                    <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary/55">With love</p>
                    <p className="mt-3 font-serif text-2xl text-[#4A4444] md:text-3xl">
                        {wedding.bride_name} &amp; {wedding.groom_name}
                    </p>
                    {wedding.hashtag && (
                        <p className="mb-5 mt-4 text-xs font-bold uppercase tracking-[0.24em] text-primary drop-shadow-sm">
                            #{wedding.hashtag}
                        </p>
                    )}
                    <div className="mx-auto mb-6 mt-6 h-px w-24 bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary/80">
                        {new Date(wedding.wedding_date).getFullYear()}
                    </p>
                    <div className="mt-8 flex flex-col items-center gap-2 opacity-30 group hover:opacity-60 transition-opacity">
                        <img src="/logo.png" alt="QuickWeds" className="h-6 w-auto grayscale contrast-125" />
                        <p className="text-[8px] uppercase tracking-[0.24em] font-black">
                            Crafting digital forever
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
