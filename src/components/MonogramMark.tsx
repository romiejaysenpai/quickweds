'use client';

import { forwardRef, useId } from 'react';
import { type MonogramAnimation, type MonogramShape } from '@/lib/monogram';

type MonogramMarkProps = {
    initials?: string | null;
    brideName?: string | null;
    groomName?: string | null;
    shape?: MonogramShape | string | null;
    color?: string | null;
    motifColor?: string | null;
    fontClassName?: string;
    fontFamily?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    inverted?: boolean;
    animation?: MonogramAnimation | string | null;
};

const dimensions = { sm: 64, md: 96, lg: 128 };

export const MONOGRAM_SHAPES = [
    { id: 'minimal', name: 'Minimal', desc: 'Clean initials only', pro: false },
    { id: 'circle', name: 'Classic Circle', desc: 'Soft ring frame', pro: false },
    { id: 'square', name: 'Rounded Seal', desc: 'Modern rounded frame', pro: false },
    { id: 'double-ring', name: 'Double Ring', desc: 'Layered wedding seal', pro: false },
    { id: 'oval', name: 'Oval Cameo', desc: 'Heirloom portrait frame', pro: false },
    { id: 'diamond', name: 'Diamond', desc: 'Editorial geometric mark', pro: false },
    { id: 'crest', name: 'Heritage Crest', desc: 'Formal luxury crest', pro: false },
    { id: 'laurel', name: 'Laurel', desc: 'Botanical ceremony mark', pro: false },
    { id: 'editorial', name: 'Editorial', desc: 'Magazine masthead style', pro: false },
    { id: 'intertwined', name: 'Intertwined', desc: 'Layered letterform', pro: true },
    { id: 'wax-seal', name: 'Wax Seal', desc: 'Textured ceremony seal', pro: true },
    { id: 'arched', name: 'Arched', desc: 'Modern ceremony arch', pro: true },
    { id: 'botanical-frame', name: 'Botanical Frame', desc: 'Fine floral surround', pro: true },
    { id: 'ribbon', name: 'Ribbon', desc: 'Flowing formal banner', pro: true },
    { id: 'monoline', name: 'Monoline', desc: 'Single-line luxury mark', pro: true },
] as const;

export const MONOGRAM_ANIMATIONS = [
    { id: 'none', name: 'Still', desc: 'No motion' },
    { id: 'draw', name: 'Draw', desc: 'Lines arrive gracefully' },
    { id: 'bloom', name: 'Bloom', desc: 'A soft ceremonial reveal' },
    { id: 'shimmer', name: 'Shimmer', desc: 'A subtle light pass' },
    { id: 'float', name: 'Float', desc: 'A gentle lift' },
    { id: 'reveal', name: 'Reveal', desc: 'A refined entrance' },
] as const;

function initialsFor(initials?: string | null, brideName?: string | null, groomName?: string | null) {
    if (initials?.trim()) return initials.trim().slice(0, 8);
    return `${brideName?.trim()?.[0] || 'A'} & ${groomName?.trim()?.[0] || 'B'}`;
}

function withAlpha(hex: string, alpha: string) {
    return /^#[0-9a-f]{6}$/i.test(hex) ? `${hex}${alpha}` : hex;
}

