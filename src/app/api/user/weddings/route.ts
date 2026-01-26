import { NextResponse } from 'next/server';
import { db, APP_COLLECTIONS } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        // 1. Fetch weddings for this user
        const weddingsSnapshot = await db.collection(APP_COLLECTIONS.WEDDINGS)
            .where('user_id', '==', userId)
            .get();

        const weddings = await Promise.all(weddingsSnapshot.docs.map(async (doc) => {
            const weddingData = doc.data();

            // 2. Fetch RSVP count for this wedding
            const rsvpsSnapshot = await db.collection(APP_COLLECTIONS.RSVPS)
                .where('wedding_id', '==', doc.id)
                .count()
                .get();

            return {
                ...weddingData,
                rsvp_count: rsvpsSnapshot.data().count
            };
        }));

        // Sort by created_at desc
        weddings.sort((a: any, b: any) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        return NextResponse.json({ success: true, weddings });
    } catch (error: any) {
        console.error('Error fetching user weddings:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
