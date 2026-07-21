'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Eye, Search, Sparkles } from 'lucide-react';
import {
    FREE_TEMPLATE_IDS,
    TEMPLATES,
    recommendTemplateIds,
    templateMatchesFilter,
    type TemplateFilter,
    type TemplateRecommendationInput,
} from '@/lib/template-catalog';

type Props = {
    selectedId: string;
    isPremium: boolean;
    onSelect: (templateId: string) => void;
    onOpenPreview: () => void;
};

const FILTERS: { id: TemplateFilter; label: string }[] = [
    { id: 'all', label: 'All' }, { id: 'classic', label: 'Classic' },
    { id: 'modern', label: 'Modern' }, { id: 'romantic', label: 'Romantic' },
    { id: 'destination', label: 'Destination' }, { id: 'bold', label: 'Bold' },
];

export default function TemplatePicker({ selectedId, isPremium, onSelect, onOpenPreview }: Props) {
    const [filter, setFilter] = useState<TemplateFilter>('all');
    const [query, setQuery] = useState('');
    const [answers, setAnswers] = useState<TemplateRecommendationInput>({});
    const recommendations = useMemo(() => recommendTemplateIds(answers), [answers]);
    const hasAnswers = Object.values(answers).some(Boolean);
    const visible = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return TEMPLATES.filter((template) => templateMatchesFilter(template.id, filter))
            .filter((template) => !needle || `${template.name} ${template.desc} ${template.mood}`.toLowerCase().includes(needle))
            .sort((a, b) => (recommendations.indexOf(a.id) < 0 ? 99 : recommendations.indexOf(a.id)) - (recommendations.indexOf(b.id) < 0 ? 99 : recommendations.indexOf(b.id)));
    }, [filter, query, recommendations]);

    return (
        <div className="space-y-5">
            <div className="rounded-[1.75rem] border border-primary/15 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                        <p className="text-sm font-bold text-foreground">Find your best match</p>
                        <p className="mt-1 text-xs leading-5 text-text-secondary">Three quick choices rank the strongest templates first. Nothing is auto-selected.</p>
                    </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <select aria-label="Preferred mood" value={answers.mood || ''} onChange={(e) => setAnswers((a) => ({ ...a, mood: e.target.value as TemplateRecommendationInput['mood'] || undefined }))} className="min-h-[44px] rounded-xl border border-border bg-neutral px-3 text-sm outline-none focus:border-primary">
                        <option value="">Choose a mood</option><option value="timeless">Timeless</option><option value="soft">Soft & romantic</option><option value="clean">Clean & modern</option><option value="dramatic">Dramatic</option><option value="playful">Playful</option>
                    </select>
                    <select aria-label="Venue style" value={answers.venue || ''} onChange={(e) => setAnswers((a) => ({ ...a, venue: e.target.value as TemplateRecommendationInput['venue'] || undefined }))} className="min-h-[44px] rounded-xl border border-border bg-neutral px-3 text-sm outline-none focus:border-primary">
                        <option value="">Choose a venue</option><option value="ballroom">Ballroom</option><option value="garden">Garden</option><option value="beach">Beach</option><option value="city">City</option><option value="intimate">Intimate</option>
                    </select>
                    <select aria-label="Website priority" value={answers.priority || ''} onChange={(e) => setAnswers((a) => ({ ...a, priority: e.target.value as TemplateRecommendationInput['priority'] || undefined }))} className="min-h-[44px] rounded-xl border border-border bg-neutral px-3 text-sm outline-none focus:border-primary">
                        <option value="">Main priority</option><option value="photos">Photography</option><option value="schedule">Guest schedule</option><option value="rsvp">Fast RSVPs</option><option value="story">Our story</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary/50" />
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search templates" className="min-h-[44px] w-full rounded-xl border border-border bg-white pl-10 pr-4 text-sm outline-none focus:border-primary" />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Template filters">
                    {FILTERS.map((item) => <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={`min-h-[40px] shrink-0 rounded-full border px-4 text-xs font-bold transition ${filter === item.id ? 'border-primary bg-primary text-white' : 'border-border bg-white text-text-secondary hover:border-primary/30'}`}>{item.label}</button>)}
                </div>
            </div>

            {visible.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-text-secondary">No templates match those filters.</div> : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {visible.map((template) => {
                        const locked = !isPremium && !FREE_TEMPLATE_IDS.includes(template.id as typeof FREE_TEMPLATE_IDS[number]);
                        const selected = selectedId === template.id;
                        const recommended = hasAnswers && recommendations.includes(template.id);
                        const dark = ['luxury', 'midnight', 'royal', 'artdeco', 'cinematic', 'urban', 'glitch', 'film'].includes(template.id);
                        return (
                            <article key={template.id} className={`group overflow-hidden rounded-[1.5rem] border bg-white transition ${selected ? 'border-primary shadow-[0_20px_60px_rgba(192,128,129,.2)]' : 'border-border hover:border-primary/30'}`}>
                                <button type="button" disabled={locked} onClick={() => onSelect(template.id)} className="block w-full text-left disabled:cursor-not-allowed disabled:opacity-60">
                                    <div className={`relative h-44 overflow-hidden p-5 ${dark ? 'text-white' : 'text-[#32292b]'}`} style={{ backgroundImage: template.previewGradient }}>
                                        <div className={`absolute inset-x-5 top-5 border ${dark ? 'border-white/25' : 'border-black/10'} ${['editorial','minimal','vogue','urban'].includes(template.id) ? 'h-24 rounded-none' : 'h-28 rounded-[45%_45%_1rem_1rem]'}`} />
                                        <div className="relative flex h-full flex-col items-center justify-center text-center">
                                            <span className="text-[8px] font-bold uppercase tracking-[.34em] opacity-65">Together with their families</span>
                                            <span className={`mt-3 text-2xl leading-none ${['modern','minimal','timeline','urban','glitch'].includes(template.id) ? 'font-sans font-black uppercase' : 'font-serif italic'}`}>Isabella & Julian</span>
                                            <span className="mt-3 text-[9px] uppercase tracking-[.25em] opacity-70">24 · 10 · 2026</span>
                                        </div>
                                        {recommended && <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-primary shadow">Recommended</span>}
                                        {selected && <CheckCircle2 className="absolute right-3 top-3 h-5 w-5" />}
                                    </div>
                                    <div className="p-4">
                                        <p className="font-serif text-lg text-foreground">{template.name}</p>
                                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-text-secondary">{template.desc}</p>
                                    </div>
                                </button>
                                <div className="flex items-center justify-between border-t border-border/70 px-4 py-3">
                                    <span className="text-[9px] font-bold uppercase tracking-[.2em] text-text-secondary">{template.eyebrow}</span>
                                    <button type="button" onClick={() => { if (!locked) { onSelect(template.id); onOpenPreview(); } }} disabled={locked} className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-3 text-[10px] font-bold text-primary hover:bg-primary/5 disabled:opacity-40"><Eye className="h-3.5 w-3.5" /> Live preview</button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
