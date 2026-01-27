import { NextResponse } from 'next/server';
import { db, APP_COLLECTIONS } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const templatesSnapshot = await db.collection(APP_COLLECTIONS.WEDDINGS)
            .where('is_template', '==', true)
            .get();

        const templates = templatesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ success: true, templates });
    } catch (error: any) {
        console.error('Error fetching templates:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
