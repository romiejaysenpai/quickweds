import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const PLANNER_TABLES: Record<string, string> = {
    task: 'planner_tasks',
    budget: 'planner_budgets',
    vendor: 'planner_vendors',
    event: 'planner_events',
    foodDrink: 'planner_food_drinks',
    honeymoon: 'planner_honeymoon_items',
};

async function handleDeletePlannerItem(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);
    const weddingId = String(body.weddingId || searchParams.get('weddingId') || '');
    const itemId = String(body.id || searchParams.get('id') || '');
    const type = String(body.type || searchParams.get('type') || '');
    const table = PLANNER_TABLES[type];

    if (!weddingId || !itemId || !table) {
        return NextResponse.json({ error: 'Wedding ID, item ID, and planner item type are required.' }, { status: 400 });
    }

    try {
        const db = getSupabaseAdminClient() as any;
        const { data: wedding, error: weddingError } = await db
            .from('weddings')
            .select('id, user_id')
            .eq('id', weddingId)
            .maybeSingle();

        if (weddingError) throw weddingError;
        if (!wedding) return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });

        const canManage = wedding.user_id === user.id || isKnownAdminEmail(user.email);
        if (!canManage) {
            return NextResponse.json({ error: 'You do not have permission to delete this planner item.' }, { status: 403 });
        }

        const { data: item, error: itemError } = await db
            .from(table)
            .select('id, wedding_id')
            .eq('id', itemId)
            .maybeSingle();

        if (itemError) throw itemError;
        if (!item) {
            return NextResponse.json({ success: true, deletedId: itemId, type, alreadyDeleted: true });
        }

        if (String(item.wedding_id) !== String(wedding.id)) {
            return NextResponse.json({ error: 'Planner item does not belong to this wedding.' }, { status: 403 });
        }

        const { error: deleteError } = await db
            .from(table)
            .delete()
            .eq('id', itemId)
            .eq('wedding_id', wedding.id);

        if (deleteError) throw deleteError;

        return NextResponse.json({ success: true, deletedId: itemId, type });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to delete planner item.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    return handleDeletePlannerItem(req);
}

export async function DELETE(req: NextRequest) {
    return handleDeletePlannerItem(req);
}
