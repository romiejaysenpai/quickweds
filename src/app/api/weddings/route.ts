import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db, storage, APP_COLLECTIONS } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Ensure ID and UserID are present (Client-side generated ID)
        const id = body.id || uuidv4().slice(0, 8);
        const userId = body.userId || 'anonymous';

        const weddingData = {
            id,
            user_id: userId,
            bride_name: body.brideName,
            groom_name: body.groomName,
            wedding_date: body.weddingDate,
            wedding_time: body.weddingTime,
            venue_name: body.venueName,
            venue_address: body.venueAddress,
            maps_link: body.mapsLink || null,
            motif_color: body.motifColor || '#C08081',
            font_style: body.fontStyle || 'Elegant',
            background_style: body.backgroundStyle || 'gradient',
            dress_code: body.dressCode || '',
            program_timeline: body.programTimeline || '',
            story: body.story || '',
            contact_person: body.contactPerson || '',
            rsvp_deadline: body.rsvpDeadline,
            hero_image: body.heroImage || null,
            couple_photo: body.couplePhoto || null,
            teaser_video: body.teaserVideo || null,
            gallery_images: JSON.stringify(body.galleryImages || []),
            template: body.template || 'classic',
            quote: body.quote || '',
            hashtag: body.hashtag || '',
            gift_bank: body.giftBank || '',
            gift_account_name: body.giftAccountName || '',
            gift_account_number: body.giftAccountNumber || '',
            gift_qr_image: body.giftQrImage || null,
            created_at: new Date().toISOString()
        };

        await db.collection(APP_COLLECTIONS.WEDDINGS).doc(id).set(weddingData);

        return NextResponse.json({ id, success: true });
    } catch (error: any) {
        console.error('Error saving wedding to Firebase:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
