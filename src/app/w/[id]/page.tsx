'use client';

import { Suspense, useEffect, useState, use } from 'react';
import { notFound } from 'next/navigation';
import { Heart, Calendar, MapPin, Clock, Shirt, Info, MessageSquare, Send, Quote, Music, Camera, Sparkles } from 'lucide-react';
import RSVPForm from '@/components/RSVPForm';
import DecorativeLayer from '@/components/DecorativeLayer';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
    CountdownTimer,
    VideoSection,
    BioSection,
    DetailsSection,
    GallerySection,
    GiftSection,
    RSVPSection,
    TimelineSection,
    GuestBook,
    WeddingPartySection,
    VenueMap,
    MinimalGallery,
} from '@/components/wedding';
import type { Wedding, WeddingPartyMember } from '@/types/wedding';

export default function WeddingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [wedding, setWedding] = useState<any>(null);
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
    const gallery = typeof wedding.gallery_images === 'string'
        ? JSON.parse(wedding.gallery_images || '[]')
        : (wedding.gallery_images || []);
    const template = wedding.template || 'classic';

    // Template Specific Styles & Layouts
    const getTemplateContent = () => {
        switch (template) {
            case 'minimal':
                return <MinimalTemplate wedding={wedding} gallery={gallery} isExpired={isExpired} />;
            case 'vintage':
                return <VintageTemplate wedding={wedding} gallery={gallery} isExpired={isExpired} />;
            case 'artdeco':
                return <ArtDecoTemplate wedding={wedding} gallery={gallery} isExpired={isExpired} />;
            case 'boho':
                return <BohoTemplate wedding={wedding} gallery={gallery} isExpired={isExpired} />;
            case 'editorial':
                return <EditorialTemplate wedding={wedding} gallery={gallery} isExpired={isExpired} />;
            case 'royal':
                return <RoyalTemplate wedding={wedding} gallery={gallery} isExpired={isExpired} />;
            case 'whimsical':
                return <WhimsicalTemplate wedding={wedding} gallery={gallery} isExpired={isExpired} />;
            case 'urban':
                return <UrbanTemplate wedding={wedding} gallery={gallery} isExpired={isExpired} />;
            case 'tropical':
                return <TropicalTemplate wedding={wedding} gallery={gallery} isExpired={isExpired} />;
            case 'midnight':
                return <MidnightTemplate wedding={wedding} gallery={gallery} isExpired={isExpired} />;
            case 'sakura':
                return <SakuraTemplate wedding={wedding} gallery={gallery} isExpired={isExpired} />;
            case 'vogue':
                return <VogueTemplate wedding={wedding} gallery={gallery} isExpired={isExpired} />;
            case 'rustic':
                return <RusticTemplate wedding={wedding} gallery={gallery} isExpired={isExpired} />;
            case 'film':
                return <FilmTemplate wedding={wedding} gallery={gallery} isExpired={isExpired} />;
            case 'glitch':
                return <GlitchTemplate wedding={wedding} gallery={gallery} isExpired={isExpired} />;
            case 'garden':
                return <GardenTemplate wedding={wedding} gallery={gallery} isExpired={isExpired} />;
            case 'romantic':
                return <RomanticTemplate wedding={wedding} gallery={gallery} isExpired={isExpired} />;
            case 'luxury':
                return <LuxuryTemplate wedding={wedding} gallery={gallery} isExpired={isExpired} />;
            case 'elopement':
                return <ElopementTemplate wedding={wedding} gallery={gallery} isExpired={isExpired} />;
            case 'traditional':
                return <TraditionalTemplate wedding={wedding} gallery={gallery} isExpired={isExpired} />;
            case 'timeline':
                return <TimelineTemplate wedding={wedding} gallery={gallery} isExpired={isExpired} />;
            case 'rsvpfocus':
                return <RSVPFocusTemplate wedding={wedding} gallery={gallery} isExpired={isExpired} />;
            case 'cinematic':
                return <CinematicTemplate wedding={wedding} gallery={gallery} isExpired={isExpired} />;
            case 'elegance':
                return <EleganceTemplate wedding={wedding} gallery={gallery} isExpired={isExpired} />;
            default:
                return <ClassicTemplate wedding={wedding} gallery={gallery} isExpired={isExpired} />;
        }
    };
    const getFontVariables = (style: string) => {
        switch (style) {
            case 'Elegant': return { '--font-serif': 'var(--font-playfair)', '--font-sans': 'var(--font-inter)' };
            case 'Classic': return { '--font-serif': 'var(--font-cinzel)', '--font-sans': 'var(--font-cormorant)' };
            case 'Modern': return { '--font-serif': 'var(--font-montserrat)', '--font-sans': 'var(--font-inter)' };
            case 'Romantic': return { '--font-serif': 'var(--font-script)', '--font-sans': 'var(--font-playfair)' };
            case 'Traditional': return { '--font-serif': 'var(--font-cormorant)', '--font-sans': 'var(--font-inter)' };
            // --- New Pairings ---
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
            // --- Scripts ---
            case 'Calligraphy': return { '--font-serif': 'var(--font-alex)', '--font-sans': 'var(--font-playfair)' };
            case 'SoftScript': return { '--font-serif': 'var(--font-allura)', '--font-sans': 'var(--font-eb)' };
            case 'Whimsy': return { '--font-serif': 'var(--font-arizonia)', '--font-sans': 'var(--font-inter)' };
            case 'Handwritten': return { '--font-serif': 'var(--font-dancing)', '--font-sans': 'var(--font-montserrat)' };
            case 'Italian': return { '--font-serif': 'var(--font-italianno)', '--font-sans': 'var(--font-cinzel)' };
            case 'PremiumScript': return { '--font-serif': 'var(--font-pinyon)', '--font-sans': 'var(--font-playfair)' };
            case 'MinimalScript': return { '--font-serif': 'var(--font-sacramento)', '--font-sans': 'var(--font-inter)' };
            case 'Ornate': return { '--font-serif': 'var(--font-tangerine)', '--font-sans': 'var(--font-cormorant)' };
            case 'Paris': return { '--font-serif': 'var(--font-parisienne)', '--font-sans': 'var(--font-montserrat)' };
            // --- Newest Additions ---
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
            // --- Newest Premium Additions ---
            case 'Lavish': return { '--font-serif': 'var(--font-lavishly)', '--font-sans': 'var(--font-outfit)' };
            case 'RoyalSC': return { '--font-serif': 'var(--font-cormorant-sc)', '--font-sans': 'var(--font-montserrat)' };
            case 'ModernGrotesk': return { '--font-serif': 'var(--font-fraunces)', '--font-sans': 'var(--font-space)' };
            case 'VogueEdit': return { '--font-serif': 'var(--font-bodoni)', '--font-sans': 'var(--font-outfit)' };
            case 'Estate': return { '--font-serif': 'var(--font-fraunces)', '--font-sans': 'var(--font-inter)' };
            default: return { '--font-serif': 'var(--font-playfair)', '--font-sans': 'var(--font-inter)' };
        }
    };

    const fontVars = getFontVariables(wedding.font_style);

    return (
        <div
            className={`min-h-screen relative selection:bg-primary/20 template-${template}`}
            style={{
                '--primary': wedding.motif_color,
                backgroundColor: '#FFF8F4',
                ...fontVars
            } as any}
        >
            <div className="noise-overlay" />
            <div className="fixed inset-0 -z-20 opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle at 20% 30%, ${wedding.motif_color}22 0%, transparent 50%), radial-gradient(circle at 80% 70%, ${wedding.motif_color}22 0%, transparent 50%)` }} />

            <Suspense fallback={<div className="h-screen flex items-center justify-center font-serif italic text-primary">Refining layout...</div>}>
                {getTemplateContent()}
            </Suspense>

            {/* Common Footer */}
            <footer className="py-12 md:py-24 px-6 text-center border-t border-primary/10">
                {/* Monogram Logo in Footer */}
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

                {/* Fallback Heart Icon */}
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

// --- TEMPLATE COMPONENTS ---

// No content here, replacing the whole old ClassicTemplate block later

// No content here

// No content here

// No content here

// No content here

function EditorialTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-white pb-24">
            <section className="min-h-screen py-12 lg:py-0 grid grid-cols-12 gap-0 relative overflow-hidden">
                <div className="col-span-1 border-r border-black/5 flex flex-col items-center justify-between py-12 h-full uppercase text-[10px] font-black tracking-[1.5em] opacity-30">
                    <p className="rotate-90 whitespace-nowrap">EXT. {new Date(wedding.wedding_date).getFullYear()}</p>
                    <p className="rotate-90 whitespace-nowrap">ISSUE NO. 01</p>
                </div>
                <div className="col-span-11 flex flex-col justify-end p-12 lg:p-32 relative overflow-hidden group">
                    <motion.img
                        initial={{ scale: 1.1, filter: 'blur(20px)' }}
                        animate={{ scale: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 1.5 }}
                        src={wedding.hero_image || wedding.couple_photo}
                        className="absolute inset-0 w-full h-full object-cover -z-10 brightness-[0.6] group-hover:scale-105 transition-transform duration-1000"
                    />
                    <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 1 }} className="text-white relative z-10 max-w-6xl">
                        {wedding.logo_initials && (
                            <div className="mb-8 p-4 border border-white/20 inline-block backdrop-blur-md bg-white/5">
                                <span className="text-4xl text-white uppercase tracking-tighter" style={{ fontFamily: `var(--font-${wedding.logo_font?.toLowerCase() || 'serif'})` }}>
                                    {wedding.logo_initials}
                                </span>
                            </div>
                        )}
                        <span className="inline-block px-4 py-1 bg-primary text-xs font-black uppercase tracking-widest mb-12">Special Invitation</span>
                        <h1 className="text-8xl md:text-[18vw] font-serif leading-[0.75] tracking-tighter mb-16 mix-blend-screen drop-shadow-2xl">
                            {wedding.bride_name.split(' ')[0]} <br />
                            & <span className="text-primary italic font-light">{wedding.groom_name.split(' ')[0]}</span>
                        </h1>
                        <div className="flex flex-col md:flex-row gap-24 items-start md:items-end w-full">
                            <div className="flex-1 border-l border-white/20 pl-12">
                                <p className="text-2xl font-serif italic leading-tight max-w-lg mb-8 opacity-80">{wedding.story || "A tale of two souls becoming one, captured in a beauty that never fades."}</p>
                                <p className="text-xs uppercase tracking-[0.5em] font-black opacity-40">Photography by QuickWeds Editorial</p>
                            </div>
                            <div className="shrink-0 flex flex-col items-end">
                                <p className="text-6xl font-serif border-b-2 border-primary pb-4 mb-12 italic">{new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}</p>
                                <a href="#rsvp" className="text-2xl font-serif italic flex items-center gap-6 hover:gap-12 transition-all">
                                    THE GUEST LIST <span className="w-12 h-[1px] bg-white" />
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <DetailsSection wedding={wedding} />
            <TimelineSection timeline={wedding.program_timeline} />
            <GallerySection gallery={gallery} />
            <GiftSection wedding={wedding} />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

function RoyalTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#121212] text-[#f2d0a4] relative overflow-hidden min-h-screen">
            <div className="fixed inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/damask-wallpaper.png')` }} />

            <section className="min-h-screen py-20 relative overflow-hidden flex items-center justify-center border-b border-primary/20">
                {wedding.teaser_video ? (
                    <video src={wedding.teaser_video} className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale contrast-125" autoPlay muted loop />
                ) : (
                    <img src={wedding.hero_image || wedding.couple_photo} className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale brightness-50" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-[#121212]" />

                <motion.div
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="z-10 text-center max-w-6xl px-8 py-24 border-[4px] border-primary/20 m-12 bg-black/40 backdrop-blur-sm relative"
                >
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#121212] rounded-full border border-primary/20 flex items-center justify-center overflow-hidden">
                        {wedding.logo_initials ? (
                            <span className="text-3xl text-primary uppercase" style={{ fontFamily: `var(--font-${wedding.logo_font?.toLowerCase() || 'serif'})` }}>{wedding.logo_initials}</span>
                        ) : (
                            <Heart className="w-12 h-12 text-primary fill-primary" />
                        )}
                    </div>

                    <span className="text-xs uppercase tracking-[1em] font-black opacity-60 mb-12 block">BY ROYAL PROCLAMATION</span>
                    <h1 className="text-7xl md:text-[8rem] font-serif border-y-2 border-primary/40 py-16 mb-16 leading-tight tracking-[0.05em] uppercase">
                        {wedding.bride_name} <br />
                        <span className="text-3xl italic normal-case block my-12 tracking-widest">and</span>
                        {wedding.groom_name}
                    </h1>
                    <p className="text-2xl font-serif italic mb-12 max-w-3xl mx-auto opacity-80">His Majesty & Her Royal Highness cordially invite you to witness the union of two royal houses</p>
                    <div className="flex gap-12 items-center justify-center mb-16">
                        <div className="w-24 h-[1px] bg-primary/40" />
                        <p className="text-sm uppercase tracking-[1em] font-black">{new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        <div className="w-24 h-[1px] bg-primary/40" />
                    </div>
                </motion.div>
            </section>

            <div className="relative z-10 scale-90 md:scale-100 origin-center bg-[#1a1a1a] shadow-[0_0_100px_rgba(0,0,0,1)] pt-24">
                <div className="text-center mb-24">
                    <h2 className="text-5xl font-serif text-primary uppercase tracking-[0.3em] mb-4">Official Bio</h2>
                    <div className="w-24 h-[1px] bg-primary mx-auto" />
                </div>
                <BioSection wedding={wedding} />
                <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
                <div className="relative z-10 bg-[#121212] pt-24"><DetailsSection wedding={wedding} invert /></div>
                <TimelineSection timeline={wedding.program_timeline} />
                <GallerySection gallery={gallery} />
                <GiftSection wedding={wedding} invert />
                <SharedNewSections wedding={wedding} isExpired={isExpired} />
            </div>
        </div>
    );
}

function WhimsicalTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#fff9fc] text-[#e3a6c1] relative overflow-hidden pb-24">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute"
                        style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
                        animate={{
                            y: [0, -100, 0],
                            x: [0, Math.random() * 50 - 25, 0],
                            rotate: [0, 180, 360],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{ duration: Math.random() * 5 + 5, repeat: Infinity }}
                    >
                        <Sparkles className="w-6 h-6 opacity-20 text-primary" />
                    </motion.div>
                ))}
            </div>

            <section className="min-h-screen py-20 flex flex-col items-center justify-center p-6 text-center relative z-10">
                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", damping: 12 }}>
                    <div className="mb-16 relative group">
                        <div className="w-64 h-64 rounded-full border-[12px] border-white shadow-2xl overflow-hidden mx-auto rotate-6 group-hover:rotate-0 transition-transform duration-700">
                            <img src={wedding.couple_photo || wedding.hero_image} className="w-full h-full object-cover scale-125" />
                        </div>
                        <div className="absolute -top-8 -right-8 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl animate-bounce">
                            <Heart className="w-8 h-8 text-primary fill-primary" />
                        </div>
                    </div>

                    <h1 className="text-7xl md:text-[12vw] font-serif leading-none tracking-tighter text-[#4A4444] mb-8 drop-shadow-[0_5px_15px_rgba(0,0,0,0.05)]">
                        Magic is <br />
                        <span className="text-primary italic">Real</span>
                    </h1>
                    <p className="text-3xl font-serif italic text-primary/60 mb-12">{wedding.bride_name.split(' ')[0]} & {wedding.groom_name.split(' ')[0]}</p>
                    <motion.a
                        whileHover={{ scale: 1.1, rotate: -2 }}
                        href="#rsvp"
                        className="px-12 py-5 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-black tracking-widest uppercase text-xs shadow-[0_10px_30px_rgba(227,166,193,0.4)]"
                    >
                        Count Me In!
                    </motion.a>
                </motion.div>
            </section>

            <section className="py-32 bg-white/40 backdrop-blur-md border-y border-primary/10">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
                    <Stars className="w-12 h-12 text-primary mx-auto opacity-30" />
                    <h2 className="text-6xl font-serif text-[#4A4444]">The Enchantment</h2>
                    <p className="text-3xl font-serif leading-relaxed text-primary italic">
                        {wedding.story || "A tale of two souls becoming one, captured in a beauty that never fades."}
                    </p>
                    <div className="flex gap-4 justify-center">
                        {[1, 2, 3].map(i => <div key={i} className="w-3 h-3 rounded-full bg-primary/20" />)}
                    </div>
                </div>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <DetailsSection wedding={wedding} />
            <TimelineSection timeline={wedding.program_timeline} />
            <GallerySection gallery={gallery} />
            <GiftSection wedding={wedding} />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

