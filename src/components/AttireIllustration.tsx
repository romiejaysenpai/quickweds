'use client';

import { useId } from 'react';

export type AttireIllustrationVariant = 'builder' | 'sponsors' | 'guests';

type AttireIllustrationProps = {
    color?: string;
    variant?: AttireIllustrationVariant;
    className?: string;
};

function normalizeColor(color?: string) {
    const value = color?.trim().replace('#', '') || '';
    return /^[0-9a-fA-F]{6}$/.test(value) ? `#${value}` : '#D16C78';
}

function mixColor(hex: string, target: '#ffffff' | '#242129', amount: number) {
    const normalized = hex.replace('#', '');
    const base = {
        r: parseInt(normalized.slice(0, 2), 16),
        g: parseInt(normalized.slice(2, 4), 16),
        b: parseInt(normalized.slice(4, 6), 16),
    };
    const to = target === '#ffffff' ? { r: 255, g: 255, b: 255 } : { r: 36, g: 33, b: 41 };
    const blend = (from: number, destination: number) => Math.round(from + (destination - from) * amount);
    return `rgb(${blend(base.r, to.r)}, ${blend(base.g, to.g)}, ${blend(base.b, to.b)})`;
}

/**
 * A formal, color-responsive adult couple shared by the builder and wedding page.
 * React's useId keeps all SVG paint definitions isolated when cards render together.
 */
