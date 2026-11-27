import Link from 'next/link';
import { ArrowLeft, ClipboardList, Users } from 'lucide-react';
import ExternalWebsiteConnection from '@/components/dashboard/ExternalWebsiteConnection';

export default async function WebsiteConnectionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <main className="mobile-safe-screen relative overflow-x-clip bg-neutral text-foreground">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(209,108,120,0.13),_rgba(214,184,124,0.08)_45%,_transparent_75%)]"
            />
            <div className="relative mx-auto max-w-6xl min-w-0 px-4 py-6 sm:px-6 sm:py-10">
                <nav aria-label="Workspace navigation" className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href={`/dashboard/${id}`}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-bold text-primary shadow-sm transition hover:border-primary/40 hover:bg-primary/5"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to wedding workspace
                    </Link>

                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href={`/dashboard/${id}/planner`}
                            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-white px-3.5 text-xs font-bold text-text-secondary shadow-sm transition hover:border-primary/30 hover:text-primary"
                        >
                            <ClipboardList className="h-3.5 w-3.5" /> Wedding Planner
                        </Link>
                        <Link
                            href={`/dashboard/${id}?tab=guests`}
                            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-white px-3.5 text-xs font-bold text-text-secondary shadow-sm transition hover:border-primary/30 hover:text-primary"
                        >
                            <Users className="h-3.5 w-3.5" /> Guest List
                        </Link>
                    </div>
                </nav>
                <ExternalWebsiteConnection weddingId={id} />
            </div>
        </main>
    );
}
