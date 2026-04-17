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
            link.download = `quickweds_${filename}_${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error("Download failed:", err);
            // Fallback: open in new tab
            window.open(url, '_blank');
        }
    };

    const generateCode = async () => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        try {
            const { data, error } = await supabase.from('photo_sharing_codes').insert({
                wedding_id: weddingId,
                code,
                is_active: true
            }).select().single();

            if (error) throw error;
            if (data) setCodes([...codes, data]);
        } catch (err: any) {
            alert("Failed to generate code: " + err.message);
        }
    };

    const toggleCode = async (codeId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase.from('photo_sharing_codes').update({ is_active: !currentStatus }).eq('id', codeId);
            if (error) throw error;
            setCodes(codes.map(c => c.id === codeId ? { ...c, is_active: !currentStatus } : c));
        } catch (err) {
            alert("Failed to toggle code");
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
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] soft-shadow border border-border">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-text-secondary font-serif italic">Loading photo portal...</p>
            </div>
        );
    }

    const pendingPhotos = photos.filter(p => !p.is_approved);
    const approvedPhotos = photos.filter(p => p.is_approved);

    return (
        <div className="space-y-8">
            {/* Header & Codes */}
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 soft-shadow border border-border">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Photo Sharing Portal</h2>
                        <p className="text-sm text-text-secondary mt-1">Manage guest uploads and sharing access. Approve photos to display them publicly.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <a 
                            href={`/w/${weddingId}/photos`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral text-foreground rounded-2xl font-bold hover:bg-neutral/80 transition-all border border-border hover:shadow-sm"
                        >
                            <ExternalLink className="w-4 h-4" /> Public Guest Portal
                        </a>
                        <button 
                            onClick={generateCode}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all active:translate-y-0"
                        >
                            <Plus className="w-5 h-5" /> Generate Access Code
                        </button>
                    </div>
                </div>

                {/* Access Codes List */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4 flex items-center gap-2">
                        <Key className="w-4 h-4 opacity-70" /> 
                        Active Access Codes
                    </h3>
                    {codes.length === 0 ? (
                        <div className="p-8 border-2 border-dashed border-border rounded-3xl text-center bg-neutral/30">
                            <Shield className="w-10 h-10 text-text-secondary opacity-30 mx-auto mb-3" />
                            <p className="text-sm text-text-secondary font-medium">No access codes generated yet.</p>
                            <p className="text-xs text-text-secondary mt-1">Generate a code to let guests upload photos securely.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {codes.map(code => (
                                <div key={code.id} className="p-4 bg-white rounded-2xl border border-border flex items-center justify-between shadow-sm hover:border-primary/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2.5 h-2.5 rounded-full ${code.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                        <span className="font-mono font-bold text-lg tracking-wider text-foreground">{code.code}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => toggleCode(code.id, code.is_active)}
                                            className={`p-2 rounded-xl transition-colors ${code.is_active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-text-secondary hover:bg-neutral'}`}
                                            title={code.is_active ? "Currently Active - Click to Pause" : "Paused - Click to Activate"}
                                        >
                                            <Shield className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => deleteCode(code.id)}
                                            className="p-2 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"
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

            {/* Photo Moderation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Approval */}
                <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 soft-shadow border border-border flex flex-col h-[700px]">
                    <div className="flex items-center justify-between mb-6 shrink-0">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
                                <RefreshCw className="w-5 h-5 text-amber-500" />
                                Pending Approval
                            </h3>
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold shadow-sm">
                                {pendingPhotos.length}
                            </span>
                        </div>
                        {pendingPhotos.length > 1 && (
                            <button 
                                onClick={approveAllPending}
                                className="text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors"
                            >
                                Approve All
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {pendingPhotos.length === 0 ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 flex flex-col items-center justify-center text-center text-text-secondary">
                                    <CheckCircle2 className="w-16 h-16 mb-4 text-neutral-300" />
                                    <p className="font-serif text-lg text-foreground">You're all caught up!</p>
                                    <p className="text-sm mt-1">No photos waiting for approval.</p>
                                </motion.div>
                            ) : (
                                pendingPhotos.map(photo => (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0 }}
                                        key={photo.id} 
                                        className="flex gap-4 p-4 rounded-2xl border border-border bg-neutral/10 hover:border-primary/20 transition-colors"
                                    >
                                        <div 
                                            className="w-28 h-28 rounded-xl overflow-hidden bg-neutral shrink-0 relative group cursor-pointer"
                                            onClick={() => setSelectedPhoto(photo)}
                                        >
                                            <img src={photo.cloudinary_url} alt="Guest Upload" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Maximize2 className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div>
                                                <p className="font-bold text-sm truncate text-foreground">{photo.uploader_name || 'Anonymous Guest'}</p>
                                                <p className="text-xs text-text-secondary line-clamp-2 mt-1 italic">
                                                    {photo.caption ? `"${photo.caption}"` : 'No caption provided.'}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 mt-3">
                                                <button 
                                                    onClick={() => approvePhoto(photo.id)}
                                                    className="flex-1 bg-emerald-500 text-white py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors shadow-sm"
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={() => deletePhoto(photo.id)}
                                                    className="px-4 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
                                                    title="Delete permanently"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Approved Gallery */}
                <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 soft-shadow border border-border flex flex-col h-[700px]">
                    <div className="flex items-center justify-between mb-6 shrink-0">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-primary" />
                                Live Gallery
                            </h3>
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold shadow-sm">
                                {approvedPhotos.length}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 auto-rows-max">
                            {approvedPhotos.length === 0 ? (
                                <div className="col-span-full py-32 flex flex-col items-center justify-center text-center text-text-secondary">
                                    <Camera className="w-16 h-16 mb-4 text-neutral-300" />
                                    <p className="font-serif text-lg text-foreground">Your gallery is empty</p>
                                    <p className="text-sm mt-1">Approve photos from guests to build your gallery.</p>
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {approvedPhotos.map(photo => (
                                        <motion.div 
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            key={photo.id} 
                                            className="aspect-square rounded-2xl overflow-hidden bg-neutral relative group cursor-pointer border border-border/50"
                                            onClick={() => setSelectedPhoto(photo)}
                                        >
                                            <img src={photo.cloudinary_url} alt="Approved Photo" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            
                                            {/* Hover Actions */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end pointer-events-none">
                                                <p className="text-white text-xs font-bold truncate drop-shadow-md">{photo.uploader_name}</p>
                                            </div>

                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); downloadPhoto(photo.cloudinary_url, photo.uploader_name || 'photo'); }}
                                                    className="p-1.5 bg-white/90 backdrop-blur text-foreground rounded-lg hover:bg-white transition-colors shadow-sm"
                                                    title="Download High-Res"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); deletePhoto(photo.id); }}
                                                    className="p-1.5 bg-red-500/90 backdrop-blur text-white rounded-lg hover:bg-red-500 transition-colors shadow-sm"
                                                    title="Remove from Gallery"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* FULL SCREEN LIGHTBOX */}
            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-md"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <button 
                            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                            onClick={() => setSelectedPhoto(null)}
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="w-full max-w-5xl h-full flex flex-col md:flex-row items-center justify-center gap-8" onClick={e => e.stopPropagation()}>
                            <motion.img 
                                layoutId={`photo-${selectedPhoto.id}`}
                                src={selectedPhoto.cloudinary_url} 
                                alt="Expanded view" 
                                className="max-h-[70vh] md:max-h-[85vh] w-auto max-w-full rounded-xl shadow-2xl object-scale-down"
                            />
                            
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl text-white max-w-sm w-full shrink-0">
                                <h4 className="text-xs uppercase tracking-widest text-white/50 font-bold mb-1">Uploaded By</h4>
                                <p className="text-xl font-serif font-bold mb-6">{selectedPhoto.uploader_name || 'Anonymous Guest'}</p>
                                
                                {selectedPhoto.caption && (
                                    <>
                                        <h4 className="text-xs uppercase tracking-widest text-white/50 font-bold mb-1">Caption</h4>
                                        <p className="text-sm italic text-white/90 mb-8 leading-relaxed">"{selectedPhoto.caption}"</p>
                                    </>
                                )}

                                <div className="space-y-3 pt-6 border-t border-white/10">
                                    {!selectedPhoto.is_approved && (
                                        <button 
                                            onClick={() => { approvePhoto(selectedPhoto.id); setSelectedPhoto(null); }}
                                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Check className="w-5 h-5" /> Approve Photo
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => downloadPhoto(selectedPhoto.cloudinary_url, selectedPhoto.uploader_name || 'photo')}
                                        className="w-full py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-5 h-5" /> Download Full Res
                                    </button>
                                    <button 
                                        onClick={() => { deletePhoto(selectedPhoto.id); }}
                                        className="w-full py-3 bg-red-500/20 hover:bg-red-500/40 text-red-300 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-5 h-5" /> Delete Photo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
