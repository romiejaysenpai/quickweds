import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getWeddingAccess } from '@/lib/wedding-access';
const schema = z.object({ weddingId: z.string().min(1), guestId: z.string().uuid(), tableId: z.string().uuid().nullable() });
export async function POST(req: NextRequest) {
    const { user } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
    const parsed = schema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: 'Invalid seating change.' }, { status: 400 });
    const db = getSupabaseAdminClient() as any;
    const access = await getWeddingAccess(db, user, parsed.data.weddingId);
    if (!access.canManage) return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    const { error } = await db.rpc('qw_assign_seat', { p_wedding: parsed.data.weddingId, p_guest: parsed.data.guestId, p_table: parsed.data.tableId });
    if (error) return NextResponse.json({ error: 'Unable to save seating. Refresh and check available capacity.' }, { status: 409 });
    return NextResponse.json({ success: true });
}
