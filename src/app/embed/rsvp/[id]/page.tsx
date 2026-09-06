import type { Metadata } from 'next';
import { CalendarDays, Heart } from 'lucide-react';
import RSVPForm from '@/components/RSVPForm';
import RsvpEmbedAutoHeight from '@/components/RsvpEmbedAutoHeight';
import { getCachedPublicWedding, getSupabaseErrorMessage } from '@/lib/public-wedding';
import type { Wedding } from '@/types/wedding';

export const revalidate = 60;

export const metadata: Metadata = {
    title: 'Wedding RSVP',
    robots: { index: false, follow: false },
};

function isDeadlineExpired(value: unknown) {
    if (typeof value !== 'string' || !value.trim()) return false;
    const deadline = new Date(value);
    return !Number.isNaN(deadline.getTime()) && deadline.getTime() < Date.now();
}

function formatDeadline(value: unknown) {
    if (typeof value !== 'string' || !value.trim()) return '';
    const deadline = new Date(value);
    if (Number.isNaN(deadline.getTime())) return '';
    return deadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function EmbedUnavailable({ message }: { message: string }) {
    return (
        <div className="flex min-h-[360px] items-center justify-center bg-[#FFF8F9] px-4 py-10 text-foreground">
            <section className="w-full max-w-xl rounded-3xl border border-primary/15 bg-white p-8 text-center shadow-xl shadow-primary/10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Heart className="h-7 w-7" />
                </div>
                <h1 className="mt-5 font-serif text-2xl font-bold">RSVP unavailable</h1>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{message}</p>
            </section>
        </div>
    );
}

export default async function RsvpEmbedPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let wedding: Wedding | null = null;

    try {
        wedding = await getCachedPublicWedding(id) as unknown as Wedding | null;
    } catch (error) {
        console.error('RSVP embed failed to load:', getSupabaseErrorMessage(error));
        return <RsvpEmbedAutoHeight><EmbedUnavailable message="This form could not be loaded. Please try again shortly." /></RsvpEmbedAutoHeight>;
    }

    if (!wedding || wedding.rsvp_embed_enabled !== true) {
        return <RsvpEmbedAutoHeight><EmbedUnavailable message="The couple has not enabled this RSVP form." /></RsvpEmbedAutoHeight>;
    }

    const expired = isDeadlineExpired(wedding.rsvp_deadline);
    const deadline = formatDeadline(wedding.rsvp_deadline);

    return (
        <RsvpEmbedAutoHeight>
            <main className="bg-[#FFF8F9] px-3 py-5 text-foreground sm:px-5 sm:py-8">
                <div className="mx-auto w-full max-w-4xl">
                    <header className="mb-5 rounded-3xl border border-primary/15 bg-white px-5 py-6 text-center shadow-lg shadow-primary/5 sm:px-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Wedding RSVP</p>
                    <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
                        {wedding.bride_name} <span className="text-primary">&amp;</span> {wedding.groom_name}
                    </h1>
                    {deadline && (
                        <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-text-secondary">
                            <CalendarDays className="h-4 w-4 text-primary" /> Respond by {deadline}
                        </p>
                    )}
                    </header>

                    {expired ? (
                        <EmbedUnavailable message="RSVPs are now closed for this wedding." />
                    ) : (
                        <RSVPForm weddingId={wedding.id} wedding={wedding} submissionSource="embed" />
                    )}

                    <p className="mt-5 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-text-secondary/60">
                        RSVP powered by QuickWeds
                    </p>
                </div>
            </main>
        </RsvpEmbedAutoHeight>
    );
}
