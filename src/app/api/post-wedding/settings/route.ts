import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { sanitizeWeddingId } from '@/lib/rate-limit';
import { getWeddingAccess } from '@/lib/wedding-access';
import { invalidateWeddingPublicCache } from '@/lib/public-wedding';

export const dynamic = 'force-dynamic';

const OPTIONAL_COLUMNS = [
    'show_photos_in_thank_you_mode',
    'show_guestbook_in_thank_you_mode',
    'photo_recap_style',
] as const;

function isMissingColumnError(error: unknown, column?: string) {
    if (!error || typeof error !== 'object') return false;
    const record = error as Record<string, unknown>;
    const text = `${record.code || ''} ${record.message || ''} ${record.details || ''} ${record.hint || ''}`.toLowerCase();
    const hasColumnIndicator =
        text.includes('column') ||
        text.includes('schema cache') ||
        text.includes('could not find') ||
        text.includes('does not exist') ||
        text.includes('pgrst204') ||
        text.includes('42703');

    if (!hasColumnIndicator) return false;
    if (column) return text.includes(column.toLowerCase());
    return OPTIONAL_COLUMNS.some((col) => text.includes(col.toLowerCase()));
}

async function getContext(req: NextRequest, weddingId: string) {
    const { user, error } = await getRequestUser(req);
    if (!user) return { response: NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 }) };

    const db = getSupabaseAdminClient() as any;
    const baseSelect = 'id, user_id, bride_name, groom_name, wedding_date, public_slug, is_thank_you_mode, thank_you_message, photo_album_link';
    const extendedSelect = `${baseSelect}, show_photos_in_thank_you_mode, show_guestbook_in_thank_you_mode, photo_recap_style`;

    let access;
    try {
        access = await getWeddingAccess(db, user, weddingId, { select: extendedSelect });
    } catch (accessErr) {
        if (isMissingColumnError(accessErr)) {
            access = await getWeddingAccess(db, user, weddingId, { select: baseSelect });
        } else {
            throw accessErr;
        }
    }

    if (!access.wedding) return { response: NextResponse.json({ error: 'Wedding not found.' }, { status: 404 }) };
    if (!access.canManage) return { response: NextResponse.json({ error: 'Permission denied.' }, { status: 403 }) };

    return { db, access, user };
}

