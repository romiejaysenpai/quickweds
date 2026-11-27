import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getWeddingAccess } from '@/lib/wedding-access';
import { FREE_PLAN_LIMITS, hasPlannerProAccess } from '@/lib/planner-limits';
import { isKnownAdminEmail } from '@/lib/admin';
const schema = z.object({ weddingId: z.string().min(1).max(100), rows: z.array(z.object({ title: z.string().trim().min(1).max(200), template_key: z.string().min(1).max(100), section: z.string().min(1).max(100), due_date: z.string().nullable().optional(), assigned_to: z.string().max(200).nullable().optional() })).min(1).max(100) });
function isMissingChecklistRpcError(error: any) {
    const code = String(error?.code || '');
    const text = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
    return (
        code === 'PGRST202' ||
        code === '42883' ||
        text.includes('could not find the function') ||
        (text.includes('quickweds_seed_checklist') && text.includes('does not exist'))
    );
}

function getMissingColumn(error: any): string | null {
    const text = `${error?.message || ''} ${error?.details || ''}`;
    const m1 = text.match(/could not find the '([^']+)' column/i);
    if (m1?.[1]) return m1[1];
    const m2 = text.match(/column\s+"?([a-zA-Z0-9_]+)"?\s+(?:of relation|does not exist)/i);
    if (m2?.[1]) return m2[1];
    return null;
}

async function seedChecklistFallback(
    db: any,
    weddingId: string,
    rows: z.infer<typeof schema>['rows'],
    limit: number | null,
) {
    const { data: existingRows, error: existingError } = await db
        .from('planner_tasks')
        .select('id,title,section,category,template_key')
        .eq('wedding_id', weddingId);
    if (existingError) throw existingError;
    const existing = existingRows || [];
    const existingKeys = new Set(existing.map((t: any) => t.template_key).filter(Boolean));
    const existingTitleSections = new Set(
        existing.map((t: any) => {
            const rawSection = String(t.section || t.category || '').split('||QW_TASK_META||')[0];
            return `${String(t.title || '').trim().toLowerCase()}::${rawSection}`;
        }),
    );

    const seenKeys = new Set<string>();
    const toInsert: Record<string, unknown>[] = [];
    for (const item of rows) {
        if (seenKeys.has(item.template_key)) continue;
        seenKeys.add(item.template_key);
        const titleKey = `${item.title.trim().toLowerCase()}::${item.section}`;
        if (existingKeys.has(item.template_key) || existingTitleSections.has(titleKey)) continue;
        toInsert.push({
            wedding_id: weddingId,
            title: item.title,
            status: 'pending',
            category: item.section,
            section: item.section,
            template_key: item.template_key,
            due_date: item.due_date || null,
            assigned_to: item.assigned_to || null,
        });
    }

    if (limit !== null && existing.length + toInsert.length > limit) {
        return { limitReached: true as const, tasks: [] };
    }
    if (toInsert.length === 0) {
        return { limitReached: false as const, tasks: [] };
    }

    let payload = toInsert;
    for (let attempt = 0; attempt < 5; attempt += 1) {
        const { data, error } = await db.from('planner_tasks').insert(payload).select('*');
        if (!error) return { limitReached: false as const, tasks: data || [] };
        const missing = getMissingColumn(error);
        const code = String(error?.code || '');
        if (missing && (code === 'PGRST204' || code === '42703') && missing in payload[0]) {
            console.warn(`[Checklist fallback] Stripping missing planner_tasks.${missing} column and retrying.`);
            payload = payload.map((row) => {
                const copy = { ...row };
                delete copy[missing];
                return copy;
            });
            continue;
        }
        throw error;
    }
    throw new Error('Unable to insert checklist rows after schema retries.');
}

export async function POST(req: NextRequest) {
    const { user } = await getRequestUser(req);
    if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: 'Invalid checklist.' }, { status: 400 });
    try {
        const db = getSupabaseAdminClient() as any;
        const { wedding, canManage } = await getWeddingAccess(db, user, parsed.data.weddingId, { select: 'id,user_id,is_premium,payment_status' });
        if (!wedding || !canManage) return NextResponse.json({ error: 'Wedding not found or access denied.' }, { status: 403 });
        const { data: profile, error: profileError } = await db.from('user_app_profiles').select('is_pro,payment_status').eq('user_id', wedding.user_id).maybeSingle();
        if (profileError) throw profileError;
        const pro = hasPlannerProAccess({ wedding, accountProfile: profile, isAdmin: isKnownAdminEmail(user.email) });
        const limit = pro ? null : FREE_PLAN_LIMITS.checklistTasks;
        const { data, error } = await db.rpc('quickweds_seed_checklist', { p_wedding_id: wedding.id, p_rows: parsed.data.rows, p_limit: limit });
        if (error) {
            if (String(error.message).includes('planner_limit_reached')) return NextResponse.json({ error: 'This checklist exceeds the remaining Free task allowance. Remove tasks or upgrade before adding the full checklist.' }, { status: 402 });
            if (isMissingChecklistRpcError(error)) {
                console.warn('Checklist RPC quickweds_seed_checklist unavailable; using legacy schema fallback.');
                const fallback = await seedChecklistFallback(db, wedding.id, parsed.data.rows, limit);
                if (fallback.limitReached) return NextResponse.json({ error: 'This checklist exceeds the remaining Free task allowance. Remove tasks or upgrade before adding the full checklist.' }, { status: 402 });
                return NextResponse.json({ tasks: fallback.tasks });
            }
            throw error;
        }
        return NextResponse.json({ tasks: data || [] });
    } catch (error) {
        console.error('Checklist creation failed:', error);
        return NextResponse.json({ error: 'Unable to create the checklist. Please try again.' }, { status: 500 });
    }
}
