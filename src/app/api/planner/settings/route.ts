import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getAuthenticatedRequest } from '@/lib/api-rate-limit';
import { getSupportedCurrencyCode } from '@/lib/currency';
import { sanitizeWeddingId } from '@/lib/rate-limit';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getWeddingAccess } from '@/lib/wedding-access';

export const dynamic = 'force-dynamic';

const MAX_BUDGET_AMOUNT = 999_999_999;
const MAX_GUEST_LIMIT = 100_000;

type SupabaseQueryBuilder = {
    select: (columns?: string) => SupabaseQueryBuilder;
    update: (values: Record<string, unknown>) => SupabaseQueryBuilder;
    eq: (column: string, value: unknown) => SupabaseQueryBuilder;
    single: () => Promise<{ data: unknown; error: Error | null }>;
};

type SupabaseAdminClientLike = {
    from: (table: string) => SupabaseQueryBuilder;
};

function getNonNegativeNumber(value: unknown, max: number) {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < 0) return null;
    return Math.min(amount, max);
}

function getNonNegativeInteger(value: unknown, max: number) {
    const amount = getNonNegativeNumber(value, max);
    if (amount === null) return null;
    return Math.floor(amount);
}

export async function PATCH(req: NextRequest) {
    const auth = await getAuthenticatedRequest(req, 'AUTHENTICATED_DEFAULT');
    if (auth.response) return auth.response;

    const body = await req.json().catch(() => ({}));
    const weddingId = sanitizeWeddingId(String(body.weddingId || ''));
    if (!weddingId) {
        return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });
    }

    try {
        const db = getSupabaseAdminClient() as unknown as SupabaseAdminClientLike;
        const access = await getWeddingAccess(db, auth.user, weddingId, {
            select: 'id, user_id',
            collaboratorRoles: [],
        });

        if (!access.wedding) {
            return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });
        }

        if (!access.canManage) {
            return NextResponse.json({ error: 'You do not have permission to update this wedding budget.' }, { status: 403 });
        }

        const update: Record<string, unknown> = {};

        if (Object.prototype.hasOwnProperty.call(body, 'total_budget')) {
            const totalBudget = getNonNegativeNumber(body.total_budget, MAX_BUDGET_AMOUNT);
            if (totalBudget === null) {
                return NextResponse.json({ error: 'Total budget must be zero or higher.' }, { status: 400 });
            }
            update.total_budget = totalBudget;
        }

        if (Object.prototype.hasOwnProperty.call(body, 'guest_limit')) {
            const guestLimit = getNonNegativeInteger(body.guest_limit, MAX_GUEST_LIMIT);
            if (guestLimit === null) {
                return NextResponse.json({ error: 'Guest target must be zero or higher.' }, { status: 400 });
            }
            update.guest_limit = guestLimit;
        }

        if (Object.prototype.hasOwnProperty.call(body, 'currency')) {
            const currency = getSupportedCurrencyCode(String(body.currency || ''));
            if (!currency) {
                return NextResponse.json({ error: 'Unsupported budget currency.' }, { status: 400 });
            }
            update.currency = currency;
        }

        if (Object.keys(update).length === 0) {
            return NextResponse.json({ error: 'No budget settings were provided.' }, { status: 400 });
        }

        const responseColumns = ['id', 'user_id', ...Object.keys(update)].join(', ');
        const { data, error } = await db
            .from('weddings')
            .update(update)
            .eq('id', weddingId)
            .select(responseColumns)
            .single();

        if (error) throw error;

        return NextResponse.json({ wedding: data }, { headers: auth.rateLimitHeaders });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to save budget settings.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
