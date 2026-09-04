import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getAuthenticatedRequest } from '@/lib/api-rate-limit';
import { isKnownAdminEmail } from '@/lib/admin';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getPlannerUsage, hasPlannerProAccess, PLANNER_ITEM_LIMITS } from '@/lib/planner-limits';
import { sanitizeInput, sanitizeUUID } from '@/lib/rate-limit';
import { getTemplateSuggestedDueDate } from '@/lib/checklist-templates';

export const dynamic = 'force-dynamic';

const MAX_ITEMS_PER_ADD = 200;
const MAX_SELECTED_IDS = 200;
const BOX_STATUS_DEFAULT = 'not_started';

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

function cleanString(value: unknown) {
    const text = String(value || '').trim();
    return text || null;
}

async function findWeddingAccess(db: any, user: { id: string; email?: string }, weddingId: string) {
    const { data: wedding, error } = await db
        .from('weddings')
        .select('id, user_id, wedding_date, is_premium, payment_status')
        .eq('id', weddingId)
        .is('deleted_at', null)
        .maybeSingle();

    if (error) throw error;
    if (!wedding) return { wedding: null, role: null, canManage: false };

    if (wedding.user_id === user.id || isKnownAdminEmail(user.email)) {
        return { wedding, role: 'owner' as const, canManage: true };
    }

    const userEmail = user.email?.trim().toLowerCase();
    if (userEmail) {
        const { data: collaborator, error: collaboratorError } = await db
            .from('wedding_collaborators')
            .select('role, status')
            .eq('wedding_id', weddingId)
            .eq('email', userEmail)
            .eq('status', 'accepted')
            .in('role', ['partner', 'coordinator'])
            .maybeSingle();

        if (collaboratorError) throw collaboratorError;
        if (collaborator) {
            return { wedding, role: collaborator.role as 'partner' | 'coordinator', canManage: true };
        }
    }

    return { wedding, role: null, canManage: false };
}

function buildTemplateRow(template: Record<string, any>, additionsById: Map<string, number>) {
    const addedCount = additionsById.get(String(template.id)) || 0;
    const itemCountObj = Array.isArray(template.checklist_template_items) ? template.checklist_template_items[0] : null;
    const sectionCountObj = Array.isArray(template.checklist_template_sections) ? template.checklist_template_sections[0] : null;

    return {
        id: template.id,
        key: template.key,
        name: template.name,
        description: template.description || '',
        category: template.category || 'wedding-day',
        supports_box_packing: Boolean(template.supports_box_packing),
        item_count: Number(itemCountObj?.count || itemCountObj || 0),
        section_count: Number(sectionCountObj?.count || sectionCountObj || 0),
        already_added: addedCount > 0,
        added_count: addedCount,
    };
}

const TEMPLATE_SELECT = 'id, key, name, description, category, supports_box_packing, is_active, checklist_template_items(count), checklist_template_sections(count)';

async function getTemplateLibrary(db: any, weddingId: string) {
    const { data: templates, error: templatesError } = await db
        .from('checklist_templates')
        .select(TEMPLATE_SELECT)
        .eq('is_active', true)
        .order('name', { ascending: true });

    if (templatesError) throw templatesError;

    const { data: additions, error: additionsError } = await db
        .from('wedding_checklist_template_additions')
        .select('template_id, add_count')
        .eq('wedding_id', weddingId);

    if (additionsError) throw additionsError;

    const additionsById = new Map<string, number>();
    for (const row of additions || []) {
        additionsById.set(String(row.template_id), Number(row.add_count || 1));
    }

    return (templates || []).map((template: Record<string, any>) => buildTemplateRow(template, additionsById));
}
async function getTemplatePreview(db: any, weddingId: string, templateId: string) {
    const { data: template, error: templateError } = await db
        .from('checklist_templates')
        .select(TEMPLATE_SELECT)
        .eq('id', templateId)
        .eq('is_active', true)
        .maybeSingle();

    if (templateError) throw templateError;
    if (!template) return { template: null, sections: [] };

    const { data: additions, error: additionsError } = await db
        .from('wedding_checklist_template_additions')
        .select('template_id, add_count')
        .eq('wedding_id', weddingId)
        .eq('template_id', templateId)
        .maybeSingle();

    if (additionsError) throw additionsError;

    const [sectionsResult, itemsResult] = await Promise.all([
        db.from('checklist_template_sections').select('id, template_id, section_key, name, sort_order').eq('template_id', templateId).order('sort_order', { ascending: true }),
        db.from('checklist_template_items').select('*').eq('template_id', templateId).order('sort_order', { ascending: true }),
    ]);

    if (sectionsResult.error) throw sectionsResult.error;
    if (itemsResult.error) throw itemsResult.error;

    const sections = (sectionsResult.data || []).map((section: Record<string, any>) => ({
        id: section.id,
        template_id: section.template_id,
        section_key: section.section_key,
        name: section.name,
        sort_order: section.sort_order,
        items: (itemsResult.data || [])
            .filter((item: Record<string, any>) => String(item.section_id) === String(section.id))
            .map((item: Record<string, any>) => ({
                id: item.id,
                template_id: item.template_id,
                section_id: item.section_id,
                item_key: item.item_key,
                title: item.title,
                description: item.description || '',
                notes: item.notes,
                is_optional: Boolean(item.is_optional),
                quantity: Number(item.quantity ?? 1),
                assigned_person: item.assigned_person,
                location: item.location,
                not_included: Boolean(item.not_included),
                due_offset_days: item.due_offset_days,
                sort_order: Number(item.sort_order || 0),
            })),
    }));

    const previewAdditionsById = new Map<string, number>();
    if (additions) previewAdditionsById.set(String(additions.template_id), Number(additions.add_count || 1));

    return {
        template: buildTemplateRow(template, previewAdditionsById),
        sections,
    };
}

