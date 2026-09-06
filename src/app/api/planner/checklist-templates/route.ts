import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getAuthenticatedRequest } from '@/lib/api-rate-limit';
import { isKnownAdminEmail } from '@/lib/admin';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getPlannerUsage, hasPlannerProAccess, PLANNER_ITEM_LIMITS } from '@/lib/planner-limits';
import { sanitizeInput } from '@/lib/rate-limit';
import { getTemplateSuggestedDueDate } from '@/lib/checklist-templates';
import {
    buildFallbackTemplateCards,
    buildFallbackTemplatePreview,
} from '@/lib/checklist-templates-seed';

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

const TASK_META_SEPARATOR = '||QW_TASK_META||';

function isValidUUID(value: unknown): boolean {
    if (!value || typeof value !== 'string') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function decodePlannerTaskPayload(task: any) {
    const category = String(task?.category || '');
    if (!category.includes(TASK_META_SEPARATOR)) {
        return {
            ...task,
            section: task?.section || task?.category || 'General',
        };
    }

    const [section, encodedMeta] = category.split(TASK_META_SEPARATOR);
    try {
        const meta = JSON.parse(encodedMeta || '{}');
        return {
            ...task,
            ...meta,
            category: section || meta.section || 'General',
            section: meta.section || section || task?.section || 'General',
        };
    } catch {
        return {
            ...task,
            category: section || 'General',
            section: task?.section || section || 'General',
        };
    }
}

function getMissingColumnName(error: any): string | null {
    if (!error) return null;
    const message = String(error.message || error.details || error.hint || '').toLowerCase();

    const match1 = message.match(/could not find the '([^']+)' column/);
    if (match1 && match1[1]) return match1[1];

    const match2 = message.match(/column "([^"]+)" of relation/);
    if (match2 && match2[1]) return match2[1];

    const match3 = message.match(/column "([^"]+)" does not exist/);
    if (match3 && match3[1]) return match3[1];

    const match4 = message.match(/column ([a-z0-9_]+) does not exist/);
    if (match4 && match4[1]) return match4[1];

    const match5 = message.match(/'([^']+)' column of 'planner_tasks'/);
    if (match5 && match5[1]) return match5[1];

    return null;
}

function cleanString(value: unknown) {
    const text = String(value || '').trim();
    return text || null;
}

function getCopiedChecklistSectionName(checklistName: string, sectionName: unknown) {
    const normalizedSection = cleanString(sectionName) || 'General';
    return normalizedSection.toLowerCase() === 'general'
        ? checklistName
        : `${checklistName} · ${normalizedSection}`;
}

function normalizeText(val: unknown): string {
    return String(val || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[—–]/g, '-');
}

