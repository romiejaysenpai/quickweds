/**
 * Sharing models, constants, and pure helpers for the Wedding Day Checklist
 * Templates feature. This module is intentionally free of browser/server-only
 * imports so it can be unit-tested in isolation.
 */

export type ChecklistTemplate = {
    id: string;
    key: string;
    name: string;
    description: string;
    category: string;
    supports_box_packing: boolean;
    item_count: number;
    section_count: number;
    already_added: boolean;
    added_count: number;
};

export type ChecklistTemplateItem = {
    id: string;
    template_id: string;
    section_id: string | null;
    item_key: string;
    title: string;
    description: string;
    notes: string | null;
    is_optional: boolean;
    quantity: number;
    assigned_person: string | null;
    location: string | null;
    not_included: boolean;
    due_offset_days: number | null;
    sort_order: number;
};

export type ChecklistTemplateSection = {
    id: string;
    template_id: string;
    section_key: string;
    name: string;
    sort_order: number;
    items: ChecklistTemplateItem[];
};

export type ChecklistTemplatePreview = {
    template: ChecklistTemplate;
    sections: ChecklistTemplateSection[];
};

export type AddChecklistTemplatePayload = {
    weddingId: string;
    templateId: string;
    checklistName: string;
    assignTo: string;
    mode: 'all' | 'selected';
    sectionIds: string[];
    itemIds: string[];
    addAnyway: boolean;
    applySuggestDueDates: boolean;
};

export type AddChecklistTemplateResult = {
    success: boolean;
    addedCount: number;
    alreadyAdded: boolean;
    createdIds: string[];
    tasks: Array<Record<string, unknown>>;
};

/** Templates that participate in the box-packing workflow. */
export const BOX_PACKING_TEMPLATE_KEYS = [
    'brides-box',
    'grooms-box',
    'ceremony-box',
    'reception-box',
    'prep-snacks',
    'master-box',
] as const;

export type BoxStatus = 'not_started' | 'prepared' | 'packed' | 'handed' | 'used';

export const BOX_STATUS_ORDER: BoxStatus[] = ['not_started', 'prepared', 'packed', 'handed', 'used'];

export const BOX_STATUS_LABELS: Record<BoxStatus, string> = {
    not_started: 'Not started',
    prepared: 'Prepared',
    packed: 'Packed',
    handed: 'Handed to responsible person',
    used: 'Used / Distributed',
};

export const BOX_STATUS_CLASSES: Record<BoxStatus, string> = {
    not_started: 'border-border bg-neutral text-text-secondary',
    prepared: 'border-amber-200 bg-amber-50 text-amber-700',
    packed: 'border-primary/25 bg-primary/10 text-primary',
    handed: 'border-sky-200 bg-sky-50 text-sky-700',
    used: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

export const BOX_FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'missing', label: 'Missing' },
    { value: 'packed', label: 'Packed' },
    { value: 'assigned_to_me', label: 'Assigned to me' },
    { value: 'optional', label: 'Optional items' },
] as const;

export type BoxFilterValue = typeof BOX_FILTERS[number]['value'];

/** Assignment options offered when adding a template. */
export const ASSIGN_TO_OPTIONS = ['Couple', 'Maid of Honor', 'Best Man', 'Coordinator'] as const;

export function formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Computes the suggested due date (as a local YYYY-MM-DD string) based on the
 * wedding date and an offset in days before the wedding (0 = wedding day).
 * Returns null when no wedding date or offset is available.
 *
 * Suggested schedule:
 *   - 30 days before:  purchase or prepare items
 *   - 14 days before:  confirm item availability
 *   - 7 days before:   pack boxes and verify contents
 *   - 1 day before:    final inspection
 *   - 0 (wedding day): bring / distribute / use item
 */
export function getTemplateSuggestedDueDate(
    weddingDateValue: string | null | undefined,
    daysBefore: number | null | undefined,
): string | null {
    if (!weddingDateValue || daysBefore === null || daysBefore === undefined) return null;

    const weddingDate = new Date(`${weddingDateValue}T00:00:00`);
    if (Number.isNaN(weddingDate.getTime())) return null;

    const due = new Date(weddingDate);
    due.setDate(due.getDate() - daysBefore);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (due < today) return formatLocalDate(today);

    return formatLocalDate(due);
}

/** Human label for a due-date offset (e.g. 7 -> "7 days before"). */
export function getDaysBeforeLabel(daysBefore: number | null | undefined): string {
    if (daysBefore === null || daysBefore === undefined) return 'No suggested date';
    if (daysBefore === 0) return 'Wedding day';
    if (daysBefore === 1) return '1 day before';
    if (daysBefore === 7) return '7 days before';
    if (daysBefore === 14) return '14 days before';
    if (daysBefore === 30) return '30 days before';
    return `${daysBefore} days before`;
}