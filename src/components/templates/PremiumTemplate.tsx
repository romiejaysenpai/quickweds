'use client';

import { motion } from 'framer-motion';

import {
    BioSection,
    CountdownTimer,
    DetailsSection,
    GallerySection,
    GiftSection,
    SafeWeddingImage,
    TimelineSection,
    VideoSection,
} from '@/components/wedding';
import type { TemplateProps, Wedding } from '@/types/wedding';

import { SharedNewSections } from './shared';

type PremiumLayout = 'invitation' | 'split' | 'cinematic' | 'editorial' | 'poster';

type PremiumTheme = {
    eyebrow: string;
    mood: string;
    primary: string;
    secondary: string;
    surface: string;
    ink: string;
    layout: PremiumLayout;
    baseTemplate: string;
    ornament: 'botanical' | 'arch' | 'ribbon' | 'star' | 'sun' | 'grid';
};

const PREMIUM_THEMES: Record<string, PremiumTheme> = {
    heirloom: { eyebrow: 'A painted invitation', mood: 'Gather with us for a day in bloom', primary: '#6A7D54', secondary: '#DDE7CC', surface: '#FFFCF5', ink: '#293327', layout: 'invitation', baseTemplate: 'garden', ornament: 'botanical' },
    estate: { eyebrow: 'A country-house celebration', mood: 'A weekend of fine company', primary: '#7D705B', secondary: '#E5DED0', surface: '#FAF8F1', ink: '#322C23', layout: 'split', baseTemplate: 'elegance', ornament: 'arch' },
    moonlit: { eyebrow: 'After dark', mood: 'A love story under the moon', primary: '#D8C494', secondary: '#293048', surface: '#0D101B', ink: '#FBF7EA', layout: 'cinematic', baseTemplate: 'midnight', ornament: 'star' },
    saffron: { eyebrow: 'A heritage celebration', mood: 'Joy, color, and a house full of love', primary: '#B65B2A', secondary: '#F5D79E', surface: '#FFF5E5', ink: '#542712', layout: 'poster', baseTemplate: 'traditional', ornament: 'sun' },
    'cinema-noir': { eyebrow: 'Love on film', mood: 'One night. Forever remembered.', primary: '#C78A63', secondary: '#422D2B', surface: '#0D0C0C', ink: '#FFF8F0', layout: 'cinematic', baseTemplate: 'cinematic', ornament: 'ribbon' },
    'modern-vow': { eyebrow: 'A contemporary union', mood: 'Save the date for the good stuff', primary: '#437E70', secondary: '#DCEEE8', surface: '#F7FCF9', ink: '#193C34', layout: 'editorial', baseTemplate: 'minimal', ornament: 'grid' },
    atelier: { eyebrow: 'The wedding edit', mood: 'A celebration in our own words', primary: '#332B2B', secondary: '#E9E4DF', surface: '#FCFBFA', ink: '#201A1A', layout: 'editorial', baseTemplate: 'editorial', ornament: 'grid' },
    wildflower: { eyebrow: 'Free-spirited love', mood: 'Long tables, wild blooms, open skies', primary: '#B46C52', secondary: '#F2D8C7', surface: '#FFF8F2', ink: '#553326', layout: 'invitation', baseTemplate: 'boho', ornament: 'botanical' },
    regency: { eyebrow: 'A black-tie affair', mood: 'By candlelight and with great joy', primary: '#C8A962', secondary: '#242430', surface: '#0C0D12', ink: '#FCF7E8', layout: 'poster', baseTemplate: 'royal', ornament: 'arch' },
    lovescript: { eyebrow: 'Written with love', mood: 'A small story with a very happy ending', primary: '#B76883', secondary: '#F3DFE7', surface: '#FFF9FB', ink: '#4E2334', layout: 'invitation', baseTemplate: 'romantic', ornament: 'ribbon' },
    'coastal-vow': { eyebrow: 'By the sea', mood: 'Salt air, sunset vows, and our favorite people', primary: '#2C7891', secondary: '#CDE9EC', surface: '#F5FCFC', ink: '#123E4A', layout: 'split', baseTemplate: 'tropical', ornament: 'sun' },
    'orchid-noir': { eyebrow: 'An evening in bloom', mood: 'A floral love story with a little drama', primary: '#8D5273', secondary: '#2E1E30', surface: '#120D13', ink: '#FFF8FC', layout: 'cinematic', baseTemplate: 'midnight', ornament: 'botanical' },
    papercut: { eyebrow: 'A modern invitation', mood: 'One beautiful day, thoughtfully made', primary: '#E06D48', secondary: '#FAE3D8', surface: '#FFF9F5', ink: '#34201A', layout: 'editorial', baseTemplate: 'minimal', ornament: 'grid' },
    celestial: { eyebrow: 'Written in the stars', mood: 'Meet us beneath a sky full of promise', primary: '#9BADE0', secondary: '#1E2748', surface: '#11162A', ink: '#F9FAFF', layout: 'poster', baseTemplate: 'midnight', ornament: 'star' },
    'marigold-house': { eyebrow: 'A joyful gathering', mood: 'Music, color, and generations together', primary: '#C56A16', secondary: '#F8D575', surface: '#FFF6DC', ink: '#572C0A', layout: 'poster', baseTemplate: 'traditional', ornament: 'sun' },
    'the-weekend': { eyebrow: 'Our wedding weekend', mood: 'Check in, slow down, celebrate with us', primary: '#5A6C62', secondary: '#D9E0D4', surface: '#F8FAF5', ink: '#26372E', layout: 'split', baseTemplate: 'elegance', ornament: 'arch' },
    'winter-rose': { eyebrow: 'A winter celebration', mood: 'Velvet evenings and a room full of roses', primary: '#A33D4A', secondary: '#341A24', surface: '#150D11', ink: '#FFF9F5', layout: 'cinematic', baseTemplate: 'royal', ornament: 'ribbon' },
    gallery: { eyebrow: 'A gallery of us', mood: 'An artful day for our favorite masterpiece', primary: '#6C5A46', secondary: '#E8E1D7', surface: '#FBFAF8', ink: '#28221D', layout: 'editorial', baseTemplate: 'editorial', ornament: 'grid' },
    'petal-note': { eyebrow: 'A note for you', mood: 'Come celebrate the little things with us', primary: '#C8889A', secondary: '#F6E2E8', surface: '#FFF9FB', ink: '#542B3A', layout: 'invitation', baseTemplate: 'romantic', ornament: 'botanical' },
    'sunset-ceremony': { eyebrow: 'Meet us at golden hour', mood: 'A destination celebration at the edge of day', primary: '#D4774F', secondary: '#F5D3A5', surface: '#FFF6EC', ink: '#59301D', layout: 'split', baseTemplate: 'boho', ornament: 'sun' },
};

