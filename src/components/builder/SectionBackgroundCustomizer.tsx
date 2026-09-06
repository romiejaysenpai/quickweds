'use client';

import { useState } from 'react';
import { Palette, Sparkles, Image as ImageIcon, Sliders, Check, RefreshCw } from 'lucide-react';
import {
    EDITABLE_SECTIONS,
    SECTION_GRADIENT_PRESETS,
    SECTION_TEXTURE_PRESETS,
} from '@/lib/theme-engine';
import type { SectionStylesMap, SectionStyleConfig, SectionBackgroundMode, SectionTextureType } from '@/types/wedding';

interface SectionBackgroundCustomizerProps {
    sectionStyles?: SectionStylesMap;
    motifColor: string;
    onChange: (styles: SectionStylesMap) => void;
}

const QUICK_COLORS = [
    '#FFFFFF',
    '#FFF8F4',
    '#FAF7F2',
    '#F7F4EE',
    '#F8EEEA',
    '#F3EBE1',
    '#2D3748',
    '#1A202C',
    '#3A2A2D',
];

export default function SectionBackgroundCustomizer({
    sectionStyles = {},
    motifColor,
    onChange,
}: SectionBackgroundCustomizerProps) {
    const [activeSectionId, setActiveSectionId] = useState<string>(EDITABLE_SECTIONS[1].id); // default to 'bio'
    const [isUploading, setIsUploading] = useState(false);

    const activeConfig: SectionStyleConfig = sectionStyles[activeSectionId] || { mode: 'default' };
    const activeMode: SectionBackgroundMode = activeConfig.mode || 'default';

    const updateActiveSection = (patch: Partial<SectionStyleConfig>) => {
        const nextConfig: SectionStyleConfig = {
            ...activeConfig,
            ...patch,
        };
        onChange({
            ...sectionStyles,
            [activeSectionId]: nextConfig,
        });
    };

    const resetActiveSection = () => {
        const next = { ...sectionStyles };
        delete next[activeSectionId];
        onChange(next);
    };

    const handleCustomImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('Image must be under 10MB.');
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            let data: any = {};
            try {
                data = await res.json();
            } catch {
                throw new Error(`Server returned status ${res.status}`);
            }

            if (res.ok && data.url) {
                updateActiveSection({
                    mode: 'image',
                    imageUrl: data.url,
                    overlayOpacity: activeConfig.overlayOpacity ?? 40,
                    overlayTheme: activeConfig.overlayTheme ?? 'dark',
                });
            } else {
                alert(data.error || 'Failed to upload section photo. You can also paste an image link directly.');
            }
        } catch (err: any) {
            alert('Failed to upload image: ' + (err.message || 'Network error') + '. You can also paste an image URL directly below.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4 rounded-[1.75rem] border border-border bg-white/80 p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-primary" />
                        <p className="text-xs font-bold uppercase tracking-widest text-primary">
                            Section Backgrounds & Textures
                        </p>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                        Customize individual sections with colors, paper grain, editorial gradients, or atmospheric photos.
                    </p>
                </div>
                {activeMode !== 'default' && (
                    <button
                        type="button"
                        onClick={resetActiveSection}
                        className="inline-flex items-center gap-1.5 self-start text-[11px] font-bold text-text-secondary/70 hover:text-primary transition-colors py-1 px-2 rounded-lg hover:bg-neutral"
                    >
                        <RefreshCw className="h-3 w-3" /> Reset Section
                    </button>
                )}
            </div>

            {/* Section Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 pt-1 no-scrollbar sm:flex-wrap">
                {EDITABLE_SECTIONS.map((sec) => {
                    const isSelected = activeSectionId === sec.id;
                    const hasCustom = sectionStyles[sec.id]?.mode && sectionStyles[sec.id]?.mode !== 'default';
                    return (
                        <button
                            key={sec.id}
                            type="button"
                            onClick={() => setActiveSectionId(sec.id)}
                            className={`relative shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                                isSelected
                                    ? 'bg-primary text-white shadow-sm ring-2 ring-primary/20'
                                    : 'bg-neutral text-text-secondary hover:bg-neutral/80 hover:text-foreground'
                            }`}
                        >
                            <span>{sec.name}</span>
                            {hasCustom && (
                                <span
                                    className={`ml-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                                        isSelected ? 'bg-white' : 'bg-primary'
                                    }`}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-5 gap-1.5 rounded-2xl bg-neutral/60 p-1 border border-border/60">
                {(
                    [
                        { id: 'default', label: 'Default', icon: Sparkles },
                        { id: 'color', label: 'Color', icon: Palette },
                        { id: 'gradient', label: 'Gradient', icon: Sliders },
                        { id: 'texture', label: 'Texture', icon: Sparkles },
                        { id: 'image', label: 'Photo', icon: ImageIcon },
                    ] as const
                ).map((modeItem) => {
                    const isSelected = activeMode === modeItem.id;
                    const Icon = modeItem.icon;
                    return (
                        <button
                            key={modeItem.id}
                            type="button"
                            onClick={() => {
                                if (modeItem.id === 'default') {
                                    updateActiveSection({ mode: 'default' });
                                } else if (modeItem.id === 'color') {
                                    updateActiveSection({
                                        mode: 'color',
                                        color: activeConfig.color || motifColor,
                                    });
                                } else if (modeItem.id === 'gradient') {
                                    updateActiveSection({
                                        mode: 'gradient',
                                        gradient: activeConfig.gradient || SECTION_GRADIENT_PRESETS[0].value,
                                    });
                                } else if (modeItem.id === 'texture') {
                                    updateActiveSection({
                                        mode: 'texture',
                                        texture: activeConfig.texture || 'grain',
                                    });
                                } else if (modeItem.id === 'image') {
                                    updateActiveSection({
                                        mode: 'image',
                                        overlayOpacity: activeConfig.overlayOpacity ?? 40,
                                        overlayTheme: activeConfig.overlayTheme ?? 'dark',
                                    });
                                }
                            }}
                            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 rounded-xl py-2 px-2 text-[11px] font-bold transition-all ${
                                isSelected
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-text-secondary hover:text-foreground'
                            }`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            <span>{modeItem.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Sub-panels based on Mode */}
            <div className="pt-2">
                {activeMode === 'default' && (
                    <div className="rounded-xl border border-dashed border-border/80 bg-neutral/30 p-4 text-center">
                        <p className="text-xs text-text-secondary">
                            This section is using the template&apos;s default paper & surface style.
                        </p>
                    </div>
                )}

                {activeMode === 'color' && (
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Motif swatch */}
                            <button
                                type="button"
                                onClick={() => updateActiveSection({ color: motifColor })}
                                className={`h-8 w-8 rounded-xl border-2 transition-all relative ${
                                    activeConfig.color === motifColor ? 'border-primary scale-110 shadow-md ring-2 ring-primary/20' : 'border-border hover:scale-105'
                                }`}
                                style={{ backgroundColor: motifColor }}
                                title="Wedding Motif Color"
                            >
                                {activeConfig.color === motifColor && <Check className="h-4 w-4 text-white mx-auto" />}
                            </button>

                            {QUICK_COLORS.map((col) => (
                                <button
                                    key={col}
                                    type="button"
                                    onClick={() => updateActiveSection({ color: col })}
                                    className={`h-8 w-8 rounded-xl border-2 transition-all relative ${
                                        activeConfig.color === col ? 'border-primary scale-110 shadow-md ring-2 ring-primary/20' : 'border-border hover:scale-105'
                                    }`}
                                    style={{ backgroundColor: col }}
                                    title={col}
                                >
                                    {activeConfig.color === col && (
                                        <Check className={`h-4 w-4 mx-auto ${col === '#FFFFFF' || col === '#FFF8F4' ? 'text-black' : 'text-white'}`} />
                                    )}
                                </button>
                            ))}

                            {/* Native Hex Picker */}
                            <div className="flex items-center gap-2 ml-auto">
                                <input
                                    type="color"
                                    value={activeConfig.color || motifColor}
                                    onChange={(e) => updateActiveSection({ color: e.target.value })}
                                    className="h-8 w-8 rounded-xl border border-border cursor-pointer bg-transparent"
                                />
                                <span className="font-mono text-xs text-text-secondary">
                                    {activeConfig.color || motifColor}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {activeMode === 'gradient' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {SECTION_GRADIENT_PRESETS.map((grad) => {
                            const isSelected = activeConfig.gradient === grad.value;
                            return (
                                <button
                                    key={grad.id}
                                    type="button"
                                    onClick={() => updateActiveSection({ gradient: grad.value })}
                                    className={`relative overflow-hidden rounded-xl border p-3 text-left transition-all ${
                                        isSelected
                                            ? 'border-primary ring-2 ring-primary/30 shadow-md'
                                            : 'border-border hover:border-primary/40'
                                    }`}
                                    style={{ backgroundImage: grad.value }}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs font-bold ${'isDark' in grad && grad.isDark ? 'text-white' : 'text-foreground'}`}>
                                            {grad.name}
                                        </span>
                                        {isSelected && (
                                            <span className="rounded-full bg-primary p-0.5 text-white shadow-sm">
                                                <Check className="h-3 w-3" />
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {activeMode === 'texture' && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                        {SECTION_TEXTURE_PRESETS.map((tex) => {
                            const isSelected = activeConfig.texture === tex.id;
                            return (
                                <button
                                    key={tex.id}
                                    type="button"
                                    onClick={() => updateActiveSection({ texture: tex.id as SectionTextureType })}
                                    className={`group rounded-xl border p-2.5 text-left transition-all ${
                                        isSelected
                                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md'
                                            : 'border-border bg-white hover:border-primary/40'
                                    }`}
                                >
                                    <div
                                        className="h-12 w-full rounded-lg border border-border/70 mb-2 relative overflow-hidden"
                                        style={{ backgroundImage: tex.preview, backgroundColor: '#FAF7F2' }}
                                    >
                                        {isSelected && (
                                            <div className="absolute top-1 right-1 rounded-full bg-primary p-0.5 text-white">
                                                <Check className="h-2.5 w-2.5" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs font-bold text-foreground">{tex.name}</p>
                                    <p className="text-[10px] text-text-secondary leading-tight mt-0.5">{tex.description}</p>
                                </button>
                            );
                        })}
                    </div>
                )}

                {activeMode === 'image' && (
                    <div className="space-y-4 rounded-xl border border-border bg-neutral/30 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-bold text-foreground">Section Photo Backdrop</p>
                                <p className="text-[11px] text-text-secondary mt-0.5">
                                    Upload a photo or paste any image link for the {EDITABLE_SECTIONS.find(s => s.id === activeSectionId)?.name} section.
                                </p>
                            </div>
                            <label className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-white px-3 py-2 text-xs font-bold text-primary shadow-sm hover:bg-primary hover:text-white transition-all">
                                <span>{isUploading ? 'Uploading...' : activeConfig.imageUrl ? 'Upload New Photo' : 'Upload File'}</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    disabled={isUploading}
                                    onChange={handleCustomImageUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* Image URL Paste Option */}
                        <div className="flex gap-2">
                            <input
                                type="url"
                                placeholder="Or paste image URL (https://...)"
                                value={activeConfig.imageUrl || ''}
                                onChange={(e) => updateActiveSection({
                                    mode: 'image',
                                    imageUrl: e.target.value,
                                    overlayOpacity: activeConfig.overlayOpacity ?? 40,
                                    overlayTheme: activeConfig.overlayTheme ?? 'dark',
                                })}
                                className="flex-1 rounded-xl border border-border bg-white px-3 py-2 text-xs text-foreground placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            {activeConfig.imageUrl && (
                                <button
                                    type="button"
                                    onClick={() => updateActiveSection({ imageUrl: '' })}
                                    className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-text-secondary hover:bg-white hover:text-foreground"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Sample Designer Backdrops */}
                        <div>
                            <p className="text-[11px] font-semibold text-text-secondary mb-2">Or choose a curated atmosphere:</p>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {[
                                    { label: 'Candlelit Manor', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80' },
                                    { label: 'Floral Arch', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80' },
                                    { label: 'Olive Ceremony', url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80' },
                                    { label: 'Golden Sunset', url: 'https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=1200&q=80' },
                                ].map((preset) => (
                                    <button
                                        key={preset.label}
                                        type="button"
                                        onClick={() => updateActiveSection({
                                            mode: 'image',
                                            imageUrl: preset.url,
                                            overlayOpacity: activeConfig.overlayOpacity ?? 45,
                                            overlayTheme: 'dark',
                                        })}
                                        className={`group relative h-16 overflow-hidden rounded-xl border text-left transition-all ${
                                            activeConfig.imageUrl === preset.url
                                                ? 'border-primary ring-2 ring-primary/30'
                                                : 'border-border/70 hover:border-primary/50'
                                        }`}
                                    >
                                        <img src={preset.url} alt={preset.label} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/40 p-1.5 flex items-end">
                                            <span className="text-[10px] font-bold text-white leading-tight">{preset.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {activeConfig.imageUrl && (
                            <div className="space-y-3 pt-3 border-t border-border/60">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={activeConfig.imageUrl}
                                        alt="Section backdrop preview"
                                        className="h-16 w-24 rounded-lg object-cover border border-border shadow-sm"
                                    />
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-text-secondary">
                                                Contrast Scrim Overlay: {activeConfig.overlayOpacity ?? 40}%
                                            </span>
                                            <div className="flex gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => updateActiveSection({ overlayTheme: 'dark' })}
                                                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                                                        (activeConfig.overlayTheme ?? 'dark') === 'dark'
                                                            ? 'bg-black text-white'
                                                            : 'bg-white border text-text-secondary'
                                                    }`}
                                                >
                                                    Dark
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => updateActiveSection({ overlayTheme: 'light' })}
                                                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                                                        activeConfig.overlayTheme === 'light'
                                                            ? 'bg-primary text-white'
                                                            : 'bg-white border text-text-secondary'
                                                    }`}
                                                >
                                                    Light
                                                </button>
                                            </div>
                                        </div>
                                        <input
                                            type="range"
                                            min={0}
                                            max={80}
                                            step={5}
                                            value={activeConfig.overlayOpacity ?? 40}
                                            onChange={(e) => updateActiveSection({ overlayOpacity: parseInt(e.target.value, 10) })}
                                            className="w-full accent-primary"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
