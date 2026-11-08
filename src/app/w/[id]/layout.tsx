import type { Metadata } from 'next';
import { getCachedPublicWedding } from '@/lib/public-wedding';
import type { Wedding } from '@/types/wedding';

const guestRobots: Metadata['robots'] = { index: false, follow: false };

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    const resolvedParams = await params;

    try {
        const wedding = await getCachedPublicWedding(resolvedParams.id) as unknown as Wedding | null;

        if (!wedding) {
            return {
                title: 'QuickWeds Invitation',
                robots: guestRobots,
            };
        }

        const formattedDate = new Date(wedding.wedding_date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        const image = wedding.hero_image || wedding.couple_photo || '';

        return {
            title: `${wedding.bride_name} & ${wedding.groom_name} | You're Invited`,
            description: `Join us for our wedding celebration on ${formattedDate}. RSVP and find all the details you need.`,
            robots: guestRobots,
            openGraph: {
                title: `${wedding.bride_name} & ${wedding.groom_name}'s Wedding`,
                description: `Join us on ${formattedDate}. We can't wait to celebrate with you!`,
                images: image ? [{ url: image }] : [],
            },
            twitter: {
                card: 'summary_large_image',
                title: `${wedding.bride_name} & ${wedding.groom_name}'s Wedding`,
                description: `Join us on ${formattedDate}.`,
                images: image ? [image] : [],
            }
        };
    } catch {
        return {
            title: 'QuickWeds Invitation',
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
