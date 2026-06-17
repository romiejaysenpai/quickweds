import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getWeddingAccess } from '@/lib/wedding-access';

export const dynamic = 'force-dynamic';

type SharingCodeRow = {
    id: string;
    wedding_id: string;
};

function generateSharingCode() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from(randomBytes(8)).map((byte) => alphabet[byte % alphabet.length]).join('');
}

async function requireCodeAccess(req: NextRequest, weddingId: string) {
    const { user, error } = await getRequestUser(req);
    if (!user) return { response: NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 }) };

    const db = getSupabaseAdminClient() as any;
    const access = await getWeddingAccess(db, user, weddingId);
    if (!access.wedding) return { response: NextResponse.json({ error: 'Wedding not found.' }, { status: 404 }) };
    if (!access.canManage) return { response: NextResponse.json({ error: 'You do not have permission to manage photo sharing codes.' }, { status: 403 }) };

    return { db };
}

async function createSharingCode(req: NextRequest, body: Record<string, unknown>) {
    const weddingId = String(body.weddingId || '').trim();
    if (!weddingId) return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });

    try {
        const context = await requireCodeAccess(req, weddingId);
        if ('response' in context) return context.response;

        const maxUploads = Math.min(50, Math.max(1, Number(body.maxUploads || 3)));
        let lastError: unknown = null;

        for (let attempt = 0; attempt < 5; attempt += 1) {
            const { data, error } = await context.db
                .from('photo_sharing_codes')
                .insert({
                    wedding_id: weddingId,
                    code: generateSharingCode(),
                    is_active: true,
                    max_uploads: maxUploads,
                })
                .select('id, code, is_active, expires_at, max_uploads, current_uploads')
                .single();

            if (!error) return NextResponse.json({ code: data });
            lastError = error;
        }

        throw lastError;
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to generate sharing code.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

async function toggleSharingCode(req: NextRequest, body: Record<string, unknown>) {
    const weddingId = String(body.weddingId || '').trim();
    const codeId = String(body.id || '').trim();
    const isActive = Boolean(body.isActive);
    if (!weddingId || !codeId) return NextResponse.json({ error: 'Wedding ID and sharing code ID are required.' }, { status: 400 });

    try {
        const context = await requireCodeAccess(req, weddingId);
        if ('response' in context) return context.response;

        const { data, error } = await context.db
            .from('photo_sharing_codes')
            .update({ is_active: isActive })
            .eq('id', codeId)
            .eq('wedding_id', weddingId)
            .select('id, code, is_active, expires_at, max_uploads, current_uploads')
            .single();

        if (error) throw error;
        return NextResponse.json({ code: data });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to update sharing code.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

async function deleteSharingCode(req: NextRequest, parsedBody?: Record<string, unknown>) {
    const body = parsedBody || await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);
    const weddingId = String(body.weddingId || searchParams.get('weddingId') || '').trim();
    const codeId = String(body.id || searchParams.get('id') || '').trim();

    if (!weddingId || !codeId) {
        return NextResponse.json({ error: 'Wedding ID and sharing code ID are required.' }, { status: 400 });
    }

    try {
        const context = await requireCodeAccess(req, weddingId);
        if ('response' in context) return context.response;

        const { data, error: lookupError } = await context.db
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

        const { error: deleteError } = await context.db
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
    if (body.action === 'create') return createSharingCode(req, body);
    if (body.action === 'toggle') return toggleSharingCode(req, body);
    if (body.action === 'delete') return deleteSharingCode(req, body);
    return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
    return deleteSharingCode(req);
}
