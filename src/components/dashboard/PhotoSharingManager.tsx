'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    Camera, 
    Plus, 
    Trash2, 
    Check, 
    X, 
    Loader2, 
    ExternalLink,
    Image as ImageIcon,
    Shield,
    Key,
    RefreshCw
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
    const [newCode, setNewCode] = useState('');

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

    const deletePhoto = async (photoId: string) => {
        if (!confirm("Are you sure you want to delete this photo?")) return;
        try {
            const { error } = await supabase.from('wedding_photos').delete().eq('id', photoId);
            if (error) throw error;
            setPhotos(photos.filter(p => p.id !== photoId));
        } catch (err) {
            alert("Failed to delete photo");
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
        } catch (err) {
            alert("Failed to generate code");
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
                        <p className="text-sm text-text-secondary mt-1">Manage guest uploads and sharing access.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <a 
                            href={`/w/${weddingId}/photos`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral text-foreground rounded-2xl font-bold hover:bg-neutral/80 transition-all border border-border"
                        >
                            <ExternalLink className="w-4 h-4" /> View Guest Portal
                        </a>
                        <button 
                            onClick={generateCode}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:shadow-lg transition-all"
                        >
                            <Plus className="w-5 h-5" /> Generate Access Code
                        </button>
                    </div>
                </div>

                {/* Access Codes List */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4">Active Access Codes</h3>
                    {codes.length === 0 ? (
                        <div className="p-8 border-2 border-dashed border-border rounded-3xl text-center">
                            <Key className="w-10 h-10 text-text-secondary opacity-30 mx-auto mb-3" />
                            <p className="text-sm text-text-secondary italic">No access codes generated yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {codes.map(code => (
                                <div key={code.id} className="p-4 bg-neutral rounded-2xl border border-border flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${code.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                        <span className="font-mono font-bold text-lg">{code.code}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => toggleCode(code.id, code.is_active)}
                                            className="p-2 text-text-secondary hover:bg-white rounded-xl transition-colors"
                                            title={code.is_active ? "Deactivate" : "Activate"}
                                        >
                                            <Shield className={`w-4 h-4 ${code.is_active ? 'text-emerald-500' : ''}`} />
                                        </button>
                                        <button 
                                            onClick={() => deleteCode(code.id)}
                                            className="p-2 text-red-400 hover:bg-white rounded-xl transition-colors"
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
                <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 soft-shadow border border-border">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 text-amber-500" />
                            Pending Approval
                        </h3>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                            {pendingPhotos.length}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {pendingPhotos.length === 0 ? (
                            <div className="py-20 text-center text-text-secondary opacity-50 italic">
                                <Check className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No photos waiting for approval.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {pendingPhotos.map(photo => (
                                    <div key={photo.id} className="flex gap-4 p-4 rounded-2xl border border-border bg-neutral/30 group">
                                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-white shrink-0">
                                            <img src={photo.cloudinary_url} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate">{photo.uploader_name || 'Guest'}</p>
                                            <p className="text-xs text-text-secondary line-clamp-2 mt-1">{photo.caption || 'No caption'}</p>
                                            <div className="flex gap-2 mt-3">
                                                <button 
                                                    onClick={() => approvePhoto(photo.id)}
                                                    className="flex-1 bg-emerald-500 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors"
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={() => deletePhoto(photo.id)}
                                                    className="px-3 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Approved Gallery */}
                <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 soft-shadow border border-border">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-primary" />
                            Live Gallery
                        </h3>
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                            {approvedPhotos.length}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {approvedPhotos.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-text-secondary opacity-50 italic">
                                <p>Approved photos will appear here.</p>
                            </div>
                        ) : (
                            approvedPhotos.map(photo => (
                                <div key={photo.id} className="aspect-square rounded-xl overflow-hidden bg-neutral relative group">
                                    <img src={photo.cloudinary_url} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button 
                                            onClick={() => deletePhoto(photo.id)}
                                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
