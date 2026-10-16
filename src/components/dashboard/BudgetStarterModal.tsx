'use client';

import { useState } from 'react';
import { Sparkles, X, Check, Loader2, CheckCircle2 } from 'lucide-react';

export interface StarterBudgetTemplateItem {
    id: string;
    category: string;
    item_name: string;
    percent: number;
    description: string;
}

export const STARTER_BUDGET_TEMPLATES: StarterBudgetTemplateItem[] = [
    { id: 'venue', category: 'Venue', item_name: 'Ceremony & Reception Venue', percent: 28, description: 'Venue hire, ceremony site, tables & chairs' },
    { id: 'catering', category: 'Catering', item_name: 'Catering & Beverage Service', percent: 24, description: 'Per-guest food, bar service, service staff' },
    { id: 'photo', category: 'Photography', item_name: 'Wedding Photography & Video', percent: 10, description: 'Full wedding day coverage & digital delivery' },
    { id: 'decor', category: 'Decor', item_name: 'Flowers & Table Styling', percent: 9, description: 'Bouquets, centerpieces, ceremony arch styling' },
    { id: 'attire', category: 'Attire', item_name: 'Wedding Attire & Alterations', percent: 8, description: 'Dress, suit, shoes, accessories & fittings' },
    { id: 'entertainment', category: 'Entertainment', item_name: 'DJ & Sound System', percent: 7, description: 'Reception entertainment & audio equipment' },
    { id: 'beauty', category: 'Beauty', item_name: 'Bridal Hair & Makeup', percent: 4, description: 'Hair styling & makeup for the big day' },
    { id: 'cake', category: 'Cake', item_name: 'Wedding Cake & Desserts', percent: 3, description: 'Tiered cake, cutting fee, dessert treats' },
    { id: 'stationery', category: 'Stationery', item_name: 'Invitations & Paper Goods', percent: 2, description: 'Invitations, menus, signage, thank-yous' },
    { id: 'buffer', category: 'Other', item_name: 'Contingency & Emergency Buffer', percent: 5, description: 'Vendor tips, overtime, unexpected fees' },
];

interface BudgetStarterModalProps {
    isOpen: boolean;
    onClose: () => void;
    weddingId: string;
    currentTotalBudget: number;
    currencySymbol: string;
    onSaveTotalBudget: (amount: number) => Promise<void>;
    createPlannerItem: (weddingId: string, type: string, values: Record<string, unknown>) => Promise<any>;
    onSuccess: (newItems: any[]) => void;
}

