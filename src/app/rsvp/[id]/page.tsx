import type { Metadata } from 'next';
import StandaloneRsvp from './StandaloneRsvp';

export const metadata: Metadata = { title: 'Wedding RSVP | QuickWeds', robots: { index: false, follow: false }, referrer: 'no-referrer' };
export default async function RsvpPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <StandaloneRsvp weddingId={id} />;
}
