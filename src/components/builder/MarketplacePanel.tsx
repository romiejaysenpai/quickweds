'use client';

import { Bookmark, CopyPlus, Layers3, Save, Trash2 } from 'lucide-react';
import {
    CURATED_TEMPLATE_PRESETS,
    SECTION_BLOCK_LIBRARY,
    type WeddingTemplatePreset,
} from '@/lib/wedding-features';

interface MarketplacePanelProps {
    presets: WeddingTemplatePreset[];
    onApplyPreset: (preset: Record<string, unknown>) => void;
    onDeletePreset: (presetId: string) => void;
    onSaveCurrent: () => void;
    onApplyBlock: (blockId: string) => void;
}

export default function MarketplacePanel({
    presets,
    onApplyPreset,
    onDeletePreset,
    onSaveCurrent,
    onApplyBlock,
}: MarketplacePanelProps) {
    return (
        <div className="space-y-6">
            <div className="p-4 sm:p-6 rounded-2xl border border-border bg-neutral/30 space-y-4">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                    <div>
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Bookmark className="w-4 h-4 text-primary" /> Theme Marketplace
                        </h4>
                        <p className="text-xs text-text-secondary">Apply a curated look, then save your custom version as a reusable preset.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onSaveCurrent}
                        className="w-full sm:w-auto px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-all min-h-[44px] inline-flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save Current
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {CURATED_TEMPLATE_PRESETS.map((preset) => (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => onApplyPreset(preset.preset)}
                            className="text-left p-4 rounded-2xl bg-white border border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
                        >
                            <p className="font-bold text-sm text-foreground">{preset.name}</p>
                            <p className="text-xs text-text-secondary mt-1">{preset.description}</p>
                            <p className="text-[10px] uppercase tracking-widest text-primary font-black mt-3">{preset.template}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl border border-border bg-neutral/30 space-y-4">
                <div>
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Layers3 className="w-4 h-4 text-primary" /> Reusable Section Blocks
                    </h4>
                    <p className="text-xs text-text-secondary">Drop in polished copy and starter blocks for timelines, registry setup, and post-wedding messaging.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SECTION_BLOCK_LIBRARY.map((block) => (
                        <button
                            key={block.id}
                            type="button"
                            onClick={() => onApplyBlock(block.id)}
                            className="text-left p-4 rounded-2xl bg-white border border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <CopyPlus className="w-4 h-4 text-primary" />
                                <p className="font-bold text-sm text-foreground">{block.name}</p>
                            </div>
                            <p className="text-xs text-text-secondary">{block.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl border border-border bg-neutral/30 space-y-4">
                <div>
                    <h4 className="text-sm font-bold text-foreground">Saved Presets</h4>
                    <p className="text-xs text-text-secondary">Your reusable looks and content mixes for future weddings.</p>
                </div>

                {presets.length === 0 ? (
                    <p className="text-sm text-text-secondary">You have not saved any presets yet.</p>
                ) : (
                    <div className="space-y-3">
                        {presets.map((preset) => (
                            <div key={preset.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-border">
                                <div className="min-w-0">
                                    <p className="font-bold text-sm text-foreground">{preset.name}</p>
                                    <p className="text-[10px] uppercase tracking-widest font-black text-text-secondary/60 break-all">{preset.template_id}</p>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={() => onApplyPreset(preset.preset_data)}
                                        className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all min-h-[44px]"
                                    >
                                        Apply
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDeletePreset(preset.id)}
                                        className="h-11 w-11 rounded-xl border border-border text-text-secondary hover:text-red-500 hover:border-red-200 transition-all inline-flex items-center justify-center"
                                        title="Delete preset"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
