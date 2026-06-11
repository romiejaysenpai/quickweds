import { Metadata } from 'next';
import { getCachedPublicWedding } from '@/lib/public-wedding';
import type { Wedding } from '@/types/wedding';

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    const resolvedParams = await params;

    try {
        const wedding = await getCachedPublicWedding(resolvedParams.id) as unknown as Wedding | null;

        if (!wedding) {
            return {
                title: 'QuickWeds Invitation',
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
    } catch (e) {
        return {
            title: 'QuickWeds Invitation',
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
