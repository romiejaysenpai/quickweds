import { LoaderCircle } from 'lucide-react';
import ProgressBar from './ProgressBar';

export type LoadingStateVariant = 'page' | 'panel' | 'inline';

type LoadingStateProps = {
    label?: string;
    description?: string;
    variant?: LoadingStateVariant;
    className?: string;
    showProgress?: boolean;
};

export default function LoadingState({
    label = 'Loading…',
    description,
    variant = 'page',
    className = '',
    showProgress = variant !== 'inline',
}: LoadingStateProps) {
    if (variant === 'inline') {
        return (
            <span className={`inline-flex shrink-0 ${className}`} role="status" aria-live="polite" aria-label={label}>
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            </span>
        );
    }

    const isPanel = variant === 'panel';

    return (
        <div
            className={`flex w-full flex-col items-center justify-center rounded-3xl border border-primary/10 bg-white/80 p-6 text-center shadow-xl shadow-primary/5 backdrop-blur-sm ${
                isPanel ? 'min-h-[220px]' : 'min-h-[min(60dvh,38rem)]'
            } ${className}`}
            role="status"
            aria-live="polite"
            aria-busy="true"
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary shadow-sm shadow-primary/10">
                <LoaderCircle className="h-6 w-6 animate-spin" aria-hidden="true" />
            </div>
            <p className="mt-4 font-serif text-lg font-bold text-foreground">{label}</p>
            {description && <p className="mt-1 max-w-sm text-sm leading-6 text-text-secondary">{description}</p>}
            {showProgress && <ProgressBar className="mt-4 max-w-44" label={label} />}
        </div>
    );
}
