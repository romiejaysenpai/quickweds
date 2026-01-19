import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db, storage, APP_COLLECTIONS } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const id = uuidv4().slice(0, 8);
        const userId = formData.get('userId') as string || 'anonymous';
        const bucket = storage.bucket();

        // Helper to upload to Firebase Storage
        const uploadFile = async (file: File | null, prefix: string) => {
            if (!file || typeof file === 'string' || file.size === 0) return null;

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filename = `quickweds/${userId}/${id}/${prefix}-${file.name.replace(/\s+/g, '_')}`;
            const fileRef = bucket.file(filename);

            await fileRef.save(buffer, {
                metadata: { contentType: file.type },
                public: true
            });

            // Return the public URL
            return `https://storage.googleapis.com/${bucket.name}/${filename}`;
        };

        const heroImagePath = await uploadFile(formData.get('heroImage') as File, 'hero');
        const couplePhotoPath = await uploadFile(formData.get('couplePhoto') as File, 'couple');
        const teaserVideoPath = await uploadFile(formData.get('teaserVideo') as File, 'teaser');

        const galleryFiles = formData.getAll('galleryImages') as File[];
        const galleryPaths = [];
        for (let i = 0; i < galleryFiles.length; i++) {
            const path = await uploadFile(galleryFiles[i], `gallery-${i}`);
            if (path) galleryPaths.push(path);
        }

        const weddingData = {
            id,
            user_id: userId,
            bride_name: formData.get('brideName'),
            groom_name: formData.get('groomName'),
            wedding_date: formData.get('weddingDate'),
            wedding_time: formData.get('weddingTime'),
            venue_name: formData.get('venueName'),
            venue_address: formData.get('venueAddress'),
            maps_link: formData.get('mapsLink') || null,
            motif_color: formData.get('motifColor') || '#C08081',
            font_style: formData.get('fontStyle') || 'Elegant',
            background_style: formData.get('backgroundStyle') || 'gradient',
            dress_code: formData.get('dressCode') || '',
            program_timeline: formData.get('programTimeline') || '',
            story: formData.get('story') || '',
            contact_person: formData.get('contactPerson') || '',
            rsvp_deadline: formData.get('rsvpDeadline'),
            hero_image: heroImagePath,
            couple_photo: couplePhotoPath,
            teaser_video: teaserVideoPath,
            gallery_images: JSON.stringify(galleryPaths),
            template: formData.get('template') || 'classic',
            quote: formData.get('quote') || '',
            hashtag: formData.get('hashtag') || '',
            created_at: new Date().toISOString()
        };

        await db.collection(APP_COLLECTIONS.WEDDINGS).doc(id).set(weddingData);

        return NextResponse.json({ id, success: true });
    } catch (error: any) {
        console.error('Error saving wedding to Firebase:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
