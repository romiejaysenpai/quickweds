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

type PremiumLayout = 'invitation' | 'split' | 'cinematic' | 'editorial' | 'poster' | 'bento' | 'arch';

type PremiumTheme = {
    eyebrow: string;
    mood: string;
    primary: string;
    secondary: string;
    surface: string;
    ink: string;
    layout: PremiumLayout;
    baseTemplate: string;
    ornament: 'botanical' | 'arch' | 'ribbon' | 'star' | 'sun' | 'grid' | 'tile' | 'disco' | 'filmstrip' | 'aura' | 'washi' | 'bauhaus' | 'stamp';
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

    // 20 New Trending Styles
    kinfolk: { eyebrow: 'The Minimal Atelier', mood: 'Understated elegance, quiet luxury, and timeless serenity', primary: '#8E8A82', secondary: '#F3EFEA', surface: '#FBF9F5', ink: '#1C1B19', layout: 'editorial', baseTemplate: 'minimal', ornament: 'grid' },
    neobrutalist: { eyebrow: 'Bold & Unapologetic', mood: "We're getting hitched! High contrast, big energy, pure joy", primary: '#FF5E5B', secondary: '#FFE169', surface: '#FFFDF7', ink: '#0A0A0A', layout: 'bento', baseTemplate: 'urban', ornament: 'bauhaus' },
    highfashion: { eyebrow: 'Monochrome Maison', mood: 'Haute couture editorial, timeless black & white drama', primary: '#D4AF37', secondary: '#262626', surface: '#111111', ink: '#F5F5F5', layout: 'split', baseTemplate: 'vogue', ornament: 'grid' },
    glassbotanical: { eyebrow: 'The Lucent Flora', mood: 'Frosted crystal luminescence and floating botanical petals', primary: '#7FA073', secondary: '#E8F5E9', surface: '#F7FCF9', ink: '#2E382E', layout: 'invitation', baseTemplate: 'garden', ornament: 'botanical' },
    cyberromantic: { eyebrow: 'Iridescent Y2K Glam', mood: 'Chrome glows, holographic dreamscapes, and future romance', primary: '#FF80BF', secondary: '#2A1B3D', surface: '#0B0C10', ink: '#F8FAFC', layout: 'cinematic', baseTemplate: 'glitch', ornament: 'aura' },
    amalfi: { eyebrow: 'La Dolce Vita', mood: 'Capri lemon groves, majolica tiles, and sunlit coastal vows', primary: '#1C4E80', secondary: '#FDF3D6', surface: '#FFFDF7', ink: '#1E252B', layout: 'split', baseTemplate: 'riviera', ornament: 'tile' },
    japandi: { eyebrow: 'Zen & Naturalis', mood: 'Washi textures, organic simplicity, and quiet breathing room', primary: '#8B9A82', secondary: '#EAE6DD', surface: '#F2EFE9', ink: '#282828', layout: 'editorial', baseTemplate: 'nordic', ornament: 'washi' },
    desertmirage: { eyebrow: 'Sun-Bleached Dune', mood: 'Warm terracotta arches, desert agave, and golden hour light', primary: '#C86D51', secondary: '#F5E4D3', surface: '#FBF3E8', ink: '#3D2C28', layout: 'arch', baseTemplate: 'boho', ornament: 'sun' },
    chateau: { eyebrow: 'Toile de Jouy', mood: 'Gilded ballroom chandeliers, Sèvres blue, and Parisian romance', primary: '#335C81', secondary: '#F0E6D2', surface: '#FAF8F5', ink: '#2B2D42', layout: 'invitation', baseTemplate: 'royal', ornament: 'arch' },
    travelogue: { eyebrow: 'The Grand Voyage', mood: 'Passport stamps, vintage airmail, and a lifetime of adventures together', primary: '#C0392B', secondary: '#E6EFF5', surface: '#F8F6F0', ink: '#2C3E50', layout: 'poster', baseTemplate: 'vintage', ornament: 'stamp' },
    gothicnoir: { eyebrow: 'Midnight Masquerade', mood: 'Deep bordeaux velvet, obsidian shadows, and candlelit romance', primary: '#9E2A2B', secondary: '#25161C', surface: '#0D0E11', ink: '#EDEDED', layout: 'cinematic', baseTemplate: 'midnight', ornament: 'ribbon' },
    discofever: { eyebrow: 'The Golden Groove', mood: '70s dancefloor warmth, spinning vinyl records, and golden sparkle', primary: '#E39B00', secondary: '#FCE7C8', surface: '#FFF8EE', ink: '#382218', layout: 'poster', baseTemplate: 'whimsical', ornament: 'disco' },
    baroque: { eyebrow: 'The Gilded Dynasty', mood: 'Heritage crests, royal navy velvet, and 24-karat gold filigree', primary: '#D4AF37', secondary: '#1A2744', surface: '#FAF7F2', ink: '#0A192F', layout: 'invitation', baseTemplate: 'artdeco', ornament: 'arch' },
    lofifilm: { eyebrow: 'Film Strip Nostalgia', mood: '35mm grain, Kodak warm amber glow, and honest candid memories', primary: '#FF9F1C', secondary: '#382818', surface: '#181818', ink: '#EAEAEA', layout: 'cinematic', baseTemplate: 'film', ornament: 'filmstrip' },
    stargazer: { eyebrow: 'The Cosmic Union', mood: 'Zodiac constellations, lunar glow, and love written in the stardust', primary: '#F5D061', secondary: '#22193E', surface: '#0B0F19', ink: '#F8FAFC', layout: 'cinematic', baseTemplate: 'celestial', ornament: 'star' },
    cottagecore: { eyebrow: 'The Herbarium Notebook', mood: 'Pressed wildflower petals, botanical gardens, and handwritten vows', primary: '#5E7153', secondary: '#EBE2DC', surface: '#FAF6F0', ink: '#3A3335', layout: 'invitation', baseTemplate: 'garden', ornament: 'botanical' },
    bauhaus: { eyebrow: 'Modern Artiste', mood: 'Bauhaus geometry, bold color blocks, and structured artistic love', primary: '#1D4ED8', secondary: '#FEE2E2', surface: '#F8FAFC', ink: '#0F172A', layout: 'bento', baseTemplate: 'editorial', ornament: 'bauhaus' },
    nordicdrift: { eyebrow: 'Hygge Hearth', mood: 'Alpine pines, cozy fireplaces, and warm Scandinavian minimalism', primary: '#D97706', secondary: '#E2E8F0', surface: '#F7F5F0', ink: '#1A202C', layout: 'split', baseTemplate: 'nordic', ornament: 'arch' },
    sunsetriviera: { eyebrow: 'Golden Hour Glow', mood: 'Multi-color sunset mesh gradients, champagne toasts, and warm ocean breeze', primary: '#F43F5E', secondary: '#FFE4E6', surface: '#FFF8F6', ink: '#1E1B4B', layout: 'split', baseTemplate: 'riviera', ornament: 'aura' },
    storybook: { eyebrow: 'Memory Collage', mood: 'Washi tapes, keepsake polaroids, and our sweetest story chapters', primary: '#E07A5F', secondary: '#FBECE7', surface: '#F8F4EB', ink: '#2B2D42', layout: 'invitation', baseTemplate: 'romantic', ornament: 'washi' },
};

