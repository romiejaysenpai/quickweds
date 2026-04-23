'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, MapPin, Palette, CheckCircle2, ArrowRight, ArrowLeft, Send, Camera, Image as ImageIcon, Video, X, Layout, Sparkles, Plus, Trash2, Link as LinkIcon, DollarSign, Music, Shirt, Undo2, Redo2, ChevronDown, Eye, Smartphone } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import VectorArtGuests from './VectorArtGuests';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import GenerationLoading from './GenerationLoading';
import { useAuth } from '@/context/AuthContext';
import UpgradeButton from './UpgradeButton';
import LivePreview from './LivePreview';
import MarketplacePanel from './builder/MarketplacePanel';
import { useLocalUndoRedo } from '@/components/UndoRedoProvider';
import { FREE_TEMPLATE_IDS, TEMPLATES } from '@/lib/template-catalog';
import {
    SECTION_BLOCK_LIBRARY,
    buildPresetPayload,
    deleteTemplatePreset,
    listTemplatePresets,
    saveTemplatePreset,
    type WeddingTemplatePreset,
} from '@/lib/wedding-features';

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

const STEPS = [
    { id: 'details', title: 'Details', icon: Heart },
    { id: 'templates', title: 'Layout', icon: Layout },
    { id: 'theme', title: 'Style', icon: Palette },
    { id: 'logo', title: 'Monogram', icon: Sparkles },
    { id: 'media', title: 'Media', icon: Camera },
    { id: 'dresscode', title: 'Dress Code', icon: Shirt },
    { id: 'gifts', title: 'Gifts', icon: Heart },
    { id: 'rsvp', title: 'RSVP', icon: Calendar },
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
    weddingParty: [],
    registryLinks: [],
    cashFunds: [],
    paymentLinks: [],
    isThankYouMode: false,
    thankYouMessage: '',
    photoAlbumLink: '',
    accentStyle: 'none',
};