export default function AttireIllustration({
    color = '#D16C78',
    variant = 'guests',
    className = '',
}: AttireIllustrationProps) {
    const rawId = useId();
    const illustrationId = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
    const dressGradientId = `formal-dress-${illustrationId}`;
    const dressSheenId = `formal-dress-sheen-${illustrationId}`;
    const suitGradientId = `formal-suit-${illustrationId}`;
    const womanSkinGradientId = `formal-woman-skin-${illustrationId}`;
    const manSkinGradientId = `formal-man-skin-${illustrationId}`;
    const groundGradientId = `formal-ground-${illustrationId}`;

    const accent = normalizeColor(color);
    const isSponsor = variant === 'sponsors';
    const dressLight = mixColor(accent, '#ffffff', 0.22);
    const dressDark = mixColor(accent, '#242129', isSponsor ? 0.24 : 0.16);
    const paleAccent = mixColor(accent, '#ffffff', 0.68);
    const suit = isSponsor ? '#1D2330' : '#2D3543';
    const suitDark = isSponsor ? '#141923' : '#202733';
    const womanSkin = isSponsor ? '#9D624B' : '#D29A79';
    const womanSkinLight = isSponsor ? '#BA7D62' : '#E3AE8B';
    const womanHair = isSponsor ? '#272127' : '#56372F';
    const manSkin = isSponsor ? '#B77758' : '#714533';
    const manSkinLight = isSponsor ? '#CC906E' : '#8D5A43';
    const manHair = isSponsor ? '#454047' : '#1F2427';

    return (
        <svg
            viewBox="0 0 420 338"
            fill="none"
            className={`mx-auto block h-auto w-full ${className}`}
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id={dressGradientId} x1="112" y1="105" x2="190" y2="283" gradientUnits="userSpaceOnUse">
                    <stop stopColor={dressLight} />
                    <stop offset="0.42" stopColor={accent} />
                    <stop offset="1" stopColor={dressDark} />
                </linearGradient>
                <linearGradient id={dressSheenId} x1="143" y1="122" x2="177" y2="275" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFFFFF" stopOpacity="0.46" />
                    <stop offset="0.48" stopColor="#FFFFFF" stopOpacity="0.1" />
                    <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
                <linearGradient id={suitGradientId} x1="236" y1="103" x2="319" y2="230" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFFFFF" stopOpacity="0.13" />
                    <stop offset="0.55" stopColor="#FFFFFF" stopOpacity="0.02" />
                    <stop offset="1" stopColor="#000000" stopOpacity="0.18" />
                </linearGradient>
                <linearGradient id={womanSkinGradientId} x1="140" y1="38" x2="165" y2="92" gradientUnits="userSpaceOnUse">
                    <stop stopColor={womanSkinLight} />
                    <stop offset="1" stopColor={womanSkin} />
                </linearGradient>
                <linearGradient id={manSkinGradientId} x1="266" y1="37" x2="290" y2="93" gradientUnits="userSpaceOnUse">
                    <stop stopColor={manSkinLight} />
                    <stop offset="1" stopColor={manSkin} />
                </linearGradient>
                <radialGradient id={groundGradientId} cx="0" cy="0" r="1" gradientTransform="translate(211 316) rotate(90) scale(15 142)" gradientUnits="userSpaceOnUse">
                    <stop stopColor={accent} stopOpacity="0.25" />
                    <stop offset="1" stopColor={accent} stopOpacity="0" />
                </radialGradient>
            </defs>

            <ellipse cx="211" cy="316" rx="142" ry="15" fill={`url(#${groundGradientId})`} />
            <path d="M87 313c62 13 187 13 249 0" stroke={accent} strokeOpacity="0.16" strokeWidth="2" strokeLinecap="round" />
            <circle cx="79" cy="100" r="4" fill={accent} fillOpacity="0.22" />
            <circle cx="345" cy="82" r="4" fill={accent} fillOpacity="0.2" />
            <path d="m70 132 6 6 9-11M342 142l6 6 9-11" stroke={accent} strokeOpacity="0.28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Woman in a full-length formal evening gown. */}
            <g transform="translate(27.18 7) scale(0.82 1.08)">
                <path d="M134 104c-12 7-20 23-22 42l-10 132c27 10 69 10 98 0l-11-132c-2-20-10-35-23-42-8 7-24 7-32 0Z" fill={`url(#${dressGradientId})`} />
                <path d="M134 104c-12 7-20 23-22 42l-10 132c27 10 69 10 98 0l-11-132c-2-20-10-35-23-42-8 7-24 7-32 0Z" fill={`url(#${dressSheenId})`} />
                <path d="M130 105c5 22 12 33 21 38 9-5 16-16 20-38-11 7-29 7-41 0Z" fill={paleAccent} />
                <path d="M136 105c4 13 9 22 15 28 7-6 12-15 16-28-10 6-21 6-31 0Z" fill="#FFFDFC" fillOpacity="0.74" />
                <path d="M116 158c20 8 49 8 70 0" stroke="#FFFFFF" strokeOpacity="0.28" strokeWidth="2" strokeLinecap="round" />
                <path d="M128 164c7 7 14 9 21 10M176 164c-7 7-14 9-21 10" stroke="#FFFFFF" strokeOpacity="0.17" strokeWidth="2" strokeLinecap="round" />
                <path d="M130 172c-3 31-5 66-6 101M151 174v104M174 172c4 32 6 67 7 101" stroke="#FFFFFF" strokeOpacity="0.15" strokeWidth="2" strokeLinecap="round" />

                <path d="M119 126c-8 8-13 26-15 45l-3 38" stroke={`url(#${womanSkinGradientId})`} strokeWidth="11" strokeLinecap="round" />
                <path d="M183 126c7 9 10 23 10 38v26" stroke={`url(#${womanSkinGradientId})`} strokeWidth="11" strokeLinecap="round" />
                <path d="M193 190c-2 9-7 17-14 23" stroke={`url(#${womanSkinGradientId})`} strokeWidth="10" strokeLinecap="round" />
                <ellipse cx="100" cy="211" rx="6" ry="10" transform="rotate(8 100 211)" fill={womanSkin} />
                <ellipse cx="177" cy="216" rx="6" ry="10" transform="rotate(38 177 216)" fill={womanSkin} />
                <path d="M96 211c-2 4-3 8-2 12M100 211c0 5 0 9 2 13M176 215c2 4 5 7 8 9" stroke="#AF6D52" strokeWidth="1.3" strokeLinecap="round" />
                <rect x="171" y="199" width="27" height="19" rx="5" fill={dressDark} />
                <path d="M175 204h19" stroke="#FFFFFF" strokeOpacity="0.36" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="102" cy="200" r="3" stroke={paleAccent} strokeWidth="2" />

                <g transform="translate(0 17.12) scale(1 0.84)">
                <rect x="143" y="84" width="16" height="25" rx="7" fill={`url(#${womanSkinGradientId})`} />
                <ellipse cx="151" cy="61" rx="19" ry="25" fill={`url(#${womanSkinGradientId})`} />
                <ellipse cx="132" cy="63" rx="3.5" ry="5" fill={womanSkin} />
                <ellipse cx="170" cy="63" rx="3.5" ry="5" fill={womanSkin} />
                {isSponsor ? (
                    <>
                        <circle cx="151" cy="31" r="10" fill={womanHair} />
                        <path d="M132 61c-1-22 13-34 29-30 14 4 20 18 13 37-5-9-12-14-21-16-8-2-15 1-21 9Z" fill={womanHair} />
                        <path d="M133 59c-5 11-3 24 4 32 0-9 3-16 9-22-6-2-10-5-13-10Z" fill={womanHair} />
                    </>
                ) : (
                    <>
                        <path d="M132 61c-1-23 13-35 29-30 14 5 20 20 12 40-3-11-10-17-20-19-8-2-15 1-21 9Z" fill={womanHair} />
                        <path d="M133 59c-7 14-4 32 7 40-2-11 1-20 7-27-7-2-11-6-14-13ZM170 56c10 12 8 31 1 43 0-11-3-20-8-27 5-4 7-9 7-16Z" fill={womanHair} />
                    </>
                )}
                <path d="M139 56c3-2 7-2 10 0M155 56c3-2 7-2 10 0" stroke="#563833" strokeWidth="1.8" strokeLinecap="round" />
                <ellipse cx="144" cy="61" rx="2" ry="1.6" fill="#382A29" />
                <ellipse cx="160" cy="61" rx="2" ry="1.6" fill="#382A29" />
                <circle cx="144.5" cy="60.5" r="0.6" fill="#FFFFFF" />
                <circle cx="160.5" cy="60.5" r="0.6" fill="#FFFFFF" />
                <path d="M151 62c-1 4-1 7 1 9" stroke="#B77057" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M146 77c4 3 8 3 12 0" stroke="#9F4B55" strokeWidth="2" strokeLinecap="round" />
                <path d="M138 68c2 1 4 1 6 0M160 68c2 1 4 1 6 0" stroke="#D58A72" strokeWidth="1.3" strokeLinecap="round" />
                <circle cx="132" cy="75" r="2.4" fill={paleAccent} />
                <circle cx="170" cy="75" r="2.4" fill={paleAccent} />
                <path d="M144 96c5 4 10 4 15 0" stroke={paleAccent} strokeWidth="1.8" strokeLinecap="round" />
                </g>
            </g>

            {/* Man in a dark formal suit or tuxedo with coordinated accents. */}
            <g transform="translate(49.86 3) scale(0.82 1.08)">
                <path d="M250 105c-13 8-21 25-22 47l-2 72h102l-3-72c-1-22-9-39-22-47-12 8-40 8-53 0Z" fill={suit} />
                <path d="M250 105c-13 8-21 25-22 47l-2 72h102l-3-72c-1-22-9-39-22-47-12 8-40 8-53 0Z" fill={`url(#${suitGradientId})`} />
                <path d="M260 106c7 10 13 18 17 28 5-10 10-18 17-28-10 5-24 5-34 0Z" fill="#FFFDFC" />
                <path d="m251 106 26 28-22 18-17-25 13-21ZM303 106l-26 28 22 18 17-25-13-21Z" fill="#FFFFFF" fillOpacity="0.11" />
                {isSponsor ? (
                    <>
                        <path d="m266 127 11 7-9 9-10-8 8-8ZM288 127l-11 7 9 9 10-8-8-8Z" fill={accent} />
                        <circle cx="277" cy="134" r="3.5" fill={dressDark} />
                    </>
                ) : (
                    <path d="m274 128 3 6-4 34h8l-4-34 4-6-4-6Z" fill={accent} />
                )}
                <path d="M296 150h15l-3 8h-12Z" fill={paleAccent} />
                <path d="M277 151v60" stroke="#FFFFFF" strokeOpacity="0.1" strokeWidth="1.5" />
                <circle cx="277" cy="173" r="2.2" fill="#D6D7DC" />
                <circle cx="277" cy="190" r="2.2" fill="#D6D7DC" />

                <path d="M239 131c-8 12-11 29-12 48l-1 27" stroke={suit} strokeWidth="17" strokeLinecap="round" />
                <path d="M314 131c9 12 13 29 14 48l2 24" stroke={suit} strokeWidth="17" strokeLinecap="round" />
                <ellipse cx="226" cy="210" rx="6" ry="10" transform="rotate(6 226 210)" fill={manSkin} />
                <ellipse cx="330" cy="207" rx="6" ry="10" transform="rotate(-8 330 207)" fill={manSkin} />
                <path d="M222 210c-1 5 0 9 1 13M226 210c0 5 1 9 3 13M330 207c0 5-1 9-3 13" stroke="#A8644B" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M229 195h13M313 193h14" stroke="#FFFDFC" strokeOpacity="0.78" strokeWidth="3" strokeLinecap="round" />

                <path d="M237 217h39l-2 62h-43l6-62ZM279 217h39l6 62h-43l-2-62Z" fill={suitDark} />
                <path d="M277 222v56" stroke="#FFFFFF" strokeOpacity="0.09" strokeWidth="2" />
                <path d="M229 279h47l-2 9h-48c-1-4 0-7 3-9ZM281 279h43c4 2 6 5 6 9h-48l-1-9Z" fill="#151820" />
                <path d="M232 282h39M286 282h37" stroke="#FFFFFF" strokeOpacity="0.16" strokeWidth="1.5" strokeLinecap="round" />

                <g transform="translate(0 17.44) scale(1 0.84)">
                <rect x="269" y="83" width="16" height="26" rx="7" fill={manSkin} />
                <ellipse cx="277" cy="60" rx="20" ry="26" fill={`url(#${manSkinGradientId})`} />
                <ellipse cx="257" cy="63" rx="3.5" ry="5" fill={manSkin} />
                <ellipse cx="297" cy="63" rx="3.5" ry="5" fill={manSkin} />
                {isSponsor ? (
                    <>
                        <path d="M257 58c2-22 16-34 32-29 15 5 21 19 13 39-3-10-10-16-20-19-9-2-17 1-25 9Z" fill={manHair} />
                        <path d="M260 47c7-14 27-18 38-5-8 1-13 4-18 9-7-4-14-5-20-4Z" fill={manHair} />
                        <path d="M263 42c7-5 17-7 25-3" stroke="#918A91" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
                    </>
                ) : (
                    <>
                        <path d="M257 59c0-21 14-34 31-31 16 3 24 17 17 38-5-9-13-14-23-15-9-1-17 2-25 8Z" fill={manHair} />
                        <circle cx="263" cy="39" r="7" fill={manHair} />
                        <circle cx="273" cy="34" r="8" fill={manHair} />
                        <circle cx="284" cy="34" r="8" fill={manHair} />
                        <circle cx="295" cy="40" r="7" fill={manHair} />
                    </>
                )}
                <path d="M265 55c3-2 7-2 10 0M282 55c3-2 7-2 10 0" stroke="#3A2A2B" strokeWidth="1.8" strokeLinecap="round" />
                <ellipse cx="270" cy="60" rx="2" ry="1.6" fill="#302526" />
                <ellipse cx="287" cy="60" rx="2" ry="1.6" fill="#302526" />
                <circle cx="270.5" cy="59.5" r="0.6" fill="#FFFFFF" />
                <circle cx="287.5" cy="59.5" r="0.6" fill="#FFFFFF" />
                <path d="M278 61c-1 4-1 7 1 9" stroke="#A4614A" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M273 76c4 3 8 3 12 0" stroke="#824344" strokeWidth="2" strokeLinecap="round" />
                <path d="M264 68c2 1 4 1 6 0M287 68c2 1 4 1 6 0" stroke="#C27B62" strokeWidth="1.3" strokeLinecap="round" />
                </g>
            </g>
        </svg>
    );
}
