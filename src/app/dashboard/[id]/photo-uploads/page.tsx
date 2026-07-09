'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Camera, Loader2 } from 'lucide-react';

const PhotoSharingManager = dynamic(() => import('@/components/dashboard/PhotoSharingManager'), {
    loading: () => (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-border bg-white p-8 text-center shadow-lg shadow-primary/5">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-sm font-bold text-text-secondary">Loading photo uploads...</p>
        </div>
    ),
});

export default function PhotoUploadsPage() {
    const params = useParams<{ id: string }>();
    const weddingId = params?.id || '';

    return (
        <main className="min-h-screen bg-[#FFF8F9] px-4 py-6 text-foreground">
            <div className="mx-auto max-w-6xl">
                <div className="mb-5">
                    <Link href={`/dashboard/${weddingId}/wedding-day`} className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-bold text-text-secondary">
                        <ArrowLeft className="h-4 w-4" /> Wedding Day
                    </Link>
                </div>

                <section className="mb-5 rounded-3xl border border-primary/15 bg-white p-5 shadow-xl shadow-primary/10 sm:p-8">
                    <div className="flex items-center gap-3">
                        <Camera className="h-7 w-7 text-primary" />
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Photo Uploads</p>
                            <h1 className="mt-1 font-serif text-3xl font-bold">Guest Photo Moderation</h1>
                        </div>
                    </div>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">Review pending photos, approve gallery-ready uploads, reject unsuitable submissions, and manage sharing codes.</p>
                </section>

                <PhotoSharingManager weddingId={weddingId} hasPlannerPro />
            </div>
        </main>
    );
}
