'use client';

function hexToRgb(hex: string) {
    const normalized = hex.replace('#', '').trim();
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return { r: 209, g: 108, b: 120 };
    return {
        r: parseInt(normalized.slice(0, 2), 16),
        g: parseInt(normalized.slice(2, 4), 16),
        b: parseInt(normalized.slice(4, 6), 16),
    };
}

function mixColor(hex: string, target: '#ffffff' | '#2f2527', amount: number) {
    const base = hexToRgb(hex);
    const to = target === '#ffffff' ? { r: 255, g: 255, b: 255 } : { r: 47, g: 37, b: 39 };
    const mix = (from: number, dest: number) => Math.round(from + (dest - from) * amount);
    return `rgb(${mix(base.r, to.r)}, ${mix(base.g, to.g)}, ${mix(base.b, to.b)})`;
}

export default function VectorArtGuests({ color = '#D16C78' }: { color?: string }) {
    const accent = color;
    const darkText = mixColor(color, '#2f2527', 0.85);
    const stroke = '#2C2224';

    return (
        <svg
            viewBox="0 0 460 250"
            fill="none"
            className="h-full w-full max-w-xl select-none drop-shadow-md"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <defs>
                {/* Motif Gown Gradient */}
                <linearGradient id="human-gown-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accent} />
                    <stop offset="100%" stopColor={mixColor(color, '#2f2527', 0.35)} />
                </linearGradient>

                {/* Barong Fabric Gradient */}
                <linearGradient id="human-barong-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FAF5EE" />
                    <stop offset="100%" stopColor="#EFE4D6" />
                </linearGradient>

                {/* Skin Gradient */}
                <linearGradient id="human-skin-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F9DFD0" />
                    <stop offset="100%" stopColor="#EEC0A7" />
                </linearGradient>

                {/* Hair Gradient */}
                <linearGradient id="human-hair-dark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4A342E" />
                    <stop offset="100%" stopColor="#2A1B16" />
                </linearGradient>

                <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                </filter>
            </defs>

            {/* Base Ground Shadows */}
            <ellipse cx="65" cy="214" rx="34" ry="4" fill="#2C2224" opacity="0.1" />
            <ellipse cx="170" cy="214" rx="34" ry="4" fill="#2C2224" opacity="0.1" />
            <ellipse cx="280" cy="214" rx="34" ry="4" fill="#2C2224" opacity="0.1" />
            <ellipse cx="385" cy="214" rx="34" ry="4" fill="#2C2224" opacity="0.1" />

            {/* GROUP HEADERS */}
            <text x="117" y="16" className="text-[10px] font-black uppercase tracking-[0.22em]" fill={darkText} textAnchor="middle">Principal Sponsors</text>
            <text x="332" y="16" className="text-[10px] font-black uppercase tracking-[0.22em]" fill={darkText} textAnchor="middle">Guests</text>

            {/* 1. PRINCIPAL SPONSOR FEMALE (HUMANIZED FORMAL GOWN) */}
            <g transform="translate(15, 8)">
                {/* Skin Silhouette (Arms, Neck, Face) */}
                <path d="M 52,24 C 44,24 40,32 44,42 C 46,48 50,54 60,56 M 50,56 C 54,60 56,66 60,68 C 66,66 70,60 74,56 M 38,70 C 28,78 28,88 34,96 M 82,70 C 88,78 88,88 82,96" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" fill="none" />
                
                {/* Skin Fills */}
                <circle cx="58" cy="38" r="10" fill="url(#human-skin-grad)" />
                <path d="M 52,48 L 64,48 L 62,68 L 54,68 Z" fill="url(#human-skin-grad)" />

                {/* Hair (Voluminous waves cascading over shoulder) */}
                <path d="M 58,22 C 48,22 42,30 44,44 C 46,52 40,62 38,72 C 37,78 40,84 46,88 C 50,84 52,78 50,70 C 48,62 54,54 58,54 C 64,54 72,48 70,38 C 68,28 64,22 58,22 Z" fill="url(#human-hair-dark)" stroke={stroke} strokeWidth="1.2" />

                {/* Gown Color Fill */}
                <path
                    d="M 52,68 C 40,68 36,78 38,92 C 40,102 48,114 46,128 C 44,142 32,168 25,190 C 22,200 20,206 28,206 C 48,206 72,206 92,206 C 100,206 98,200 95,190 C 88,168 76,142 74,128 C 72,114 80,102 82,92 C 84,78 80,68 68,68 Z"
                    fill="url(#human-gown-grad)"
                />

                {/* Face Feature Contour */}
                <path d="M 56,36 C 58,38 60,38 62,36 M 60,42 C 58,44 56,44 54,42" stroke="#8C5C4A" strokeWidth="1" strokeLinecap="round" fill="none" />

                {/* Gown Details (Sweetheart Bodice, Seams, Peplum & Mermaid Folds) */}
                <path d="M 40,70 C 48,74 54,74 60,70 C 66,74 74,74 80,70 M 40,70 L 38,94 M 80,70 L 82,94 M 38,94 C 50,98 70,98 82,94" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                <path d="M 58,74 L 58,96 M 48,72 L 46,95 M 70,72 L 72,95" stroke="#FFFFFF" opacity="0.3" strokeWidth="1" fill="none" />
                <path d="M 38,94 C 34,106 42,118 54,120 M 82,94 C 86,106 78,118 66,120 M 54,120 L 66,120" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                <path d="M 54,120 C 46,145 32,175 25,206 M 66,120 C 74,145 88,175 95,206 M 60,122 C 60,150 60,180 60,206" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                <path d="M 45,150 C 40,175 32,195 28,206 M 75,150 C 80,175 88,195 92,206" stroke="#FFFFFF" opacity="0.35" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                <path d="M 25,206 C 48,208 72,208 95,206" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                
                <text x="60" y="232" className="text-[10px] font-semibold" fill={darkText} textAnchor="middle">Formal Gown</text>
            </g>

            {/* 2. PRINCIPAL SPONSOR MALE (HUMANIZED BARONG AND SLACKS) */}
            <g transform="translate(120, 8)">
                {/* Skin Fill (Face & Neck) */}
                <circle cx="70" cy="34" r="10" fill="url(#human-skin-grad)" />
                <path d="M 64,44 L 76,44 L 74,58 L 66,58 Z" fill="url(#human-skin-grad)" />

                {/* Male Styled Hair */}
                <path d="M 62,20 C 54,20 48,26 50,34 C 52,38 56,38 60,34 C 64,30 74,28 78,32 C 82,36 86,34 84,28 C 82,22 74,20 62,20 Z" fill="url(#human-hair-dark)" stroke={stroke} strokeWidth="1.2" />

                {/* Face Feature Lines */}
                <path d="M 66,34 C 68,36 70,36 72,34 M 68,40 C 69,41 71,41 72,40" stroke="#8C5C4A" strokeWidth="1" strokeLinecap="round" fill="none" />

                {/* Barong Shirt Fill */}
                <path d="M 48,64 L 30,76 L 36,132 L 50,134 L 50,138 L 90,138 L 90,134 L 104,132 L 110,76 L 92,64 Z" fill="url(#human-barong-grad)" />
                {/* Slacks Fill */}
                <path d="M 50,136 L 46,206 L 64,206 L 70,150 L 76,150 L 82,206 L 100,206 L 96,136 Z" fill="#232021" />

                {/* Barong Collar & Traditional Embroidery Detail */}
                <path d="M 60,58 L 60,66 L 80,66 L 80,58 M 64,66 L 64,118 L 76,118 L 76,66" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                <path d="M 56,70 L 56,112 C 56,116 62,118 70,118 C 78,118 84,116 84,112 L 84,70" stroke="#8B7B6B" strokeWidth="1.1" strokeDasharray="3 2" fill="none" />
                <path d="M 60,76 L 60,108 C 60,110 64,112 70,112 C 76,112 80,110 80,108 L 80,76" stroke="#8B7B6B" strokeWidth="1" opacity="0.6" strokeDasharray="2 2" fill="none" />

                {/* Body & Trousers Line Art */}
                <path d="M 48,64 L 30,76 L 36,132 L 48,134 M 92,64 L 110,76 L 104,132 L 92,134 M 48,134 L 92,134" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                <path d="M 50,136 L 46,204 L 64,204 M 96,136 L 100,204 L 82,204 M 70,144 L 70,204 M 76,144 L 76,204" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                {/* Polished Dress Shoes */}
                <path d="M 42,204 C 44,209 60,209 64,204 M 82,204 C 86,209 102,209 104,204" fill="#111111" stroke={stroke} strokeWidth="1.4" />

                <text x="70" y="232" className="text-[10px] font-semibold" fill={darkText} textAnchor="middle">Barong & Slacks</text>
            </g>

            {/* 3. GUEST MALE (HUMANIZED SHIRT & SLACKS) */}
            <g transform="translate(230, 8)">
                {/* Skin Fill */}
                <circle cx="60" cy="34" r="10" fill="url(#human-skin-grad)" />
                <path d="M 54,44 L 66,44 L 64,58 L 56,58 Z" fill="url(#human-skin-grad)" />

                {/* Modern Hair */}
                <path d="M 54,20 C 46,20 42,26 44,34 C 46,38 52,36 56,32 C 60,28 68,26 72,30 C 76,34 78,32 76,26 C 74,20 64,20 54,20 Z" fill="url(#human-hair-dark)" stroke={stroke} strokeWidth="1.2" />

                {/* Face Feature Lines */}
                <path d="M 56,34 C 58,36 60,36 62,34 M 58,40 C 59,41 61,41 62,40" stroke="#8C5C4A" strokeWidth="1" strokeLinecap="round" fill="none" />

                {/* Tucked-in Shirt Fill */}
                <path d="M 52,66 L 34,78 L 40,126 L 80,126 L 86,78 L 68,66 Z" fill={mixColor(color, '#ffffff', 0.45)} />
                {/* Belt */}
                <rect x="42" y="126" width="36" height="6" fill="#3D2E2B" rx="1" />
                <rect x="57" y="125" width="6" height="8" fill="#D4AF37" rx="1" />
                {/* Slacks Fill */}
                <path d="M 42,132 L 38,204 L 56,204 L 60,150 L 62,150 L 66,204 L 84,204 L 80,132 Z" fill="#F4EFEA" />

                {/* Shirt Collar & Lines */}
                <path d="M 54,66 L 60,56 L 66,66 M 60,66 L 60,126" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                <path d="M 52,66 L 34,78 L 40,126 M 68,66 L 86,78 L 80,126" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                <path d="M 42,132 L 38,204 L 56,204 M 80,132 L 84,204 L 66,204 M 60,146 L 60,204" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                <path d="M 34,204 C 36,209 52,209 56,204 M 66,204 C 70,209 86,209 88,204" fill="#222222" stroke={stroke} strokeWidth="1.4" />

                <text x="60" y="232" className="text-[10px] font-semibold" fill={darkText} textAnchor="middle">Semi-Formal</text>
            </g>

            {/* 4. GUEST FEMALE (HUMANIZED COCKTAIL DRESS) */}
            <g transform="translate(335, 8)">
                {/* Skin Fill (Face, Shoulders, Arms, Legs) */}
                <circle cx="60" cy="34" r="10" fill="url(#human-skin-grad)" />
                <path d="M 54,44 L 66,44 L 64,58 L 56,58 Z" fill="url(#human-skin-grad)" />
                <path d="M 46,148 L 48,202 M 74,148 L 72,202" stroke="#E8B59E" strokeWidth="4" strokeLinecap="round" />

                {/* Wavy Flowing Hair */}
                <path d="M 60,20 C 48,20 42,28 44,40 C 46,52 40,62 38,72 M 62,20 C 72,20 78,28 76,40 C 74,52 78,62 80,72" fill="url(#human-hair-dark)" stroke={stroke} strokeWidth="1.2" />

                {/* Face Features */}
                <path d="M 56,34 C 58,36 60,36 62,34 M 58,40 C 59,41 61,41 62,40" stroke="#8C5C4A" strokeWidth="1" strokeLinecap="round" fill="none" />

                {/* Tiered Frill Dress Fill */}
                <path d="M 48,72 C 40,72 38,82 40,96 L 36,112 L 84,112 L 80,96 C 82,82 80,72 72,72 Z" fill="url(#human-gown-grad)" />
                <path d="M 36,112 C 34,124 38,136 34,148 L 86,148 C 82,136 86,124 84,112 Z" fill={mixColor(color, '#ffffff', 0.25)} />
                <rect x="42" y="96" width="36" height="7" fill="#5C3D2E" rx="2" />
                <circle cx="60" cy="99" r="4" fill="#D4AF37" />

                {/* Dress Lines & Frill Shadows */}
                <path d="M 48,72 C 56,75 64,75 72,72 M 40,72 L 42,96 L 78,96 L 80,72" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                <path d="M 38,112 C 48,116 72,116 82,112 M 36,130 C 46,134 74,134 84,130 M 34,148 C 44,152 76,152 86,148" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                <path d="M 44,72 C 34,80 32,90 38,98 M 76,72 C 86,80 88,90 82,98" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                {/* High Heels */}
                <path d="M 44,202 L 50,202 L 48,206 M 68,202 L 74,202 L 72,206" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" fill="none" />

                <text x="60" y="232" className="text-[10px] font-semibold" fill={darkText} textAnchor="middle">Semi-Formal</text>
            </g>
        </svg>
    );
}
