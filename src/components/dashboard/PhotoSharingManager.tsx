'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Camera, Plus, Trash2, Check, X, Loader2, ExternalLink,
    Image as ImageIcon, Shield, Key, RefreshCw, Download, 
    Maximize2, CheckCircle2
} from 'lucide-react';

interface Photo {
    id: string;
    cloudinary_url: string;
    uploader_name: string;
    caption: string;
    is_approved: boolean;
    created_at: string;
}

interface SharingCode {
    id: string;
    code: string;
    is_active: boolean;
    expires_at: string;
}

export default function PhotoSharingManager({ weddingId }: { weddingId: string }) {
    const [loading, setLoading] = useState(true);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [codes, setCodes] = useState<SharingCode[]>([]);
    
    // Lightbox State
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

    useEffect(() => {
        loadData();
    }, [weddingId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [photosRes, codesRes] = await Promise.all([
                supabase.from('wedding_photos').select('*').eq('wedding_id', weddingId).order('created_at', { ascending: false }),
                supabase.from('photo_sharing_codes').select('*').eq('wedding_id', weddingId)
            ]);

            if (photosRes.data) setPhotos(photosRes.data);
            if (codesRes.data) setCodes(codesRes.data);
        } catch (err) {
            console.error("Error loading photo data:", err);
        } finally {
            setLoading(false);
        }
    };

    const approvePhoto = async (photoId: string) => {
        try {
            const { error } = await supabase.from('wedding_photos').update({ is_approved: true, approved_at: new Date().toISOString() }).eq('id', photoId);
            if (error) throw error;
            setPhotos(photos.map(p => p.id === photoId ? { ...p, is_approved: true } : p));
        } catch (err) {
            alert("Failed to approve photo");
        }
    };

    const approveAllPending = async () => {
        const pending = photos.filter(p => !p.is_approved);
        if (pending.length === 0) return;
        if (!confirm(`Are you sure you want to instantly approve all ${pending.length} pending photos?`)) return;

        try {
            const pendingIds = pending.map(p => p.id);
            const { error } = await supabase.from('wedding_photos').update({ is_approved: true, approved_at: new Date().toISOString() }).in('id', pendingIds);
            if (error) throw error;
            
            setPhotos(photos.map(p => p.is_approved ? p : { ...p, is_approved: true }));
        } catch (err) {
            alert("Failed to approve all photos");
        }
    };

    const deletePhoto = async (photoId: string) => {
        if (!confirm("Are you sure you want to delete this photo permanently?")) return;
        try {
            const { error } = await supabase.from('wedding_photos').delete().eq('id', photoId);
            if (error) throw error;
            setPhotos(photos.filter(p => p.id !== photoId));
            if (selectedPhoto?.id === photoId) setSelectedPhoto(null);
        } catch (err) {
            alert("Failed to delete photo");
        }
    };

    const downloadPhoto = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            alert("Failed to download photo");
        }
    };

    const toggleCode = async (codeId: string, current: boolean) => {
        try {
            const { error } = await supabase.from('photo_sharing_codes').update({ is_active: !current }).eq('id', codeId);
            if (error) throw error;
            setCodes(codes.map(c => c.id === codeId ? { ...c, is_active: !current } : c));
        } catch (err) {
            alert("Failed to update sharing code");
        }
    };

    const generateCode = async () => {
        const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        try {
            const { data, error } = await supabase.from('photo_sharing_codes').insert({
                wedding_id: weddingId,
                code: newCode,
                is_active: true
            }).select().single();
            
            if (error) throw error;
            if (data) setCodes([...codes, data]);
        } catch (err) {
            alert("Failed to generate code");
        }
    };

    const deleteCode = async (codeId: string) => {
        if (!confirm("Are you sure? Guests using this code won't be able to upload anymore.")) return;
        try {
            const { error } = await supabase.from('photo_sharing_codes').delete().eq('id', codeId);
            if (error) throw error;
            setCodes(codes.filter(c => c.id !== codeId));
        } catch (err) {
            alert("Failed to delete code");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-white/5 rounded-2xl sm:rounded-[2.5rem] soft-shadow border border-border">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-text-secondary font-serif italic">Loading photo portal...</p>
            </div>
        );
    }

    const pendingPhotos = photos.filter(p => !p.is_approved);
    const approvedPhotos = photos.filter(p => p.is_approved);

    return (
        <div className="space-y-5 sm:space-y-8">
            {/* Header & Codes */}
            <div className="rounded-2xl border border-border bg-white p-4 soft-shadow dark:bg-white/5 sm:rounded-[2rem] sm:p-8 md:p-10">
                <div className="mb-6 flex flex-col items-start gap-5 sm:mb-10 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                        <h2 className="font-serif text-2xl font-bold leading-tight text-foreground sm:text-3xl">Photo Sharing Portal</h2>
                        <p className="mt-1 max-w-xl text-xs leading-5 text-text-secondary sm:text-sm">Manage guest uploads and sharing access. Approve photos to display them publicly.</p>
                    </div>
                    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:w-auto">
                        <a 
                            href={`/w/${weddingId}/photos`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-border bg-neutral px-4 py-3 text-sm font-bold text-foreground transition-all hover:bg-neutral/80 dark:bg-neutral/40"
                        >
                            <ExternalLink className="w-4 h-4" /> Guest Gallery
                        </a>
                        <button 
                            onClick={generateCode}
                            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition-all hover:shadow-lg"
                        >
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> New Code
                        </button>
                    </div>
                </div>

                {/* Access Codes List */}
                <div className="space-y-4">
                    <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-text-secondary mb-4 flex items-center gap-2">
                        <Key className="w-4 h-4 opacity-70" /> 
                        Active Access Codes
                    </h3>
                    {codes.length === 0 ? (
                        <div className="p-8 border-2 border-dashed border-border rounded-2xl sm:rounded-3xl text-center bg-neutral/30 dark:bg-neutral/10">
                            <Shield className="w-10 h-10 text-text-secondary opacity-30 mx-auto mb-3" />
                            <p className="text-xs sm:text-sm text-text-secondary font-medium">No access codes generated yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                            {codes.map(code => (
                                <div key={code.id} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border bg-white p-4 shadow-sm transition-colors hover:border-primary/30 dark:bg-white/5 sm:rounded-2xl">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${code.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                        <span className="min-w-0 font-mono text-base font-bold tracking-wider text-foreground sm:text-lg">{code.code}</span>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1">
                                        <button 
                                            onClick={() => toggleCode(code.id, code.is_active)}
                                            className={`min-h-10 min-w-10 rounded-lg p-2 transition-colors sm:rounded-xl ${code.is_active ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10' : 'text-text-secondary hover:bg-neutral dark:hover:bg-neutral/40'}`}
                                            title={code.is_active ? "Pause" : "Activate"}
                                        >
                                            {code.is_active ? <Check className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                                        </button>
                                        <button 
                                            onClick={() => deleteCode(code.id)}
                                            className="min-h-10 min-w-10 rounded-lg p-2 text-text-secondary transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 sm:rounded-xl"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Moderation Queue */}
            <div className="rounded-2xl border border-border bg-white p-4 soft-shadow dark:bg-white/5 sm:rounded-[2rem] sm:p-8 md:p-10">
                <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-border/50 pb-5 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                        <h2 className="font-serif text-2xl font-bold leading-tight text-foreground sm:text-3xl">Photo Queue</h2>
                        <p className="mt-1 text-xs leading-5 text-text-secondary sm:text-sm">Found {pendingPhotos.length} photos waiting for your approval.</p>
                    </div>
                    {pendingPhotos.length > 0 && (
                        <button 
                            onClick={approveAllPending}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white rounded-xl sm:rounded-2xl font-bold hover:shadow-lg transition-all text-sm min-h-[44px]"
                        >
                            <CheckCircle2 className="w-4 h-4" /> Approve All
                        </button>
                    )}
                </div>

                {pendingPhotos.length === 0 ? (
                    <div className="py-12 sm:py-20 text-center opacity-40 italic font-serif">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4" />
                        <p>No pending photos to moderate.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                        <AnimatePresence>
                            {pendingPhotos.map((photo) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={photo.id} 
                                    className="group relative overflow-hidden rounded-2xl border border-border bg-neutral dark:bg-neutral/20"
                                >
                                    <div className="aspect-square">
                                        <img src={photo.cloudinary_url} alt="Guest upload" className="h-full w-full object-cover" />
                                    </div>
                                    <div className="flex items-center justify-between gap-3 bg-white p-3 dark:bg-neutral/20 sm:absolute sm:inset-0 sm:flex-col sm:justify-center sm:bg-black/60 sm:p-4 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                                        <p className="min-w-0 truncate text-xs font-bold text-foreground sm:mt-2 sm:text-center sm:text-[10px] sm:uppercase sm:tracking-widest sm:text-white/80">{photo.uploader_name || 'Anonymous'}</p>
                                        <div className="flex shrink-0 gap-2">
                                            <button onClick={() => approvePhoto(photo.id)} className="flex h-10 min-w-10 items-center justify-center gap-1 rounded-xl bg-emerald-500 px-3 text-xs font-bold text-white transition-transform hover:scale-105">
                                                <Check className="h-5 w-5" />
                                                <span className="sm:hidden">Approve</span>
                                            </button>
                                            <button onClick={() => deletePhoto(photo.id)} className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-red-500 px-3 text-white transition-transform hover:scale-105" aria-label="Delete photo">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Approved Gallery */}
            <div className="rounded-2xl border border-border bg-white p-4 soft-shadow dark:bg-white/5 sm:rounded-[2rem] sm:p-8 md:p-10">
                <div className="mb-6 flex items-center justify-between rounded-xl border border-border/50 bg-neutral/40 p-3 dark:bg-neutral/10 sm:mb-8 sm:rounded-2xl">
                    <h3 className="min-w-0 px-1 text-sm font-bold text-foreground sm:px-2 sm:text-base">Approved Gallery ({approvedPhotos.length})</h3>
                    <button onClick={loadData} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-text-secondary transition-colors hover:text-primary" aria-label="Refresh approved gallery"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
                </div>

                {approvedPhotos.length === 0 ? (
                    <div className="py-12 sm:py-20 text-center opacity-40 italic font-serif">
                        <p>No photos have been approved yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {approvedPhotos.map((photo) => (
                            <button type="button" key={photo.id} className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-neutral text-left dark:bg-neutral/20 sm:rounded-xl" onClick={() => setSelectedPhoto(photo)} aria-label="Open approved guest photo">
                                <img src={photo.cloudinary_url} alt="Wedding gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-100 transition-opacity sm:bg-black/40 sm:opacity-0 sm:group-hover:opacity-100">
                                    <Maximize2 className="w-5 h-5 text-white" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedPhoto && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3 backdrop-blur-md sm:p-6">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center">
                            <div className="absolute right-0 top-0 z-10 flex gap-2 p-2 sm:p-4">
                                <button onClick={() => downloadPhoto(selectedPhoto.cloudinary_url, `quickweds-${selectedPhoto.id}.jpg`)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 text-white backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all"><Download className="w-5 h-5" /></button>
                                <button onClick={() => deletePhoto(selectedPhoto.id)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-500/20 text-red-500 backdrop-blur-md flex items-center justify-center hover:bg-red-500/40 transition-all"><Trash2 className="w-5 h-5" /></button>
                                <button onClick={() => setSelectedPhoto(null)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 text-white backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all"><X className="w-5 h-5" /></button>
                            </div>
                            <img src={selectedPhoto.cloudinary_url} alt="Wedding Gallery Large" className="max-h-[72vh] max-w-full rounded-lg object-contain shadow-2xl sm:max-h-[80vh]" />
                            <div className="mt-4 max-w-full text-center text-white sm:mt-6">
                                <p className="break-words font-serif text-lg font-bold sm:text-xl">{selectedPhoto.uploader_name || 'Anonymous Guest'}</p>
                                {selectedPhoto.caption && <p className="mt-2 break-words text-sm italic text-white/60">&ldquo;{selectedPhoto.caption}&rdquo;</p>}
                                <p className="mt-4 text-[10px] uppercase tracking-widest text-white/40">{new Date(selectedPhoto.created_at).toLocaleDateString()}</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
