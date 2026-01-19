import { NextResponse } from 'next/server';
import { db, APP_COLLECTIONS } from '@/lib/firebase-admin';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const doc = await db.collection(APP_COLLECTIONS.WEDDINGS).doc(id).get();

        if (!doc.exists) {
            return NextResponse.json({ success: false, error: 'Wedding not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, wedding: doc.data() });
    } catch (error: any) {
        console.error('Error fetching wedding from Firestore:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
