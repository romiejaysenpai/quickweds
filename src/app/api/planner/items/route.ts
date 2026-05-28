import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { isKnownAdminEmail } from '@/lib/admin';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import {
    getPlannerLimitMessage,
    getPlannerUsage,
    hasPlannerProAccess,
    PLANNER_ITEM_LIMITS,
    PLANNER_USAGE_KEYS,
    type PlannerItemType,
} from '@/lib/planner-limits';

export const dynamic = 'force-dynamic';

const PLANNER_TABLES: Record<string, string> = {
    task: 'planner_tasks',
    budget: 'planner_budgets',
    vendor: 'planner_vendors',
    event: 'planner_events',
    foodDrink: 'planner_food_drinks',
    honeymoon: 'planner_honeymoon_items',
};

const TASK_META_SEPARATOR = '||QW_TASK_META||';

function isSchemaMissingError(error: any) {
    const text = `${error?.code || ''} ${error?.message || ''} ${error?.details || ''}`.toLowerCase();
    return (
        text.includes('schema cache') ||
        text.includes('does not exist') ||
        text.includes('could not find') ||
        text.includes('column') ||
        error?.code === 'PGRST204' ||
        error?.code === 'PGRST205' ||
        error?.code === '42P01' ||
        error?.code === '42703'
    );
}

function getMissingColumnName(error: any): string | null {
    if (!error) return null;
    const message = String(error.message || error.details || '').toLowerCase();

    const match1 = message.match(/could not find the '([^']+)' column/);
    if (match1 && match1[1]) return match1[1];

    const match2 = message.match(/column "([^"]+)" of relation/);
    if (match2 && match2[1]) return match2[1];

    const match3 = message.match(/column "([^"]+)" does not exist/);
    if (match3 && match3[1]) return match3[1];

    return null;
}

function cleanString(value: unknown) {
    const text = String(value || '').trim();
    return text || null;
}

function getTaskFallbackCategory(values: Record<string, any>) {
    const section = cleanString(values.section || values.category) || 'General';
    const meta: Record<string, any> = { section };
    for (const key of ['assigned_to', 'planner_vendor_id', 'custom_supplier_name', 'notes', 'template_key']) {
        const value = cleanString(values[key]);
        if (value) meta[key] = value;
    }

    if (Object.keys(meta).length <= 1) return section;
    return `${section}${TASK_META_SEPARATOR}${JSON.stringify(meta)}`;
}

function getTaskFallbackResponseItem(data: Record<string, any>, values: Record<string, any>) {
    const section = cleanString(values.section || values.category) || cleanString(data.category) || 'General';
    return {
        ...data,
        section,
        category: section,
        assigned_to: cleanString(values.assigned_to),
        planner_vendor_id: values.planner_vendor_id || null,
        custom_supplier_name: cleanString(values.custom_supplier_name),
        notes: cleanString(values.notes),
        template_key: cleanString(values.template_key),
    };
}

function getTaskCreatePayload(weddingId: string, values: Record<string, any>) {
    const section = cleanString(values.section || values.category) || 'General';
    return {
        wedding_id: weddingId,
        title: cleanString(values.title),
        status: cleanString(values.status) || 'pending',
        category: section,
        section,
        due_date: values.due_date || null,
        assigned_to: cleanString(values.assigned_to),
        planner_vendor_id: values.planner_vendor_id || null,
        custom_supplier_name: cleanString(values.custom_supplier_name),
        notes: cleanString(values.notes),
        template_key: cleanString(values.template_key),
        updated_at: new Date().toISOString(),
    };
}

function getTaskFallbackPayload(weddingId: string, values: Record<string, any>) {
    return {
        wedding_id: weddingId,
        title: cleanString(values.title),
        status: cleanString(values.status) || 'pending',
        category: getTaskFallbackCategory(values),
        due_date: values.due_date || null,
    };
}