// Added Stars for Whimsical
function Stars({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    );
}

function UrbanTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#111] text-white selection:bg-primary/50">
            {/* Industrial Grid Mesh */}
            <div className="fixed inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

            <section className="min-h-screen py-20 flex bg-black relative group">
                <motion.img
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.5 }}
                    src={wedding.hero_image}
                    className="absolute inset-0 w-full h-full object-cover grayscale brightness-50 group-hover:scale-105 transition-transform duration-[10s]"
                />
                <div className="z-10 p-12 lg:p-32 flex flex-col justify-between w-full relative">
                    <div className="flex justify-between items-start border-b border-white/10 pb-12">
                        <div className="space-y-2">
                            <p className="font-mono text-xs uppercase tracking-[0.5em] text-primary">Access Level: VIP</p>
                            <p className="font-mono text-xs uppercase tracking-widest opacity-40">Serial No. {wedding.id.slice(0, 8)}</p>
                        </div>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
                            <Heart className="w-12 h-12 text-primary" />
                        </motion.div>
                    </div>

                    <motion.div initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
                        <h1 className="text-[15vw] font-black uppercase leading-[0.75] mb-12 tracking-tighter mix-blend-difference">
                            {wedding.bride_name.split(' ')[0]}<br />
                            <span className="text-primary">+</span><br />
                            {wedding.groom_name.split(' ')[0]}
                        </h1>
                        <div className="flex flex-wrap gap-12 font-mono text-sm uppercase tracking-[0.3em] bg-black/50 backdrop-blur-md p-6 border-l-4 border-primary inline-flex">
                            <p>[ DATE: {new Date(wedding.wedding_date).toLocaleDateString()} ]</p>
                            <p>[ LOG: {wedding.venue_name} ]</p>
                        </div>
                    </motion.div>

                    <div className="flex justify-end">
                        <a href="#rsvp" className="text-primary hover:text-white transition-all text-5xl font-black uppercase tracking-tighter hover:tracking-widest duration-500">
                            ENTER EVENT →
                        </a>
                    </div>
                </div>
            </section>

            <section className="py-32 px-6 relative z-10">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-24 items-end">
                    <div className="flex-1 space-y-12">
                        <h2 className="text-8xl font-black uppercase tracking-tighter text-white/10">THE MISSION</h2>
                        <p className="text-4xl font-mono uppercase tracking-tighter leading-tight">
                            {wedding.story || "A tale of two souls becoming one, captured in the heart of the city."}
                        </p>
                    </div>
                    <div className="w-full lg:w-1/2 p-12 bg-primary/10 border border-primary/20 backdrop-blur-xl">
                        <Quote className="w-12 h-12 text-primary mb-8" />
                        <p className="text-2xl font-mono uppercase italic leading-relaxed opacity-80">
                            {wedding.quote || "Love is the ultimate disruptor."}
                        </p>
                    </div>
                </div>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <div className="p-12 lg:p-32"><DetailsSection wedding={wedding} invert /></div>
            <TimelineSection timeline={wedding.program_timeline} />
            <GallerySection gallery={gallery} />
            <GiftSection wedding={wedding} invert />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

function TropicalTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#e0f2f1] text-[#00695c] relative pb-24">
            {/* Sun Glow Overlay */}
            <div className="fixed top-0 right-0 w-[60vw] h-[60vw] bg-yellow-100/30 rounded-full blur-[120px] pointer-events-none -z-0" />

            <section className="min-h-screen py-20 flex flex-col items-center justify-center relative overflow-hidden group">
                <motion.div
                    animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute -top-20 -right-20 w-[400px] h-[400px] opacity-20 pointer-events-none"
                >
                    <svg viewBox="0 0 200 200" className="fill-current"><path d="M100 0 C120 40 160 80 200 100 C160 120 120 160 100 200 C80 160 40 120 0 100 C40 80 80 40 100 0" /></svg>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }} className="text-center z-10 px-6">
                    <div className="text-8xl mb-12 animate-float">🏝️</div>
                    <span className="text-xs uppercase tracking-[1em] font-black mb-8 block opacity-40">OUR PARADISE FOUND</span>
                    <h1 className="text-7xl md:text-[14vw] font-serif mb-12 tracking-tighter leading-[0.7] text-[#004d40]">
                        {wedding.bride_name.split(' ')[0]} <br />
                        <span className="text-4xl align-middle italic text-primary">&</span> <br />
                        {wedding.groom_name.split(' ')[0]}
                    </h1>
                    <div className="p-1 px-12 border-4 border-[#00695c] inline-block mb-16 relative group-hover:bg-[#00695c] group-hover:text-white transition-all duration-500">
                        <p className="text-4xl font-serif py-4">{new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</p>
                    </div>
                    <br />
                    <motion.a
                        whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,105,92,0.2)" }}
                        href="#rsvp"
                        className="px-20 py-6 bg-[#00695c] text-white rounded-full font-black tracking-widest uppercase text-xs"
                    >
                        Pack Your Bags
                    </motion.a>
                </motion.div>

                {/* Wave Bottom Decoration */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none opacity-20">
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-[200%] h-32 fill-[#00695c] animate-marquee"><path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" /></svg>
                </div>
            </section>

            <section className="py-32 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-24 items-center">
                    <div className="w-full md:w-1/2 relative">
                        <div className="absolute -inset-4 border-2 border-[#00695c]/20 rounded-[4rem] rotate-3 -z-10" />
                        <img src={wedding.hero_image || wedding.couple_photo} className="w-full aspect-[4/5] object-cover rounded-[3.5rem] soft-shadow" />
                    </div>
                    <div className="w-full md:w-1/2 space-y-12">
                        <Camera className="w-16 h-16 text-primary" />
                        <h2 className="text-7xl font-serif text-[#004d40] tracking-tighter">Sun, Sand & <br />Our Love</h2>
                        <p className="text-2xl font-serif leading-relaxed text-[#00695c]/80 italic border-l-4 border-primary pl-12">
                            {wedding.story || "A tale of two souls becoming one, captured in a lifetime of beautiful moments."}
                        </p>
                    </div>
                </div>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <DetailsSection wedding={wedding} />
            <TimelineSection timeline={wedding.program_timeline} />
            <GallerySection gallery={gallery} />
            <GiftSection wedding={wedding} />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

function MidnightTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#0f0f0f] text-[#cfb53b] relative overflow-hidden pb-24">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(207,181,59,0.05)_0%,transparent_70%)] pointer-events-none" />

            <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2 relative">
                <div className="flex flex-col justify-center p-12 lg:p-24 border-r border-[#cfb53b]/10 bg-gradient-to-b from-[#0f0f0f] to-[#151515]">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                        <span className="text-xs font-black tracking-[0.5em] uppercase text-[#cfb53b]/60 mb-8 block">The Celebration</span>
                        <h1 className="text-6xl lg:text-8xl font-serif text-white mb-8 leading-tight">
                            {wedding.bride_name} <br />
                            <span className="text-4xl italic text-[#cfb53b] font-light">&</span><br />
                            {wedding.groom_name}
                        </h1>
                        <p className="text-xl font-serif italic text-white/60 mb-12 max-w-md">
                            Join us for an evening of elegance, love, and starlight.
                        </p>
                        <a href="#rsvp" className="px-10 py-4 border border-[#cfb53b] text-[#cfb53b] hover:bg-[#cfb53b] hover:text-black transition-all uppercase text-xs font-black tracking-[0.2em]">RSVP Now</a>
                    </motion.div>
                </div>
                <div className="relative h-[50vh] lg:h-auto">
                    <img src={wedding.hero_image || wedding.couple_photo} className="absolute inset-0 w-full h-full object-cover grayscale brightness-75 hover:grayscale-0 transition-all duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#0f0f0f]" />
                </div>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <DetailsSection wedding={wedding} invert />
            <TimelineSection timeline={wedding.program_timeline} />
            <GallerySection gallery={gallery} />
            <GiftSection wedding={wedding} invert />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}
function SakuraTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#fff0f5] text-[#8e405a] relative">
            <div className="fixed inset-0 pointer-events-none opacity-30" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30c-2-2-5-2-7 0-.5.5-.5 1.5 0 2 2 2 5 2 7 0 .5-.5.5-1.5 0-2zm5 5c-2-2-5-2-7 0-.5.5-.5 1.5 0 2 2 2 5 2 7 0 .5-.5.5-1.5 0-2z' fill='%23ffb7c5' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")` }} />

            <section className="min-h-screen py-24 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
                <div className="w-[500px] h-[500px] bg-gradient-to-br from-pink-200/40 to-transparent rounded-full absolute -top-24 -left-24 blur-3xl animate-pulse" />
                <div className="w-[400px] h-[400px] bg-gradient-to-tl from-pink-300/30 to-transparent rounded-full absolute bottom-0 right-0 blur-3xl" />

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 bg-white/60 backdrop-blur-sm p-12 lg:p-24 rounded-[3rem] border border-white soft-shadow max-w-4xl">
                    <div className="absolute top-6 left-6 text-4xl opacity-50">🌸</div>

                    <p className="font-serif italic text-2xl text-[#8e405a]/60 mb-6">Blossoming Love</p>
                    <h1 className="text-6xl md:text-8xl font-serif text-[#8e405a] mb-8 leading-none">
                        {wedding.bride_name} <br />
                        <span className="text-3xl block my-4 font-sans font-light uppercase tracking-widest text-[#8e405a]/40">and</span>
                        {wedding.groom_name}
                    </h1>
                    <div className="inline-block border-y border-[#8e405a]/20 py-4 px-12 mb-12">
                        <p className="font-serif text-xl tracking-widest uppercase">{new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                    </div>

                    <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto mb-12">
                        <img src={wedding.couple_photo || wedding.hero_image} className="w-full h-full object-cover" />
                    </div>

                    <a href="#rsvp" className="bg-[#ffb7c5] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#ff9eb0] transition-colors shadow-lg shadow-pink-200">
                        Join Our Celebration
                    </a>
                </motion.div>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <DetailsSection wedding={wedding} />
            <TimelineSection timeline={wedding.program_timeline} />
            <GallerySection gallery={gallery} />
            <GiftSection wedding={wedding} />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

function VogueTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-white text-black font-sans selection:bg-black selection:text-white pb-24">
            <section className="min-h-screen grid grid-cols-1 md:grid-cols-2">
                <div className="relative h-[60vh] md:h-full order-2 md:order-1">
                    <img src={wedding.hero_image || wedding.couple_photo} className="absolute inset-0 w-full h-full object-cover grayscale contrast-125" />
                    <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
                </div>
                <div className="flex flex-col justify-between p-12 md:p-24 order-1 md:order-2 bg-white">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase tracking-widest border-b-2 border-black pb-1">The Edition</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Vol. 01</span>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                        <h1 className="text-7xl md:text-9xl font-serif leading-[0.85] -ml-2 mb-8 mix-blend-difference">
                            {wedding.bride_name.split(' ')[0]} <br />
                            <span className="font-sans font-light italic ml-12 text-6xl opacity-50">&</span> <br />
                            {wedding.groom_name.split(' ')[0]}
                        </h1>

                        <div className="flex gap-8 items-end mt-12">
                            <div className="flex-1 border-t border-black pt-4">
                                <p className="text-xs font-bold uppercase tracking-widest mb-2">Ceremony</p>
                                <p className="text-xl font-serif italic">{wedding.wedding_date}</p>
                            </div>
                            <a href="#rsvp" className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold uppercase tracking-widest hover:scale-110 transition-transform">
                                RSVP
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="py-32 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-24 items-center">
                    <div className="flex-1 md:text-right space-y-8">
                        <h2 className="text-5xl font-serif italic">A Modern Love Story</h2>
                        <p className="text-xl leading-relaxed font-light max-w-md ml-auto">
                            {wedding.story || "Two souls, one stylish journey. Join us as we celebrate love in its most fashionable form."}
                        </p>
                    </div>
                    <div className="w-full md:w-1/3 aspect-[3/4] relative">
                        <div className="absolute inset-0 bg-neutral -translate-x-4 translate-y-4" />
                        <img src={wedding.couple_photo} className="w-full h-full object-cover relative z-10 grayscale hover:grayscale-0 transition-all duration-700" />
                    </div>
                </div>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <DetailsSection wedding={wedding} />
            <TimelineSection timeline={wedding.program_timeline} />
            <GallerySection gallery={gallery} masonry />
            <GiftSection wedding={wedding} />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

function RusticTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#f5ebe0] text-[#5e503f] font-serif relative pb-24">
            <div className="fixed inset-0 pointer-events-none opacity-5" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/wood-pattern.png')` }} />

            <section className="min-h-screen flex items-center justify-center p-6 relative">
                <div className="absolute inset-4 border-[1px] border-[#5e503f]/20 pointer-events-none" />
                <div className="absolute inset-6 border-[1px] border-[#5e503f]/20 pointer-events-none" />

                <div className="text-center max-w-4xl z-10">
                    <div className="w-20 h-20 mx-auto mb-8 opacity-40">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                    </div>
                    <p className="text-sm uppercase tracking-[0.4em] font-bold mb-6">We're getting married</p>
                    <h1 className="text-6xl md:text-8xl mb-8 font-black text-[#8d7966] drop-shadow-sm font-handwritten">
                        {wedding.bride_name.split(' ')[0]} & {wedding.groom_name.split(' ')[0]}
                    </h1>
                    <div className="inline-flex items-center gap-6 border-y border-[#5e503f]/20 py-6 px-12 bg-white/50 backdrop-blur-sm rounded-lg shadow-sm">
                        <span className="text-2xl">{new Date(wedding.wedding_date).toLocaleDateString()}</span>
                        <span className="w-2 h-2 rounded-full bg-[#5e503f]/40" />
                        <span className="text-2xl">{wedding.venue_name}</span>
                    </div>
                    <div className="mt-12">
                        <a href="#rsvp" className="px-12 py-4 bg-[#5e503f] text-[#f5ebe0] rounded-lg font-bold tracking-widest uppercase hover:bg-[#493e31] transition-colors shadow-lg">RSVP</a>
                    </div>
                </div>
            </section>

            <section className="py-24 px-6 bg-white/60">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="aspect-square relative rotate-2 p-4 bg-white shadow-xl">
                        <img src={wedding.couple_photo || wedding.hero_image} className="w-full h-full object-cover sepia-[0.3]" />
                        <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#5e503f]/10 rounded-full blur-xl -z-10" />
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-4xl font-bold text-[#8d7966]">Our Rustic Romance</h2>
                        <p className="text-lg leading-loose opacity-80">{wedding.story}</p>
                    </div>
                </div>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <DetailsSection wedding={wedding} />
            <TimelineSection timeline={wedding.program_timeline} />
            <GallerySection gallery={gallery} />
            <GiftSection wedding={wedding} />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

function FilmTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#1a1a1a] text-[#ddd] font-mono relative pb-24">
            <div className="fixed inset-0 opacity-[0.07] pointer-events-none z-0" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/camera-iris.png')` }} />

            <section className="min-h-screen py-24 flex flex-col items-center justify-center p-6 relative">
                {/* Film Strip Borders */}
                <div className="absolute top-0 left-0 w-full h-12 bg-black border-b border-white/20 flex gap-4 overflow-hidden px-4">
                    {Array(20).fill(0).map((_, i) => <div key={i} className="w-8 h-6 bg-white/10 rounded-sm mt-3 flex-shrink-0" />)}
                </div>
                <div className="absolute bottom-0 left-0 w-full h-12 bg-black border-t border-white/20 flex gap-4 overflow-hidden px-4">
                    {Array(20).fill(0).map((_, i) => <div key={i} className="w-8 h-6 bg-white/10 rounded-sm mt-3 flex-shrink-0" />)}
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-black p-4 pb-16 pt-4 max-w-lg w-full shadow-2xl rotate-1"
                >
                    <div className="aspect-[4/5] bg-[#222] mb-4 relative overflow-hidden group">
                        <img src={wedding.hero_image || wedding.couple_photo} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 contrast-125" />
                        <div className="absolute top-4 right-4 text-[10px] text-red-500 font-bold animate-pulse">● REC</div>
                    </div>
                    <div className="text-center font-serif text-black bg-white p-8">
                        <h1 className="text-5xl font-bold mb-2 tracking-tighter">{wedding.bride_name} + {wedding.groom_name}</h1>
                        <p className="text-sm uppercase tracking-widest border-t border-black/10 pt-4 mt-4">{new Date(wedding.wedding_date).toDateString()}</p>
                    </div>
                </motion.div>

                <a href="#rsvp" className="mt-12 px-8 py-3 bg-red-600 text-white rounded-sm font-bold uppercase tracking-widest hover:bg-red-700 transition-colors">Action! (RSVP)</a>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <DetailsSection wedding={wedding} invert />
            <TimelineSection timeline={wedding.program_timeline} />
            <GiftSection wedding={wedding} invert />
            <GallerySection gallery={gallery} />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

function GlitchTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-black text-green-400 font-mono min-h-screen relative pb-24 selection:bg-green-400 selection:text-black">
            <div className="fixed inset-0 pointer-events-none opacity-20 z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

            <section className="min-h-screen flex flex-col justify-center p-6 lg:p-24 relative overflow-hidden">
                <div className="max-w-6xl z-10">
                    <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", bounce: 0 }} className="border-l-4 border-green-400 pl-8 mb-12">
                        <p className="text-sm mb-4 typing-effect w-fit">INITIALIZING UNION PROTOCOL...</p>
                        <h1 className="text-6xl md:text-9xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 mb-4 leading-none tracking-tighter filter hue-rotate-90 animate-pulse">
                            {wedding.bride_name}<br />{wedding.groom_name}
                        </h1>
                    </motion.div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12 opacity-80 text-xs">
                        <div className="border border-green-400/30 p-4">
                            <p className="opacity-50 mb-1">DATE_TIME</p>
                            <p>{wedding.wedding_date}</p>
                        </div>
                        <div className="border border-green-400/30 p-4">
                            <p className="opacity-50 mb-1">LOCATION_DATA</p>
                            <p>{wedding.venue_name}</p>
                        </div>
                    </div>

                    <a href="#rsvp" className="inline-block px-8 py-4 bg-green-400 text-black font-black uppercase hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(74,222,128,0.5)] transition-all skew-x-[-12deg]">
                        <span className="inline-block skew-x-[12deg]">Confirm_Presence</span>
                    </a>
                </div>

                <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full opacity-30 mix-blend-screen pointer-events-none">
                    <img src={wedding.hero_image} className="w-full h-full object-cover filter contrast-150 grayscale" />
                    <div className="absolute inset-0 bg-gradient-to-l from-black to-transparent" />
                </div>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <DetailsSection wedding={wedding} invert />
            <TimelineSection timeline={wedding.program_timeline} />
            <GiftSection wedding={wedding} invert />
            <GallerySection gallery={gallery} />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

function GardenTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#f0f7f4] text-[#2d6a4f] font-serif relative pb-24">
            <div className="absolute top-0 left-0 w-64 h-64 bg-green-200/40 rounded-full blur-3xl -translate-x-12 -translate-y-12" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-300/30 rounded-full blur-3xl translate-x-32 translate-y-32" />

            <section className="min-h-screen py-20 px-6 flex flex-col items-center justify-center text-center relative z-10">
                <div className="border-[1px] border-[#2d6a4f]/20 p-4 rounded-t-full">
                    <div className="border-[1px] border-[#2d6a4f]/40 p-12 pt-32 rounded-t-full relative bg-white/60 backdrop-blur-sm shadow-xl">
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 text-4xl animate-bounce">🌿</div>

                        <p className="uppercase tracking-[0.3em] text-xs font-bold text-[#52b788] mb-8">Join the Wedding of</p>
                        <h1 className="text-5xl md:text-7xl font-serif text-[#1b4332] mb-8">
                            {wedding.bride_name} <br /><span className="text-3xl italic font-light text-[#40916c]">&</span><br /> {wedding.groom_name}
                        </h1>
                        <p className="text-xl italic text-[#40916c] mb-12">Under the open sky</p>

                        <div className="mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg mb-12">
                            <img src={wedding.couple_photo || wedding.hero_image} className="w-full h-full object-cover" />
                        </div>

                        <a href="#rsvp" className="px-10 py-4 rounded-full bg-[#2d6a4f] text-white font-bold hover:bg-[#1b4332] shadow-lg shadow-[#2d6a4f]/20 transition-all transform hover:-translate-y-1">
                            Save the Date
                        </a>
                    </div>
                </div>
            </section>

            <section className="py-24 max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 rounded-3xl bg-white p-12 shadow-sm border border-green-100">
                    <div className="space-y-6">
                        <h2 className="text-4xl font-serif text-[#1b4332]">Our Secret Garden</h2>
                        <p className="text-lg leading-relaxed text-[#40916c]">{wedding.story}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <img src={gallery[0]} className="rounded-xl object-cover w-full h-48" />
                        <img src={gallery[1]} className="rounded-xl object-cover w-full h-48 mt-8" />
                    </div>
                </div>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <DetailsSection wedding={wedding} />
            <TimelineSection timeline={wedding.program_timeline} />
            <GiftSection wedding={wedding} />
            <GallerySection gallery={gallery} />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

// --- SHARED COMPONENTS are now imported from @/components/wedding ---

// Helper: Parse wedding party members from JSON
function parseWeddingParty(wedding: any): WeddingPartyMember[] {
    try {
        if (wedding.wedding_party) return JSON.parse(wedding.wedding_party);
    } catch { }
    return [];
}

// Helper: Common new sections added to all templates
function SharedNewSections({ wedding, isExpired }: { wedding: any; isExpired: boolean }) {
    const partyMembers = parseWeddingParty(wedding);
    return (
        <>
            {wedding.is_thank_you_mode ? (
                <div className="py-24 px-6 text-center max-w-4xl mx-auto space-y-8 bg-primary/5 rounded-3xl my-12 border border-primary/20 soft-shadow">
                    <h2 className="text-4xl md:text-5xl font-serif text-primary italic">Thank You!</h2>
                    <p className="text-xl font-light leading-relaxed text-text-secondary">{wedding.thank_you_message || "Thank you so much for celebrating our special day with us."}</p>
                    {wedding.photo_album_link && (
                        <a href={wedding.photo_album_link} target="_blank" rel="noopener noreferrer" className="inline-block px-10 py-4 bg-primary text-white font-bold rounded-full mt-8 shadow-lg hover:shadow-xl transition-all">
                            View Wedding Album
                        </a>
                    )}
                </div>
            ) : (
                <CountdownTimer
                    weddingDate={wedding.wedding_date}
                    weddingTime={wedding.wedding_time}
                    brideName={wedding.bride_name}
                    groomName={wedding.groom_name}
                    venueName={wedding.venue_name}
                    venueAddress={wedding.venue_address}
                />
            )}
            <WeddingPartySection members={partyMembers} />
            <VenueMap venueName={wedding.venue_name} venueAddress={wedding.venue_address} mapsLink={wedding.maps_link} />
            <GuestBook weddingId={wedding.id} />
            {wedding.spotify_playlist_url && (
                <div className="fixed bottom-6 left-6 z-50">
                    <a href={wedding.spotify_playlist_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#1DB954] text-white font-bold text-sm shadow-lg hover:scale-105 transition-transform">
                        <Music className="w-4 h-4" /> Our Playlist
                    </a>
                </div>
            )}
            <RSVPSection wedding={wedding} isExpired={isExpired} />
        </>
    );
}

function MinimalDetailItem({ icon: Icon, title, value }: any) {
    return (
        <div className="flex gap-6 items-center">
            <div className="w-12 h-12 bg-primary/5 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
                <p className="text-[10px] uppercase tracking-widest font-black opacity-30 mb-1">{title}</p>
                <p className="text-xl font-bold tracking-tighter">{value}</p>
            </div>
        </div>
    );
}

function RomanticTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#fff0f5] text-[#8b4513] relative overflow-hidden pb-24">
            <DecorativeLayer type="sakura" position="top-right" color="#e3a6c1" opacity={0.15} />
            <DecorativeLayer type="sakura" position="bottom-left" color="#e3a6c1" opacity={0.15} />

            <section className="min-h-screen flex flex-col items-center justify-center p-6 text-center z-10 relative">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }} className="relative">
                    <div className="border-[1px] border-[#e3a6c1] p-12 md:p-24 rounded-[3rem] bg-white/50 backdrop-blur-sm relative soft-shadow">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fff0f5] px-6 text-primary">
                            <Heart className="w-8 h-8 fill-current" />
                        </div>
                        <p className="font-serif italic text-xl md:text-2xl text-primary/70 mb-6">We invite you to share in our love</p>
                        <h1 className="text-6xl md:text-8xl font-serif text-[#4A4444] mb-8 leading-tight tracking-tight">
                            {wedding.bride_name} <br />
                            <span className="text-3xl md:text-4xl italic text-primary">&</span> <br />
                            {wedding.groom_name}
                        </h1>
                        <p className="uppercase tracking-[0.3em] font-bold text-sm text-[#8b4513] mb-12">{new Date(wedding.wedding_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                        <motion.a whileHover={{ scale: 1.05 }} href="#rsvp" className="px-10 py-4 bg-primary text-white rounded-full font-serif italic text-xl shadow-lg hover:shadow-primary/30 transition-all">Will you join us?</motion.a>
                    </div>
                </motion.div>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <DetailsSection wedding={wedding} />
            <TimelineSection timeline={wedding.program_timeline} />
            <GallerySection gallery={gallery} />
            <GiftSection wedding={wedding} />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

function LuxuryTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-white text-black font-serif pb-24">
            <section className="h-screen relative grid grid-cols-1 md:grid-cols-2">
                <div className="flex flex-col justify-center p-12 md:p-24 bg-neutral-50">
                    <div className="w-16 h-[2px] bg-black mb-12" />
                    <h1 className="text-6xl md:text-8xl leading-[0.9] font-light mb-8 uppercase tracking-tight">
                        {wedding.bride_name} <br />
                        <span className="font-thin opacity-50">&</span> <br />
                        {wedding.groom_name}
                    </h1>
                    <div className="flex items-center gap-4 text-sm font-bold tracking-[0.2em] uppercase mt-12">
                        <span>{new Date(wedding.wedding_date).getFullYear()}</span>
                        <div className="w-12 h-[1px] bg-black/20" />
                        <span>Wedding Editorial</span>
                    </div>
                </div>
                <div className="relative h-full overflow-hidden">
                    <img src={wedding.hero_image || wedding.couple_photo} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/10" />
                </div>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <DetailsSection wedding={wedding} />
            <TimelineSection timeline={wedding.program_timeline} />
            <GallerySection gallery={gallery} />
            <GiftSection wedding={wedding} />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

function ElopementTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#fcfaf7] text-[#4a4a4a] relative pb-24 font-sans">
            <section className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-2xl w-full space-y-12">
                    <span className="text-xs uppercase tracking-[0.4em] text-primary block mb-4">Just Us</span>
                    <div className="aspect-[4/5] rounded-t-full overflow-hidden relative mb-8">
                        <img src={wedding.couple_photo || wedding.hero_image} className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif italic leading-relaxed">
                        {wedding.bride_name} & {wedding.groom_name}
                    </h1>
                    <p className="text-lg opacity-60 max-w-md mx-auto">{wedding.story || "We decided to focus on what matters most: our promise to each other."}</p>
                    <div className="pt-8 border-t border-black/5">
                        <p className="font-bold uppercase tracking-widest text-sm mb-2">{new Date(wedding.wedding_date).toLocaleDateString()}</p>
                        <p className="font-serif italic text-primary">{wedding.venue_name}</p>
                    </div>
                </div>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <DetailsSection wedding={wedding} />
            <TimelineSection timeline={wedding.program_timeline} />
            <GallerySection gallery={gallery} />
            <GiftSection wedding={wedding} />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

function TraditionalTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#fffefb] text-[#2c3e50] relative pb-24">
            <div className="absolute top-0 left-0 w-full h-32 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-10" />
            <section className="py-24 px-6 text-center max-w-4xl mx-auto">
                <div className="mb-12">
                    <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-3xl font-serif text-primary mb-6">
                        {wedding.bride_name[0]}&{wedding.groom_name[0]}
                    </div>
                    <p className="uppercase tracking-widest text-xs font-bold opacity-40 mb-4">The Honour of your presence is requested</p>
                </div>
                <h1 className="text-5xl md:text-7xl font-serif text-[#2c3e50] mb-8 leading-tight">
                    {wedding.bride_name} <br />
                    <span className="text-2xl italic font-light opacity-50">to</span> <br />
                    {wedding.groom_name}
                </h1>
                <div className="border-t border-b border-[#2c3e50]/20 py-8 my-12 space-y-2">
                    <p className="text-xl font-bold uppercase tracking-widest">{new Date(wedding.wedding_date).toLocaleDateString(undefined, { weekday: 'long' })}</p>
                    <p className="text-3xl font-serif text-primary">{new Date(wedding.wedding_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</p>
                    <p className="text-xl font-bold uppercase tracking-widest">{new Date(wedding.wedding_date).getFullYear()}</p>
                </div>
                <p className="text-lg opacity-70 font-serif italic mb-12">{wedding.venue_name}</p>
                <a href="#rsvp" className="px-12 py-4 border border-[#2c3e50] uppercase tracking-widest text-xs hover:bg-[#2c3e50] hover:text-white transition-all">RSVP</a>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <DetailsSection wedding={wedding} />
            <TimelineSection timeline={wedding.program_timeline} />
            <GallerySection gallery={gallery} />
            <GiftSection wedding={wedding} />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

function BohoTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#f4e2d8] text-[#835033] font-serif relative overflow-hidden pb-24">
            <DecorativeLayer type="boho" position="top-right" color="#a06a4d" opacity={0.1} />
            <DecorativeLayer type="boho" position="bottom-left" color="#a06a4d" opacity={0.1} />

            <section className="min-h-screen py-24 px-6 flex flex-col items-center justify-center text-center relative z-10">
                <div className="w-48 h-48 bg-[#d69d78]/20 rounded-full absolute top-24 -left-24 blur-3xl animate-pulse" />
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                    <p className="font-sans text-xs uppercase tracking-[0.6em] mb-12 opacity-60">Join Our Adventure</p>
                    <h1 className="text-7xl md:text-9xl font-serif mb-12 leading-none drop-shadow-sm font-light italic">
                        {wedding.bride_name} <br />
                        <span className="text-4xl not-italic opacity-30 tracking-widest font-sans">&</span> <br />
                        {wedding.groom_name}
                    </h1>
                    <div className="flex items-center justify-center gap-6 border-y border-[#835033]/20 py-8 mb-16 max-w-lg mx-auto">
                        <span className="text-2xl font-light italic tracking-widest">{new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <a href="#rsvp" className="px-12 py-5 bg-[#835033] text-[#f4e2d8] rounded-full font-sans uppercase text-xs font-black tracking-widest hover:bg-[#6b4129] transition-all transform hover:scale-110 shadow-xl shadow-[#835033]/20">Count Me In</a>
                </motion.div>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <DetailsSection wedding={wedding} />
            <TimelineSection timeline={wedding.program_timeline} />
            <GallerySection gallery={gallery} />
            <GiftSection wedding={wedding} />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

function ArtDecoTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#1a1a1a] text-[#c5a059] relative overflow-hidden pb-24 selection:bg-[#c5a059] selection:text-black">
            <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0 L100 50 L50 100 L0 50 Z' fill='none' stroke='%23c5a059' stroke-opacity='0.1' stroke-width='1'/%3E%3C/svg%3E")` }} />

            <section className="min-h-screen flex flex-col items-center justify-center p-6 lg:p-24 relative">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="border-4 border-[#c5a059] p-12 md:p-24 relative max-w-5xl w-full text-center bg-black/40 backdrop-blur-sm">
                    <div className="absolute -inset-4 border border-[#c5a059]/30 pointer-events-none" />
                    <span className="text-xs uppercase tracking-[0.8em] font-bold mb-12 block text-white/60">A Grand Celebration</span>
                    <h1 className="text-6xl md:text-9xl font-serif mb-12 text-white italic tracking-tighter leading-none">
                        {wedding.bride_name} & <br /> {wedding.groom_name}
                    </h1>
                    <div className="w-24 h-1 bg-[#c5a059] mx-auto mb-12" />
                    <p className="text-2xl uppercase tracking-[0.4em] text-[#c5a059] mb-16">{new Date(wedding.wedding_date).toLocaleDateString()}</p>
                    <a href="#rsvp" className="px-16 py-5 border border-[#c5a059] text-[#c5a059] uppercase tracking-widest text-xs font-black hover:bg-[#c5a059] hover:text-black transition-all">Request Pleasure (RSVP)</a>
                </motion.div>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <div className="relative z-10 py-16 md:py-32">
                <DetailsSection wedding={wedding} invert />
            </div>
            <TimelineSection timeline={wedding.program_timeline} />
            <GallerySection gallery={gallery} />
            <GiftSection wedding={wedding} invert />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

function VintageTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#fdfbf6] text-[#5d544b] font-serif relative pb-24">
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] grayscale bg-[url('https://www.transparenttextures.com/patterns/old-map.png')]" />
            <section className="min-h-screen py-24 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                <div className="absolute inset-8 border-[0.5px] border-[#5d544b]/20 pointer-events-none rounded-[2rem]" />
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }}>
                    <p className="uppercase tracking-[0.4em] text-xs font-bold mb-12 opacity-40">Together with their families</p>
                    <h1 className="text-6xl md:text-9xl mb-12 text-[#433c35] drop-shadow-sm">
                        {wedding.bride_name} <br />
                        <span className="text-3xl italic font-light opacity-30 my-6 block">&</span>
                        {wedding.groom_name}
                    </h1>
                    <div className="inline-block border-y border-[#5d544b]/20 py-8 px-16 bg-white/30 backdrop-blur-sm rounded-lg">
                        <p className="text-2xl tracking-widest lowercase font-light italic mb-2">at the sunset of</p>
                        <p className="text-3xl uppercase tracking-[0.2em] font-bold">{new Date(wedding.wedding_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                </motion.div>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <DetailsSection wedding={wedding} />
            <TimelineSection timeline={wedding.program_timeline} />
            <GallerySection gallery={gallery} />
            <GiftSection wedding={wedding} />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

function MinimalTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-white text-neutral-800 pb-24">
            <section className="min-h-[85vh] flex items-center justify-center p-6 md:p-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
                <div className="max-w-4xl text-center space-y-12 z-10">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}>
                        <p className="text-xs uppercase tracking-[0.5em] font-medium text-neutral-400 mb-8">Save the Date</p>
                        <h1 className="text-5xl md:text-8xl font-serif leading-tight text-neutral-900 mb-12">
                            {wedding.bride_name} <br />
                            <span className="font-light italic serif text-neutral-300 ml-4">&</span> <br />
                            {wedding.groom_name}
                        </h1>
                        <div className="w-16 h-[1px] bg-neutral-200 mx-auto mb-12" />
                        <p className="text-xl font-light tracking-widest uppercase text-neutral-500">{new Date(wedding.wedding_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </motion.div>
                </div>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <DetailsSection wedding={wedding} />
            <TimelineSection timeline={wedding.program_timeline} />
            <GallerySection gallery={gallery} />
            <GiftSection wedding={wedding} />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

function ClassicTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <>
            <section className="h-screen relative flex items-center justify-center overflow-hidden">
                <img src={wedding.hero_image || wedding.couple_photo} className="absolute inset-0 w-full h-full object-cover brightness-75 scale-105" alt="Wedding Hero" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="relative text-center text-white z-10 px-6">
                    <span className="text-xs uppercase tracking-[0.4em] font-bold mb-6 block opacity-80">The Wedding of</span>
                    <h1 className="text-6xl md:text-9xl font-serif mb-8 leading-tight">
                        {wedding.bride_name} <br />
                        <span className="text-3xl md:text-4xl italic font-light serif text-primary-light">&</span> <br />
                        {wedding.groom_name}
                    </h1>
                    <div className="w-12 h-[1px] bg-white/40 mx-auto mb-8" />
                    <p className="text-xl md:text-2xl font-serif italic tracking-wide">{new Date(wedding.wedding_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                </motion.div>
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-[1px] h-12 bg-white/40" />
                </div>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <DetailsSection wedding={wedding} />
            <TimelineSection timeline={wedding.program_timeline} />
            <GallerySection gallery={gallery} />
            <GiftSection wedding={wedding} />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </>
    );
}

function TimelineTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-white text-slate-800 pb-24">
            <section className="h-[70vh] flex items-end justify-start p-6 md:p-24 bg-slate-100 relative">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                <div className="relative z-10">
                    <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4">{wedding.bride_name} / {wedding.groom_name}</h1>
                    <p className="text-xl font-mono opacity-60">{new Date(wedding.wedding_date).toLocaleDateString()}</p>
                </div>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <DetailsSection wedding={wedding} />
            <TimelineSection timeline={wedding.program_timeline} />
            <GallerySection gallery={gallery} />
            <GiftSection wedding={wedding} />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

function RSVPFocusTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#f0f4f8] text-[#243b53] min-h-screen flex flex-col pb-24">
            <section className="flex-1 flex flex-col md:flex-row min-h-[70vh]">
                <div className="w-full md:w-1/2 p-12 md:p-24 flex flex-col justify-center bg-white">
                    <h1 className="text-5xl md:text-6xl font-serif font-black mb-6 text-primary">{wedding.bride_name} & {wedding.groom_name}</h1>
                    <p className="text-xl mb-12 opacity-70 leading-relaxed font-serif">Are getting married on {new Date(wedding.wedding_date).toLocaleDateString()}. We would become the happiest couple if you could join us.</p>
                    <a href="#rsvp" className="w-full py-4 bg-primary text-white text-center rounded-xl font-bold hover:bg-primary-hover shadow-lg transition-all transform hover:-translate-y-1">RSVP Now</a>
                </div>
                <div className="w-full md:w-1/2 relative bg-neutral-200 min-h-[40vh]">
                    <img src={wedding.hero_image || wedding.couple_photo} className="absolute inset-0 w-full h-full object-cover" />
                </div>
            </section>

            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <DetailsSection wedding={wedding} />
            <TimelineSection timeline={wedding.program_timeline} />
            <GallerySection gallery={gallery} />
            <GiftSection wedding={wedding} />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

function CinematicTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-black text-white min-h-screen">
            <section className="h-screen relative flex items-center justify-center text-center px-6">
                <div className="absolute inset-0 opacity-40">
                    <video src={wedding.teaser_video} autoPlay muted loop className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
                </div>
                <div className="relative z-10 space-y-8">
                    <p className="uppercase tracking-[0.5em] text-xs font-bold">A Film By QuickWeds</p>
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase">{wedding.bride_name} <span className="text-red-500">&</span> {wedding.groom_name}</h1>
                    <p className="uppercase tracking-widest text-xl">{new Date(wedding.wedding_date).toLocaleDateString()}</p>
                    <div className="pt-12">
                        <a href="#rsvp" className="px-12 py-4 border border-white hover:bg-white hover:text-black transition-all uppercase tracking-widest text-xs font-bold">Watch Trailer</a>
                    </div>
                </div>
            </section>
            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <DetailsSection wedding={wedding} invert />
            <TimelineSection timeline={wedding.program_timeline} />
            <GallerySection gallery={gallery} />
            <GiftSection wedding={wedding} invert />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

function EleganceTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#f8f8f8] text-[#333] font-serif pb-24 border-[20px] border-white">
            <section className="min-h-[90vh] flex flex-col items-center justify-center p-6 bg-white m-6 shadow-sm">
                <h1 className="text-5xl md:text-7xl font-light mb-8 tracking-wide text-center">
                    {wedding.bride_name} <br /> <span className="text-2xl opacity-40 italic">with</span> <br /> {wedding.groom_name}
                </h1>
                <div className="w-24 h-[1px] bg-black/10 my-8" />
                <p className="text-sm font-sans uppercase tracking-[0.3em]">{new Date(wedding.wedding_date).toLocaleDateString()}</p>
            </section>
            <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
            <BioSection wedding={wedding} />
            <DetailsSection wedding={wedding} />
            <TimelineSection timeline={wedding.program_timeline} />
            <GallerySection gallery={gallery} />
            <GiftSection wedding={wedding} />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}
