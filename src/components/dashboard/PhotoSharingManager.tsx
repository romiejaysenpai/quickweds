'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Trash2, Check, X, Loader2, ExternalLink,
    ImageIcon, Key, RefreshCw, Download, 
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
    max_uploads?: number | null;
    current_uploads?: number | null;
}

export default function PhotoSharingManager({ weddingId }: { weddingId: string }) {
    const [loading, setLoading] = useState(true);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [codes, setCodes] = useState<SharingCode[]>([]);
    const [deletingCodeId, setDeletingCodeId] = useState<string | null>(null);
    
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
                supabase.from('photo_sharing_codes').select('id, code, is_active, expires_at, max_uploads, current_uploads').eq('wedding_id', weddingId)
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
            window.alert("Failed to approve photo");
        }
    };

    const approveAllPending = async () => {
        const pending = photos.filter(p => !p.is_approved);
        if (pending.length === 0) return;
        if (!window.confirm(`Are you sure you want to instantly approve all ${pending.length} pending photos?`)) return;

        try {
            const pendingIds = pending.map(p => p.id);
            const { error } = await supabase.from('wedding_photos').update({ is_approved: true, approved_at: new Date().toISOString() }).in('id', pendingIds);
            if (error) throw error;
            
            setPhotos(photos.map(p => p.is_approved ? p : { ...p, is_approved: true }));
        } catch (err) {
            window.alert("Failed to approve all photos");
        }
    };

    const deletePhoto = async (photoId: string) => {
        if (!window.confirm("Are you sure you want to delete this photo permanently?")) return;
        try {
            const { error } = await supabase.from('wedding_photos').delete().eq('id', photoId);
            if (error) throw error;
            setPhotos(photos.filter(p => p.id !== photoId));
            if (selectedPhoto?.id === photoId) setSelectedPhoto(null);
        } catch (err) {
            window.alert("Failed to delete photo");
        }
    };

    const toggleCode = async (codeId: string, current: boolean) => {
        try {
            const { error } = await supabase.from('photo_sharing_codes').update({ is_active: !current }).eq('id', codeId);
            if (error) throw error;
            setCodes(codes.map(c => c.id === codeId ? { ...c, is_active: !current } : c));
        } catch (err) {
            window.alert("Failed to update sharing code");
        }
    };

    const generateCode = async () => {
        const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const bytes = new Uint8Array(8);
        crypto.getRandomValues(bytes);
        const newCode = Array.from(bytes).map((byte) => alphabet[byte % alphabet.length]).join('');
        try {
            const { data, error } = await supabase.from('photo_sharing_codes').insert({
                wedding_id: weddingId,
                code: newCode,
                is_active: true,
                max_uploads: 3,
            }).select().single();
            
            if (error) throw error;
            if (data) setCodes([...codes, data]);
        } catch (err) {
            window.alert("Failed to generate code");
        }
    };

    const deleteCode = async (codeId: string) => {
        if (deletingCodeId) return;
        if (!window.confirm("Are you sure? Guests using this code won't be able to upload anymore.")) return;
        setDeletingCodeId(codeId);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                throw new Error('Please sign in again to delete this sharing code.');
            }

            const response = await fetch('/api/photos/sharing-codes', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ weddingId, id: codeId }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(result.error || 'Failed to delete sharing code.');
            }

            setCodes((currentCodes) => currentCodes.filter(c => c.id !== codeId));
        } catch (err) {
            console.error("Failed to delete code:", err);
            window.alert(`Failed to delete code: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setDeletingCodeId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-white/5 rounded-xl soft-shadow border border-border sm:rounded-2xl sm:py-16">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-3 sm:w-12 sm:h-12" />
                <p className="text-text-secondary font-serif text-xs italic sm:text-sm">Loading photo portal...</p>
            </div>
        );
    }

    const pendingPhotos = photos.filter(p => !p.is_approved);
    const approvedPhotos = photos.filter(p => p.is_approved);

    return (
        <div className="space-y-3 sm:space-y-4">
            {/* Header & Metrics */}
            <div className="rounded-xl border border-border bg-white p-3 soft-shadow dark:bg-white/5 sm:rounded-2xl sm:p-4">
                <div className="mb-3 flex flex-col items-start gap-2 sm:mb-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                        <h2 className="font-serif text-xl font-bold text-foreground sm:text-2xl">Photo Portal</h2>
                        <p className="mt-1 text-xs leading-5 text-text-secondary sm:text-sm">Manage uploads, monitor sharing codes, approve photos.</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <a 
                            href={`/w/${weddingId}/photos`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[36px] items-center justify-center gap-2 rounded-lg border border-border bg-neutral px-3 py-2 text-xs font-bold text-foreground transition-all hover:bg-neutral/80 dark:bg-neutral/40 flex-1 sm:flex-none whitespace-nowrap"
                        >
                            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" /> Gallery
                        </a>
                        <button 
                            type="button"
                            onClick={generateCode}
                            className="inline-flex min-h-[36px] items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white transition-all hover:shadow-lg flex-1 sm:flex-none whitespace-nowrap"
                        >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> New
                        </button>
                    </div>
                </div>

                {/* Metrics Grid - 2x2 on mobile, 4 across on larger */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div className="rounded-lg border border-border bg-neutral/40 p-2.5 sm:p-3">
                        <p className="text-[7px] font-black uppercase tracking-widest text-text-secondary sm:text-[8px]">Total codes</p>
                        <p className="mt-1 text-lg font-bold text-foreground sm:text-xl">{codes.length}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-neutral/40 p-2.5 sm:p-3">
                        <p className="text-[7px] font-black uppercase tracking-widest text-text-secondary sm:text-[8px]">Active</p>
                        <p className="mt-1 text-lg font-bold text-foreground sm:text-xl">{codes.filter((code) => code.is_active).length}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-neutral/40 p-2.5 sm:p-3">
                        <p className="text-[7px] font-black uppercase tracking-widest text-text-secondary sm:text-[8px]">Pending</p>
                        <p className="mt-1 text-lg font-bold text-foreground sm:text-xl">{pendingPhotos.length}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-neutral/40 p-2.5 sm:p-3">
                        <p className="text-[7px] font-black uppercase tracking-widest text-text-secondary sm:text-[8px]">Uploads left</p>
                        <p className="mt-1 text-lg font-bold text-foreground sm:text-xl">
                            {codes.reduce((sum, code) => {
                                const maxUploads = Number(code.max_uploads ?? 3);
                                const currentUploads = Number(code.current_uploads ?? 0);
                                return sum + Math.max(0, maxUploads - currentUploads);
                            }, 0)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Codes Grid */}
            {codes.length > 0 && (
                <div className="rounded-xl border border-border bg-white p-3 soft-shadow dark:bg-white/5 sm:rounded-2xl sm:p-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-2 flex items-center gap-1.5">
                        <Key className="w-3 h-3 opacity-70 sm:w-4 sm:h-4" /> Codes ({codes.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2 lg:grid-cols-4 xl:grid-cols-5">
                        {codes.map(code => {
                            const maxUploads = Number(code.max_uploads ?? 3);
                            const currentUploads = Number(code.current_uploads ?? 0);
                            const remainingUploads = Math.max(0, maxUploads - currentUploads);
                            const limitReached = remainingUploads === 0;
                            return (
                                <div key={code.id} className={`flex flex-col justify-between gap-2 rounded-lg border p-2 sm:p-2.5 shadow-sm transition-colors ${code.is_active ? 'border-border bg-white hover:border-primary/30 dark:bg-white/5' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
                                    <div className="flex items-center justify-between gap-1 min-w-0">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${code.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                            <span className="font-mono text-xs font-bold text-foreground truncate sm:text-sm">{code.code}</span>
                                        </div>
                                        <span className={`rounded px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider whitespace-nowrap shrink-0 ${code.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'} sm:text-[8px]`}>
                                            {code.is_active ? 'On' : 'Off'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1 text-[10px] sm:text-xs">
                                        <div className="rounded border border-border bg-neutral/40 p-1.5">
                                            <p className="text-[7px] uppercase tracking-widest text-text-secondary sm:text-[8px]">Used</p>
                                            <p className="mt-0.5 font-bold text-foreground">{currentUploads}</p>
                                        </div>
                                        <div className="rounded border border-border bg-neutral/40 p-1.5">
                                            <p className="text-[7px] uppercase tracking-widest text-text-secondary sm:text-[8px]">Left</p>
                                            <p className={`mt-0.5 font-bold ${limitReached ? 'text-rose-600' : 'text-foreground'}`}>{remainingUploads}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-0.5">
                                        <button 
                                            type="button"
                                            onClick={() => toggleCode(code.id, code.is_active)}
                                            className={`h-6 w-6 rounded p-1 transition-colors flex items-center justify-center ${code.is_active ? 'text-emerald-600 hover:bg-emerald-500/10' : 'text-text-secondary hover:bg-neutral'} sm:h-7 sm:w-7`}
                                            title={code.is_active ? "Pause" : "Activate"}
                                        >
                                            {code.is_active ? <Check className="w-3 h-3" /> : <RefreshCw className="w-3 h-3" />}
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => deleteCode(code.id)}
                                            disabled={deletingCodeId === code.id}
                                            className="h-6 w-6 rounded p-1 text-text-secondary transition-colors hover:bg-red-50 hover:text-red-500 flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-60 sm:h-7 sm:w-7"
                                            title="Delete code"
                                            aria-label={`Delete sharing code ${code.code}`}
                                        >
                                            {deletingCodeId === code.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Pending Photos */}
            {pendingPhotos.length > 0 && (
                <div className="rounded-xl border border-border bg-white soft-shadow dark:bg-white/5 sm:rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between gap-2 border-b border-border/50 px-2.5 py-2 sm:px-3.5 sm:py-3">
                        <h3 className="font-serif text-sm font-bold text-foreground">Pending ({pendingPhotos.length})</h3>
                        <button 
                            type="button"
                            onClick={approveAllPending}
                            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-primary text-white rounded-lg font-bold hover:shadow-lg transition-all text-xs whitespace-nowrap sm:px-3 sm:py-2"
                        >
                            <CheckCircle2 className="w-3 h-3" /> All
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-1 p-2 sm:grid-cols-4 sm:gap-1.5 sm:p-2.5 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                        {pendingPhotos.map((photo) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={photo.id} 
                                className="group relative overflow-hidden rounded border border-border bg-neutral dark:bg-neutral/20 aspect-square sm:rounded-lg"
                            >
                                <img src={photo.cloudinary_url} alt="Pending" className="h-full w-full object-cover" />
                                <div className="flex items-center justify-center gap-1 absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button type="button" onClick={() => approvePhoto(photo.id)} className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500 text-white transition-transform hover:scale-110 sm:h-7 sm:w-7">
                                        <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                    </button>
                                    <button type="button" onClick={() => deletePhoto(photo.id)} className="flex h-6 w-6 items-center justify-center rounded bg-red-500 text-white transition-transform hover:scale-110 sm:h-7 sm:w-7">
                                        <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Approved Gallery */}
            {approvedPhotos.length > 0 && (
                <div className="rounded-xl border border-border bg-white soft-shadow dark:bg-white/5 sm:rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between gap-2 px-2.5 py-2 border-b border-border/50 sm:px-3.5 sm:py-3">
                        <h3 className="font-serif text-sm font-bold text-foreground">Approved ({approvedPhotos.length})</h3>
                        <button type="button" onClick={loadData} className="flex h-6 w-6 items-center justify-center rounded text-text-secondary transition-colors hover:text-primary sm:h-7 sm:w-7"><RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /></button>
                    </div>
                    <div className="grid grid-cols-4 gap-1 p-2 sm:grid-cols-5 sm:gap-1.5 sm:p-2.5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
                        {approvedPhotos.map((photo) => (
                            <button type="button" key={photo.id} className="group relative aspect-square cursor-pointer overflow-hidden rounded border border-border bg-neutral dark:bg-neutral/20 hover:ring-2 ring-primary/50 sm:rounded-lg" onClick={() => setSelectedPhoto(photo)}>
                                <img src={photo.cloudinary_url} alt="Approved" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                                    <Maximize2 className="w-3 h-3 text-white" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-2 backdrop-blur-md sm:p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center">
                            <div className="absolute right-2 top-2 z-10 flex gap-1 sm:right-4 sm:top-4 sm:gap-2">
                                <button type="button" onClick={() => deletePhoto(selectedPhoto.id)} className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/20 text-red-500 backdrop-blur-md hover:bg-red-500/40 transition-all sm:h-9 sm:w-9" title="Delete"><Trash2 className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                                <button type="button" onClick={() => setSelectedPhoto(null)} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-all sm:h-9 sm:w-9" title="Close"><X className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                            </div>
                            <img src={selectedPhoto.cloudinary_url} alt="Gallery" className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-2xl sm:max-h-[70vh]" />
                            <div className="mt-2 text-center text-white text-xs sm:text-sm sm:mt-3">
                                <p className="font-bold">{selectedPhoto.uploader_name || 'Guest'}</p>
                                {selectedPhoto.caption && <p className="mt-1 italic text-white/70 max-w-md text-xs">{selectedPhoto.caption}</p>}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
