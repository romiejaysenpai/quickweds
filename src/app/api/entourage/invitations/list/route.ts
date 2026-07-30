import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getWeddingAccess } from '@/lib/wedding-access';

export const dynamic = 'force-dynamic';

const ENTOURAGE_INVITATION_COLUMNS = 'id, wedding_id, member_key, name, email, role, message, template_key, card_theme, proposal_title, proposal_hero_image_url, response_details, status, sent_at, responded_at, created_at, updated_at';
const LEGACY_ENTOURAGE_INVITATION_COLUMNS = 'id, wedding_id, member_key, name, email, role, message, template_key, status, sent_at, responded_at, created_at, updated_at';

function isSchemaMissingError(error: any) {
    const message = `${error?.code || ''} ${error?.message || ''} ${error?.details || ''}`.toLowerCase();
    return error?.code === 'PGRST204' || error?.code === '42703' || message.includes('schema cache') || message.includes('column');
}

export async function GET(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error }, { status: 401 });

    const weddingId = new URL(req.url).searchParams.get('weddingId') || '';
    if (!weddingId) {
        return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });
    }

    try {
        const db = getSupabaseAdminClient() as any;
        const access = await getWeddingAccess(db, user, weddingId, {
            select: 'id, user_id',
            collaboratorRoles: ['partner'],
        });

        if (!access.canManage || !access.wedding) {
            return NextResponse.json({ error: 'You do not have permission to view entourage invitations.' }, { status: 403 });
        }

        const query = (columns: string) => db
            .from('entourage_invitations')
            .select(columns)
            .eq('wedding_id', weddingId)
            .order('created_at', { ascending: false });

        let { data, error: listError } = await query(ENTOURAGE_INVITATION_COLUMNS);
        if (listError && isSchemaMissingError(listError)) {
            ({ data, error: listError } = await query(LEGACY_ENTOURAGE_INVITATION_COLUMNS));
        }

        if (listError) throw listError;

        return NextResponse.json({ invitations: data || [] });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load entourage invitations.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

