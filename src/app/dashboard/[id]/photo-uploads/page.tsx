'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Camera } from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';
import DashboardShell from '@/components/dashboard/DashboardShell';

const PhotoSharingManager = dynamic(() => import('@/components/dashboard/PhotoSharingManager'), {
    loading: () => <LoadingState variant="panel" label="Loading photo uploads…" className="min-h-[320px]" />,
});

export default function PhotoUploadsPage() {
    const params = useParams<{ id: string }>();
    const weddingId = params?.id || '';

    return (
        <DashboardShell weddingId={weddingId}>
            <main className="min-h-screen bg-[#FFF8F9] px-3 sm:px-6 py-6 text-foreground flex-1">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                            <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                            <span>/</span>
                            <Link href={`/dashboard/${weddingId}`} className="hover:text-primary transition-colors truncate max-w-[150px] md:max-w-[220px]">Workspace</Link>
                            <span>/</span>
                            <span className="text-foreground">Photo Uploads</span>
                        </div>
                        <Link href={`/dashboard/${weddingId}/wedding-day`} className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 text-xs font-bold text-text-secondary hover:text-primary hover:border-primary/30 transition-all shadow-2xs w-fit">
                            <ArrowLeft className="h-3.5 w-3.5" /> Wedding Day
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
        </DashboardShell>
    );
}
