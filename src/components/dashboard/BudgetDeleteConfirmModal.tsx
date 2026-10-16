'use client';

import { X, Trash2, Loader2, AlertTriangle } from 'lucide-react';

interface BudgetDeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: any | null;
    currencySymbol: string;
    onConfirmDelete: () => Promise<void>;
    isDeleting: boolean;
}

export default function BudgetDeleteConfirmModal({
    isOpen,
    onClose,
    item,
    currencySymbol,
    onConfirmDelete,
    isDeleting,
}: BudgetDeleteConfirmModalProps) {
    if (!isOpen || !item) return null;

    const estimated = parseFloat(item.estimated_cost) || 0;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-sm rounded-2xl border border-red-100 bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        <h3 className="font-serif text-lg font-bold text-foreground">Delete Expense</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="rounded-full p-1 text-text-secondary hover:bg-neutral"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-4">
                    <p className="text-sm text-text-secondary">
                        Are you sure you want to remove this expense from your wedding budget?
                    </p>
                    <div className="mt-3 rounded-xl border border-border bg-neutral/40 p-3">
                        <p className="font-bold text-foreground">{item.item_name}</p>
                        <div className="mt-1 flex items-center justify-between text-xs text-text-secondary">
                            <span>{item.category}</span>
                            <span className="font-mono font-bold text-foreground">
                                {currencySymbol}{estimated.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-text-secondary transition hover:bg-neutral disabled:opacity-50"
                    >
                        Keep Expense
                    </button>
                    <button
                        type="button"
                        onClick={() => void onConfirmDelete()}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700 disabled:opacity-60"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete Expense
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
