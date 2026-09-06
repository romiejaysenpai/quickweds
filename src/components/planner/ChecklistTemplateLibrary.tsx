'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    Circle,
    Clock,
    Eye,
    Info,
    Package,
    PackagePlus,
    RefreshCw,
    Sparkles,
    Undo2,
    UserRound,
    X,
} from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';
import {
    ASSIGN_TO_OPTIONS,
    type ChecklistTemplate,
    type ChecklistTemplateItem,
    type ChecklistTemplatePreview,
    type ChecklistTemplateSection,
    getDaysBeforeLabel,
    getTemplateSuggestedDueDate,
} from '@/lib/checklist-templates';
import {
    addChecklistTemplate,
    ChecklistTemplateApiError,
    fetchChecklistTemplatePreview,
    fetchChecklistTemplates,
} from '@/lib/checklist-templates-client';
import { getCachedSession } from '@/lib/session-cache';

function Pill({ children, tone = 'neutral', className = '' }: { children: React.ReactNode; tone?: 'neutral' | 'rose' | 'gold' | 'emerald' | 'sky' | 'amber'; className?: string }) {
    const tones: Record<string, string> = {
        neutral: 'bg-neutral/70 text-text-secondary border-border',
        rose: 'bg-primary/10 text-primary border-primary/20',
        gold: 'bg-accent/10 text-accent border-accent/20',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        sky: 'bg-sky-50 text-sky-700 border-sky-200',
        amber: 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${tones[tone]} ${className}`}>
            {children}
        </span>
    );
}

function ModalFrame({ onClose, title, subtitle, children, maxWidth = 'max-w-2xl' }: {
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    maxWidth?: string;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
            <div className={`flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl sm:rounded-[2rem] ${maxWidth}`}>
                <div className="flex items-start justify-between gap-4 border-b border-border/60 px-5 py-4 sm:px-6">
                    <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Checklist Templates</p>
                        <h3 className="truncate font-serif text-xl font-bold text-foreground sm:text-2xl">{title}</h3>
                        {subtitle ? <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">{subtitle}</p> : null}
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close preview" className="flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-border bg-white text-text-secondary transition hover:border-primary/30 hover:text-primary">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
            </div>
        </div>
    );
}

function ItemBadges({ item }: { item: ChecklistTemplateItem }) {
    return (
        <span className="mt-1 flex flex-wrap gap-1.5">
            {item.not_included ? <Pill tone="amber">Not included in the box</Pill> : null}
            {item.is_optional ? <Pill tone="gold">Optional</Pill> : null}
            {item.assigned_person ? <Pill tone="rose"><UserRound className="h-3 w-3" /> {item.assigned_person}</Pill> : null}
            {item.quantity > 1 ? <Pill tone="neutral">{item.quantity} pcs</Pill> : null}
        </span>
    );
}
type AddMode = 'all' | 'selected';
type AddStep = 'configure' | 'duplicate' | 'success';

async function deleteChecklistTask(weddingId: string, id: string) {
    const { data: sessionData } = await getCachedSession();
    const token = sessionData.session?.access_token;
    if (!token) throw new Error('Please sign in again before removing checklist items.');

    const response = await fetch('/api/planner/items', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', weddingId, type: 'task', id }),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to remove checklist items.');
    }
}

export function ChecklistTemplateLibrary({ weddingId, wedding, onAdded }: {
    weddingId: string;
    wedding: { wedding_date?: string | null } | null;
    onAdded: () => void | Promise<void>;
}) {
    const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [preview, setPreview] = useState<ChecklistTemplatePreview | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState('');

    const [addTemplate, setAddTemplate] = useState<ChecklistTemplate | null>(null);
    const [addPreview, setAddPreview] = useState<ChecklistTemplatePreview | null>(null);
    const [addMode, setAddMode] = useState<AddMode>('all');
    const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [checklistName, setChecklistName] = useState('');
    const [assignTo, setAssignTo] = useState<string>('Couple');
    const [customAssign, setCustomAssign] = useState('');
    const [applySuggestDueDates, setApplySuggestDueDates] = useState(true);
    const [addStep, setAddStep] = useState<AddStep>('configure');
    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState('');
    const [lastResult, setLastResult] = useState<{ createdIds: string[]; count: number; name: string } | null>(null);
    const [undoing, setUndoing] = useState(false);
    const [undoMessage, setUndoMessage] = useState('');

    const load = useCallback(async (showSpinner = false) => {
        if (showSpinner) setLoading(true);
        setError('');
        try {
            const data = await fetchChecklistTemplates(weddingId);
            setTemplates(data.templates);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load checklist templates.');
        } finally {
            setLoading(false);
        }
    }, [weddingId]);

    useEffect(() => {
        void load();
    }, [load]);

    const openPreview = useCallback(async (templateId: string) => {
        setPreview(null);
        setPreviewError('');
        setPreviewLoading(true);
        try {
            const data = await fetchChecklistTemplatePreview(weddingId, templateId);
            setPreview(data);
        } catch (err) {
            setPreviewError(err instanceof Error ? err.message : 'Unable to preview this template.');
        } finally {
            setPreviewLoading(false);
        }
    }, [weddingId]);

    const startAdd = useCallback(async (templateId: string) => {
        setAddTemplate(null);
        setAddPreview(null);
        setAddError('');
        setAddStep('configure');
        setAddMode('all');
        setSelectedSectionIds([]);
        setSelectedItemIds([]);
        setChecklistName('');
        setAssignTo('Couple');
        setCustomAssign('');
        setApplySuggestDueDates(true);
        setPreview(null);
        setPreviewLoading(true);
        try {
            const data = await fetchChecklistTemplatePreview(weddingId, templateId);
            setAddTemplate(data.template);
            setAddPreview(data);
            setChecklistName(data.template.name);
        } catch (err) {
            setAddError(err instanceof Error ? err.message : 'Unable to open this template.');
        } finally {
            setPreviewLoading(false);
        }
    }, [weddingId]);
const allItems = useMemo(() => (addPreview?.sections || []).flatMap((section) => section.items), [addPreview]);

    const selectedCount = useMemo(() => {
        if (!addPreview) return 0;
        if (addMode === 'all' || !addPreview.sections.length) return addPreview.sections.reduce((total, section) => total + section.items.length, 0);
        const sectionIdSet = new Set(selectedSectionIds);
        const itemIdSet = new Set(selectedItemIds);
        return allItems.filter((item) => itemIdSet.has(item.id) || (item.section_id ? sectionIdSet.has(item.section_id) : false)).length;
    }, [addPreview, addMode, allItems, selectedSectionIds, selectedItemIds]);

    const toggleItem = useCallback((item: ChecklistTemplateItem) => {
        setSelectedItemIds((prev) => (prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]));
    }, []);

    const toggleSection = useCallback((section: ChecklistTemplateSection) => {
        const sectionItemIds = section.items.map((item) => item.id);
        const allItemsSelected = sectionItemIds.length > 0 && sectionItemIds.every((id) => selectedItemIds.includes(id));
        if (allItemsSelected) {
            setSelectedSectionIds((prev) => prev.filter((id) => id !== section.id));
            setSelectedItemIds((prev) => [...new Set(prev.filter((id) => !sectionItemIds.includes(id)))]);
        } else {
            setSelectedSectionIds((prev) => (prev.includes(section.id) ? prev : [...prev, section.id]));
            setSelectedItemIds((prev) => [...new Set([...prev, ...sectionItemIds])]);
        }
    }, [selectedItemIds]);

    const resolvedAssignTo = useMemo(() => {
        if (assignTo === 'Custom') return customAssign.trim() || '';
        return assignTo;
    }, [assignTo, customAssign]);

    const suggestedSchedule = useMemo(() => {
        if (!applySuggestDueDates || !wedding?.wedding_date) return null;
        const offsets = [30, 14, 7, 1, 0];
        return offsets.map((offset) => ({
            offset,
            label: getDaysBeforeLabel(offset),
            date: getTemplateSuggestedDueDate(wedding.wedding_date, offset),
        }));
    }, [applySuggestDueDates, wedding?.wedding_date]);

    const handleConfirmAdd = async () => {
        if (!addTemplate || !addPreview || adding) return;
        if (addMode === 'selected' && selectedCount === 0) {
            setAddError('Select at least one item to add.');
            return;
        }
        setAdding(true);
        setAddError('');
        try {
            const result = await addChecklistTemplate(weddingId, {
                templateId: addTemplate.id,
                checklistName: checklistName.trim() || addTemplate.name,
                assignTo: resolvedAssignTo || 'Couple',
                mode: addMode,
                sectionIds: addMode === 'selected' ? selectedSectionIds : [],
                itemIds: addMode === 'selected' ? selectedItemIds : [],
                addAnyway: addStep === 'duplicate',
                applySuggestDueDates,
            });
            setLastResult({
                createdIds: result.createdIds,
                count: result.addedCount,
                name: checklistName.trim() || addTemplate.name,
            });
            setAddStep('success');
            if (onAdded) await onAdded();
        } catch (err) {
            if (err instanceof ChecklistTemplateApiError && err.code === 'template_already_added') {
                setAddStep('duplicate');
                setAddError('');
            } else {
                setAddError(err instanceof Error ? err.message : 'Unable to add checklist template.');
            }
        } finally {
            setAdding(false);
        }
    };

    const handleUndo = async () => {
        if (!lastResult || undoing) return;
        setUndoing(true);
        setUndoMessage('');
        try {
            for (const id of lastResult.createdIds) {
                await deleteChecklistTask(weddingId, id);
            }
            setUndoMessage(`Removed ${lastResult.count} item${lastResult.count === 1 ? '' : 's'} from your checklist.`);
            setLastResult(null);
            if (onAdded) await onAdded();
        } catch (err) {
            setUndoMessage(`Could not fully undo: ${err instanceof Error ? err.message : 'unknown error'}`);
        } finally {
            setUndoing(false);
        }
    };

    const clearAdd = () => {
        setAddTemplate(null);
        setAddPreview(null);
        setAddError('');
        setAddStep('configure');
        setLastResult(null);
        setUndoMessage('');
    };
const renderPreviewModal = () => {
        if (!preview) return null;
        return (
            <ModalFrame onClose={() => setPreview(null)} title={preview.template.name} subtitle={preview.template.description}>
                <div className="px-5 py-4 sm:px-6">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        <Pill tone="rose"><Package className="h-3 w-3" /> {preview.template.item_count} items</Pill>
                        <Pill tone="neutral">{preview.template.section_count} sections</Pill>
                        {preview.template.supports_box_packing ? <Pill tone="sky"><Package className="h-3 w-3" /> Box packing available</Pill> : null}
                        {preview.template.already_added ? <Pill tone="emerald"><CheckCircle2 className="h-3 w-3" /> Already added</Pill> : null}
                    </div>
                    {previewError ? <p className="mb-3 text-sm text-red-600" role="alert">{previewError}</p> : null}
                    {previewLoading ? (
                        <LoadingState variant="panel" label="Loading preview…" className="min-h-[140px]" />
                    ) : (
                        <>
                            {preview.sections.map((section) => (
                                <div key={section.id} className="mb-4 overflow-hidden rounded-2xl border border-border">
                                    <div className="flex items-center justify-between gap-3 border-b border-border bg-neutral/40 px-4 py-3">
                                        <h4 className="font-serif text-base font-bold text-foreground">{section.name}</h4>
                                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-primary">{section.items.length}</span>
                                    </div>
                                    <ul className="divide-y divide-border/40">
                                        {section.items.map((item) => (
                                            <li key={item.id} className="px-4 py-3">
                                                <div className="flex items-start gap-2.5">
                                                    <Circle className="mt-0.5 h-4 w-4 flex-none text-border" />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {item.title}
                                                            {item.quantity > 1 ? <span className="ml-1.5 text-xs font-normal text-text-secondary">× {item.quantity}</span> : null}
                                                        </p>
                                                        {(item.notes || item.description) ? <p className="mt-0.5 text-xs leading-5 text-text-secondary">{item.notes || item.description}</p> : null}
                                                        <ItemBadges item={item} />
                                                        {item.due_offset_days !== null && item.due_offset_days !== undefined ? (
                                                            <p className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                                                                <Clock className="h-3 w-3" /> Suggested: {getDaysBeforeLabel(item.due_offset_days)}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </>
                    )}
                    <div className="sticky bottom-0 -mx-5 flex flex-col gap-2 border-t border-border bg-white px-5 py-4 sm:-mx-6 sm:flex-row sm:items-center sm:justify-end">
                        <button type="button" onClick={() => setPreview(null)} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 py-2 text-sm font-bold text-text-secondary transition hover:border-primary/30 hover:text-primary">
                            Close
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const t = preview.template;
                                setPreview(null);
                                void startAdd(t.id);
                            }}
                            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover"
                        >
                            <PackagePlus className="h-4 w-4" /> Add to my checklist
                        </button>
                    </div>
                </div>
            </ModalFrame>
        );
    };
const renderAddModal = () => {
        if (!addTemplate || !addPreview) return null;
        const isSuccessStep = addStep === 'success';
        const isDuplicateStep = addStep === 'duplicate';

        return (
            <ModalFrame
                onClose={clearAdd}
                title={isSuccessStep ? 'Template added' : `Add ${addTemplate.name}`}
                subtitle={isSuccessStep ? undefined : 'Choose what to copy into your wedding checklist.'}
            >
                {isSuccessStep && lastResult ? (
                    <div className="px-5 py-6 text-center sm:px-6">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <CheckCircle2 className="h-7 w-7" />
                        </div>
                        <h4 className="mt-4 font-serif text-xl font-bold text-foreground">
                            Added {lastResult.count} item{lastResult.count === 1 ? '' : 's'}
                        </h4>
                        <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-text-secondary">
                            “{lastResult.name}” is now part of your wedding checklist. You can edit, assign, or remove each item freely.
                        </p>
                        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                            <button
                                type="button"
                                onClick={() => void handleUndo()}
                                disabled={undoing}
                                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 py-2 text-sm font-bold text-text-secondary transition hover:border-primary/30 hover:text-primary disabled:opacity-50"
                            >
                                <Undo2 className="h-4 w-4" />
                                {undoing ? 'Removing…' : 'Undo add'}
                            </button>
                            <button
                                type="button"
                                onClick={clearAdd}
                                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                ) : isDuplicateStep ? (
                    <div className="px-5 py-6 sm:px-6">
                        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-amber-600" />
                            <div>
                                <p className="text-sm font-bold text-amber-800">This template was already added to your checklist</p>
                                <p className="mt-1 text-xs leading-5 text-amber-700">
                                    Adding it again will copy the same items one more time. Add again intentionally if you really need duplicate rows, or skip to avoid duplicates.
                                </p>
                            </div>
                        </div>
                        {addError ? <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{addError}</p> : null}
                        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={clearAdd}
                                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-border bg-white px-5 py-2 text-sm font-bold text-text-secondary transition hover:border-primary/30 hover:text-primary"
                            >
                                Skip
                            </button>
                            <button
                                type="button"
                                onClick={() => void handleConfirmAdd()}
                                disabled={adding}
                                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover disabled:opacity-50"
                            >
                                <PackagePlus className="h-4 w-4" />
                                {adding ? 'Adding…' : 'Add again anyway'}
                            </button>
                        </div>
                    </div>
                ) : (
<div className="px-5 py-4 sm:px-6">
                        {addError ? <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{addError}</p> : null}

                        <fieldset className="mb-4">
                            <legend className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-text-secondary">What to add</legend>
                            <div className="grid gap-2 sm:grid-cols-2">
                                <label className={`flex min-h-[54px] cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold ${addMode === 'all' ? 'border-primary/30 bg-primary/5 text-primary' : 'border-border bg-white text-text-secondary'}`}>
                                    <input
                                        type="radio"
                                        name="add-mode"
                                        value="all"
                                        checked={addMode === 'all'}
                                        onChange={() => setAddMode('all')}
                                        className="h-4 w-4 accent-[var(--primary)]"
                                    />
                                    Add all items
                                    <span className="ml-auto rounded-full bg-neutral px-2.5 py-0.5 text-[10px] font-black text-text-secondary">{addPreview.template.item_count}</span>
                                </label>
                                <label className={`flex min-h-[54px] cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold ${addMode === 'selected' ? 'border-primary/30 bg-primary/5 text-primary' : 'border-border bg-white text-text-secondary'}`}>
                                    <input
                                        type="radio"
                                        name="add-mode"
                                        value="selected"
                                        checked={addMode === 'selected'}
                                        onChange={() => setAddMode('selected')}
                                        className="h-4 w-4 accent-[var(--primary)]"
                                    />
                                    Choose sections & items
                                </label>
                            </div>
                        </fieldset>

                        {addMode === 'selected' ? (
                            <div className="mb-4 space-y-3">
                                {addPreview.sections.map((section) => {
                                    const sectionItemIds = section.items.map((item) => item.id);
                                    const sectionSelected = sectionItemIds.length > 0 && sectionItemIds.every((id) => selectedItemIds.includes(id));
                                    return (
                                        <div key={section.id} className="overflow-hidden rounded-2xl border border-border">
                                            <label className="flex min-h-[48px] cursor-pointer items-center gap-3 bg-neutral/40 px-4 py-3 text-sm font-bold text-foreground">
                                                <input
                                                    type="checkbox"
                                                    checked={sectionSelected}
                                                    onChange={() => toggleSection(section)}
                                                    className="h-4 w-4 accent-[var(--primary)]"
                                                />
                                                {section.name}
                                                <span className="ml-auto rounded-full bg-white px-2.5 py-0.5 text-[10px] font-black text-text-secondary">{sectionItemIds.length}</span>
                                            </label>
                                            <ul className="divide-y divide-border/40 bg-white pl-10">
                                                {section.items.map((item) => (
                                                    <li key={item.id}>
                                                        <label className="flex min-h-[44px] cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-text-secondary">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedItemIds.includes(item.id)}
                                                                onChange={() => toggleItem(item)}
                                                                className="h-4 w-4 accent-[var(--primary)]"
                                                            />
                                                            <span className="min-w-0">{item.title}{item.is_optional ? ' (optional)' : ''}</span>
                                                        </label>
                                                    </li>
                                                ))}
                                                {section.items.length === 0 ? <li className="px-4 py-3 text-sm italic text-text-secondary">No items in this section.</li> : null}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : null}
<div className="mb-4 grid gap-3">
                            <div>
                                <label htmlFor="checklist-name" className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-text-secondary">Checklist name</label>
                                <input
                                    id="checklist-name"
                                    type="text"
                                    value={checklistName}
                                    onChange={(e) => setChecklistName(e.target.value)}
                                    maxLength={120}
                                    placeholder={addTemplate.name}
                                    className="min-h-[44px] w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                                />
                            </div>
                            <div>
                                <label htmlFor="assign-to" className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-text-secondary">Assign to</label>
                                <select
                                    id="assign-to"
                                    value={assignTo}
                                    onChange={(e) => setAssignTo(e.target.value)}
                                    className="min-h-[44px] w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                                >
                                    {ASSIGN_TO_OPTIONS.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                    <option value="Custom">Custom collaborator…</option>
                                </select>
                                {assignTo === 'Custom' ? (
                                    <input
                                        type="text"
                                        value={customAssign}
                                        onChange={(e) => setCustomAssign(e.target.value)}
                                        maxLength={80}
                                        placeholder="Maid of Honor, Coordinator, Uncle Ken…"
                                        className="mt-2 min-h-[44px] w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                                    />
                                ) : null}
                                <p className="mt-1 text-[11px] leading-4 text-text-secondary">
                                    Items with their own person label (Ms. Rose, Maid of Honor, Best Man) keep that assignment.
                                </p>
                            </div>
                        </div>
<div className="mb-4 rounded-2xl border border-border bg-neutral/40 p-4">
                            <label className="flex cursor-pointer items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={applySuggestDueDates}
                                    onChange={(e) => setApplySuggestDueDates(e.target.checked)}
                                    className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                                />
                                <span>
                                    <span className="block text-sm font-bold text-foreground">Use suggested due dates</span>
                                    <span className="mt-0.5 block text-xs leading-5 text-text-secondary">
                                        Based on your wedding date: 30 days before to purchase or prepare, 14 days to confirm, 7 days to pack boxes, 1 day for final inspection, and wedding day to bring/distribute.
                                    </span>
                                </span>
                            </label>
                            {suggestedSchedule ? (
                                <ul className="mt-3 grid gap-1 sm:grid-cols-2">
                                    {suggestedSchedule.map((row) => (
                                        <li key={row.offset} className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-1.5 text-xs">
                                            <span className="font-bold text-text-secondary">{row.label}</span>
                                            <span className="font-semibold text-foreground">{row.date || '—'}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="mt-2 flex items-center gap-1.5 text-xs italic text-text-secondary">
                                    <Info className="h-3.5 w-3.5" /> Add a wedding date to your wedding details to enable suggested dates.
                                </p>
                            )}
                        </div>

                        <div className="sticky bottom-0 -mx-5 flex flex-col gap-2 border-t border-border bg-white px-5 py-4 sm:-mx-6 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs leading-5 text-text-secondary">
                                Adding <span className="font-bold text-foreground">{selectedCount}</span> item{selectedCount === 1 ? '' : 's'} to your checklist.
                                {selectedCount > 20 ? ' You can edit or remove them anytime after adding.' : ''}
                            </p>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={clearAdd}
                                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-border bg-white px-5 py-2 text-sm font-bold text-text-secondary transition hover:border-primary/30 hover:text-primary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void handleConfirmAdd()}
                                    disabled={adding || (addMode === 'selected' && selectedCount === 0)}
                                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover disabled:opacity-50"
                                >
                                    <PackagePlus className="h-4 w-4" />
                                    {adding ? 'Adding…' : `Add ${selectedCount} item${selectedCount === 1 ? '' : 's'}`}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </ModalFrame>
        );
    };
return (
        <section className="mt-8 rounded-2xl border border-border bg-white p-5 shadow-sm sm:rounded-[2.5rem] md:p-8" aria-label="Checklist Templates">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        <h3 className="font-serif text-xl font-bold text-foreground sm:text-2xl">Checklist Templates</h3>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-text-secondary sm:text-sm">
                        Ready-made Filipino wedding-day boxes and lists. Preview, pick the items you want, and add them to your checklist.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => void load(true)}
                    disabled={loading}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 self-start rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold text-text-secondary transition hover:border-primary/30 hover:text-primary disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {error ? (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
                    <span>{error}</span>
                </div>
            ) : null}

            {loading ? (
                <LoadingState variant="panel" label="Loading checklist templates…" className="mt-6 min-h-[160px]" />
            ) : templates.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-border bg-neutral/40 px-5 py-12 text-center">
                    <Package className="mx-auto h-8 w-8 text-primary/50" />
                    <p className="mt-3 font-serif text-lg font-bold text-foreground">No templates available yet</p>
                    <p className="mt-1 text-sm text-text-secondary">Wedding-day checklist templates will appear here.</p>
                </div>
            ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => (
                        <article key={template.id} className="flex flex-col rounded-2xl border border-border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                {template.already_added ? (
                                    <Pill tone="emerald"><CheckCircle2 className="h-3 w-3" /> Added</Pill>
                                ) : template.supports_box_packing ? (
                                    <Pill tone="rose"><Package className="h-3 w-3" /> Box packing</Pill>
                                ) : null}
                            </div>
                            <h4 className="mt-3 font-serif text-lg font-bold leading-snug text-foreground">{template.name}</h4>
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-text-secondary">{template.description}</p>
                            <p className="mt-3 text-[10px] font-black uppercase tracking-[0.14em] text-text-secondary">
                                {template.item_count} items · {template.section_count} sections
                            </p>
                            <div className="mt-4 grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => void openPreview(template.id)}
                                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold text-text-secondary transition hover:border-primary/30 hover:text-primary"
                                >
                                    <Eye className="h-4 w-4" /> Preview
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void startAdd(template.id)}
                                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 transition hover:bg-primary-hover"
                                >
                                    <PackagePlus className="h-4 w-4" /> Add to checklist
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {preview ? renderPreviewModal() : null}
            {addTemplate && addPreview ? renderAddModal() : null}

            {undoMessage ? (
                <div className="fixed bottom-4 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl bg-foreground px-4 py-3 text-center text-sm font-semibold text-white shadow-2xl" role="status">
                    {undoMessage}
                </div>
            ) : null}
        </section>
    );
}