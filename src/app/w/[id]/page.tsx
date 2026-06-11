import { notFound } from 'next/navigation';
import { Heart } from 'lucide-react';
import WeddingPageClient from './WeddingPageClient';
import { getCachedPublicWedding, getSupabaseErrorMessage } from '@/lib/public-wedding';
import type { Wedding } from '@/types/wedding';

export const revalidate = 60;

function WeddingUnavailable({ message }: { message?: string }) {
    return (
        <div className="min-h-screen bg-[#FFF8F4] px-6 py-24 text-center text-foreground">
            <div className="mx-auto max-w-xl rounded-[2rem] border border-primary/10 bg-white/80 p-8 shadow-xl shadow-primary/10">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Heart className="h-7 w-7 text-primary" />
                </div>
                <h1 className="font-serif text-3xl font-bold">Wedding page temporarily unavailable</h1>
                <p className="mt-4 text-sm leading-6 text-text-secondary">
                    {message || 'Unable to load this wedding page right now. Please refresh in a moment.'}
                </p>
            </div>
        </div>
    );
}

export default async function WeddingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let wedding: Record<string, unknown> | null = null;

    try {
        wedding = await getCachedPublicWedding(id);
    } catch (error) {
        const message = getSupabaseErrorMessage(error);
        console.error('Public wedding page failed:', message);
        return <WeddingUnavailable />;
    }

    if (!wedding) notFound();

    return <WeddingPageClient publicIdentifier={id} wedding={wedding as unknown as Wedding} />;
}
