import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { createRateLimitMiddleware } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const updateReviewSchema = z.object({
    id: z.string().min(1).max(128),
    status: z.enum(['approved', 'pending', 'rejected']).optional(),
    is_featured: z.boolean().optional(),
}).refine((data) => data.status !== undefined || data.is_featured !== undefined, {
    message: 'At least one update field is required.',
});

const deleteReviewSchema = z.object({
    id: z.string().min(1).max(128),
});

async function requireAdmin(req: NextRequest) {
    const { user, error } = await getRequestUser(req);
    if (!user) {
        return { response: NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 }) };
    }
    if (!user.email_confirmed_at || !isKnownAdminEmail(user.email)) {
        return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
    }

    const rateLimit = createRateLimitMiddleware('ADMIN_ACTION');
    const limited = await rateLimit.check(`admin-reviews:${user.id}`);
    if (limited.limited) {
        return { response: limited.response };
    }

    return { user, headers: limited.headers };
}

function revalidateReviewPaths() {
    try {
        revalidatePath('/');
        revalidatePath('/reviews');
        revalidatePath('/admin/reviews');
    } catch {
        // Ignore outside request lifecycle
    }
}

export async function GET(req: NextRequest) {
    const auth = await requireAdmin(req);
    if ('response' in auth) return auth.response;

    try {
        const db = getSupabaseAdminClient() as any;
        const { data, error } = await db
            .from('app_reviews')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(500);

        if (error) {
            console.error('GET /api/admin/reviews error:', error);
            return NextResponse.json({ error: 'Unable to load reviews.' }, { status: 500 });
        }

        return NextResponse.json(
            { success: true, reviews: data || [] },
            { headers: { ...auth.headers, 'Cache-Control': 'no-store' } }
        );
    } catch (err) {
        console.error('GET /api/admin/reviews unexpected error:', err);
        return NextResponse.json({ error: 'Unable to load reviews.' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const auth = await requireAdmin(req);
    if ('response' in auth) return auth.response;

    try {
        const body = await req.json().catch(() => ({}));
        const parsed = updateReviewSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues.map((issue) => issue.message).join(', ') },
                { status: 400 }
            );
        }

        const updatePayload: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };
        if (parsed.data.status !== undefined) updatePayload.status = parsed.data.status;
        if (parsed.data.is_featured !== undefined) updatePayload.is_featured = parsed.data.is_featured;

        const db = getSupabaseAdminClient() as any;
        const { error } = await db
            .from('app_reviews')
            .update(updatePayload)
            .eq('id', parsed.data.id);

        if (error) {
            console.error('PATCH /api/admin/reviews error:', error);
            return NextResponse.json({ error: 'Unable to update review.' }, { status: 500 });
        }

        revalidateReviewPaths();
        return NextResponse.json({ success: true }, { headers: auth.headers });
    } catch (err) {
        console.error('PATCH /api/admin/reviews unexpected error:', err);
        return NextResponse.json({ error: 'Unable to update review.' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const auth = await requireAdmin(req);
    if ('response' in auth) return auth.response;

    try {
        const body = await req.json().catch(() => ({}));
        const parsed = deleteReviewSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Review ID is required.' }, { status: 400 });
        }

        const db = getSupabaseAdminClient() as any;
        const { error } = await db
            .from('app_reviews')
            .delete()
            .eq('id', parsed.data.id);

        if (error) {
            console.error('DELETE /api/admin/reviews error:', error);
            return NextResponse.json({ error: 'Unable to delete review.' }, { status: 500 });
        }

        revalidateReviewPaths();
        return NextResponse.json({ success: true }, { headers: auth.headers });
    } catch (err) {
        console.error('DELETE /api/admin/reviews unexpected error:', err);
        return NextResponse.json({ error: 'Unable to delete review.' }, { status: 500 });
    }
}
