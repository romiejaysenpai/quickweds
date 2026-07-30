'use client';

import { memo, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, MapPin, Palette, CheckCircle2, ArrowRight, ArrowLeft, Send, Camera, Image as ImageIcon, Video, X, Layout, Sparkles, Plus, Trash2, Link as LinkIcon, DollarSign, Music, Shirt, Undo2, Redo2, ChevronDown, Eye, Smartphone, Clock, HelpCircle, FileSpreadsheet, Upload, AlertCircle, Download, Lock, Play } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import AttireIllustration from './AttireIllustration';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import GenerationLoading from './GenerationLoading';
import { useAuth } from '@/context/AuthContext';
import UpgradeButton from './UpgradeButton';
import LivePreview from './LivePreview';
import MarketplacePanel from './builder/MarketplacePanel';
import { MONOGRAM_SHAPES, MONOGRAM_ANIMATIONS, MonogramMark } from './MonogramMark';
import { MonogramExporter } from './MonogramExporter';
import DecorativeLayer from './DecorativeLayer';
import { useLocalUndoRedo } from '@/components/UndoRedoProvider';
import { hasAccountPro } from '@/lib/account';
import {
    DEFAULT_TEMPLATE_STYLE,
    FREE_TEMPLATE_IDS,
    TEMPLATES,
    getTemplateStyleVariants,
    isTemplateStyleAvailable,
} from '@/lib/template-catalog';
import {
    SECTION_BLOCK_LIBRARY,
    buildPresetPayload,
    deleteTemplatePreset,
    listTemplatePresets,
    saveTemplatePreset,
    type WeddingTemplatePreset,
} from '@/lib/wedding-features';
import {
    createWeddingSlugBase,
    isMissingPublicSlugColumnError,
    sanitizeWeddingSlug,
} from '@/lib/wedding-slugs';
import { getCachedSession } from '@/lib/session-cache';
import { hasStoredSupabaseSession } from '@/lib/supabase-auth';
import { CARD_CONTAINER_STYLES, getMotifSectionTitleGradient, SECTION_TITLE_COLOR_STYLES, SECTION_TITLE_FONT_STYLES } from '@/lib/theme-engine';
import { parseCsv } from '@/lib/guest-list';
import {
    DEFAULT_ENTOURAGE_PROPOSAL_TEMPLATE_KEY,
    ENTOURAGE_PROPOSAL_TEMPLATES,
    getEntourageProposalTemplate,
    getEntourageCardTheme,
    type EntourageProposalTemplateKey,
} from '@/lib/entourage-proposal-templates';
import { EntourageProposalCustomizerSection } from './EntourageProposalCustomizerSection';
import {
    evaluateWeddingPublishHealth,
    type WeddingPublishHealthSummary,
} from '@/lib/wedding-health';
import { parseDressCodeValue, serializeDressCodeValue } from '@/lib/dress-code';
import { getSafeMonogramConfig } from '@/lib/monogram';
import { createMonogramWebm, downloadMonogramImage, requestMonogramMp4 } from '@/lib/monogram-export';

// Helper component for collapsible sections
const Collapsible = memo(function Collapsible({ title, children, isOpen, onToggle, icon: Icon }: { title: string, children: React.ReactNode, isOpen: boolean, onToggle: () => void, icon?: any }) {
    return (
    <div className="border border-border rounded-2xl overflow-hidden bg-white/50 mb-3 transition-all duration-300">
        <button
            type="button"
            onClick={onToggle}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-primary/5 transition-colors"
        >
            <div className="flex items-center gap-3">
                {Icon && <Icon className={`w-4 h-4 ${isOpen ? 'text-primary' : 'text-text-secondary'}`} />}
                <span className={`text-sm font-bold uppercase tracking-widest ${isOpen ? 'text-primary' : 'text-foreground'}`}>{title}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                    <div className="px-5 pb-5 border-t border-border/50 pt-4">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
    );
});

