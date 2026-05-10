import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

export async function PATCH(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const tableId = String(body.tableId || '');
    const positionX = Math.round(clamp(Number(body.positionX), 5, 95));
    const positionY = Math.round(clamp(Number(body.positionY), 7, 93));

    if (!tableId || !Number.isFinite(positionX) || !Number.isFinite(positionY)) {
        return NextResponse.json({ error: 'Table ID and valid table position are required.' }, { status: 400 });
    }

    try {
        const db = getSupabaseAdminClient() as any;
        const { data: table, error: tableError } = await db
            .from('seating_tables')
            .select('id, wedding_id')
            .eq('id', tableId)
            .maybeSingle();

        if (tableError) throw tableError;
        if (!table) return NextResponse.json({ error: 'Table not found.' }, { status: 404 });

        const { data: wedding, error: weddingError } = await db
            .from('weddings')
            .select('id, user_id')
            .eq('id', table.wedding_id)
            .maybeSingle();

        if (weddingError) throw weddingError;
        if (!wedding) return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });

        const canManage = wedding.user_id === user.id || isKnownAdminEmail(user.email);
        if (!canManage) {
            return NextResponse.json({ error: 'You do not have permission to move this table.' }, { status: 403 });
        }

        const { error: updateError } = await db
            .from('seating_tables')
            .update({
                position_x: positionX,
                position_y: positionY,
            })
            .eq('id', tableId);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, tableId, positionX, positionY });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to save table position.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