export default function BudgetStarterModal({
    isOpen,
    onClose,
    weddingId,
    currentTotalBudget,
    currencySymbol,
    onSaveTotalBudget,
    createPlannerItem,
    onSuccess,
}: BudgetStarterModalProps) {
    const [targetBudget, setTargetBudget] = useState<number | string>(
        currentTotalBudget > 0 ? currentTotalBudget : 20000
    );
    const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>(() => {
        const init: Record<string, boolean> = {};
        STARTER_BUDGET_TEMPLATES.forEach((item) => {
            init[item.id] = true;
        });
        return init;
    });
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState<{ current: number; total: number; title: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const numericBudget = Math.max(0, parseFloat(String(targetBudget)) || 0);

    const toggleItem = (id: string) => {
        setSelectedIds((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const toggleAll = (select: boolean) => {
        const next: Record<string, boolean> = {};
        STARTER_BUDGET_TEMPLATES.forEach((item) => {
            next[item.id] = select;
        });
        setSelectedIds(next);
    };

    const selectedItems = STARTER_BUDGET_TEMPLATES.filter((item) => selectedIds[item.id]);
    const selectedTotalEstimated = selectedItems.reduce((acc, item) => {
        const cost = Math.round(numericBudget * (item.percent / 100));
        return acc + cost;
    }, 0);

    const handleGenerate = async () => {
        if (selectedItems.length === 0) {
            setError('Please select at least one expense item to populate.');
            return;
        }

        setError(null);
        setGenerating(true);

        try {
            // If the user changed their total budget, save it first
            if (numericBudget > 0 && numericBudget !== currentTotalBudget) {
                await onSaveTotalBudget(numericBudget);
            }

            const createdItems: any[] = [];
            for (let i = 0; i < selectedItems.length; i++) {
                const item = selectedItems[i];
                const estimatedCost = Math.round(numericBudget * (item.percent / 100));

                setProgress({
                    current: i + 1,
                    total: selectedItems.length,
                    title: item.item_name,
                });

                const created = await createPlannerItem(weddingId, 'budget', {
                    category: item.category,
                    item_name: item.item_name,
                    estimated_cost: estimatedCost,
                    due_date: null,
                });

                if (created) {
                    createdItems.push(created);
                }
            }

            onSuccess(createdItems);
            onClose();
        } catch (err: any) {
            console.error('Error generating starter budget:', err);
            setError(err?.message || 'Failed to populate all starter items. Some items may have been saved.');
        } finally {
            setGenerating(false);
            setProgress(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-border bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/60 p-6 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-serif text-xl font-bold text-foreground">Starter Budget Generator</h3>
                            <p className="text-xs text-text-secondary">
                                Auto-populate 10 essential wedding categories based on industry percentage benchmarks
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={generating}
                        className="rounded-full p-2 text-text-secondary transition hover:bg-neutral hover:text-foreground disabled:opacity-40"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Budget Target Input */}
                    <div className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">
                                    Target Whole Wedding Budget
                                </label>
                                <p className="text-xs text-text-secondary">
                                    Line item costs will be calculated from this total
                                </p>
                            </div>
                            <div className="relative w-full sm:w-48">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-primary">
                                    {currencySymbol}
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={targetBudget}
                                    onChange={(e) => setTargetBudget(e.target.value)}
                                    disabled={generating}
                                    className="h-11 w-full rounded-xl border border-border bg-white pl-8 pr-3 text-right font-mono text-base font-bold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-neutral"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar (during generation) */}
                    {generating && progress && (
                        <div className="rounded-2xl border border-primary/30 bg-white p-4 shadow-md">
                            <div className="flex items-center justify-between text-xs font-bold text-foreground mb-2">
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    Adding: {progress.title}
                                </span>
                                <span className="font-mono text-primary font-black">
                                    {progress.current} of {progress.total}
                                </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral">
                                <div
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: `${Math.round((progress.current / progress.total) * 100)}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Items Checklist */}
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase tracking-widest text-text-secondary">
                                Recommended Categories ({selectedItems.length} selected)
                            </h4>
                            <div className="flex items-center gap-2 text-xs font-bold">
                                <button
                                    type="button"
                                    onClick={() => toggleAll(true)}
                                    disabled={generating}
                                    className="text-primary hover:underline"
                                >
                                    Select All
                                </button>
                                <span className="text-border">|</span>
                                <button
                                    type="button"
                                    onClick={() => toggleAll(false)}
                                    disabled={generating}
                                    className="text-text-secondary hover:text-foreground"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        <div className="divide-y divide-border/40 rounded-2xl border border-border bg-white overflow-hidden">
                            {STARTER_BUDGET_TEMPLATES.map((item) => {
                                const isChecked = Boolean(selectedIds[item.id]);
                                const estimatedCost = Math.round(numericBudget * (item.percent / 100));

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => !generating && toggleItem(item.id)}
                                        className={`flex cursor-pointer items-center justify-between gap-3 p-3 transition ${isChecked ? 'bg-white hover:bg-neutral/30' : 'bg-neutral/20 opacity-60 hover:opacity-90'}`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div
                                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${isChecked ? 'border-primary bg-primary text-white' : 'border-border bg-white'}`}
                                            >
                                                {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="truncate text-xs font-bold text-foreground">
                                                        {item.item_name}
                                                    </span>
                                                    <span className="rounded bg-neutral px-1.5 py-0.5 text-[9px] font-bold text-text-secondary">
                                                        {item.category}
                                                    </span>
                                                </div>
                                                <p className="truncate text-[10px] text-text-secondary">{item.description}</p>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <span className="block font-mono text-xs font-black text-primary">
                                                {currencySymbol}{estimatedCost.toLocaleString()}
                                            </span>
                                            <span className="text-[10px] font-semibold text-text-secondary">
                                                {item.percent}% of budget
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col gap-3 border-t border-border/60 bg-neutral/20 p-5 sm:flex-row sm:items-center sm:justify-between rounded-b-3xl">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                            Selected Total
                        </p>
                        <p className="font-mono text-base font-black text-foreground">
                            {currencySymbol}{selectedTotalEstimated.toLocaleString()}{' '}
                            <span className="text-xs font-normal text-text-secondary">({selectedItems.length} items)</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={generating}
                            className="rounded-xl border border-border bg-white px-4 py-2.5 text-xs font-bold text-text-secondary transition hover:bg-neutral disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => void handleGenerate()}
                            disabled={generating || selectedItems.length === 0}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover active:scale-95 disabled:opacity-50"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Populating Budget...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    Populate Budget ({selectedItems.length} items)
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