export const MonogramMark = forwardRef<SVGSVGElement, MonogramMarkProps>(function MonogramMark({
    initials, brideName, groomName, shape = 'minimal', color, motifColor, fontClassName = 'font-serif',
    fontFamily, size = 'md', className = '', inverted = false, animation = 'none',
}, ref) {
    const reactId = useId().replace(/:/g, '');
    const accent = color || motifColor || '#C08081';
    const mark = initialsFor(initials, brideName, groomName);
    const safeShape = MONOGRAM_SHAPES.some((item) => item.id === shape) ? shape : 'minimal';
    const safeAnimation = MONOGRAM_ANIMATIONS.some((item) => item.id === animation) ? animation : 'none';
    const line = withAlpha(accent, inverted ? 'D9' : 'A8');
    const soft = withAlpha(accent, inverted ? '38' : '16');
    const strong = withAlpha(accent, inverted ? '70' : '28');
    const width = dimensions[size];
    const textStyle = { fontFamily: fontFamily || 'Georgia, serif' };
    const baseText = <text x="120" y="132" textAnchor="middle" className={fontClassName} style={textStyle} fill={accent} fontSize="38" letterSpacing="-1">{mark}</text>;
    const leaf = (x: number, y: number, rotate: number, key: string) => <ellipse key={key} cx={x} cy={y} rx="4" ry="10" transform={`rotate(${rotate} ${x} ${y})`} fill="none" stroke={line} strokeWidth="1.4" />;

    let artwork: React.ReactNode;
    switch (safeShape) {
        case 'circle': artwork = <><circle cx="120" cy="120" r="88" fill={soft} stroke={line} strokeWidth="2" /><circle cx="120" cy="120" r="78" fill="none" stroke={strong} strokeWidth="1" />{baseText}</>; break;
        case 'square': artwork = <><rect x="31" y="31" width="178" height="178" rx="38" fill={soft} stroke={line} strokeWidth="2" /><rect x="42" y="42" width="156" height="156" rx="30" fill="none" stroke={strong} />{baseText}</>; break;
        case 'double-ring': artwork = <><circle cx="120" cy="120" r="91" fill="none" stroke={line} strokeWidth="2" /><circle cx="120" cy="120" r="78" fill={soft} stroke={line} strokeWidth="1.4" />{baseText}<circle cx="120" cy="34" r="2" fill={accent} /><circle cx="120" cy="206" r="2" fill={accent} /></>; break;
        case 'oval': artwork = <><ellipse cx="120" cy="120" rx="77" ry="91" fill={soft} stroke={line} strokeWidth="2" /><ellipse cx="120" cy="120" rx="68" ry="82" fill="none" stroke={strong} />{baseText}</>; break;
        case 'diamond': artwork = <><rect x="54" y="54" width="132" height="132" rx="18" transform="rotate(45 120 120)" fill={soft} stroke={line} strokeWidth="2" />{baseText}</>; break;
        case 'crest': artwork = <><path d="M56 52h128v75c0 46-31 70-64 82-33-12-64-36-64-82V52Z" fill={soft} stroke={line} strokeWidth="2" /><path d="M78 70h84" stroke={strong} /><path d="M120 39l8 14h-16l8-14Z" fill={accent} />{baseText}</>; break;
        case 'laurel': artwork = <><circle cx="120" cy="120" r="68" fill={soft} stroke={strong} /><path d="M78 172c-30-24-35-66-17-96M162 172c30-24 35-66 17-96" fill="none" stroke={line} strokeWidth="2" />{[...Array(5)].flatMap((_, i) => [leaf(72 + i * 2, 151 - i * 17, -48 + i * 8, `l${i}`), leaf(168 - i * 2, 151 - i * 17, 48 - i * 8, `r${i}`)])}{baseText}</>; break;
        case 'editorial': artwork = <><path d="M36 72h168M36 170h168" stroke={line} strokeWidth="1.5" /><text x="120" y="55" textAnchor="middle" fill={accent} fontSize="10" letterSpacing="5">THE</text>{baseText}<text x="120" y="191" textAnchor="middle" fill={accent} fontSize="9" letterSpacing="3">WEDDING EDITION</text></>; break;
        case 'intertwined': artwork = <><circle cx="120" cy="120" r="83" fill={soft} stroke={strong} /><text x="106" y="139" textAnchor="middle" style={textStyle} fill={accent} fontSize="74" fontStyle="italic">{mark[0] || 'A'}</text><text x="142" y="139" textAnchor="middle" style={textStyle} fill={accent} fontSize="74" fontStyle="italic">{mark.replace(/[^A-Za-z]/g, '')[1] || 'B'}</text><path d="M72 168h96" stroke={line} /></>; break;
        case 'wax-seal': artwork = <><path d="M120 26 134 34l16-3 11 12 16 3 5 16 13 10-2 16 8 14-8 14 2 16-13 10-5 16-16 3-11 12-16-3-14 8-14-8-16 3-11-12-16-3-5-16-13-10 2-16-8-14 8-14-2-16 13-10 5-16 16-3 11-12 16 3 14-8Z" fill={soft} stroke={line} strokeWidth="2" />{baseText}<circle cx="120" cy="120" r="64" fill="none" stroke={strong} /></>; break;
        case 'arched': artwork = <><path d="M47 202V113a73 73 0 0 1 146 0v89" fill={soft} stroke={line} strokeWidth="2" /><path d="M62 202V113a58 58 0 0 1 116 0v89" fill="none" stroke={strong} />{baseText}<path d="M85 169h70" stroke={line} /></>; break;
        case 'botanical-frame': artwork = <><rect x="43" y="43" width="154" height="154" rx="77" fill={soft} stroke={strong} />{[...Array(6)].flatMap((_, i) => [leaf(60 + i * 9, 157 - i * 18, -50 + i * 8, `bl${i}`), leaf(180 - i * 9, 157 - i * 18, 50 - i * 8, `br${i}`)])}{baseText}</>; break;
        case 'ribbon': artwork = <><path d="M37 86h166l-20 34 20 34H37l20-34-20-34Z" fill={soft} stroke={line} strokeWidth="2" /><path d="M57 120h126" stroke={strong} />{baseText}</>; break;
        case 'monoline': artwork = <><path d="M55 74c28-35 102-35 130 0M55 166c28 35 102 35 130 0" fill="none" stroke={line} strokeWidth="2" strokeLinecap="round" />{baseText}<circle cx="120" cy="55" r="3" fill={accent} /><circle cx="120" cy="185" r="3" fill={accent} /></>; break;
        default: artwork = <><path d="M50 83h140M50 157h140" stroke={line} strokeWidth="1.5" />{baseText}</>;
    }

    return <svg ref={ref} role="img" aria-label={`${mark} wedding monogram`} viewBox="0 0 240 240" width={width} height={width} className={`inline-block shrink-0 overflow-visible ${className}`} xmlns="http://www.w3.org/2000/svg">
        <style>{`@keyframes mg-draw-${reactId}{0%{opacity:0;stroke-dashoffset:400}100%{opacity:1;stroke-dashoffset:0}}@keyframes mg-bloom-${reactId}{0%{opacity:0;transform:scale(.72)}100%{opacity:1;transform:scale(1)}}@keyframes mg-shimmer-${reactId}{0%{opacity:.45;filter:brightness(1)}55%{opacity:1;filter:brightness(1.45)}100%{opacity:1;filter:brightness(1)}}@keyframes mg-float-${reactId}{0%{transform:translateY(8px)}60%{transform:translateY(-4px)}100%{transform:translateY(0)}}@keyframes mg-reveal-${reactId}{0%{opacity:0;transform:translateY(18px)}100%{opacity:1;transform:translateY(0)}}.mg-${reactId}{transform-box:fill-box;transform-origin:center}.mg-${reactId}.draw{stroke-dasharray:400;animation:mg-draw-${reactId} 1.35s ease-out both}.mg-${reactId}.bloom{animation:mg-bloom-${reactId} 1.1s cubic-bezier(.2,.8,.2,1) both}.mg-${reactId}.shimmer{animation:mg-shimmer-${reactId} 1.35s ease-out both}.mg-${reactId}.float{animation:mg-float-${reactId} 1.8s ease-out both}.mg-${reactId}.reveal{animation:mg-reveal-${reactId} .95s cubic-bezier(.2,.8,.2,1) both}@media (prefers-reduced-motion:reduce){.mg-${reactId}{animation:none!important}}`}</style>
        <g className={`mg-${reactId} ${safeAnimation}`}>{artwork}</g>
    </svg>;
});
