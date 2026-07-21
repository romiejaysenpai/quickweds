'use client';

import React from 'react';

type MonogramMarkProps = {
    initials?: string | null;
    brideName?: string | null;
    groomName?: string | null;
    shape?: string | null;
    animation?: string | null;
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
    { id: 'minimal', name: 'Minimal', desc: 'Clean initials with subtle lines', isPro: false },
    { id: 'circle', name: 'Classic Circle', desc: 'Soft ring frame', isPro: false },
    { id: 'square', name: 'Rounded Seal', desc: 'Modern rounded frame', isPro: false },
    { id: 'double-ring', name: 'Double Ring', desc: 'Layered wedding seal', isPro: false },
    { id: 'oval', name: 'Oval Cameo', desc: 'Heirloom portrait frame', isPro: false },
    // Pro Styles
    { id: 'diamond', name: 'Diamond Geo', desc: 'Editorial rotated geometric mark', isPro: true },
    { id: 'crest', name: 'Heritage Crest', desc: 'Formal heraldic luxury crest', isPro: true },
    { id: 'laurel', name: 'Botanical Laurel', desc: 'Botanical leaf wreath ceremony mark', isPro: true },
    { id: 'editorial', name: 'Magazine Editorial', desc: 'Fashion magazine masthead style', isPro: true },
    { id: 'wax-seal', name: 'Wax Stamp Seal', desc: 'Embossed traditional wax seal emblem', isPro: true },
    { id: 'gold-foil', name: 'Luxury Gold Foil', desc: 'Shimmering metallic gold border & text', isPro: true },
    { id: 'royal-crown', name: 'Royal Crown Crest', desc: 'Regal crown emblem with ornate frame', isPro: true },
    { id: 'art-deco', name: 'Art Deco Frame', desc: 'Vintage Gatsby 1920s geometric frame', isPro: true },
    { id: 'romantic-heart', name: 'Romantic Heart', desc: 'Intertwined heart contour frame', isPro: true },
    { id: 'vintage-wreath', name: 'Vintage Wreath', desc: 'Intricate floral circle wreath', isPro: true },
];

export const MONOGRAM_ANIMATIONS = [
    { id: 'none', name: 'Static (None)', desc: 'Clean still monogram', isPro: false },
    { id: 'draw', name: 'Line Drawing Trace', desc: 'Stroke trace reveal & path drawing', isPro: true },
    { id: 'pulse', name: 'Glow & Scale Pulse', desc: 'Subtle breathing motion with soft radial glow', isPro: true },
    { id: 'shimmer', name: 'Metallic Shimmer', desc: 'Sleek light-beam sweep across monogram', isPro: true },
    { id: 'spin', name: 'Rotational Wreath', desc: 'Slow continuous rotation of floral frame', isPro: true },
    { id: 'slide', name: 'Split Letter Entrance', desc: 'Initials slide in smoothly from sides', isPro: true },
    { id: 'bounce', name: 'Floating Elegance', desc: 'Gentle vertical floating wave motion', isPro: true },
];

