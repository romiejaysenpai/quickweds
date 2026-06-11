import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { runMarketingNurture } from '@/lib/marketing-nurture';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function isAuthorized(req: NextRequest) {
    const secret = process.env.CRON_SECRET;
    if (!secret) return false;
    return req.headers.get('authorization') === `Bearer ${secret}`;
}

async function run(req: NextRequest) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const body = req.method === 'POST'
        ? await req.json().catch(() => ({}))
        : {};
    const dryRun = url.searchParams.get('dryRun') === 'true' || body.dryRun === true;
    const limitParam = Number(url.searchParams.get('limit') || body.limit || 0);

    try {
        const db = getSupabaseAdminClient() as any;
        const result = await runMarketingNurture(db, {
            dryRun,
            limit: Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined,
        });

        return NextResponse.json({
            ...result,
            triggeredBy: req.headers.get('user-agent') || 'unknown',
            checkedAt: new Date().toISOString(),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Marketing nurture run failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    return run(req);
}

export async function POST(req: NextRequest) {
    return run(req);
}
