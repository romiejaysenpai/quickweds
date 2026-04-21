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
        <div className="min-h-screen flex items-center justify-center bg-neutral">
            <div className="flex flex-col items-center gap-4">
                <Heart className="w-12 h-12 text-primary animate-pulse fill-primary/20" />
                <p className="font-serif italic text-primary/60">Loading your invitation...</p>
            </div>
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
        ...fontVars,
    };

    return (
        <div
            className={`min-h-screen relative selection-dynamic template-${template} overflow-x-hidden`}
            style={pageStyle}
        >
            <div className="noise-overlay" />
            <div className="paper-texture" />

            <EntranceReveal 
                initials={wedding.logo_initials || (`${wedding.bride_name[0]}${wedding.groom_name[0]}`)} 
                motifColor={wedding.motif_color} 
                font={wedding.logo_font || 'serif'}
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

            <footer className="py-12 md:py-24 px-6 text-center border-t border-primary/10 relative z-10 bg-neutral/30 backdrop-blur-sm">
                {wedding.logo_initials && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="mb-12"
                    >
                        <div
                            className={`w-20 h-20 md:w-28 md:h-28 mx-auto flex items-center justify-center transition-all ${wedding.logo_shape === 'circle' ? 'rounded-full' :
                                wedding.logo_shape === 'square' ? 'rounded-[2rem]' : ''
                                } ${wedding.logo_shape !== 'minimal' ? 'border-2 shadow-xl shadow-primary/5 bg-white/50 backdrop-blur-sm' : ''}`}
                            style={{
                                color: wedding.logo_color || wedding.motif_color,
                                borderColor: wedding.logo_color || wedding.motif_color
                            }}
                        >
                            <span className="text-3xl md:text-4xl uppercase tracking-tighter" style={{ fontFamily: `var(--font-${wedding.logo_font?.toLowerCase() || 'serif'})` }}>
                                {wedding.logo_initials}
                            </span>
                        </div>
                    </motion.div>
                )}

                {!wedding.logo_initials && (
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Heart className="w-5 h-5 text-primary fill-primary" />
                    </div>
                )}

                <p className="font-serif text-xl md:text-2xl text-[#4A4444] mb-2">{wedding.bride_name} & {wedding.groom_name}</p>
                {wedding.hashtag && (
                    <p className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-6 drop-shadow-sm">
                        #{wedding.hashtag}
                    </p>
                )}
                <p className="text-primary font-bold tracking-[0.2em] text-[10px] uppercase mb-8">{new Date(wedding.wedding_date).getFullYear()}</p>
                <p className="text-foreground/30 text-[10px] uppercase tracking-widest">Powered by QuickWeds</p>
            </footer>
        </div>
    );
}