export function MonogramMark({
    initials,
    brideName,
    groomName,
    shape = 'minimal',
    animation = 'none',
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
    const normalizedAnim = animation || 'none';
    
    const softFill = colorWithAlpha(accent, inverted ? 0.13 : 0.08);
    const mediumFill = colorWithAlpha(accent, inverted ? 0.24 : 0.16);
    const line = colorWithAlpha(accent, inverted ? 0.72 : 0.58);
    const shadow = colorWithAlpha(accent, 0.18);
    const textStyle = { color: accent, fontFamily };

    // Animation Classes & Inline Keyframes
    let animWrapperClass = '';
    let animTextClass = '';
    let animFrameClass = '';

    if (normalizedAnim === 'pulse') {
        animWrapperClass = 'animate-mono-pulse';
    } else if (normalizedAnim === 'shimmer') {
        animWrapperClass = 'animate-mono-shimmer relative overflow-hidden';
    } else if (normalizedAnim === 'spin') {
        animFrameClass = 'animate-mono-spin';
    } else if (normalizedAnim === 'slide') {
        animTextClass = 'animate-mono-slide';
    } else if (normalizedAnim === 'bounce') {
        animWrapperClass = 'animate-mono-bounce';
    } else if (normalizedAnim === 'draw') {
        animWrapperClass = 'animate-mono-draw';
    }

    const text = (
        <span
            className={`${sizeSet.text} ${fontClassName} relative z-10 uppercase leading-none tracking-normal ${animTextClass}`}
            style={textStyle}
        >
            {mark}
        </span>
    );

    // CSS Keyframe styles for custom animations
    const animationKeyframes = (
        <style jsx global>{`
            @keyframes monoPulse {
                0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0px transparent); }
                50% { transform: scale(1.04); filter: drop-shadow(0 0 12px ${colorWithAlpha(accent, 0.45)}); }
            }
            @keyframes monoShimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
            @keyframes monoSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes monoSlide {
                0% { opacity: 0; transform: translateY(12px) scale(0.92); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes monoBounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-6px); }
            }
            @keyframes monoDraw {
                0% { opacity: 0.2; stroke-dashoffset: 100; filter: blur(2px); }
                100% { opacity: 1; stroke-dashoffset: 0; filter: blur(0); }
            }
            .animate-mono-pulse { animation: monoPulse 3.5s ease-in-out infinite; }
            .animate-mono-shimmer {
                background: linear-gradient(110deg, transparent 30%, ${colorWithAlpha(accent, 0.25)} 50%, transparent 70%);
                background-size: 200% 100%;
                animation: monoShimmer 3s infinite linear;
            }
            .animate-mono-spin { animation: monoSpin 24s linear infinite; }
            .animate-mono-slide { animation: monoSlide 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            .animate-mono-bounce { animation: monoBounce 4s ease-in-out infinite; }
            .animate-mono-draw { animation: monoDraw 1.2s ease-out forwards; }
        `}</style>
    );

    // Shape 1: Minimal
    if (normalizedShape === 'minimal') {
        return (
            <div className={`relative inline-flex flex-col items-center justify-center ${sizeSet.outer} ${animWrapperClass} ${className}`}>
                {animationKeyframes}
                <span className="absolute h-px w-3/4 -translate-y-8" style={{ background: `linear-gradient(90deg, transparent, ${line}, transparent)` }} />
                {text}
                <span className="absolute h-px w-3/4 translate-y-8" style={{ background: `linear-gradient(90deg, transparent, ${line}, transparent)` }} />
            </div>
        );
    }

    // Shape 2: Editorial
    if (normalizedShape === 'editorial') {
        return (
            <div className={`relative inline-flex min-h-20 min-w-32 flex-col items-center justify-center px-7 py-5 ${animWrapperClass} ${className}`}>
                {animationKeyframes}
                <span className={`${sizeSet.ornament} mb-2 font-black uppercase tracking-[0.34em]`} style={{ color: accent }}>The</span>
                {text}
                <span className="mt-3 h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${line}, transparent)` }} />
            </div>
        );
    }

    // Shape 3: Botanical Laurel
    if (normalizedShape === 'laurel') {
        return (
            <div className={`relative inline-flex ${sizeSet.outer} items-center justify-center rounded-full ${animWrapperClass} ${className}`} style={{ backgroundColor: softFill }}>
                {animationKeyframes}
                <span className={`absolute left-2 top-1/2 -translate-y-1/2 text-4xl leading-none opacity-80 ${animFrameClass}`} style={{ color: accent }}>(</span>
                <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-4xl leading-none opacity-80 ${animFrameClass}`} style={{ color: accent }}>)</span>
                <span className={`absolute inset-3 rounded-full border ${animFrameClass}`} style={{ borderColor: line }} />
                {text}
            </div>
        );
    }

    // Shape 4: Wax Stamp Seal (Pro)
    if (normalizedShape === 'wax-seal') {
        return (
            <div
                className={`relative inline-flex ${sizeSet.outer} items-center justify-center rounded-full border-4 shadow-2xl backdrop-blur-md ${animWrapperClass} ${className}`}
                style={{
                    borderColor: line,
                    backgroundColor: mediumFill,
                    boxShadow: `inset 0 2px 8px ${colorWithAlpha(accent, 0.4)}, 0 12px 30px ${shadow}`,
                }}
            >
                {animationKeyframes}
                <div className={`absolute inset-1.5 rounded-full border-2 border-dashed ${animFrameClass}`} style={{ borderColor: colorWithAlpha(accent, 0.5) }} />
                <div className="absolute inset-3 rounded-full border border-white/40 bg-white/20" />
                {text}
            </div>
        );
    }

    // Shape 5: Luxury Gold Foil (Pro)
    if (normalizedShape === 'gold-foil') {
        return (
            <div
                className={`relative inline-flex ${sizeSet.outer} items-center justify-center rounded-2xl border-2 shadow-2xl p-1 ${animWrapperClass} ${className}`}
                style={{
                    borderImage: `linear-gradient(135deg, ${accent}, #FFE599, ${accent}, #B8860B) 1`,
                    background: `linear-gradient(135deg, ${colorWithAlpha(accent, 0.15)}, rgba(255,255,255,0.95), ${colorWithAlpha(accent, 0.12)})`,
                    boxShadow: `0 14px 35px ${colorWithAlpha('#D4AF37', 0.25)}`,
                }}
            >
                {animationKeyframes}
                <div className={`absolute inset-2 rounded-xl border ${animFrameClass}`} style={{ borderColor: line }} />
                <span className={`${sizeSet.text} ${fontClassName} relative z-10 uppercase leading-none tracking-normal ${animTextClass}`} style={{
                    background: `linear-gradient(135deg, ${accent}, #D4AF37, ${accent})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily,
                }}>
                    {mark}
                </span>
            </div>
        );
    }

    // Shape 6: Royal Crown Crest (Pro)
    if (normalizedShape === 'royal-crown') {
        return (
            <div
                className={`relative inline-flex ${sizeSet.outer} items-center justify-center rounded-t-3xl rounded-b-xl border bg-white/80 shadow-xl backdrop-blur-sm ${animWrapperClass} ${className}`}
                style={{
                    borderColor: line,
                    background: `linear-gradient(180deg, ${softFill}, rgba(255,255,255,0.92))`,
                    boxShadow: `0 16px 40px ${shadow}`,
                }}
            >
                {animationKeyframes}
                {/* Crown ornament */}
                <div className="absolute -top-3 flex items-center justify-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
                    <span className="h-3.5 w-3.5 rounded-full border" style={{ backgroundColor: accent, borderColor: line }} />
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
                </div>
                <span className={`absolute inset-2 rounded-t-2xl rounded-b-lg border ${animFrameClass}`} style={{ borderColor: colorWithAlpha(accent, 0.35) }} />
                <span className="absolute bottom-2 h-px w-2/3" style={{ backgroundColor: line }} />
                {text}
            </div>
        );
    }

    // Shape 7: Art Deco Frame (Pro)
    if (normalizedShape === 'art-deco') {
        return (
            <div
                className={`relative inline-flex ${sizeSet.outer} items-center justify-center border-2 bg-white/90 shadow-2xl ${animWrapperClass} ${className}`}
                style={{
                    borderColor: accent,
                    boxShadow: `0 14px 35px ${shadow}`,
                }}
            >
                {animationKeyframes}
                {/* Stepped corner accents */}
                <div className="absolute top-1 left-1 h-3 w-3 border-t-2 border-l-2" style={{ borderColor: accent }} />
                <div className="absolute top-1 right-1 h-3 w-3 border-t-2 border-r-2" style={{ borderColor: accent }} />
                <div className="absolute bottom-1 left-1 h-3 w-3 border-b-2 border-l-2" style={{ borderColor: accent }} />
                <div className="absolute bottom-1 right-1 h-3 w-3 border-b-2 border-r-2" style={{ borderColor: accent }} />
                <div className={`absolute inset-2 border ${animFrameClass}`} style={{ borderColor: line }} />
                {text}
            </div>
        );
    }

    // Shape 8: Romantic Heart (Pro)
    if (normalizedShape === 'romantic-heart') {
        return (
            <div
                className={`relative inline-flex ${sizeSet.outer} items-center justify-center rounded-[40%] rotate-45 border bg-rose-50/80 shadow-xl backdrop-blur-sm ${animWrapperClass} ${className}`}
                style={{
                    borderColor: line,
                    boxShadow: `0 16px 36px ${shadow}`,
                    background: `linear-gradient(135deg, rgba(255,245,245,0.95), ${softFill})`,
                }}
            >
                {animationKeyframes}
                <span className={`absolute inset-2 rounded-[36%] border ${animFrameClass}`} style={{ borderColor: colorWithAlpha(accent, 0.3) }} />
                <span className="-rotate-45">{text}</span>
            </div>
        );
    }

    // Shape 9: Vintage Floral Wreath (Pro)
    if (normalizedShape === 'vintage-wreath') {
        return (
            <div className={`relative inline-flex ${sizeSet.outer} items-center justify-center rounded-full border-2 border-double ${animWrapperClass} ${className}`} style={{ borderColor: line, backgroundColor: softFill }}>
                {animationKeyframes}
                <svg className={`absolute inset-0 h-full w-full opacity-60 ${animFrameClass}`} viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="44" stroke={accent} strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx="50" cy="50" r="38" stroke={accent} strokeWidth="0.8" />
                    <path d="M50 6 C52 10 52 14 50 18 C48 14 48 10 50 6 Z" fill={accent} />
                    <path d="M50 82 C52 86 52 90 50 94 C48 90 48 86 50 82 Z" fill={accent} />
                    <path d="M6 50 C10 52 14 52 18 50 C14 48 10 48 6 50 Z" fill={accent} />
                    <path d="M82 50 C86 52 90 52 94 50 C90 48 86 48 82 50 Z" fill={accent} />
                </svg>
                {text}
            </div>
        );
    }

    // Default Shapes (Circle, Square, Double Ring, Oval, Diamond, Crest)
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
            className={`relative inline-flex ${sizeSet.outer} items-center justify-center border bg-white/70 shadow-xl backdrop-blur-sm ${shapeClass} ${animWrapperClass} ${className}`}
            style={{
                borderColor: line,
                color: accent,
                background: normalizedShape === 'crest'
                    ? `linear-gradient(180deg, ${mediumFill}, rgba(255,255,255,0.78))`
                    : `linear-gradient(145deg, rgba(255,255,255,0.88), ${softFill})`,
                boxShadow: `0 18px 45px ${shadow}`,
            }}
        >
            {animationKeyframes}
            <span className={`absolute inset-2 border ${shapeClass} ${animFrameClass}`} style={{ borderColor: colorWithAlpha(accent, 0.35) }} />
            {normalizedShape === 'double-ring' && (
                <span className={`absolute inset-4 rounded-full border ${animFrameClass}`} style={{ borderColor: colorWithAlpha(accent, 0.38) }} />
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