export async function GET(req: NextRequest) {
    const rawWeddingId = req.nextUrl.searchParams.get('weddingId') || '';
    const weddingId = sanitizeWeddingId(rawWeddingId);
    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });

    try {
        const context = await getContext(req, weddingId);
        if ('response' in context) return context.response;

        const { db, access } = context;
        const wedding = access.wedding;

        const [approvedPhotosRes, pendingPhotosRes, guestbookRes] = await Promise.all([
            db.from('wedding_photos')
                .select('id', { count: 'exact', head: true })
                .eq('wedding_id', weddingId)
                .eq('status', 'approved'),
            db.from('wedding_photos')
                .select('id', { count: 'exact', head: true })
                .eq('wedding_id', weddingId)
                .eq('status', 'pending'),
            db.from('guest_book')
                .select('id', { count: 'exact', head: true })
                .eq('wedding_id', weddingId),
        ]);

        return NextResponse.json({
            wedding: {
                id: wedding.id,
                bride_name: wedding.bride_name,
                groom_name: wedding.groom_name,
                wedding_date: wedding.wedding_date,
                public_slug: wedding.public_slug,
            },
            settings: {
                is_thank_you_mode: wedding.is_thank_you_mode === true,
                thank_you_message: wedding.thank_you_message || '',
                photo_album_link: wedding.photo_album_link || '',
                show_photos_in_thank_you_mode: wedding.show_photos_in_thank_you_mode !== false,
                show_guestbook_in_thank_you_mode: wedding.show_guestbook_in_thank_you_mode !== false,
                photo_recap_style: wedding.photo_recap_style === 'grid' ? 'grid' : 'polaroid',
            },
            counters: {
                approvedPhotos: approvedPhotosRes.count || 0,
                pendingPhotos: pendingPhotosRes.count || 0,
                guestbookWishes: guestbookRes.count || 0,
            },
        });
    } catch (error: any) {
        console.error('Failed to load post-wedding settings:', error);
        const message = error?.message || 'Failed to load post-wedding settings.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const rawWeddingId = body.weddingId || '';
    const weddingId = sanitizeWeddingId(rawWeddingId);
    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });

    try {
        const context = await getContext(req, weddingId);
        if ('response' in context) return context.response;

        const { db, access } = context;

        const updatePayload: Record<string, unknown> = {};
        if (typeof body.is_thank_you_mode === 'boolean') {
            updatePayload.is_thank_you_mode = body.is_thank_you_mode;
        }
        if (typeof body.thank_you_message === 'string') {
            updatePayload.thank_you_message = body.thank_you_message.slice(0, 2000);
        }
        if (typeof body.photo_album_link === 'string') {
            updatePayload.photo_album_link = body.photo_album_link.slice(0, 500);
        }
        if (typeof body.show_photos_in_thank_you_mode === 'boolean') {
            updatePayload.show_photos_in_thank_you_mode = body.show_photos_in_thank_you_mode;
        }
        if (typeof body.show_guestbook_in_thank_you_mode === 'boolean') {
            updatePayload.show_guestbook_in_thank_you_mode = body.show_guestbook_in_thank_you_mode;
        }
        if (body.photo_recap_style === 'grid' || body.photo_recap_style === 'polaroid') {
            updatePayload.photo_recap_style = body.photo_recap_style;
        }

        if (Object.keys(updatePayload).length === 0) {
            return NextResponse.json({ error: 'No valid settings provided to update.' }, { status: 400 });
        }

        let updateError: any = null;
        const activePayload = { ...updatePayload };

        // Attempt update with graceful retries stripping optional unmigrated columns if necessary
        for (let attempt = 0; attempt < 3; attempt++) {
            const { error } = await db
                .from('weddings')
                .update(activePayload)
                .eq('id', weddingId);

            if (!error) {
                updateError = null;
                break;
            }

            updateError = error;
            let strippedAny = false;
            for (const col of OPTIONAL_COLUMNS) {
                if (col in activePayload && isMissingColumnError(error, col)) {
                    delete activePayload[col];
                    strippedAny = true;
                }
            }

            if (!strippedAny) {
                break;
            }
        }

        if (updateError) {
            console.error('Update wedding error:', updateError);
            const detail = updateError.message || updateError.details || 'Failed to update post-wedding settings.';
            return NextResponse.json({ error: `Failed to update post-wedding settings: ${detail}` }, { status: 500 });
        }

        // Invalidate public website cache so changes appear on public site immediately
        await invalidateWeddingPublicCache(weddingId, access.wedding.public_slug);

        return NextResponse.json({
            success: true,
            settings: {
                is_thank_you_mode: typeof updatePayload.is_thank_you_mode === 'boolean'
                    ? updatePayload.is_thank_you_mode
                    : access.wedding.is_thank_you_mode === true,
                thank_you_message: typeof updatePayload.thank_you_message === 'string'
                    ? updatePayload.thank_you_message
                    : access.wedding.thank_you_message || '',
                photo_album_link: typeof updatePayload.photo_album_link === 'string'
                    ? updatePayload.photo_album_link
                    : access.wedding.photo_album_link || '',
                show_photos_in_thank_you_mode: typeof updatePayload.show_photos_in_thank_you_mode === 'boolean'
                    ? updatePayload.show_photos_in_thank_you_mode
                    : access.wedding.show_photos_in_thank_you_mode !== false,
                show_guestbook_in_thank_you_mode: typeof updatePayload.show_guestbook_in_thank_you_mode === 'boolean'
                    ? updatePayload.show_guestbook_in_thank_you_mode
                    : access.wedding.show_guestbook_in_thank_you_mode !== false,
                photo_recap_style: (updatePayload.photo_recap_style as string) || access.wedding.photo_recap_style || 'polaroid',
            },
        });
    } catch (error: any) {
        console.error('Failed to update post-wedding settings:', error);
        const message = error?.message || 'Failed to update post-wedding settings.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

