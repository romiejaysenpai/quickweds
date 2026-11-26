import type { Metadata } from 'next';
import { getCachedPublicWedding } from '@/lib/public-wedding';
import type { Wedding } from '@/types/wedding';

const guestRobots: Metadata['robots'] = { index: false, follow: false };

function formatMetadataDate(rawDate?: string | null) {
    if (!rawDate) return null;
    const trimmed = String(rawDate).trim();
    const parsed = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
        ? new Date(`${trimmed}T12:00:00`)
        : new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    const resolvedParams = await params;

    try {
        const wedding = await getCachedPublicWedding(resolvedParams.id) as unknown as Wedding | null;

        if (!wedding) {
            return {
                title: { absolute: 'QuickWeds Invitation' },
                robots: guestRobots,
            };
        }

        const formattedDate = formatMetadataDate(wedding.wedding_date);
        const dateSuffix = formattedDate ? ` on ${formattedDate}` : '';
        const image = wedding.hero_image || wedding.couple_photo || '';

        return {
            title: { absolute: `${wedding.bride_name} & ${wedding.groom_name} | You're Invited` },
            description: `Join us for our wedding celebration${dateSuffix}. RSVP and find all the details you need.`,
            robots: guestRobots,
            openGraph: {
                title: `${wedding.bride_name} & ${wedding.groom_name}'s Wedding`,
                description: `Join us${dateSuffix}. We can't wait to celebrate with you!`,
                images: image ? [{ url: image }] : [],
            },
            twitter: {
                card: 'summary_large_image',
                title: `${wedding.bride_name} & ${wedding.groom_name}'s Wedding`,
                description: `Join us${dateSuffix}.`,
                images: image ? [image] : [],
            }
        };
    } catch {
        return {
            title: { absolute: 'QuickWeds Invitation' },
            robots: guestRobots,
        };
    }
}

export default function WeddingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
