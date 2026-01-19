'use client';

import { Suspense, useEffect, useState, use } from 'react';
import { notFound } from 'next/navigation';
import { Heart, Calendar, MapPin, Clock, Shirt, Info, MessageSquare, Send, Quote, Music, Camera, Sparkles } from 'lucide-react';
import RSVPForm from '@/components/RSVPForm';
import { motion } from 'framer-motion';

export default function WeddingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [wedding, setWedding] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/weddings/${id}`);
                const data = await res.json();
                if (data.success) {
                    setWedding(data.wedding);
                } else {
                    setWedding(null);
                }
            } catch (err) {
                console.error(err);
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
            <footer className="py-24 text-center border-t border-primary/10">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-5 h-5 text-primary fill-primary" />
                </div>
                <p className="font-serif text-2xl text-[#4A4444] mb-2">{wedding.bride_name} & {wedding.groom_name}</p>
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

function ClassicTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <>
            <section className="relative min-h-screen py-20 flex flex-col items-center justify-center text-center px-6">
                <div className="absolute inset-0 -z-10" style={{ background: wedding.hero_image ? `linear-gradient(to bottom, rgba(255,248,244,0.4), rgba(255,248,244,0.9)), url(${wedding.hero_image})` : `radial-gradient(circle at center, ${wedding.motif_color}44 0%, transparent 70%)`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

                {/* Decorative Floral SVGs */}
                <div className="absolute top-0 left-0 w-64 h-64 opacity-20 pointer-events-none translate-x-[-20%] translate-y-[-20%]">
                    <svg viewBox="0 0 200 200" className="w-full h-full fill-primary"><path d="M40,60 C40,40 60,30 80,40 C100,20 120,20 140,40 C160,30 180,40 180,60 C180,100 100,180 100,180 C100,180 20,100 20,60" /></svg>
                </div>
                <div className="absolute bottom-0 right-0 w-64 h-64 opacity-20 pointer-events-none translate-x-[20%] translate-y-[20%] rotate-180">
                    <svg viewBox="0 0 200 200" className="w-full h-full fill-primary"><path d="M40,60 C40,40 60,30 80,40 C100,20 120,20 140,40 C160,30 180,40 180,60 C180,100 100,180 100,180 C100,180 20,100 20,60" /></svg>
                </div>

                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease: "easeOut" }}>
                    <div className="mb-12 relative">
                        <motion.div initial={{ rotate: -5 }} animate={{ rotate: 0 }} transition={{ duration: 1, delay: 0.5 }} className="w-56 h-72 border-[12px] border-white soft-shadow overflow-hidden mx-auto relative z-10">
                            <img src={wedding.couple_photo || '/placeholder.jpg'} alt="Wedding Couple" className="w-full h-full object-cover scale-110" />
                        </motion.div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-primary/20 rounded-full -z-0 animate-pulse" />
                    </div>
                    <p className="text-sm uppercase tracking-[0.8em] font-bold text-primary mb-6">The Wedding Celebration Of</p>
                    <h1 className="text-6xl md:text-8xl font-serif text-[#4A4444] mb-8 leading-[0.9]">{wedding.bride_name} <br /><span className="text-3xl italic opacity-40">&</span><br /> {wedding.groom_name}</h1>
                    <div className="flex items-center gap-6 justify-center mb-12">
                        <div className="h-[1px] w-12 bg-primary/30" />
                        <p className="text-2xl font-serif italic text-primary">{new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        <div className="h-[1px] w-12 bg-primary/30" />
                    </div>
                    <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href="#rsvp" className="px-12 py-5 rounded-full bg-primary text-white font-bold tracking-widest uppercase text-xs shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all">Secure Your Spot</motion.a>
                </motion.div>
            </section>
            <DetailsSection wedding={wedding} />
            <BioSection wedding={wedding} />
            {wedding.teaser_video && <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />}
            <GallerySection gallery={gallery} />
            <RSVPSection wedding={wedding} isExpired={isExpired} />
        </>
    );
}

function MinimalTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="font-sans pb-24">
            <section className="relative min-h-[100dvh] flex grid grid-cols-1 lg:grid-cols-2">
                <div className="flex flex-col justify-center px-12 lg:px-24 border-r border-black/5">
                    <motion.div initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}>
                        <div className="mb-12 w-12 h-[2px] bg-primary" />
                        <h1 className="text-[12vw] lg:text-[10vw] font-black text-[#4A4444] leading-[0.8] tracking-tighter mb-12 mix-blend-multiply">
                            {wedding.bride_name.split(' ')[0]}
                            <br /><span className="text-primary">+</span><br />
                            {wedding.groom_name.split(' ')[0]}
                        </h1>
                        <div className="flex gap-12 items-baseline">
                            <p className="text-xl tracking-tighter mb-12 font-bold opacity-30">{new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            <a href="#rsvp" className="inline-block border-b-4 border-primary pb-2 font-black tracking-tighter hover:text-primary transition-all text-4xl">GO →</a>
                        </div>
                    </motion.div>
                </div>
                <div className="relative bg-neutral/30 group overflow-hidden">
                    <motion.img
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 2 }}
                        src={wedding.hero_image || wedding.couple_photo}
                        className="absolute inset-0 w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
                    <div className="absolute bottom-12 right-12 text-white/40 text-[10vw] font-black leading-none pointer-events-none select-none">
                        {new Date(wedding.wedding_date).getFullYear()}
                    </div>
                </div>
            </section>

            <div className="py-32 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-24">
                <MinimalDetailItem icon={Calendar} title="When" value={new Date(wedding.wedding_date).toLocaleDateString()} />
                <MinimalDetailItem icon={MapPin} title="Where" value={wedding.venue_name} />
                <MinimalDetailItem icon={Shirt} title="Wear" value={wedding.dress_code || 'Formal'} />
            </div>

            <section className="py-24 px-6 max-w-5xl mx-auto">
                <div className="aspect-[16/9] overflow-hidden rounded-0 relative mb-24 group">
                    <img src={wedding.couple_photo} className="w-full h-full object-cover mask-arc group-hover:scale-110 transition-transform duration-[3s]" />
                    <div className="absolute inset-0 border border-black/5" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <div className="text-[10vw] font-black leading-none text-primary/10 absolute left-0 pr-12 -z-10 select-none">STORY</div>
                    <p className="text-2xl font-bold leading-tight tracking-tight text-foreground/80">
                        {wedding.story || "A tale of two souls becoming one, captured in a lifetime of beautiful moments."}
                    </p>
                    <div className="p-12 border-4 border-primary/20 hover:border-primary transition-colors duration-500">
                        <Quote className="w-8 h-8 text-primary mb-6" />
                        <p className="text-xl font-bold italic tracking-tight italic opacity-80">
                            {wedding.quote || "A successful marriage requires falling in love many times, always with the same person."}
                        </p>
                    </div>
                </div>
            </section>

            {wedding.teaser_video && <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />}
            <MinimalGallery gallery={gallery} />
            <RSVPSection wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

function VintageTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#f4ead5] min-h-screen text-[#5d4037] relative">
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/handmade-paper.png')` }} />

            <section className="py-32 px-6 text-center relative z-10">
                <div className="absolute top-12 left-12 w-24 h-24 opacity-20 rotate-[-15deg] pointer-events-none">
                    <svg viewBox="0 0 100 100" className="fill-current"><circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" /><text x="50" y="45" textAnchor="middle" fontSize="10" fontWeight="bold">POSTED</text><text x="50" y="60" textAnchor="middle" fontSize="12" fontWeight="bold">{new Date(wedding.wedding_date).getFullYear()}</text></svg>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto border-[1px] border-[#5d4037]/30 p-16 relative bg-[#fdfaf3] soft-shadow"
                >
                    <div className="absolute -top-6 -left-6 w-32 h-32 border-t-2 border-l-2 border-[#5d4037]/60" />
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 border-b-2 border-r-2 border-[#5d4037]/60" />

                    <p className="font-serif italic text-3xl mb-8 opacity-60">Together with their families</p>
                    <motion.h1
                        initial={{ letterSpacing: "0.2em", opacity: 0 }}
                        animate={{ letterSpacing: "-0.02em", opacity: 1 }}
                        transition={{ duration: 2 }}
                        className="text-6xl md:text-[6rem] font-serif mb-8 tracking-tighter"
                    >
                        {wedding.bride_name} <br /><span className="text-4xl italic serif text-primary">&</span> <br /> {wedding.groom_name}
                    </motion.h1>
                    <p className="text-sm uppercase tracking-[0.5em] mb-16 font-bold opacity-40">Request the honor of your presence</p>

                    <div className="flex justify-center items-center gap-8 mb-16">
                        <div className="h-[1px] flex-1 bg-[#5d4037]/20" />
                        <div className="text-center">
                            <p className="text-4xl font-serif italic mb-2">{new Date(wedding.wedding_date).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                            <p className="text-xl tracking-widest">{new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div className="h-[1px] flex-1 bg-[#5d4037]/20" />
                    </div>

                    <a href="#rsvp" className="inline-block px-16 py-4 border-2 border-[#5d4037] text-xs uppercase font-black tracking-[0.4em] hover:bg-[#5d4037] hover:text-[#f4ead5] transition-all duration-500">Confirm Attendance</a>
                </motion.div>
            </section>

            <section className="py-24 max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <motion.div initial={{ rotate: 2 }} whileInView={{ rotate: -2 }} className="p-4 bg-white shadow-2xl skew-y-1">
                    <img src={wedding.couple_photo || wedding.hero_image} alt="Wedding Scene" className="w-full grayscale brightness-90 contrast-125" />
                    <p className="mt-4 font-serif italic text-center opacity-40 italic">Captured in 35mm</p>
                </motion.div>
                <div className="space-y-12">
                    <h2 className="text-5xl font-serif italic border-b border-[#5d4037]/10 pb-6 text-primary">Our Journey</h2>
                    <p className="text-2xl font-serif leading-relaxed opacity-80 italic italic">
                        {wedding.story || "A tale of two souls becoming one, captured in a lifetime of beautiful moments."}
                    </p>
                </div>
            </section>

            {wedding.teaser_video && (
                <div className="py-24 px-6 scale-95 origin-center">
                    <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
                </div>
            )}
            <GallerySection gallery={gallery} />
            <RSVPSection wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

function ArtDecoTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-slate-950 text-[#D4AF37] min-h-screen relative overflow-hidden" style={{ color: wedding.motif_color } as any}>
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0">
                <svg width="100%" height="100%"><defs><pattern id="deco" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M50 0 L100 50 L50 100 L0 50 Z" fill="none" stroke="currentColor" strokeWidth="1" /><circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" /></pattern></defs><rect width="100%" height="100%" fill="url(#deco)" /></svg>
            </div>

            <section className="min-h-screen flex flex-col items-center justify-center p-6 py-24 text-center border-[2px] border-current m-4 md:m-12 relative z-10 art-deco-border">
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/20 pointer-events-none" />
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} className="relative px-8 py-16">
                    <p className="text-xs tracking-[1em] font-black uppercase mb-12">The Union Of</p>
                    <h1 className="text-6xl md:text-[9rem] font-serif uppercase mb-16 tracking-tighter leading-[0.85]">{wedding.bride_name} <br /><span className="text-2xl tracking-[0.5em] block my-8 opacity-60">and</span>{wedding.groom_name}</h1>
                    <div className="flex gap-12 items-center justify-center mb-16">
                        <div className="h-[2px] flex-1 bg-current" />
                        <p className="text-4xl tracking-[0.3em] font-serif">{new Date(wedding.wedding_date).getFullYear()}</p>
                        <div className="h-[2px] flex-1 bg-current" />
                    </div>
                    <motion.a whileHover={{ scale: 1.1, backgroundColor: wedding.motif_color, color: "#000" }} href="#rsvp" className="px-20 py-5 border-2 border-current text-xs uppercase font-black tracking-[0.8em] transition-all duration-700 bg-transparent">Access The Gala</motion.a>
                </motion.div>
            </section>

            <div className="relative z-10 py-32"><DetailsSection wedding={wedding} invert /></div>
            <section className="relative z-10 max-w-6xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center text-current">
                <div className="space-y-12">
                    <h2 className="text-7xl font-serif uppercase italic tracking-tighter border-l-8 border-current pl-12">The Romance</h2>
                    <p className="text-3xl font-serif leading-tight opacity-90">{wedding.story || "A tale of two souls becoming one."}</p>
                </div>
                <div className="aspect-[3/4] border-4 border-current p-4 relative">
                    <img src={wedding.couple_photo || wedding.hero_image} className="w-full h-full object-cover grayscale brightness-75 contrast-125 hover:grayscale-0 transition-all duration-1000" />
                </div>
            </section>
            {wedding.teaser_video && <div className="p-12"><VideoSection video={wedding.teaser_video} poster={wedding.hero_image} /></div>}
            <GallerySection gallery={gallery} />
            <RSVPSection wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

function BohoTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-[#f9f1e7] text-[#7d6b5d] relative pb-24">
            {/* Organic Floating Shapes */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }} className="absolute -top-32 -left-32 w-96 h-96 opacity-10 pointer-events-none">
                <svg viewBox="0 0 200 200" className="fill-primary"><path d="M44.7,-76.4C58.2,-69.2,69.8,-57.4,77.6,-43.8C85.4,-30.2,89.5,-15.1,88.4,-0.6C87.4,13.9,81.1,27.7,72.6,40.1C64.1,52.5,53.4,63.4,40.5,71.5C27.6,79.5,13.8,84.7,-0.8,86C-15.4,87.4,-30.7,85,-44.1,77.7C-57.5,70.3,-68.9,58,-76.7,44.1C-84.5,30.2,-88.7,14.6,-88.2,0.3C-87.7,-14.1,-82.5,-27.1,-74,-38.3C-65.5,-49.5,-53.7,-58.8,-40.8,-66.4C-27.9,-73.9,-13.9,-79.8,0.4,-80.4C14.7,-81,29.3,-76.4,44.7,-76.4Z" transform="translate(100 100)" /></svg>
            </motion.div>

            <section className="relative min-h-screen py-20 flex items-center justify-center px-6">
                <div className="z-10 text-center max-w-5xl">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5 }}>
                        <div className="relative mb-16 px-12">
                            <div className="absolute top-0 left-0 text-7xl opacity-10 animate-float translate-x-[-50%] translate-y-[-50%]">🌸</div>
                            <div className="absolute bottom-0 right-0 text-7xl opacity-10 animate-float delay-1000 translate-x-[50%] translate-y-[50%]">🍃</div>
                            <div className="w-80 h-96 rounded-t-full overflow-hidden border-[16px] border-white shadow-2xl mx-auto rotate-1">
                                <img src={wedding.couple_photo || wedding.hero_image} className="w-full h-full object-cover scale-110" />
                            </div>
                        </div>
                        <h1 className="text-7xl md:text-[10vw] font-serif text-[#4A4444] mb-8 leading-none tracking-tighter">
                            {wedding.bride_name} <br />
                            <span className="text-3xl italic font-serif text-primary">&</span> <br />
                            {wedding.groom_name}
                        </h1>
                        <p className="text-3xl font-serif italic text-primary/60 mb-12">Under the sun, over the moon</p>
                        <motion.a whileHover={{ letterSpacing: "0.5em" }} href="#rsvp" className="px-16 py-5 rounded-full bg-[#7d6b5d] text-white font-bold tracking-widest uppercase text-xs shadow-lg transition-all">Join The Tribe</motion.a>
                    </motion.div>
                </div>
            </section>

            <section className="py-32 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
                    <div className="space-y-8">
                        <span className="text-xs uppercase tracking-[0.5em] font-black text-primary">In Our Hearts</span>
                        <h2 className="text-6xl font-serif text-[#4A4444]">Our Story</h2>
                        <p className="text-2xl leading-relaxed text-[#7d6b5d]/80 font-serif italic">
                            {wedding.story || "A tale of two souls becoming one, captured in a lifetime of beautiful moments."}
                        </p>
                        <div className="flex gap-4 items-center pt-8">
                            <div className="w-12 h-[1px] bg-primary" />
                            <p className="text-primary font-bold tracking-widest uppercase text-sm">#{wedding.hashtag || 'LoveAlways'}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <img src={gallery[0]} className="w-full aspect-square object-cover rounded-3xl rotate-2 soft-shadow" />
                        <img src={gallery[1]} className="w-full aspect-square object-cover rounded-3xl -rotate-2 soft-shadow translate-y-12" />
                    </div>
                </div>
            </section>

            <DetailsSection wedding={wedding} />
            {wedding.teaser_video && <div className="max-w-6xl mx-auto px-6 py-24"><VideoSection video={wedding.teaser_video} poster={wedding.hero_image} /></div>}
            <GallerySection gallery={gallery} masonry />
            <RSVPSection wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

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

            <section className="py-24 px-6 border-b border-black/5 bg-gray-50">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-24 items-center">
                    <div className="w-full lg:w-1/3 text-center lg:text-left space-y-6">
                        <h2 className="text-5xl font-serif italic text-[#4A4444]">The Details</h2>
                        <p className="text-foreground/60 leading-relaxed font-serif text-xl border-t border-black/10 pt-6">Captured in high definition. Every second of the union will be recorded for eternity.</p>
                    </div>
                    <div className="w-full lg:w-2/3">
                        {wedding.teaser_video && <div className="rounded-3xl overflow-hidden shadow-2xl shadow-primary/20"><VideoSection video={wedding.teaser_video} poster={wedding.hero_image} /></div>}
                    </div>
                </div>
            </section>

            <DetailsSection wedding={wedding} />
            <GallerySection gallery={gallery} masonry />
            <RSVPSection wedding={wedding} isExpired={isExpired} />
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
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#121212] rounded-full border border-primary/20 flex items-center justify-center">
                        <Heart className="w-12 h-12 text-primary fill-primary" />
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
            </div>

            {wedding.teaser_video && (
                <section className="py-32 relative z-10 bg-black">
                    <div className="max-w-6xl mx-auto px-6 border-x border-primary/10">
                        <VideoSection video={wedding.teaser_video} poster={wedding.hero_image} />
                    </div>
                </section>
            )}

            <div className="relative z-10 bg-[#121212] pt-24"><DetailsSection wedding={wedding} invert /></div>
            <GallerySection gallery={gallery} />
            <RSVPSection wedding={wedding} isExpired={isExpired} />
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

            <DetailsSection wedding={wedding} />
            {wedding.teaser_video && <div className="p-8 md:p-24"><VideoSection video={wedding.teaser_video} poster={wedding.hero_image} /></div>}
            <GallerySection gallery={gallery} />
            <RSVPSection wedding={wedding} isExpired={isExpired} />
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

            <div className="p-12 lg:p-32"><DetailsSection wedding={wedding} invert /></div>
            {wedding.teaser_video && <div className="p-6 md:p-32 bg-black/40"><VideoSection video={wedding.teaser_video} poster={wedding.hero_image} /></div>}
            <GallerySection gallery={gallery} masonry />
            <RSVPSection wedding={wedding} isExpired={isExpired} />
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

            <DetailsSection wedding={wedding} />
            {wedding.teaser_video && <div className="p-6 md:p-32"><VideoSection video={wedding.teaser_video} poster={wedding.hero_image} /></div>}
            <GallerySection gallery={gallery} masonry />
            <RSVPSection wedding={wedding} isExpired={isExpired} />
        </div>
    );
}

