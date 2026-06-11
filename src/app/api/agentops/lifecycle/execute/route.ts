import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { isAgentAuthorized, executeLifecycleTask } from '@/lib/agentops';
import type { LifecycleTask } from '@/lib/agentops';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
    if (!isAgentAuthorized(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json().catch(() => ({}));
        const task: LifecycleTask | undefined = body.task;
        const dryRun = Boolean(body.dryRun);

        if (!task || !task.userId || !task.email || !task.lifecycleStage) {
            return NextResponse.json(
                { error: 'Missing required task fields: userId, email, lifecycleStage' },
                { status: 400 }
            );
        }

        const db = getSupabaseAdminClient();
        const result = await executeLifecycleTask(db, task, dryRun);

        return NextResponse.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to execute lifecycle task';
        console.error('[agentops/lifecycle/execute] Error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
