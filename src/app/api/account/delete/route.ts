import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { invalidateWeddingPublicCache } from '@/lib/public-wedding';

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

    try {
        const db = getSupabaseAdminClient() as any;
        const now = new Date().toISOString();

        const { data: weddings, error: weddingsError } = await db
            .from('weddings')
            .select('id, public_slug')
            .eq('user_id', user.id);

        if (weddingsError) throw weddingsError;

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
            const { error: deleteWeddingsError } = await db
                .from('weddings')
                .delete()
                .in('id', weddingIds);

            if (deleteWeddingsError) {
                console.warn('Account deletion could not hard-delete weddings, falling back to soft delete:', deleteWeddingsError.message);
                const { error: softDeleteError } = await db
                    .from('weddings')
                    .update({ deleted_at: now, user_id: null })
                    .in('id', weddingIds);
                if (softDeleteError) throw softDeleteError;
            }

            await invalidateWeddingPublicCache(...weddingIds, ...(weddings || []).map(
                (wedding: { public_slug?: string | null }) => wedding.public_slug
            ));
        }

        const { error: deleteUserError } = await db.auth.admin.deleteUser(user.id);
        if (deleteUserError) {
            if (weddingIds.length > 0) {
                const { error: softDeleteError } = await db
                    .from('weddings')
                    .update({ deleted_at: now, user_id: null })
                    .in('id', weddingIds);
                if (softDeleteError) throw softDeleteError;
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
