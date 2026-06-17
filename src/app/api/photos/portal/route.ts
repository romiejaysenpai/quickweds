import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getWeddingAccess } from '@/lib/wedding-access';
import { hasPlannerProAccess } from '@/lib/planner-limits';
import { DEFAULT_PHOTO_PORTAL_SETTINGS, getPhotoPortalSettings, normalizePhotoPortalSettings } from '@/lib/photo-portal';

export const dynamic = 'force-dynamic';

async function getContext(req: NextRequest, weddingId: string) {
    const { user, error } = await getRequestUser(req);
    if (!user) return { response: NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 }) };

    const db = getSupabaseAdminClient() as any;
    const access = await getWeddingAccess(db, user, weddingId, {
        select: 'id, user_id, is_premium, payment_status',
    });

    if (!access.wedding) return { response: NextResponse.json({ error: 'Wedding not found.' }, { status: 404 }) };
    if (!access.canManage) return { response: NextResponse.json({ error: 'You do not have permission to manage this photo portal.' }, { status: 403 }) };

    const { data: accountProfile } = await db
        .from('user_app_profiles')
        .select('is_pro, payment_status')
        .eq('user_id', user.id)
        .maybeSingle();

    const hasPro = hasPlannerProAccess({
        isAdmin: isKnownAdminEmail(user.email),
        wedding: access.wedding,
        accountProfile,
    });

    return { db, access, hasPro };
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const weddingId = String(searchParams.get('weddingId') || '').trim();
    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });

    try {
        const context = await getContext(req, weddingId);
        if ('response' in context) return context.response;

        const [settings, photosRes, codesRes] = await Promise.all([
            getPhotoPortalSettings(context.db, weddingId),
            context.db
                .from('wedding_photos')
                .select('id, cloudinary_url, uploader_name, caption, message, is_approved, status, upload_source, created_at, approved_at, rejected_at')
                .eq('wedding_id', weddingId)
                .order('created_at', { ascending: false }),
            context.db
                .from('photo_sharing_codes')
                .select('id, code, is_active, expires_at, max_uploads, current_uploads')
                .eq('wedding_id', weddingId)
                .order('created_at', { ascending: false }),
        ]);

        if (photosRes.error) throw photosRes.error;
        if (codesRes.error) throw codesRes.error;

        return NextResponse.json({
            settings,
            photos: photosRes.data || [],
            codes: codesRes.data || [],
            hasPro: context.hasPro,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load photo portal.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const weddingId = String(body.weddingId || '').trim();
    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });

    try {
        const context = await getContext(req, weddingId);
        if ('response' in context) return context.response;
        if (!context.hasPro) {
            return NextResponse.json({ error: 'Planner Pro is required to enable Disposable Camera Mode.' }, { status: 403 });
        }

        const settings = normalizePhotoPortalSettings({
            ...DEFAULT_PHOTO_PORTAL_SETTINGS,
            ...body.settings,
        });

        const { data, error } = await context.db
            .from('photo_portal_settings')
            .upsert({
                wedding_id: weddingId,
                ...settings,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'wedding_id' })
            .select('disposable_camera_enabled, reveal_datetime, guest_name_required, allow_anonymous_uploads, require_approval, photo_limit_per_guest, film_frame_enabled, nostalgic_ui_enabled, date_stamp_enabled, enabled_filter_ids')
            .single();

        if (error) throw error;
        return NextResponse.json({ settings: normalizePhotoPortalSettings(data) });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to save photo portal settings.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
