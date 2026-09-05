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

function mixColor(hex: string, target: '#ffffff' | '#1a171d', amount: number) {
    const normalized = hex.replace('#', '');
    const base = {
        r: parseInt(normalized.slice(0, 2), 16) || 209,
        g: parseInt(normalized.slice(2, 4), 16) || 108,
        b: parseInt(normalized.slice(4, 6), 16) || 120,
    };
    const to = target === '#ffffff' ? { r: 255, g: 255, b: 255 } : { r: 26, g: 23, b: 29 };
    const blend = (from: number, destination: number) => Math.round(from + (destination - from) * amount);
    return `rgb(${blend(base.r, to.r)}, ${blend(base.g, to.g)}, ${blend(base.b, to.b)})`;
}

/**
 * An elevated, high-fashion wedding attire couple illustration shared across the builder and live wedding pages.
 * Responsive to dynamic user attire color theme with rich fabric gradients, satin lapels, and graceful silhouettes.
 */
export default function AttireIllustration({
    color = '#D16C78',
    variant = 'guests',
    className = '',
}: AttireIllustrationProps) {
    const rawId = useId();
    const id = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

    const accent = normalizeColor(color);
    const isSponsor = variant === 'sponsors';

    // Dress & Accent Palette
    const dressHighlight = mixColor(accent, '#ffffff', 0.42);
    const dressMid = accent;
    const dressShadow = mixColor(accent, '#1a171d', isSponsor ? 0.38 : 0.28);
    const dressDeepShadow = mixColor(accent, '#1a171d', 0.62);
    const paleShimmer = mixColor(accent, '#ffffff', 0.78);

    // Tuxedo & Suit Palette
    const suitBase = isSponsor ? '#1B202A' : '#222733';
    const suitLapel = isSponsor ? '#11141B' : '#171B24';
    const suitTrousers = isSponsor ? '#13161E' : '#1A1E27';

    // Skin & Hair Tones (Sophisticated warm natural tones)
    const womanSkinLight = isSponsor ? '#F0CDAF' : '#FCE4D0';
    const womanSkinMid = isSponsor ? '#DDAA88' : '#ECC0A4';
    const womanSkinShadow = isSponsor ? '#BE8A6B' : '#CE9C7E';
    const womanHair = isSponsor ? '#2C2326' : '#4E332A';
    const womanHairHighlight = isSponsor ? '#4A3D42' : '#734E41';

    const manSkinLight = isSponsor ? '#E2B89A' : '#E8BE9E';
    const manSkinMid = isSponsor ? '#C99878' : '#D1A384';
    const manSkinShadow = isSponsor ? '#A67757' : '#B07F60';
    const manHair = isSponsor ? '#444047' : '#222329';
    const manHairHighlight = isSponsor ? '#78737D' : '#3E414D';

    return (
        <svg
            viewBox="0 0 460 360"
            fill="none"
            className={`mx-auto block h-auto w-full max-w-[420px] drop-shadow-md ${className}`}
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <defs>
                {/* Background Atmosphere */}
                <radialGradient id={`bg-glow-${id}`} cx="0" cy="0" r="1" gradientTransform="translate(230 180) rotate(90) scale(160 210)" gradientUnits="userSpaceOnUse">
                    <stop stopColor={accent} stopOpacity="0.12" />
                    <stop offset="0.7" stopColor={accent} stopOpacity="0.03" />
                    <stop offset="1" stopColor={accent} stopOpacity="0" />
                </radialGradient>

                {/* Ground Shadow */}
                <radialGradient id={`ground-${id}`} cx="0" cy="0" r="1" gradientTransform="translate(230 338) rotate(90) scale(14 175)" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1E1B24" stopOpacity="0.28" />
                    <stop offset="0.6" stopColor={accent} stopOpacity="0.14" />
                    <stop offset="1" stopColor={accent} stopOpacity="0" />
                </radialGradient>

                {/* Woman Gown Gradient */}
                <linearGradient id={`gown-grad-${id}`} x1="120" y1="100" x2="200" y2="330" gradientUnits="userSpaceOnUse">
                    <stop stopColor={dressHighlight} />
                    <stop offset="0.25" stopColor={dressMid} />
                    <stop offset="0.7" stopColor={dressShadow} />
                    <stop offset="1" stopColor={dressDeepShadow} />
                </linearGradient>

                {/* Gown Silk Sheen Overlay */}
                <linearGradient id={`gown-sheen-${id}`} x1="135" y1="120" x2="185" y2="320" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFFFFF" stopOpacity="0.45" />
                    <stop offset="0.35" stopColor="#FFFFFF" stopOpacity="0.08" />
                    <stop offset="0.75" stopColor="#FFFFFF" stopOpacity="0.25" />
                    <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>

                {/* Man Suit Gradient */}
                <linearGradient id={`suit-grad-${id}`} x1="260" y1="90" x2="345" y2="240" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFFFFF" stopOpacity="0.12" />
                    <stop offset="0.4" stopColor="#FFFFFF" stopOpacity="0.02" />
                    <stop offset="1" stopColor="#000000" stopOpacity="0.28" />
                </linearGradient>

                {/* Skin Gradients */}
                <linearGradient id={`woman-skin-${id}`} x1="150" y1="40" x2="175" y2="105" gradientUnits="userSpaceOnUse">
                    <stop stopColor={womanSkinLight} />
                    <stop offset="0.6" stopColor={womanSkinMid} />
                    <stop offset="1" stopColor={womanSkinShadow} />
                </linearGradient>

                <linearGradient id={`man-skin-${id}`} x1="285" y1="40" x2="310" y2="105" gradientUnits="userSpaceOnUse">
                    <stop stopColor={manSkinLight} />
                    <stop offset="0.6" stopColor={manSkinMid} />
                    <stop offset="1" stopColor={manSkinShadow} />
                </linearGradient>

                {/* Gold Accessories Shimmer */}
                <linearGradient id={`gold-acc-${id}`} x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#FFE8B5" />
                    <stop offset="0.5" stopColor="#E5C178" />
                    <stop offset="1" stopColor="#B88A3C" />
                </linearGradient>
            </defs>

            {/* Atmosphere Backdrop & Floor Shadow */}
            <circle cx="230" cy="180" r="165" fill={`url(#bg-glow-${id})`} />
            <ellipse cx="230" cy="338" rx="165" ry="14" fill={`url(#ground-${id})`} />

            {/* Sparkles / Ambient Stars */}
            <g opacity="0.45">
                <path d="M78 112L81 120L89 123L81 126L78 134L75 126L67 123L75 120Z" fill={accent} />
                <path d="M382 94L384 100L390 102L384 104L382 110L380 104L374 102L380 100Z" fill={accent} />
                <circle cx="395" cy="155" r="2.5" fill={accent} />
                <circle cx="65" cy="175" r="2.5" fill={accent} />
            </g>

            {/* ========================================================= */}
            {/* 1. WOMAN: High-Fashion Evening Gown with Cascading Drapes */}
            {/* ========================================================= */}
            <g id="woman-figure">
                {/* Flowing Lower Skirt / Train */}
                <path
                    d="M142 165 C132 195, 114 260, 96 332 C135 344, 192 344, 226 332 C210 262, 194 195, 184 165 Z"
                    fill={`url(#gown-grad-${id})`}
                />
                {/* Skirt Silk Sheen & Pleat Shadows */}
                <path
                    d="M142 165 C132 195, 114 260, 96 332 C135 344, 192 344, 226 332 C210 262, 194 195, 184 165 Z"
                    fill={`url(#gown-sheen-${id})`}
                />

                {/* Artistic Fabric Folds */}
                <path d="M128 220 C134 260, 142 300, 145 336" stroke="#FFFFFF" strokeOpacity="0.22" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M162 190 C165 240, 168 290, 172 338" stroke="#FFFFFF" strokeOpacity="0.28" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M192 225 C190 265, 189 302, 194 336" stroke={dressDeepShadow} strokeOpacity="0.45" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M106 315 C138 330, 184 330, 218 315" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="2" strokeLinecap="round" />

                {/* Fitted Bodice / Corset */}
                <path
                    d="M144 116 C138 126, 137 146, 142 168 C155 172, 171 172, 184 168 C189 146, 188 126, 182 116 C173 122, 153 122, 144 116 Z"
                    fill={`url(#gown-grad-${id})`}
                />
                {/* Sweetheart Neckline Overlay */}
                <path
                    d="M144 116 C153 122, 163 128, 163 128 C163 128, 173 122, 182 116 C176 110, 150 110, 144 116 Z"
                    fill={paleShimmer}
                    opacity="0.9"
                />

                {/* Waist Satin Ribbon / Sash */}
                <path d="M141 164 C154 169, 172 169, 185 164 L184 171 C171 176, 154 176, 142 171 Z" fill={dressDeepShadow} />
                <circle cx="163" cy="168" r="3.5" fill={`url(#gold-acc-${id})`} />

                {/* Slender Arms & Delicate Hands */}
                {/* Left Arm (Relaxed) */}
                <path d="M143 120 C132 140, 122 172, 118 202 L124 203 C128 174, 137 144, 148 123 Z" fill={`url(#woman-skin-${id})`} />
                <ellipse cx="119" cy="209" rx="5" ry="8" transform="rotate(10 119 209)" fill={womanSkinMid} />
                <circle cx="121" cy="198" r="3.5" stroke={`url(#gold-acc-${id})`} strokeWidth="1.5" fill="none" />

                {/* Right Arm (Holding chic evening clutch) */}
                <path d="M183 120 C194 140, 202 168, 204 195 L198 197 C196 172, 188 145, 178 123 Z" fill={`url(#woman-skin-${id})`} />
                <ellipse cx="201" cy="202" rx="5" ry="8" transform="rotate(-15 201 202)" fill={womanSkinMid} />
                {/* Clutch Bag */}
                <rect x="194" y="196" width="22" height="15" rx="3.5" fill="#1B1D24" stroke={`url(#gold-acc-${id})`} strokeWidth="1.5" />
                <path d="M198 200 L205 205 L212 200" stroke={`url(#gold-acc-${id})`} strokeWidth="1.2" fill="none" />

                {/* Graceful Neck & Decolletage */}
                <path d="M157 88 L157 114 C161 116, 165 116, 169 114 L169 88 Z" fill={`url(#woman-skin-${id})`} />
                {/* Pearl/Gold Necklace */}
                <path d="M155 102 C160 110, 166 110, 171 102" stroke={`url(#gold-acc-${id})`} strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <circle cx="163" cy="107" r="2.2" fill="#FFFDFC" stroke={`url(#gold-acc-${id})`} strokeWidth="0.8" />

                {/* Feminine Head & Soft Features */}
                <ellipse cx="163" cy="68" rx="16" ry="21" fill={`url(#woman-skin-${id})`} />
                {/* Soft Ears & Earrings */}
                <ellipse cx="147" cy="69" rx="2.5" ry="4" fill={womanSkinMid} />
                <ellipse cx="179" cy="69" rx="2.5" ry="4" fill={womanSkinMid} />
                <circle cx="147" cy="74" r="1.8" fill="#FFFDFC" stroke={`url(#gold-acc-${id})`} strokeWidth="0.8" />
                <circle cx="179" cy="74" r="1.8" fill="#FFFDFC" stroke={`url(#gold-acc-${id})`} strokeWidth="0.8" />

                {/* Elegant Hairstyle */}
                {isSponsor ? (
                    /* Classic Sophisticated Updo / Chignon */
                    <>
                        <ellipse cx="163" cy="42" rx="13" ry="11" fill={womanHair} />
                        <path d="M147 67 C146 44, 153 36, 163 36 C173 36, 180 44, 179 67 C174 54, 152 54, 147 67 Z" fill={womanHair} />
                        <path d="M147 65 C152 56, 174 56, 179 65 C176 50, 150 50, 147 65 Z" fill={womanHairHighlight} />
                        {/* Gold Hairpiece Pin */}
                        <path d="M160 41 Q163 38 166 41" stroke={`url(#gold-acc-${id})`} strokeWidth="2.5" strokeLinecap="round" />
                    </>
                ) : (
                    /* Romantic Cascading Waves with Soft Bangs */
                    <>
                        <path d="M147 68 C144 42, 152 35, 163 35 C174 35, 182 42, 179 68 C179 88, 174 98, 181 114 C175 106, 174 88, 175 75 C172 60, 154 60, 151 75 C152 88, 151 106, 145 114 C152 98, 147 88, 147 68 Z" fill={womanHair} />
                        <path d="M150 48 C158 40, 168 40, 176 48 C172 38, 154 38, 150 48 Z" fill={womanHairHighlight} opacity="0.8" />
                    </>
                )}

                {/* Delicate Joyful Facial Features */}
                {/* Cheerful Lifted Eyebrows */}
                <path d="M153 61 C156 58, 159 58, 161 61" stroke="#3D2924" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M165 61 C167 58, 170 58, 173 61" stroke="#3D2924" strokeWidth="1.3" strokeLinecap="round" />
                {/* Happy Sparkling Eyes with Upward Eyelashes */}
                <path d="M153 65 C155 62, 159 62, 161 65" stroke="#231714" strokeWidth="1.6" strokeLinecap="round" />
                <ellipse cx="157" cy="66" rx="2" ry="2.2" fill="#231714" />
                <circle cx="158" cy="65" r="0.8" fill="#FFFFFF" />
                <path d="M165 65 C167 62, 171 62, 173 65" stroke="#231714" strokeWidth="1.6" strokeLinecap="round" />
                <ellipse cx="169" cy="66" rx="2" ry="2.2" fill="#231714" />
                <circle cx="170" cy="65" r="0.8" fill="#FFFFFF" />
                {/* Warm Rosy Cheeks */}
                <circle cx="152" cy="71" r="3.5" fill="#E8828C" opacity="0.45" />
                <circle cx="174" cy="71" r="3.5" fill="#E8828C" opacity="0.45" />
                {/* Cute Nose */}
                <path d="M163 66 L162 72 L164 73" stroke={womanSkinShadow} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                {/* Radiant Smiling Lips & White Teeth */}
                <path d="M157 76 C157 82, 169 82, 169 76 Z" fill="#C84B5B" />
                <path d="M158 76 C159 79, 167 79, 168 76 Z" fill="#FFFFFF" />
                <path d="M156 75.5 C156 82.5, 170 82.5, 170 75.5" stroke="#A83645" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                {/* Soft Smile Dimples */}
                <path d="M154 75 Q153 77 154 78.5" stroke="#C48473" strokeWidth="1" strokeLinecap="round" />
                <path d="M172 75 Q173 77 172 78.5" stroke="#C48473" strokeWidth="1" strokeLinecap="round" />
            </g>

            {/* ========================================================= */}
            {/* 2. MAN: Modern Tailored Tuxedo with Theme Color Accents    */}
            {/* ========================================================= */}
            <g id="man-figure">
                {/* Tailored Trousers */}
                <path d="M266 218 L260 326 C264 329, 290 329, 294 326 L298 235 L302 326 C306 329, 332 329, 336 326 L330 218 Z" fill={suitTrousers} />
                <path d="M298 235 L298 326" stroke="#000000" strokeOpacity="0.35" strokeWidth="1.5" />
                <path d="M277 230 L277 325 M319 230 L319 325" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1" />

                {/* Polished Oxford Shoes */}
                <path d="M256 325 C263 323, 287 323, 294 325 C295 330, 293 336, 287 337 L256 337 C253 334, 253 328, 256 325 Z" fill="#0C0E14" />
                <path d="M302 325 C309 323, 333 323, 340 325 C343 328, 343 334, 340 337 L309 337 C303 336, 301 330, 302 325 Z" fill="#0C0E14" />
                <path d="M260 327 C270 326, 282 326, 290 327 M306 327 C316 326, 328 326, 336 327" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1" strokeLinecap="round" />

                {/* Tuxedo Jacket Body */}
                <path
                    d="M265 110 C252 120, 246 142, 248 180 L252 222 C275 227, 321 227, 344 222 L348 180 C350 142, 344 120, 331 110 C316 116, 280 116, 265 110 Z"
                    fill={suitBase}
                />
                <path
                    d="M265 110 C252 120, 246 142, 248 180 L252 222 C275 227, 321 227, 344 222 L348 180 C350 142, 344 120, 331 110 C316 116, 280 116, 265 110 Z"
                    fill={`url(#suit-grad-${id})`}
                />

                {/* Crisp White Shirt V-Placket */}
                <path d="M285 112 L298 165 L311 112 Z" fill="#FFFDFC" />
                <line x1="298" y1="130" x2="298" y2="165" stroke="#E5E7EB" strokeWidth="1.2" />
                {/* Black Onyx Shirt Studs */}
                <circle cx="298" cy="142" r="1.3" fill="#11141B" />
                <circle cx="298" cy="154" r="1.3" fill="#11141B" />

                {/* Satin Peak Lapels */}
                <path d="M266 110 L287 158 L283 198 L298 220 L276 218 L262 165 Z" fill={suitLapel} />
                <path d="M330 110 L309 158 L313 198 L298 220 L320 218 L334 165 Z" fill={suitLapel} />

                {/* Theme-Matched Tie or Bowtie */}
                {isSponsor ? (
                    /* Classic Silk Bowtie */
                    <g id="bowtie">
                        <path d="M290 120 L298 124 L290 128 Z" fill={accent} />
                        <path d="M306 120 L298 124 L306 128 Z" fill={accent} />
                        <ellipse cx="298" cy="124" rx="2.5" ry="2.8" fill={dressShadow} />
                    </g>
                ) : (
                    /* Modern Slim Necktie */
                    <g id="necktie">
                        <polygon points="295,120 301,120 302,125 298,127 294,125" fill={dressShadow} />
                        <polygon points="296,126 300,126 302,162 298,168 294,162" fill={accent} />
                        <path d="M296 126 L298 166" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="0.8" />
                    </g>
                )}

                {/* Pocket Square in Theme Color + Boutonnière */}
                <path d="M318 144 L328 142 L332 146 L317 146 Z" fill={paleShimmer} stroke={accent} strokeWidth="0.8" />
                <circle cx="282" cy="138" r="2.5" fill={accent} />
                <circle cx="284" cy="136" r="1.8" fill="#FFFDFC" />
                <path d="M282 140 Q283 145 281 148" stroke="#52796F" strokeWidth="1.2" strokeLinecap="round" />

                {/* Suit Sleeves & Cuffs */}
                <path d="M255 116 C242 142, 234 175, 233 205 L242 206 C244 178, 252 148, 263 124 Z" fill={suitBase} />
                <path d="M341 116 C354 142, 362 175, 363 205 L354 206 C352 178, 344 148, 333 124 Z" fill={suitBase} />

                {/* White Shirt Cuff & Hands */}
                <path d="M233 203 L242 204 L241 207 L232 206 Z" fill="#FFFDFC" />
                <ellipse cx="236" cy="214" rx="5" ry="8" transform="rotate(8 236 214)" fill={manSkinMid} />

                <path d="M354 204 L363 203 L364 206 L355 207 Z" fill="#FFFDFC" />
                <ellipse cx="360" cy="214" rx="5" ry="8" transform="rotate(-8 360 214)" fill={manSkinMid} />
                {/* Watch Detail on Right Wrist */}
                <rect x="353" y="206" width="10" height="3" rx="1" fill={`url(#gold-acc-${id})`} />

                {/* Strong Neck & Shirt Collar */}
                <path d="M292 88 L292 114 C296 116, 300 116, 304 114 L304 88 Z" fill={`url(#man-skin-${id})`} />
                <polygon points="288,110 298,118 296,110" fill="#FFFDFC" />
                <polygon points="308,110 298,118 300,110" fill="#FFFDFC" />

                {/* Masculine Head & Jawline */}
                <ellipse cx="298" cy="68" rx="17" ry="22" fill={`url(#man-skin-${id})`} />
                {/* Ears */}
                <ellipse cx="281" cy="69" rx="2.8" ry="4.5" fill={manSkinMid} />
                <ellipse cx="315" cy="69" rx="2.8" ry="4.5" fill={manSkinMid} />

                {/* Modern Styled Haircut */}
                {isSponsor ? (
                    /* Distinguished Silver/Charcoal Executive Sweep */
                    <>
                        <path d="M281 65 C280 43, 288 35, 298 35 C308 35, 316 43, 315 65 C310 52, 286 52, 281 65 Z" fill={manHair} />
                        <path d="M283 50 C290 40, 306 40, 313 50 C308 42, 288 42, 283 50 Z" fill={manHairHighlight} />
                        <path d="M285 45 Q298 38 311 45" stroke="#B0AAB3" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                    </>
                ) : (
                    /* Contemporary Textured Fade / Pompadour */
                    <>
                        <path d="M281 66 C279 40, 288 33, 298 33 C309 33, 317 40, 315 66 C311 50, 285 50, 281 66 Z" fill={manHair} />
                        <path d="M283 46 C290 36, 306 36, 313 46 C308 38, 288 38, 283 46 Z" fill={manHairHighlight} opacity="0.8" />
                    </>
                )}

                {/* Handsome Joyful Facial Features */}
                {/* Cheerful Lifted Brows */}
                <path d="M287 60 C290 57, 294 57, 296 60" stroke="#1D1A20" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M300 60 C302 57, 306 57, 309 60" stroke="#1D1A20" strokeWidth="1.8" strokeLinecap="round" />
                {/* Warm Sparkling Eyes */}
                <path d="M288 64 C290 62, 294 62, 296 64" stroke="#1D1A20" strokeWidth="1.5" strokeLinecap="round" />
                <ellipse cx="292" cy="65.5" rx="2.2" ry="2.2" fill="#1D1A20" />
                <circle cx="293" cy="64.5" r="0.8" fill="#FFFFFF" />
                <path d="M300 64 C302 62, 306 62, 308 64" stroke="#1D1A20" strokeWidth="1.5" strokeLinecap="round" />
                <ellipse cx="304" cy="65.5" rx="2.2" ry="2.2" fill="#1D1A20" />
                <circle cx="305" cy="64.5" r="0.8" fill="#FFFFFF" />
                {/* Defined Nose */}
                <path d="M298 63 L297 71 L300 72" stroke={manSkinShadow} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                {/* Handsome Beaming Smile & White Teeth */}
                <path d="M291 75.5 C291 82.5, 305 82.5, 305 75.5 Z" fill="#9E4D3C" />
                <path d="M292 75.5 C293 78.5, 303 78.5, 304 75.5 Z" fill="#FFFFFF" />
                <path d="M290 75 C290 83, 306 83, 306 75" stroke="#7A3426" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                {/* Smile Dimples */}
                <path d="M288 74.5 Q287 76.5 288 78" stroke="#9A6553" strokeWidth="1" strokeLinecap="round" />
                <path d="M308 74.5 Q309 76.5 308 78" stroke="#9A6553" strokeWidth="1" strokeLinecap="round" />
            </g>
        </svg>
    );
}