function formatDate(date: string) {
    if (!date) return '';
    const value = new Date(date);
    return Number.isNaN(value.getTime())
        ? date
        : value.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function Ornament({ theme }: { theme: PremiumTheme }) {
    const color = theme.primary;

    if (theme.ornament === 'star') {
        return <div className="absolute inset-0 opacity-70" aria-hidden="true" style={{ backgroundImage: `radial-gradient(${color} 1.5px, transparent 1.5px)`, backgroundSize: '32px 32px', maskImage: 'linear-gradient(to bottom, black, transparent 70%)' }} />;
    }

    if (theme.ornament === 'grid') {
        return <div className="absolute inset-0 opacity-30" aria-hidden="true" style={{ backgroundImage: `linear-gradient(${color}22 1px, transparent 1px), linear-gradient(90deg, ${color}22 1px, transparent 1px)`, backgroundSize: '44px 44px', maskImage: 'linear-gradient(to bottom, black, transparent 78%)' }} />;
    }

    if (theme.ornament === 'tile') {
        return <div className="absolute inset-0 opacity-25" aria-hidden="true" style={{ backgroundImage: `radial-gradient(circle, ${color} 2px, transparent 3px), linear-gradient(45deg, transparent 48%, ${color}33 49%, ${color}33 51%, transparent 52%)`, backgroundSize: '40px 40px', maskImage: 'linear-gradient(to bottom, black, transparent 85%)' }} />;
    }

    if (theme.ornament === 'aura') {
        return <>
            <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full opacity-40 blur-3xl animate-pulse" aria-hidden="true" style={{ backgroundColor: color }} />
            <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full opacity-35 blur-3xl" aria-hidden="true" style={{ backgroundColor: theme.secondary }} />
        </>;
    }

    if (theme.ornament === 'disco') {
        return <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-30" aria-hidden="true" style={{ background: `radial-gradient(circle, ${color} 0 15%, transparent 16% 25%, ${color} 26% 35%, transparent 36% 48%, ${color} 49% 60%, transparent 61%)` }} />;
    }

    if (theme.ornament === 'filmstrip') {
        return (
            <div className="absolute inset-x-0 top-0 flex justify-between px-4 py-2 opacity-40" aria-hidden="true">
                <div className="flex gap-3">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-3 w-4 rounded-sm border border-white/40 bg-white/20" />)}</div>
                <div className="flex gap-3">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-3 w-4 rounded-sm border border-white/40 bg-white/20" />)}</div>
            </div>
        );
    }

    if (theme.ornament === 'bauhaus') {
        return <>
            <div className="absolute -left-12 -top-12 h-44 w-44 rounded-full opacity-30" aria-hidden="true" style={{ backgroundColor: color }} />
            <div className="absolute -right-8 top-20 h-36 w-36 rotate-12 border-4 opacity-25" aria-hidden="true" style={{ borderColor: color }} />
        </>;
    }

    if (theme.ornament === 'washi') {
        return <div className="absolute left-8 top-4 h-6 w-24 -rotate-3 rounded-sm opacity-40 shadow-sm" aria-hidden="true" style={{ backgroundColor: color }} />;
    }

    if (theme.ornament === 'stamp') {
        return <div className="absolute right-8 top-8 h-20 w-28 -rotate-6 border-2 border-dashed opacity-40" aria-hidden="true" style={{ borderColor: color }} />;
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
            <div className={`relative mx-auto min-h-[42rem] max-w-[1440px] overflow-hidden rounded-[2rem] border border-white/30 shadow-[0_30px_100px_rgba(29,22,20,0.18)] sm:min-h-[46rem] ${theme.layout === 'bento' ? 'border-2 border-black/80 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]' : ''}`} style={{ backgroundColor: theme.surface }}>
                <Ornament theme={theme} />

                {theme.layout === 'split' && (
                    <div className="absolute inset-y-0 right-0 hidden w-[52%] p-5 md:block">
                        <div className="h-full overflow-hidden rounded-[1.55rem]">{imagePanel}</div>
                    </div>
                )}
                {theme.layout === 'arch' && (
                    <div className="absolute inset-y-0 right-0 hidden w-[48%] p-6 md:block">
                        <div className="h-full overflow-hidden rounded-t-full rounded-b-2xl border-4 shadow-xl" style={{ borderColor: theme.primary }}>{imagePanel}</div>
                    </div>
                )}
                {theme.layout === 'bento' && (
                    <div className="absolute inset-y-0 right-0 hidden w-[48%] p-6 md:block">
                        <div className="h-full overflow-hidden rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">{imagePanel}</div>
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
                    className={`relative z-10 flex min-h-[42rem] flex-col justify-center px-7 py-16 text-center sm:px-16 sm:py-20 ${(theme.layout === 'split' || theme.layout === 'arch' || theme.layout === 'bento') ? 'md:w-[52%] md:text-left' : ''} ${(theme.layout === 'cinematic' || theme.layout === 'poster') ? 'text-white' : ''}`}
                >
                    <p className={`text-[10px] font-bold uppercase tracking-[0.32em] opacity-75 sm:text-xs ${theme.layout === 'bento' ? 'bg-black text-white px-3 py-1 rounded-sm w-fit mx-auto md:mx-0' : ''}`}>{theme.eyebrow}</p>
                    <div className="mx-auto my-7 h-px w-16 opacity-70 md:mx-0" style={{ backgroundColor: theme.primary }} />
                    <h1 className={`font-serif leading-[0.82] tracking-[-0.055em] ${theme.layout === 'editorial' ? 'text-5xl sm:text-7xl lg:text-[8rem]' : 'text-5xl sm:text-7xl lg:text-8xl'}`}>
                        {title}
                    </h1>
                    <p className="mt-8 max-w-md text-sm leading-7 opacity-80 sm:text-base md:mx-0">{theme.mood}</p>
                    <div className={`mt-10 flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.25em] opacity-80 sm:text-xs ${theme.layout === 'bento' ? 'p-3 border border-black/40 rounded-lg bg-white/80 w-fit mx-auto md:mx-0' : ''}`}>
                        <span>{formatDate(wedding.wedding_date)}</span>
                        <span className="opacity-60">{wedding.venue_name}</span>
                    </div>
                    {(theme.layout === 'split' || theme.layout === 'arch' || theme.layout === 'bento') && <div className="mt-10 overflow-hidden rounded-[1.5rem] md:hidden"><div className="aspect-[4/3]">{imagePanel}</div></div>}
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
                            weddingTime={wedding.wedding_time} eventTimezone={wedding.event_timezone}
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
