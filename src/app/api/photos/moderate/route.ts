import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getWeddingAccess } from '@/lib/wedding-access';
import { deleteWeddingPhotoObject } from '@/lib/media-deletion';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const weddingId = String(body.weddingId || '').trim();
    const photoId = String(body.photoId || '').trim();
    const action = String(body.action || '').trim();

    if (!weddingId || !photoId || !['approve', 'reject', 'delete'].includes(action)) {
        return NextResponse.json({ error: 'Wedding ID, photo ID, and a valid action are required.' }, { status: 400 });
    }

    try {
        const { user, error } = await getRequestUser(req);
        if (!user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });

        const db = getSupabaseAdminClient() as any;
        const access = await getWeddingAccess(db, user, weddingId);
        if (!access.wedding) return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });
        if (!access.canManage) return NextResponse.json({ error: 'You do not have permission to manage these photos.' }, { status: 403 });

        const { data: photo, error: lookupError } = await db
            .from('wedding_photos')
            .select('id, wedding_id, cloudinary_public_id, cloudinary_url')
            .eq('id', photoId)
            .maybeSingle();

        if (lookupError) throw lookupError;
        if (!photo) return NextResponse.json({ error: 'Photo not found.' }, { status: 404 });
        if (String(photo.wedding_id) !== weddingId) return NextResponse.json({ error: 'Photo does not belong to this wedding.' }, { status: 403 });

        if (action === 'delete') {
            try {
                await deleteWeddingPhotoObject(db, photo);
            } catch (storageError) {
                console.error('Unable to permanently delete photo object:', storageError instanceof Error ? storageError.message : 'unknown error');
                return NextResponse.json({ error: 'The photo file could not be deleted safely. Please retry.' }, { status: 502 });
            }
            const { error: deleteError } = await db
                .from('wedding_photos')
                .delete()
                .eq('id', photoId)
                .eq('wedding_id', weddingId);
            if (deleteError) throw deleteError;
            return NextResponse.json({ success: true, deletedId: photoId });
        }

        const now = new Date().toISOString();
        const update = action === 'approve'
            ? { status: 'approved', is_approved: true, approved_at: now, rejected_at: null }
            : { status: 'rejected', is_approved: false, rejected_at: now };

        const { data, error: updateError } = await db
            .from('wedding_photos')
            .update(update)
            .eq('id', photoId)
            .eq('wedding_id', weddingId)
            .select('id, cloudinary_url, uploader_name, caption, message, is_approved, status, upload_source, created_at, approved_at, rejected_at')
            .single();

        if (updateError) throw updateError;
        return NextResponse.json({ success: true, photo: data });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to update photo.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
