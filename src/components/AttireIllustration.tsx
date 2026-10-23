'use client';

import { useId } from 'react';

export type AttireIllustrationVariant = 'builder' | 'sponsors' | 'guests' | 'bridesmaids';

type AttireIllustrationProps = {
    color?: string;
    suitColor?: string;
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
 * High-definition, color-responsive wedding attire illustrations.
 * Supports Principal Sponsors, Wedding Guests, and dedicated Bridesmaids with elegant faces and couture-tailored silhouettes.
 */
export default function AttireIllustration({
    color = '#D16C78',
    suitColor,
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
    const bmSkinGradientId = `formal-bm-skin-${illustrationId}`;
    const bmDressGradientId = `formal-bm-dress-${illustrationId}`;
    const groundGradientId = `formal-ground-${illustrationId}`;

    const accent = normalizeColor(color);
    const isSponsor = variant === 'sponsors';
    const isBridesmaid = variant === 'bridesmaids';

    // Dress color shading
    const dressLight = mixColor(accent, '#ffffff', 0.28);
    const dressDark = mixColor(accent, '#242129', isSponsor ? 0.26 : 0.18);
    const paleAccent = mixColor(accent, '#ffffff', 0.72);
    const ultraPale = mixColor(accent, '#ffffff', 0.88);

    // Suit color shading
    const defaultSuitHex = isSponsor ? '#1D2330' : '#2D3543';
    const suit = suitColor ? normalizeColor(suitColor) : defaultSuitHex;
    const suitLight = mixColor(suit, '#ffffff', 0.14);
    const suitDark = suitColor ? mixColor(suit, '#242129', 0.45) : (isSponsor ? '#121620' : '#1D232E');

    // Complexion & hair tones
    const womanSkin = isSponsor ? '#D89F82' : '#E8B597';
    const womanSkinLight = isSponsor ? '#F0BAA0' : '#F7CEB6';
    const womanSkinShadow = isSponsor ? '#BC7F62' : '#CC8F71';
    const womanHair = isSponsor ? '#261F24' : '#452D26';
    const womanHairLight = isSponsor ? '#42373F' : '#68453B';

    const manSkin = isSponsor ? '#D19677' : '#DC9F7E';
    const manSkinLight = isSponsor ? '#E8AF91' : '#F1B999';
    const manHair = isSponsor ? '#38363B' : '#231F20';
    const manHairHighlight = isSponsor ? '#58535C' : '#3E383A';

    // Bridesmaid tones
    const bmSkin = '#F2C1A5';
    const bmSkinLight = '#FCE0CF';
    const bmSkinShadow = '#D89979';
    const bmHair = '#3C261E';
    const bmHairLight = '#603E32';

    if (isBridesmaid) {
        return (
            <svg
                viewBox="0 0 420 338"
                fill="none"
                className={`mx-auto block h-auto w-full ${className}`}
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <defs>
                    <linearGradient id={bmDressGradientId} x1="170" y1="100" x2="250" y2="295" gradientUnits="userSpaceOnUse">
                        <stop stopColor={dressLight} />
                        <stop offset="0.45" stopColor={accent} />
                        <stop offset="1" stopColor={dressDark} />
                    </linearGradient>
                    <linearGradient id={bmSkinGradientId} x1="200" y1="40" x2="220" y2="100" gradientUnits="userSpaceOnUse">
                        <stop stopColor={bmSkinLight} />
                        <stop offset="1" stopColor={bmSkin} />
                    </linearGradient>
                    <radialGradient id={groundGradientId} cx="0" cy="0" r="1" gradientTransform="translate(210 318) rotate(90) scale(15 130)" gradientUnits="userSpaceOnUse">
                        <stop stopColor={accent} stopOpacity="0.28" />
                        <stop offset="1" stopColor={accent} stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Ambient ground glow & petals */}
                <ellipse cx="210" cy="318" rx="120" ry="14" fill={`url(#${groundGradientId})`} />
                <path d="M120 316c45 10 135 10 180 0" stroke={accent} strokeOpacity="0.22" strokeWidth="2" strokeLinecap="round" />

                {/* Floating floral sparkle & petal accents */}
                <circle cx="130" cy="120" r="3" fill={accent} fillOpacity="0.3" />
                <circle cx="290" cy="95" r="3.5" fill={accent} fillOpacity="0.25" />
                <path d="M136 170c3 6 8 8 11 4s0-9-4-11-8 2-7 7Z" fill={accent} fillOpacity="0.22" />
                <path d="M280 185c-4 5-8 6-10 2s1-8 5-9 8 3 5 7Z" fill={accent} fillOpacity="0.2" />
                <path d="m118 142 4 4 6-8M298 135l4 4 6-8" stroke={accent} strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                {/* Beautiful Bridesmaid Character */}
                <g transform="translate(0 0)">
                    {/* Flowing A-line Evening Gown with Natural Curves */}
                    {/* Skirt Base */}
                    <path
                        d="M192 142c-12 18-22 45-28 78l-18 68c22 8 50 12 64 12s42-4 64-12l-18-68c-6-33-16-60-28-78-11 5-23 5-36 0Z"
                        fill={`url(#${bmDressGradientId})`}
                    />
                    {/* Skirt Draping & Dynamic Pleats */}
                    <path d="M182 170c-6 38-12 78-14 118" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" />
                    <path d="M202 165c-2 42-4 85-5 125" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M218 165c2 42 4 85 5 125" stroke="#000000" strokeOpacity="0.12" strokeWidth="2" strokeLinecap="round" />
                    <path d="M238 170c6 38 12 78 14 118" stroke="#000000" strokeOpacity="0.15" strokeWidth="2" strokeLinecap="round" />
                    <path d="M152 288c24 8 46 11 58 11s34-3 58-11" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />

                    {/* Fitted Bodice with Sweetheart Neckline */}
                    <path
                        d="M193 112c-8 3-13 10-14 19l4 22c7 4 17 6 27 6s20-2 27-6l4-22c-1-9-6-16-14-19-8 5-16 6-24 6s-16-1-24-6Z"
                        fill={`url(#${bmDressGradientId})`}
                    />
                    {/* Delicate Off-the-Shoulder Draped Straps */}
                    <path d="M178 123c-7 2-12 7-14 13 4 2 9 3 14 1" fill={accent} />
                    <path d="M242 123c7 2 12 7 14 13-4 2-9 3-14 1" fill={accent} />
                    {/* Satin Waist Ribbon / Bow Accent */}
                    <rect x="187" y="148" width="46" height="6" rx="3" fill={ultraPale} />
                    <circle cx="210" cy="151" r="3.5" fill={dressDark} />

                    {/* Delicate Décolletage, Neck, & Collarbones */}
                    <path d="M202 96h16l2 20c-6 3-14 3-20 0l2-20Z" fill={`url(#${bmSkinGradientId})`} />
                    <path d="M198 118c6 3 18 3 24 0" stroke={bmSkinShadow} strokeWidth="1.2" strokeLinecap="round" />
                    {/* Delicate Pearl Pendant Necklace */}
                    <path d="M200 106c5 6 15 6 20 0" stroke="#FFFDF8" strokeWidth="1.2" strokeLinecap="round" />
                    <circle cx="210" cy="111" r="2.2" fill="#FFFFFF" stroke={paleAccent} strokeWidth="0.8" />

                    {/* Graceful Arms holding the Bouquet */}
                    <path d="M172 130c-4 12-4 28 3 40 5 9 12 15 22 17" stroke={`url(#${bmSkinGradientId})`} strokeWidth="7" strokeLinecap="round" />
                    <path d="M248 130c4 12 4 28-3 40-5 9-12 15-22 17" stroke={`url(#${bmSkinGradientId})`} strokeWidth="7" strokeLinecap="round" />
                    {/* Pearl Wrist Corsage */}
                    <circle cx="186" cy="178" r="4" fill={ultraPale} />
                    <circle cx="186" cy="178" r="2" fill={accent} />

                    {/* Bridal Rose Bouquet in Hands */}
                    <g transform="translate(194 166)">
                        {/* Satin Ribbon Ties */}
                        <path d="M16 26c-2 10-6 20-10 26M19 26c3 10 7 20 11 26" stroke={ultraPale} strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M12 24h12l-2 6h-8z" fill={ultraPale} />
                        {/* Bouquet Greens */}
                        <path d="M4 14c-4-6-2-14 4-16s10 4 8 12" fill="#587860" />
                        <path d="M30 14c4-6 2-14-4-16s-10 4-8 12" fill="#587860" />
                        <path d="M10 2c3-4 10-4 14 0" fill="#6A8B73" />
                        {/* Roses in Harmonious Tones (Main Dress Color + Soft Creams) */}
                        <circle cx="16" cy="12" r="8" fill={accent} />
                        <path d="M13 10c2-2 5-2 7 0s1 4-1 6-5 0-6-3" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="8" cy="14" r="6.5" fill={dressLight} />
                        <path d="M6 13c2-2 4-1 5 1" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round" />
                        <circle cx="24" cy="14" r="6.5" fill={paleAccent} />
                        <path d="M21 13c2-2 4-1 5 1" stroke={accent} strokeWidth="1.2" strokeLinecap="round" />
                        <circle cx="16" cy="4" r="6" fill="#FFF8F4" />
                        <circle cx="16" cy="4" r="2.5" fill={accent} fillOpacity="0.6" />
                    </g>

                    {/* Beautiful Feminine Head & Face */}
                    <g transform="translate(0 0)">
                        {/* Head Contour & Ears */}
                        <ellipse cx="210" cy="74" rx="17" ry="21" fill={`url(#${bmSkinGradientId})`} />
                        <ellipse cx="193" cy="76" rx="2.5" ry="4" fill={bmSkin} />
                        <ellipse cx="227" cy="76" rx="2.5" ry="4" fill={bmSkin} />
                        {/* Pearl Drop Earrings */}
                        <circle cx="192.5" cy="82" r="2" fill="#FFFFFF" />
                        <circle cx="227.5" cy="82" r="2" fill="#FFFFFF" />

                        {/* Romantic Soft Wavy Updo with Highlights */}
                        <path
                            d="M192 73c-2-20 10-33 28-30 14 3 20 16 14 34-4-10-11-15-20-16-9-1-16 2-22 12Z"
                            fill={bmHair}
                        />
                        {/* Chignon Bun with Floral Accent */}
                        <circle cx="210" cy="45" r="10" fill={bmHair} />
                        <circle cx="210" cy="45" r="7" fill={bmHairLight} />
                        {/* Little Flower in Hair */}
                        <circle cx="218" cy="48" r="3.5" fill={ultraPale} />
                        <circle cx="218" cy="48" r="1.5" fill={accent} />
                        {/* Soft Tendrils Framing the Cheeks */}
                        <path d="M194 72c-2 8-1 16 4 20-3-4-4-12-2-18ZM226 72c2 8 1 16-4 20 3-4 4-12 2-18Z" fill={bmHair} />

                        {/* Refined Facial Features */}
                        {/* Soft Rosy Blush on Cheekbones */}
                        <ellipse cx="201" cy="79" rx="4.5" ry="2.5" fill="#FF8A8A" fillOpacity="0.32" />
                        <ellipse cx="219" cy="79" rx="4.5" ry="2.5" fill="#FF8A8A" fillOpacity="0.32" />

                        {/* Delicate Eyebrows */}
                        <path d="M199 68c3-2 6-1 8 0M213 68c3-1 6-2 8 0" stroke="#4A312A" strokeWidth="1.3" strokeLinecap="round" />

                        {/* Almond Eyes with Eyelashes & Sparkling Catchlights */}
                        {/* Left Eye */}
                        <path d="M199 73c2-2 6-2 8 0" stroke="#2B1810" strokeWidth="1.5" strokeLinecap="round" />
                        <ellipse cx="203" cy="74" rx="2" ry="1.6" fill="#3D2319" />
                        <circle cx="203.8" cy="73.5" r="0.6" fill="#FFFFFF" />
                        <path d="M207 72l2-1.5" stroke="#2B1810" strokeWidth="1.2" strokeLinecap="round" />

                        {/* Right Eye */}
                        <path d="M213 73c2-2 6-2 8 0" stroke="#2B1810" strokeWidth="1.5" strokeLinecap="round" />
                        <ellipse cx="217" cy="74" rx="2" ry="1.6" fill="#3D2319" />
                        <circle cx="217.8" cy="73.5" r="0.6" fill="#FFFFFF" />
                        <path d="M221 72l2-1.5" stroke="#2B1810" strokeWidth="1.2" strokeLinecap="round" />

                        {/* Dainty Soft Nose */}
                        <path d="M210 75v4c1 1 2 1 3 0" stroke={bmSkinShadow} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Beautiful Smiling Lips with Gloss Highlight */}
                        <path d="M206 85c2 2 6 2 8 0" stroke="#C44B5B" strokeWidth="1.6" strokeLinecap="round" />
                        <path d="M207 86c2 1.5 4 1.5 6 0" fill="#E86E7E" />
                        <circle cx="210" cy="85.5" r="0.5" fill="#FFFFFF" />
                    </g>
                </g>
            </svg>
        );
    }

    // Default 2-person Couple (Principal Sponsors & Wedding Guests)
    return (
        <svg
            viewBox="0 0 420 338"
            fill="none"
            className={`mx-auto block h-auto w-full ${className}`}
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id={dressGradientId} x1="112" y1="105" x2="190" y2="285" gradientUnits="userSpaceOnUse">
                    <stop stopColor={dressLight} />
                    <stop offset="0.45" stopColor={accent} />
                    <stop offset="1" stopColor={dressDark} />
                </linearGradient>
                <linearGradient id={dressSheenId} x1="135" y1="120" x2="185" y2="285" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFFFFF" stopOpacity="0.42" />
                    <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.08" />
                    <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
                <linearGradient id={suitGradientId} x1="240" y1="95" x2="310" y2="225" gradientUnits="userSpaceOnUse">
                    <stop stopColor={suitLight} />
                    <stop offset="0.5" stopColor={suit} />
                    <stop offset="1" stopColor={suitDark} />
                </linearGradient>
                <linearGradient id={womanSkinGradientId} x1="135" y1="36" x2="160" y2="92" gradientUnits="userSpaceOnUse">
                    <stop stopColor={womanSkinLight} />
                    <stop offset="1" stopColor={womanSkin} />
                </linearGradient>
                <linearGradient id={manSkinGradientId} x1="262" y1="36" x2="288" y2="92" gradientUnits="userSpaceOnUse">
                    <stop stopColor={manSkinLight} />
                    <stop offset="1" stopColor={manSkin} />
                </linearGradient>
                <radialGradient id={groundGradientId} cx="0" cy="0" r="1" gradientTransform="translate(211 316) rotate(90) scale(15 142)" gradientUnits="userSpaceOnUse">
                    <stop stopColor={accent} stopOpacity="0.25" />
                    <stop offset="1" stopColor={accent} stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* Subtle Ground Shadow & Atmosphere */}
            <ellipse cx="211" cy="316" rx="142" ry="14" fill={`url(#${groundGradientId})`} />
            <path d="M85 313c62 13 187 13 252 0" stroke={accent} strokeOpacity="0.18" strokeWidth="2" strokeLinecap="round" />
            <circle cx="78" cy="98" r="3.5" fill={accent} fillOpacity="0.25" />
            <circle cx="346" cy="80" r="3.5" fill={accent} fillOpacity="0.2" />
            <path d="m68 130 5 5 8-10M344 140l5 5 8-10" stroke={accent} strokeOpacity="0.28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* ========================================================= */}
            {/* FEMALE CHARACTER: Beautiful, Slender & Couture Gown */}
            {/* ========================================================= */}
            <g transform="translate(18 5)">
                {/* Gown Skirt with Fluid Couture Lines */}
                <path
                    d="M138 142c-10 18-19 44-24 76l-16 72c24 8 58 11 76 11s52-3 76-11l-16-72c-5-32-14-58-24-76-12 5-24 5-36 0s-24-5-36 0Z"
                    fill={`url(#${dressGradientId})`}
                />
                <path
                    d="M138 142c-10 18-19 44-24 76l-16 72c24 8 58 11 76 11s52-3 76-11l-16-72c-5-32-14-58-24-76-12 5-24 5-36 0s-24-5-36 0Z"
                    fill={`url(#${dressSheenId})`}
                />

                {/* Elegant Skirt Draping & Pleat Highlighting */}
                <path d="M125 174c-6 36-11 74-12 112" stroke="#FFFFFF" strokeOpacity="0.22" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M152 166c-2 42-3 82-4 124" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
                <path d="M176 166c2 42 3 82 4 124" stroke="#000000" strokeOpacity="0.12" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M198 174c5 36 9 74 11 112" stroke="#000000" strokeOpacity="0.15" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M102 288c20 7 42 10 56 10s36-3 56-10" stroke="#FFFFFF" strokeOpacity="0.24" strokeWidth="2" strokeLinecap="round" />

                {/* Tailored Bodice with Feminine Sweetheart Silhouette */}
                <path
                    d="M141 108c-8 3-12 11-13 21l3 21c9 4 18 5 27 5s18-1 27-5l3-21c-1-10-5-18-13-21-9 5-17 6-27 6s-18-1-27-6Z"
                    fill={`url(#${dressGradientId})`}
                />
                {/* Bodice Sweetheart Inset / Shimmer */}
                <path d="M141 110c7 8 14 11 23 11s16-3 23-11c-7-3-15-4-23-4s-16 1-23 4Z" fill={paleAccent} fillOpacity="0.65" />
                {/* Cinched Waist Band */}
                <rect x="136" y="146" width="46" height="5" rx="2.5" fill={ultraPale} />

                {/* Slender Arms & Delicate Hands */}
                <path d="M128 126c-6 14-8 32-2 44l10 24" stroke={`url(#${womanSkinGradientId})`} strokeWidth="7" strokeLinecap="round" />
                <path d="M188 126c6 14 8 32 2 44l-8 22" stroke={`url(#${womanSkinGradientId})`} strokeWidth="7" strokeLinecap="round" />
                <ellipse cx="138" cy="198" rx="4.5" ry="7" transform="rotate(18 138 198)" fill={womanSkin} />
                <ellipse cx="180" cy="194" rx="4.5" ry="7" transform="rotate(-24 180 194)" fill={womanSkin} />
                {/* Chic Evening Minaudière / Clutch Bag */}
                <rect x="168" y="184" width="26" height="17" rx="4" fill={dressDark} stroke={ultraPale} strokeWidth="1.2" />
                <circle cx="181" cy="186" r="1.8" fill={ultraPale} />

                {/* Delicate Neck, Clavicles, & Pearl Necklace */}
                <path d="M152 92h14l2 18c-6 2-12 2-18 0l2-18Z" fill={`url(#${womanSkinGradientId})`} />
                <path d="M149 111c5 3 15 3 20 0" stroke={womanSkinShadow} strokeWidth="1" strokeLinecap="round" />
                <path d="M150 100c4 5 14 5 18 0" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="159" cy="104" r="1.8" fill="#FFFFFF" />

                {/* Beautiful Female Face & Hair */}
                <g transform="translate(0 0)">
                    {/* Graceful Oval Face & Ears */}
                    <ellipse cx="159" cy="72" rx="16" ry="19.5" fill={`url(#${womanSkinGradientId})`} />
                    <ellipse cx="142.5" cy="74" rx="2.2" ry="3.5" fill={womanSkin} />
                    <ellipse cx="175.5" cy="74" rx="2.2" ry="3.5" fill={womanSkin} />
                    {/* Pearl Drop Earrings */}
                    <circle cx="142" cy="79" r="1.8" fill="#FFFFFF" />
                    <circle cx="176" cy="79" r="1.8" fill="#FFFFFF" />

                    {/* Hairstyles tailored by role */}
                    {isSponsor ? (
                        /* Regal French Twist / Chignon with Hairpin */
                        <>
                            <circle cx="159" cy="45" r="9" fill={womanHair} />
                            <path d="M142 71c-1-19 11-30 25-27 12 3 17 15 12 30-4-8-10-13-18-14-7-1-14 2-19 11Z" fill={womanHair} />
                            <path d="M143 70c-4 9-2 20 4 26-1-8 2-14 7-19-6-2-9-4-11-7Z" fill={womanHair} />
                            <circle cx="166" cy="46" r="3" fill={ultraPale} />
                        </>
                    ) : (
                        /* Glamorous Romantic Updo with Soft Waves */
                        <>
                            <path d="M142 71c-1-20 11-31 26-28 12 3 18 16 12 32-4-9-10-14-18-15-8-1-15 2-20 11Z" fill={womanHair} />
                            <path d="M143 70c-5 11-3 24 5 30-1-9 2-16 7-21-6-2-9-5-12-9ZM174 68c7 10 5 24 0 32 0-8-3-15-7-20 4-3 6-7 7-12Z" fill={womanHair} />
                            <circle cx="159" cy="46" r="8" fill={womanHairLight} />
                        </>
                    )}

                    {/* Soft Rosy Blush */}
                    <ellipse cx="150" cy="77" rx="4" ry="2.2" fill="#FF8E8E" fillOpacity="0.35" />
                    <ellipse cx="168" cy="77" rx="4" ry="2.2" fill="#FF8E8E" fillOpacity="0.35" />

                    {/* Finely Arched Eyebrows */}
                    <path d="M148 67c3-2 6-1 8 0M162 67c3-1 6-2 8 0" stroke="#4A332C" strokeWidth="1.2" strokeLinecap="round" />

                    {/* Almond Eyes with Eyelashes & Shine */}
                    {/* Left Eye */}
                    <path d="M148 71c2-2 5-2 7 0" stroke="#2B1A15" strokeWidth="1.4" strokeLinecap="round" />
                    <ellipse cx="151.5" cy="72" rx="1.8" ry="1.5" fill="#3A221B" />
                    <circle cx="152.2" cy="71.5" r="0.5" fill="#FFFFFF" />
                    <path d="M155 70.5l1.5-1.2" stroke="#2B1A15" strokeWidth="1.1" strokeLinecap="round" />

                    {/* Right Eye */}
                    <path d="M163 71c2-2 5-2 7 0" stroke="#2B1A15" strokeWidth="1.4" strokeLinecap="round" />
                    <ellipse cx="166.5" cy="72" rx="1.8" ry="1.5" fill="#3A221B" />
                    <circle cx="167.2" cy="71.5" r="0.5" fill="#FFFFFF" />
                    <path d="M170 70.5l1.5-1.2" stroke="#2B1A15" strokeWidth="1.1" strokeLinecap="round" />

                    {/* Dainty Nose */}
                    <path d="M159 73v4c1 1 2 1 2.5 0" stroke={womanSkinShadow} strokeWidth="1.1" strokeLinecap="round" />

                    {/* Lovely Defined Smile with Gloss */}
                    <path d="M155 82c2 2 5 2 7 0" stroke="#B84454" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M156 83c2 1.2 4 1.2 5 0" fill="#E86A7A" />
                    <circle cx="158.5" cy="82.5" r="0.4" fill="#FFFFFF" />
                </g>
            </g>

            {/* ========================================================= */}
            {/* MALE CHARACTER: Handsome, Tailored Italian Fit & Posture */}
            {/* ========================================================= */}
            <g transform="translate(18 3)">
                {/* Athletic Slim-Fit Suit Jacket (V-Taper) */}
                <path
                    d="M245 106c-12 8-19 24-20 45l-2 70h94l-2-70c-1-21-8-37-20-45-10 7-38 7-50 0Z"
                    fill={suit}
                />
                <path
                    d="M245 106c-12 8-19 24-20 45l-2 70h94l-2-70c-1-21-8-37-20-45-10 7-38 7-50 0Z"
                    fill={`url(#${suitGradientId})`}
                />

                {/* Crisp White Dress Shirt Inset */}
                <path d="M256 107c6 9 11 17 14 26 4-9 9-17 14-26-9 5-20 5-28 0Z" fill="#FFFDF8" />

                {/* Tailored Lapels with Subtle Dimension */}
                <path d="m247 107 23 26-19 16-15-23 11-19ZM293 107l-23 26 19 16 15-23-11-19Z" fill="#FFFFFF" fillOpacity="0.12" />

                {/* Neckwear (Sponsor: Tuxedo Bowtie; Guest: Sleek Silk Tie) */}
                {isSponsor ? (
                    <>
                        <path d="m260 126 10 6-8 8-9-7 7-7ZM280 126l-10 6 8 8 9-7-7-7Z" fill={accent} />
                        <circle cx="270" cy="132" r="3" fill={dressDark} />
                    </>
                ) : (
                    <path d="m267 127 3 5-3 30h6l-3-30 3-5-3-5Z" fill={accent} />
                )}

                {/* Silk Pocket Square & Boutonniere Accent */}
                <path d="M288 147h14l-2 7h-11Z" fill={paleAccent} />
                <circle cx="252" cy="138" r="2.5" fill={accent} />

                {/* Jacket Seam & Modern Buttons */}
                <path d="M270 148v70" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1.5" />
                <circle cx="270" cy="168" r="2" fill="#D6D7DC" />
                <circle cx="270" cy="184" r="2" fill="#D6D7DC" />

                {/* Tailored Sleeves & Handsome Hands */}
                <path d="M235 128c-7 12-10 28-11 46l-1 26" stroke={suit} strokeWidth="15" strokeLinecap="round" />
                <path d="M305 128c7 12 10 28 11 46l1 24" stroke={suit} strokeWidth="15" strokeLinecap="round" />
                <path d="M225 192h11M304 190h11" stroke="#FFFDFC" strokeWidth="2.5" strokeLinecap="round" />
                <ellipse cx="223" cy="206" rx="5" ry="9" transform="rotate(6 223 206)" fill={manSkin} />
                <ellipse cx="317" cy="203" rx="5" ry="9" transform="rotate(-8 317 203)" fill={manSkin} />

                {/* Slim Tailored Trousers with Sharp Center Crease */}
                <path d="M233 216h35l-2 64h-39l6-64ZM271 216h35l6 64h-39l-2-64Z" fill={suitDark} />
                <path d="M250 220v58M288 220v58" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1.2" />

                {/* Polished Oxford Dress Shoes */}
                <path d="M225 280h43l-2 9h-44c-1-4 0-7 3-9ZM273 280h39c3 2 5 5 5 9h-43l-1-9Z" fill="#12141A" />
                <path d="M228 283h35M277 283h33" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="1.2" strokeLinecap="round" />

                {/* Handsome Masculine Head & Face */}
                <g transform="translate(0 0)">
                    {/* Neck with Shirt Collar */}
                    <rect x="262" y="86" width="16" height="22" rx="6" fill={manSkin} />
                    {/* Sculpted Jawline & Head */}
                    <ellipse cx="270" cy="66" rx="17.5" ry="22" fill={`url(#${manSkinGradientId})`} />
                    <ellipse cx="252.5" cy="68" rx="2.5" ry="4" fill={manSkin} />
                    <ellipse cx="287.5" cy="68" rx="2.5" ry="4" fill={manSkin} />

                    {/* Well-Groomed Contemporary Hair Styling */}
                    {isSponsor ? (
                        /* Distinguished Executive Hair with Silver Highlights */
                        <>
                            <path d="M253 64c2-19 14-30 28-26 13 4 18 16 11 34-3-9-9-14-17-17-8-2-15 1-22 9Z" fill={manHair} />
                            <path d="M255 54c6-12 24-16 33-4-7 1-11 3-16 8-6-3-12-4-17-4Z" fill={manHair} />
                            <path d="M258 50c6-4 15-6 22-2" stroke="#9E98A0" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
                        </>
                    ) : (
                        /* Modern Textured Coiffure with Volume & Fade */
                        <>
                            <path d="M253 64c0-18 12-30 27-27 14 3 21 15 15 33-4-8-11-12-20-13-8-1-15 2-22 7Z" fill={manHair} />
                            <circle cx="258" cy="46" r="6" fill={manHair} />
                            <circle cx="267" cy="42" r="7" fill={manHairHighlight} />
                            <circle cx="276" cy="42" r="7" fill={manHairHighlight} />
                            <circle cx="286" cy="47" r="6" fill={manHair} />
                        </>
                    )}

                    {/* Confident, Well-Groomed Eyebrows */}
                    <path d="M259 62c3-2 6-1 8 0M273 62c3-1 6-2 8 0" stroke="#332B2C" strokeWidth="1.6" strokeLinecap="round" />

                    {/* Expressive Warm Eyes */}
                    {/* Left Eye */}
                    <path d="M260 66c2-2 5-2 7 0" stroke="#221C1C" strokeWidth="1.4" strokeLinecap="round" />
                    <ellipse cx="263.5" cy="67" rx="1.8" ry="1.5" fill="#2C2424" />
                    <circle cx="264.2" cy="66.5" r="0.5" fill="#FFFFFF" />

                    {/* Right Eye */}
                    <path d="M274 66c2-2 5-2 7 0" stroke="#221C1C" strokeWidth="1.4" strokeLinecap="round" />
                    <ellipse cx="277.5" cy="67" rx="1.8" ry="1.5" fill="#2C2424" />
                    <circle cx="278.2" cy="66.5" r="0.5" fill="#FFFFFF" />

                    {/* Straight Handsome Nose */}
                    <path d="M270 67v5c1 1 2 1 2.5 0" stroke="#B8765E" strokeWidth="1.2" strokeLinecap="round" />

                    {/* Friendly Smile & Subtle Cheek Contour */}
                    <path d="M266 79c3 2 6 2 8 0" stroke="#8A4849" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M258 72c2 1 3 1 5 0M278 72c2 1 3 1 5 0" stroke="#DCA28A" strokeWidth="1.1" strokeLinecap="round" />
                </g>
            </g>
        </svg>
    );
}
