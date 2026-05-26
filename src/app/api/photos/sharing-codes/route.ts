import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getWeddingAccess } from '@/lib/wedding-access';

export const dynamic = 'force-dynamic';

type SharingCodeRow = {
    id: string;
    wedding_id: string;
};

async function deleteSharingCode(req: NextRequest, parsedBody?: Record<string, unknown>) {
    const body = parsedBody || await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);
    const weddingId = String(body.weddingId || searchParams.get('weddingId') || '').trim();
    const codeId = String(body.id || searchParams.get('id') || '').trim();

    if (!weddingId || !codeId) {
        return NextResponse.json({ error: 'Wedding ID and sharing code ID are required.' }, { status: 400 });
    }

    try {
        const { user, error } = await getRequestUser(req);
        if (!user) {
            return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
        }

        const db = getSupabaseAdminClient();
        const access = await getWeddingAccess(db, user, weddingId);
        if (!access.wedding) {
            return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });
        }
        if (!access.canManage) {
            return NextResponse.json({ error: 'You do not have permission to manage photo sharing codes.' }, { status: 403 });
        }

        const { data, error: lookupError } = await db
            .from('photo_sharing_codes')
            .select('id, wedding_id')
            .eq('id', codeId)
            .maybeSingle();

        if (lookupError) throw lookupError;
        const code = data as SharingCodeRow | null;
        if (!code) {
            return NextResponse.json({ success: true, deletedId: codeId, alreadyDeleted: true });
        }
        if (String(code.wedding_id) !== String(weddingId)) {
            return NextResponse.json({ error: 'Sharing code does not belong to this wedding.' }, { status: 403 });
        }

        const { error: deleteError } = await db
            .from('photo_sharing_codes')
            .delete()
            .eq('id', codeId)
            .eq('wedding_id', weddingId);

        if (deleteError) throw deleteError;

        return NextResponse.json({ success: true, deletedId: codeId });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to delete sharing code.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    if (body.action === 'delete') return deleteSharingCode(req, body);
    return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
    return deleteSharingCode(req);
}