function getCreatePayload(type: string, weddingId: string, values: Record<string, any>) {
    if (type === 'task') return getTaskCreatePayload(weddingId, values);
    if (type === 'budget') {
        return {
            wedding_id: weddingId,
            category: cleanString(values.category) || 'General',
            item_name: cleanString(values.item_name),
            estimated_cost: Number(values.estimated_cost || 0),
            actual_cost: Number(values.actual_cost || 0),
            is_paid: Boolean(values.is_paid),
        };
    }
    if (type === 'vendor') {
        return {
            wedding_id: weddingId,
            role: cleanString(values.role) || 'Supplier',
            name: cleanString(values.name),
            email: cleanString(values.email),
            phone: cleanString(values.phone),
            notes: cleanString(values.notes),
            amount: Number(values.amount || 0),
            payment_status: cleanString(values.payment_status) || 'not paid',
            payment_method: cleanString(values.payment_method) || 'other',
            directory_supplier_id: values.directory_supplier_id || null,
        };
    }
    if (type === 'event') {
        return {
            wedding_id: weddingId,
            title: cleanString(values.title),
            starts_at: values.starts_at,
            ends_at: values.ends_at || null,
            location: cleanString(values.location),
            notes: cleanString(values.notes),
            planner_task_id: values.planner_task_id || null,
            reminder_minutes: Number(values.reminder_minutes || 1440),
            updated_at: new Date().toISOString(),
        };
    }
    if (type === 'foodDrink') {
        return {
            wedding_id: weddingId,
            item_type: cleanString(values.item_type) || 'food',
            item_name: cleanString(values.item_name),
            serving_category: cleanString(values.serving_category),
            reference_image_url: cleanString(values.reference_image_url),
            estimated_cost: Number(values.estimated_cost || 0),
            planner_vendor_id: values.planner_vendor_id || null,
            custom_supplier_name: cleanString(values.custom_supplier_name),
            notes: cleanString(values.notes),
            updated_at: new Date().toISOString(),
        };
    }
    if (type === 'honeymoon') {
        return {
            wedding_id: weddingId,
            category: cleanString(values.category) || 'destination',
            title: cleanString(values.title),
            destination: cleanString(values.destination),
            start_date: values.start_date || null,
            end_date: values.end_date || null,
            estimated_cost: Number(values.estimated_cost || 0),
            status: cleanString(values.status) || 'idea',
            supplier_name: cleanString(values.supplier_name),
            booking_link: cleanString(values.booking_link),
            notes: cleanString(values.notes),
            updated_at: new Date().toISOString(),
        };
    }
    return { wedding_id: weddingId };
}

function getUpdatePayload(type: string, values: Record<string, any>) {
    const payload: Record<string, any> = {};
    const allowed = type === 'task'
        ? ['title', 'status', 'category', 'section', 'due_date', 'assigned_to', 'planner_vendor_id', 'custom_supplier_name', 'notes', 'template_key']
        : Object.keys(values);

    for (const key of allowed) {
        if (Object.prototype.hasOwnProperty.call(values, key)) {
            payload[key] = values[key] === '' ? null : values[key];
        }
    }

    if (type === 'task' && payload.section && !payload.category) {
        payload.category = payload.section;
    }

    if (type !== 'budget' && type !== 'vendor') {
        payload.updated_at = new Date().toISOString();
    }

    delete payload.id;
    delete payload.wedding_id;
    return payload;
}

function getTaskUpdateFallbackPayload(values: Record<string, any>) {
    const payload: Record<string, any> = {};
    if (Object.prototype.hasOwnProperty.call(values, 'title')) payload.title = cleanString(values.title);
    if (Object.prototype.hasOwnProperty.call(values, 'status')) payload.status = cleanString(values.status) || 'pending';
    if (Object.prototype.hasOwnProperty.call(values, 'due_date')) payload.due_date = values.due_date || null;
    if (Object.prototype.hasOwnProperty.call(values, 'section') || Object.prototype.hasOwnProperty.call(values, 'category')) {
        payload.category = getTaskFallbackCategory(values);
    }
    return payload;
}

