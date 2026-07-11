import type { Metadata } from 'next';
import WeddingFontProvider from '@/components/WeddingFontProvider';
import { resolvePublicWeddingByIdentifier } from '@/lib/public-wedding-lookup';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    const resolvedParams = await params;

    try {
        const db = getSupabaseAdminClient();
        const { wedding } = await resolvePublicWeddingByIdentifier(
            db,
            resolvedParams.id,
            'bride_name, groom_name, wedding_date, hero_image, couple_photo, deleted_at'
        );

        if (!wedding) {
            return {
                title: 'QuickWeds Invitation',
            };
        }

        const parsedDate = wedding.wedding_date ? new Date(wedding.wedding_date) : null;
        const formattedDate = parsedDate && !Number.isNaN(parsedDate.getTime())
            ? parsedDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            })
            : null;
        const dateClause = formattedDate ? ` on ${formattedDate}` : '';

        const image = wedding.hero_image || wedding.couple_photo || '';

        return {
            title: `${wedding.bride_name} & ${wedding.groom_name} | You're Invited`,
            description: `Join us for our wedding celebration${dateClause}. RSVP and find all the details you need.`,
            openGraph: {
                title: `${wedding.bride_name} & ${wedding.groom_name}'s Wedding`,
                description: `Join us${dateClause}. We can't wait to celebrate with you!`,
                images: image ? [{ url: image }] : [],
            },
            twitter: {
                card: 'summary_large_image',
                title: `${wedding.bride_name} & ${wedding.groom_name}'s Wedding`,
                description: `Join us${dateClause}.`,
                images: image ? [image] : [],
            }
        };
    } catch {
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
    return <WeddingFontProvider>{children}</WeddingFontProvider>;
}