// --- SHARED COMPONENTS ---

function DetailsSection({ wedding, invert = false }: any) {
    return (
        <section className={`py-32 ${invert ? 'bg-black/10' : 'bg-white/50'}`}>
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                <DetailCard icon={Calendar} title="Date" value={new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} subtitle={wedding.wedding_time} />
                <DetailCard icon={MapPin} title="Location" value={wedding.venue_name} subtitle={wedding.venue_address} link={wedding.maps_link} />
                <DetailCard icon={Shirt} title="Attire" value={wedding.dress_code || 'Formal'} subtitle="Love is the only thing that never goes out of style." />
            </div>
        </section>
    );
}

function DetailCard({ icon: Icon, title, value, subtitle, link }: any) {
    return (
        <div className="flex flex-col items-center text-center p-12 rounded-[3.5rem] bg-white soft-shadow hover:-translate-y-2 transition-transform duration-500 border border-primary/5">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 rotate-3">
                <Icon className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-4 opacity-40 uppercase tracking-widest">{title}</h3>
            <p className="text-2xl font-serif mb-2 text-[#4A4444]">{value}</p>
            <p className="text-foreground/50 text-sm mb-6 max-w-[200px]">{subtitle}</p>
            {link && <a href={link} target="_blank" className="text-primary font-bold border-b border-primary/30 pb-1 hover:border-primary transition-all text-xs uppercase tracking-widest">Get Directions</a>}
        </div>
    );
}

