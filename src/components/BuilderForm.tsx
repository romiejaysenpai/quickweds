'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, MapPin, Palette, CheckCircle2, ArrowRight, ArrowLeft, Send, Camera, Image as ImageIcon, Video, X, Layout, Sparkles, Plus, Trash2, Link as LinkIcon, DollarSign, Music, Shirt, Undo2, Redo2, ChevronDown, Eye, Smartphone, Clock, HelpCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import VectorArtGuests from './VectorArtGuests';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import GenerationLoading from './GenerationLoading';
import { useAuth } from '@/context/AuthContext';
import UpgradeButton from './UpgradeButton';
import LivePreview from './LivePreview';
import MarketplacePanel from './builder/MarketplacePanel';
import { MONOGRAM_SHAPES, MonogramMark } from './MonogramMark';
import DecorativeLayer from './DecorativeLayer';
import { useLocalUndoRedo } from '@/components/UndoRedoProvider';
import { hasAccountPro } from '@/lib/account';
import { FREE_TEMPLATE_IDS, TEMPLATES } from '@/lib/template-catalog';
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

// Helper component for collapsible sections
const Collapsible = ({ title, children, isOpen, onToggle, icon: Icon }: { title: string, children: React.ReactNode, isOpen: boolean, onToggle: () => void, icon?: any }) => (
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

function AutoResizeTextarea({
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
    motifColor: '#C08081',
    fontStyle: 'Elegant',
    backgroundStyle: 'gradient',
    template: 'classic',
    dressCode: '',
    dressCodeColor: '#000000',
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
    spotifyUrl: '',
    weddingParty: [] as any[],
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

export default function BuilderForm() {
    const router = useRouter();
    const { user, isAdmin, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const editId = searchParams?.get('edit');
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [weddingOwnerId, setWeddingOwnerId] = useState<string | null>(null);
    const [existingPublicSlug, setExistingPublicSlug] = useState<string>('');
    
    // Mobile UI state
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

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
    } = useLocalUndoRedo(INITIAL_FORM_DATA, 50);

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
        giftQr: File | null;
        invitationImages: File[];
        galleryImages: File[];
    }>({
        heroImage: null,
        couplePhoto: null,
        teaserVideo: null,
        giftQr: null,
        invitationImages: [],
        galleryImages: [],
    });

    const [previews, setPreviews] = useState<{
        heroImage: string;
        couplePhoto: string;
        teaserVideo: string;
        giftQr: string;
        invitationImages: string[];
        galleryImages: string[];
    }>({
        heroImage: '',
        couplePhoto: '',
        teaserVideo: '',
        giftQr: '',
        invitationImages: [],
        galleryImages: [],
    });

    const [isPremium, setIsPremium] = useState(true);
    const [savedPresets, setSavedPresets] = useState<WeddingTemplatePreset[]>([]);
    const [accountIsPro, setAccountIsPro] = useState(false);
    const [activeWeddingCount, setActiveWeddingCount] = useState(0);
    const freeWebsiteLimitReached = !editId && !isAdmin && !accountIsPro && activeWeddingCount >= 3;

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
            router.push('/login');
        }

        setIsPremium(true);

        // BUG #12 FIX: Restore pending wedding data from sessionStorage after login redirect
        if (user && !editId && typeof window !== 'undefined') {
            const pendingData = window.sessionStorage.getItem('pending_wedding_data');
            if (pendingData) {
                try {
                    const restored = JSON.parse(pendingData);
                    setFormData({ ...INITIAL_FORM_DATA, ...restored });
                    window.sessionStorage.removeItem('pending_wedding_data');
                    console.log('✅ Restored pending wedding form data from session');
                } catch (e) {
                    console.warn('Could not restore pending wedding data:', e);
                    window.sessionStorage.removeItem('pending_wedding_data');
                }
            }
        }

        if (user && editId) {
            const fetchWedding = async () => {
                const { data: sessionData } = await supabase.auth.getSession();
                const token = sessionData.session?.access_token;
                if (!token) return;

                const response = await fetch(`/api/planner/load?weddingId=${encodeURIComponent(editId)}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const result = await response.json().catch(() => ({}));
                const data = result.wedding;

                if (data && (result.accessRole === 'owner' || result.accessRole === 'partner')) {
                    // Builder features are included on the free plan. Paid status now unlocks Planner Pro.
                    setIsPremium(true);
                    setWeddingOwnerId(data.user_id || user.id);
                    setExistingPublicSlug(typeof data.public_slug === 'string' ? data.public_slug : '');

                    setFormData({
                        brideName: data.bride_name || '',
                        groomName: data.groom_name || '',
                        weddingDate: data.wedding_date || '',
                        weddingTime: data.wedding_time || '',
                        venueName: data.venue_name || '',
                        venueAddress: data.venue_address || '',
                        mapsLink: data.maps_link || '',
                        motifColor: data.motif_color || '#C08081',
                        fontStyle: data.font_style || 'Elegant',
                        backgroundStyle: data.background_style || 'gradient',
                        template: data.template || 'classic',
                        dressCode: data.dress_code ? data.dress_code.split('||')[0] : '',
                        dressCodeColor: data.dress_code && data.dress_code.includes('||') ? data.dress_code.split('||')[1] : (data.motif_color || '#000000'),
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
                        spotifyUrl: data.spotify_playlist_url || '',
                        weddingParty: data.wedding_party || [],
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
                    } catch (e) {
                        if (data.invitation_image) inviteImages = [data.invitation_image];
                    }

                    setPreviews({
                        heroImage: data.hero_image || '',
                        couplePhoto: data.couple_photo || '',
                        teaserVideo: (data as any).teaser_video || '',
                        giftQr: data.gift_qr_image || '',
                        invitationImages: inviteImages,
                        galleryImages: data.gallery_images || [],
                    });
                }
            };
            fetchWedding();
        }
    }, [user, authLoading, router, editId]);

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
        setFormData((prev: any) => ({ ...prev, [field]: [...(prev[field] || []), item] }));
    };
    const handleArrayRemove = (field: string, index: number) => {
        setFormData((prev: any) => ({ ...prev, [field]: (prev[field] || []).filter((_: any, i: number) => i !== index) }));
    };
    const handleArrayChange = (field: string, index: number, key: string, value: string) => {
        setFormData((prev: any) => {
            const newArr = [...(prev[field] || [])];
            newArr[index] = { ...newArr[index], [key]: value };
            return { ...prev, [field]: newArr };
        });
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (field === 'galleryImages') {
            const newFiles = Array.from(files);
            if (!isPremium && (mediaFiles.galleryImages.length + newFiles.length) > 12) {
                alert("Free plan is limited to 12 photos. Please upgrade to Premium for unlimited gallery uploads.");
                return;
            }
            setMediaFiles(prev => ({ ...prev, galleryImages: [...prev.galleryImages, ...newFiles] }));
            newFiles.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews(prev => ({ ...prev, galleryImages: [...prev.galleryImages, reader.result as string] }));
                };
                reader.readAsDataURL(file);
            });
        } else if (field === 'invitationImages') {
            const newFiles = Array.from(files);
            setMediaFiles(prev => ({ ...prev, invitationImages: [...prev.invitationImages, ...newFiles] }));
            newFiles.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews(prev => ({ ...prev, invitationImages: [...prev.invitationImages, reader.result as string] }));
                };
                reader.readAsDataURL(file);
            });
        } else {
            const file = files[0];
            if (field === 'teaserVideo') {
                const limit = 50 * 1024 * 1024; // 50MB
                if (!isPremium && file.size > limit) {
                    alert("Free plan only supports videos up to 50MB. Please upgrade to Premium to upload larger files.");
                    return;
                }
            }

            setMediaFiles((prev: any) => ({ ...prev, [field]: file }));

            if (field === 'heroImage' || field === 'couplePhoto' || field === 'giftQr' || field === 'teaserVideo' || field === 'invitationImage') {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews((prev: any) => ({ ...prev, [field]: reader.result as string }));
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const removeFile = (field: string, index?: number) => {
        if (field === 'galleryImages' && index !== undefined) {
            setMediaFiles(prev => ({ ...prev, galleryImages: prev.galleryImages.filter((_, i) => i !== index) }));
            setPreviews(prev => ({ ...prev, galleryImages: prev.galleryImages.filter((_, i) => i !== index) }));
        } else if (field === 'invitationImages' && index !== undefined) {
            setMediaFiles(prev => ({ ...prev, invitationImages: prev.invitationImages.filter((_, i) => i !== index) }));
            setPreviews(prev => ({ ...prev, invitationImages: prev.invitationImages.filter((_, i) => i !== index) }));
        } else {
            setMediaFiles(prev => ({ ...prev, [field]: null }));
            setPreviews(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep < STEPS.length - 1) {
            nextStep();
            return;
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
            const uploadToSupabase = async (file: File, folder: string) => {
                const filename = `${folder}-${file.name.replace(/\s+/g, '_')}`;
                const filePath = `${user.id}/${weddingId}/${filename}`;

                const { error: uploadError } = await supabase.storage
                    .from('quickweds')
                    .upload(filePath, file, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('quickweds')
                    .getPublicUrl(filePath);

                return publicUrl;
            };

            // Upload ALL media in parallel including video
            const heroPromise = mediaFiles.heroImage ? uploadToSupabase(mediaFiles.heroImage, 'hero') : Promise.resolve(null);
            const couplePromise = mediaFiles.couplePhoto ? uploadToSupabase(mediaFiles.couplePhoto, 'couple') : Promise.resolve(null);
            const giftQrPromise = mediaFiles.giftQr ? uploadToSupabase(mediaFiles.giftQr, 'gift-qr') : Promise.resolve(null);
            const invitationPromises = mediaFiles.invitationImages.map((file, i) => uploadToSupabase(file, `invitation-${i}`));
            const videoPromise = mediaFiles.teaserVideo ? uploadToSupabase(mediaFiles.teaserVideo, 'teaser') : Promise.resolve(null);
            const galleryPromises = mediaFiles.galleryImages.map((file, i) => uploadToSupabase(file, `gallery-${i}`));

            const [heroUrl, coupleUrl, giftQrUrl, invitationUrls, videoUrl, galleryUrls] = await Promise.all([
                heroPromise,
                couplePromise,
                giftQrPromise,
                Promise.all(invitationPromises),
                videoPromise,
                Promise.all(galleryPromises)
            ]);

            const payload: any = {
                bride_name: formData.brideName,
                groom_name: formData.groomName,
                wedding_date: formData.weddingDate,
                wedding_time: formData.weddingTime,
                venue_name: formData.venueName,
                venue_address: formData.venueAddress,
                maps_link: formData.mapsLink,
                motif_color: formData.motifColor,
                font_style: formData.fontStyle,
                background_style: formData.backgroundStyle,
                template: formData.template,
                dress_code: formData.dressCode ? `${formData.dressCode}||${formData.dressCodeColor}` : '',
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
                logo_shape: formData.logoShape,
                logo_color: formData.logoColor || formData.motifColor,
                spotify_playlist_url: formData.spotifyUrl,
                wedding_party: formData.weddingParty,
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
            if (mediaFiles.giftQr || editId) payload.gift_qr_image = giftQrUrl || previews.giftQr;
            
            // Handle invitation images: merge new uploads with existing previews if editing
            const finalInvitationImages = invitationUrls.length > 0 ? invitationUrls : previews.invitationImages;
            payload.invitation_image = JSON.stringify(finalInvitationImages);
            
            if (mediaFiles.galleryImages.length > 0 || editId) payload.gallery_images = galleryUrls.length > 0 ? galleryUrls : (formData as any).gallery_images;

            const publicSlug = await resolvePublicSlug(weddingId);
            const baseSubmitPayload: any = {
                ...payload,
                ...(publicSlug ? { public_slug: publicSlug } : {}),
                id: weddingId,
                user_id: editId && weddingOwnerId ? weddingOwnerId : user.id,
            };

            let submitPayload = { ...baseSubmitPayload };
            let submitError: unknown = null;
            for (let attempt = 0; attempt < 3; attempt += 1) {
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

                if (!canRetry || JSON.stringify(fallbackPayload) === JSON.stringify(submitPayload)) {
                    break;
                }

                submitPayload = fallbackPayload;
            }

            if (submitError) throw submitError;
            if (submitPayload.public_slug) setExistingPublicSlug(submitPayload.public_slug);

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
                                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Venue Name</label>
                                <input required name="venueName" value={formData.venueName} onChange={handleChange} placeholder="The Grand Plaza" className="w-full px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-border bg-neutral focus:border-primary outline-none text-base min-h-[44px]" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Google Maps Link (Optional)</label>
                                <div className="relative">
                                    <MapPin className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
                                    <input name="mapsLink" value={formData.mapsLink} onChange={handleChange} placeholder="https://maps.app.goo.gl/..." className="icon-field-left w-full pl-14 pr-4 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-border bg-neutral focus:border-primary outline-none text-base min-h-[44px]" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Venue Address</label>
                            <AutoResizeTextarea required name="venueAddress" value={formData.venueAddress} onChange={handleChange} placeholder="123 Wedding Lane..." className="w-full min-h-[96px] resize-none rounded-lg border border-border bg-neutral px-4 py-3 text-base outline-none transition-all focus:border-primary focus:bg-white sm:rounded-xl sm:py-4" />
                        </div>

                        <div className="space-y-2 pt-4 border-t border-border">
                            <div className="flex justify-between items-center mb-2 gap-2">
                                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Wedding Party</label>
                                <button type="button" onClick={() => handleArrayAdd('weddingParty', { name: '', role: 'Bridesmaid', bio: '' })} className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline uppercase tracking-widest min-h-[44px] min-w-[44px]">
                                    <Plus className="w-3 h-3" /> <span className="hidden sm:inline">Add Member</span>
                                </button>
                            </div>
                            {formData.weddingParty?.length === 0 && <p className="text-sm text-text-secondary italic">No wedding party members added yet.</p>}
                            {formData.weddingParty?.map((member: any, i: number) => (
                                <div key={i} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border bg-neutral/50">
                                    <div className="flex-1 space-y-2 sm:space-y-3 w-full">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                            <input placeholder="Name" value={member.name} onChange={(e) => handleArrayChange('weddingParty', i, 'name', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:border-primary outline-none min-h-[44px]" />
                                            <input placeholder="Role (e.g. Best Man)" value={member.role} onChange={(e) => handleArrayChange('weddingParty', i, 'role', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:border-primary outline-none min-h-[44px]" />
                                        </div>
                                        <input placeholder="Short Bio (Optional)" value={member.bio} onChange={(e) => handleArrayChange('weddingParty', i, 'bio', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:border-primary outline-none" />
                                    </div>
                                    <button type="button" onClick={() => handleArrayRemove('weddingParty', i)} className="p-2 sm:p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 1:
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                            {TEMPLATES.map((tmpl) => {
                                const isLocked = !isPremium && !FREE_TEMPLATE_IDS.includes(tmpl.id as typeof FREE_TEMPLATE_IDS[number]);
                                const isSelected = formData.template === tmpl.id;
                                return (
                                    <button
                                        key={tmpl.id}
                                        type="button"
                                        onClick={() => !isLocked && setFormData((prev: any) => ({ ...prev, template: tmpl.id }))}
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
                                         onClick={() => setFormData((prev: any) => ({ ...prev, motifColor: color }))}
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
                                     onChange={(e) => setFormData((prev: any) => ({ ...prev, motifColor: e.target.value }))}
                                     className="w-10 h-10 rounded-xl border border-border p-0 cursor-pointer bg-transparent"
                                     aria-label="Pick a custom color"
                                 />
                                 <input
                                     type="text"
                                     value={formData.motifColor}
                                     onChange={(e) => setFormData((prev: any) => ({ ...prev, motifColor: e.target.value }))}
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
                            <p className="text-text-secondary">Create your unique wedding brand identity.</p>
                        </div>

                        {!isPremium ? (
                            <div className="bg-white rounded-[2rem] p-12 border-2 border-dashed border-primary/10 text-center flex flex-col items-center gap-6 shadow-sm">
                                <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center">
                                    <Sparkles className="w-10 h-10 text-primary/40" />
                                </div>
                                <div className="max-w-md mx-auto">
                                    <h3 className="text-2xl font-serif font-bold text-foreground mb-3">Premium Monogram Maker</h3>
                                    <p className="text-text-secondary mb-8">
                                        Unlock our custom monogram logo system to create a unique brand identity that appears throughout your invitation.
                                    </p>
                                    <UpgradeButton weddingId={editId || ''} className="scale-110 mb-6" />
                                    <div className="flex justify-center gap-6 opacity-40 grayscale pointer-events-none">
                                        <div className="w-16 h-16 rounded-full border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-xl font-serif">A&B</div>
                                        <div className="w-16 h-16 rounded-xl border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-xl font-serif">A&B</div>
                                        <div className="w-16 h-16 border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-xl font-serif text-center leading-tight">A<br />&<br />B</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="overflow-hidden rounded-[2rem] border border-primary/10 bg-[radial-gradient(circle_at_top,rgba(192,128,129,0.14),transparent_48%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,248,244,0.78))] p-5 text-center shadow-xl shadow-primary/10 sm:p-8">
                                    <p className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-primary/60">Live Monogram</p>
                                    <MonogramMark
                                        initials={formData.logoInitials}
                                        brideName={formData.brideName}
                                        groomName={formData.groomName}
                                        shape={formData.logoShape}
                                        color={formData.logoColor}
                                        motifColor={formData.motifColor}
                                        fontClassName={FONTS.find(f => f.id === formData.logoFont)?.class || 'font-serif'}
                                        size="lg"
                                        className="mx-auto"
                                    />
                                    <div className="mx-auto mt-6 h-px w-28 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary/70">
                                        {formData.brideName || 'Bride'} & {formData.groomName || 'Groom'}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Initials</label>
                                    <input
                                        name="logoInitials"
                                        value={formData.logoInitials}
                                        onChange={handleChange}
                                        placeholder={(formData.brideName?.[0] || 'A') + ' & ' + (formData.groomName?.[0] || 'B')}
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Monogram Style</label>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                        {MONOGRAM_SHAPES.map((shape) => (
                                            <button
                                                key={shape.id}
                                                type="button"
                                                onClick={() => setFormData((prev: any) => ({ ...prev, logoShape: shape.id }))}
                                                className={`rounded-2xl border p-3 text-left transition-all ${formData.logoShape === shape.id ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-border bg-neutral/60 hover:border-primary/40 hover:bg-white'}`}
                                            >
                                                <MonogramMark
                                                    initials={formData.logoInitials}
                                                    brideName={formData.brideName}
                                                    groomName={formData.groomName}
                                                    shape={shape.id}
                                                    color={formData.logoColor}
                                                    motifColor={formData.motifColor}
                                                    fontClassName={FONTS.find(f => f.id === formData.logoFont)?.class || 'font-serif'}
                                                    size="sm"
                                                    className="mx-auto mb-3"
                                                />
                                                <span className="block text-[11px] font-black uppercase tracking-[0.16em] text-foreground">{shape.name}</span>
                                                <span className="mt-1 block text-[10px] leading-4 text-text-secondary">{shape.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Monogram Font</label>
                                        <select
                                            name="logoFont"
                                            value={formData.logoFont}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none"
                                        >
                                            {FONTS.map(f => (
                                                <option key={f.id} value={f.id}>{f.name}</option>
                                            ))}
                                        </select>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-text-secondary/50 mb-2 block">Monogram Color</label>
                                    <div className="flex flex-wrap gap-2 mb-3">
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
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-text-secondary/50 mb-2 block">Custom Monogram Color</label>
                                        <div className="flex items-center gap-3">
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
            case 5:
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-4">
                <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Dress Code</h2>
                <p className="text-text-secondary">Guide your guests with a polished attire note and matching visual palette.</p>
            </div>
            <div className="grid gap-6 rounded-[2rem] border border-border bg-white/70 p-4 shadow-sm sm:p-6 md:grid-cols-[1.05fr_0.95fr] md:items-stretch">
                <div className="space-y-6 rounded-[1.5rem] bg-white p-4 sm:p-5">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Attire Type</label>
                        <input
                            name="dressCode"
                            value={formData.dressCode}
                            onChange={handleChange}
                            placeholder="e.g. Formal, Black Tie, Garden Chic"
                            className="w-full rounded-xl border border-border bg-neutral px-4 py-3 outline-none transition-all focus:border-primary focus:bg-white"
                        />
                        <p className="text-[10px] leading-relaxed text-text-secondary ml-1">This appears on the invitation so guests know the expected style.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Attire Color Theme</label>
                        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                            {['#111827', '#1A365D', '#276749', '#744210', '#E53E3E', '#805AD5', '#D6BCFA', '#FBD38D', '#D16C78', '#D6B87C', '#6B7A62', '#F8EEEA'].map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData((prev: any) => ({ ...prev, dressCodeColor: color }))}
                                    className={`relative h-12 rounded-2xl border-2 transition-all ${formData.dressCodeColor === color ? 'border-white ring-2 ring-primary shadow-xl scale-105' : 'border-border/60 shadow-sm hover:border-primary/50'}`}
                                    style={{ backgroundColor: color }}
                                    aria-label={`Select attire color ${color}`}
                                >
                                    {formData.dressCodeColor === color && (
                                        <span className="absolute inset-0 flex items-center justify-center">
                                            <CheckCircle2 className="h-5 w-5 text-white drop-shadow" />
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <input
                                type="color"
                                name="dressCodeColor"
                                value={formData.dressCodeColor}
                                onChange={handleChange}
                                className="h-11 w-11 cursor-pointer rounded-2xl border border-border bg-transparent p-0"
                                aria-label="Pick a custom attire color"
                            />
                            <input
                                type="text"
                                name="dressCodeColor"
                                value={formData.dressCodeColor}
                                onChange={handleChange}
                                placeholder="#HEX"
                                className="min-h-[44px] flex-1 rounded-xl border border-border bg-neutral px-4 py-3 font-mono text-sm outline-none transition-all focus:border-primary focus:bg-white"
                            />
                        </div>
                        <p className="text-[10px] text-text-secondary ml-1 mt-2">The selected color updates the dress and accents in the preview art.</p>
                    </div>
                </div>
                <div
                    className="relative flex min-h-[310px] flex-col justify-between overflow-hidden rounded-[1.75rem] border border-border bg-neutral p-5"
                    style={{ boxShadow: `0 24px 70px ${formData.dressCodeColor}18` }}
                >
                    <div className="absolute inset-0 opacity-70" style={{ background: `radial-gradient(circle at 50% 28%, ${formData.dressCodeColor}22, transparent 48%)` }} />
                    <div className="relative flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-text-secondary/60">Live attire preview</p>
                            <p className="mt-1 font-serif text-2xl font-bold text-foreground">{formData.dressCode || 'Formal Attire'}</p>
                        </div>
                        <div className="h-11 w-11 rounded-2xl border border-white/80 shadow-lg" style={{ backgroundColor: formData.dressCodeColor }} />
                    </div>
                    <div className="relative flex flex-1 items-center justify-center py-4">
                        <VectorArtGuests color={formData.dressCodeColor} />
                    </div>
                    <div className="relative rounded-2xl border border-white/70 bg-white/75 px-4 py-3 text-center text-xs font-semibold leading-5 text-text-secondary backdrop-blur">
                        Guests will see the attire note with a color-coordinated illustration on the wedding page.
                    </div>
                </div>
            </div>
        </div>
    );
            case 6:
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-serif font-bold text-primary mb-4 flex items-center gap-2"><Heart className="w-5 h-5" /> Gift Options</h3>

            {/* Basic Bank Details */}
            <div className="p-4 rounded-2xl border border-border bg-neutral/30 space-y-4">
                <h4 className="text-sm font-bold text-foreground">Direct Bank Transfer</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Bank Name</label>
                        <input name="giftBank" value={formData.giftBank} onChange={handleChange} placeholder="GCash" className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Account Number</label>
                        <input name="giftAccountNumber" value={formData.giftAccountNumber} onChange={handleChange} placeholder="0917..." className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary outline-none" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Account Name</label>
                    <input name="giftAccountName" value={formData.giftAccountName} onChange={handleChange} placeholder="Name" className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Upload QR Code (Optional)</label>
                    <div className="relative h-32 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-white hover:bg-neutral/50 transition-colors">
                        {previews.giftQr ? <img src={previews.giftQr} className="h-full object-contain" /> : <ImageIcon className="w-6 h-6 text-primary/40" />}
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'giftQr')} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                </div>
            </div>

            {/* Registry Links */}
            <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-foreground">Registry Links</h4>
                    <button type="button" onClick={() => handleArrayAdd('registryLinks', { title: 'Amazon Registry', url: '' })} className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline uppercase tracking-widest">
                        <Plus className="w-3 h-3" /> Add Registry
                    </button>
                </div>
                {formData.registryLinks?.map((link: any, i: number) => (
                    <div key={i} className="flex gap-2">
                        <input placeholder="Store Name" value={link.title} onChange={(e) => handleArrayChange('registryLinks', i, 'title', e.target.value)} className="w-1/3 px-3 py-2 text-sm rounded-xl border border-border bg-neutral focus:border-primary outline-none" />
                        <div className="relative flex-1">
                            <LinkIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/50 pointer-events-none" />
                            <input placeholder="https://..." value={link.url} onChange={(e) => handleArrayChange('registryLinks', i, 'url', e.target.value)} className="icon-field-left w-full pl-14 pr-3 py-2 text-sm rounded-xl border border-border bg-neutral focus:border-primary outline-none min-h-[44px]" />
                        </div>
                        <button type="button" onClick={() => handleArrayRemove('registryLinks', i)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                ))}
            </div>

            {/* Cash Funds */}
            <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-foreground">Cash Funds (Honeymoon, House, etc.)</h4>
                    <button type="button" onClick={() => handleArrayAdd('cashFunds', { title: 'Honeymoon Fund', description: 'Help us travel to Bali!', targetAmount: 5000, currency: '$' })} className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline uppercase tracking-widest">
                        <Plus className="w-3 h-3" /> Add Fund
                    </button>
                </div>
                {formData.cashFunds?.map((fund: any, i: number) => (
                    <div key={i} className="p-4 rounded-xl border border-border bg-neutral/50 space-y-3">
                        <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 space-y-3">
                                <input placeholder="Fund Title" value={fund.title} onChange={(e) => handleArrayChange('cashFunds', i, 'title', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-white focus:border-primary outline-none" />
                                <input placeholder="Short Description" value={fund.description} onChange={(e) => handleArrayChange('cashFunds', i, 'description', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-white focus:border-primary outline-none" />
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <DollarSign className="w-3 h-3 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/50 pointer-events-none" />
                                        <input 
                                            type="number" 
                                            inputMode="decimal"
                                            placeholder="0" 
                                            value={fund.targetAmount} 
                                            onChange={(e) => handleArrayChange('cashFunds', i, 'targetAmount', e.target.value)} 
                                            className="icon-field-left w-full pl-14 pr-3 py-2 text-sm rounded-lg border border-border bg-white focus:border-primary outline-none min-h-[44px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                        />
                                    </div>
                                    <input placeholder="Currency (e.g. $, PHP)" value={fund.currency} onChange={(e) => handleArrayChange('cashFunds', i, 'currency', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-white focus:border-primary outline-none" />
                                </div>
                            </div>
                            <button type="button" onClick={() => handleArrayRemove('cashFunds', i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Payment Links */}
            <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-foreground">Payment Links (PayPal, Venmo)</h4>
                    <button type="button" onClick={() => handleArrayAdd('paymentLinks', { title: 'PayPal', url: '' })} className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline uppercase tracking-widest">
                        <Plus className="w-3 h-3" /> Add Link
                    </button>
                </div>
                {formData.paymentLinks?.map((link: any, i: number) => (
                    <div key={i} className="flex gap-2">
                        <input placeholder="Service (e.g. Venmo)" value={link.title} onChange={(e) => handleArrayChange('paymentLinks', i, 'title', e.target.value)} className="w-1/3 px-3 py-2 text-sm rounded-xl border border-border bg-neutral focus:border-primary outline-none" />
                        <div className="relative flex-1">
                            <LinkIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/50 pointer-events-none" />
                            <input placeholder="https://..." value={link.url} onChange={(e) => handleArrayChange('paymentLinks', i, 'url', e.target.value)} className="icon-field-left w-full pl-14 pr-3 py-2 text-sm rounded-xl border border-border bg-neutral focus:border-primary outline-none min-h-[44px]" />
                        </div>
                        <button type="button" onClick={() => handleArrayRemove('paymentLinks', i)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
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
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.isThankYouMode} onChange={(e) => setFormData((prev: any) => ({ ...prev, isThankYouMode: e.target.checked }))} className="sr-only peer" />
                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
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

return (
    <>
        <AnimatePresence>
            {isGenerating && <GenerationLoading />}
        </AnimatePresence>

        <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
            <div className="w-full lg:w-3/5 bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-8 soft-shadow border border-primary/10 flex-shrink-0">
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
                <div className="hidden lg:flex justify-between items-center mb-12 gap-2">
                    {STEPS.map((step, idx) => (
                        <div key={step.id} className="flex flex-col items-center relative flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 flex-shrink-0 transition-all duration-500 ${idx === currentStep ? 'bg-primary text-white scale-110 shadow-[0_0_20px_rgba(192,128,129,0.3)]' : idx < currentStep ? 'bg-secondary text-foreground' : 'bg-neutral text-text-secondary border border-border'}`}>
                                {idx < currentStep ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                            </div>
                            <span className={`text-[9px] uppercase tracking-widest mt-3 font-bold text-center leading-tight transition-colors duration-500 ${idx === currentStep ? 'text-primary' : 'text-text-secondary'}`}>{step.title}</span>
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
            <div className="hidden lg:block w-full lg:w-2/5 sticky top-8">
                <LivePreview formData={formData} previews={previews} />
            </div>

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
                                    <LivePreview formData={formData} previews={previews} isMobileView />
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
