'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, MapPin, Palette, CheckCircle2, ArrowRight, ArrowLeft, Send, Camera, Image as ImageIcon, Video, X, Layout } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import GenerationLoading from './GenerationLoading';
import { useAuth } from '@/context/AuthContext';

const STEPS = [
    { id: 'details', title: 'Details', icon: Heart },
    { id: 'templates', title: 'Layout', icon: Layout },
    { id: 'theme', title: 'Style', icon: Palette },
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
    { id: 'Paris', name: 'Parisian', desc: 'Parisienne (Vintage)', class: 'font-parisienne' }
];

const TEMPLATES = [
    { id: 'classic', name: 'Classic Elegance', desc: 'Timeless, centered layout with elegant serif typography.', icon: '✨' },
    { id: 'minimal', name: 'Modern Minimal', desc: 'Clean lines, high contrast, and bold sans-serif fonts.', icon: '⬛' },
    { id: 'vintage', name: 'Vintage Love', desc: 'Soft textures, script fonts, and nostalgic framing.', icon: '📜' },
    { id: 'artdeco', name: 'Art Deco Gold', desc: 'Geometric patterns and bold, luxurious accents.', icon: '💎' },
    { id: 'boho', name: 'Boho Dream', desc: 'Organic shapes, earthy tones, and whimsical layouts.', icon: '🌿' },
    { id: 'editorial', name: 'Editorial', desc: 'Magazine-style layout with large typography.', icon: '📖' },
    { id: 'royal', name: 'Royal Grandeur', desc: 'Ornate details and traditional, majestic styling.', icon: '👑' },
    { id: 'whimsical', name: 'Whimsical Garden', desc: 'Playful animations and soft, watercolor elements.', icon: '🌸' },
    { id: 'urban', name: 'Industrial Urban', desc: 'Raw textures and modern, edgy monospaced fonts.', icon: '🏙️' },
    { id: 'tropical', name: 'Tropical Paradise', desc: 'Vibrant accents and lush, exotic design elements.', icon: '🏝️' },
    { id: 'midnight', name: 'Midnight Luxury', desc: 'Premium dark aesthetic with gold foil accents.', icon: '🌑' },
    { id: 'sakura', name: 'Sakura Blossom', desc: 'Soft pinks, cherry blossoms, and gentle floating petals.', icon: '🌸' },
    { id: 'vogue', name: 'High Fashion', desc: 'Bold typography, asymmetrical layouts, and editorial chic.', icon: '👠' },
    { id: 'rustic', name: 'Rustic Charm', desc: 'Warm wood textures, string lights, and cozy vibes.', icon: '🪵' },
    { id: 'film', name: 'Retro Film', desc: 'Analog photography aesthetic with grain and film borders.', icon: '🎞️' },
    { id: 'glitch', name: 'Cyber Glitch', desc: 'Modern digital art style with chromatic aberration.', icon: '👾' },
    { id: 'garden', name: 'Secret Garden', desc: 'Lush greenery, trellis patterns, and botanical elegance.', icon: '🍃' }
];