async function getAuthorizedPlannerContext(req: NextRequest, weddingId: string) {
    const { user, error } = await getRequestUser(req);
    if (!user) {
        return { response: NextResponse.json({ error }, { status: 401 }) };
    }

    const db = getSupabaseAdminClient() as any;
    const { data: wedding, error: weddingError } = await db
        .from('weddings')
        .select('id, user_id, is_premium, payment_status')
        .eq('id', weddingId)
        .maybeSingle();

    if (weddingError) throw weddingError;
    if (!wedding) {
        return { response: NextResponse.json({ error: 'Wedding not found.' }, { status: 404 }) };
    }

    const canManage = wedding.user_id === user.id || isKnownAdminEmail(user.email);
    if (!canManage) {
        return { response: NextResponse.json({ error: 'You do not have permission to manage this planner.' }, { status: 403 }) };
    }

    const accountProfile = await db
        .from('user_app_profiles')
        .select('is_pro, payment_status')
        .eq('user_id', wedding.user_id)
        .maybeSingle();

    if (accountProfile.error) throw accountProfile.error;

    return {
        db,
        wedding,
        user,
        isAdmin: isKnownAdminEmail(user.email),
        hasPlannerPro: hasPlannerProAccess({
            isAdmin: isKnownAdminEmail(user.email),
            wedding,
            accountProfile: accountProfile.data,
        }),
    };
}

