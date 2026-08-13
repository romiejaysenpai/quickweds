type ProgressBarProps = {
    value?: number;
    label?: string;
    className?: string;
};

export default function ProgressBar({
    value,
    label = 'Loading progress',
    className = '',
}: ProgressBarProps) {
    const normalizedValue = typeof value === 'number'
        ? Math.min(100, Math.max(0, Math.round(value)))
        : null;
    const isDeterminate = normalizedValue !== null;

    return (
        <div
            className={`h-1.5 w-full overflow-hidden rounded-full bg-primary/10 ${className}`}
            role="progressbar"
            aria-label={label}
            aria-valuemin={isDeterminate ? 0 : undefined}
            aria-valuemax={isDeterminate ? 100 : undefined}
            aria-valuenow={normalizedValue ?? undefined}
            aria-valuetext={isDeterminate ? `${normalizedValue}% complete` : 'In progress'}
        >
            {isDeterminate ? (
                <div
                    className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-accent transition-[width] duration-300 ease-out"
                    style={{ width: `${normalizedValue}%` }}
                />
            ) : (
                <div className="qw-loading-progress-indeterminate h-full rounded-full" />
            )}
        </div>
    );
}
