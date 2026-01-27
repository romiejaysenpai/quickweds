import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db, storage, APP_COLLECTIONS } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('API POST /api/weddings - Payload received:', JSON.stringify(body, null, 2));

        // Ensure ID and UserID are present (Client-side generated ID)
        const id = body.id || uuidv4().slice(0, 8);
        const userId = body.userId || 'anonymous';

        const weddingData = {
            id,
            user_id: userId,
            bride_name: body.brideName || 'Bride',
            groom_name: body.groomName || 'Groom',
            wedding_date: body.weddingDate || new Date().toISOString().split('T')[0],
            wedding_time: body.weddingTime || '12:00',
            venue_name: body.venueName || 'To be announced',
            venue_address: body.venueAddress || '',
            maps_link: body.mapsLink || null,
            motif_color: body.motifColor || '#C08081',
            font_style: body.fontStyle || 'Elegant',
            background_style: body.backgroundStyle || 'gradient',
            dress_code_sponsors: body.dressCodeSponsors || '',
            dress_code_guests: body.dressCodeGuests || '',
            program_timeline: body.programTimeline || '',
            story: body.story || '',
            contact_person: body.contactPerson || '',
            rsvp_deadline: body.rsvpDeadline || new Date().toISOString().split('T')[0],
            hero_image: body.heroImage || null,
            couple_photo: body.couplePhoto || null,
            teaser_video: body.teaserVideo || null,
            gallery_images: JSON.stringify(body.galleryImages || []),
            entourage: JSON.stringify(body.entourage || []),
            faqs: JSON.stringify(body.faqs || []),
            template: body.template || 'classic',
            quote: body.quote || '',
            hashtag: body.hashtag || '',
            gift_bank: body.giftBank || '',
            gift_account_name: body.giftAccountName || '',
            gift_account_number: body.giftAccountNumber || '',
            gift_qr_image: body.giftQrImage || null,
            logo_initials: body.logoInitials || '',
            logo_font: body.logoFont || 'Elegant',
            logo_shape: body.logoShape || 'minimal',
            logo_color: body.logoColor || '#C08081',
            created_at: new Date().toISOString()
        };

        console.log('API POST /api/weddings - Saving to Firestore:', id);
        await db.collection(APP_COLLECTIONS.WEDDINGS).doc(id).set(weddingData);
        console.log('API POST /api/weddings - Success:', id);

        return NextResponse.json({ id, success: true });
    } catch (error: any) {
        console.error('API POST /api/weddings - Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