function BioSection({ wedding }: any) {
    return (
        <section className="max-w-6xl mx-auto px-6 py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="relative">
                    <div className="aspect-[4/5] rounded-[4rem] overflow-hidden soft-shadow border-[12px] border-white -rotate-2">
                        <img src={wedding.couple_photo || wedding.hero_image} className="w-full h-full object-cover" />
                    </div>
                </div>
                <div>
                    <span className="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-6 block">Our Love Story</span>
                    <h2 className="text-6xl font-serif mb-8 text-[#4A4444] leading-tight">Meant to Be</h2>
                    <p className="text-xl leading-relaxed text-foreground/70 font-serif italic mb-12 italic opacity-80">
                        {wedding.story || "They say when you know, you know. For us, every moment since we met has been a beautiful step towards this day."}
                    </p>
                    <div className="p-10 rounded-[3rem] bg-white border border-primary/5 soft-shadow flex gap-6 items-start text-left">
                        <Quote className="w-12 h-12 text-primary opacity-20 flex-shrink-0" />
                        <p className="italic text-primary/80 font-serif text-lg leading-relaxed">
                            {wedding.quote || "A successful marriage requires falling in love many times, always with the same person."}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function VideoSection({ video, poster }: any) {
    return (
        <section className="py-32 bg-[#4A4444] text-white">
            <div className="max-w-5xl mx-auto px-6 text-center">
                <span className="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-6 block opacity-50">Sneak Peek</span>
                <h2 className="text-4xl md:text-6xl font-serif mb-16">Wedding Teaser</h2>
                <div className="aspect-video rounded-[4rem] overflow-hidden soft-shadow relative bg-black/40 p-4 border border-white/10">
                    <video src={video} className="w-full h-full object-cover rounded-[3rem]" controls poster={poster} />
                </div>
            </div>
        </section>
    );
}

function GallerySection({ gallery, masonry = false }: any) {
    if (gallery.length === 0) return null;
    return (
        <section className="py-32">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-20">
                    <span className="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-4 block">Moments Captured</span>
                    <h2 className="text-6xl font-serif text-[#4A4444]">Our Gallery</h2>
                </div>
                <div className={`${masonry ? 'columns-1 md:columns-2 lg:columns-3' : 'grid grid-cols-1 md:grid-cols-2'} gap-8 space-y-8`}>
                    {gallery.map((img: string, i: number) => (
                        <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="rounded-[2.5rem] overflow-hidden soft-shadow bg-white p-3 border border-primary/5">
                            <img src={img} className="w-full h-auto rounded-[2rem] hover:scale-105 transition-all duration-700" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function RSVPSection({ wedding, isExpired }: any) {
    return (
        <section id="rsvp" className="max-w-4xl mx-auto px-6 py-32">
            <div className="bg-white rounded-[5rem] p-16 md:p-24 soft-shadow text-center relative overflow-hidden ring-1 ring-primary/5">
                <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-br-full" />
                <h2 className="text-5xl md:text-7xl font-serif mb-8 text-[#4A4444]">Will You Join Us?</h2>
                <p className="text-foreground/60 italic mb-12 text-xl max-w-lg mx-auto leading-relaxed">We'd love to have you with us. Please RSVP by <span className="text-primary font-bold not-italic">{new Date(wedding.rsvp_deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></p>
                {isExpired ? (
                    <div className="p-12 rounded-[3rem] bg-neutral/50 border border-primary/10 text-center">
                        <p className="text-2xl font-serif text-foreground/60">RSVP has closed for this event.</p>
                    </div>
                ) : (
                    <RSVPForm weddingId={wedding.id} />
                )}
            </div>
        </section>
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

function MinimalGallery({ gallery }: any) {
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
