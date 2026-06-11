import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { isAgentAuthorized, getEligibleLifecycleTasks } from '@/lib/agentops';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(req: NextRequest) {
    if (!isAgentAuthorized(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const url = new URL(req.url);
        const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 25), 1), 100);

        const db = getSupabaseAdminClient();
        const tasks = await getEligibleLifecycleTasks(db, limit);

        return NextResponse.json({ tasks });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch eligible tasks';
        console.error('[agentops/lifecycle/eligible] Error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