function sanitizeIdList(value: unknown, label: string) {
    if (!Array.isArray(value)) return { ids: [], error: `${label} must be a list of ids.` };
    if (value.length > MAX_SELECTED_IDS) return { ids: [], error: `${label} contains too many entries.` };

    const ids: string[] = [];
    for (const raw of value) {
        const id = sanitizeUUID(String(raw || ''));
        if (!id) return { ids: [], error: `${label} contains an invalid id.` };
        ids.push(id);
    }
    return { ids, error: null };
}

export async function GET(req: NextRequest) {
    const auth = await getAuthenticatedRequest(req, 'AUTHENTICATED_DEFAULT');
    if (auth.response) return auth.response;
    const { user } = auth;

    const { searchParams } = new URL(req.url);
    const weddingId = sanitizeUUID(searchParams.get('weddingId') || '');
    const templateId = sanitizeUUID(searchParams.get('templateId') || '');

    if (!weddingId) {
        return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });
    }

    try {
        const db = getSupabaseAdminClient() as any;
        const access = await findWeddingAccess(db, user, weddingId);

        if (!access.wedding) {
            return NextResponse.json({ error: 'Wedding not found for this checklist template library.' }, { status: 404 });
        }

        if (!access.canManage) {
            return NextResponse.json({ error: 'You do not have access to this wedding.' }, { status: 403 });
        }

        if (templateId) {
            const preview = await getTemplatePreview(db, weddingId, templateId);
            if (!preview.template) {
                return NextResponse.json({ error: 'Checklist template not found.' }, { status: 404 });
            }
            return NextResponse.json(preview);
        }

        const templates = await getTemplateLibrary(db, weddingId);
        return NextResponse.json({ templates });
    } catch (err) {
        console.error('Error loading checklist templates:', err);
        const message = err instanceof Error ? err.message : String((err as any)?.message || 'Unable to load checklist templates.');
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
export async function POST(req: NextRequest) {
    const auth = await getAuthenticatedRequest(req, 'CHECKLIST_TEMPLATE_ADD');
    if (auth.response) return auth.response;
    const { user } = auth;

    const body = await req.json().catch(() => ({}));
    const weddingId = sanitizeUUID(String(body.weddingId || ''));
    const templateId = sanitizeUUID(String(body.templateId || ''));
    const checklistName = sanitizeInput(body.checklistName, { maxLength: 120 }) || null;
    const assignTo = sanitizeInput(body.assignTo, { maxLength: 80 }) || null;
    const mode = body.mode === 'selected' ? 'selected' : 'all';
    const addAnyway = Boolean(body.addAnyway);
    const applySuggestDueDates = body.applySuggestDueDates !== false;

    if (!weddingId) {
        return NextResponse.json({ error: 'Wedding ID is required.' }, { status: 400 });
    }
    if (!templateId) {
        return NextResponse.json({ error: 'Template ID is required.' }, { status: 400 });
    }
    if (!checklistName) {
        return NextResponse.json({ error: 'Checklist name is required.' }, { status: 400 });
    }

    const sectionIdsResult = sanitizeIdList(body.sectionIds, 'sectionIds');
    if (sectionIdsResult.error) return NextResponse.json({ error: sectionIdsResult.error }, { status: 400 });
    const itemIdsResult = sanitizeIdList(body.itemIds, 'itemIds');
    if (itemIdsResult.error) return NextResponse.json({ error: itemIdsResult.error }, { status: 400 });

    try {
        const db = getSupabaseAdminClient() as any;
        const access = await findWeddingAccess(db, user, weddingId);

        if (!access.wedding) {
            return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });
        }

        // Writing to the checklist stays owner/admin-only, matching the existing
        // planner items API. Accepted collaborators can view the template library.
        if (!(access.wedding.user_id === user.id) && !isKnownAdminEmail(user.email)) {
            return NextResponse.json({
                error: 'Only the couple (wedding owner) can add checklist templates.',
            }, { status: 403 });
        }

        const { data: template, error: templateError } = await db
            .from('checklist_templates')
            .select('id, key, name, supports_box_packing')
            .eq('id', templateId)
            .eq('is_active', true)
            .maybeSingle();

        if (templateError) throw templateError;
        if (!template) {
            return NextResponse.json({ error: 'Checklist template not found.' }, { status: 404 });
        }

        const { data: sections, error: sectionsError } = await db
            .from('checklist_template_sections')
            .select('*')
            .eq('template_id', templateId)
            .order('sort_order', { ascending: true });
        if (sectionsError) throw sectionsError;

        const { data: templateItems, error: itemsError } = await db
            .from('checklist_template_items')
            .select('*')
            .eq('template_id', templateId)
            .order('sort_order', { ascending: true });
        if (itemsError) throw itemsError;

        const sectionIds = new Set(sectionIdsResult.ids);
        const itemIds = new Set(itemIdsResult.ids);
        const validSectionIds = new Set((sections || []).map((section: any) => String(section.id)));
        const validItemIds = new Set((templateItems || []).map((item: any) => String(item.id)));

        for (const id of sectionIds) {
            if (!validSectionIds.has(id)) {
                return NextResponse.json({ error: 'One or more selected sections do not belong to this template.' }, { status: 400 });
            }
        }
        for (const id of itemIds) {
            if (!validItemIds.has(id)) {
                return NextResponse.json({ error: 'One or more selected items do not belong to this template.' }, { status: 400 });
            }
        }

        let selected = (templateItems || []) as Array<Record<string, any>>;
        if (mode === 'selected') {
            const sectionItemIds = new Set<string>(
                (sections || [])
                    .filter((section: any) => sectionIds.has(String(section.id)))
                    .flatMap((section: any) => (templateItems || [])
                        .filter((item: any) => String(item.section_id) === String(section.id))
                        .map((item: any) => String(item.id))),
            );

            selected = selected.filter((item: any) => itemIds.has(String(item.id)) || sectionItemIds.has(String(item.id)));
        }

        if (selected.length === 0) {
            return NextResponse.json({ error: 'No checklist items were selected.' }, { status: 400 });
        }
        if (selected.length > MAX_ITEMS_PER_ADD) {
            return NextResponse.json({ error: 'A single checklist template add cannot exceed 200 items.' }, { status: 400 });
        }
// Duplicate protection: same template already added to this wedding.
        const { data: existingAddition, error: additionError } = await db
            .from('wedding_checklist_template_additions')
            .select('id, add_count')
            .eq('wedding_id', weddingId)
            .eq('template_id', templateId)
            .maybeSingle();
        if (additionError) throw additionError;

        const wasAlreadyAdded = Boolean(existingAddition);
        if (wasAlreadyAdded && !addAnyway) {
            return NextResponse.json({
                error: 'This template was already added to your checklist. You can add it again intentionally or skip duplicate items.',
                code: 'template_already_added',
                alreadyAdded: true,
                addCount: Number(existingAddition.add_count || 1),
            }, { status: 409 });
        }

        // Respect the existing Planner Lite limits (same as /api/planner/items).
        const accountProfile = await db.from('user_app_profiles').select('is_pro, payment_status').eq('user_id', access.wedding.user_id).maybeSingle();
        const hasPlannerPro = hasPlannerProAccess({
            isAdmin: isKnownAdminEmail(user.email),
            wedding: access.wedding,
            accountProfile: accountProfile.data,
        });

        if (!hasPlannerPro) {
            const usage = await getPlannerUsage(db, weddingId);
            const limit = PLANNER_ITEM_LIMITS.task;
            if (usage.tasks + selected.length > limit) {
                return NextResponse.json({
                    error: `This template adds ${selected.length} checklist task${selected.length === 1 ? '' : 's'}, but Free Planner Lite includes ${limit} checklist tasks total. Upgrade to Planner Pro for unlimited planning.`,
                    code: 'planner_lite_limit_reached',
                    limit,
                    used: usage.tasks,
                    type: 'task',
                    neededByTemplate: selected.length,
                }, { status: 402 });
            }
        }

        const sectionsById = new Map<string, Record<string, any>>();
        for (const section of sections || []) {
            sectionsById.set(String(section.id), section);
        }

        const taskRows = selected.map((item, index) => {
            const section = sectionsById.get(String(item.section_id)) || { name: 'General' };
            const responsible = cleanString(item.assigned_person) || (assignTo && assignTo !== 'Couple' ? assignTo : null);
            const suggestedDate = applySuggestDueDates && access.wedding.wedding_date && item.due_offset_days !== null && item.due_offset_days !== undefined
                ? getTemplateSuggestedDueDate(access.wedding.wedding_date, Number(item.due_offset_days))
                : null;

            return {
                wedding_id: weddingId,
                title: cleanString(item.title),
                status: 'pending',
                category: section.name || 'General',
                section: section.name || 'General',
                due_date: suggestedDate || null,
                assigned_to: responsible,
                notes: cleanString(item.notes) || cleanString(item.description),
                template_key: `checklist-template:${template.key}`,
                is_optional: Boolean(item.is_optional),
                quantity: item.quantity != null ? Number(item.quantity) : 1,
                responsible_person: responsible,
                location: cleanString(item.location) || section.name || null,
                not_included: Boolean(item.not_included),
                source_template_id: template.id,
                source_template_key: template.key,
                box_status: BOX_STATUS_DEFAULT,
                sort_order: (index + 1) * 10,
                updated_at: new Date().toISOString(),
            };
        });
let results: { data?: any; error?: any } = await db.from('planner_tasks').insert(taskRows).select('*');
        if (results.error && isSchemaMissingError(results.error)) {
            // Fallback: keep only long-supported columns if the extended template
            // columns have not been applied to this database yet.
            const baseRows = taskRows.map((row: Record<string, any>) => ({
                wedding_id: row.wedding_id,
                title: row.title,
                status: row.status,
                category: row.category,
                section: row.section,
                due_date: row.due_date,
                assigned_to: row.assigned_to,
                notes: row.notes,
                template_key: row.template_key,
                updated_at: row.updated_at,
            }));
            console.warn('[Checklist Templates] Stripping extended task columns and retrying insert...');
            results = await db.from('planner_tasks').insert(baseRows).select('*');
        }

        if (results.error) throw results.error;

        const createdTasks = results.data || [];
        const createdIds = createdTasks.map((task: any) => task.id);

        // Record the addition for duplicate detection + "add again intentionally".
        if (wasAlreadyAdded) {
            const { error: updateAdditionError } = await db
                .from('wedding_checklist_template_additions')
                .update({
                    checklist_name: checklistName,
                    added_by_user_id: user.id,
                    add_count: Number(existingAddition.add_count || 1) + 1,
                    last_added_at: new Date().toISOString(),
                })
                .eq('id', existingAddition.id);

            if (updateAdditionError) throw updateAdditionError;
        } else {
            const { error: insertAdditionError } = await db
                .from('wedding_checklist_template_additions')
                .insert({
                    wedding_id: weddingId,
                    template_id: templateId,
                    checklist_name: checklistName,
                    added_by_user_id: user.id,
                    add_count: 1,
                    last_added_at: new Date().toISOString(),
                });

            if (insertAdditionError) throw insertAdditionError;
        }

        return NextResponse.json({
            success: true,
            addedCount: createdTasks.length,
            alreadyAdded: wasAlreadyAdded,
            createdIds,
            tasks: createdTasks,
        });
    } catch (err) {
        console.error('Error adding checklist template:', err);
        const message = err instanceof Error ? err.message : String((err as any)?.message || 'Unable to add checklist template.');
        return NextResponse.json({ error: message }, { status: 500 });
    }
}