function formatDate(date: string) {
    const value = new Date(date);
    return Number.isNaN(value.getTime()) ? date : value.toLocaleDateString(undefined, { dateStyle: 'long' });
}

function Ornament({ theme }: { theme: PremiumTheme }) {
    const color = theme.primary;

    if (theme.ornament === 'star') {
        return <div className="absolute inset-0 opacity-70" aria-hidden="true" style={{ backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`, backgroundSize: '32px 32px', maskImage: 'linear-gradient(to bottom, black, transparent 70%)' }} />;
    }

    if (theme.ornament === 'grid') {
        return <div className="absolute inset-0 opacity-30" aria-hidden="true" style={{ backgroundImage: `linear-gradient(${color}22 1px, transparent 1px), linear-gradient(90deg, ${color}22 1px, transparent 1px)`, backgroundSize: '44px 44px', maskImage: 'linear-gradient(to bottom, black, transparent 78%)' }} />;
    }

    if (theme.ornament === 'arch') {
        return <div className="absolute -right-20 top-12 h-[26rem] w-[18rem] rounded-t-full border-[18px] opacity-35 sm:right-8" aria-hidden="true" style={{ borderColor: color }} />;
    }

    if (theme.ornament === 'sun') {
        return <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full opacity-30 blur-[1px]" aria-hidden="true" style={{ background: `radial-gradient(circle, ${color} 0 25%, transparent 26% 34%, ${color} 35% 36%, transparent 37% 43%, ${color} 44% 45%, transparent 46%)` }} />;
    }

    if (theme.ornament === 'ribbon') {
        return <div className="absolute -right-16 top-16 h-40 w-[34rem] -rotate-12 opacity-25" aria-hidden="true" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />;
    }

    return <>
        <div className="absolute -left-20 top-16 h-72 w-72 rounded-full opacity-25 blur-3xl" aria-hidden="true" style={{ backgroundColor: color }} />
        <div className="absolute -right-24 bottom-0 h-64 w-64 rounded-full opacity-20 blur-3xl" aria-hidden="true" style={{ backgroundColor: color }} />
    </>;
}

function PremiumHero({ wedding, theme }: { wedding: Wedding; theme: PremiumTheme }) {
    const image = wedding.hero_image || wedding.couple_photo;
    const title = <><span className="block">{wedding.bride_name}</span><span className="my-1 block text-[0.42em] italic font-light" style={{ color: theme.primary }}>&amp;</span><span className="block">{wedding.groom_name}</span></>;

    const imagePanel = image ? (
        <SafeWeddingImage
            src={image}
            alt={`${wedding.bride_name} and ${wedding.groom_name}`}
            fallbackText={wedding.logo_initials}
            className="h-full w-full object-cover"
        />
    ) : <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${theme.secondary}, ${theme.primary}55)` }} />;

    return (
        <section className="relative isolate overflow-hidden px-5 py-5 sm:px-8 sm:py-8" style={{ backgroundColor: theme.surface, color: theme.ink }}>
            <div className="relative mx-auto min-h-[42rem] max-w-[1440px] overflow-hidden rounded-[2rem] border border-white/30 shadow-[0_30px_100px_rgba(29,22,20,0.18)] sm:min-h-[46rem]" style={{ backgroundColor: theme.surface }}>
                <Ornament theme={theme} />

                {theme.layout === 'split' && (
                    <div className="absolute inset-y-0 right-0 hidden w-[52%] p-5 md:block">
                        <div className="h-full overflow-hidden rounded-[1.55rem]">{imagePanel}</div>
                    </div>
                )}
                {(theme.layout === 'cinematic' || theme.layout === 'poster') && (
                    <div className="absolute inset-0">{imagePanel}<div className="absolute inset-0 bg-black/45" /></div>
                )}
                {theme.layout === 'invitation' && image && (
                    <div className="absolute inset-0 opacity-20"><div className="h-full w-full scale-110 blur-sm">{imagePanel}</div></div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`relative z-10 flex min-h-[42rem] flex-col justify-center px-7 py-16 text-center sm:px-16 sm:py-20 ${theme.layout === 'split' ? 'md:w-[54%] md:text-left' : ''} ${(theme.layout === 'cinematic' || theme.layout === 'poster') ? 'text-white' : ''}`}
                >
                    <p className="text-[10px] font-bold uppercase tracking-[0.32em] opacity-75 sm:text-xs">{theme.eyebrow}</p>
                    <div className="mx-auto my-7 h-px w-16 opacity-70 md:mx-0" style={{ backgroundColor: theme.primary }} />
                    <h1 className={`font-serif leading-[0.82] tracking-[-0.055em] ${theme.layout === 'editorial' ? 'text-5xl sm:text-7xl lg:text-[8rem]' : 'text-5xl sm:text-7xl lg:text-8xl'}`}>
                        {title}
                    </h1>
                    <p className="mt-8 max-w-md text-sm leading-7 opacity-80 sm:text-base md:mx-0">{theme.mood}</p>
                    <div className="mt-10 flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.25em] opacity-80 sm:text-xs">
                        <span>{formatDate(wedding.wedding_date)}</span>
                        <span className="opacity-60">{wedding.venue_name}</span>
                    </div>
                    {theme.layout === 'split' && <div className="mt-10 overflow-hidden rounded-[1.5rem] md:hidden"><div className="aspect-[4/3]">{imagePanel}</div></div>}
                </motion.div>
            </div>
        </section>
    );
}

export default function PremiumTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const theme = PREMIUM_THEMES[wedding.template] || PREMIUM_THEMES.heirloom;
    const themedWedding = { ...wedding, template: theme.baseTemplate };

    return (
        <div style={{ backgroundColor: theme.surface, color: theme.ink }}>
            <PremiumHero wedding={wedding} theme={theme} />
            <div className="relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${theme.surface} 0%, ${theme.secondary}55 45%, ${theme.surface} 100%)` }}>
                <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[44rem] -translate-x-1/2 rounded-full blur-3xl" style={{ backgroundColor: `${theme.primary}12` }} />
                <div className="relative z-10">
                    <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} />
                    <BioSection id="bio" wedding={themedWedding} />
                    <DetailsSection id="details" wedding={themedWedding} />
                    {!wedding.is_thank_you_mode && (
                        <CountdownTimer
                            id="countdown"
                            weddingDate={wedding.wedding_date}
                            weddingTime={wedding.wedding_time}
                            brideName={wedding.bride_name}
                            groomName={wedding.groom_name}
                            venueName={wedding.venue_name}
                            venueAddress={wedding.venue_address}
                            template={theme.baseTemplate}
                            motifColor={theme.primary}
                        />
                    )}
                    <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={themedWedding} />
                    <GallerySection id="gallery" gallery={gallery} template={theme.baseTemplate} motifColor={theme.primary} />
                    <GiftSection id="gift" wedding={themedWedding} />
                    <SharedNewSections id="additional" wedding={themedWedding} isExpired={isExpired} />
                </div>
            </div>
        </div>
    );
}
