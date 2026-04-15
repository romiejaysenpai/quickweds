'use client';

import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

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
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        uploader_name: '',
        uploader_email: '',
        image_url: '',
        caption: '',
        code: '',
    });

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

    async function submitPhoto(e: React.FormEvent) {
        e.preventDefault();
        if (!form.image_url.trim()) return;
        setSubmitting(true);
        try {
            const normalizedCode = form.code.trim().toUpperCase();
            if (!normalizedCode) {
                alert('A sharing code is required to submit photos.');
                setSubmitting(false);
                return;
            }
            if (!/^https:\/\/.+/i.test(form.image_url.trim())) {
                alert('Please use an HTTPS image URL.');
                setSubmitting(false);
                return;
            }

            const { data: code, error: codeError } = await supabase
                .from('photo_sharing_codes')
                .select('*')
                .eq('wedding_id', weddingId)
                .eq('code', normalizedCode)
                .eq('is_active', true)
                .maybeSingle();

            if (codeError || !code) {
                alert('Invalid or inactive sharing code.');
                setSubmitting(false);
                return;
            }

            const { error } = await supabase.from('wedding_photos').insert({
                wedding_id: weddingId,
                uploader_name: form.uploader_name || 'Guest',
                uploader_email: form.uploader_email || null,
                cloudinary_url: form.image_url.trim(),
                cloudinary_public_id: `manual-${Date.now()}`,
                caption: form.caption || null,
                is_approved: false,
            });

            if (error) throw error;

            setForm({
                uploader_name: '',
                uploader_email: '',
                image_url: '',
                caption: '',
                code: '',
            });
            alert('Photo submitted! It will appear after approval.');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to submit photo.';
            alert(message);
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-[#fafafa] py-12 px-4">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="bg-white rounded-3xl border border-border p-8 text-center">
                    <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Guest Photo Sharing Portal</h1>
                    <p className="text-text-secondary">
                        Share your favorite moments from {wedding?.bride_name} &amp; {wedding?.groom_name}&apos;s wedding.
                    </p>
                    <Link href={`/w/${weddingId}`} className="inline-block mt-4 text-primary font-bold hover:underline">
                        Back to Invitation
                    </Link>
                </div>

                <form onSubmit={submitPhoto} className="bg-white rounded-3xl border border-border p-8 space-y-4">
                    <h2 className="text-xl font-serif font-bold text-foreground">Submit a Photo</h2>
                    <input value={form.uploader_name} onChange={(e) => setForm((prev) => ({ ...prev, uploader_name: e.target.value }))} placeholder="Your name" className="w-full border border-border rounded-xl px-4 py-3 outline-none min-h-[44px]" />
                    <input value={form.uploader_email} onChange={(e) => setForm((prev) => ({ ...prev, uploader_email: e.target.value }))} placeholder="Your email (optional)" className="w-full border border-border rounded-xl px-4 py-3 outline-none min-h-[44px]" />
                    <input required value={form.image_url} onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))} placeholder="Direct image URL (https://...jpg)" className="w-full border border-border rounded-xl px-4 py-3 outline-none min-h-[44px]" />
                    <input value={form.caption} onChange={(e) => setForm((prev) => ({ ...prev, caption: e.target.value }))} placeholder="Caption (optional)" className="w-full border border-border rounded-xl px-4 py-3 outline-none min-h-[44px]" />
                    <input value={form.code} onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))} placeholder="Sharing code (if provided)" className="w-full border border-border rounded-xl px-4 py-3 outline-none min-h-[44px]" />
                    <button type="submit" disabled={submitting} className="w-full bg-primary text-white rounded-xl px-6 py-3 font-bold min-h-[44px]">
                        {submitting ? 'Submitting...' : 'Submit Photo'}
                    </button>
                </form>

                <div className="bg-white rounded-3xl border border-border p-8">
                    <h2 className="text-xl font-serif font-bold text-foreground mb-4">Approved Gallery</h2>
                    {photos.length === 0 ? (
                        <p className="text-text-secondary italic">No approved photos yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {photos.map((photo) => (
                                <div key={photo.id} className="rounded-xl overflow-hidden border border-border bg-white">
                                    <img src={photo.cloudinary_url} alt={photo.caption || 'Wedding photo'} className="w-full h-48 object-cover" />
                                    <div className="p-3">
                                        <p className="text-sm font-bold text-foreground">{photo.uploader_name || 'Guest'}</p>
                                        {photo.caption && <p className="text-xs text-text-secondary mt-1">{photo.caption}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
