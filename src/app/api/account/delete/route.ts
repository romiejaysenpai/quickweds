import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { deleteManagedWeddingAssets, deleteWeddingPhotoObject } from '@/lib/media-deletion';

async function safeDelete(db: any, table: string, column: string, value: string) {
    const { error } = await db.from(table).delete().eq(column, value);
    if (error) {
        console.warn(`Account deletion skipped ${table}:`, error.message);
    }
}

async function safeUpdate(db: any, table: string, payload: Record<string, unknown>, column: string, value: string) {
    const { error } = await db.from(table).update(payload).eq(column, value);
    if (error) {
        console.warn(`Account deletion skipped ${table} update:`, error.message);
    }
}

export async function DELETE(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error }, { status: 401 });
    if (req.headers.get('x-quickweds-delete-confirmation') !== 'DELETE') {
        return NextResponse.json({ error: 'Explicit account deletion confirmation is required.' }, { status: 400 });
    }

    const lastSignInAt = Date.parse(user.last_sign_in_at || '');
    if (!Number.isFinite(lastSignInAt) || Date.now() - lastSignInAt > 15 * 60 * 1000) {
        return NextResponse.json({ error: 'For your security, sign in again before deleting your account.' }, { status: 403 });
    }

    try {
        const db = getSupabaseAdminClient() as any;
        const now = new Date().toISOString();

        const { data: weddings, error: weddingsError } = await db
            .from('weddings')
            .select('id, hero_image, couple_photo, teaser_video, background_music_url, gift_qr_image, invitation_image, gallery_images, reception_venue_photos')
            .eq('user_id', user.id);

        if (weddingsError) {
            console.warn('Account deletion could not load owned weddings:', weddingsError.message);
        }

        const weddingIds = (weddings || [])
            .map((wedding: { id?: string | null }) => wedding.id)
            .filter((id: string | null | undefined): id is string => Boolean(id));

        await Promise.all([
            safeDelete(db, 'user_notifications', 'user_id', user.id),
            safeDelete(db, 'user_app_profiles', 'user_id', user.id),
            safeDelete(db, 'wedding_template_presets', 'user_id', user.id),
            safeDelete(db, 'planner_google_calendar_connections', 'user_id', user.id),
            safeUpdate(db, 'supplier_profiles', {
                owner_user_id: null,
                is_active: false,
                status: 'inactive',
                updated_at: now,
            }, 'owner_user_id', user.id),
        ]);

        if (weddingIds.length > 0) {
            const { data: weddingPhotos, error: weddingPhotosError } = await db
                .from('wedding_photos')
                .select('id, wedding_id, cloudinary_public_id, cloudinary_url')
                .in('wedding_id', weddingIds);
            if (weddingPhotosError) throw weddingPhotosError;

            for (const photo of weddingPhotos || []) {
                await deleteWeddingPhotoObject(db, photo);
            }
            for (const wedding of weddings || []) {
                await deleteManagedWeddingAssets(db, wedding);
            }

            const { error: deleteWeddingsError } = await db
                .from('weddings')
                .delete()
                .in('id', weddingIds);

            if (deleteWeddingsError) {
                console.warn('Account deletion could not hard-delete weddings, falling back to soft delete:', deleteWeddingsError.message);
                await db
                    .from('weddings')
                    .update({ deleted_at: now, user_id: null })
                    .in('id', weddingIds);
            }
        }

        const { error: deleteUserError } = await db.auth.admin.deleteUser(user.id);
        if (deleteUserError) {
            if (weddingIds.length > 0) {
                await db
                    .from('weddings')
                    .update({ deleted_at: now, user_id: null })
                    .in('id', weddingIds);
            }

            const retry = await db.auth.admin.deleteUser(user.id);
            if (retry.error) throw retry.error;
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to delete account';
        console.error('Account deletion failed:', err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
