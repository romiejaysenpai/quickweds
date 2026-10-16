'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus, Tag } from 'lucide-react';

interface CustomCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddCategory: (categoryName: string) => void;
    existingCategories: string[];
}

const POPULAR_SUGGESTIONS = [
    'Videography',
    'Favors & Gifts',
    'Rehearsal Dinner',
    'Officiant',
    'Honeymoon',
    'Legal & License',
    'Bridal Party',
    'Rentals & Lighting',
];

export default function CustomCategoryModal({
    isOpen,
    onClose,
    onAddCategory,
    existingCategories,
}: CustomCategoryModalProps) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => inputRef.current?.focus(), 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        setName('');
        setError('');
        onClose();
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) {
            setError('Please enter a category name');
            return;
        }
        if (existingCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
            setError('This category already exists');
            return;
        }
        onAddCategory(trimmed);
        onClose();
    };

    const handleSelectSuggestion = (suggestion: string) => {
        setName(suggestion);
        setError('');
        inputRef.current?.focus();
    };

    const availableSuggestions = POPULAR_SUGGESTIONS.filter(
        (s) => !existingCategories.some((c) => c.toLowerCase() === s.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Tag className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-serif text-lg font-bold text-foreground">New Category</h3>
                            <p className="text-xs text-text-secondary">Organize your expenses with a custom category</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-full p-1.5 text-text-secondary transition hover:bg-neutral hover:text-foreground"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1.5">
                            Category Name
                        </label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="e.g. Videography, Rehearsal Dinner"
                            className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                            maxLength={40}
                        />
                        {error && <p className="mt-1.5 text-xs font-semibold text-red-500">{error}</p>}
                    </div>

                    {availableSuggestions.length > 0 && (
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-2">
                                Popular suggestions
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {availableSuggestions.map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        type="button"
                                        onClick={() => handleSelectSuggestion(suggestion)}
                                        className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-neutral/40 px-2.5 py-1 text-xs font-semibold text-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                                    >
                                        <Plus className="h-3 w-3 text-primary" />
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-border/60">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-text-secondary transition hover:bg-neutral"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 transition hover:bg-primary-hover"
                        >
                            <Plus className="h-4 w-4" />
                            Add Category
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
