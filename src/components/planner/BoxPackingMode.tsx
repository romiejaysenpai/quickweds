'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Package, PackageOpen, PackageX, UserRound } from 'lucide-react';
import {
    BOX_PACKING_TEMPLATE_KEYS,
    BOX_STATUS_CLASSES,
    BOX_STATUS_LABELS,
    BOX_STATUS_ORDER,
    BOX_FILTERS,
    type BoxFilterValue,
    type BoxStatus,
} from '@/lib/checklist-templates';

const BOX_TEMPLATE_LABELS: Record<string, string> = {
    'brides-box': "Bride's Box",
    'grooms-box': "Groom's Box",
    'ceremony-box': 'Ceremony Box',
    'reception-box': 'Reception Box',
    'prep-snacks': 'Prep Snacks',
    'master-box': 'Master Box',
};

function getBoxStatus(task: any): BoxStatus {
    const status = String(task?.box_status || '');
    return (BOX_STATUS_ORDER as string[]).includes(status) ? (status as BoxStatus) : 'not_started';
}

function isPackedStatus(status: BoxStatus) {
    return status === 'packed' || status === 'handed' || status === 'used';
}

export function BoxPackingMode({ tasks, updateTask }: {
    tasks: any[];
    updateTask: (task: any, patch: Record<string, unknown>) => void | Promise<void>;
}) {
    const [filter, setFilter] = useState<BoxFilterValue>('all');
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const boxTasks = useMemo(() => (tasks || []).filter((task) => BOX_PACKING_TEMPLATE_KEYS.includes(task?.source_template_key)), [tasks]);

    const grouped = useMemo(() => {
        const groups = new Map<string, any[]>();
        for (const task of boxTasks) {
            const key = String(task?.source_template_key || 'master-box');
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(task);
        }
        return Array.from(groups.entries());
    }, [boxTasks]);

    const totalCount = boxTasks.length;
    const packedCount = boxTasks.filter((task) => isPackedStatus(getBoxStatus(task))).length;
    const missingCount = totalCount - packedCount;

    const filteredTasks = useMemo(() => {
        return boxTasks.filter((task) => {
            const status = getBoxStatus(task);
            const assignee = (task?.responsible_person || task?.assigned_to || 'Couple').trim().toLowerCase();
            switch (filter) {
                case 'missing':
                    return !isPackedStatus(status);
                case 'packed':
                    return isPackedStatus(status);
                case 'assigned_to_me':
                    return assignee === '' || assignee === 'couple';
                case 'optional':
                    return Boolean(task?.is_optional);
                default:
                    return true;
            }
        });
    }, [boxTasks, filter]);

    const progressPct = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

    const visibleGroups = grouped
        .map(([key, items]) => [key, items.filter((task) => filteredTasks.includes(task)) as any[]] as [string, any[]])
        .filter(([, items]) => items.length > 0);

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-neutral/30 p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        <h3 className="font-serif text-lg font-bold text-foreground">Box Packing Mode</h3>
                    </div>
                    <p className="text-xs text-text-secondary">
                        {packedCount} of {totalCount} items packed
                    </p>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-border/50" role="progressbar" aria-valuenow={packedCount} aria-valuemin={0} aria-valuemax={Math.max(totalCount, 1)} aria-label="Box packing progress">
                    <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {BOX_FILTERS.map((option) => {
                        const active = filter === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setFilter(active ? 'all' : option.value)}
                                aria-pressed={active}
                                className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                                    active
                                        ? 'border-primary/30 bg-primary/10 text-primary'
                                        : 'border-border bg-white text-text-secondary hover:text-primary'
                                }`}
                            >
                                {option.value === 'missing' ? <PackageX className="h-3.5 w-3.5" /> : null}
                                {option.value === 'packed' ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                                {option.label}
                                {option.value === 'missing' ? <span className="rounded-full bg-white px-1.5 text-[10px] font-black">{missingCount}</span> : null}
                            </button>
                        );
                    })}
                </div>
            </div>
{visibleGroups.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-neutral/40 px-5 py-10 text-center">
                    <PackageOpen className="mx-auto h-8 w-8 text-primary/50" />
                    <p className="mt-3 font-serif text-lg font-bold text-foreground">
                        {boxTasks.length === 0 ? 'No box templates yet' : 'Nothing matches this filter'}
                    </p>
                    <p className="mx-auto mt-1 max-w-sm text-sm leading-5 text-text-secondary">
                        {boxTasks.length === 0
                            ? 'Add a template like Bride\u2019s Box, Groom\u2019s Box, or Master Box from Checklist Templates to pack it here.'
                            : 'Try a different filter to see more box items.'}
                    </p>
                </div>
            ) : (
                visibleGroups.map(([templateKey, items]) => {
                    const label = BOX_TEMPLATE_LABELS[templateKey] || templateKey;
                    const groupPacked = items.filter((task) => isPackedStatus(getBoxStatus(task))).length;
                    const isExpanded = expanded[templateKey] !== false;
                    return (
                        <div key={templateKey} className="overflow-hidden rounded-2xl border border-border bg-white">
                            <button
                                type="button"
                                onClick={() => setExpanded((current) => ({ ...current, [templateKey]: !isExpanded }))}
                                aria-expanded={isExpanded}
                                className="flex w-full min-h-[48px] items-center justify-between gap-3 border-b border-border bg-neutral/40 px-4 py-3 text-left"
                            >
                                <span className="font-serif text-base font-bold text-foreground">{label}</span>
                                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-primary">
                                    {groupPacked}/{items.length} packed
                                </span>
                            </button>
                            {isExpanded ? (
                                <ul className="divide-y divide-border/40">
                                    {items.map((task) => {
                                        const status = getBoxStatus(task);
                                        const assignee = task?.responsible_person || task?.assigned_to || null;
                                        return (
                                            <li key={task.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <p className={`text-sm font-semibold ${isPackedStatus(status) ? 'text-text-secondary line-through' : 'text-foreground'}`}>
                                                        {task.title}
                                                        {task.not_included ? <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700">Not in box</span> : null}
                                                        {Number(task.quantity) > 1 ? <span className="ml-2 text-xs font-normal text-text-secondary">× {Number(task.quantity)}</span> : null}
                                                    </p>
                                                    <p className="mt-0.5 text-[11px] leading-4 text-text-secondary">
                                                        {[task.location, task.due_date ? `Due ${new Date(task.due_date).toLocaleDateString()}` : null].filter(Boolean).join(' · ') || 'No location'}
                                                    </p>
                                                </div>
                                                {assignee ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                                                        <UserRound className="h-3 w-3" /> {assignee}
                                                    </span>
                                                ) : null}
                                                <select
                                                    value={status}
                                                    aria-label={`Box status for ${task.title}`}
                                                    onChange={(e) => void updateTask(task, { box_status: e.target.value })}
                                                    className={`min-h-[40px] w-full appearance-none rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-wide outline-none sm:w-48 ${BOX_STATUS_CLASSES[status]}`}
                                                >
                                                    {BOX_STATUS_ORDER.map((statusOption) => (
                                                        <option key={statusOption} value={statusOption} className="normal-case text-foreground">
                                                            {BOX_STATUS_LABELS[statusOption]}
                                                        </option>
                                                    ))}
                                                </select>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : null}
                        </div>
                    );
                })
            )}
        </div>
    );
}