export default function BuilderForm() {
    const router = useRouter();
    const { user, isAdmin, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const editId = searchParams?.get('edit');
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    
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
        invitationImage: File | null;
        galleryImages: File[];
    }>({
        heroImage: null,
        couplePhoto: null,
        teaserVideo: null,
        giftQr: null,
        invitationImage: null,
        galleryImages: [],
    });

    const [previews, setPreviews] = useState<{
        heroImage: string | null;
        couplePhoto: string | null;
        giftQr: string | null;
        invitationImage: string | null;
    }>({
        heroImage: null,
        couplePhoto: null,
        giftQr: null,
        invitationImage: null,
    });

    const [isPremium, setIsPremium] = useState(isAdmin);
    const [savedPresets, setSavedPresets] = useState<WeddingTemplatePreset[]>([]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }

        if (isAdmin) {
            setIsPremium(true);
        }

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
                const { data, error } = await supabase
                    .from('weddings')
                    .select('*')
                    .eq('id', editId)
                    .single();

                if (data && data.user_id === user.id) {
                    // Set premium status (Admin is always premium)
                    setIsPremium(data.is_premium || isAdmin || false);

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
                    setPreviews({
                        heroImage: data.hero_image || null,
                        couplePhoto: data.couple_photo || null,
                        giftQr: data.gift_qr_image || null,
                        invitationImage: data.invitation_image || null,
                    });
                }
            };
            fetchWedding();
        }
    }, [user, authLoading, router, editId]);

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
        setFormData((prev: any) => ({ ...prev, [field]: [...prev[field], item] }));
    };
    const handleArrayRemove = (field: string, index: number) => {
        setFormData((prev: any) => ({ ...prev, [field]: prev[field].filter((_: any, i: number) => i !== index) }));
    };
    const handleArrayChange = (field: string, index: number, key: string, value: string) => {
        setFormData((prev: any) => {
            const newArr = [...prev[field]];
            newArr[index] = { ...newArr[index], [key]: value };
            return { ...prev, [field]: newArr };
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

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
                const allowedCount = 12 - mediaFiles.galleryImages.length;
                if (allowedCount <= 0) return;
                setMediaFiles((prev: any) => ({ ...prev, galleryImages: [...prev.galleryImages, ...newFiles.slice(0, allowedCount)] }));
            } else {
                setMediaFiles((prev: any) => ({ ...prev, galleryImages: [...prev.galleryImages, ...newFiles] }));
            }
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

    const removeGalleryImage = (index: number) => {
        setMediaFiles(prev => ({
            ...prev,
            galleryImages: prev.galleryImages.filter((_, i) => i !== index)
        }));
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
            const invitationPromise = mediaFiles.invitationImage ? uploadToSupabase(mediaFiles.invitationImage, 'invitation') : Promise.resolve(null);
            const videoPromise = mediaFiles.teaserVideo ? uploadToSupabase(mediaFiles.teaserVideo, 'teaser') : Promise.resolve(null);
            const galleryPromises = mediaFiles.galleryImages.map((file, i) => uploadToSupabase(file, `gallery-${i}`));

            const [heroUrl, coupleUrl, giftQrUrl, invitationUrl, videoUrl, galleryUrls] = await Promise.all([
                heroPromise,
                couplePromise,
                giftQrPromise,
                invitationPromise,
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
            if (mediaFiles.teaserVideo || editId) payload.teaser_video = videoUrl || (formData as any).teaser_video; // Keep existing if edit
            if (mediaFiles.giftQr || editId) payload.gift_qr_image = giftQrUrl || previews.giftQr;
            if (mediaFiles.invitationImage || editId) payload.invitation_image = invitationUrl || previews.invitationImage;
            if (mediaFiles.galleryImages.length > 0 || editId) payload.gallery_images = galleryUrls.length > 0 ? galleryUrls : (formData as any).gallery_images;

            // Using UPSERT (Update + Insert) for maximum reliability
            // This prevents "Resource already exists" errors when re-editing and RLS issues on inserts
            const { error: submitError } = await supabase
                .from('weddings')
                .upsert({ 
                    ...payload, 
                    id: weddingId, 
                    user_id: user.id 
                }, { onConflict: 'id' });

            if (submitError) throw submitError;

            // Success
            router.push(`/dashboard/${weddingId}?created=true`);

        } catch (err: any) {
            console.error('Submission error:', err);
            setIsGenerating(false);
            if (err.message?.includes('exceeded the maximum allowed size')) {
                alert('Storage Limit Error: Your Supabase bucket has a 50MB default limit. Please compress your files or go to your Supabase Dashboard to check your storage settings.');
            } else {
                alert('Error creating invitation: ' + err.message);
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
                                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Bride&apos;s Name</label>
                                <input required name="brideName" value={formData.brideName} onChange={handleChange} placeholder="Sarah" className="w-full px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-border bg-neutral focus:border-primary outline-none transition-all text-base min-h-[44px]" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Groom&apos;s Name</label>
                                <input required name="groomName" value={formData.groomName} onChange={handleChange} placeholder="John" className="w-full px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-border bg-neutral focus:border-primary outline-none transition-all text-base min-h-[44px]" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Wedding Hashtag (Optional)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">#</span>
                                <input name="hashtag" value={formData.hashtag} onChange={handleChange} placeholder="SarahAndJohn2024" className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-border bg-neutral focus:border-primary outline-none transition-all text-base min-h-[44px]" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Wedding Date</label>
                                <input required type="date" name="weddingDate" value={formData.weddingDate} onChange={handleChange} className="w-full px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-border bg-neutral focus:border-primary outline-none text-base min-h-[44px]" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Wedding Time</label>
                                <input required type="time" name="weddingTime" value={formData.weddingTime} onChange={handleChange} className="w-full px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-border bg-neutral focus:border-primary outline-none text-base min-h-[44px]" />
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
                                    <MapPin className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                                    <input name="mapsLink" value={formData.mapsLink} onChange={handleChange} placeholder="https://maps.app.goo.gl/..." className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-border bg-neutral focus:border-primary outline-none text-base min-h-[44px]" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Venue Address</label>
                            <textarea required name="venueAddress" value={formData.venueAddress} onChange={handleChange} placeholder="123 Wedding Lane..." className="w-full px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-border bg-neutral focus:border-primary outline-none h-20 sm:h-24 resize-none text-base" />
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
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
                                                            {tmpl.tier === 'free' ? 'Included' : 'Premium'}
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
                                        <h4 className="font-bold text-sm text-foreground mb-1">Unlock 22 Premium Templates</h4>
                                        <p className="text-xs text-text-secondary mb-3">Get access to all modern, luxury, and editorial styles for $14.99</p>
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
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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
                                            <h4 className="font-bold text-sm text-foreground mb-1">Unlock 35 Premium Fonts</h4>
                                            <p className="text-xs text-text-secondary mb-3">Get access to all premium typography for just $14.99</p>
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
                            <textarea name="story" value={formData.story} onChange={handleChange} placeholder="How we met..." className="w-full px-4 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none h-32 resize-none" />
                        </div>
                        <div className="space-y-4 pt-8 border-t border-border">
                            <div className="flex items-center gap-2 text-primary">
                                <Sparkles className="w-4 h-4" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary">Decorative Accents</h3>
                            </div>
                            <p className="text-xs text-text-secondary/60 ml-6 -mt-2 mb-4">Add elegant vector illustrations to the corners of your invitation.</p>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {['none', 'eucalyptus', 'pampas', 'ribbon', 'monstera', 'sakura', 'gold-arch', 'sparkles', 'petals', 'dots'].map((style) => (
                                    <button
                                        key={style}
                                        type="button"
                                        onClick={() => setFormData((prev: any) => ({ ...prev, accentStyle: style }))}
                                        className={`px-3 py-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.accentStyle === style ? 'border-primary bg-primary/5 text-primary scale-105' : 'border-border bg-neutral hover:border-primary/50 text-text-secondary'}`}
                                    >
                                        <div className="w-8 h-8 flex items-center justify-center opacity-60">
                                            {style === 'none' ? <X className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{style}</span>
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
                                <div className="text-center mb-8">
                                    <div
                                        className={`w-32 h-32 mx-auto flex items-center justify-center transition-all duration-500 ${formData.logoShape === 'circle' ? 'rounded-full' :
                                            formData.logoShape === 'square' ? 'rounded-2xl' : ''
                                            } ${formData.logoShape !== 'minimal' ? 'border-2 border-primary/20 bg-primary/5' : ''}`}
                                        style={{ color: formData.logoColor || formData.motifColor, borderColor: formData.logoColor || formData.motifColor }}
                                    >
                                        <span className={`font-serif text-4xl uppercase tracking-tighter ${FONTS.find(f => f.id === formData.logoFont)?.class || 'font-serif'
                                            }`}>
                                            {formData.logoInitials || (formData.brideName?.[0] || 'A') + ' & ' + (formData.groomName?.[0] || 'B')}
                                        </span>
                                    </div>
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Monogram Shape</label>
                                        <select
                                            name="logoShape"
                                            value={formData.logoShape}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none"
                                        >
                                            <option value="minimal">Minimal</option>
                                            <option value="circle">Circle</option>
                                            <option value="square">Rounded Square</option>
                                        </select>
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
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Monogram Color (Optional)</label>
                                    <div className="flex gap-4">
                                        {['#D16C78', '#F2C1CC', '#D6B87C', '#3A2A2D', '#7A5A61', '#FFF8F4'].map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setFormData((prev: any) => ({ ...prev, logoColor: color }))}
                                                className={`w-10 h-10 rounded-full border-4 transition-transform ${formData.logoColor === color ? 'border-white ring-2 ring-primary scale-110' : 'border-neutral'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                        <input type="color" name="logoColor" value={formData.logoColor} onChange={handleChange} className="w-10 h-10 rounded-full overflow-hidden border-none cursor-pointer" />
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
                                    <h3 className="text-lg font-serif font-bold text-foreground">Invitation Photo / Screenshot</h3>
                                    <p className="text-[10px] uppercase tracking-widest text-text-secondary font-black opacity-50">Showcase your invitation card</p>
                                </div>
                            </div>
                            
                            <div className="relative h-72 rounded-3xl border-2 border-dashed border-primary/20 bg-white flex items-center justify-center overflow-hidden hover:border-primary transition-all group group hover:shadow-xl duration-500">
                                {previews.invitationImage ? (
                                    <div className="relative w-full h-full">
                                        <img src={previews.invitationImage} className="w-full h-full object-contain p-6" />
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setMediaFiles(prev => ({ ...prev, invitationImage: null }));
                                                setPreviews(prev => ({ ...prev, invitationImage: null }));
                                            }} 
                                            className="absolute top-6 right-6 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center group-hover:scale-105 transition-transform duration-700">
                                        <Camera className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                                        <span className="text-sm text-text-secondary font-bold uppercase tracking-widest block mb-1">Upload Invitation Media</span>
                                        <p className="text-xs text-text-secondary/40 font-serif italic">This will appear beautifully on your wedding site</p>
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'invitationImage')} className="absolute inset-0 opacity-0 cursor-pointer" />
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
                                {mediaFiles.galleryImages.map((file, i) => (
                                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-border">
                                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors">
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
                                <Music className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-green-500" />
                                <input name="spotifyUrl" value={formData.spotifyUrl} onChange={handleChange} placeholder="https://open.spotify.com/playlist/..." className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none min-h-[44px]" />
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
                <p className="text-text-secondary">Let your guests know what to wear.</p>
            </div>
            <div className="flex flex-col md:flex-row gap-8 items-center bg-white/50 p-6 rounded-[2rem] border border-border">
                <div className="flex-1 space-y-6 w-full">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Attire Type</label>
                        <input name="dressCode" value={formData.dressCode} onChange={handleChange} placeholder="e.g. Formal, Black Tie, Casual" className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Attire Color Theme</label>
                        <div className="flex flex-wrap gap-4">
                            {['#000000', '#1A365D', '#276749', '#744210', '#E53E3E', '#805AD5', '#D6BCFA', '#FBD38D'].map((color) => (
                                <button key={color} type="button" onClick={() => setFormData((prev: any) => ({ ...prev, dressCodeColor: color }))} className={`w-10 h-10 rounded-full border-4 transition-transform ${formData.dressCodeColor === color ? 'border-white ring-2 ring-primary scale-110' : 'border-neutral shadow-sm'}`} style={{ backgroundColor: color }} />
                            ))}
                            <input type="color" name="dressCodeColor" value={formData.dressCodeColor} onChange={handleChange} className="w-10 h-10 rounded-full overflow-hidden border-none cursor-pointer p-0" />
                        </div>
                        <p className="text-[10px] text-text-secondary ml-1 mt-2">Select a theme color for the vector art guests.</p>
                    </div>
                </div>
                <div className="w-full md:w-1/2 flex justify-center items-center relative h-64 bg-neutral rounded-3xl overflow-hidden border-2 border-dashed border-border py-4">
                    <VectorArtGuests color={formData.dressCodeColor} />
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
                            <LinkIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/50" />
                            <input placeholder="https://..." value={link.url} onChange={(e) => handleArrayChange('registryLinks', i, 'url', e.target.value)} className="w-full pl-12 pr-3 py-2 text-sm rounded-xl border border-border bg-neutral focus:border-primary outline-none min-h-[44px]" />
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
                                        <DollarSign className="w-3 h-3 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/50" />
                                        <input type="number" placeholder="Target Amount" value={fund.targetAmount} onChange={(e) => handleArrayChange('cashFunds', i, 'targetAmount', e.target.value)} className="w-full pl-12 pr-3 py-2 text-sm rounded-lg border border-border bg-white focus:border-primary outline-none min-h-[44px]" />
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
                            <LinkIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/50" />
                            <input placeholder="https://..." value={link.url} onChange={(e) => handleArrayChange('paymentLinks', i, 'url', e.target.value)} className="w-full pl-12 pr-3 py-2 text-sm rounded-xl border border-border bg-neutral focus:border-primary outline-none min-h-[44px]" />
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
                    <input required type="date" name="rsvpDeadline" value={formData.rsvpDeadline} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none" />
                </div>

                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Contact Person</label>
                    <input name="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder="Name" className="w-full px-4 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none" />
                </div>
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
                <div className="flex justify-between items-center mb-8 sm:mb-12 gap-1 sm:gap-2 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                    {STEPS.map((step, idx) => (
                        <div key={step.id} className="flex flex-col items-center relative flex-1 min-w-max sm:min-w-0">
                            <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center z-10 flex-shrink-0 text-xs sm:text-base ${idx === currentStep ? 'bg-primary text-white scale-105 sm:scale-110 shadow-lg' : idx < currentStep ? 'bg-secondary text-foreground' : 'bg-neutral text-text-secondary border border-border'}`}>
                                {idx < currentStep ? <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5" /> : <step.icon className="w-4 sm:w-5 h-4 sm:h-5" />}
                            </div>
                            <span className={`text-[7px] sm:text-[9px] uppercase tracking-widest mt-2 sm:mt-3 font-bold text-center leading-tight ${idx === currentStep ? 'text-primary' : 'text-text-secondary'}`}>{step.title}</span>
                            {idx < STEPS.length - 1 && <div className={`absolute top-4 sm:top-5 left-[60%] w-[80%] h-[2px] -z-0 hidden sm:block ${idx < currentStep ? 'bg-secondary' : 'bg-border'}`} />}
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

                    <div className="flex justify-between items-center pt-6 sm:pt-8 border-t border-border gap-2 sm:gap-4">
                        <button type="button" onClick={prevStep} className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2 rounded-lg sm:rounded-xl text-primary font-bold text-sm sm:text-base min-h-[44px] min-w-[44px] ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'hover:bg-neutral'}`}>
                            <ArrowLeft className="w-4 h-4 flex-shrink-0" /> <span className="hidden sm:inline">Back</span>
                        </button>
                        <button type="submit" disabled={isSubmitting} className="bg-primary text-white px-6 sm:px-10 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold flex items-center gap-2 hover:bg-primary-hover shadow-lg disabled:opacity-50 text-sm sm:text-base min-h-[44px] transition-all flex-1 sm:flex-none justify-center sm:justify-start">
                            {isSubmitting ? 'Processing...' : currentStep === STEPS.length - 1 ? <><span className="hidden sm:inline">{editId ? 'Update Invitation' : 'Create Invitation'}</span><span className="sm:hidden">Finish</span> <Send className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" /></> : <>Next <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" /></>}
                        </button>
                    </div>
                </form>
            </div>

            <div className="hidden lg:block w-full lg:w-2/5 sticky top-8">
                <LivePreview formData={formData} previews={previews} />
            </div>
        </div>
    </>
);
}
