import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db, APP_COLLECTIONS } from '@/lib/firebase-admin';

export async function POST(req: Request, { params }: { params: Promise<{ weddingId: string }> }) {
    try {
        const { weddingId } = await params;
        const data = await req.json();
        const rsvpId = uuidv4();

        const rsvpData = {
            id: rsvpId,
            wedding_id: weddingId,
            guest_name: data.guestName,
            attendance: data.attendance,
            num_guests: data.numGuests || 1,
            meal_preference: data.mealPreference || '',
            message: data.message || '',
            created_at: new Date().toISOString()
        };

        await db.collection(APP_COLLECTIONS.RSVPS).doc(rsvpId).set(rsvpData);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error submitting RSVP to Firestore:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
