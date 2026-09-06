/**
 * Browser client helpers for the Wedding Day Checklist Templates API.
 * Auth token handling follows the existing planner item request pattern.
 */

import { getCachedSession } from '@/lib/session-cache';
import type {
    AddChecklistTemplatePayload,
    AddChecklistTemplateResult,
    ChecklistTemplate,
    ChecklistTemplatePreview,
} from '@/lib/checklist-templates';

export type ChecklistTemplateListErrorCode = 'unauthorized' | 'wedding_not_found' | 'wedding_access_denied' | 'template_already_added' | 'planner_lite_limit_reached' | 'unknown';

export class ChecklistTemplateApiError extends Error {
    code: ChecklistTemplateListErrorCode;
    status: number;
    data: Record<string, unknown>;

    constructor(message: string, code: ChecklistTemplateListErrorCode, status: number, data: Record<string, unknown> = {}) {
        super(message);
        this.name = 'ChecklistTemplateApiError';
        this.code = code;
        this.status = status;
        this.data = data;
    }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
    const { data } = await getCachedSession();
    const token = data.session?.access_token;
    if (!token) throw new Error('Please sign in again before managing checklist templates.');
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
}

function normalizeErrorCode(status: number, body: Record<string, any>): ChecklistTemplateListErrorCode {
    if (status === 401) return 'unauthorized';
    if (status === 403) return 'wedding_access_denied';
    if (status === 404) return 'wedding_not_found';
    if (body?.code === 'template_already_added') return 'template_already_added';
    if (body?.code === 'planner_lite_limit_reached') return 'planner_lite_limit_reached';
    return 'unknown';
}

/** Loads the template library cards (optionally prefixed with per-wedding add state). */
export async function fetchChecklistTemplates(weddingId: string): Promise<{ templates: ChecklistTemplate[] }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/planner/checklist-templates?weddingId=${encodeURIComponent(weddingId)}`, {
        headers,
        cache: 'no-store',
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new ChecklistTemplateApiError(body?.error || 'Unable to load checklist templates.', normalizeErrorCode(response.status, body), response.status, body);
    }

    return { templates: body?.templates || [] };
}

/** Loads a full template preview with grouped sections and line items. */
export async function fetchChecklistTemplatePreview(weddingId: string, templateId: string): Promise<ChecklistTemplatePreview> {
    const headers = await getAuthHeaders();
    const response = await fetch(
        `/api/planner/checklist-templates?weddingId=${encodeURIComponent(weddingId)}&templateId=${encodeURIComponent(templateId)}`,
        { headers, cache: 'no-store' },
    );

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new ChecklistTemplateApiError(body?.error || 'Unable to preview this checklist template.', normalizeErrorCode(response.status, body), response.status, body);
    }

    return {
        template: body?.template || null,
        sections: body?.sections || [],
    };
}

/** Adds a template (or selected sections/items) to the wedding checklist. */
export async function addChecklistTemplate(
    weddingId: string,
    payload: Omit<AddChecklistTemplatePayload, 'weddingId'>,
): Promise<AddChecklistTemplateResult> {
    const headers = await getAuthHeaders();
    const response = await fetch('/api/planner/checklist-templates', {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...payload, weddingId }),
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new ChecklistTemplateApiError(body?.error || 'Unable to add this checklist template.', normalizeErrorCode(response.status, body), response.status, body);
    }

    return {
        success: true,
        addedCount: Number(body?.addedCount || 0),
        alreadyAdded: Boolean(body?.alreadyAdded),
        createdIds: Array.isArray(body?.createdIds) ? body.createdIds : [],
        tasks: Array.isArray(body?.tasks) ? body.tasks : [],
    };
}