function isTaskDuplicate(
    existingTask: Record<string, any>,
    candidateTask: Record<string, any>,
    templateKey: string,
    checklistName: string,
): boolean {
    const existingTitle = normalizeText(existingTask.title);
    const candidateTitle = normalizeText(candidateTask.title);

    if (!existingTitle || existingTitle !== candidateTitle) {
        return false;
    }

    const existingTemplateKey = normalizeText(existingTask.source_template_key || existingTask.template_key || '');
    const normalizedTargetKey = normalizeText(templateKey);

    // If existing task has an explicit template key and it differs from candidate's template key,
    // they are distinct items in different templates (e.g. Bride's Box vs Groom's Box)
    if (
        existingTemplateKey &&
        normalizedTargetKey &&
        existingTemplateKey !== normalizedTargetKey &&
        existingTemplateKey !== `checklist-template:${normalizedTargetKey}`
    ) {
        return false;
    }

    // 1. Matches by template key
    if (
        existingTemplateKey &&
        (existingTemplateKey === normalizedTargetKey ||
         existingTemplateKey === `checklist-template:${normalizedTargetKey}`)
    ) {
        return true;
    }

    // 2. Matches by exact section or category
    const existingSection = normalizeText(existingTask.section || existingTask.category || '');
    const candidateSection = normalizeText(candidateTask.section || candidateTask.category || '');
    if (existingSection && candidateSection && existingSection === candidateSection) {
        return true;
    }

    // 3. Matches if both sections contain the checklist name (e.g. "Bride's Box")
    const normalizedChecklistName = normalizeText(checklistName);
    if (
        normalizedChecklistName &&
        existingSection &&
        candidateSection &&
        existingSection.includes(normalizedChecklistName) &&
        candidateSection.includes(normalizedChecklistName)
    ) {
        return true;
    }

    // 4. Matches by location (e.g. "Bride's Box")
    const existingLocation = normalizeText(existingTask.location || '');
    const candidateLocation = normalizeText(candidateTask.location || '');
    if (existingLocation && candidateLocation && existingLocation === candidateLocation) {
        return true;
    }

    // 5. If neither existingTask nor candidateTask has a section or location specified,
    // match by title
    if (!existingSection && !candidateSection && !existingLocation && !candidateLocation) {
        return true;
    }

    return false;
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
    const addedCount = additionsById.get(String(template.id)) || additionsById.get(String(template.key)) || 0;
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
    const additionsById = new Map<string, number>();
    try {
        const { data: additions, error: additionsError } = await db
            .from('wedding_checklist_template_additions')
            .select('template_id, add_count')
            .eq('wedding_id', weddingId);

        if (!additionsError && additions) {
            for (const row of additions) {
                additionsById.set(String(row.template_id), Number(row.add_count || 1));
            }
        }
    } catch {
        // Ignored if additions table not yet available
    }

    // Inspect planner_tasks to discover already added templates even if additions table is absent
    try {
        const { data: tasks } = await db
            .from('planner_tasks')
            .select('*')
            .eq('wedding_id', weddingId);

        if (tasks && tasks.length > 0) {
            const decoded = tasks.map(decodePlannerTaskPayload);
            for (const task of decoded) {
                const rawKey = task.source_template_key || task.template_key;
                if (rawKey) {
                    const cleanKey = String(rawKey).replace(/^checklist-template:/, '');
                    additionsById.set(cleanKey, (additionsById.get(cleanKey) || 0) + 1);
                }
            }
        }
    } catch {
        // Ignored if query fails
    }

    try {
        const { data: templates, error: templatesError } = await db
            .from('checklist_templates')
            .select(TEMPLATE_SELECT)
            .eq('is_active', true)
            .order('name', { ascending: true });

        if (!templatesError && templates && templates.length > 0) {
            return (templates || []).map((template: Record<string, any>) => buildTemplateRow(template, additionsById));
        }
    } catch (err) {
        console.warn('[Checklist Templates] Database template lookup failed, using seed library:', err);
    }

    return buildFallbackTemplateCards(additionsById);
}