export default function BuilderForm() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
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

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

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
            setMediaFiles(prev => ({ ...prev, galleryImages: [...prev.galleryImages, ...Array.from(files)] }));
        } else {
            const file = files[0];
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
            const weddingId = uuidv4().slice(0, 8);
            const uploadToFirebase = async (file: File, folder: string) => {
                const filename = `${folder}-${file.name.replace(/\s+/g, '_')}`;
                const storageRef = ref(storage, `quickweds/${user.uid}/${weddingId}/${filename}`);
                await uploadBytes(storageRef, file);
                return await getDownloadURL(storageRef);
            };

            let heroUrl = null;
            let coupleUrl = null;
            let videoUrl = null;
            let giftQrUrl = null;
            const galleryUrls: string[] = [];

            if (mediaFiles.heroImage) heroUrl = await uploadToFirebase(mediaFiles.heroImage, 'hero');
            if (mediaFiles.couplePhoto) coupleUrl = await uploadToFirebase(mediaFiles.couplePhoto, 'couple');
            if (mediaFiles.teaserVideo) videoUrl = await uploadToFirebase(mediaFiles.teaserVideo, 'teaser');
            if (mediaFiles.giftQr) giftQrUrl = await uploadToFirebase(mediaFiles.giftQr, 'gift-qr');

            for (let i = 0; i < mediaFiles.galleryImages.length; i++) {
                const url = await uploadToFirebase(mediaFiles.galleryImages[i], `gallery-${i}`);
                galleryUrls.push(url);
            }

            const payload = {
                id: weddingId,
                userId: user.uid,
                ...formData,
                heroImage: heroUrl,
                couplePhoto: coupleUrl,
                teaserVideo: videoUrl,
                giftQrImage: giftQrUrl,
                galleryImages: galleryUrls
            };

            const res = await fetch('/api/weddings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const contentType = res.headers.get('content-type');
            if (!res.ok) {
                let errorMessage = `Server error (${res.status})`;
                try {
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await res.json();
                        errorMessage = errorData.error || errorMessage;
                    } else {
                        const text = await res.text();
                        errorMessage = `Server returned an unexpected response (${res.status})`;
                    }
                } catch (e) { console.error(e); }
                throw new Error(errorMessage);
            }

            const data = await res.json();
            if (data.success) {
                router.push(`/dashboard/${data.id}?created=true`);
            } else {
                throw new Error(data.error || 'Unknown server error');
            }
        } catch (err: any) {
            console.error('Submission error:', err);
            setIsGenerating(false);
            alert('Error creating invitation: ' + err.message);
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
                    <div className="space-y-4">
                        <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Select Wireframe Style</label>
                        <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {TEMPLATES.map((tmpl) => (
                                <button key={tmpl.id} type="button" onClick={() => setFormData(prev => ({ ...prev, template: tmpl.id }))} className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${formData.template === tmpl.id ? 'border-primary bg-primary/5' : 'border-border bg-white hover:border-primary/30'}`}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl">{tmpl.icon}</span>
                                        {formData.template === tmpl.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-foreground">{tmpl.name}</p>
                                        <p className="text-[10px] text-text-secondary leading-tight">{tmpl.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
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
                                <input type="color" name="motifColor" value={formData.motifColor} onChange={handleChange} className="w-10 h-10 rounded-full overflow-hidden border-none" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Typography & Fonts</label>
                            <div className="grid grid-cols-2 gap-3">
                                {FONTS.slice(0, 10).map((font) => (
                                    <button key={font.id} type="button" onClick={() => setFormData(prev => ({ ...prev, fontStyle: font.id }))} className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-1 ${formData.fontStyle === font.id ? 'border-primary bg-primary/5' : 'border-border bg-white hover:border-primary/30'}`}>
                                        <p className={`text-lg leading-none ${font.class}`}>{font.name}</p>
                                        <p className="text-[10px] text-text-secondary/70">{font.desc}</p>
                                    </button>
                                ))}
                            </div>
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
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Gallery</label>
                            <div className="grid grid-cols-4 gap-4">
                                {mediaFiles.galleryImages.map((file, i) => (
                                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-border">
                                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                <div className="relative aspect-square rounded-xl border-2 border-dashed border-border bg-neutral flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-primary/40" />
                                    <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'galleryImages')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-serif font-bold text-primary mb-4 flex items-center gap-2"><Heart className="w-5 h-5" /> Gift Registry</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Bank Name</label>
                                <input name="giftBank" value={formData.giftBank} onChange={handleChange} placeholder="GCash" className="w-full px-4 py-3 rounded-xl border border-border" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Account number</label>
                                <input name="giftAccountNumber" value={formData.giftAccountNumber} onChange={handleChange} placeholder="0917..." className="w-full px-4 py-3 rounded-xl border border-border" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Account name</label>
                            <input name="giftAccountName" value={formData.giftAccountName} onChange={handleChange} placeholder="Name" className="w-full px-4 py-3 rounded-xl border border-border" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Upload QR</label>
                            <div className="relative h-48 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                                {previews.giftQr ? <img src={previews.giftQr} className="h-full object-contain" /> : <ImageIcon className="w-6 h-6 text-primary/40" />}
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'giftQr')} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">RSVP Deadline</label>
                            <input required type="date" name="rsvpDeadline" value={formData.rsvpDeadline} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Dress Code</label>
                            <input name="dressCode" value={formData.dressCode} onChange={handleChange} placeholder="Formal" className="w-full px-4 py-3 rounded-xl border border-border" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-text-secondary ml-1">Contact Person</label>
                            <input name="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder="Name" className="w-full px-4 py-3 rounded-xl border border-border" />
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
                                {isSubmitting ? 'Processing...' : currentStep === STEPS.length - 1 ? <>Create Invitation <Send className="w-5 h-5" /></> : <>Next Step <ArrowRight className="w-5 h-5" /></>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
