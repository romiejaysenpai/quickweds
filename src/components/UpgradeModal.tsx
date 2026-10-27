'use client';

import { useEffect } from 'react';
import { X, Sparkles, CheckCircle2, Crown } from 'lucide-react';
import UpgradeButton from '@/components/UpgradeButton';

export interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    weddingId?: string;
    scope?: 'wedding' | 'account';
    title?: string;
    description?: string;
    featureHighlight?: string;
    features?: string[];
}

const DEFAULT_PLANNER_FEATURES = [
    'Unlimited guest emails & automated RSVP reminders',
    'Full seating chart, guest check-in & QR seat tickets',
    'Complete planner tools: budget, vendors, timeline & checklist',
    'Downloadable CSV guest list exports',
    'Google Calendar two-way synchronization',
    'Disposable camera guest photo portal & reveal dates',
];

const DEFAULT_ACCOUNT_FEATURES = [
    'Create more than 3 active wedding websites',
    'Full Planner Pro access across all owned weddings',
    'Unlimited guest emails, seating charts, and exports for every wedding',
];

export default function UpgradeModal({
    isOpen,
    onClose,
    weddingId,
    scope = 'wedding',
    title,
    description,
    featureHighlight,
    features,
}: UpgradeModalProps) {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const isAccount = scope === 'account';
    const displayTitle = title || (isAccount ? 'Unlock QuickWeds Account Pro' : 'Unlock QuickWeds Planner Pro');
    const displayDescription = description || (
        isAccount
            ? 'Unlock unlimited wedding websites and complete planner access across your entire account.'
            : 'Upgrade to the complete planning workspace — unlimited guest emails, full seating chart, reminders, Google Calendar sync, and exports.'
    );
    const featureList = features || (isAccount ? DEFAULT_ACCOUNT_FEATURES : DEFAULT_PLANNER_FEATURES);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upgrade-modal-title"
        >
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

            <div className="relative z-10 w-full max-w-lg rounded-3xl border border-primary/20 bg-white p-6 sm:p-8 shadow-2xl text-center max-h-[90vh] overflow-y-auto">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full text-text-secondary hover:text-foreground hover:bg-neutral/80 transition-colors"
                    aria-label="Close modal"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Top Badge & Icon */}
                <div className="mx-auto mb-3 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-100 via-rose-50 to-primary/10 shadow-inner">
                    {isAccount ? (
                        <Crown className="h-7 w-7 sm:h-8 sm:w-8 text-amber-600 animate-pulse" />
                    ) : (
                        <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-primary animate-pulse" />
                    )}
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.18em] mb-2">
                    <span>{isAccount ? 'Account Pro' : 'Planner Pro'}</span>
                    <span>•</span>
                    <span>₱850 Pay Once</span>
                </div>

                <h3 id="upgrade-modal-title" className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-2">
                    {displayTitle}
                </h3>

                <p className="text-xs sm:text-sm leading-relaxed text-text-secondary mb-5">
                    {displayDescription}
                </p>

                {featureHighlight && (
                    <div className="mb-4 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 to-amber-500/10 p-3.5 text-left text-xs font-bold text-foreground flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-primary block">Ready to unlock</span>
                            <span>{featureHighlight}</span>
                        </div>
                    </div>
                )}

                <div className="space-y-2.5 mb-6 text-left text-xs sm:text-sm text-foreground/85 font-medium bg-neutral/40 p-4 rounded-2xl border border-border">
                    {featureList.map((feature) => (
                        <div key={feature} className="flex items-start gap-2.5">
                            <span className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full bg-primary text-white">
                                <CheckCircle2 className="h-3 w-3" />
                            </span>
                            <span className="leading-tight">{feature}</span>
                        </div>
                    ))}
                </div>

                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-5 text-center">
                    ✨ One-time purchase of ₱850. No recurring subscriptions or hidden fees.
                </div>

                <div className="space-y-2">
                    <UpgradeButton
                        weddingId={weddingId}
                        scope={scope}
                        plan={isAccount ? 'account_pro' : 'planner_pro'}
                        className="w-full justify-center py-3.5 text-sm sm:text-base shadow-xl"
                        label={isAccount ? 'Unlock Account Pro for ₱850' : 'Unlock Planner Pro for ₱850'}
                    />
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2.5 text-xs font-bold text-text-secondary hover:text-foreground transition-colors"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
}
