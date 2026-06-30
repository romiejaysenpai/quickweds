'use client';

import { motion } from 'framer-motion';
import { Film, Heart, Play, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

import { useSectionContext } from '@/context/SectionContext';

interface VideoSectionProps {
    video?: string;
    poster?: string;
    id: string;
    template?: string;
    motifColor?: string;
    templateStyle?: string;
}

type TeaserDesign = {
    section: string;
    shell: string;
    header: string;
    eyebrow: string;
    title: string;
    copy: string;
    frame: string;
    video: string;
    badge: string;
    rail?: string;
    icon: 'play' | 'film' | 'sparkles' | 'heart';
    label: string;
    titleText: string;
    bodyText: string;
};

const DEFAULT_DESIGN: TeaserDesign = {
    section: 'bg-[#fffaf6] text-[#4a4444]',
    shell: 'max-w-6xl px-6 py-20 sm:py-24 md:py-28',
    header: 'mx-auto max-w-2xl text-center',
    eyebrow: 'text-primary/82 tracking-[0.34em]',
    title: 'font-serif text-4xl text-[#4a4444] sm:text-5xl md:text-6xl',
    copy: 'text-[#4a4444]/76',
    frame: 'mt-12 rounded-[2rem] border border-white/70 bg-white/70 p-2 shadow-[0_30px_90px_rgba(58,42,45,0.14)] sm:rounded-[3rem] sm:p-3',
    video: 'rounded-[1.5rem] sm:rounded-[2.4rem]',
    badge: 'border-white/70 bg-white/80 text-[#4a4444]',
    icon: 'heart',
    label: 'Wedding Teaser',
    titleText: 'A Glimpse of the Day',
    bodyText: 'A short preview of the celebration, the place, and the feeling waiting for your guests.',
};

const DESIGNS: Record<string, Partial<TeaserDesign>> = {
    classic: {
        section: 'bg-[#fffaf6] text-[#4a4444]',
        titleText: 'A Prelude to Forever',
        frame: 'mt-12 rounded-[2rem] border-[10px] border-white bg-white shadow-[0_30px_90px_rgba(58,42,45,0.14)] sm:rounded-[3.5rem]',
        video: 'rounded-[1.25rem] sm:rounded-[2.6rem]',
    },
    minimal: {
        section: 'bg-white text-black',
        header: 'max-w-5xl border-y border-black/10 py-8',
        eyebrow: 'text-black/68 tracking-[0.42em]',
        title: 'font-sans text-4xl font-black uppercase text-black sm:text-5xl md:text-6xl',
        copy: 'text-black/72',
        frame: 'mt-10 rounded-none border border-black bg-white p-2 shadow-[18px_18px_0_rgba(0,0,0,0.06)]',
        video: 'rounded-none',
        badge: 'border-black bg-black text-white',
        icon: 'play',
        titleText: 'The Motion Edit',
    },
    romantic: {
        section: 'bg-[#fff8fb] text-[#7c3f55]',
        eyebrow: 'text-[#b85c7a]/75 tracking-[0.34em]',
        title: 'font-serif text-4xl italic text-[#7c3f55] sm:text-5xl md:text-6xl',
        copy: 'text-[#7c3f55]/76',
        frame: 'mt-12 rounded-t-full border border-[#f4d8e4] bg-white/70 p-3 shadow-[0_30px_90px_rgba(184,92,122,0.16)]',
        video: 'rounded-t-full',
        badge: 'border-[#f4d8e4] bg-white/85 text-[#7c3f55]',
        icon: 'heart',
        titleText: 'A Soft Little Preview',
    },
    luxury: {
        section: 'bg-[#0b0b0b] text-white',
        eyebrow: 'text-[#c5a059]/75 tracking-[0.48em]',
        title: 'font-serif text-4xl uppercase tracking-[0.12em] text-[#c5a059] sm:text-5xl md:text-6xl',
        copy: 'text-white/78',
        frame: 'mt-12 rounded-none border border-[#c5a059]/35 bg-black p-2 shadow-[0_35px_100px_rgba(0,0,0,0.55)]',
        video: 'rounded-none brightness-95',
        badge: 'border-[#c5a059]/35 bg-[#c5a059] text-black',
        rail: 'bg-[#c5a059]/70',
        icon: 'sparkles',
        titleText: 'The Luxe Preview',
    },
    editorial: {
        section: 'bg-[#f7f3ee] text-[#201c19]',
        header: 'max-w-6xl text-left',
        eyebrow: 'text-black/68 tracking-[0.5em]',
        title: 'font-sans text-4xl font-black uppercase tracking-[-0.03em] text-black sm:text-5xl md:text-7xl',
        copy: 'max-w-xl text-black/72',
        frame: 'mt-10 rounded-none border border-black/10 bg-white p-2 shadow-[20px_20px_0_rgba(0,0,0,0.06)]',
        video: 'rounded-none grayscale-[0.18]',
        badge: 'border-black bg-black text-white',
        rail: 'bg-black',
        icon: 'film',
        label: 'Teaser Film',
        titleText: 'The Wedding Cut',
    },
    royal: {
        section: 'bg-[#11100f] text-white',
        eyebrow: 'text-[#d6b87c]/75 tracking-[0.42em]',
        title: 'font-serif text-4xl uppercase tracking-[0.16em] text-[#d6b87c] sm:text-5xl md:text-6xl',
        copy: 'text-white/78',
        frame: 'mt-12 rounded-[1rem] border-[3px] border-double border-[#d6b87c]/45 bg-black/55 p-3 shadow-[0_35px_100px_rgba(0,0,0,0.55)]',
        video: 'rounded-[0.65rem]',
        badge: 'border-[#d6b87c]/40 bg-[#d6b87c] text-black',
        icon: 'sparkles',
        titleText: 'A Royal First Look',
    },
    midnight: {
        section: 'bg-[#05060a] text-white',
        eyebrow: 'text-[#cfb53b]/80 tracking-[0.42em]',
        title: 'font-serif text-4xl text-white sm:text-5xl md:text-6xl',
        copy: 'text-white/78',
        frame: 'mt-12 rounded-[2rem] border border-[#cfb53b]/25 bg-white/[0.05] p-2 shadow-[0_35px_100px_rgba(0,0,0,0.55)] backdrop-blur-xl',
        video: 'rounded-[1.5rem]',
        badge: 'border-[#cfb53b]/35 bg-[#cfb53b] text-black',
        icon: 'sparkles',
        titleText: 'Under the Evening Light',
    },
    cinematic: {
        section: 'bg-[#111116] text-white',
        header: 'mx-auto max-w-4xl text-center',
        eyebrow: 'text-[#c7704d]/75 tracking-[0.44em]',
        title: 'font-serif text-4xl text-white sm:text-5xl md:text-7xl',
        copy: 'text-white/78',
        frame: 'mt-12 rounded-[1.25rem] border-[12px] border-black bg-black shadow-[0_35px_110px_rgba(0,0,0,0.65)]',
        video: 'rounded-[0.65rem] sepia-[0.1]',
        badge: 'border-white/10 bg-white/10 text-white backdrop-blur',
        rail: 'bg-[#c7704d]',
        icon: 'film',
        label: 'Feature Teaser',
        titleText: 'The Opening Scene',
    },
    film: {
        section: 'bg-[#1b1815] text-[#f4e2c9]',
        eyebrow: 'text-[#c49c74]/80 tracking-[0.42em]',
        title: 'font-serif text-4xl text-[#f4e2c9] sm:text-5xl md:text-6xl',
        copy: 'text-[#f4e2c9]/78',
        frame: 'mt-12 rounded-sm border-[14px] border-[#0f0d0b] bg-black p-1 shadow-[0_30px_90px_rgba(0,0,0,0.55)]',
        video: 'rounded-sm sepia-[0.24] contrast-105',
        badge: 'border-[#c49c74]/35 bg-[#f4e2c9] text-[#1b1815]',
        rail: 'bg-[#c49c74]',
        icon: 'film',
        label: 'Super 8 Preview',
        titleText: 'Memory in Motion',
    },
    boho: {
        section: 'bg-[#fff7ef] text-[#6e4939]',
        eyebrow: 'text-[#a56d52]/75 tracking-[0.32em]',
        title: 'font-serif text-4xl italic text-[#6e4939] sm:text-5xl md:text-6xl',
        copy: 'text-[#6e4939]/74',
        frame: 'mt-12 rounded-[2.5rem] border border-[#ead0bd] bg-white/60 p-3 shadow-[0_28px_80px_rgba(165,109,82,0.15)]',
        video: 'rounded-[2rem]',
        badge: 'border-[#ead0bd] bg-white/80 text-[#6e4939]',
        icon: 'heart',
        titleText: 'Warm Little Moments',
    },
    garden: {
        section: 'bg-[#f8fbf5] text-[#354b36]',
        eyebrow: 'text-[#537a57]/75 tracking-[0.34em]',
        title: 'font-serif text-4xl italic text-[#354b36] sm:text-5xl md:text-6xl',
        copy: 'text-[#354b36]/74',
        frame: 'mt-12 rounded-t-[5rem] border border-[#d7e5d0] bg-white/70 p-3 shadow-[0_28px_80px_rgba(83,122,87,0.14)]',
        video: 'rounded-t-[4.4rem]',
        badge: 'border-[#d7e5d0] bg-white/85 text-[#354b36]',
        icon: 'sparkles',
        titleText: 'A Garden Preview',
    },
    rustic: {
        section: 'bg-[#fff8ee] text-[#5a3d2b]',
        eyebrow: 'text-[#8c6446]/78 tracking-[0.34em]',
        title: 'font-serif text-4xl text-[#5a3d2b] sm:text-5xl md:text-6xl',
        copy: 'text-[#5a3d2b]/74',
        frame: 'mt-12 rounded-xl border-[12px] border-[#ead9c4] bg-[#2a1d15] p-1 shadow-[0_28px_80px_rgba(90,61,43,0.18)]',
        video: 'rounded-md sepia-[0.12]',
        badge: 'border-[#ead9c4] bg-[#fff8ee] text-[#5a3d2b]',
        titleText: 'A Cozy Preview',
    },
    tropical: {
        section: 'bg-[#effcf8] text-[#064b42]',
        eyebrow: 'text-[#0b8f7b]/75 tracking-[0.34em]',
        title: 'font-serif text-4xl italic text-[#064b42] sm:text-5xl md:text-6xl',
        copy: 'text-[#064b42]/74',
        frame: 'mt-12 rounded-[2rem_5rem_2rem_5rem] border border-[#b7eee4] bg-white/65 p-3 shadow-[0_28px_80px_rgba(11,143,123,0.15)]',
        video: 'rounded-[1.45rem_4.4rem_1.45rem_4.4rem] saturate-110',
        badge: 'border-[#b7eee4] bg-white/80 text-[#064b42]',
        titleText: 'Destination Preview',
    },
    vintage: {
        section: 'bg-[#fbf5ea] text-[#4a3a31]',
        eyebrow: 'text-[#a67c52]/75 tracking-[0.38em]',
        title: 'font-serif text-4xl text-[#4a3a31] sm:text-5xl md:text-6xl',
        copy: 'text-[#4a3a31]/74',
        frame: 'mt-12 rounded-sm border-[16px] border-[#f1dfc4] bg-[#fffaf0] p-1 shadow-[0_28px_80px_rgba(74,58,49,0.17)]',
        video: 'rounded-sm sepia-[0.22]',
        badge: 'border-[#d6b98e] bg-[#fffaf0] text-[#4a3a31]',
        label: 'Keepsake Reel',
        titleText: 'A Keepsake in Motion',
    },
    traditional: {
        section: 'bg-[#fff7ed] text-[#5f422b]',
        eyebrow: 'text-[#8f6a45]/75 tracking-[0.4em]',
        title: 'font-serif text-4xl text-[#5f422b] sm:text-5xl md:text-6xl',
        copy: 'text-[#5f422b]/74',
        frame: 'mt-12 rounded-lg border-[3px] border-double border-[#caa783]/55 bg-white/70 p-3 shadow-[0_28px_80px_rgba(95,66,43,0.16)]',
        video: 'rounded-md',
        badge: 'border-[#caa783]/45 bg-white/85 text-[#5f422b]',
        titleText: 'Ceremony Preview',
    },
    whimsical: {
        section: 'bg-[#fff9fd] text-[#564274]',
        eyebrow: 'text-[#8d7bc4]/75 tracking-[0.34em]',
        title: 'font-serif text-4xl italic text-[#564274] sm:text-5xl md:text-6xl',
        copy: 'text-[#564274]/74',
        frame: 'mt-12 rounded-[3.25rem] border border-[#dcccf4] bg-white/70 p-3 shadow-[0_28px_80px_rgba(141,123,196,0.15)]',
        video: 'rounded-[2.65rem]',
        badge: 'border-[#dcccf4] bg-white/85 text-[#564274]',
        icon: 'sparkles',
        titleText: 'A Playful Preview',
    },
    sakura: {
        section: 'bg-[#fff8fb] text-[#68404f]',
        eyebrow: 'text-[#d88da9]/78 tracking-[0.34em]',
        title: 'font-serif text-4xl italic text-[#68404f] sm:text-5xl md:text-6xl',
        copy: 'text-[#68404f]/74',
        frame: 'mt-12 rounded-[4rem_4rem_1.5rem_1.5rem] border border-[#f0c7d8] bg-white/70 p-3 shadow-[0_28px_80px_rgba(216,141,169,0.15)]',
        video: 'rounded-[3.35rem_3.35rem_1rem_1rem]',
        badge: 'border-[#f0c7d8] bg-white/85 text-[#68404f]',
        titleText: 'Blossom Preview',
    },
    urban: {
        section: 'bg-[#090909] text-white',
        header: 'max-w-6xl text-left',
        eyebrow: 'text-[#ff4d5a]/85 tracking-[0.42em]',
        title: 'font-sans text-4xl font-black uppercase tracking-[-0.03em] text-white sm:text-5xl md:text-7xl',
        copy: 'max-w-xl text-white/76',
        frame: 'mt-10 rounded-none border border-white/15 bg-black p-2 shadow-[18px_18px_0_rgba(255,77,90,0.18)]',
        video: 'rounded-none contrast-110',
        badge: 'border-[#ff4d5a] bg-[#ff4d5a] text-black',
        rail: 'bg-[#ff4d5a]',
        icon: 'play',
        titleText: 'City Motion',
    },
    glitch: {
        section: 'bg-[#05070f] text-white',
        header: 'max-w-6xl text-left',
        eyebrow: 'text-[#4ef2e0]/85 tracking-[0.42em]',
        title: 'font-sans text-4xl font-black uppercase tracking-[-0.03em] text-white sm:text-5xl md:text-7xl',
        copy: 'max-w-xl text-white/76',
        frame: 'mt-10 rounded-none border border-[#4ef2e0]/45 bg-black p-2 shadow-[12px_12px_0_rgba(255,0,153,0.22),-12px_-12px_0_rgba(78,242,224,0.16)]',
        video: 'rounded-none saturate-125 contrast-110',
        badge: 'border-[#4ef2e0] bg-[#4ef2e0] text-black',
        rail: 'bg-[#4ef2e0]',
        icon: 'sparkles',
        titleText: 'Signal Preview',
    },
    vogue: {
        section: 'bg-white text-black',
        header: 'max-w-6xl text-left',
        eyebrow: 'text-black/68 tracking-[0.52em]',
        title: 'font-serif text-5xl uppercase leading-none text-black sm:text-6xl md:text-8xl',
        copy: 'max-w-xl text-black/72',
        frame: 'mt-10 rounded-none border border-black bg-white p-2 shadow-[22px_22px_0_rgba(0,0,0,0.07)]',
        video: 'rounded-none grayscale',
        badge: 'border-black bg-black text-white',
        rail: 'bg-black',
        icon: 'film',
        titleText: 'The Fashion Film',
    },
    elegance: {
        section: 'bg-[#fffcf8] text-[#4a3c33]',
        eyebrow: 'text-[#9b7a5e]/75 tracking-[0.38em]',
        title: 'font-serif text-4xl text-[#4a3c33] sm:text-5xl md:text-6xl',
        copy: 'text-[#4a3c33]/74',
        frame: 'mt-12 rounded-[1.5rem] border border-[#e6d6c9] bg-white/72 p-3 shadow-[0_28px_80px_rgba(74,60,51,0.12)]',
        video: 'rounded-[1rem]',
        badge: 'border-[#e6d6c9] bg-white/85 text-[#4a3c33]',
        titleText: 'Quiet Motion',
    },
    artdeco: {
        section: 'bg-[#121212] text-white',
        eyebrow: 'text-[#c5a059]/80 tracking-[0.5em]',
        title: 'font-serif text-4xl uppercase tracking-[0.18em] text-[#c5a059] sm:text-5xl md:text-6xl',
        copy: 'text-white/78',
        frame: 'mt-12 rounded-none border-[3px] border-double border-[#c5a059]/55 bg-black p-3 shadow-[0_35px_100px_rgba(0,0,0,0.55)]',
        video: 'rounded-none',
        badge: 'border-[#c5a059]/45 bg-[#c5a059] text-black',
        rail: 'bg-[#c5a059]',
        icon: 'sparkles',
        titleText: 'Gilded Preview',
    },
    elopement: {
        section: 'bg-[#f7f4ee] text-[#4d5948]',
        eyebrow: 'text-[#6b7a62]/75 tracking-[0.34em]',
        title: 'font-serif text-4xl italic text-[#4d5948] sm:text-5xl md:text-6xl',
        copy: 'text-[#4d5948]/74',
        frame: 'mt-12 rounded-[2rem] border border-[#dbe3d5] bg-white/70 p-3 shadow-[0_28px_80px_rgba(77,89,72,0.13)]',
        video: 'rounded-[1.5rem]',
        badge: 'border-[#dbe3d5] bg-white/85 text-[#4d5948]',
        titleText: 'The Intimate Preview',
    },
    timeline: {
        section: 'bg-[#f8fafc] text-[#26324a]',
        eyebrow: 'text-[#4d5b7c]/75 tracking-[0.36em]',
        title: 'font-sans text-4xl font-black uppercase text-[#26324a] sm:text-5xl md:text-6xl',
        copy: 'text-[#26324a]/74',
        frame: 'mt-12 rounded-xl border border-[#d7deec] bg-white p-3 shadow-[0_28px_80px_rgba(38,50,74,0.11)]',
        video: 'rounded-lg',
        badge: 'border-[#d7deec] bg-white text-[#26324a]',
        icon: 'play',
        titleText: 'The Day in Motion',
    },
    rsvpfocus: {
        section: 'bg-[#fff9f7] text-[#5c3840]',
        eyebrow: 'text-[#a0616a]/75 tracking-[0.36em]',
        title: 'font-serif text-4xl text-[#5c3840] sm:text-5xl md:text-6xl',
        copy: 'text-[#5c3840]/74',
        frame: 'mt-12 rounded-[2rem] border border-[#e8cfd3] bg-white p-3 shadow-[0_28px_80px_rgba(92,56,64,0.12)]',
        video: 'rounded-[1.45rem]',
        badge: 'border-[#e8cfd3] bg-white text-[#5c3840]',
        icon: 'play',
        titleText: 'Preview Before You RSVP',
    },
};

const STYLE_VARIANT_DESIGNS: Record<string, Partial<TeaserDesign>> = {
    'luxury-planner': {
        section: 'bg-[#fbf7ef] text-[#2b2520]',
        eyebrow: 'text-[#b9975b] tracking-[0.42em]',
        title: 'font-serif text-4xl text-[#2b2520] sm:text-5xl md:text-6xl',
        copy: 'text-[#6f645b]',
        frame: 'mt-12 rounded-none border border-[#b9975b]/35 bg-white p-3 shadow-[0_32px_90px_rgba(43,37,32,0.15)]',
        video: 'rounded-none',
        badge: 'border-[#b9975b]/35 bg-[#2b2520] text-white',
        rail: 'bg-[#b9975b]',
        icon: 'sparkles',
        titleText: 'A Planner’s Preview',
    },
    'editorial-photo': {
        section: 'bg-[#f7f3ee] text-[#201c19]',
        header: 'max-w-6xl text-left',
        titleText: 'The Photo Film',
        bodyText: 'A cinematic companion to the photo story, designed to feel like a wedding magazine feature.',
    },
    'romantic-estate': {
        section: 'bg-[#fff8f5] text-[#55373b]',
        eyebrow: 'text-[#b97983] tracking-[0.34em]',
        title: 'font-serif text-4xl italic text-[#55373b] sm:text-5xl md:text-6xl',
        copy: 'text-[#816066]',
        frame: 'mt-12 rounded-t-full border border-[#efd3d8] bg-white/72 p-3 shadow-[0_28px_80px_rgba(185,121,131,0.14)]',
        video: 'rounded-t-full',
        badge: 'border-[#efd3d8] bg-white/85 text-[#55373b]',
        titleText: 'Estate Preview',
    },
};

function mergeDesign(template?: string | null, templateStyle?: string | null): TeaserDesign {
    const normalizedTemplate = (template || 'classic').toLowerCase();
    const variant = templateStyle && templateStyle !== 'default' ? STYLE_VARIANT_DESIGNS[templateStyle] : undefined;
    return {
        ...DEFAULT_DESIGN,
        ...(DESIGNS[normalizedTemplate] || {}),
        ...(variant || {}),
    };
}

function renderIcon(type: TeaserDesign['icon']) {
    if (type === 'film') return <Film className="h-3.5 w-3.5" />;
    if (type === 'sparkles') return <Sparkles className="h-3.5 w-3.5" />;
    if (type === 'heart') return <Heart className="h-3.5 w-3.5" />;
    return <Play className="h-3.5 w-3.5" />;
}

export default function VideoSection({
    video,
    poster,
    id,
    template,
    motifColor,
    templateStyle,
}: VideoSectionProps) {
    const { registerSection, unregisterSection } = useSectionContext();
    const design = mergeDesign(template, templateStyle);
    const safeMotifColor = motifColor || '#D16C78';

    useEffect(() => {
        registerSection(id, 'Video');
        return () => unregisterSection(id);
    }, [id, registerSection, unregisterSection]);

    if (!video) return null;

    return (
        <section
            id={id}
            className={`relative overflow-hidden ${design.section}`}
            style={{
                backgroundImage: `radial-gradient(circle at 12% 12%, ${motifColor}18, transparent 34%), radial-gradient(circle at 88% 18%, ${motifColor}12, transparent 32%)`,
            }}
        >
            {design.rail && (
                <div className={`absolute left-0 top-0 hidden h-full w-2 ${design.rail} md:block`} />
            )}
            <div className={`relative mx-auto ${design.shell}`}>
                <motion.div
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                    <div className={design.header}>
                        <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase ${design.eyebrow}`}>
                            {renderIcon(design.icon)}
                            {design.label}
                        </span>
                        <h2 className={`qw-section-title mt-5 leading-tight ${design.header.includes('text-left') ? 'mx-0' : ''} ${design.title}`}>
                            {design.titleText}
                        </h2>
                        <p className={`mx-auto mt-5 max-w-2xl text-base leading-7 md:text-lg ${design.copy}`}>
                            {design.bodyText}
                        </p>
                    </div>

                    <div className={`relative mx-auto max-w-5xl ${design.frame}`}>
                        <div className={`absolute left-5 top-5 z-10 inline-flex items-center gap-2 border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.22em] shadow-lg ${design.badge}`}>
                            <Play className="h-3 w-3 fill-current" />
                            Play
                        </div>
                        <video
                            src={video}
                            className={`aspect-video h-auto w-full object-cover ${design.video}`}
                            controls
                            poster={poster}
                            preload="metadata"
                            playsInline
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
