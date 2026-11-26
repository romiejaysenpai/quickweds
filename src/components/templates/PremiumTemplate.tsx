'use client';

import { TemplateElementProvider } from '@/components/wedding/SectionTemplateElement';

import { motion } from 'framer-motion';

import {
    BioSection,
    AttireSection,
    CountdownTimer,
    DetailsSection,
    GallerySection,
    GiftSection,
    TimelineSection,
    VideoSection,
} from '@/components/wedding';
import type { TemplateProps, Wedding } from '@/types/wedding';
import { getSectionTitleStyle } from '@/lib/theme-engine';

import {
    SharedNewSections,
    TEMPLATE_ELEMENT_ASSETS,
    TemplateHeroActions,
    WeddingHeroVisual,
    WeddingMonogram,
    resolveTemplateCopy,
} from './shared';

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

function formatDate(date?: string | null) {
    if (!date) return '';
    const value = new Date(`${date.slice(0, 10)}T12:00:00`);
    return Number.isNaN(value.getTime())
        ? date
        : value.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function Ornament({ theme }: { theme: PremiumTheme }) {
    const color = theme.primary;

    if (theme.ornament === 'star') {
        return (
            <svg viewBox="0 0 400 260" className="pointer-events-none absolute inset-x-0 top-0 h-56 w-full opacity-45" fill="none" aria-hidden="true">
                {[[65, 48, 1], [150, 26, 0.8], [240, 56, 1.2], [335, 34, 0.9], [110, 120, 0.7], [295, 110, 0.85]].map(([x, y, s], i) => (
                    <path key={i} d={`M${x} ${y - 9 * s} L${x + 2 * s} ${y - 2 * s} L${x + 9 * s} ${y} L${x + 2 * s} ${y + 2 * s} L${x} ${y + 9 * s} L${x - 2 * s} ${y + 2 * s} L${x - 9 * s} ${y} L${x - 2 * s} ${y - 2 * s} Z`} fill={color} />
                ))}
                <circle cx="200" cy="40" r="18" stroke={color} strokeWidth="0.7" strokeDasharray="2 3" opacity="0.55" />
            </svg>
        );
    }

    if (theme.ornament === 'grid') {
        return (
            <div
                className="pointer-events-none absolute inset-0 opacity-25"
                aria-hidden="true"
                style={{
                    backgroundImage: `linear-gradient(${color}22 1px, transparent 1px), linear-gradient(90deg, ${color}22 1px, transparent 1px)`,
                    backgroundSize: '44px 44px',
                    maskImage: 'linear-gradient(to bottom, black, transparent 78%)',
                }}
            />
        );
    }

    if (theme.ornament === 'arch') {
        return (
            <svg viewBox="0 0 320 420" className="pointer-events-none absolute -right-12 top-6 h-[24rem] w-auto opacity-30 sm:right-6" fill="none" stroke={color} aria-hidden="true">
                <path d="M40 410V170A120 120 0 0 1 280 170V410" strokeWidth="1.5" />
                <path d="M58 410V170A102 102 0 0 1 262 170V410" strokeWidth="0.8" strokeDasharray="3 4" />
            </svg>
        );
    }

    if (theme.ornament === 'sun') {
        return (
            <svg viewBox="0 0 240 240" className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 opacity-30" fill="none" stroke={color} aria-hidden="true">
                <circle cx="120" cy="120" r="46" strokeWidth="1.2" />
                <circle cx="120" cy="120" r="68" strokeWidth="0.8" strokeDasharray="2 5" />
                {Array.from({ length: 12 }, (_, i) => (
                    <line key={i} x1="120" y1="22" x2="120" y2="42" strokeWidth="1.1" transform={`rotate(${i * 30} 120 120)`} />
                ))}
            </svg>
        );
    }

    if (theme.ornament === 'ribbon') {
        return (
            <svg viewBox="0 0 360 180" className="pointer-events-none absolute -right-10 top-6 h-40 w-auto opacity-25" fill="none" stroke={color} aria-hidden="true">
                <path d="M10 140C90 30 220 160 350 25" strokeWidth="1.4" />
                <path d="M10 155C105 45 235 175 350 42" strokeWidth="0.7" strokeDasharray="3 3" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 260 220" className="pointer-events-none absolute -left-8 -top-6 h-52 w-auto opacity-30" fill="none" stroke={color} strokeWidth="1.1" aria-hidden="true">
            <path d="M20 200Q95 140 210 24M68 156Q88 106 100 62M130 108Q174 114 218 94" />
            {[0, 1, 2, 3].map((i) => (
                <ellipse key={i} cx={64 + i * 36} cy={146 - i * 28} rx="8" ry="18" transform={`rotate(${i % 2 ? 32 : -36} ${64 + i * 36} ${146 - i * 28})`} fill={color} fillOpacity="0.16" />
            ))}
        </svg>
    );
}

const DARK_PREMIUM_TEMPLATES = new Set([
    'moonlit',
    'cinema-noir',
    'regency',
    'orchid-noir',
    'celestial',
    'winter-rose',
]);

function resolvePremiumAsset(templateId: string, ornament: PremiumTheme['ornament']) {
    switch (templateId) {
        case 'heirloom':
            return TEMPLATE_ELEMENT_ASSETS.meadowWreath;
        case 'petal-note':
        case 'orchid-noir':
            return TEMPLATE_ELEMENT_ASSETS.sakuraBranch;
        case 'wildflower':
        case 'saffron':
        case 'marigold-house':
        case 'sunset-ceremony':
            return TEMPLATE_ELEMENT_ASSETS.terracottaFlorals;
        case 'coastal-vow':
            return TEMPLATE_ELEMENT_ASSETS.coastalShells;
        case 'estate':
        case 'the-weekend':
            return TEMPLATE_ELEMENT_ASSETS.waxSeal;
        case 'regency':
            return TEMPLATE_ELEMENT_ASSETS.decoCrest;
        case 'moonlit':
        case 'celestial':
        case 'cinema-noir':
            return TEMPLATE_ELEMENT_ASSETS.celestialAstrolabe;
        case 'modern-vow':
            return TEMPLATE_ELEMENT_ASSETS.nordicPine;
        case 'papercut':
            return TEMPLATE_ELEMENT_ASSETS.vintageCameo;
        case 'lovescript':
        case 'winter-rose':
        case 'atelier':
        case 'gallery':
            return TEMPLATE_ELEMENT_ASSETS.ribbonVelvet;
        default:
            return ornament === 'star'
                ? TEMPLATE_ELEMENT_ASSETS.celestialAstrolabe
                : ornament === 'sun'
                  ? TEMPLATE_ELEMENT_ASSETS.terracottaFlorals
                  : ornament === 'arch'
                    ? TEMPLATE_ELEMENT_ASSETS.waxSeal
                    : ornament === 'ribbon'
                      ? TEMPLATE_ELEMENT_ASSETS.ribbonVelvet
                      : TEMPLATE_ELEMENT_ASSETS.meadowWreath;
    }
}

function PremiumHero({
    wedding,
    gallery,
    theme,
    isDarkSurface,
}: {
    wedding: Wedding;
    gallery?: string[];
    theme: PremiumTheme;
    isDarkSurface: boolean;
}) {
    const image = wedding.hero_image || wedding.couple_photo;
    const titleStyle = getSectionTitleStyle(wedding);
    const hasTitleChoice = Boolean(
        wedding.section_title_color_style && !['default', 'motif'].includes(wedding.section_title_color_style)
    );
    const hasCustomMonogram = Boolean(
        wedding.logo_initials || (wedding.logo_shape && wedding.logo_shape !== 'minimal')
    );
    const copy = resolveTemplateCopy(wedding);
    const ornamentSrc = resolvePremiumAsset(wedding.template, theme.ornament);
    const eyebrow = wedding.is_thank_you_mode || wedding.is_save_the_date ? copy.eyebrow : theme.eyebrow;

    const title = <><span className="block">{wedding.bride_name}</span><span className="my-1 block text-[0.42em] italic font-light" style={{ color: theme.primary }}>&amp;</span><span className="block">{wedding.groom_name}</span></>;

    const imagePanel = (
        <WeddingHeroVisual
            wedding={wedding}
            gallery={gallery}
            src={image}
            ornamentSrc={ornamentSrc}
            dark={isDarkSurface}
            className="h-full w-full"
            imgClassName="h-full w-full object-cover"
        />
    );

    const hasPhotoOverlayHero = (theme.layout === 'cinematic' || theme.layout === 'poster') && Boolean(image);

    return (
        <section className="relative isolate overflow-hidden px-5 py-5 sm:px-8 sm:py-8" style={{ backgroundColor: theme.surface, color: theme.ink }}>
            <div
                className="relative mx-auto min-h-[42rem] max-w-[1440px] overflow-hidden rounded-sm border border-current/15 sm:min-h-[46rem]"
                style={{ backgroundColor: theme.surface }}
            >
                {!isDarkSurface && <div aria-hidden="true" className="qw-paper-grain-overlay" />}
                <Ornament theme={theme} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={ornamentSrc}
                    alt=""
                    aria-hidden="true"
                    className={`pointer-events-none absolute -bottom-6 -right-6 z-0 h-36 w-36 object-contain sm:h-48 sm:w-48 ${
                        isDarkSurface ? 'opacity-20' : 'opacity-25 mix-blend-multiply'
                    }`}
                />

                {theme.layout === 'split' && (
                    <div className="absolute inset-y-0 right-0 hidden w-[52%] p-5 md:block">
                        <div className="h-full overflow-hidden rounded-[1.55rem]">{imagePanel}</div>
                    </div>
                )}
                {(theme.layout === 'cinematic' || theme.layout === 'poster') && (
                    <div className={`absolute inset-0 ${image ? '' : 'opacity-15'}`}>
                        {imagePanel}
                        {image ? <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/45 to-black/65" /> : null}
                    </div>
                )}
                {theme.layout === 'invitation' && image && (
                    <div className="absolute inset-0 opacity-20"><div className="h-full w-full scale-110 blur-sm">{imagePanel}</div></div>
                )}

                <motion.div
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    className={`relative z-10 flex min-h-[42rem] flex-col justify-center px-7 py-16 text-center sm:px-16 sm:py-20 ${theme.layout === 'split' ? 'md:w-[54%] md:text-left' : ''} ${hasPhotoOverlayHero ? 'text-white' : ''}`}
                >
                    {hasCustomMonogram && (
                        <div className={`mb-5 ${theme.layout === 'split' ? 'md:self-start' : 'mx-auto'}`}>
                            <WeddingMonogram wedding={wedding} />
                        </div>
                    )}
                    <p className="text-[10px] font-bold uppercase tracking-[0.32em] opacity-75 sm:text-xs">{eyebrow}</p>
                    <div className={`my-7 h-px w-16 opacity-70 ${theme.layout === 'split' ? 'md:mx-0 mx-auto' : 'mx-auto'}`} style={{ backgroundColor: theme.primary }} />
                    <h1
                        className={`font-serif leading-[1.05] tracking-[-0.055em] ${theme.layout === 'editorial' ? 'text-5xl sm:text-7xl lg:text-[8rem]' : 'text-5xl sm:text-7xl lg:text-8xl'} ${titleStyle.className}`}
                        style={hasTitleChoice ? titleStyle.style : undefined}
                    >
                        {title}
                    </h1>
                    <p className={`mt-8 max-w-md text-sm leading-7 opacity-80 sm:text-base ${theme.layout === 'split' ? 'md:mx-0 mx-auto' : 'mx-auto'}`}>
                        {wedding.is_thank_you_mode || wedding.is_save_the_date ? copy.subtitle : theme.mood}
                    </p>
                    <div className="mt-10 flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.25em] opacity-80 sm:text-xs">
                        <span>{formatDate(wedding.wedding_date)}</span>
                        <span className="opacity-60">{wedding.venue_name}</span>
                    </div>
                    <div className={`mt-8 flex flex-col gap-3 ${theme.layout === 'split' ? 'md:items-start items-center' : 'items-center'}`}>
                        <a
                            href={copy.ctaHref}
                            data-wedding-control="primary"
                            className="inline-flex min-h-12 items-center justify-center border border-current px-8 py-3 text-sm tracking-wide transition hover:bg-current/10"
                        >
                            {copy.ctaLabel}
                        </a>
                        <TemplateHeroActions
                            wedding={wedding}
                            variant={isDarkSurface || hasPhotoOverlayHero ? 'noir' : 'editorial'}
                            motifColor={theme.primary}
                            className={theme.layout === 'split' ? 'justify-center md:justify-start' : 'justify-center'}
                        />
                    </div>
                    {theme.layout === 'split' && <div className="mt-10 overflow-hidden rounded-[1.5rem] md:hidden"><div className="aspect-[4/5]">{imagePanel}</div></div>}
                    {theme.layout === 'editorial' && image && (
                        <div className="mx-auto mt-10 w-full max-w-3xl overflow-hidden border border-current/15 shadow-sm">
                            <div className="aspect-[16/10]">{imagePanel}</div>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}

export default function PremiumTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const baseTheme = PREMIUM_THEMES[wedding.template] || PREMIUM_THEMES.heirloom;
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const isDarkSurface = DARK_PREMIUM_TEMPLATES.has(wedding.template) && !hasBackgroundChoice;
    const theme = { ...baseTheme, primary: wedding.motif_color || baseTheme.primary, ...(hasBackgroundChoice ? { surface: 'var(--builder-paper)', ink: 'var(--builder-ink)' } : {}) };
    const themedWedding = { ...wedding, template: theme.baseTemplate };

    return (
        <TemplateElementProvider template={wedding.template}>
            <div
                data-card-style={wedding.card_style}
                className="relative"
                style={{ backgroundColor: theme.surface, color: theme.ink }}
            >
                <PremiumHero wedding={wedding} gallery={gallery} theme={theme} isDarkSurface={isDarkSurface} />
                <div className="relative overflow-x-clip" style={{ background: `linear-gradient(180deg, ${theme.surface} 0%, ${theme.secondary}55 45%, ${theme.surface} 100%)` }}>
                    <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[44rem] -translate-x-1/2 rounded-full blur-3xl" style={{ backgroundColor: `${theme.primary}12` }} />
                    <div className="relative z-10">
                        <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} template={theme.baseTemplate} motifColor={theme.primary} templateStyle={wedding.template_style} wedding={themedWedding} />
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
                                cardStyle={wedding.card_style}
                                wedding={themedWedding}
                            />
                        )}
                        <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={themedWedding} />
                        <GallerySection id="gallery" gallery={gallery} template={theme.baseTemplate} motifColor={theme.primary} galleryLayout={wedding.gallery_layout} cardStyle={wedding.card_style} wedding={themedWedding} />
                        <AttireSection wedding={themedWedding} />
                        <GiftSection id="gift" wedding={themedWedding} />
                        <SharedNewSections id="additional" wedding={themedWedding} isExpired={isExpired} />
                    </div>
                </div>
            </div>
        </TemplateElementProvider>
    );
}
