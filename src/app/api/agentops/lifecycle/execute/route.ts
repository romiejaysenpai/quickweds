import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { isAgentAuthorized, executeLifecycleTask, getEligibleLifecycleTasks } from '@/lib/agentops';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const requestSchema = z.object({
    taskId: z.string().min(3).max(160),
    dryRun: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
    if (!isAgentAuthorized(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const parsed = requestSchema.safeParse(await req.json().catch(() => ({})));
        if (!parsed.success) return NextResponse.json({ error: 'A valid task ID is required.' }, { status: 400 });

        const db = getSupabaseAdminClient();
        // Never trust a caller-supplied recipient, lifecycle stage, or consent
        // flag. Rebuild the task from current server-side data instead.
        const task = (await getEligibleLifecycleTasks(db, 1000)).find((candidate) => candidate.id === parsed.data.taskId);
        if (!task) return NextResponse.json({ error: 'Eligible lifecycle task not found.' }, { status: 404 });
        if (!task.optedIn || task.suppressed) return NextResponse.json({ error: 'Recipient is not eligible for this automation.' }, { status: 403 });
        if (task.requiresApproval && !parsed.data.dryRun) {
            return NextResponse.json({ error: 'This lifecycle action requires manual approval.' }, { status: 403 });
        }

        const result = await executeLifecycleTask(db, task, parsed.data.dryRun);

        return NextResponse.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to execute lifecycle task';
        console.error('[agentops/lifecycle/execute] Error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