async function getTemplatePreview(db: any, weddingId: string, templateId: string) {
    const previewAdditionsById = new Map<string, number>();
    try {
        const { data: additions, error: additionsError } = await db
            .from('wedding_checklist_template_additions')
            .select('template_id, add_count')
            .eq('wedding_id', weddingId)
            .eq('template_id', templateId)
            .maybeSingle();

        if (!additionsError && additions) {
            previewAdditionsById.set(String(additions.template_id), Number(additions.add_count || 1));
        }
    } catch {
        // Ignored if additions table not yet available
    }

    // Fetch existing tasks to mark which items already exist in the user's checklist
    let existingTasks: Array<Record<string, any>> = [];
    try {
        const { data: tasks } = await db
            .from('planner_tasks')
            .select('*')
            .eq('wedding_id', weddingId);
        if (tasks) {
            existingTasks = tasks.map(decodePlannerTaskPayload);
        }
    } catch {
        // Ignored
    }

    const markItemsAlreadyInChecklist = (sectionsList: any[], tKey: string, tName: string) => {
        return sectionsList.map((section: any) => ({
            ...section,
            items: (section.items || []).map((item: any) => {
                const sectionName = section.name || 'General';
                const copiedSection = getCopiedChecklistSectionName(tName, sectionName);
                const isAlreadyPresent = existingTasks.some((existing) =>
                    isTaskDuplicate(
                        existing,
                        {
                            title: item.title,
                            section: copiedSection,
                            category: copiedSection,
                            source_template_key: tKey,
                            location: item.location || sectionName,
                        },
                        tKey,
                        tName,
                    )
                );
                return {
                    ...item,
                    already_in_checklist: isAlreadyPresent,
                };
            }),
        }));
    };

    try {
        const { data: template, error: templateError } = await db
            .from('checklist_templates')
            .select(TEMPLATE_SELECT)
            .eq('id', templateId)
            .eq('is_active', true)
            .maybeSingle();

        if (!templateError && template) {
            const [sectionsResult, itemsResult] = await Promise.all([
                db.from('checklist_template_sections').select('id, template_id, section_key, name, sort_order').eq('template_id', templateId).order('sort_order', { ascending: true }),
                db.from('checklist_template_items').select('*').eq('template_id', templateId).order('sort_order', { ascending: true }),
            ]);

            if (!sectionsResult.error && !itemsResult.error) {
                const rawSections = (sectionsResult.data || []).map((section: Record<string, any>) => ({
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

                const sections = markItemsAlreadyInChecklist(rawSections, template.key, template.name);
                const hasAnyExistingTasks = sections.some((s: any) => s.items.some((i: any) => i.already_in_checklist));

                const templateRow = buildTemplateRow(template, previewAdditionsById);
                if (hasAnyExistingTasks) {
                    templateRow.already_added = true;
                }

                return {
                    template: templateRow,
                    sections,
                };
            }
        }
    } catch (err) {
        console.warn('[Checklist Templates] Database preview lookup failed, using seed preview:', err);
    }

    const fallback = buildFallbackTemplatePreview(templateId, previewAdditionsById);
    if (!fallback) {
        return { template: null, sections: [] };
    }

    const sections = markItemsAlreadyInChecklist(fallback.sections, fallback.template.key, fallback.template.name);
    const hasAnyExistingTasks = sections.some((s: any) => s.items.some((i: any) => i.already_in_checklist));
    if (hasAnyExistingTasks) {
        fallback.template.already_added = true;
    }

    return {
        template: fallback.template,
        sections,
    };
}

function cleanId(value: unknown): string {
    const text = String(value || '').trim();
    if (!text) return '';
    // Allow alphanumeric characters, hyphens, and underscores up to 80 chars
    const cleaned = text.replace(/[^a-zA-Z0-9_-]/g, '');
    return cleaned.slice(0, 80);
}

function sanitizeIdList(value: unknown, label: string) {
    if (!Array.isArray(value)) return { ids: [], error: `${label} must be a list of ids.` };
    if (value.length > MAX_SELECTED_IDS) return { ids: [], error: `${label} contains too many entries.` };

    const ids: string[] = [];
    for (const raw of value) {
        const id = cleanId(raw);
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
    const weddingId = cleanId(searchParams.get('weddingId'));
    const templateId = cleanId(searchParams.get('templateId'));

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
    const weddingId = cleanId(body.weddingId);
    const templateId = cleanId(body.templateId);
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

        if (!(access.wedding.user_id === user.id) && !isKnownAdminEmail(user.email)) {
            return NextResponse.json({
                error: 'Only the couple (wedding owner) can add checklist templates.',
            }, { status: 403 });
        }

        let template: any = null;
        let sections: any[] = [];
        let templateItems: any[] = [];

        try {
            const { data: dbTemplate, error: templateError } = await db
                .from('checklist_templates')
                .select('id, key, name, supports_box_packing')
                .eq('id', templateId)
                .eq('is_active', true)
                .maybeSingle();

            if (!templateError && dbTemplate) {
                template = dbTemplate;
                const [sectionsResult, itemsResult] = await Promise.all([
                    db.from('checklist_template_sections').select('*').eq('template_id', templateId).order('sort_order', { ascending: true }),
                    db.from('checklist_template_items').select('*').eq('template_id', templateId).order('sort_order', { ascending: true }),
                ]);
                sections = sectionsResult.data || [];
                templateItems = itemsResult.data || [];
            }
        } catch (dbErr) {
            console.warn('[Checklist Templates] Database template lookup error, falling back to seed preview:', dbErr);
        }

        if (!template) {
            const seedPreview = buildFallbackTemplatePreview(templateId);
            if (!seedPreview) {
                return NextResponse.json({ error: 'Checklist template not found.' }, { status: 404 });
            }
            template = seedPreview.template;
            sections = seedPreview.sections;
            templateItems = seedPreview.sections.flatMap((s) => s.items);
        }

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

        // Duplicate protection: check additions table and query existing planner_tasks
        let existingAddition: any = null;
        try {
            const { data: additionData, error: additionError } = await db
                .from('wedding_checklist_template_additions')
                .select('id, add_count')
                .eq('wedding_id', weddingId)
                .eq('template_id', template.id)
                .maybeSingle();

            if (!additionError) {
                existingAddition = additionData;
            }
        } catch {
            // Ignored if table not created yet
        }

        // Fetch existing tasks in planner_tasks for strict item deduplication
        let existingTasks: Array<Record<string, any>> = [];
        try {
            const { data: tasks } = await db
                .from('planner_tasks')
                .select('*')
                .eq('wedding_id', weddingId);
            if (tasks) {
                existingTasks = tasks.map(decodePlannerTaskPayload);
            }
        } catch (taskErr) {
            console.warn('[Checklist Templates] Could not query existing tasks for deduplication:', taskErr);
        }

        const sectionsById = new Map<string, Record<string, any>>();
        for (const section of sections || []) {
            sectionsById.set(String(section.id), section);
        }

        const taskRows = selected.map((item, index) => {
            const section = sectionsById.get(String(item.section_id)) || { name: 'General' };
            const copiedSectionName = getCopiedChecklistSectionName(checklistName, section.name);
            const responsible = cleanString(item.assigned_person) || (assignTo && assignTo !== 'Couple' ? assignTo : null);
            const suggestedDate = applySuggestDueDates && access.wedding.wedding_date && item.due_offset_days !== null && item.due_offset_days !== undefined
                ? getTemplateSuggestedDueDate(access.wedding.wedding_date, Number(item.due_offset_days))
                : null;

            return {
                wedding_id: weddingId,
                title: cleanString(item.title),
                status: 'pending',
                category: copiedSectionName,
                section: copiedSectionName,
                due_date: suggestedDate || null,
                assigned_to: responsible,
                notes: cleanString(item.notes) || cleanString(item.description),
                template_key: `checklist-template:${template.key}`,
                is_optional: Boolean(item.is_optional),
                quantity: item.quantity != null ? Number(item.quantity) : 1,
                responsible_person: responsible,
                location: cleanString(item.location) || section.name || null,
                not_included: Boolean(item.not_included),
                source_template_id: isValidUUID(template.id) ? template.id : null,
                source_template_key: template.key,
                box_status: BOX_STATUS_DEFAULT,
                sort_order: (index + 1) * 10,
                updated_at: new Date().toISOString(),
            };
        });

        // Deduplicate: filter out any tasks that are already in the user's checklist
        const duplicateItems: Array<{ title: string; section: string }> = [];
        const nonDuplicateTaskRows = taskRows.filter((candidate) => {
            const isDup = existingTasks.some((existing) =>
                isTaskDuplicate(existing, candidate, template.key, checklistName)
            );
            if (isDup) {
                duplicateItems.push({ title: candidate.title || '', section: candidate.section || '' });
                return false;
            }
            return true;
        });

        const wasAlreadyAdded = Boolean(existingAddition) || existingTasks.some((t) =>
            normalizeText(t.source_template_key || t.template_key || '') === normalizeText(template.key) ||
            normalizeText(t.template_key || '') === `checklist-template:${normalizeText(template.key)}`
        );

        // If ALL items already exist in the user's checklist, do NOT create any duplicates!
        if (nonDuplicateTaskRows.length === 0) {
            return NextResponse.json({
                success: true,
                addedCount: 0,
                skippedDuplicates: duplicateItems.length,
                allAlreadyAdded: true,
                alreadyAdded: true,
                message: `All ${duplicateItems.length} item${duplicateItems.length === 1 ? '' : 's'} from “${checklistName}” are already in your checklist. No duplicates were added.`,
                tasks: [],
                createdIds: [],
            });
        }

        // If the template was already added and the user hasn't explicitly clicked to proceed with missing items
        if (wasAlreadyAdded && !addAnyway && duplicateItems.length > 0) {
            return NextResponse.json({
                error: `This template was already added to your checklist. ${duplicateItems.length} item${duplicateItems.length === 1 ? '' : 's'} already exist. You can add the remaining ${nonDuplicateTaskRows.length} missing item${nonDuplicateTaskRows.length === 1 ? '' : 's'}.`,
                code: 'template_already_added',
                alreadyAdded: true,
                missingCount: nonDuplicateTaskRows.length,
                duplicateCount: duplicateItems.length,
                addCount: Number(existingAddition?.add_count || 1),
            }, { status: 409 });
        }

        // Respect the existing Planner Lite limits for only the new, non-duplicate tasks:
        const accountProfile = await db.from('user_app_profiles').select('is_pro, payment_status').eq('user_id', access.wedding.user_id).maybeSingle();
        const hasPlannerPro = hasPlannerProAccess({
            isAdmin: isKnownAdminEmail(user.email),
            wedding: access.wedding,
            accountProfile: accountProfile.data,
        });

        if (!hasPlannerPro) {
            const usage = await getPlannerUsage(db, weddingId);
            const limit = PLANNER_ITEM_LIMITS.task;
            if (usage.tasks + nonDuplicateTaskRows.length > limit) {
                return NextResponse.json({
                    error: `This template adds ${nonDuplicateTaskRows.length} new checklist task${nonDuplicateTaskRows.length === 1 ? '' : 's'}, but Free Planner Lite includes ${limit} checklist tasks total. Upgrade to Planner Pro for unlimited planning.`,
                    code: 'planner_lite_limit_reached',
                    limit,
                    used: usage.tasks,
                    type: 'task',
                    neededByTemplate: nonDuplicateTaskRows.length,
                }, { status: 402 });
            }
        }

        let currentTaskRows = nonDuplicateTaskRows.map((r: Record<string, any>) => ({ ...r }));
        let results: { data?: any; error?: any } = await db.from('planner_tasks').insert(currentTaskRows).select('*');

        let retryCount = 0;
        const strippedColumns = new Set<string>();

        // Dynamically strip any missing columns (due_date, assigned_to, section, etc.) and retry.
        while (results.error && isSchemaMissingError(results.error) && retryCount < 15) {
            const missingCol = getMissingColumnName(results.error);
            if (missingCol) {
                strippedColumns.add(missingCol.toLowerCase());
                console.warn(`[Checklist Templates] Column '${missingCol}' missing from planner_tasks schema. Stripping and retrying...`);

                currentTaskRows = currentTaskRows.map((row: Record<string, any>, idx: number) => {
                    const copy = { ...row };
                    delete copy[missingCol];
                    delete copy[missingCol.toLowerCase()];

                    // Preserve stripped metadata inside category via TASK_META_SEPARATOR
                    // so decodePlannerTask() in planner UI recovers it seamlessly.
                    const original = (taskRows[idx] || {}) as Record<string, any>;
                    const meta: Record<string, any> = {
                        section: original.section,
                    };
                    for (const col of strippedColumns) {
                        if (original[col] !== undefined && original[col] !== null) {
                            meta[col] = original[col];
                        }
                    }
                    copy.category = `${original.section}${TASK_META_SEPARATOR}${JSON.stringify(meta)}`;
                    return copy;
                });

                results = await db.from('planner_tasks').insert(currentTaskRows).select('*');
                retryCount++;
            } else {
                break;
            }
        }

        // If after dynamic column stripping there is still a schema error, fall back to core baseline columns:
        if (results.error && isSchemaMissingError(results.error)) {
            console.warn('[Checklist Templates] Stripping to core baseline columns (wedding_id, title, status, category)...');
            const minimalRows = nonDuplicateTaskRows.map((original) => {
                const meta: Record<string, any> = {
                    section: original.section,
                    due_date: original.due_date,
                    assigned_to: original.assigned_to,
                    notes: original.notes,
                    template_key: original.template_key,
                    is_optional: original.is_optional,
                    quantity: original.quantity,
                    responsible_person: original.responsible_person,
                    location: original.location,
                    not_included: original.not_included,
                    source_template_id: original.source_template_id,
                    source_template_key: original.source_template_key,
                    box_status: original.box_status,
                    sort_order: original.sort_order,
                };
                return {
                    wedding_id: original.wedding_id,
                    title: original.title,
                    status: original.status || 'pending',
                    category: `${original.section}${TASK_META_SEPARATOR}${JSON.stringify(meta)}`,
                };
            });
            results = await db.from('planner_tasks').insert(minimalRows).select('*');
        }

        if (results.error) throw results.error;

        const rawCreatedTasks = results.data || [];
        const createdTasks = rawCreatedTasks.map((task: any, idx: number) => {
            const original = (nonDuplicateTaskRows[idx] || {}) as Record<string, any>;
            const decoded = decodePlannerTaskPayload(task);
            return {
                ...original,
                ...decoded,
                id: task?.id || original.id || null,
            };
        });
        const createdIds = createdTasks.map((task: any) => task.id).filter(Boolean);

        // Record the addition for duplicate detection + "add again intentionally".
        try {
            if (isValidUUID(template.id)) {
                if (wasAlreadyAdded && existingAddition?.id) {
                    await db
                        .from('wedding_checklist_template_additions')
                        .update({
                            checklist_name: checklistName,
                            added_by_user_id: user.id,
                            add_count: Number(existingAddition.add_count || 1) + 1,
                            last_added_at: new Date().toISOString(),
                        })
                        .eq('id', existingAddition.id);
                } else {
                    await db
                        .from('wedding_checklist_template_additions')
                        .insert({
                            wedding_id: weddingId,
                            template_id: template.id,
                            checklist_name: checklistName,
                            added_by_user_id: user.id,
                            add_count: 1,
                            last_added_at: new Date().toISOString(),
                        });
                }
            }
        } catch (addErr) {
            console.warn('[Checklist Templates] Could not record template addition:', addErr);
        }

        return NextResponse.json({
            success: true,
            addedCount: createdTasks.length,
            skippedDuplicates: duplicateItems.length,
            alreadyAdded: wasAlreadyAdded,
            createdIds,
            tasks: createdTasks,
            message: duplicateItems.length > 0
                ? `Added ${createdTasks.length} new item${createdTasks.length === 1 ? '' : 's'}. Skipped ${duplicateItems.length} duplicate item${duplicateItems.length === 1 ? '' : 's'} already in your checklist.`
                : `Added ${createdTasks.length} item${createdTasks.length === 1 ? '' : 's'} to your checklist.`,
        });
    } catch (err) {
        console.error('Error adding checklist template:', err);
        const message = err instanceof Error ? err.message : String((err as any)?.message || 'Unable to add checklist template.');
        return NextResponse.json({ error: message }, { status: 500 });
    }
}