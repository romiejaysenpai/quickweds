'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, MapPin, Palette, CheckCircle2, ArrowRight, ArrowLeft, Send, Camera, Image as ImageIcon, Video, X, Layout, Sparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import GenerationLoading from './GenerationLoading';
import { useAuth } from '@/context/AuthContext';
import UpgradeButton from './UpgradeButton';

const STEPS = [
    { id: 'details', title: 'Details', icon: Heart },
    { id: 'templates', title: 'Layout', icon: Layout },
    { id: 'theme', title: 'Style', icon: Palette },
    { id: 'logo', title: 'Monogram', icon: Sparkles },
    { id: 'media', title: 'Media', icon: Camera },
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

export const TEMPLATES = [
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

export default function BuilderForm() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [formData, setFormData] = useState({
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
    });

    const [mediaFiles, setMediaFiles] = useState<{
        heroImage: File | null;
        couplePhoto: File | null;
        teaserVideo: File | null;
        giftQr: File | null;
        galleryImages: File[];
    }>({
        heroImage: null,
        couplePhoto: null,
        teaserVideo: null,
        giftQr: null,
        galleryImages: [],
    });

    const [previews, setPreviews] = useState<{
        heroImage: string | null;
        couplePhoto: string | null;
        giftQr: string | null;
    }>({
        heroImage: null,
        couplePhoto: null,
        giftQr: null,
    });

    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }

        if (user && editId) {
            const fetchWedding = async () => {
                const { data, error } = await supabase
                    .from('weddings')
                    .select('*')
                    .eq('id', editId)
                    .single();

                if (data && data.user_id === user.id) {
                    // Set premium status
                    setIsPremium(data.is_premium || false);

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
                        dressCode: data.dress_code || '',
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
                    });
                    setPreviews({
                        heroImage: data.hero_image || null,
                        couplePhoto: data.couple_photo || null,
                        giftQr: data.gift_qr_image || null,
                    });
                }
            };
            fetchWedding();
        }
    }, [user, authLoading, router, editId]);

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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
                setMediaFiles(prev => ({ ...prev, galleryImages: [...prev.galleryImages, ...newFiles.slice(0, allowedCount)] }));
            } else {
                setMediaFiles(prev => ({ ...prev, galleryImages: [...prev.galleryImages, ...newFiles] }));
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

            setMediaFiles(prev => ({ ...prev, [field]: file }));

            if (field === 'heroImage' || field === 'couplePhoto' || field === 'giftQr') {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews(prev => ({ ...prev, [field]: reader.result as string }));
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

        setIsSubmitting(true);
        setIsGenerating(true);
        if (!user) {
            setIsGenerating(false);
            setIsSubmitting(false);
            return;
        }

        try {
            const weddingId = editId || uuidv4().slice(0, 8);
            const uploadToSupabase = async (file: File, folder: string) => {
                const filename = `${folder}-${file.name.replace(/\s+/g, '_')}`;
                const filePath = `${user.id}/${weddingId}/${filename}`;

                const { error: uploadError } = await supabase.storage
                    .from('quickweds')
                    .upload(filePath, file);

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
            const videoPromise = mediaFiles.teaserVideo ? uploadToSupabase(mediaFiles.teaserVideo, 'teaser') : Promise.resolve(null);
            const galleryPromises = mediaFiles.galleryImages.map((file, i) => uploadToSupabase(file, `gallery-${i}`));

            const [heroUrl, coupleUrl, giftQrUrl, videoUrl, galleryUrls] = await Promise.all([
                heroPromise,
                couplePromise,
                giftQrPromise,
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
                dress_code: formData.dressCode,
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
            };

            if (mediaFiles.heroImage || editId) payload.hero_image = heroUrl || previews.heroImage;
            if (mediaFiles.couplePhoto || editId) payload.couple_photo = coupleUrl || previews.couplePhoto;
            if (mediaFiles.teaserVideo || editId) payload.teaser_video = videoUrl || (formData as any).teaser_video; // Keep existing if edit
            if (mediaFiles.giftQr || editId) payload.gift_qr_image = giftQrUrl || previews.giftQr;
            if (mediaFiles.galleryImages.length > 0 || editId) payload.gallery_images = galleryUrls.length > 0 ? galleryUrls : (formData as any).gallery_images;

            if (editId) {
                const { error: updateError } = await supabase
                    .from('weddings')
                    .update(payload)
                    .eq('id', editId);
                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('weddings')
                    .insert({ ...payload, id: weddingId, user_id: user.id });
                if (insertError) throw insertError;
            }

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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Bride&apos;s Name</label>
                                <input required name="brideName" value={formData.brideName} onChange={handleChange} placeholder="Sarah" className="w-full px-4 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Groom&apos;s Name</label>
                                <input required name="groomName" value={formData.groomName} onChange={handleChange} placeholder="John" className="w-full px-4 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none transition-all" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Wedding Hashtag (Optional)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">#</span>
                                <input name="hashtag" value={formData.hashtag} onChange={handleChange} placeholder="SarahAndJohn2024" className="w-full pl-8 pr-4 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none transition-all" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Wedding Date</label>
                                <input required type="date" name="weddingDate" value={formData.weddingDate} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Wedding Time</label>
                                <input required type="time" name="weddingTime" value={formData.weddingTime} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Venue Name</label>
                            <input required name="venueName" value={formData.venueName} onChange={handleChange} placeholder="The Grand Plaza" className="w-full px-4 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Venue Address</label>
                            <textarea required name="venueAddress" value={formData.venueAddress} onChange={handleChange} placeholder="123 Wedding Lane..." className="w-full px-4 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none h-24 resize-none" />
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Select Wireframe Style</label>
                            {!isPremium && (
                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">3 Free / 22 Premium</span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {TEMPLATES.map((tmpl, index) => {
                                const isLocked = !isPremium && !['classic', 'romantic', 'tropical'].includes(tmpl.id);
                                return (
                                    <button
                                        key={tmpl.id}
                                        type="button"
                                        onClick={() => !isLocked && setFormData(prev => ({ ...prev, template: tmpl.id }))}
                                        className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 relative ${isLocked ? 'border-border bg-neutral/50 opacity-60 cursor-not-allowed' :
                                            formData.template === tmpl.id ? 'border-primary bg-primary/5' :
                                                'border-border bg-white hover:border-primary/30'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={`text-2xl ${isLocked ? 'grayscale' : ''}`}>{tmpl.icon}</span>
                                            {isLocked ? (
                                                <Sparkles className="w-3.5 h-3.5 text-primary" />
                                            ) : (
                                                formData.template === tmpl.id && <CheckCircle2 className="w-4 h-4 text-primary" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-foreground">{tmpl.name}</p>
                                            <p className="text-[10px] text-text-secondary leading-tight">{tmpl.desc}</p>
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
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Motif Color</label>
                            <div className="flex gap-4">
                                {['#D16C78', '#F2C1CC', '#D6B87C', '#3A2A2D', '#7A5A61', '#FFF8F4'].map((color) => (
                                    <button key={color} type="button" onClick={() => setFormData(prev => ({ ...prev, motifColor: color }))} className={`w-10 h-10 rounded-full border-4 transition-transform ${formData.motifColor === color ? 'border-white ring-2 ring-primary scale-110' : 'border-neutral'}`} style={{ backgroundColor: color }} />
                                ))}
                                <input type="color" name="motifColor" value={formData.motifColor} onChange={handleChange} className="w-10 h-10 rounded-full overflow-hidden border-none cursor-pointer" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Typography & Fonts</label>
                            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {FONTS.map((font, index) => {
                                    const isLocked = !isPremium && index >= 10;
                                    return (
                                        <button
                                            key={font.id}
                                            type="button"
                                            onClick={() => !isLocked && setFormData(prev => ({ ...prev, fontStyle: font.id }))}
                                            className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-1 relative ${isLocked ? 'border-border bg-neutral/50 opacity-60 cursor-not-allowed' :
                                                formData.fontStyle === font.id ? 'border-primary bg-primary/5' :
                                                    'border-border bg-white hover:border-primary/30'
                                                }`}
                                        >
                                            {isLocked && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-2xl backdrop-blur-[1px]">
                                                    <Sparkles className="w-5 h-5 text-primary" />
                                                </div>
                                            )}
                                            <p className={`text-lg leading-none ${font.class}`}>{font.name}</p>
                                            <p className="text-[10px] text-text-secondary/70">{font.desc}</p>
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
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Wedding Quote</label>
                            <input name="quote" value={formData.quote} onChange={handleChange} placeholder="Love is patient..." className="w-full px-4 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Our Story</label>
                            <textarea name="story" value={formData.story} onChange={handleChange} placeholder="How we met..." className="w-full px-4 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none h-32 resize-none" />
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
                                                onClick={() => setFormData(prev => ({ ...prev, logoColor: color }))}
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
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-serif font-bold text-primary mb-4 flex items-center gap-2"><Heart className="w-5 h-5" /> Gift Registry</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Bank Name</label>
                                <input name="giftBank" value={formData.giftBank} onChange={handleChange} placeholder="GCash" className="w-full px-4 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Account number</label>
                                <input name="giftAccountNumber" value={formData.giftAccountNumber} onChange={handleChange} placeholder="0917..." className="w-full px-4 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Account name</label>
                            <input name="giftAccountName" value={formData.giftAccountName} onChange={handleChange} placeholder="Name" className="w-full px-4 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Upload QR</label>
                            <div className="relative h-48 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-neutral">
                                {previews.giftQr ? <img src={previews.giftQr} className="h-full object-contain" /> : <ImageIcon className="w-6 h-6 text-primary/40" />}
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'giftQr')} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">RSVP Deadline</label>
                            <input required type="date" name="rsvpDeadline" value={formData.rsvpDeadline} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Dress Code</label>
                            <input name="dressCode" value={formData.dressCode} onChange={handleChange} placeholder="Formal" className="w-full px-4 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Contact Person</label>
                            <input name="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder="Name" className="w-full px-4 py-3 rounded-xl border border-border bg-neutral focus:border-primary outline-none" />
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

            <div className="w-full max-w-2xl mx-auto p-6">
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 soft-shadow border border-primary/10">
                    <div className="flex justify-between items-center mb-12">
                        {STEPS.map((step, idx) => (
                            <div key={step.id} className="flex flex-col items-center relative flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${idx === currentStep ? 'bg-primary text-white scale-110 shadow-lg' : idx < currentStep ? 'bg-secondary text-foreground' : 'bg-neutral text-text-secondary border border-border'}`}>
                                    {idx < currentStep ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                                </div>
                                <span className={`text-[9px] uppercase tracking-widest mt-3 font-bold ${idx === currentStep ? 'text-primary' : 'text-text-secondary'}`}>{step.title}</span>
                                {idx < STEPS.length - 1 && <div className={`absolute top-5 left-[60%] w-[80%] h-[2px] -z-0 ${idx < currentStep ? 'bg-secondary' : 'bg-border'}`} />}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <AnimatePresence mode="wait">
                            <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="min-h-[300px]">
                                {renderStep()}
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex justify-between items-center pt-8 border-t border-border">
                            <button type="button" onClick={prevStep} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-primary font-bold ${currentStep === 0 ? 'opacity-0' : 'hover:bg-neutral'}`}>
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <button type="submit" disabled={isSubmitting} className="bg-primary text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-hover shadow-lg disabled:opacity-50">
                                {isSubmitting ? 'Processing...' : currentStep === STEPS.length - 1 ? <>{editId ? 'Update Invitation' : 'Create Invitation'} <Send className="w-5 h-5" /></> : <>Next Step <ArrowRight className="w-5 h-5" /></>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