async function handleDeletePlannerItem(req: NextRequest, parsedBody?: Record<string, any>) {
    const body = parsedBody || await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);
    const weddingId = String(body.weddingId || searchParams.get('weddingId') || '');
    const itemId = String(body.id || searchParams.get('id') || '');
    const type = String(body.type || searchParams.get('type') || '');
    const table = PLANNER_TABLES[type];

    if (!weddingId || !itemId || !table) {
        return NextResponse.json({ error: 'Wedding ID, item ID, and planner item type are required.' }, { status: 400 });
    }

    try {
        const context = await getAuthorizedPlannerContext(req, weddingId);
        if (context.response) return context.response;
        const { db, wedding } = context;

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
        console.error('Error in handleDeletePlannerItem:', err);
        const message = err instanceof Error ? err.message : String((err as any)?.message || err || 'Unable to delete planner item.');
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

async function handleCreatePlannerItem(req: NextRequest, parsedBody?: Record<string, any>) {
    const body = parsedBody || await req.json().catch(() => ({}));
    const weddingId = String(body.weddingId || '');
    const type = String(body.type || '');
    const table = PLANNER_TABLES[type];
    const values = (body.values || body.item || {}) as Record<string, any>;

    if (!weddingId || !table) {
        return NextResponse.json({ error: 'Wedding ID and planner item type are required.' }, { status: 400 });
    }

    try {
        const context = await getAuthorizedPlannerContext(req, weddingId);
        if (context.response) return context.response;
        const { db, hasPlannerPro } = context;
        const payload = getCreatePayload(type, weddingId, values);

        if (!cleanString((payload as any).title || (payload as any).item_name || (payload as any).name || (payload as any).category)) {
            return NextResponse.json({ error: 'Planner item title/name is required.' }, { status: 400 });
        }

        if (!hasPlannerPro && Object.prototype.hasOwnProperty.call(PLANNER_ITEM_LIMITS, type)) {
            const usage = await getPlannerUsage(db, weddingId);
            const limit = PLANNER_ITEM_LIMITS[type as PlannerItemType];
            const usageKey = PLANNER_USAGE_KEYS[type as PlannerItemType];
            if (usage[usageKey] >= limit) {
                return NextResponse.json({
                    error: getPlannerLimitMessage(type as PlannerItemType),
                    code: 'planner_lite_limit_reached',
                    limit,
                    used: usage[usageKey],
                    type,
                }, { status: 402 });
            }
        }

        let currentPayload = { ...payload };
        let result = await db.from(table).insert(currentPayload).select('*').single();

        // Dynamically strip missing columns (like due_date) and retry
        let retryCount = 0;
        while (result.error && isSchemaMissingError(result.error) && retryCount < 5) {
            const missingColumn = getMissingColumnName(result.error);
            if (missingColumn && missingColumn in currentPayload) {
                console.warn(`[Supabase Schema Fallback] Stripping missing column '${missingColumn}' and retrying insert...`);
                delete (currentPayload as any)[missingColumn];
                result = await db.from(table).insert(currentPayload).select('*').single();
                retryCount++;
            } else {
                break;
            }
        }

        if (!result.error) {
            return NextResponse.json({ success: true, item: result.data, type });
        }

        if (type === 'task' && isSchemaMissingError(result.error)) {
            let fallbackPayload = getTaskFallbackPayload(weddingId, values);
            let fallback = await db.from(table).insert(fallbackPayload).select('*').single();

            let fbRetryCount = 0;
            while (fallback.error && isSchemaMissingError(fallback.error) && fbRetryCount < 5) {
                const missingColumn = getMissingColumnName(fallback.error);
                if (missingColumn && missingColumn in fallbackPayload) {
                    console.warn(`[Supabase Fallback Schema Fallback] Stripping missing column '${missingColumn}' and retrying fallback insert...`);
                    delete (fallbackPayload as any)[missingColumn];
                    fallback = await db.from(table).insert(fallbackPayload).select('*').single();
                    fbRetryCount++;
                } else {
                    break;
                }
            }

            if (!fallback.error) {
                return NextResponse.json({ success: true, item: getTaskFallbackResponseItem(fallback.data, values), type, fallback: true });
            }
            throw fallback.error;
        }

        throw result.error;
    } catch (err) {
        console.error('Error in handleCreatePlannerItem:', err);
        const message = err instanceof Error ? err.message : String((err as any)?.message || err || 'Unable to create planner item.');
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const weddingId = String(body.weddingId || '');
    const itemId = String(body.id || '');
    const type = String(body.type || '');
    const table = PLANNER_TABLES[type];
    const values = (body.values || body.patch || {}) as Record<string, any>;

    if (!weddingId || !itemId || !table) {
        return NextResponse.json({ error: 'Wedding ID, item ID, and planner item type are required.' }, { status: 400 });
    }

    try {
        const context = await getAuthorizedPlannerContext(req, weddingId);
        if (context.response) return context.response;
        const { db } = context;

        const item = await db.from(table).select('id, wedding_id').eq('id', itemId).maybeSingle();
        if (item.error) throw item.error;
        if (!item.data) return NextResponse.json({ success: true, alreadyDeleted: true, id: itemId, type });
        if (String(item.data.wedding_id) !== String(weddingId)) {
            return NextResponse.json({ error: 'Planner item does not belong to this wedding.' }, { status: 403 });
        }

        const payload = getUpdatePayload(type, values);
        let currentPayload = { ...payload };
        let result = await db.from(table).update(currentPayload).eq('id', itemId).eq('wedding_id', weddingId).select('*').single();

        // Dynamically strip missing columns (like due_date) and retry
        let retryCount = 0;
        while (result.error && isSchemaMissingError(result.error) && retryCount < 5) {
            const missingColumn = getMissingColumnName(result.error);
            if (missingColumn && missingColumn in currentPayload) {
                console.warn(`[Supabase Schema Fallback] Stripping missing column '${missingColumn}' and retrying update...`);
                delete (currentPayload as any)[missingColumn];
                result = await db.from(table).update(currentPayload).eq('id', itemId).eq('wedding_id', weddingId).select('*').single();
                retryCount++;
            } else {
                break;
            }
        }

        if (!result.error) return NextResponse.json({ success: true, item: result.data, type });

        if (type === 'task' && isSchemaMissingError(result.error)) {
            let fallbackPayload = getTaskUpdateFallbackPayload(values);
            let fallback = await db.from(table).update(fallbackPayload).eq('id', itemId).eq('wedding_id', weddingId).select('*').single();

            let fbRetryCount = 0;
            while (fallback.error && isSchemaMissingError(fallback.error) && fbRetryCount < 5) {
                const missingColumn = getMissingColumnName(fallback.error);
                if (missingColumn && missingColumn in fallbackPayload) {
                    console.warn(`[Supabase Fallback Schema Fallback] Stripping missing column '${missingColumn}' and retrying fallback update...`);
                    delete (fallbackPayload as any)[missingColumn];
                    fallback = await db.from(table).update(fallbackPayload).eq('id', itemId).eq('wedding_id', weddingId).select('*').single();
                    fbRetryCount++;
                } else {
                    break;
                }
            }

            if (!fallback.error) return NextResponse.json({ success: true, item: getTaskFallbackResponseItem(fallback.data, values), type, fallback: true });
            throw fallback.error;
        }

        throw result.error;
    } catch (err) {
        console.error('Error in PATCH planner item:', err);
        const message = err instanceof Error ? err.message : String((err as any)?.message || err || 'Unable to update planner item.');
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    if (body.action === 'delete') return handleDeletePlannerItem(req, body);
    return handleCreatePlannerItem(req, body);
}

export async function DELETE(req: NextRequest) {
    return handleDeletePlannerItem(req);
}