const AutoResizeTextarea = memo(function AutoResizeTextarea({
    value,
    onChange,
    className = '',
    ...props
}: Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> & {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
    const ref = useRef<HTMLTextAreaElement>(null);

    const resize = useCallback(() => {
        const element = ref.current;
        if (!element) return;
        element.style.height = 'auto';
        element.style.height = `${element.scrollHeight}px`;
    }, []);

    useEffect(() => {
        resize();
    }, [value, resize]);

    return (
        <textarea
            {...props}
            ref={ref}
            value={value}
            onChange={(event) => {
                onChange(event);
                requestAnimationFrame(resize);
            }}
            onInput={resize}
            className={`${className} overflow-hidden`}
        />
    );
});

function PublishHealthPanel({
    health,
    onGoToStep,
}: {
    health: WeddingPublishHealthSummary;
    onGoToStep: (stepIndex: number) => void;
}) {
    const statusConfig = health.status === 'blocked'
        ? {
            label: 'Needs fixes',
            className: 'border-red-200 bg-red-50 text-red-700',
            barClassName: 'bg-red-500',
        }
        : health.status === 'needs_attention'
            ? {
                label: 'Almost ready',
                className: 'border-amber-200 bg-amber-50 text-amber-700',
                barClassName: 'bg-amber-500',
            }
            : {
                label: 'Ready to publish',
                className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
                barClassName: 'bg-emerald-500',
            };
    const visibleItems = [
        ...health.criticalItems,
        ...health.warningItems,
        ...health.suggestionItems,
    ].slice(0, 8);

    return (
        <section className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Publish Health Check</p>
                    <h3 className="mt-2 font-serif text-2xl font-bold text-foreground">Invitation readiness</h3>
                    <p className="mt-1 text-sm leading-6 text-text-secondary">
                        Review launch blockers and important guest-experience gaps before publishing.
                    </p>
                </div>
                <div className={`flex min-w-[132px] items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black ${statusConfig.className}`}>
                    {health.status === 'ready' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    {statusConfig.label}
                </div>
            </div>

            <div className="mt-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-foreground">{health.score}% complete</span>
                    <span className="text-xs font-semibold text-text-secondary">{health.completedChecks}/{health.totalChecks} checks passed</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral">
                    <div className={`h-full rounded-full transition-all ${statusConfig.barClassName}`} style={{ width: `${health.score}%` }} />
                </div>
            </div>

            {visibleItems.length > 0 ? (
                <div className="mt-5 space-y-2">
                    {visibleItems.map((item) => {
                        const severityClass = item.severity === 'critical'
                            ? 'border-red-100 bg-red-50/70 text-red-700'
                            : item.severity === 'warning'
                                ? 'border-amber-100 bg-amber-50/70 text-amber-700'
                                : 'border-border bg-neutral/40 text-text-secondary';
                        return (
                            <div key={item.id} className={`flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${severityClass}`}>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[9px] font-black uppercase tracking-[0.18em]">{item.severity}</span>
                                        <span className="rounded-full bg-white/75 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em]">{item.stepLabel}</span>
                                    </div>
                                    <p className="mt-1 text-sm font-bold text-foreground">{item.title}</p>
                                    <p className="mt-0.5 text-xs leading-5 opacity-80">{item.description}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onGoToStep(item.stepIndex)}
                                    className="inline-flex min-h-[38px] shrink-0 items-center justify-center rounded-lg border border-current/15 bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-current transition hover:-translate-y-px hover:shadow-sm"
                                >
                                    Fix
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                    All readiness checks passed. You can publish with confidence.
                </div>
            )}
        </section>
    );
}

const STEPS = [
    { id: 'details', title: 'Details', icon: Heart },
    { id: 'templates', title: 'Layout', icon: Layout },
    { id: 'theme', title: 'Style', icon: Palette },
    { id: 'logo', title: 'Monogram', icon: Sparkles },
    { id: 'media', title: 'Media', icon: Camera },
    { id: 'dresscode', title: 'Dress Code', icon: Shirt },
    { id: 'gifts', title: 'Gifts', icon: Heart },
    { id: 'rsvp', title: 'RSVP', icon: Calendar },
    { id: 'timeline', title: 'Timeline', icon: Clock },
    { id: 'faq', title: 'FAQs', icon: HelpCircle },
];

const ATTIRE_COLOR_OPTIONS = ['#111827', '#1A365D', '#276749', '#744210', '#E53E3E', '#805AD5', '#D6BCFA', '#FBD38D', '#D16C78', '#D6B87C', '#6B7A62', '#F8EEEA'];

const ACCENT_STYLES = [
    { id: 'none', name: 'None', desc: 'Clean layout' },
    { id: 'eucalyptus', name: 'Eucalyptus', desc: 'Soft botanical leaves' },
    { id: 'pampas', name: 'Pampas', desc: 'Boho grass lines' },
    { id: 'ribbon', name: 'Ribbon', desc: 'Silk movement' },
    { id: 'monstera', name: 'Monstera', desc: 'Tropical leaf' },
    { id: 'sakura', name: 'Sakura', desc: 'Cherry blossom' },
    { id: 'gold-arch', name: 'Gold Arch', desc: 'Minimal ceremony arch' },
    { id: 'sparkles', name: 'Sparkles', desc: 'Light dust accents' },
    { id: 'petals', name: 'Petals', desc: 'Floating floral pieces' },
    { id: 'dots', name: 'Dots', desc: 'Confetti texture' },
];

const GALLERY_LAYOUTS = [
    { id: 'auto', name: 'Auto', desc: 'Match the selected template.', cells: ['col-span-2', '', '', 'col-span-2'] },
    { id: 'bento', name: 'Bento', desc: 'Editorial mixed-size photo blocks.', cells: ['col-span-2 row-span-2', '', '', 'col-span-2'] },
    { id: 'vertical', name: 'Vertical', desc: 'Large stacked photos for scrolling down.', cells: ['col-span-2', 'col-span-2', 'col-span-2'] },
    { id: 'horizontal', name: 'Side Scroll', desc: 'Swipe left and right on phones.', cells: ['', '', ''] },
    { id: 'grid', name: 'Grid', desc: 'Clean equal-size preview tiles.', cells: ['', '', '', ''] },
];

const FONTS = [
    { id: 'Elegant', name: 'Elegant Serif', desc: 'Playfair Display + Inter', class: 'font-serif' },
    { id: 'Classic', name: 'Classic Royal', desc: 'Cinzel + Cormorant', class: 'font-classic' },
    { id: 'Modern', name: 'Modern Minimal', desc: 'Montserrat + Inter', class: 'font-modern' },
    { id: 'Romantic', name: 'Romantic Script', desc: 'Great Vibes + Playfair', class: 'font-cursive' },
    { id: 'Traditional', name: 'Traditional', desc: 'Cormorant + Inter', class: 'font-elegant' },
    { id: 'Renaissance', name: 'Renaissance', desc: 'EB Garamond (Timeless Serif)', class: 'font-eb' },
    { id: 'Luxe', name: 'High Luxe', desc: 'Bodoni Moda (Vogue Style)', class: 'font-bodoni' },
    { id: 'Poetic', name: 'Poetic', desc: 'Prata (Soft Serif)', class: 'font-prata' },
    { id: 'Storyteller', name: 'Storyteller', desc: 'Lora (Organic Serif)', class: 'font-lora' },
    { id: 'Academic', name: 'Old World', desc: 'Cardo (Classic Literary)', class: 'font-cardo' },
    { id: 'Editorial', name: 'Editorial', desc: 'Libre Baskerville (Clean)', class: 'font-libre' },
    { id: 'Deco', name: 'Art Deco', desc: 'Marcellus (Architectural)', class: 'font-marcellus' },
    { id: 'Ancient', name: 'Forum', desc: 'Forum (Roman Display)', class: 'font-forum' },
    { id: 'Fairytale', name: 'Fairytale', desc: 'Alice (Whimsical Serif)', class: 'font-alice' },
    { id: 'Artistic', name: 'Artistic', desc: 'Spectral (Contemporary)', class: 'font-spectral' },
    { id: 'Nature', name: 'Natural', desc: 'Fauna One (Organic Sans)', class: 'font-fauna' },
    { id: 'Chic', name: 'Ultra Chic', desc: 'Tenor Sans (Modern Luxury)', class: 'font-tenor' },
    { id: 'Clean', name: 'Questrial', desc: 'Questrial (Soft Geometric)', class: 'font-questrial' },
    { id: 'Bold', name: 'Avant Garde', desc: 'Syne (Artistic & Bold)', class: 'font-syne' },
    { id: 'Calligraphy', name: 'Formal Calligraphy', desc: 'Alex Brush (Classic)', class: 'font-alex' },
    { id: 'SoftScript', name: 'Soft Script', desc: 'Allura (Delicate)', class: 'font-allura' },
    { id: 'Whimsy', name: 'Whimsy Script', desc: 'Arizonia (Playful)', class: 'font-arizonia' },
    { id: 'Handwritten', name: 'Handwritten', desc: 'Dancing Script (Casual)', class: 'font-dancing' },
    { id: 'Italian', name: 'Italian Script', desc: 'Italianno (Sleek)', class: 'font-italianno' },
    { id: 'PremiumScript', name: 'Premium Script', desc: 'Pinyon Script (Luxe)', class: 'font-pinyon' },
    { id: 'MinimalScript', name: 'Minimal Script', desc: 'Sacramento (Retro)', class: 'font-sacramento' },
    { id: 'Ornate', name: 'Ornate Script', desc: 'Tangerine (Elongated)', class: 'font-tangerine' },
    { id: 'Paris', name: 'Parisian', desc: 'Parisienne (Vintage)', class: 'font-parisienne' },
    { id: 'Abril', name: 'Abril Fatface', desc: 'Bold & Elegant Display', class: 'font-abril' },
    { id: 'Upright', name: 'Cormorant Upright', desc: 'Regal Vertical Serif', class: 'font-cormorant-upright' },
    { id: 'Vintage', name: 'Old Standard', desc: 'True Vintage Character', class: 'font-old-standard' },
    { id: 'Josefin', name: 'Josefin Style', desc: 'Geometric & Stylish', class: 'font-josefin' },
    { id: 'Caslon', name: 'Caslon Edit', desc: 'High-end Editorial', class: 'font-caslon' },
    { id: 'Quattro', name: 'Quattrocento', desc: 'Classic Roman Proportion', class: 'font-quattrocento' },
    { id: 'Saint', name: 'Mrs Saint', desc: 'Ultra Fancy Calligraphy', class: 'font-mrs-saint' },
    { id: 'Monsieur', name: 'Monsieur', desc: 'Artistic Fluid Script', class: 'font-monsieur' },
    { id: 'Handmade', name: 'Homemade', desc: 'Charming Handwritten', class: 'font-homemade' },
    { id: 'Mueller', name: 'Herr Muellerhoff', desc: 'Sophisticated Script', class: 'font-herr' },
    { id: 'Lavish', name: 'Lavish Royale', desc: 'Lavishly Yours + Outfit', class: 'font-lavishly' },
    { id: 'RoyalSC', name: 'Royal Small Caps', desc: 'Cormorant SC + Montserrat', class: 'font-cormorant-sc' },
    { id: 'ModernGrotesk', name: 'Modern Grotesk', desc: 'Fraunces + Space Grotesk', class: 'font-space' },
    { id: 'VogueEdit', name: 'Vogue Edition', desc: 'Bodoni + Outfit', class: 'font-bodoni' },
    { id: 'Estate', name: 'Estate Serif', desc: 'Fraunces + Inter', class: 'font-fraunces' }
];

export const LEGACY_TEMPLATES = [
    { id: 'classic', name: 'Classic Elegance', desc: 'Timeless, centered layout with elegant serif typography.', icon: '✨' },
    { id: 'minimal', name: 'Modern Minimal', desc: 'Clean lines, high contrast, and bold sans-serif fonts.', icon: '⬛' },
    { id: 'romantic', name: 'Romantic', desc: 'Soft textures, script fonts, and nostalgic framing.', icon: '📜' },
    { id: 'luxury', name: 'Luxury Editorial', desc: 'Magazine-style layout with large typography and fashion aesthetics.', icon: '📖' },
    { id: 'elopement', name: 'Intimate Elopement', desc: 'Focused on the couple and the journey, perfect for small gatherings.', icon: '🌿' },
    { id: 'traditional', name: 'Traditional Ceremonial', desc: 'Ornate details and majestic styling for grand celebrations.', icon: '👑' },
    { id: 'timeline', name: 'Timeline Based', desc: 'Structured around the order of events and flow of the day.', icon: '⏱️' },
    { id: 'rsvpfocus', name: 'RSVP First', desc: 'Prioritizes guest confirmation with a prominent RSVP section.', icon: '📩' },
    { id: 'cinematic', name: 'Media Forward', desc: 'Video-centric layout for sharing your love story in motion.', icon: '🎥' },
    { id: 'elegance', name: 'Minimal Elegant', desc: 'Sophisticated simplicity with refined typography and spacing.', icon: '🦢' },
    { id: 'artdeco', name: 'Art Deco Gold', desc: 'Geometric patterns and bold, luxurious accents.', icon: '💎' },
    { id: 'boho', name: 'Boho Dream', desc: 'Organic shapes, earthy tones, and whimsical layouts.', icon: '🌸' },
    { id: 'whimsical', name: 'Whimsical Garden', desc: 'Playful animations and soft, watercolor elements.', icon: '🦋' },
    { id: 'urban', name: 'Industrial Urban', desc: 'Raw textures and modern, edgy monospaced fonts.', icon: '🏙️' },
    { id: 'tropical', name: 'Tropical Paradise', desc: 'Vibrant accents and lush, exotic design elements.', icon: '🏝️' },
    { id: 'midnight', name: 'Midnight Luxury', desc: 'Premium dark aesthetic with gold foil accents.', icon: '🌑' },
    { id: 'sakura', name: 'Sakura Blossom', desc: 'Soft pinks, cherry blossoms, and gentle floating petals.', icon: '🌸' },
    { id: 'vogue', name: 'High Fashion', desc: 'Bold typography, asymmetrical layouts, and editorial chic.', icon: '👠' },
    { id: 'rustic', name: 'Rustic Charm', desc: 'Warm wood textures, string lights, and cozy vibes.', icon: '🪵' },
    { id: 'film', name: 'Retro Film', desc: 'Analog photography aesthetic with grain and film borders.', icon: '🎞️' },
    { id: 'glitch', name: 'Cyber Glitch', desc: 'Modern digital art style with chromatic aberration.', icon: '👾' },
    { id: 'vintage', name: 'Vintage Postcard', desc: 'Antique paper textures and classic typography.', icon: '✉️' },
    { id: 'editorial', name: 'Editorial Chic', desc: 'High-fashion magazine layout with bold imagery.', icon: '👠' },
    { id: 'royal', name: 'Royal Proclamation', desc: 'Majestic dark theme with gold heraldry elements.', icon: '👑' },
    { id: 'garden', name: 'Secret Garden', desc: 'Lush greenery, trellis patterns, and botanical elegance.', icon: '🍃' }
];

// Initial form data
const INITIAL_FORM_DATA = {
    brideName: '',
    groomName: '',
    weddingDate: '',
    weddingTime: '',
    venueName: '',
    venueAddress: '',
    mapsLink: '',
    receptionVenueName: '',
    receptionVenueAddress: '',
    receptionMapsLink: '',
    motifColor: '#C08081',
    fontStyle: 'Elegant',
    sectionTitleFontStyle: 'default',
    sectionTitleColorStyle: 'motif',
    cardStyle: 'default',
    backgroundStyle: 'gradient',
    template: 'classic',
    templateStyle: DEFAULT_TEMPLATE_STYLE,
    galleryLayout: 'auto',
    dressCode: '',
    dressCodeColor: '#000000',
    sponsorDressCode: '',
    sponsorDressCodeColor: '#1A365D',
    programTimeline: '',
    faqItems: [] as any[],
    story: '',
    quote: '',
    hashtag: '',
    contactPerson: '',
    rsvpDeadline: '',
    giftBank: '',
    giftAccountName: '',
    giftAccountNumber: '',
    logoInitials: '',
    logoFont: 'Elegant',
    logoShape: 'minimal',
    logoColor: '#C08081',
    logoAnimation: 'none',
    spotifyUrl: '',
    backgroundMusicTitle: '',
    backgroundMusicEnabled: false,
    weddingParty: [] as any[],
    includeEntourageSection: true,
    registryLinks: [] as any[],
    cashFunds: [] as any[],
    paymentLinks: [] as any[],
    isThankYouMode: false,
    thankYouMessage: '',
    photoAlbumLink: '',
    accentStyle: 'none',
};

function readArrayField(value: unknown) {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string' || !value.trim()) return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

const ENTOURAGE_CSV_ALIASES: Record<'name' | 'role' | 'bio' | 'email', string[]> = {
    name: ['name', 'full name', 'member name', 'entourage name', 'person', 'guest name'],
    role: ['role', 'title', 'position', 'entourage role', 'wedding role'],
    bio: ['bio', 'description', 'notes', 'note', 'short bio', 'message'],
    email: ['email', 'email address', 'contact email'],
};

function normalizeCsvHeader(value: string) {
    return value.trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
}

function getEntourageCsvIndex(headers: string[], field: keyof typeof ENTOURAGE_CSV_ALIASES) {
    const normalizedHeaders = headers.map(normalizeCsvHeader);
    return normalizedHeaders.findIndex((header) => ENTOURAGE_CSV_ALIASES[field].includes(header));
}

function getErrorMessage(error: unknown) {
    if (!error) return 'Unknown error';
    if (error instanceof Error && error.message) return error.message;
    if (typeof error === 'string') return error;
    if (typeof error === 'object') {
        const record = error as Record<string, unknown>;
        return String(record.message || record.error_description || record.details || record.hint || record.code || JSON.stringify(record));
    }
    return String(error);
}

function createEntourageMemberKey() {
    return `entourage-${uuidv4().slice(0, 12)}`;
}

function normalizeWeddingPartyMember(member: any) {
    const templateKey = getEntourageProposalTemplate(member?.proposalTemplateKey || member?.templateKey).key;
    const proposalHeroImage = typeof member?.proposalHeroImage === 'string' && /^https?:\/\//i.test(member.proposalHeroImage)
        ? member.proposalHeroImage
        : undefined;
    return {
        ...member,
        memberKey: member?.memberKey || member?.id || createEntourageMemberKey(),
        proposalTemplateKey: templateKey,
        proposalMessage: member?.proposalMessage || getEntourageProposalTemplate(templateKey).defaultMessage,
        proposalHeroImage,
    };
}

function isMissingFaqColumnError(error: unknown) {
    if (!error || typeof error !== 'object') return false;
    const record = error as Record<string, unknown>;
    const text = `${record.code || ''} ${record.message || ''} ${record.details || ''}`.toLowerCase();
    return text.includes('faq_items') && (text.includes('column') || text.includes('schema cache') || text.includes('pgrst204'));
}

function isMissingOptionalWeddingColumnError(error: unknown, column: string) {
    if (!error || typeof error !== 'object') return false;
    const record = error as Record<string, unknown>;
    const text = `${record.code || ''} ${record.message || ''} ${record.details || ''} ${record.hint || ''}`.toLowerCase();
    return text.includes(column.toLowerCase()) && (
        text.includes('column') ||
        text.includes('schema cache') ||
        text.includes('could not find') ||
        text.includes('does not exist') ||
        text.includes('pgrst204') ||
        text.includes('42703')
    );
}

const MAX_IMAGE_FILE_BYTES = 12 * 1024 * 1024;
const MAX_FREE_VIDEO_FILE_BYTES = 50 * 1024 * 1024;
const MAX_PREMIUM_VIDEO_FILE_BYTES = 100 * 1024 * 1024;
const MAX_CONCURRENT_UPLOADS = 3;

export default function BuilderForm() {
    const router = useRouter();
    const { user, isAdmin, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const editId = searchParams?.get('edit');
    const requestedTemplate = searchParams?.get('template');
    const userId = user?.id || null;
    const [currentStep, setCurrentStep] = useState(0);
    const [loadedEditId, setLoadedEditId] = useState<string | null>(null);
    const weddingLoadRef = useRef<{ id: string; requestId: number } | null>(null);
    const weddingLoadRequestIdRef = useRef(0);

    // Scroll to top of the page when the step changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentStep]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [weddingOwnerId, setWeddingOwnerId] = useState<string | null>(null);
    const [existingPublicSlug, setExistingPublicSlug] = useState<string>('');
    
    // Mobile UI state
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [isDesktopPreview, setIsDesktopPreview] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 1024px)');
        const updatePreviewMode = () => setIsDesktopPreview(mediaQuery.matches);

        updatePreviewMode();
        mediaQuery.addEventListener('change', updatePreviewMode);
        return () => mediaQuery.removeEventListener('change', updatePreviewMode);
    }, []);

    const toggleSection = (id: string) => {
        setExpandedSection(prev => prev === id ? null : id);
    };

    // Undo/Redo functionality
    const {
        state: formData,
        setState: setFormData,
        undo,
        redo,
        canUndo,
        canRedo,
        clear: initializeFormData,
    } = useLocalUndoRedo(INITIAL_FORM_DATA, 50);

    useEffect(() => {
        if (editId || !requestedTemplate || !TEMPLATES.some((template) => template.id === requestedTemplate)) return;

        setFormData((previous: any) => ({
            ...previous,
            template: requestedTemplate,
            templateStyle: isTemplateStyleAvailable(requestedTemplate, previous.templateStyle)
                ? previous.templateStyle
                : DEFAULT_TEMPLATE_STYLE,
        }));
    }, [editId, requestedTemplate, setFormData]);

    // Keyboard shortcuts for undo/redo
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in input fields
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.contentEditable === 'true'
            ) {
                return;
            }

            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            } else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redo();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    const [mediaFiles, setMediaFiles] = useState<{
        heroImage: File | null;
        couplePhoto: File | null;
        teaserVideo: File | null;
        backgroundMusic: File | null;
        giftQr: File | null;
        invitationImages: File[];
        galleryImages: File[];
        receptionVenuePhotos: File[];
    }>({
        heroImage: null,
        couplePhoto: null,
        teaserVideo: null,
        backgroundMusic: null,
        giftQr: null,
        invitationImages: [],
        galleryImages: [],
        receptionVenuePhotos: [],
    });

    const [previews, setPreviews] = useState<{
        heroImage: string;
        couplePhoto: string;
        teaserVideo: string;
        backgroundMusic: string;
        giftQr: string;
        invitationImages: string[];
        galleryImages: string[];
        receptionVenuePhotos: string[];
    }>({
        heroImage: '',
        couplePhoto: '',
        teaserVideo: '',
        backgroundMusic: '',
        giftQr: '',
        invitationImages: [],
        galleryImages: [],
        receptionVenuePhotos: [],
    });
    const previewObjectUrlsRef = useRef(new Set<string>());

    useEffect(() => {
        const objectUrls = previewObjectUrlsRef.current;
        return () => {
            for (const url of objectUrls) URL.revokeObjectURL(url);
            objectUrls.clear();
        };
    }, []);

    const [isPremium, setIsPremium] = useState(true);
    const [showMonogramProModal, setShowMonogramProModal] = useState(false);
    const [savedPresets, setSavedPresets] = useState<WeddingTemplatePreset[]>([]);
    const [accountIsPro, setAccountIsPro] = useState(false);
    const monogramExportRef = useRef<SVGSVGElement>(null);
    const [monogramExporting, setMonogramExporting] = useState<'png' | 'jpg' | 'mp4' | null>(null);
    const [monogramPreviewNonce, setMonogramPreviewNonce] = useState(0);
    const [activeWeddingCount, setActiveWeddingCount] = useState(0);
    const [entourageImportStatus, setEntourageImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [customizingMemberIndex, setCustomizingMemberIndex] = useState<number | null>(null);
    const hasMonogramPro = isAdmin || accountIsPro;
    const freeWebsiteLimitReached = !editId && !isAdmin && !accountIsPro && activeWeddingCount >= 3;
    const publishHealth = useMemo(() => evaluateWeddingPublishHealth(formData, {
        heroImage: Boolean(mediaFiles.heroImage || previews.heroImage),
        couplePhoto: Boolean(mediaFiles.couplePhoto || previews.couplePhoto),
        giftQr: Boolean(mediaFiles.giftQr || previews.giftQr),
        backgroundMusic: Boolean(mediaFiles.backgroundMusic || previews.backgroundMusic),
        galleryCount: mediaFiles.galleryImages.length + (Array.isArray(previews.galleryImages) ? previews.galleryImages.length : 0),
        invitationCount: mediaFiles.invitationImages.length + (Array.isArray(previews.invitationImages) ? previews.invitationImages.length : 0),
    }), [formData, mediaFiles, previews]);

    const applyMotifColor = useCallback((color: string) => {
        setFormData((prev: any) => ({
            ...prev,
            motifColor: color,
            sectionTitleColorStyle: 'motif',
        }));
    }, [setFormData]);

    useEffect(() => {
        if (user || hasStoredSupabaseSession()) return;
        window.location.replace('/login?next=%2Fbuilder');
    }, [user]);

    const loadAccountLimitState = useCallback(async () => {
        if (!user) {
            setAccountIsPro(false);
            setActiveWeddingCount(0);
            return { isPro: false, activeCount: 0 };
        }

        const [profileResult, countResult] = await Promise.all([
            supabase
                .from('user_app_profiles')
                .select('is_pro, payment_status')
                .eq('user_id', user.id)
                .maybeSingle(),
            supabase
                .from('weddings')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .is('deleted_at', null),
        ]);

        if (profileResult.error) {
            console.warn('Account Pro profile check skipped:', profileResult.error);
        }

        if (countResult.error) {
            throw countResult.error;
        }

        const isPro = hasAccountPro(profileResult.data);
        const activeCount = countResult.count || 0;
        setAccountIsPro(isPro);
        setActiveWeddingCount(activeCount);
        return { isPro, activeCount };
    }, [user]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login?next=%2Fbuilder');
        }

        setIsPremium(true);

        // BUG #12 FIX: Restore pending wedding data from sessionStorage after login redirect
        if (userId && !editId && typeof window !== 'undefined') {
            const pendingData = window.sessionStorage.getItem('pending_wedding_data');
            if (pendingData) {
                try {
                    const restored = JSON.parse(pendingData);
                    initializeFormData({ ...INITIAL_FORM_DATA, ...restored });
                    window.sessionStorage.removeItem('pending_wedding_data');
                    console.log('✅ Restored pending wedding form data from session');
                } catch (e) {
                    console.warn('Could not restore pending wedding data:', e);
                    window.sessionStorage.removeItem('pending_wedding_data');
                }
            }
        }

        if (userId && editId && loadedEditId !== editId && weddingLoadRef.current?.id !== editId) {
            const requestId = ++weddingLoadRequestIdRef.current;
            weddingLoadRef.current = { id: editId, requestId };

            const fetchWedding = async () => {
                try {
                    const { data: sessionData } = await getCachedSession();
                    const token = sessionData.session?.access_token;
                    if (!token) throw new Error('No active session while loading wedding');

                    const response = await fetch(`/api/planner/load?weddingId=${encodeURIComponent(editId)}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    if (!response.ok) throw new Error(`Wedding load failed with status ${response.status}`);

                    const result = await response.json().catch(() => ({}));
                    const data = result.wedding;

                    // Ignore a response from an older edit route. More importantly,
                    // this request is registered before it starts, so auth refreshes
                    // cannot launch another load that overwrites unsaved builder edits.
                    if (weddingLoadRef.current?.requestId !== requestId) return;

                    if (data && (result.accessRole === 'owner' || result.accessRole === 'partner')) {
                        // Builder features are included on the free plan. Paid status now unlocks Planner Pro.
                        setIsPremium(true);
                        setWeddingOwnerId(data.user_id || userId);
                        setExistingPublicSlug(typeof data.public_slug === 'string' ? data.public_slug : '');
                        const dressCodeSettings = parseDressCodeValue(data.dress_code, data.motif_color);

                        initializeFormData({
                        brideName: data.bride_name || '',
                        groomName: data.groom_name || '',
                        weddingDate: data.wedding_date || '',
                        weddingTime: data.wedding_time || '',
                        venueName: data.venue_name || '',
                        venueAddress: data.venue_address || '',
                        mapsLink: data.maps_link || '',
                        receptionVenueName: data.reception_venue_name || '',
                        receptionVenueAddress: data.reception_venue_address || '',
                        receptionMapsLink: data.reception_maps_link || '',
                        motifColor: data.motif_color || '#C08081',
                        fontStyle: data.font_style || 'Elegant',
                        sectionTitleFontStyle: data.section_title_font_style || 'default',
                        sectionTitleColorStyle: data.section_title_color_style || 'motif',
                        cardStyle: data.card_style || 'default',
                        backgroundStyle: data.background_style || 'gradient',
                        template: data.template || 'classic',
                        templateStyle: data.template_style || DEFAULT_TEMPLATE_STYLE,
                        galleryLayout: data.gallery_layout || 'auto',
                        dressCode: dressCodeSettings.guests.attire,
                        dressCodeColor: dressCodeSettings.guests.color,
                        sponsorDressCode: dressCodeSettings.sponsors.attire,
                        sponsorDressCodeColor: dressCodeSettings.sponsors.color,
                        programTimeline: data.program_timeline || '',
                        faqItems: readArrayField(data.faq_items),
                        story: data.story || '',
                        quote: data.quote || '',
                        hashtag: data.hashtag || '',
                        contactPerson: data.contact_person || '',
                        rsvpDeadline: data.rsvp_deadline || '',
                        giftBank: data.gift_bank || '',
                        giftAccountName: data.gift_account_name || '',
                        giftAccountNumber: data.gift_account_number || '',
                        logoInitials: data.logo_initials || '',
                        logoFont: data.logo_font || 'Elegant',
                        logoShape: data.logo_shape || 'minimal',
                        logoColor: data.logo_color || data.motif_color,
                        logoAnimation: data.logo_animation || 'none',
                        spotifyUrl: data.spotify_playlist_url || '',
                        backgroundMusicTitle: data.background_music_title || '',
                        backgroundMusicEnabled: data.background_music_enabled || false,
                        weddingParty: readArrayField(data.wedding_party).map(normalizeWeddingPartyMember),
                        includeEntourageSection: data.include_entourage_section !== false,
                        registryLinks: data.gift_registry_links || [],
                        cashFunds: data.cash_funds || [],
                        paymentLinks: data.payment_links || [],
                        isThankYouMode: data.is_thank_you_mode || false,
                        thankYouMessage: data.thank_you_message || '',
                        photoAlbumLink: data.photo_album_link || '',
                        accentStyle: data.accent_style || 'none',
                        });
                        let inviteImages: string[] = [];
                        try {
                            if (data.invitation_image && data.invitation_image.startsWith('[')) {
                                inviteImages = JSON.parse(data.invitation_image);
                            } else if (data.invitation_image) {
                                inviteImages = [data.invitation_image];
                            }
                        } catch {
                            if (data.invitation_image) inviteImages = [data.invitation_image];
                        }

                        setPreviews({
                            heroImage: data.hero_image || '',
                            couplePhoto: data.couple_photo || '',
                            teaserVideo: (data as any).teaser_video || '',
                            backgroundMusic: (data as any).background_music_url || '',
                            giftQr: data.gift_qr_image || '',
                            invitationImages: inviteImages,
                            galleryImages: data.gallery_images || [],
                            receptionVenuePhotos: readArrayField(data.reception_venue_photos) as string[],
                        });
                    }

                    setLoadedEditId(editId);
                } catch (error) {
                    console.error('[builder] Failed to load wedding for editing', { editId, error });
                    if (weddingLoadRef.current?.requestId === requestId) {
                        setLoadedEditId(editId);
                    }
                } finally {
                    if (weddingLoadRef.current?.requestId === requestId) {
                        weddingLoadRef.current = null;
                    }
                }
            };
            void fetchWedding();
        }
    }, [userId, authLoading, router, editId, loadedEditId, initializeFormData]);

    useEffect(() => {
        if (!user) {
            setAccountIsPro(false);
            setActiveWeddingCount(0);
            return;
        }

        void loadAccountLimitState();
    }, [user, loadAccountLimitState]);

    useEffect(() => {
        const loadPresets = async () => {
            if (!user) return;
            const presets = await listTemplatePresets(user.id);
            setSavedPresets(presets);
        };

        void loadPresets();
    }, [user]);

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

    const handleArrayAdd = (field: string, item: any) => {
        const nextItem = field === 'weddingParty' ? normalizeWeddingPartyMember(item) : item;
        setFormData((prev: any) => ({ ...prev, [field]: [...(prev[field] || []), nextItem] }));
    };
    const handleArrayRemove = (field: string, index: number) => {
        setFormData((prev: any) => ({ ...prev, [field]: (prev[field] || []).filter((_: any, i: number) => i !== index) }));
    };
    const handleArrayChange = (field: string, index: number, key: string, value: any) => {
        setFormData((prev: any) => {
            const newArr = [...(prev[field] || [])];
            const currentItem = { ...newArr[index], [key]: value };
            if (field === 'weddingParty' && key === 'proposalTemplateKey') {
                currentItem.proposalMessage = getEntourageProposalTemplate(value).defaultMessage;
            }
            newArr[index] = currentItem;
            return { ...prev, [field]: newArr };
        });
    };

    const handleEntourageCsvImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const parsed = parseCsv(await file.text());
            if (parsed.length < 2) {
                throw new Error('Upload a CSV with a header row and at least one entourage member.');
            }

            const [headers, ...rows] = parsed;
            const nameIndex = getEntourageCsvIndex(headers, 'name');
            if (nameIndex < 0) {
                throw new Error('CSV needs a name column. Accepted headers include name, full name, or member name.');
            }

            const roleIndex = getEntourageCsvIndex(headers, 'role');
            const bioIndex = getEntourageCsvIndex(headers, 'bio');
            const emailIndex = getEntourageCsvIndex(headers, 'email');
            const importedMembers = rows
                .map((row) => ({
                    memberKey: createEntourageMemberKey(),
                    name: (row[nameIndex] || '').trim(),
                    role: roleIndex >= 0 ? (row[roleIndex] || '').trim() : '',
                    bio: bioIndex >= 0 ? (row[bioIndex] || '').trim() : '',
                    email: emailIndex >= 0 ? (row[emailIndex] || '').trim() : '',
                    proposalTemplateKey: DEFAULT_ENTOURAGE_PROPOSAL_TEMPLATE_KEY,
                    proposalMessage: getEntourageProposalTemplate(DEFAULT_ENTOURAGE_PROPOSAL_TEMPLATE_KEY).defaultMessage,
                }))
                .filter((member) => member.name.length > 0);

            if (importedMembers.length === 0) {
                throw new Error('No entourage names were found in the CSV.');
            }

            setFormData((prev: any) => ({
                ...prev,
                weddingParty: [...(prev.weddingParty || []), ...importedMembers.map(normalizeWeddingPartyMember)],
                includeEntourageSection: true,
            }));
            setEntourageImportStatus({
                type: 'success',
                message: `Imported ${importedMembers.length} entourage member${importedMembers.length === 1 ? '' : 's'}.`,
            });
        } catch (error: unknown) {
            setEntourageImportStatus({
                type: 'error',
                message: error instanceof Error ? error.message : 'Unable to import that CSV file.',
            });
        } finally {
            event.target.value = '';
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const resolvePublicSlug = useCallback(async (weddingId: string) => {
        const currentSlug = sanitizeWeddingSlug(existingPublicSlug);
        if (currentSlug) return currentSlug;

        const base = createWeddingSlugBase(formData.brideName, formData.groomName);
        const candidates = [
            base,
            ...Array.from({ length: 7 }, (_, index) => `${base}-${index + 2}`),
            `${base}-${weddingId.slice(0, 4).toLowerCase()}`,
        ];

        for (const candidate of candidates) {
            const { data, error } = await supabase
                .from('weddings')
                .select('id')
                .eq('public_slug', candidate)
                .maybeSingle();

            if (error) {
                if (isMissingPublicSlugColumnError(error)) return '';
                console.warn('Public slug availability check skipped:', error);
                return candidate;
            }

            if (!data || data.id === weddingId) {
                return candidate;
            }
        }

        return `${base}-${weddingId.slice(0, 8).toLowerCase()}`;
    }, [existingPublicSlug, formData.brideName, formData.groomName]);

    const applyPreset = (preset: Record<string, any>) => {
        setFormData((prev: any) => ({
            ...prev,
            ...preset,
        }));
    };

    const applySectionBlock = (blockId: string) => {
        const block = SECTION_BLOCK_LIBRARY.find((entry) => entry.id === blockId);
        if (!block) return;

        const partial = block.apply(formData);
        setFormData((prev: any) => ({
            ...prev,
            ...partial,
        }));
    };

    const handleSaveCurrentPreset = async () => {
        if (!user) return;

        const name = window.prompt('Preset name');
        if (!name?.trim()) return;

        try {
            const preset = await saveTemplatePreset({
                userId: user.id,
                name: name.trim(),
                templateId: formData.template,
                description: `${formData.template} preset saved from builder`,
                presetData: buildPresetPayload(formData),
            });
            setSavedPresets((prev) => [preset, ...prev]);
        } catch (error: any) {
            alert(error.message || 'Failed to save preset');
        }
    };

    const handleDeletePreset = async (presetId: string) => {
        try {
            await deleteTemplatePreset(presetId);
            setSavedPresets((prev) => prev.filter((preset) => preset.id !== presetId));
        } catch (error: any) {
            alert(error.message || 'Failed to delete preset');
        }
    };

    const createLocalPreview = (file: File) => {
        const url = URL.createObjectURL(file);
        previewObjectUrlsRef.current.add(url);
        return url;
    };

    const releaseLocalPreview = (url: string | undefined) => {
        if (!url || !previewObjectUrlsRef.current.delete(url)) return;
        URL.revokeObjectURL(url);
    };

    const validateImageFiles = (files: File[]) => {
        const invalidType = files.find((file) => !file.type.startsWith('image/'));
        if (invalidType) {
            alert(`${invalidType.name} is not a supported image file.`);
            return false;
        }

        const oversized = files.find((file) => file.size > MAX_IMAGE_FILE_BYTES);
        if (oversized) {
            alert(`${oversized.name} is larger than 12MB. Please resize or compress it before uploading.`);
            return false;
        }

        return true;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (field === 'galleryImages') {
            const newFiles = Array.from(files);
            if (!validateImageFiles(newFiles)) return;
            if (!isPremium && (mediaFiles.galleryImages.length + newFiles.length) > 12) {
                alert("Free plan is limited to 12 photos. Please upgrade to Premium for unlimited gallery uploads.");
                return;
            }
            setMediaFiles(prev => ({ ...prev, galleryImages: [...prev.galleryImages, ...newFiles] }));
            const previewUrls = newFiles.map(createLocalPreview);
            setPreviews(prev => ({ ...prev, galleryImages: [...prev.galleryImages, ...previewUrls] }));
        } else if (field === 'invitationImages') {
            const newFiles = Array.from(files);
            if (!validateImageFiles(newFiles)) return;
            setMediaFiles(prev => ({ ...prev, invitationImages: [...prev.invitationImages, ...newFiles] }));
            const previewUrls = newFiles.map(createLocalPreview);
            setPreviews(prev => ({ ...prev, invitationImages: [...prev.invitationImages, ...previewUrls] }));
        } else if (field === 'receptionVenuePhotos') {
            const newFiles = Array.from(files);
            if (!validateImageFiles(newFiles)) return;
            setMediaFiles(prev => ({ ...prev, receptionVenuePhotos: [...prev.receptionVenuePhotos, ...newFiles] }));
            const previewUrls = newFiles.map(createLocalPreview);
            setPreviews(prev => ({ ...prev, receptionVenuePhotos: [...prev.receptionVenuePhotos, ...previewUrls] }));
        } else {
            const file = files[0];
            if (field === 'teaserVideo') {
                if (!file.type.startsWith('video/')) {
                    alert('Please upload a supported video file.');
                    return;
                }
                const limit = isPremium ? MAX_PREMIUM_VIDEO_FILE_BYTES : MAX_FREE_VIDEO_FILE_BYTES;
                if (file.size > limit) {
                    alert(`Videos must be ${isPremium ? '100MB' : '50MB'} or smaller. Please compress the video and try again.`);
                    return;
                }
            }

            if (['heroImage', 'couplePhoto', 'giftQr', 'invitationImage'].includes(field) && !validateImageFiles([file])) {
                return;
            }

            if (field === 'backgroundMusic') {
                const limit = 15 * 1024 * 1024; // 15MB
                if (!file.type.startsWith('audio/')) {
                    alert('Please upload an audio file such as MP3, M4A, WAV, or OGG.');
                    return;
                }
                if (file.size > limit) {
                    alert('Background music must be 15MB or smaller. Please compress the audio file and try again.');
                    return;
                }
                setFormData((prev: any) => ({
                    ...prev,
                    backgroundMusicEnabled: true,
                    backgroundMusicTitle: prev.backgroundMusicTitle || file.name.replace(/\.[^.]+$/, ''),
                }));
            }

            setMediaFiles((prev: any) => ({ ...prev, [field]: file }));

            if (field === 'heroImage' || field === 'couplePhoto' || field === 'giftQr' || field === 'teaserVideo' || field === 'backgroundMusic' || field === 'invitationImage') {
                const previewUrl = createLocalPreview(file);
                setPreviews((prev: any) => {
                    releaseLocalPreview(prev[field]);
                    return { ...prev, [field]: previewUrl };
                });
            }
        }
    };

    const removeFile = (field: string, index?: number) => {
        if (field === 'galleryImages' && index !== undefined) {
            setMediaFiles(prev => ({ ...prev, galleryImages: prev.galleryImages.filter((_, i) => i !== index) }));
            setPreviews(prev => {
                releaseLocalPreview(prev.galleryImages[index]);
                return { ...prev, galleryImages: prev.galleryImages.filter((_, i) => i !== index) };
            });
        } else if (field === 'invitationImages' && index !== undefined) {
            setMediaFiles(prev => ({ ...prev, invitationImages: prev.invitationImages.filter((_, i) => i !== index) }));
            setPreviews(prev => {
                releaseLocalPreview(prev.invitationImages[index]);
                return { ...prev, invitationImages: prev.invitationImages.filter((_, i) => i !== index) };
            });
        } else if (field === 'receptionVenuePhotos' && index !== undefined) {
            setMediaFiles(prev => ({ ...prev, receptionVenuePhotos: prev.receptionVenuePhotos.filter((_, i) => i !== index) }));
            setPreviews(prev => {
                releaseLocalPreview(prev.receptionVenuePhotos[index]);
                return { ...prev, receptionVenuePhotos: prev.receptionVenuePhotos.filter((_, i) => i !== index) };
            });
        } else if (field === 'backgroundMusic') {
            setMediaFiles(prev => ({ ...prev, backgroundMusic: null }));
            setPreviews(prev => {
                releaseLocalPreview(prev.backgroundMusic);
                return { ...prev, backgroundMusic: '' };
            });
            setFormData((prev: any) => ({ ...prev, backgroundMusicEnabled: false }));
        } else {
            setMediaFiles(prev => ({ ...prev, [field]: null }));
            setPreviews((prev: any) => {
                releaseLocalPreview(prev[field]);
                return { ...prev, [field]: '' };
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep < STEPS.length - 1) {
            nextStep();
            return;
        }

        if (publishHealth.criticalItems.length > 0) {
            const firstCriticalStep = Math.min(...publishHealth.criticalItems.map((item) => item.stepIndex));
            alert(`Please fix ${publishHealth.criticalItems.length} launch blocker${publishHealth.criticalItems.length === 1 ? '' : 's'} before publishing. Start with: ${publishHealth.criticalItems[0].title}`);
            if (Number.isFinite(firstCriticalStep)) {
                setCurrentStep(firstCriticalStep);
            }
            return;
        }

        if (publishHealth.warningItems.length > 0) {
            const proceed = window.confirm(`Your invitation is ${publishHealth.score}% complete and has ${publishHealth.warningItems.length} important warning${publishHealth.warningItems.length === 1 ? '' : 's'}.\n\nYou can publish now, but guests may have a better experience if you fix them first. Publish anyway?`);
            if (!proceed) return;
        }

        if (!user) {
            const wantToLogin = window.confirm("You need to be signed in to save and generate your wedding page. Would you like to log in now? Your progress will be saved.");
            if (wantToLogin) {
                // Save current form data to session storage so we can restore it after login
                if (typeof window !== 'undefined') {
                    window.sessionStorage.setItem('pending_wedding_data', JSON.stringify(formData));
                }
                router.push('/login?returnTo=builder');
            }
            return;
        }

        if (!editId && !isAdmin) {
            try {
                const limitState = await loadAccountLimitState();
                if (!limitState.isPro && limitState.activeCount >= 3) {
                    alert('Free accounts can create up to 3 active wedding websites. Unlock Account Pro to create more.');
                    return;
                }
            } catch (limitError) {
                const message = getErrorMessage(limitError);
                console.error('Website limit check failed:', limitError);
                alert('Unable to verify your website limit right now: ' + message);
                return;
            }
        }

        setIsSubmitting(true);
        setIsGenerating(true);

        try {
            const weddingId = editId || uuidv4().slice(0, 8);
            let activeUploads = 0;
            const uploadWaiters: Array<() => void> = [];
            const acquireUploadSlot = async () => {
                if (activeUploads < MAX_CONCURRENT_UPLOADS) {
                    activeUploads += 1;
                    return;
                }
                await new Promise<void>((resolve) => uploadWaiters.push(resolve));
                activeUploads += 1;
            };
            const releaseUploadSlot = () => {
                activeUploads -= 1;
                uploadWaiters.shift()?.();
            };
            const uploadToSupabase = async (file: File, folder: string) => {
                const filename = `${folder}-${file.name.replace(/\s+/g, '_')}`;
                const filePath = `${user.id}/${weddingId}/${filename}`;

                await acquireUploadSlot();
                try {
                    const { error: uploadError } = await supabase.storage
                        .from('quickweds')
                        .upload(filePath, file, { upsert: true, contentType: file.type });

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('quickweds')
                        .getPublicUrl(filePath);

                    return publicUrl;
                } finally {
                    releaseUploadSlot();
                }
            };

            // Upload ALL media in parallel including video
            const heroPromise = mediaFiles.heroImage ? uploadToSupabase(mediaFiles.heroImage, 'hero') : Promise.resolve(null);
            const couplePromise = mediaFiles.couplePhoto ? uploadToSupabase(mediaFiles.couplePhoto, 'couple') : Promise.resolve(null);
            const giftQrPromise = mediaFiles.giftQr ? uploadToSupabase(mediaFiles.giftQr, 'gift-qr') : Promise.resolve(null);
            const invitationPromises = mediaFiles.invitationImages.map((file, i) => uploadToSupabase(file, `invitation-${i}`));
            const videoPromise = mediaFiles.teaserVideo ? uploadToSupabase(mediaFiles.teaserVideo, 'teaser') : Promise.resolve(null);
            const musicPromise = mediaFiles.backgroundMusic ? uploadToSupabase(mediaFiles.backgroundMusic, 'music') : Promise.resolve(null);
            const galleryPromises = mediaFiles.galleryImages.map((file, i) => uploadToSupabase(file, `gallery-${i}`));
            const receptionVenuePromises = mediaFiles.receptionVenuePhotos.map((file, i) => uploadToSupabase(file, `reception-venue-${i}`));

            const [heroUrl, coupleUrl, giftQrUrl, invitationUrls, videoUrl, musicUrl, galleryUrls, receptionVenueUrls] = await Promise.all([
                heroPromise,
                couplePromise,
                giftQrPromise,
                Promise.all(invitationPromises),
                videoPromise,
                musicPromise,
                Promise.all(galleryPromises),
                Promise.all(receptionVenuePromises)
            ]);

            const normalizedWeddingParty = (formData.weddingParty || []).map(normalizeWeddingPartyMember);

            const payload: any = {
                bride_name: formData.brideName,
                groom_name: formData.groomName,
                wedding_date: formData.weddingDate,
                wedding_time: formData.weddingTime,
                venue_name: formData.venueName,
                venue_address: formData.venueAddress,
                maps_link: formData.mapsLink,
                reception_venue_name: formData.receptionVenueName,
                reception_venue_address: formData.receptionVenueAddress,
                reception_maps_link: formData.receptionMapsLink,
                motif_color: formData.motifColor,
                font_style: formData.fontStyle,
                section_title_font_style: formData.sectionTitleFontStyle,
                section_title_color_style: formData.sectionTitleColorStyle,
                card_style: formData.cardStyle || 'default',
                background_style: formData.backgroundStyle,
                template: formData.template,
                template_style: formData.templateStyle || DEFAULT_TEMPLATE_STYLE,
                gallery_layout: formData.galleryLayout || 'auto',
                dress_code: serializeDressCodeValue({
                    sponsors: { attire: formData.sponsorDressCode, color: formData.sponsorDressCodeColor },
                    guests: { attire: formData.dressCode, color: formData.dressCodeColor },
                }),
                program_timeline: formData.programTimeline,
                faq_items: formData.faqItems,
                story: formData.story,
                quote: formData.quote,
                hashtag: formData.hashtag,
                contact_person: formData.contactPerson,
                rsvp_deadline: formData.rsvpDeadline,
                gift_bank: formData.giftBank,
                gift_account_name: formData.giftAccountName,
                gift_account_number: formData.giftAccountNumber,
                logo_initials: formData.logoInitials,
                logo_font: formData.logoFont,
                logo_shape: getSafeMonogramConfig({ shape: formData.logoShape, animation: formData.logoAnimation }, hasMonogramPro).shape,
                logo_color: formData.logoColor || formData.motifColor,
                logo_animation: getSafeMonogramConfig({ shape: formData.logoShape, animation: formData.logoAnimation }, hasMonogramPro).animation,
                spotify_playlist_url: formData.spotifyUrl,
                background_music_title: formData.backgroundMusicTitle,
                background_music_enabled: Boolean(formData.backgroundMusicEnabled && (musicUrl || previews.backgroundMusic)),
                wedding_party: normalizedWeddingParty,
                include_entourage_section: formData.includeEntourageSection !== false,
                gift_registry_links: formData.registryLinks,
                cash_funds: formData.cashFunds,
                payment_links: formData.paymentLinks,
                is_thank_you_mode: formData.isThankYouMode,
                thank_you_message: formData.thankYouMessage,
                photo_album_link: formData.photoAlbumLink,
                accent_style: formData.accentStyle,
            };

            if (mediaFiles.heroImage || editId) payload.hero_image = heroUrl || previews.heroImage;
            if (mediaFiles.couplePhoto || editId) payload.couple_photo = coupleUrl || previews.couplePhoto;
            if (mediaFiles.teaserVideo || editId) payload.teaser_video = videoUrl || (formData as any).teaser_video; 
            if (mediaFiles.backgroundMusic || editId || previews.backgroundMusic) payload.background_music_url = musicUrl || previews.backgroundMusic;
            if (mediaFiles.giftQr || editId) payload.gift_qr_image = giftQrUrl || previews.giftQr;
            
            // Handle invitation images: merge new uploads with existing previews if editing
            const finalInvitationImages = invitationUrls.length > 0 ? invitationUrls : previews.invitationImages;
            payload.invitation_image = JSON.stringify(finalInvitationImages);
            
            if (mediaFiles.galleryImages.length > 0 || editId) payload.gallery_images = galleryUrls.length > 0 ? galleryUrls : (formData as any).gallery_images;
            if (mediaFiles.receptionVenuePhotos.length > 0 || editId) payload.reception_venue_photos = receptionVenueUrls.length > 0 ? receptionVenueUrls : previews.receptionVenuePhotos;

            const publicSlug = await resolvePublicSlug(weddingId);
            const baseSubmitPayload: any = {
                ...payload,
                ...(publicSlug ? { public_slug: publicSlug } : {}),
                id: weddingId,
                user_id: editId && weddingOwnerId ? weddingOwnerId : user.id,
            };

            let submitPayload = { ...baseSubmitPayload };
            let submitError: unknown = null;
            for (let attempt = 0; attempt < 10; attempt += 1) {
                const { error } = await supabase
                    .from('weddings')
                    .upsert(submitPayload, { onConflict: 'id' });

                if (!error) {
                    submitError = null;
                    break;
                }

                submitError = error;
                const fallbackPayload = { ...submitPayload };
                let canRetry = false;

                if (isMissingFaqColumnError(error) || isMissingOptionalWeddingColumnError(error, 'faq_items')) {
                    delete fallbackPayload.faq_items;
                    canRetry = true;
                }

                if (isMissingPublicSlugColumnError(error) || isMissingOptionalWeddingColumnError(error, 'public_slug')) {
                    delete fallbackPayload.public_slug;
                    canRetry = true;
                }

                if (isMissingOptionalWeddingColumnError(error, 'template_style')) {
                    delete fallbackPayload.template_style;
                    canRetry = true;
                }

                if (isMissingOptionalWeddingColumnError(error, 'gallery_layout')) {
                    delete fallbackPayload.gallery_layout;
                    canRetry = true;
                }

                [
                    'reception_venue_name',
                    'reception_venue_address',
                    'reception_maps_link',
                    'reception_venue_photos',
                    'section_title_font_style',
                    'section_title_color_style',
                    'card_style',
                    'include_entourage_section',
                    'background_music_url',
                    'background_music_title',
                    'background_music_enabled',
                ].forEach((column) => {
                    if (isMissingOptionalWeddingColumnError(error, column)) {
                        delete fallbackPayload[column];
                        canRetry = true;
                    }
                });

                if (!canRetry || JSON.stringify(fallbackPayload) === JSON.stringify(submitPayload)) {
                    break;
                }

                submitPayload = fallbackPayload;
            }

            if (submitError) throw submitError;
            if (submitPayload.public_slug) setExistingPublicSlug(submitPayload.public_slug);

            try {
                const { data: sessionData } = await supabase.auth.getSession();
                const token = sessionData.session?.access_token;
                if (token) {
                    void fetch('/api/public/weddings/invalidate-cache', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            weddingId,
                            publicSlug: submitPayload.public_slug || publicSlug || existingPublicSlug,
                        }),
                    }).catch((error) => console.warn('Wedding cache invalidation request failed:', error));
                }
            } catch (cacheError) {
                console.warn('Wedding cache invalidation skipped:', cacheError);
            }

            // Success
            router.push(`/dashboard/${weddingId}?created=true`);

        } catch (err: any) {
            const errorMessage = getErrorMessage(err);
            console.error('Submission error:', err, errorMessage);
            setIsGenerating(false);
            if (errorMessage.includes('exceeded the maximum allowed size')) {
                alert('Storage Limit Error: Your Supabase bucket has a 50MB default limit. Please compress your files or go to your Supabase Dashboard to check your storage settings.');
            } else {
                alert('Error creating invitation: ' + errorMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2">
                                <label htmlFor="brideName" className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Bride&apos;s Name</label>
                                <input id="brideName" required name="brideName" value={formData.brideName} onChange={handleChange} placeholder="Sarah" className="w-full px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-border bg-neutral focus:border-primary outline-none transition-all text-base min-h-[44px]" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Groom&apos;s Name</label>
                                <input required name="groomName" value={formData.groomName} onChange={handleChange} placeholder="John" className="w-full px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-border bg-neutral focus:border-primary outline-none transition-all text-base min-h-[44px]" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Wedding Hashtag (Optional)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold pointer-events-none">#</span>
                                <input name="hashtag" value={formData.hashtag} onChange={handleChange} placeholder="SarahAndJohn2024" className="icon-field-left w-full pl-14 pr-4 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-border bg-neutral focus:border-primary outline-none transition-all text-base min-h-[44px]" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Wedding Date</label>
                                <input required type="date" name="weddingDate" value={formData.weddingDate} onChange={handleChange} className="icon-field-right w-full pl-4 pr-12 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-border bg-neutral focus:border-primary outline-none text-base min-h-[44px]" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Wedding Time</label>
                                <input required type="time" name="weddingTime" value={formData.weddingTime} onChange={handleChange} className="icon-field-right w-full pl-4 pr-12 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-border bg-neutral focus:border-primary outline-none text-base min-h-[44px]" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Ceremony Location Name</label>
                                <input required name="venueName" value={formData.venueName} onChange={handleChange} placeholder="The Grand Plaza Chapel" className="w-full px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-border bg-neutral focus:border-primary outline-none text-base min-h-[44px]" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Ceremony Google Maps Link (Optional)</label>
                                <div className="relative">
                                    <MapPin className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
                                    <input name="mapsLink" value={formData.mapsLink} onChange={handleChange} placeholder="https://maps.app.goo.gl/..." className="icon-field-left w-full pl-14 pr-4 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-border bg-neutral focus:border-primary outline-none text-base min-h-[44px]" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Ceremony Location Address</label>
                            <AutoResizeTextarea required name="venueAddress" value={formData.venueAddress} onChange={handleChange} placeholder="123 Wedding Lane..." className="w-full min-h-[96px] resize-none rounded-lg border border-border bg-neutral px-4 py-3 text-base outline-none transition-all focus:border-primary focus:bg-white sm:rounded-xl sm:py-4" />
                        </div>

                        <Collapsible title="Reception / Venue Details" isOpen={expandedSection === 'receptionVenue'} onToggle={() => toggleSection('receptionVenue')} icon={MapPin}>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Reception Venue Name</label>
                                        <input name="receptionVenueName" value={formData.receptionVenueName} onChange={handleChange} placeholder="The Grand Plaza Ballroom" className="w-full px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-border bg-neutral focus:border-primary outline-none text-base min-h-[44px]" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Reception Google Maps Link</label>
                                        <div className="relative">
                                            <MapPin className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
                                            <input name="receptionMapsLink" value={formData.receptionMapsLink} onChange={handleChange} placeholder="https://maps.app.goo.gl/..." className="icon-field-left w-full pl-14 pr-4 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-border bg-neutral focus:border-primary outline-none text-base min-h-[44px]" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Reception Venue Address</label>
                                    <AutoResizeTextarea name="receptionVenueAddress" value={formData.receptionVenueAddress} onChange={handleChange} placeholder="Reception venue address..." className="w-full min-h-[96px] resize-none rounded-lg border border-border bg-neutral px-4 py-3 text-base outline-none transition-all focus:border-primary focus:bg-white sm:rounded-xl sm:py-4" />
                                </div>
                                <div className="space-y-3 rounded-2xl border border-border bg-white/70 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Venue Photos</p>
                                            <p className="mt-1 text-xs text-text-secondary/70">Add photos guests can recognize when they arrive.</p>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">{previews.receptionVenuePhotos.length} Photos</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {previews.receptionVenuePhotos.map((src: string, index: number) => (
                                            <div key={`${src}-${index}`} className="relative aspect-square overflow-hidden rounded-xl border border-border bg-neutral group">
                                                <img src={src} className="h-full w-full object-cover" alt={`Reception venue preview ${index + 1}`} />
                                                <button type="button" onClick={() => removeFile('receptionVenuePhotos', index)} className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-colors hover:bg-red-500">
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                        <div className="relative aspect-square rounded-xl border-2 border-dashed border-primary/25 bg-neutral flex flex-col items-center justify-center hover:bg-primary/5 transition-colors">
                                            <ImageIcon className="w-6 h-6 text-primary/40" />
                                            <span className="mt-2 px-2 text-center text-[10px] font-bold uppercase tracking-widest text-text-secondary">Add Photos</span>
                                            <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'receptionVenuePhotos')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Collapsible>

                        <div className="space-y-4 pt-4 border-t border-border">
                            <div className="flex flex-col gap-4 rounded-2xl border border-primary/10 bg-white/70 p-4 sm:p-5">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <label className="text-xs uppercase tracking-widest font-bold text-text-secondary">Our Entourage</label>
                                        <p className="mt-1 text-sm text-text-secondary">Add your maid of honor, best man, sponsors, bridesmaids, groomsmen, and other special people.</p>
                                    </div>
                                    <div className="flex flex-col gap-2 sm:items-end">
                                        <div className="flex flex-wrap gap-2">
                                            <label className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-white">
                                                <Upload className="h-3.5 w-3.5" />
                                                Import CSV
                                                <input type="file" accept=".csv,text/csv" onChange={handleEntourageCsvImport} className="hidden" />
                                            </label>
                                            <button type="button" onClick={() => handleArrayAdd('weddingParty', { name: '', role: '', bio: '', email: '', proposalTemplateKey: DEFAULT_ENTOURAGE_PROPOSAL_TEMPLATE_KEY })} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl">
                                                <Plus className="w-3.5 h-3.5" /> Add Member
                                            </button>
                                        </div>
                                        <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-text-secondary/70">
                                            <FileSpreadsheet className="h-3 w-3" /> CSV: name, role, bio, email
                                        </p>
                                    </div>
                                </div>

                                <label className="flex items-center justify-between gap-4 rounded-xl border border-border bg-neutral px-4 py-3">
                                    <span>
                                        <span className="block text-xs font-bold uppercase tracking-widest text-foreground">Show on wedding page</span>
                                        <span className="mt-1 block text-xs text-text-secondary">Guests will see the section as &quot;Our Entourage&quot;.</span>
                                    </span>
                                    <input type="checkbox" checked={formData.includeEntourageSection !== false} onChange={(e) => setFormData((prev: any) => ({ ...prev, includeEntourageSection: e.target.checked }))} className="h-5 w-5 accent-primary" />
                                </label>

                                {entourageImportStatus && (
                                    <p className={`rounded-xl px-4 py-3 text-sm ${entourageImportStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                        {entourageImportStatus.message}
                                    </p>
                                )}
                            </div>

                            {formData.weddingParty?.length === 0 && <p className="text-sm text-text-secondary italic">No entourage members added yet.</p>}
                            {formData.weddingParty?.map((member: any, i: number) => (
                                <div key={i} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border bg-neutral/50">
                                    <div className="flex-1 space-y-2 sm:space-y-3 w-full">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                            <input placeholder="Name" value={member.name || ''} onChange={(e) => handleArrayChange('weddingParty', i, 'name', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:border-primary outline-none min-h-[44px]" />
                                            <input placeholder="Role (e.g. Maid of Honor)" value={member.role || ''} onChange={(e) => handleArrayChange('weddingParty', i, 'role', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:border-primary outline-none min-h-[44px]" />
                                        </div>
                                        <input placeholder="Short Bio (Optional)" value={member.bio || ''} onChange={(e) => handleArrayChange('weddingParty', i, 'bio', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:border-primary outline-none" />
                                        <div className="grid grid-cols-1 gap-2 rounded-xl border border-primary/10 bg-white p-3 sm:grid-cols-2 sm:gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Proposal Email</label>
                                                <input type="email" placeholder="name@email.com" value={member.email || ''} onChange={(e) => handleArrayChange('weddingParty', i, 'email', e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-primary min-h-[44px]" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Proposal Tone & Theme</label>
                                                <div className="flex items-center justify-between gap-2 pt-1">
                                                    <span className="truncate text-xs font-bold text-foreground">
                                                        {getEntourageProposalTemplate(member.proposalTemplateKey).label} &bull; {getEntourageCardTheme(member.proposalCardTheme).label}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setCustomizingMemberIndex(i)}
                                                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all flex-shrink-0"
                                                    >
                                                        <Sparkles className="h-3.5 w-3.5" /> Customize & Preview
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-1 sm:col-span-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Personal Proposal Message</label>
                                                <AutoResizeTextarea value={member.proposalMessage || getEntourageProposalTemplate(member.proposalTemplateKey).defaultMessage} onChange={(e) => handleArrayChange('weddingParty', i, 'proposalMessage', e.target.value)} placeholder="Write a message they will see in the proposal email." className="w-full min-h-[84px] resize-none rounded-lg border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-primary" />
                                                <div className="flex items-center justify-between text-[10px] leading-5 text-text-secondary pt-0.5">
                                                    <span>Send and track this proposal from Planner after saving.</span>
                                                    <button type="button" onClick={() => setCustomizingMemberIndex(i)} className="text-primary font-bold hover:underline">
                                                        Customize Card Theme &rarr;
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => handleArrayRemove('weddingParty', i)} className="p-2 sm:p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}

                            {customizingMemberIndex !== null && formData.weddingParty?.[customizingMemberIndex] && (
                                <EntourageProposalCustomizerSection
                                    member={formData.weddingParty[customizingMemberIndex]}
                                    coupleNames={[formData.brideName || 'Bride', formData.groomName || 'Groom'].join(' & ')}
                                    weddingDate={formData.weddingDate || 'To be announced'}
                                    venueName={formData.venueName || 'To be announced'}
                                    couplePhotoUrl={previews.couplePhoto}
                                    weddingHeroImageUrl={previews.heroImage}
                                    onClose={() => setCustomizingMemberIndex(null)}
                                    onSave={(updatedMember) => {
                                        setFormData((prev: any) => {
                                            const nextParty = [...(prev.weddingParty || [])];
                                            nextParty[customizingMemberIndex] = updatedMember;
                                            return { ...prev, weddingParty: nextParty };
                                        });
                                    }}
                                />
                            )}
                        </div>
                    </div>
                );
            case 1: {
                const styleVariants = getTemplateStyleVariants(formData.template);
                const selectedStyleAvailable = isTemplateStyleAvailable(formData.template, formData.templateStyle);
                const activeTemplateMeta = TEMPLATES.find((tmpl) => tmpl.id === formData.template);

                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Select Wireframe Style</label>
                            {!isPremium && (
                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                                    {FREE_TEMPLATE_IDS.length} Free / {TEMPLATES.length - FREE_TEMPLATE_IDS.length} Premium
                                </span>
                            )}
                        </div>
                        {/* ── Mobile: Collapsible Template List ── */}
                        <div className="sm:hidden space-y-1">
                            {TEMPLATES.map((tmpl) => {
                                const isLocked = !isPremium && !FREE_TEMPLATE_IDS.includes(tmpl.id as typeof FREE_TEMPLATE_IDS[number]);
                                const isSelected = formData.template === tmpl.id;
                                const isExpanded = expandedTemplateId === tmpl.id;
                                return (
                                    <div key={tmpl.id} className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                                        isSelected
                                            ? 'border-primary/40 bg-primary/5 shadow-sm'
                                            : 'border-border/60 bg-white/80'
                                    }`}>
                                        {/* Collapsed row */}
                                        <button
                                            type="button"
                                            onClick={() => setExpandedTemplateId(isExpanded ? null : tmpl.id)}
                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
                                        >
                                            <div
                                                className="h-3 w-3 shrink-0 rounded-full shadow-[0_0_0_3px_rgba(255,255,255,0.6)]"
                                                style={{ backgroundColor: tmpl.accent }}
                                            />
                                            <span className={`flex-1 text-sm font-semibold truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                                {tmpl.name}
                                            </span>
                                            <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-foreground/40 shrink-0">
                                                {tmpl.eyebrow}
                                            </span>
                                            {isLocked && <Sparkles className="h-3 w-3 text-primary/50 shrink-0" />}
                                            {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                                            <ChevronDown className={`h-3.5 w-3.5 text-text-secondary/60 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </button>
                                        {/* Expanded details — rendered in original rich card style */}
                                        <AnimatePresence initial={false}>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                                                >
                                                    <div className="p-2 pt-0">
                                                        <div
                                                            className={`qw-template-card group relative overflow-hidden rounded-2xl border text-left transition-all duration-300 ${
                                                                isLocked
                                                                    ? 'border-border/70 bg-neutral/60 opacity-70 cursor-not-allowed'
                                                                    : isSelected
                                                                        ? 'border-primary/40 bg-white shadow-md shadow-primary/10'
                                                                        : 'border-border/70 bg-white'
                                                            }`}
                                                            style={{
                                                                backgroundImage: `${tmpl.previewGradient}, linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.98))`,
                                                            }}
                                                        >
                                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.65),transparent_38%)] pointer-events-none" />
                                                            <div className="relative z-10 flex flex-col p-4">
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div>
                                                                        <span className="inline-flex items-center rounded-full border border-white/55 bg-white/75 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.24em] text-foreground/60 backdrop-blur-sm">
                                                                            {tmpl.eyebrow}
                                                                        </span>
                                                                        <div className="mt-2.5 flex items-center gap-2">
                                                                            <div
                                                                                className="h-2.5 w-2.5 rounded-full shadow-[0_0_0_4px_rgba(255,255,255,0.45)]"
                                                                                style={{ backgroundColor: tmpl.accent }}
                                                                            />
                                                                            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/45">
                                                                                Included
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    {isLocked ? (
                                                                        <div className="rounded-full border border-primary/15 bg-white/70 p-2 text-primary shadow-sm">
                                                                            <Sparkles className="h-3.5 w-3.5" />
                                                                        </div>
                                                                    ) : isSelected ? (
                                                                        <div className="rounded-full border border-primary/20 bg-white/80 p-2 text-primary shadow-sm">
                                                                            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                                <div className="mt-3 space-y-2">
                                                                    <p className="font-serif text-lg leading-tight text-foreground font-bold">
                                                                        {tmpl.name}
                                                                    </p>
                                                                    <p className="text-xs leading-relaxed text-foreground/65">
                                                                        {tmpl.desc}
                                                                    </p>
                                                                    <div className="flex items-center justify-between pt-1">
                                                                        <span className="text-[10px] uppercase tracking-[0.24em] text-foreground/40">
                                                                            {tmpl.mood}
                                                                        </span>
                                                                        <div className="h-1.5 w-14 rounded-full bg-black/6">
                                                                            <div
                                                                                className="h-full rounded-full"
                                                                                style={{ width: isSelected ? '100%' : '70%', backgroundColor: tmpl.accent }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="pt-2">
                                                                        <button
                                                                            type="button"
                                                                            disabled={isLocked}
                                                                            onClick={() => {
                                                                                if (!isLocked) {
                                                                                    setFormData((prev: any) => ({
                                                                                        ...prev,
                                                                                        template: tmpl.id,
                                                                                        templateStyle: isTemplateStyleAvailable(tmpl.id, prev.templateStyle) ? prev.templateStyle : DEFAULT_TEMPLATE_STYLE,
                                                                                    }));
                                                                                }
                                                                            }}
                                                                            className={`w-full rounded-xl py-2.5 px-3 text-center text-xs font-bold uppercase tracking-widest transition-all ${
                                                                                isSelected
                                                                                    ? 'bg-primary text-white shadow-sm'
                                                                                    : isLocked
                                                                                        ? 'bg-neutral text-text-secondary/60 cursor-not-allowed'
                                                                                        : 'bg-white/80 border border-primary/20 text-primary active:bg-primary active:text-white'
                                                                            }`}
                                                                        >
                                                                            {isSelected ? '✓ Currently Selected' : isLocked ? 'Locked (Pro Only)' : 'Select This Wireframe'}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                        {/* ── Desktop: Original Card Grid ── */}
                        <div className="hidden sm:grid sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                            {TEMPLATES.map((tmpl) => {
                                const isLocked = !isPremium && !FREE_TEMPLATE_IDS.includes(tmpl.id as typeof FREE_TEMPLATE_IDS[number]);
                                const isSelected = formData.template === tmpl.id;
                                return (
                                    <button
                                        key={tmpl.id}
                                        type="button"
                                        onClick={() => !isLocked && setFormData((prev: any) => ({
                                            ...prev,
                                            template: tmpl.id,
                                            templateStyle: isTemplateStyleAvailable(tmpl.id, prev.templateStyle) ? prev.templateStyle : DEFAULT_TEMPLATE_STYLE,
                                        }))}
                                        className={`group relative overflow-hidden rounded-[1.75rem] border text-left transition-all duration-300 min-h-[176px] ${
                                            isLocked
                                                ? 'border-border/70 bg-neutral/60 opacity-70 cursor-not-allowed'
                                                : isSelected
                                                    ? 'border-primary/40 bg-white shadow-[0_24px_80px_rgba(192,128,129,0.18)] -translate-y-1'
                                                    : 'border-border/70 bg-white hover:border-primary/25 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(58,42,45,0.10)]'
                                        }`}
                                        style={{
                                            backgroundImage: `${tmpl.previewGradient}, linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.98))`,
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.65),transparent_38%)] pointer-events-none" />
                                        <div className="relative z-10 flex h-full flex-col p-4 sm:p-5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <span className="inline-flex items-center rounded-full border border-white/55 bg-white/75 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.24em] text-foreground/60 backdrop-blur-sm">
                                                        {tmpl.eyebrow}
                                                    </span>
                                                    <div className="mt-3 flex items-center gap-2">
                                                        <div
                                                            className="h-2.5 w-2.5 rounded-full shadow-[0_0_0_5px_rgba(255,255,255,0.45)]"
                                                            style={{ backgroundColor: tmpl.accent }}
                                                        />
                                                        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/45">
                                                            Included
                                                        </span>
                                                    </div>
                                                </div>
                                                {isLocked ? (
                                                    <div className="rounded-full border border-primary/15 bg-white/70 p-2 text-primary shadow-sm">
                                                        <Sparkles className="h-3.5 w-3.5" />
                                                    </div>
                                                ) : isSelected ? (
                                                    <div className="rounded-full border border-primary/20 bg-white/80 p-2 text-primary shadow-sm">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                    </div>
                                                ) : null}
                                            </div>
                                            <div className="mt-auto space-y-2">
                                                <p className="font-serif text-lg sm:text-xl leading-tight text-foreground">
                                                    {tmpl.name}
                                                </p>
                                                <p className="text-[11px] sm:text-xs leading-relaxed text-foreground/65 line-clamp-2">
                                                    {tmpl.desc}
                                                </p>
                                                <div className="flex items-center justify-between pt-2">
                                                    <span className="text-[10px] uppercase tracking-[0.24em] text-foreground/40">
                                                        {tmpl.mood}
                                                    </span>
                                                    <div className="h-1.5 w-14 rounded-full bg-black/6">
                                                        <div
                                                            className="h-full rounded-full"
                                                            style={{ width: isSelected ? '100%' : '70%', backgroundColor: tmpl.accent }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="space-y-3 rounded-[1.75rem] border border-border/70 bg-white/80 p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">
                                        Style Variant
                                    </p>
                                    <p className="mt-1 text-sm text-text-secondary">
                                        Keep the original look or apply a Nicepage-inspired wedding landing style to this template.
                                    </p>
                                </div>
                                {activeTemplateMeta && (
                                    <span
                                        className="mt-1 h-3 w-3 shrink-0 rounded-full shadow-[0_0_0_5px_rgba(255,255,255,0.8)]"
                                        style={{ backgroundColor: activeTemplateMeta.accent }}
                                    />
                                )}
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData((prev: any) => ({ ...prev, templateStyle: DEFAULT_TEMPLATE_STYLE }))}
                                    className={`rounded-2xl border p-4 text-left transition-all ${
                                        !formData.templateStyle || formData.templateStyle === DEFAULT_TEMPLATE_STYLE || !selectedStyleAvailable
                                            ? 'border-primary/40 bg-primary/5 shadow-lg shadow-primary/10'
                                            : 'border-border bg-neutral/50 hover:border-primary/30 hover:bg-white'
                                    }`}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-[0.22em] text-primary/70">Current</span>
                                    <p className="mt-2 font-serif text-lg text-foreground">Original</p>
                                    <p className="mt-1 text-xs leading-relaxed text-text-secondary">The existing QuickWeds template design. Existing weddings keep this by default.</p>
                                </button>
                                {styleVariants.map((variant) => (
                                    <button
                                        key={variant.id}
                                        type="button"
                                        onClick={() => setFormData((prev: any) => ({ ...prev, templateStyle: variant.id }))}
                                        className={`rounded-2xl border p-4 text-left transition-all ${
                                            formData.templateStyle === variant.id
                                                ? 'border-primary/40 bg-primary/5 shadow-lg shadow-primary/10'
                                                : 'border-border bg-neutral/50 hover:border-primary/30 hover:bg-white'
                                        }`}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-primary/70">{variant.source}</span>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: variant.accent }} />
                                            <p className="font-serif text-lg text-foreground">{variant.name}</p>
                                        </div>
                                        <p className="mt-1 text-xs leading-relaxed text-text-secondary">{variant.desc}</p>
                                    </button>
                                ))}
                            </div>
                            {styleVariants.length === 0 && (
                                <p className="rounded-2xl border border-dashed border-border bg-neutral/50 px-4 py-3 text-xs text-text-secondary">
                                    Additional landing-page style variants will be added here as we adapt more wedding references.
                                </p>
                            )}
                        </div>
                        {!isPremium && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/20">
                                <div className="flex items-start gap-3">
                                    <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm text-foreground mb-1">All templates are included</h4>
                                        <p className="text-xs text-text-secondary mb-3">Choose any modern, luxury, or editorial style for free.</p>
                                        <UpgradeButton weddingId={editId || ''} variant="outlined" className="text-xs px-4 py-2" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            }
            case 2:
                return (
                    <div className="space-y-6">
                         <div className="space-y-4">
                             <label className="text-[10px] uppercase tracking-[0.2em] font-black text-text-secondary/50 mb-2 block">Motif Color</label>
                             <div className="flex flex-wrap gap-2 mb-3">
                                 {["#D16C78", "#D6B87C", "#B85C7A", "#3A2A2D", "#7A5A61", "#6B7A62", "#8F6A45", "#C5A059", "#CFB53B", "#537A57", "#8D7BC4", "#0B8F7B", "#A56D52", "#C7704D", "#A0616A", "#FFF8F4", "#F2C1CC", "#F8EEEA", "#EBD4C4"].map((color) => (
                                     <button
                                         key={color}
                                         type="button"
                                         onClick={() => applyMotifColor(color)}
                                         className={`w-10 h-10 rounded-xl border-2 transition-all ${formData.motifColor === color ? 'border-white ring-2 ring-primary shadow-xl scale-110' : 'border-border/50 hover:border-primary/50'}`}
                                         style={{ backgroundColor: color }}
                                         aria-label={`Select color ${color}`}
                                     />
                                 ))}
                             </div>
                         </div>
                         <div>
                             <label className="text-[10px] uppercase tracking-[0.2em] font-black text-text-secondary/50 mb-2 block">Custom Color</label>
                             <div className="flex items-center gap-3">
                                 <input
                                     type="color"
                                     value={formData.motifColor}
                                     onChange={(e) => applyMotifColor(e.target.value)}
                                     className="w-10 h-10 rounded-xl border border-border p-0 cursor-pointer bg-transparent"
                                     aria-label="Pick a custom color"
                                 />
                                 <input
                                     type="text"
                                     value={formData.motifColor}
                                     onChange={(e) => applyMotifColor(e.target.value)}
                                     placeholder="#HEX"
                                     className="flex-1 px-3 py-2 rounded-xl border border-border bg-neutral/30 text-sm font-mono outline-none focus:bg-white transition-all"
                                     pattern="^#[0-9A-Fa-f]{6}$"
                                 />
                             </div>
                         </div>
                         <div className="flex items-center gap-2 pt-2">
                             <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: formData.motifColor }} />
                             <span className="text-[10px] uppercase tracking-[0.15em] text-text-secondary/60">
                                 Selected: <span className="font-mono text-foreground">{formData.motifColor}</span>
                             </span>
                         </div>
                         <div className="space-y-4 rounded-[1.75rem] border border-border bg-white/75 p-4 shadow-sm sm:p-5">
                             <div>
                                 <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Section Title Styles</p>
                                 <p className="mt-1 text-sm leading-6 text-text-secondary">
                                     Section heading colors automatically match your motif. Choose another preset only when you want a deliberate contrast.
                                 </p>
                             </div>
                             <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                 {SECTION_TITLE_FONT_STYLES.map((style) => (
                                     <button
                                         key={style.id}
                                         type="button"
                                         onClick={() => setFormData((prev: any) => ({ ...prev, sectionTitleFontStyle: style.id }))}
                                         className={`rounded-2xl border p-4 text-left transition-all ${
                                             formData.sectionTitleFontStyle === style.id
                                                 ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                                 : 'border-border bg-neutral/50 hover:border-primary/35 hover:bg-white'
                                         }`}
                                     >
                                         <p className={`text-xl leading-tight text-foreground ${style.className || 'font-serif'}`}>Our Venue</p>
                                         <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">{style.name}</p>
                                     </button>
                                 ))}
                             </div>
                             <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                                 {SECTION_TITLE_COLOR_STYLES.map((style) => {
                                     const isSelected = formData.sectionTitleColorStyle === style.id;
                                     const gradient = 'gradient' in style ? style.gradient : '';
                                     const motifGradient = style.id === 'motif' ? getMotifSectionTitleGradient(formData.motifColor) : '';
                                     const previewStyle = gradient || motifGradient
                                         ? { backgroundImage: gradient || motifGradient }
                                         : { color: formData.motifColor };
                                     const usesGradient = Boolean(gradient || motifGradient);
                                     return (
                                         <button
                                             key={style.id}
                                             type="button"
                                             onClick={() => setFormData((prev: any) => ({ ...prev, sectionTitleColorStyle: style.id }))}
                                             className={`rounded-2xl border p-4 text-left transition-all ${
                                                 isSelected
                                                     ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                                     : 'border-border bg-neutral/50 hover:border-primary/35 hover:bg-white'
                                             }`}
                                         >
                                             <p className={`text-lg font-serif font-bold ${usesGradient ? 'bg-clip-text text-transparent' : ''}`} style={previewStyle}>
                                                 Section Title
                                             </p>
                                             <div className="mt-3 flex gap-1.5">
                                                 {style.swatches.map((swatch) => (
                                                     <span
                                                         key={`${style.id}-${swatch}`}
                                                         className="h-5 w-5 rounded-full border border-white shadow-sm"
                                                         style={{ background: swatch === 'var(--primary)' ? formData.motifColor : swatch }}
                                                     />
                                                 ))}
                                             </div>
                                             <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">{style.name}</p>
                                         </button>
                                     );
                                 })}
                             </div>
                         </div>
                          <div className="space-y-4 rounded-[1.75rem] border border-border bg-white/75 p-4 shadow-sm sm:p-5">
                              <div>
                                  <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Card & Section Container Style</p>
                                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                                      Choose how cards and sections are framed across your template (bordered cards, borderless glass, hairline rules, soft parchment, architectural arches, or full-bleed strips).
                                  </p>
                              </div>
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                  {CARD_CONTAINER_STYLES.map((style) => {
                                      const isSelected = (formData.cardStyle || 'default') === style.id;
                                      return (
                                          <button
                                              key={style.id}
                                              type="button"
                                              onClick={() => setFormData((prev: any) => ({ ...prev, cardStyle: style.id }))}
                                              className={`rounded-2xl border p-4 text-left transition-all ${
                                                  isSelected
                                                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                                      : 'border-border bg-neutral/50 hover:border-primary/35 hover:bg-white'
                                              }`}
                                          >
                                              <p className="text-sm font-bold text-foreground">{style.name}</p>
                                              <p className="mt-1 text-xs text-text-secondary leading-relaxed">{style.description}</p>
                                          </button>
                                      );
                                  })}
                              </div>
                          </div>
                         <Collapsible title="Typography & Fonts" isOpen={expandedSection === 'fonts'} onToggle={() => toggleSection('fonts')} icon={Layout}>
                            <div className="grid grid-cols-2 gap-2 no-scrollbar sm:max-h-[400px] sm:grid-cols-3 sm:gap-3 sm:overflow-y-auto sm:pr-2 md:gap-4 custom-scrollbar">
                                {FONTS.map((font, index) => {
                                    const isLocked = !isPremium && index >= 10;
                                    return (
                                        <button
                                            key={font.id}
                                            type="button"
                                            onClick={() => !isLocked && setFormData((prev: any) => ({ ...prev, fontStyle: font.id }))}
                                            className={`p-3 sm:p-4 rounded-lg sm:rounded-2xl border-2 transition-all text-left flex flex-col gap-1 relative min-h-[100px] ${isLocked ? 'border-border bg-neutral/50 opacity-60 cursor-not-allowed' :
                                                formData.fontStyle === font.id ? 'border-primary bg-primary/5' :
                                                    'border-border bg-white hover:border-primary/30'
                                                }`}
                                        >
                                            {isLocked && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg sm:rounded-2xl backdrop-blur-[1px]">
                                                    <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                                                </div>
                                            )}
                                            <p className={`text-base sm:text-lg leading-none line-clamp-1 ${font.class}`}>{font.name}</p>
                                            <p className="text-[8px] sm:text-[10px] text-text-secondary/70 line-clamp-2">{font.desc}</p>
                                        </button>
                                    );
                                })}
                            </div>
                            {!isPremium && (
                                <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/20">
                                    <div className="flex items-start gap-3">
                                        <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm text-foreground mb-1">All fonts are included</h4>
                                            <p className="text-xs text-text-secondary mb-3">Use every typography option in the builder for free.</p>
                                            <UpgradeButton weddingId={editId || ''} variant="outlined" className="text-xs px-4 py-2" />
                                        </div>
                                    </div>
                                </div>
                             )}
                         </Collapsible>
                         <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Wedding Quote</label>
                            <input name="quote" value={formData.quote} onChange={handleChange} placeholder="Love is patient..." className="w-full px-4 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Our Story</label>
                            <AutoResizeTextarea name="story" value={formData.story} onChange={handleChange} placeholder="How we met..." className="w-full min-h-[140px] resize-none rounded-xl border border-border bg-neutral px-4 py-3 outline-none transition-all focus:border-primary focus:bg-white" />
                        </div>
                        <div className="space-y-4 pt-8 border-t border-border">
                            <div className="flex items-center gap-2 text-primary">
                                <Sparkles className="w-4 h-4" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary">Decorative Accents</h3>
                            </div>
                            <p className="text-xs text-text-secondary/60 ml-6 -mt-2 mb-4">Add elegant vector illustrations that automatically tuck into the edges on phone screens.</p>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                                {ACCENT_STYLES.map((style) => (
                                    <button
                                        key={style.id}
                                        type="button"
                                        onClick={() => setFormData((prev: any) => ({ ...prev, accentStyle: style.id }))}
                                        className={`group rounded-2xl border-2 p-3 text-left transition-all ${formData.accentStyle === style.id ? 'scale-[1.02] border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10' : 'border-border bg-neutral hover:border-primary/50 hover:bg-white text-text-secondary'}`}
                                    >
                                        <div className="relative mb-3 h-16 overflow-hidden rounded-xl border border-white/70 bg-white shadow-inner">
                                            {style.id === 'none' ? (
                                                <div className="flex h-full items-center justify-center">
                                                    <X className="h-5 w-5 opacity-50" />
                                                </div>
                                            ) : (
                                                <>
                                                    <DecorativeLayer
                                                        type={style.id}
                                                        color={formData.motifColor}
                                                        position="center"
                                                        className="absolute left-1/2 top-1/2 h-16 w-16 opacity-70"
                                                    />
                                                    <span className="absolute inset-x-3 bottom-2 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                                                </>
                                            )}
                                        </div>
                                        <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-foreground">{style.name}</span>
                                        <span className="mt-1 block text-[10px] leading-4 text-text-secondary">{style.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-4">
                            <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Monogram & Branding</h2>
                            <p className="text-text-secondary">Customize your wedding initials, choose luxury monogram styles & motion animations.</p>
                        </div>
                        <div className="space-y-6">
                                <div className="overflow-hidden rounded-[2rem] border border-primary/10 bg-[radial-gradient(circle_at_top,rgba(192,128,129,0.14),transparent_48%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,248,244,0.78))] p-5 text-center shadow-xl shadow-primary/10 sm:p-8">
                                    <p className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-primary/60">Live Monogram</p>
                                    <MonogramMark
                                        key={`${formData.logoAnimation}-${monogramPreviewNonce}`}
                                        ref={monogramExportRef}
                                        initials={formData.logoInitials}
                                        brideName={formData.brideName}
                                        groomName={formData.groomName}
                                        shape={getSafeMonogramConfig({ shape: formData.logoShape, animation: formData.logoAnimation }, hasMonogramPro).shape}
                                        color={formData.logoColor}
                                        motifColor={formData.motifColor}
                                        fontClassName={FONTS.find(f => f.id === formData.logoFont)?.class || 'font-serif'}
                                        animation={hasMonogramPro ? formData.logoAnimation : 'none'}
                                        size="lg"
                                        className="mx-auto"
                                    />
                                    {hasMonogramPro && formData.logoAnimation !== 'none' && (
                                        <button type="button" onClick={() => setMonogramPreviewNonce((value) => value + 1)} className="mx-auto mt-4 inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-white/85 px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary/5">
                                            <Play className="h-3.5 w-3.5 fill-current" /> Replay animated preview
                                        </button>
                                    )}
                                    <div className="mx-auto mt-6 h-px w-28 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary/70">
                                        {formData.brideName || 'Bride'} & {formData.groomName || 'Groom'}
                                    </p>
                                </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Initials</label>
                                    <input
                                        name="logoInitials"
                                        value={formData.logoInitials}
                                        onChange={handleChange}
                                        placeholder={(formData.brideName?.[0] || 'A') + ' & ' + (formData.groomName?.[0] || 'B')}
                                        className="w-full px-4 py-3.5 rounded-xl border border-border bg-neutral focus:border-primary outline-none text-sm font-medium"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Monogram Font</label>
                                    <select
                                        name="logoFont"
                                        value={formData.logoFont}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3.5 rounded-xl border border-border bg-neutral focus:border-primary outline-none text-sm font-medium"
                                    >
                                        {FONTS.map(f => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-text-secondary/50 block">Monogram Color</label>
                                <div className="flex flex-wrap gap-2.5">
                                    {["#D16C78", "#D6B87C", "#B85C7A", "#3A2A2D", "#7A5A61", "#6B7A62", "#8F6A45", "#C5A059", "#CFB53B", "#537A57", "#8D7BC4", "#0B8F7B", "#A56D52", "#C7704D", "#A0616A", "#FFF8F4", "#F2C1CC", "#F8EEEA", "#EBD4C4"].map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setFormData((prev: any) => ({ ...prev, logoColor: color }))}
                                            className={`w-10 h-10 rounded-xl border-2 transition-all ${formData.logoColor === color ? 'border-white ring-2 ring-primary shadow-xl scale-110' : 'border-border/50 hover:border-primary/50'}`}
                                            style={{ backgroundColor: color }}
                                            aria-label={`Select monogram color ${color}`}
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                    <input
                                        type="color"
                                        value={formData.logoColor || formData.motifColor}
                                        onChange={(e) => setFormData((prev: any) => ({ ...prev, logoColor: e.target.value }))}
                                        className="w-10 h-10 rounded-xl border border-border p-0 cursor-pointer bg-transparent"
                                        aria-label="Pick a custom monogram color"
                                    />
                                    <input
                                        type="text"
                                        value={formData.logoColor || ''}
                                        onChange={(e) => setFormData((prev: any) => ({ ...prev, logoColor: e.target.value }))}
                                        placeholder="Custom Hex (e.g. #000000)"
                                        className="flex-1 px-4 py-3 rounded-xl border border-border bg-neutral/30 text-sm font-mono outline-none focus:bg-white transition-all min-h-[44px]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Monogram Style</label>
                                    {!isPremium && (
                                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                            Pro unlocks 14+ luxury crest styles
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                                    {MONOGRAM_SHAPES.map((shape) => {
                                        const isLocked = !isPremium && shape.pro;
                                        const isSelected = formData.logoShape === shape.id;
                                        return (
                                            <button
                                                key={shape.id}
                                                type="button"
                                                onClick={() => {
                                                    if (isLocked) {
                                                        setShowMonogramProModal(true);
                                                    } else {
                                                        setFormData((prev: any) => ({ ...prev, logoShape: shape.id }));
                                                    }
                                                }}
                                                className={`relative rounded-2xl border p-3 text-left transition-all ${
                                                    isSelected
                                                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-2 ring-primary/20'
                                                        : 'border-border bg-neutral/60 hover:border-primary/40 hover:bg-white'
                                                }`}
                                            >
                                                {shape.pro && (
                                                    <span className="absolute top-2 right-2 rounded-md bg-gradient-to-r from-amber-500 to-rose-500 px-1.5 py-0.5 text-[9px] font-black uppercase text-white shadow-sm">
                                                        PRO
                                                    </span>
                                                )}
                                                <MonogramMark
                                                    initials={formData.logoInitials}
                                                    brideName={formData.brideName}
                                                    groomName={formData.groomName}
                                                    shape={shape.id}
                                                    color={formData.logoColor}
                                                    motifColor={formData.motifColor}
                                                    fontClassName={FONTS.find(f => f.id === formData.logoFont)?.class || 'font-serif'}
                                                    size="sm"
                                                    className="mx-auto mb-2"
                                                />
                                                <span className="block text-[11px] font-black uppercase tracking-[0.14em] text-foreground truncate">{shape.name}</span>
                                                <span className="mt-0.5 block text-[9px] leading-3.5 text-text-secondary line-clamp-2">{shape.desc}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-3 pt-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Monogram Motion Animation</label>
                                    {!isPremium && (
                                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                            Pro unlocks Website Motion Animations
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                    {MONOGRAM_ANIMATIONS.map((anim) => {
                                        const isLocked = !isPremium && anim.id !== 'none';
                                        const isSelected = (formData.logoAnimation || 'none') === anim.id;
                                        return (
                                            <button
                                                key={anim.id}
                                                type="button"
                                                onClick={() => {
                                                    if (isLocked) {
                                                        setShowMonogramProModal(true);
                                                    } else {
                                                        setFormData((prev: any) => ({ ...prev, logoAnimation: anim.id }));
                                                    }
                                                }}
                                                className={`relative rounded-2xl border p-3 text-left transition-all ${
                                                    isSelected
                                                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-2 ring-primary/20'
                                                        : 'border-border bg-neutral/60 hover:border-primary/40 hover:bg-white'
                                                }`}
                                            >
                                                {anim.id !== 'none' && (
                                                    <span className="absolute top-2 right-2 rounded-md bg-gradient-to-r from-amber-500 to-rose-500 px-1.5 py-0.5 text-[9px] font-black uppercase text-white shadow-sm">
                                                        PRO
                                                    </span>
                                                )}
                                                <span className="block text-xs font-black uppercase tracking-wider text-foreground mb-1">{anim.name}</span>
                                                <span className="block text-[10px] text-text-secondary leading-normal">{anim.desc}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="pt-6">
                                <MonogramExporter
                                    initials={formData.logoInitials}
                                    brideName={formData.brideName}
                                    groomName={formData.groomName}
                                    shape={formData.logoShape}
                                    animation={formData.logoAnimation}
                                    color={formData.logoColor}
                                    motifColor={formData.motifColor}
                                    fontClassName={FONTS.find(f => f.id === formData.logoFont)?.class || 'font-serif'}
                                    isPro={isPremium}
                                    onRequirePro={() => setShowMonogramProModal(true)}
                                />
                            </div>
                        </div>

                        {showMonogramProModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in">
                                <div className="relative w-full max-w-md rounded-3xl border border-primary/20 bg-white p-8 shadow-2xl text-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowMonogramProModal(false)}
                                        className="absolute top-4 right-4 text-text-secondary hover:text-foreground"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-amber-100 to-rose-100">
                                        <Sparkles className="h-8 w-8 text-amber-600 animate-pulse" />
                                    </div>
                                    <h3 className="font-serif text-2xl font-bold text-foreground mb-2">Unlock Premium Monograms</h3>
                                    <p className="text-xs leading-relaxed text-text-secondary mb-6">
                                        Upgrade to QuickWeds Pro to access 14+ luxury monogram crest styles, smooth motion animations for your website, and high-definition video exports (MP4/WebM) for video invitations and paper stationery!
                                    </p>
                                    <div className="space-y-3 mb-6 text-left text-xs text-foreground/80 font-medium">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0" />
                                            <span>14+ Exclusive Luxury & Botanical Crest Styles</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0" />
                                            <span>6 Motion Animations for your Generated Wedding Site</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0" />
                                            <span>Export HD Animated Video Files (MP4/WebM)</span>
                                        </div>
                                    </div>
                                    <UpgradeButton weddingId={editId || ''} className="w-full justify-center py-3.5 text-sm" />
                                </div>
                                <div className="rounded-2xl border border-border bg-white p-4 sm:p-5">
                                    <div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-foreground">Invitation-ready downloads</p><p className="mt-1 text-xs text-text-secondary">PNG has transparency. JPG and MP4 use a pure-white background.</p></div>{!hasMonogramPro && <Lock className="h-4 w-4 text-text-secondary" />}</div>
                                    <div className="flex flex-wrap gap-2">
                                        {(['png', 'jpg', 'mp4'] as const).map((format) => <button key={format} type="button" disabled={Boolean(monogramExporting)} onClick={() => handleMonogramExport(format)} className={`inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50 ${!hasMonogramPro ? 'opacity-65' : ''}`}><Download className="h-3.5 w-3.5" />{monogramExporting === format ? `Preparing ${format.toUpperCase()}…` : `Download ${format.toUpperCase()}`}</button>)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Hero Image</label>
                                <div className="relative h-44 rounded-2xl border-2 border-dashed border-border bg-neutral flex flex-col items-center justify-center overflow-hidden">
                                    {previews.heroImage ? <img src={previews.heroImage} className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-primary/40" />}
                                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'heroImage')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Couple Photo</label>
                                <div className="relative h-44 rounded-2xl border-2 border-dashed border-border bg-neutral flex flex-col items-center justify-center overflow-hidden">
                                    {previews.couplePhoto ? <img src={previews.couplePhoto} className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-primary/40" />}
                                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'couplePhoto')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Teaser Video (Optional)</label>
                            <div className="relative h-48 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-neutral hover:bg-neutral/80 transition-colors group">
                                {mediaFiles.teaserVideo ? (
                                    <div className="text-center p-4">
                                        <Video className="w-8 h-8 text-primary mx-auto mb-2" />
                                        <p className="text-sm font-bold text-foreground">{mediaFiles.teaserVideo.name}</p>
                                        <button type="button" onClick={() => setMediaFiles(prev => ({ ...prev, teaserVideo: null }))} className="text-xs text-red-500 hover:underline mt-2">Remove</button>
                                    </div>
                                ) : (
                                    <div className="text-center group-hover:scale-105 transition-transform">
                                        <Video className="w-8 h-8 text-primary/40 mx-auto mb-2" />
                                        <span className="text-sm text-text-secondary font-medium">Upload Video {!isPremium ? '(Free < 50MB)' : '(Max 50MB)'}</span>
                                        {!isPremium && <p className="text-[10px] text-primary mt-1 font-bold italic">Upgrade for larger files</p>}
                                    </div>
                                )}
                                <input type="file" accept="video/*" onChange={(e) => handleFileChange(e, 'teaserVideo')} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                        </div>


                        <div className="space-y-4 rounded-[2rem] border border-primary/15 bg-white/75 p-5 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Music className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Background Music</p>
                                    <p className="mt-1 text-sm leading-6 text-text-secondary">
                                        Upload one song that guests can play while scrolling the wedding invitation.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-[1fr_0.85fr]">
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Song File</label>
                                    <div className="relative min-h-[112px] rounded-2xl border-2 border-dashed border-border bg-neutral p-4 transition-colors hover:bg-neutral/80">
                                        {mediaFiles.backgroundMusic || previews.backgroundMusic ? (
                                            <div className="flex h-full min-h-[78px] items-center justify-between gap-4">
                                                <div className="min-w-0">
                                                    <Music className="mb-2 h-6 w-6 text-primary" />
                                                    <p className="truncate text-sm font-bold text-foreground">
                                                        {mediaFiles.backgroundMusic?.name || formData.backgroundMusicTitle || 'Uploaded wedding song'}
                                                    </p>
                                                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">Ready for invitation page</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile('backgroundMusic')}
                                                    className="relative z-10 rounded-full border border-red-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-red-500 hover:bg-red-50"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex min-h-[78px] flex-col items-center justify-center text-center">
                                                <Upload className="mb-2 h-7 w-7 text-primary/45" />
                                                <p className="text-sm font-semibold text-text-secondary">Upload MP3, M4A, WAV, or OGG</p>
                                                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary/70">Max 15MB</p>
                                            </div>
                                        )}
                                        <input type="file" accept="audio/*" onChange={(e) => handleFileChange(e, 'backgroundMusic')} className="absolute inset-0 cursor-pointer opacity-0" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Song Title</label>
                                        <input
                                            name="backgroundMusicTitle"
                                            value={formData.backgroundMusicTitle}
                                            onChange={handleChange}
                                            placeholder="Our Wedding Song"
                                            className="w-full rounded-xl border border-border bg-neutral px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:bg-white"
                                        />
                                    </div>

                                    <label className="flex min-h-[52px] cursor-pointer items-center justify-between gap-4 rounded-2xl border border-border bg-neutral/60 px-4 py-3">
                                        <span>
                                            <span className="block text-xs font-bold uppercase tracking-widest text-foreground">Play on page</span>
                                            <span className="mt-1 block text-[10px] leading-4 text-text-secondary">Starts after the guest taps or interacts.</span>
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={Boolean(formData.backgroundMusicEnabled)}
                                            disabled={!mediaFiles.backgroundMusic && !previews.backgroundMusic}
                                            onChange={(event) => setFormData((prev: any) => ({ ...prev, backgroundMusicEnabled: event.target.checked }))}
                                            className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>


                        <div className="p-8 bg-black/5 rounded-[2.5rem] border-2 border-primary/10 space-y-6 mb-8 hover:bg-primary/5 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary shadow-lg shadow-primary/20 rounded-full flex items-center justify-center">
                                    <Camera className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-serif font-bold text-foreground">Invitation Photos / Screenshots</h3>
                                    <p className="text-[10px] uppercase tracking-widest text-text-secondary font-black opacity-50">Upload 1 or more pages of your invitation</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {previews.invitationImages.map((src: string, index: number) => (
                                    <div key={index} className="relative h-40 rounded-2xl border-2 border-border bg-white flex items-center justify-center overflow-hidden group hover:shadow-lg transition-all">
                                        <img src={src} className="w-full h-full object-contain p-2" />
                                        <button 
                                            type="button" 
                                            onClick={() => removeFile('invitationImages', index)} 
                                            className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[8px] px-2 py-0.5 rounded-full font-bold">
                                            Page {index + 1}
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="relative h-40 rounded-2xl border-2 border-dashed border-primary/20 bg-white flex flex-col items-center justify-center overflow-hidden hover:border-primary transition-all group hover:bg-primary/5 cursor-pointer">
                                    <Plus className="w-8 h-8 text-primary/30 mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest text-center px-4">Add {previews.invitationImages.length > 0 ? 'Another Page' : 'Invitation Card'}</span>
                                    <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'invitationImages')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            </div>
                        </div>



                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Gallery</label>
                                {!isPremium && (
                                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{mediaFiles.galleryImages.length}/12 Free Photos</span>
                                )}
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                                {previews.galleryImages.map((src: string, i: number) => (
                                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-border">
                                        <img src={src} className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeFile('galleryImages', i)} className="absolute top-1 right-1 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                <div className="relative aspect-square rounded-xl border-2 border-dashed border-border bg-neutral flex items-center justify-center hover:bg-neutral/80 transition-colors">
                                    <ImageIcon className="w-6 h-6 text-primary/40" />
                                    <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'galleryImages')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 rounded-[2rem] border border-border bg-white/70 p-4 shadow-sm sm:p-5">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Gallery Preview Style</p>
                                <p className="mt-1 text-sm leading-6 text-text-secondary">
                                    Choose how uploaded photos appear on the wedding page. Auto keeps each template&apos;s default.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                                {GALLERY_LAYOUTS.map((layout) => (
                                    <button
                                        key={layout.id}
                                        type="button"
                                        onClick={() => setFormData((prev: any) => ({ ...prev, galleryLayout: layout.id }))}
                                        className={`rounded-2xl border p-3 text-left transition-all ${
                                            formData.galleryLayout === layout.id
                                                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                                : 'border-border bg-neutral/50 hover:border-primary/35 hover:bg-white'
                                        }`}
                                    >
                                        <div className={`mb-3 grid h-20 grid-cols-2 gap-1 overflow-hidden rounded-xl border border-white/70 bg-white p-1 ${
                                            layout.id === 'horizontal' ? 'grid-cols-3' : ''
                                        }`}>
                                            {layout.cells.map((cell, index) => (
                                                <span
                                                    key={`${layout.id}-${index}`}
                                                    className={`rounded-md bg-primary/20 ${cell} ${layout.id === 'vertical' ? 'min-h-[1.1rem]' : ''}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-foreground">{layout.name}</span>
                                        <span className="mt-1 block text-[10px] leading-4 text-text-secondary">{layout.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-border">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Spotify Playlist URL (Optional)</label>
                            <div className="relative">
                                <Music className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none" />
                                <input name="spotifyUrl" value={formData.spotifyUrl} onChange={handleChange} placeholder="https://open.spotify.com/playlist/..." className="icon-field-left w-full pl-14 pr-4 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none min-h-[44px]" />
                            </div>
                            <p className="text-[10px] text-text-secondary ml-1">Embed a Spotify playlist for your guests to enjoy.</p>
                        </div>
                    </div >
                );
            case 5: {
    const attireGroups = [
        {
            id: 'sponsors',
            label: 'Principal Sponsors',
            description: 'Set the formal attire guidance and color reserved for principal sponsors.',
            attireField: 'sponsorDressCode',
            colorField: 'sponsorDressCodeColor',
            variant: 'sponsors' as const,
        },
        {
            id: 'guests',
            label: 'Wedding Guests',
            description: 'Set a separate attire instruction and color for all other guests.',
            attireField: 'dressCode',
            colorField: 'dressCodeColor',
            variant: 'guests' as const,
        },
    ] as const;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-4">
                <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Dress Code</h2>
                <p className="text-text-secondary">Create separate attire guidance for principal sponsors and wedding guests.</p>
            </div>

            <div className="space-y-6 rounded-2xl border border-border bg-white/70 p-2 shadow-sm sm:rounded-[2rem] sm:p-6">
                {attireGroups.map((group) => {
                    const attireValue = formData[group.attireField];
                    const colorValue = formData[group.colorField];

                    return (
                        <section key={group.id} className="overflow-hidden rounded-xl border border-border bg-white p-2.5 sm:rounded-[1.75rem] sm:p-5">
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">{group.label}</p>
                                    <p className="mt-2 text-sm leading-6 text-text-secondary">{group.description}</p>
                                </div>
                                <span className="h-11 w-11 shrink-0 rounded-2xl border-2 border-white shadow-lg" style={{ backgroundColor: colorValue }} />
                            </div>

                            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
                                <div className="space-y-5 rounded-xl bg-neutral/45 p-3 sm:rounded-2xl sm:p-4">
                                    <div className="space-y-2">
                                        <label htmlFor={`${group.id}-attire`} className="ml-1 text-xs font-bold uppercase tracking-widest text-text-secondary">Attire Type</label>
                                        <input
                                            id={`${group.id}-attire`}
                                            name={group.attireField}
                                            value={attireValue}
                                            onChange={handleChange}
                                            placeholder={group.id === 'sponsors' ? 'e.g. Black Tie, Barong and Formal Gown' : 'e.g. Formal, Cocktail, Garden Formal'}
                                            className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none transition-all focus:border-primary"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="ml-1 text-xs font-bold uppercase tracking-widest text-text-secondary">Attire Color Theme</label>
                                        <div className="grid grid-cols-6 gap-2">
                                            {ATTIRE_COLOR_OPTIONS.map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setFormData((previous: any) => ({ ...previous, [group.colorField]: color }))}
                                                    className={`relative h-9 rounded-xl border-2 transition-all ${colorValue === color ? 'scale-105 border-white ring-2 ring-primary shadow-lg' : 'border-border/60 shadow-sm hover:border-primary/50'}`}
                                                    style={{ backgroundColor: color }}
                                                    aria-label={`Select ${group.label.toLowerCase()} attire color ${color}`}
                                                >
                                                    {colorValue === color && <CheckCircle2 className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                name={group.colorField}
                                                value={colorValue}
                                                onChange={handleChange}
                                                className="h-11 w-11 cursor-pointer rounded-2xl border border-border bg-transparent p-0"
                                                aria-label={`Pick a custom ${group.label.toLowerCase()} attire color`}
                                            />
                                            <input
                                                type="text"
                                                name={group.colorField}
                                                value={colorValue}
                                                onChange={handleChange}
                                                placeholder="#HEX"
                                                className="min-h-[44px] min-w-0 flex-1 rounded-xl border border-border bg-white px-4 py-3 font-mono text-sm outline-none transition-all focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className="relative flex min-h-[240px] flex-col justify-between overflow-hidden rounded-xl border border-border bg-neutral p-3 sm:min-h-[300px] sm:rounded-2xl sm:p-4"
                                    style={{ boxShadow: `0 20px 55px ${colorValue}18` }}
                                >
                                    <div className="absolute inset-0 opacity-70" style={{ background: `radial-gradient(circle at 50% 30%, ${colorValue}22, transparent 48%)` }} />
                                    <div className="relative">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-secondary/60">Live preview · {group.label}</p>
                                        <p className="mt-1 font-serif text-xl font-bold text-foreground">{attireValue || 'Formal Attire'}</p>
                                    </div>
                                    <div className="relative flex flex-1 items-center justify-center py-2">
                                        <AttireIllustration color={colorValue} variant={group.variant} className="max-w-[300px]" />
                                    </div>
                                </div>
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
            }
            case 6:
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
                <h3 className="flex items-center gap-2 text-xl font-serif font-bold text-foreground sm:text-2xl">
                    <Heart className="h-5 w-5 text-primary" /> Gift Options
                </h3>
                <p className="mt-1 text-sm leading-6 text-text-secondary">
                    Keep gift details tidy for guests, whether they prefer direct transfers, registries, or cash funds.
                </p>
            </div>

            {/* Basic Bank Details */}
            <div className="rounded-[2rem] border border-border bg-white/75 p-4 shadow-sm sm:p-6">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-foreground">Direct Transfer</h4>
                        <p className="mt-1 text-xs leading-5 text-text-secondary">Bank, wallet, or QR code details guests can use directly.</p>
                    </div>
                    <span className="inline-flex w-fit rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                        Optional
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2 col-span-1">
                        <label className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-text-secondary ml-1 truncate">Bank Name</label>
                        <input name="giftBank" value={formData.giftBank} onChange={handleChange} placeholder="GCash, BDO..." className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-border bg-neutral focus:border-primary outline-none transition-all text-[13px] sm:text-base min-h-[44px]" />
                    </div>
                    <div className="space-y-2 col-span-1">
                        <label className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-text-secondary ml-1 truncate">Account #</label>
                        <input name="giftAccountNumber" value={formData.giftAccountNumber} onChange={handleChange} placeholder="0917..." className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-border bg-neutral focus:border-primary outline-none transition-all text-[13px] sm:text-base min-h-[44px]" />
                    </div>
                    <div className="space-y-2 col-span-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Account Name</label>
                        <input name="giftAccountName" value={formData.giftAccountName} onChange={handleChange} placeholder="Account holder name" className="w-full px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-border bg-neutral focus:border-primary outline-none transition-all text-base min-h-[44px]" />
                    </div>
                </div>
                <div className="mt-5 space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Upload QR Code (Optional)</label>
                    <div className="relative flex min-h-[156px] items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-primary/20 bg-neutral transition-colors hover:bg-primary/5">
                        {previews.giftQr ? (
                            <img src={previews.giftQr} className="h-full max-h-[150px] w-full object-contain p-3" />
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-center">
                                <ImageIcon className="h-7 w-7 text-primary/40" />
                                <span className="px-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Upload QR code</span>
                            </div>
                        )}
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'giftQr')} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                </div>
            </div>

            {/* Registry Links */}
            <div className="space-y-4 rounded-[2rem] border border-border bg-white/75 p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-foreground">Registry Links</h4>
                        <p className="mt-1 text-xs leading-5 text-text-secondary">Add store registries or wishlists with clean guest-facing labels.</p>
                    </div>
                    <button type="button" onClick={() => handleArrayAdd('registryLinks', { title: 'Amazon Registry', url: '' })} className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-white sm:w-auto">
                        <Plus className="w-3 h-3" /> Add Registry
                    </button>
                </div>
                {formData.registryLinks?.map((link: any, i: number) => (
                    <div key={i} className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-neutral/40 p-3 sm:grid-cols-[minmax(150px,0.45fr)_minmax(0,1fr)_44px] sm:items-center">
                        <input placeholder="Store name" value={link.title} onChange={(e) => handleArrayChange('registryLinks', i, 'title', e.target.value)} className="min-h-[44px] w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none transition-all focus:border-primary" />
                        <div className="relative min-w-0">
                            <LinkIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary/50 pointer-events-none" />
                            <input placeholder="https://..." value={link.url} onChange={(e) => handleArrayChange('registryLinks', i, 'url', e.target.value)} className="icon-field-left min-h-[44px] w-full rounded-xl border border-border bg-white py-2 pl-12 pr-3 text-sm outline-none transition-all focus:border-primary" />
                        </div>
                        <button type="button" onClick={() => handleArrayRemove('registryLinks', i)} className="flex min-h-[44px] w-full items-center justify-center rounded-xl text-red-500 transition-colors hover:bg-red-50 sm:w-11" title="Remove registry link"><Trash2 className="w-4 h-4" /></button>
                    </div>
                ))}
            </div>

            {/* Cash Funds */}
            <div className="space-y-4 rounded-[2rem] border border-border bg-white/75 p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-foreground">Cash Funds</h4>
                        <p className="mt-1 text-xs leading-5 text-text-secondary">Create funds for honeymoon, home, or other shared goals.</p>
                    </div>
                    <button type="button" onClick={() => handleArrayAdd('cashFunds', { title: 'Honeymoon Fund', description: 'Help us travel to Bali!', targetAmount: 5000, currency: '$' })} className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-white sm:w-auto">
                        <Plus className="w-3 h-3" /> Add Fund
                    </button>
                </div>
                {formData.cashFunds?.map((fund: any, i: number) => (
                    <div key={i} className="rounded-2xl border border-border bg-neutral/40 p-3 sm:p-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_44px]">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <input placeholder="Fund title" value={fund.title} onChange={(e) => handleArrayChange('cashFunds', i, 'title', e.target.value)} className="min-h-[44px] w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none transition-all focus:border-primary" />
                                <input placeholder="Short description" value={fund.description} onChange={(e) => handleArrayChange('cashFunds', i, 'description', e.target.value)} className="min-h-[44px] w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none transition-all focus:border-primary" />
                                <div className="grid grid-cols-1 gap-3 md:col-span-2 sm:grid-cols-[minmax(0,1fr)_minmax(120px,0.35fr)]">
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary/50 pointer-events-none" />
                                        <input 
                                            type="number" 
                                            inputMode="decimal"
                                            placeholder="0" 
                                            value={fund.targetAmount} 
                                            onChange={(e) => handleArrayChange('cashFunds', i, 'targetAmount', e.target.value)} 
                                            className="icon-field-left min-h-[44px] w-full rounded-xl border border-border bg-white py-2 pl-12 pr-3 text-sm tabular-nums outline-none transition-all focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                    <input placeholder="Currency" value={fund.currency} onChange={(e) => handleArrayChange('cashFunds', i, 'currency', e.target.value)} className="min-h-[44px] w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none transition-all focus:border-primary" />
                                </div>
                            </div>
                            <button type="button" onClick={() => handleArrayRemove('cashFunds', i)} className="flex min-h-[44px] w-full items-center justify-center rounded-xl text-red-500 transition-colors hover:bg-red-50 sm:w-11" title="Remove cash fund"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Payment Links */}
            <div className="space-y-4 rounded-[2rem] border border-border bg-white/75 p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-foreground">Payment Links</h4>
                        <p className="mt-1 text-xs leading-5 text-text-secondary">Add PayPal, Venmo, GCash, Maya, or other direct links.</p>
                    </div>
                    <button type="button" onClick={() => handleArrayAdd('paymentLinks', { title: 'PayPal', url: '' })} className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-white sm:w-auto">
                        <Plus className="w-3 h-3" /> Add Link
                    </button>
                </div>
                {formData.paymentLinks?.map((link: any, i: number) => (
                    <div key={i} className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-neutral/40 p-3 sm:grid-cols-[minmax(150px,0.45fr)_minmax(0,1fr)_44px] sm:items-center">
                        <input placeholder="Service name" value={link.title} onChange={(e) => handleArrayChange('paymentLinks', i, 'title', e.target.value)} className="min-h-[44px] w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none transition-all focus:border-primary" />
                        <div className="relative min-w-0">
                            <LinkIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary/50 pointer-events-none" />
                            <input placeholder="https://..." value={link.url} onChange={(e) => handleArrayChange('paymentLinks', i, 'url', e.target.value)} className="icon-field-left min-h-[44px] w-full rounded-xl border border-border bg-white py-2 pl-12 pr-3 text-sm outline-none transition-all focus:border-primary" />
                        </div>
                        <button type="button" onClick={() => handleArrayRemove('paymentLinks', i)} className="flex min-h-[44px] w-full items-center justify-center rounded-xl text-red-500 transition-colors hover:bg-red-50 sm:w-11" title="Remove payment link"><Trash2 className="w-4 h-4" /></button>
                    </div>
                ))}
            </div>
        </div>
    );
            case 7:
    return (
        <div className="space-y-8">
            <div className="p-6 rounded-2xl border border-border bg-neutral/30 space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h4 className="text-sm font-bold text-foreground">Post-Wedding Mode</h4>
                        <p className="text-[10px] text-text-secondary">Switch your site to a &quot;Thank You&quot; page after the wedding.</p>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={formData.isThankYouMode}
                        aria-label="Toggle post-wedding mode"
                        onClick={() => setFormData((prev: any) => ({ ...prev, isThankYouMode: !prev.isThankYouMode }))}
                        className={`grid h-9 w-[78px] shrink-0 grid-cols-2 rounded-lg border p-0.5 text-[9px] font-black uppercase tracking-widest transition-colors focus:outline-none focus:ring-4 focus:ring-primary/15 ${
                            formData.isThankYouMode ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border bg-white text-text-secondary'
                        }`}
                    >
                        <span className={`flex items-center justify-center rounded-md transition ${!formData.isThankYouMode ? 'bg-neutral text-foreground shadow-sm' : ''}`}>Off</span>
                        <span className={`flex items-center justify-center rounded-md transition ${formData.isThankYouMode ? 'bg-primary text-white shadow-sm' : ''}`}>On</span>
                    </button>
                </div>

                {formData.isThankYouMode && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4 border-t border-border">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Thank You Message</label>
                            <textarea name="thankYouMessage" value={formData.thankYouMessage} onChange={handleChange} placeholder="Thank you so much for celebrating with us..." className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary outline-none h-24 resize-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Photo Album Link</label>
                            <input name="photoAlbumLink" value={formData.photoAlbumLink} onChange={handleChange} placeholder="https://photos.google.com/..." className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary outline-none" />
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="space-y-6 pt-4 border-t border-border">
                <h4 className="text-sm font-bold text-foreground mx-1">RSVP Settings</h4>
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">RSVP Deadline</label>
                    <input required type="date" name="rsvpDeadline" value={formData.rsvpDeadline} onChange={handleChange} className="icon-field-right w-full pl-4 pr-12 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none" />
                </div>

                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Contact Person</label>
                    <input name="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder="Name" className="w-full px-4 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none" />
                </div>
            </div>
        </div>
    );
            case 8:
    return (
        <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-primary/15 bg-gradient-to-br from-primary/10 via-white to-neutral p-5 sm:p-6">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                        <Clock className="h-6 w-6 stroke-[1.6]" />
                    </div>
                    <div>
                        <h3 className="font-serif text-2xl font-bold text-foreground">Wedding Timeline</h3>
                        <p className="mt-2 text-sm leading-6 text-text-secondary">
                            Add one event per line. Guests will see this as an alternating vertical infographic with monoline icons.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Event Flow</label>
                    <button
                        type="button"
                        onClick={() => setFormData((prev: any) => ({
                            ...prev,
                            programTimeline: prev.programTimeline || '2:00 PM - Guest Arrival\n3:00 PM - Ceremony\n4:00 PM - Cocktail Hour\n6:00 PM - Dinner & Toasts\n8:00 PM - First Dance\n9:00 PM - Party & Send-off',
                        }))}
                        className="rounded-full border border-primary/20 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary hover:bg-primary hover:text-white"
                    >
                        Use Sample
                    </button>
                </div>
                <AutoResizeTextarea
                    name="programTimeline"
                    value={formData.programTimeline}
                    onChange={handleChange}
                    placeholder={'2:00 PM - Guest Arrival\n3:00 PM - Ceremony\n4:00 PM - Cocktail Hour\n6:00 PM - Dinner & Toasts\n8:00 PM - First Dance'}
                    className="min-h-[260px] w-full resize-none rounded-2xl border border-border bg-neutral px-4 py-4 font-mono text-sm leading-7 outline-none transition-all focus:border-primary focus:bg-white"
                />
                <p className="text-[10px] leading-relaxed text-text-secondary ml-1">
                    Recommended format: time, dash, event name. The landing page also shows guest reminders below the timeline: Be on Time, Finish the Event, Enjoy and Have Fun.
                </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                {['Thin line icons', 'Alternating layout', 'Guest reminders'].map((item) => (
                    <div key={item} className="rounded-2xl border border-border bg-white p-4 text-center shadow-sm">
                        <Sparkles className="mx-auto mb-3 h-5 w-5 text-primary" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">{item}</p>
                    </div>
                ))}
            </div>
        </div>
    );
            case 9:
    return (
        <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-primary/15 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <HelpCircle className="h-6 w-6 stroke-[1.6]" />
                    </div>
                    <div>
                        <h3 className="font-serif text-2xl font-bold text-foreground">Optional FAQs</h3>
                        <p className="mt-2 text-sm leading-6 text-text-secondary">
                            Recommended style: a clean two-column accordion with soft cards, question icons, and airy spacing. It only appears on the landing page when you add completed questions and answers.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-bold text-foreground">Guest Questions</h4>
                <button
                    type="button"
                    onClick={() => handleArrayAdd('faqItems', { question: '', answer: '' })}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/20"
                >
                    <Plus className="h-4 w-4" /> Add FAQ
                </button>
            </div>

            {formData.faqItems?.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border bg-neutral/50 p-8 text-center">
                    <p className="font-serif text-lg italic text-text-secondary">No FAQs yet. Leave this empty to hide the FAQ section.</p>
                    <button
                        type="button"
                        onClick={() => setFormData((prev: any) => ({
                            ...prev,
                            faqItems: [
                                { question: 'What time should guests arrive?', answer: 'Please arrive 20 to 30 minutes before the ceremony so everyone can be seated comfortably.' },
                                { question: 'Is there parking at the venue?', answer: 'Yes, parking is available at the venue. Follow the signs near the main entrance.' },
                                { question: 'Can we bring children?', answer: 'Please check your invitation details or contact our RSVP person for guest-specific arrangements.' },
                            ],
                        }))}
                        className="mt-5 rounded-full border border-primary/20 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary hover:bg-primary hover:text-white"
                    >
                        Add Suggested FAQs
                    </button>
                </div>
            )}

            <div className="space-y-3">
                {formData.faqItems?.map((item: any, i: number) => (
                    <div key={i} className="rounded-2xl border border-border bg-neutral/40 p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Question {i + 1}</span>
                            <button type="button" onClick={() => handleArrayRemove('faqItems', i)} className="flex h-9 w-9 items-center justify-center rounded-xl text-red-500 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <input
                                placeholder="Question"
                                value={item.question}
                                onChange={(e) => handleArrayChange('faqItems', i, 'question', e.target.value)}
                                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary"
                            />
                            <AutoResizeTextarea
                                placeholder="Answer"
                                value={item.answer}
                                onChange={(e) => handleArrayChange('faqItems', i, 'answer', e.target.value)}
                                className="min-h-[112px] w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-sm leading-6 outline-none transition-all focus:border-primary"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
            default:
    return null;
}
    };

    const monogramFilename = `${(formData.brideName || 'wedding').trim().replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${(formData.groomName || 'monogram').trim().replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-monogram`;

    const handleMonogramExport = async (format: 'png' | 'jpg' | 'mp4') => {
        if (!hasMonogramPro) {
            alert('PNG, JPG, and MP4 monogram downloads are available with Account Pro.');
            return;
        }
        if (!monogramExportRef.current) {
            alert('Your monogram preview is still loading. Please try again in a moment.');
            return;
        }
        if (monogramExporting) return;
        setMonogramExporting(format);
        try {
            if (format === 'png' || format === 'jpg') {
                await downloadMonogramImage(monogramExportRef.current, format, monogramFilename);
            } else {
                const { data } = await getCachedSession();
                const token = data.session?.access_token;
                if (!token) throw new Error('Please sign in again to export an MP4.');
                const video = await createMonogramWebm(monogramExportRef.current, formData.logoAnimation);
                await requestMonogramMp4(video, token, monogramFilename);
            }
        } catch (error) {
            alert(getErrorMessage(error));
        } finally {
            setMonogramExporting(null);
        }
    };

if (editId && loadedEditId !== editId) {
    return (
        <div className="mx-auto flex min-h-[520px] w-full max-w-6xl items-center justify-center px-6">
            <div className="text-center">
                <Heart className="mx-auto h-9 w-9 animate-pulse text-primary" />
                <p className="mt-4 font-serif text-xl text-foreground">Loading your wedding design…</p>
                <p className="mt-1 text-sm text-text-secondary">Your saved details will be ready in a moment.</p>
            </div>
        </div>
    );
}

return (
    <>
        <AnimatePresence>
            {isGenerating && <GenerationLoading />}
        </AnimatePresence>

        <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
            <div className="qw-builder w-full lg:w-3/5 bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-8 soft-shadow border border-primary/10 flex-shrink-0">
                {/* Mobile Stepper Header */}
                <div className="lg:hidden mb-6">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/60">Step {currentStep + 1} of {STEPS.length}</p>
                            <h2 className="text-xl font-serif font-bold text-foreground">{STEPS[currentStep].title}</h2>
                        </div>
                        <div className="flex gap-1">
                            {STEPS.map((_, idx) => (
                                <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === currentStep ? 'bg-primary w-4' : idx < currentStep ? 'bg-secondary' : 'bg-neutral border border-border'} transition-all duration-300`} />
                            ))}
                        </div>
                    </div>
                    <div className="w-full h-1 bg-neutral rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-primary" 
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                            transition={{ duration: 0.5, ease: "circOut" }}
                        />
                    </div>
                </div>

                {/* Desktop Stepper */}
                <div className="hidden lg:flex justify-between items-start mb-12 gap-2">
                    {STEPS.map((step, idx) => (
                        <div key={step.id} className="flex flex-col items-center relative flex-1 min-w-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 flex-shrink-0 transition-all duration-500 ${idx === currentStep ? 'bg-primary text-white scale-110 shadow-[0_0_20px_rgba(192,128,129,0.3)]' : idx < currentStep ? 'bg-secondary text-foreground' : 'bg-neutral text-text-secondary border border-border'}`}>
                                {idx < currentStep ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                            </div>
                            <span className={`text-[9px] uppercase tracking-widest mt-3 font-bold text-center leading-tight transition-colors duration-500 whitespace-nowrap ${idx === currentStep ? 'text-primary' : 'text-text-secondary'}`}>{step.title}</span>
                            {idx < STEPS.length - 1 && <div className={`absolute top-5 left-[60%] w-[80%] h-[2px] -z-0 ${idx < currentStep ? 'bg-secondary' : 'bg-border'}`} />}
                        </div>
                    ))}
                </div>


                {/* Undo/Redo Controls */}
                <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={undo}
                            disabled={!canUndo}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-text-secondary hover:text-primary hover:bg-neutral disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Undo (Ctrl+Z)"
                        >
                            <Undo2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Undo</span>
                        </button>
                        <button
                            type="button"
                            onClick={redo}
                            disabled={!canRedo}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-text-secondary hover:text-primary hover:bg-neutral disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
                        >
                            <Redo2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Redo</span>
                        </button>
                    </div>
                    <div className="text-[10px] text-text-secondary/50">
                        {canUndo && <span>Press Ctrl+Z to undo</span>}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                    {freeWebsiteLimitReached && (
                        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Account Pro required</p>
                                    <p className="mt-1 text-sm font-semibold text-foreground">
                                        Free accounts include 3 active wedding websites. Unlock Account Pro to create more.
                                    </p>
                                </div>
                                <UpgradeButton
                                    scope="account"
                                    plan="account_pro"
                                    label="Unlock Account Pro"
                                    className="w-full justify-center text-sm sm:w-auto"
                                />
                            </div>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="min-h-[300px]">
                            {renderStep()}
                        </motion.div>
                    </AnimatePresence>

                    {currentStep === STEPS.length - 1 && (
                        <PublishHealthPanel health={publishHealth} onGoToStep={setCurrentStep} />
                    )}

                    {currentStep === 1 && (
                        <MarketplacePanel
                            presets={savedPresets}
                            onApplyPreset={applyPreset}
                            onDeletePreset={handleDeletePreset}
                            onSaveCurrent={handleSaveCurrentPreset}
                            onApplyBlock={applySectionBlock}
                        />
                    )}

                    <div className="sticky bottom-0 sm:relative bg-white/90 backdrop-blur-md sm:bg-transparent -mx-4 sm:mx-0 px-4 py-4 sm:p-0 border-t sm:border-t-0 border-border z-20 flex justify-between items-center pt-6 sm:pt-8 gap-2 sm:gap-4">
                        <button type="button" onClick={prevStep} className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2 rounded-lg sm:rounded-xl text-primary font-bold text-sm sm:text-base min-h-[44px] min-w-[44px] ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'hover:bg-neutral transition-colors'}`}>
                            <ArrowLeft className="w-4 h-4 flex-shrink-0" /> <span className="hidden sm:inline">Back</span>
                        </button>
                        <button type="submit" disabled={isSubmitting} className="bg-primary text-white px-6 sm:px-10 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold flex items-center gap-2 hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:opacity-50 text-sm sm:text-base min-h-[44px] transition-all flex-1 sm:flex-none justify-center sm:justify-start">
                            {isSubmitting ? 'Processing...' : currentStep === STEPS.length - 1 ? <><span className="hidden sm:inline">{editId ? 'Update Invitation' : 'Create Invitation'}</span><span className="sm:hidden">Finish</span> <Send className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" /></> : <>Next <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" /></>}
                        </button>
                    </div>
                </form>
            </div>

            {/* Desktop Preview */}
            {isDesktopPreview && (
                <div className="hidden lg:block w-full lg:w-2/5 sticky top-8">
                    <LivePreview formData={formData} previews={previews} hasMonogramPro={hasMonogramPro} />
                </div>
            )}

            {/* Mobile Preview Toggle & Modal */}
            <div className="lg:hidden">
                <button
                    type="button"
                    aria-label="Open mobile preview"
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="fixed bottom-24 right-6 w-14 h-14 bg-white text-primary rounded-full shadow-2xl flex items-center justify-center z-50 border border-primary/20 animate-bounce-slow"
                >
                    <Smartphone className="w-6 h-6" />
                </button>

                <AnimatePresence>
                    {isPreviewModalOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: '100%' }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: '100%' }}
                            className="fixed inset-0 z-[100] bg-white flex flex-col"
                        >
                            <div className="p-4 border-b border-border flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
                                <div>
                                    <h3 className="font-bold text-foreground">Mobile Preview</h3>
                                    <p className="text-[10px] uppercase tracking-widest text-text-secondary">Live View</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsPreviewModalOpen(false)}
                                    className="w-10 h-10 rounded-full bg-neutral flex items-center justify-center text-text-secondary"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto bg-neutral p-4 no-scrollbar">
                                <div className="max-w-sm mx-auto">
                                    <LivePreview formData={formData} previews={previews} isMobileView hasMonogramPro={hasMonogramPro} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    </>
);
}
