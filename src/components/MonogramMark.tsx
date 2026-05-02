'use client';

type MonogramMarkProps = {
    initials?: string | null;
    brideName?: string | null;
    groomName?: string | null;
    shape?: string | null;
    color?: string | null;
    motifColor?: string | null;
    fontClassName?: string;
    fontFamily?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    inverted?: boolean;
};

const sizeClasses = {
    sm: {
        outer: 'h-16 w-16',
        text: 'text-2xl',
        ornament: 'text-[10px]',
    },
    md: {
        outer: 'h-24 w-24',
        text: 'text-3xl md:text-4xl',
        ornament: 'text-xs',
    },
    lg: {
        outer: 'h-32 w-32',
        text: 'text-4xl md:text-5xl',
        ornament: 'text-sm',
    },
};

function getInitials(initials?: string | null, brideName?: string | null, groomName?: string | null) {
    if (initials?.trim()) return initials.trim();
    const brideInitial = brideName?.trim()?.[0] || 'A';
    const groomInitial = groomName?.trim()?.[0] || 'B';
    return `${brideInitial} & ${groomInitial}`;
}

function hexToRgb(hex: string) {
    const normalized = hex.replace('#', '').trim();
    if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(normalized)) return null;
    const value = normalized.length === 3
        ? normalized.split('').map((char) => char + char).join('')
        : normalized;
    const number = Number.parseInt(value, 16);
    return {
        r: (number >> 16) & 255,
        g: (number >> 8) & 255,
        b: number & 255,
    };
}

function colorWithAlpha(color: string, alpha: number) {
    const rgb = hexToRgb(color);
    if (!rgb) return color;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export const MONOGRAM_SHAPES = [
    { id: 'minimal', name: 'Minimal', desc: 'Clean initials only' },
    { id: 'circle', name: 'Classic Circle', desc: 'Soft ring frame' },
    { id: 'square', name: 'Rounded Seal', desc: 'Modern rounded frame' },
    { id: 'double-ring', name: 'Double Ring', desc: 'Layered wedding seal' },
    { id: 'oval', name: 'Oval Cameo', desc: 'Heirloom portrait frame' },
    { id: 'diamond', name: 'Diamond', desc: 'Editorial geometric mark' },
    { id: 'crest', name: 'Heritage Crest', desc: 'Formal luxury crest' },
    { id: 'laurel', name: 'Laurel', desc: 'Botanical ceremony mark' },
    { id: 'editorial', name: 'Editorial', desc: 'Magazine masthead style' },
];

export function MonogramMark({
    initials,
    brideName,
    groomName,
    shape = 'minimal',
    color,
    motifColor,
    fontClassName = 'font-serif',
    fontFamily,
    size = 'md',
    className = '',
    inverted = false,
}: MonogramMarkProps) {
    const mark = getInitials(initials, brideName, groomName);
    const accent = color || motifColor || '#C08081';
    const sizeSet = sizeClasses[size];
    const normalizedShape = shape || 'minimal';
    const softFill = colorWithAlpha(accent, inverted ? 0.13 : 0.08);
    const mediumFill = colorWithAlpha(accent, inverted ? 0.24 : 0.16);
    const line = colorWithAlpha(accent, inverted ? 0.72 : 0.58);
    const shadow = colorWithAlpha(accent, 0.18);
    const textStyle = { color: accent, fontFamily };

    const text = (
        <span
            className={`${sizeSet.text} ${fontClassName} relative z-10 uppercase leading-none tracking-normal`}
            style={textStyle}
        >
            {mark}
        </span>
    );

    if (normalizedShape === 'minimal') {
        return (
            <div className={`relative inline-flex flex-col items-center justify-center ${sizeSet.outer} ${className}`}>
                <span className="absolute h-px w-3/4 -translate-y-8" style={{ background: `linear-gradient(90deg, transparent, ${line}, transparent)` }} />
                {text}
                <span className="absolute h-px w-3/4 translate-y-8" style={{ background: `linear-gradient(90deg, transparent, ${line}, transparent)` }} />
            </div>
        );
    }

    if (normalizedShape === 'editorial') {
        return (
            <div className={`relative inline-flex min-h-20 min-w-32 flex-col items-center justify-center px-7 py-5 ${className}`}>
                <span className={`${sizeSet.ornament} mb-2 font-black uppercase tracking-[0.34em]`} style={{ color: accent }}>The</span>
                {text}
                <span className="mt-3 h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${line}, transparent)` }} />
            </div>
        );
    }

    if (normalizedShape === 'laurel') {
        return (
            <div className={`relative inline-flex ${sizeSet.outer} items-center justify-center rounded-full ${className}`} style={{ backgroundColor: softFill }}>
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-4xl leading-none opacity-80" style={{ color: accent }}>(</span>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-4xl leading-none opacity-80" style={{ color: accent }}>)</span>
                <span className="absolute inset-3 rounded-full border" style={{ borderColor: line }} />
                {text}
            </div>
        );
    }

    const shapeClass =
        normalizedShape === 'circle' || normalizedShape === 'double-ring'
            ? 'rounded-full'
            : normalizedShape === 'square'
                ? 'rounded-[1.6rem]'
                : normalizedShape === 'oval'
                    ? 'rounded-[48%]'
                    : normalizedShape === 'diamond'
                        ? 'rotate-45 rounded-[1.15rem]'
                        : 'rounded-t-[2.4rem] rounded-b-[1.1rem]';

    const textWrapperClass = normalizedShape === 'diamond' ? '-rotate-45' : '';

    return (
        <div
            className={`relative inline-flex ${sizeSet.outer} items-center justify-center border bg-white/70 shadow-xl backdrop-blur-sm ${shapeClass} ${className}`}
            style={{
                borderColor: line,
                color: accent,
                background: normalizedShape === 'crest'
                    ? `linear-gradient(180deg, ${mediumFill}, rgba(255,255,255,0.78))`
                    : `linear-gradient(145deg, rgba(255,255,255,0.88), ${softFill})`,
                boxShadow: `0 18px 45px ${shadow}`,
            }}
        >
            <span className={`absolute inset-2 border ${shapeClass}`} style={{ borderColor: colorWithAlpha(accent, 0.35) }} />
            {normalizedShape === 'double-ring' && (
                <span className="absolute inset-4 rounded-full border" style={{ borderColor: colorWithAlpha(accent, 0.38) }} />
            )}
            {normalizedShape === 'crest' && (
                <>
                    <span className="absolute -top-2 h-4 w-10 rounded-t-full border-x border-t bg-white/80" style={{ borderColor: line }} />
                    <span className="absolute bottom-3 h-px w-1/2" style={{ backgroundColor: line }} />
                </>
            )}
            <span className={textWrapperClass}>{text}</span>
        </div>
    );
}
