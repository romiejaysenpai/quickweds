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
        <div className="space-y-6 sm:space-y-8">
            {/* Header & Codes */}
            <div className="bg-white dark:bg-white/5 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 md:p-10 soft-shadow border border-border">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 sm:mb-10">
                    <div className="min-w-0">
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Photo Sharing Portal</h2>
                        <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-xl">Manage guest uploads and sharing access. Approve photos to display them publicly.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3 w-full md:w-auto">
                        <a 
                            href={`/w/${weddingId}/photos`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 bg-neutral dark:bg-neutral/40 text-foreground text-xs sm:text-sm rounded-xl sm:rounded-2xl font-bold hover:bg-neutral/80 transition-all border border-border min-h-[44px]"
                        >
                            <ExternalLink className="w-4 h-4" /> Guest Gallery
                        </a>
                        <button 
                            onClick={generateCode}
                            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white text-xs sm:text-sm rounded-xl sm:rounded-2xl font-bold hover:shadow-lg transition-all min-h-[44px]"
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
                                <div key={code.id} className="p-4 bg-white dark:bg-white/5 rounded-xl sm:rounded-2xl border border-border flex items-center justify-between shadow-sm hover:border-primary/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${code.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                        <span className="font-mono font-bold text-base sm:text-lg tracking-wider text-foreground">{code.code}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => toggleCode(code.id, code.is_active)}
                                            className={`p-2 rounded-lg sm:rounded-xl transition-colors ${code.is_active ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10' : 'text-text-secondary hover:bg-neutral dark:hover:bg-neutral/40'}`}
                                            title={code.is_active ? "Pause" : "Activate"}
                                        >
                                            {code.is_active ? <Check className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                                        </button>
                                        <button 
                                            onClick={() => deleteCode(code.id)}
                                            className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg sm:rounded-xl transition-colors"
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
            <div className="bg-white dark:bg-white/5 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 md:p-10 soft-shadow border border-border">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-border/50 pb-6">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Photo Queue</h2>
                        <p className="text-xs sm:text-sm text-text-secondary mt-1">Found {pendingPhotos.length} photos waiting for your approval.</p>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        <AnimatePresence>
                            {pendingPhotos.map((photo) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={photo.id} 
                                    className="group relative aspect-square bg-neutral dark:bg-neutral/20 rounded-2xl overflow-hidden border border-border"
                                >
                                    <img src={photo.cloudinary_url} alt="Guest upload" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => approvePhoto(photo.id)} className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:scale-110 transition-transform"><Check className="w-5 h-5" /></button>
                                            <button onClick={() => deletePhoto(photo.id)} className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform"><Trash2 className="w-5 h-5" /></button>
                                        </div>
                                        <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest text-center mt-2 line-clamp-1">{photo.uploader_name || 'Anonymous'}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Approved Gallery */}
            <div className="bg-white dark:bg-white/5 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 md:p-10 soft-shadow border border-border">
                <div className="mb-8 p-3 bg-neutral/40 dark:bg-neutral/10 rounded-xl sm:rounded-2xl border border-border/50 flex justify-between items-center">
                    <h3 className="font-bold text-foreground text-xs sm:text-base px-2">Approved Gallery ({approvedPhotos.length})</h3>
                    <button onClick={loadData} className="p-2 text-text-secondary hover:text-primary transition-colors"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
                </div>

                {approvedPhotos.length === 0 ? (
                    <div className="py-12 sm:py-20 text-center opacity-40 italic font-serif">
                        <p>No photos have been approved yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
                        {approvedPhotos.map((photo) => (
                            <div key={photo.id} className="group relative aspect-square bg-neutral dark:bg-neutral/20 rounded-lg sm:rounded-xl overflow-hidden cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
                                <img src={photo.cloudinary_url} alt="Wedding gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Maximize2 className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedPhoto && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center">
                            <div className="absolute top-0 right-0 p-4 z-10 flex gap-2">
                                <button onClick={() => downloadPhoto(selectedPhoto.cloudinary_url, `quickweds-${selectedPhoto.id}.jpg`)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 text-white backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all"><Download className="w-5 h-5" /></button>
                                <button onClick={() => deletePhoto(selectedPhoto.id)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-500/20 text-red-500 backdrop-blur-md flex items-center justify-center hover:bg-red-500/40 transition-all"><Trash2 className="w-5 h-5" /></button>
                                <button onClick={() => setSelectedPhoto(null)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 text-white backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all"><X className="w-5 h-5" /></button>
                            </div>
                            <img src={selectedPhoto.cloudinary_url} alt="Wedding Gallery Large" className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-lg" />
                            <div className="mt-6 text-center text-white">
                                <p className="text-xl font-serif font-bold">{selectedPhoto.uploader_name || 'Anonymous Guest'}</p>
                                {selectedPhoto.caption && <p className="mt-2 text-white/60 italic">&ldquo;{selectedPhoto.caption}&rdquo;</p>}
                                <p className="mt-4 text-[10px] uppercase tracking-widest text-white/40">{new Date(selectedPhoto.created_at).toLocaleDateString()}</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
