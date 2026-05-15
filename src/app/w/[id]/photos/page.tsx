'use client';

import { use, useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, Upload, X, Loader2, CheckCircle2, Maximize2 } from 'lucide-react';

type WeddingLite = {
    id: string;
    bride_name: string;
    groom_name: string;
};

type SharedPhoto = {
    id: string;
    cloudinary_url: string;
    caption: string | null;
    uploader_name: string | null;
};

export default function WeddingPhotoPortalPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: weddingId } = use(params);
    const [wedding, setWedding] = useState<WeddingLite | null>(null);
    const [photos, setPhotos] = useState<SharedPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Upload State
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    // Form State
    const [form, setForm] = useState({
        uploader_name: '',
        caption: '',
        code: '',
    });

    // Lightbox State
    const [selectedPhoto, setSelectedPhoto] = useState<SharedPhoto | null>(null);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);

    useEffect(() => {
        const load = async () => {
            const [weddingRes, photosRes] = await Promise.all([
                supabase.from('weddings').select('id, bride_name, groom_name').eq('id', weddingId).single(),
                supabase.from('wedding_photos').select('*').eq('wedding_id', weddingId).eq('is_approved', true).order('created_at', { ascending: false }),
            ]);
            if (weddingRes.data) setWedding(weddingRes.data);
            if (photosRes.data) setPhotos(photosRes.data);
            setLoading(false);
        };
        void load();
    }, [weddingId]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            // Create a local blob URL for live preview
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const clearSelection = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    async function submitPhoto(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedFile) return alert('Please select a photo first.');
        
        const normalizedCode = form.code.trim().toUpperCase();
        if (!normalizedCode) return alert('A sharing code is required to upload.');

        setSubmitting(true);
        try {
            // 1. Verify access code
            const { data: codeData, error: codeError } = await supabase
                .from('photo_sharing_codes')
                .select('*')
                .eq('wedding_id', weddingId)
                .eq('code', normalizedCode)
                .eq('is_active', true)
                .maybeSingle();

            if (codeError || !codeData) throw new Error('Invalid or inactive sharing code. Please check with the couple.');

            // 2. Upload file to Supabase Storage
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `guest-uploads/${weddingId}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('quickweds')
                .upload(fileName, selectedFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw new Error('Failed to upload image file.');

            // 3. Get the public URL
            const { data: { publicUrl } } = supabase.storage.from('quickweds').getPublicUrl(fileName);

            // 4. Save metadata to database
            const { error: dbError } = await supabase.from('wedding_photos').insert({
                wedding_id: weddingId,
                uploader_name: form.uploader_name || 'Guest',
                cloudinary_url: publicUrl, // using 'cloudinary_url' column to hold our Supabase URL for backwards compatibility
                cloudinary_public_id: fileName,
                caption: form.caption || null,
                is_approved: false, // Must be approved in dashboard
            });

            if (dbError) throw new Error('Failed to record photo details.');

            // Success state
            setSubmissionSuccess(true);
            setTimeout(() => {
                setSubmissionSuccess(false);
                clearSelection();
                setForm({ ...form, caption: '' }); // keep name and code for faster subsequent uploads
            }, 3000);

        } catch (error: any) {
            alert(error.message);
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-text-secondary font-serif text-lg animate-pulse">Loading gallery...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa] px-3 py-4 pb-24 sm:px-4 sm:py-12">
            <div className="mx-auto max-w-4xl space-y-5 sm:space-y-8">
                
                {/* Header Profile */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-white p-5 text-center soft-shadow sm:rounded-[2rem] sm:p-10">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-16 sm:w-16">
                        <Camera className="h-7 w-7 sm:h-8 sm:w-8" />
                    </div>
                    <h1 className="mb-3 break-words font-serif text-2xl font-bold leading-tight text-foreground sm:text-4xl">
                        {wedding?.bride_name} &amp; {wedding?.groom_name}
                    </h1>
                    <p className="mx-auto max-w-lg text-sm leading-6 text-text-secondary sm:text-lg">
                        We&apos;re so glad you&apos;re here. Snap a photo or share one from your gallery to help us remember this special day!
                    </p>
                </motion.div>

                {/* Upload Form Area */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative overflow-hidden rounded-2xl border border-border bg-white p-4 soft-shadow sm:rounded-[2rem] sm:p-10">
                    <AnimatePresence mode="wait">
                        {submissionSuccess ? (
                            <motion.div 
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="py-16 text-center flex flex-col items-center justify-center min-h-[400px]"
                            >
                                <CheckCircle2 className="w-20 h-20 text-emerald-400 mb-6 drop-shadow-md" />
                                <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Beautiful shot!</h2>
                                <p className="text-text-secondary">Your photo was sent directly to the couple.</p>
                            </motion.div>
                        ) : (
                            <motion.form 
                                key="form"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onSubmit={submitPhoto} 
                                className="space-y-5 sm:space-y-6"
                            >
                                <h2 className="text-xl font-serif font-bold text-foreground mb-2 flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-primary" /> Share a Memory
                                </h2>

                                {/* Hidden file input (used by both buttons below) */}
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />

                                {/* Step 1: Pre-selection UI vs Post-selection UI */}
                                {!selectedFile ? (
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.removeAttribute('capture');
                                                    fileInputRef.current.click();
                                                }
                                            }}
                                            className="group flex min-h-[116px] items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border px-4 text-text-secondary transition-colors hover:border-primary/50 hover:bg-neutral/30 hover:text-primary sm:h-32 sm:flex-col sm:px-2"
                                        >
                                            <ImageIcon className="h-7 w-7 shrink-0 opacity-60 transition-all group-hover:scale-110 group-hover:opacity-100 sm:h-8 sm:w-8" />
                                            <span className="font-bold text-sm">Choose from Gallery</span>
                                        </button>

                                        <button 
                                            type="button"
                                            onClick={() => {
                                                if (fileInputRef.current) {
                                                    // This prompts the camera directly on mobile phones
                                                    fileInputRef.current.setAttribute('capture', 'environment');
                                                    fileInputRef.current.click();
                                                }
                                            }}
                                            className="group flex min-h-[116px] items-center justify-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 text-primary transition-colors hover:bg-primary/10 sm:h-32 sm:flex-col sm:px-2"
                                        >
                                            <Camera className="h-7 w-7 shrink-0 transition-transform group-hover:scale-110 sm:h-8 sm:w-8" />
                                            <span className="font-bold text-sm">Take Photo Now</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="group relative flex max-h-[460px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-neutral shadow-inner">
                                        <img src={previewUrl!} alt="Preview" className="max-h-[460px] w-auto max-w-full object-contain" />
                                        
                                        <div className="absolute top-4 right-4 z-10">
                                            <button 
                                                type="button"
                                                onClick={clearSelection}
                                                className="p-2.5 bg-black/50 hover:bg-black/80 backdrop-blur-md text-white rounded-full shadow-lg transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    if (fileInputRef.current) { fileInputRef.current.removeAttribute('capture'); fileInputRef.current.click(); }
                                                }}
                                                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-sm font-bold text-foreground shadow-lg backdrop-blur-md transition-colors hover:bg-white sm:w-auto sm:rounded-full sm:px-6"
                                            >
                                                <ImageIcon className="w-4 h-4" /> Pick Different Photo
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Form Details (only shows strongly when a file is selected to keep cognitive load low initially) */}
                                <div className={`origin-top space-y-4 transition-all duration-500 ${selectedFile ? 'mt-5 h-auto scale-y-100 opacity-100 sm:mt-6' : 'pointer-events-none h-0 scale-y-95 overflow-hidden opacity-40'}`}>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="min-w-0">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1.5 ml-2">Sharing Code *</label>
                                            <input 
                                                required={!!selectedFile}
                                                value={form.code} 
                                                onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))} 
                                                placeholder="e.g. A1B2C" 
                                                className="min-h-[46px] w-full min-w-0 rounded-xl border border-border bg-neutral px-4 py-3.5 font-bold uppercase tracking-widest outline-none transition-all focus:border-primary focus:bg-white" 
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1.5 ml-2">Your Name</label>
                                            <input 
                                                value={form.uploader_name} 
                                                onChange={(e) => setForm((prev) => ({ ...prev, uploader_name: e.target.value }))} 
                                                placeholder="Who are you?" 
                                                className="min-h-[46px] w-full min-w-0 rounded-xl border border-border bg-neutral px-4 py-3.5 font-medium outline-none transition-all focus:border-primary focus:bg-white" 
                                            />
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1.5 ml-2">Add a Caption</label>
                                        <input 
                                            value={form.caption} 
                                            onChange={(e) => setForm((prev) => ({ ...prev, caption: e.target.value }))} 
                                            placeholder="Write a little note about this photo... (optional)" 
                                            className="min-h-[46px] w-full min-w-0 rounded-xl border border-border bg-neutral px-4 py-3.5 outline-none transition-all focus:border-primary focus:bg-white" 
                                        />
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={submitting} 
                                        className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-primary px-6 py-4 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 sm:text-lg"
                                    >
                                        {submitting ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</>
                                        ) : (
                                            <>Send to Couple <Upload className="w-5 h-5" /></>
                                        )}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Live Gallery Section */}
                <div className="mt-6 rounded-2xl border border-border bg-white p-4 soft-shadow sm:mt-8 sm:rounded-[2rem] sm:p-10">
                    <h2 className="mb-5 font-serif text-xl font-bold text-foreground sm:mb-6 sm:text-2xl">Approved Gallery Feed</h2>
                    {photos.length === 0 ? (
                        <div className="rounded-2xl border-2 border-dashed border-border/50 bg-neutral/30 px-4 py-14 text-center sm:rounded-[2rem] sm:py-16">
                            <ImageIcon className="w-12 h-12 mx-auto mb-3 text-text-secondary opacity-30" />
                            <p className="text-foreground font-bold">The gallery is waiting.</p>
                            <p className="text-text-secondary text-sm">Be the first to upload a photo and get it approved!</p>
                        </div>
                    ) : (
                        <div className="columns-1 gap-3 space-y-3 min-[420px]:columns-2 sm:columns-3">
                            <AnimatePresence>
                                {photos.map((photo) => (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={photo.id} 
                                        onClick={() => setSelectedPhoto(photo)}
                                        className="group relative cursor-pointer break-inside-avoid overflow-hidden rounded-2xl border border-border bg-neutral"
                                    >
                                        <img src={photo.cloudinary_url} alt={photo.caption || 'Wedding photo'} className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                                        
                                        {/* Overlay gradient for text legibility */}
                                        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                                            <div className="absolute top-3 right-3 bg-black/40 p-2 rounded-full backdrop-blur-sm">
                                                <Maximize2 className="w-4 h-4 text-white" />
                                            </div>
                                            <p className="text-xs font-bold text-white drop-shadow-md truncate">{photo.uploader_name || 'Guest'}</p>
                                            {photo.caption && <p className="text-[10px] text-white/80 line-clamp-2 mt-0.5">{photo.caption}</p>}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                <div className="pt-4 text-center">
                    <Link href={`/w/${weddingId}`} className="inline-flex items-center text-sm font-bold text-text-secondary hover:text-foreground transition-colors px-6 py-3 bg-white/50 backdrop-blur-sm rounded-full shadow-sm border border-border/50">
                        ← Back to Invitation
                    </Link>
                </div>
            </div>

            {/* FULL SCREEN LIGHTBOX VIEWER */}
            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-3 backdrop-blur-md sm:p-8"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <div className="pointer-events-none absolute right-0 top-0 z-10 flex w-full justify-end bg-gradient-to-b from-black/50 to-transparent p-3 sm:p-4">
                            <button 
                                className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-colors pointer-events-auto"
                                onClick={() => setSelectedPhoto(null)}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 w-full flex items-center justify-center overflow-hidden" onClick={e => e.stopPropagation()}>
                            <img 
                                src={selectedPhoto.cloudinary_url} 
                                alt="Expanded view" 
                                className="max-h-[68vh] w-auto max-w-full rounded-xl object-scale-down shadow-2xl sm:max-h-[75vh]"
                            />
                        </div>
                        
                        <div className="mt-4 max-h-[28vh] w-full max-w-2xl shrink-0 overflow-y-auto rounded-2xl border border-white/20 bg-white/10 p-4 text-white backdrop-blur-xl sm:mt-6 sm:rounded-3xl sm:p-6" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                                    <Camera className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-0.5">Uploaded By</h4>
                                    <p className="break-words font-serif text-lg font-bold leading-tight">{selectedPhoto.uploader_name || 'Anonymous Guest'}</p>
                                </div>
                            </div>
                            
                            {selectedPhoto.caption && (
                                <p className="mt-4 break-words rounded-2xl border border-white/10 bg-black/20 p-4 text-sm italic leading-relaxed text-white/90">&quot;{selectedPhoto.caption}&quot;</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
