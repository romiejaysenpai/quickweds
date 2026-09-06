'use client';

import React from 'react';

interface TemplateBackgroundVectorProps {
    pattern?: string;
    motifColor?: string;
    isDark?: boolean;
    className?: string;
}

export default function TemplateBackgroundVector({
    pattern = 'none',
    motifColor = '#D16C78',
    isDark = false,
    className = '',
}: TemplateBackgroundVectorProps) {
    if (!pattern || pattern === 'none') return null;

    const baseOpacity = isDark ? 0.07 : 0.045;
    const accentOpacity = isDark ? 0.12 : 0.08;

    return (
        <div
            className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 ${className}`}
            aria-hidden="true"
        >
            {/* 1. Botanical Sprig / Ivy */}
            {(pattern === 'botanical-sprig' || pattern === 'botanical-ivy') && (
                <>
                    <svg
                        className="absolute -top-12 -left-12 w-72 sm:w-96 h-72 sm:h-96"
                        viewBox="0 0 400 400"
                        fill="none"
                        style={{ color: motifColor, opacity: accentOpacity }}
                    >
                        <path
                            d="M20 20 C100 120, 160 180, 240 240 M240 240 C280 270, 320 310, 380 340"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        />
                        {/* Leaves */}
                        <path d="M70 75 C60 40, 100 45, 110 70 C105 85, 80 90, 70 75 Z" fill="currentColor" />
                        <path d="M120 120 C145 95, 175 125, 150 145 C135 140, 125 130, 120 120 Z" fill="currentColor" />
                        <path d="M160 170 C140 140, 185 145, 195 175 C185 190, 168 185, 160 170 Z" fill="currentColor" />
                        <path d="M210 215 C240 190, 265 220, 245 240 C230 235, 220 225, 210 215 Z" fill="currentColor" />
                        <path d="M260 260 C240 230, 280 230, 290 260 C280 275, 268 270, 260 260 Z" fill="currentColor" />
                        <path d="M305 295 C335 270, 360 300, 340 320 C325 315, 315 305, 305 295 Z" fill="currentColor" />
                    </svg>
                    <svg
                        className="absolute -bottom-16 -right-16 w-80 sm:w-[28rem] h-80 sm:h-[28rem] rotate-180"
                        viewBox="0 0 400 400"
                        fill="none"
                        style={{ color: motifColor, opacity: accentOpacity }}
                    >
                        <path
                            d="M20 20 C100 120, 160 180, 240 240 M240 240 C280 270, 320 310, 380 340"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        />
                        <path d="M70 75 C60 40, 100 45, 110 70 C105 85, 80 90, 70 75 Z" fill="currentColor" />
                        <path d="M120 120 C145 95, 175 125, 150 145 C135 140, 125 130, 120 120 Z" fill="currentColor" />
                        <path d="M160 170 C140 140, 185 145, 195 175 C185 190, 168 185, 160 170 Z" fill="currentColor" />
                        <path d="M210 215 C240 190, 265 220, 245 240 C230 235, 220 225, 210 215 Z" fill="currentColor" />
                        <path d="M260 260 C240 230, 280 230, 290 260 C280 275, 268 270, 260 260 Z" fill="currentColor" />
                    </svg>
                </>
            )}

            {/* 2. Japanese Seigaiha Waves */}
            {pattern === 'seigaiha-waves' && (
                <svg
                    className="absolute inset-0 w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: motifColor, opacity: baseOpacity }}
                >
                    <defs>
                        <pattern id="seigaiha-pat" width="60" height="30" patternUnits="userSpaceOnUse">
                            <path
                                d="M0 30 A30 30 0 0 1 60 30 M6 30 A24 24 0 0 1 54 30 M12 30 A18 18 0 0 1 48 30 M18 30 A12 12 0 0 1 42 30 M24 30 A6 6 0 0 1 36 30 M30 0 A30 30 0 0 1 90 0 M-30 0 A30 30 0 0 1 30 0"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.2"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#seigaiha-pat)" />
                </svg>
            )}

            {/* 3. Japanese Asanoha Lattice */}
            {pattern === 'asanoha-lattice' && (
                <svg
                    className="absolute inset-0 w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: motifColor, opacity: baseOpacity }}
                >
                    <defs>
                        <pattern id="asanoha-pat" width="56" height="97" patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
                            <path
                                d="M28 0 L28 97 M0 48.5 L56 48.5 M0 0 L56 97 M0 97 L56 0 M28 0 L0 48.5 L28 97 L56 48.5 Z"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#asanoha-pat)" />
                </svg>
            )}

            {/* 4. Mizuhiki Ceremonial Knot */}
            {pattern === 'mizuhiki-knot' && (
                <svg
                    className="absolute top-1/4 right-0 w-80 sm:w-96 h-80 sm:h-96 -translate-y-1/2 translate-x-12"
                    viewBox="0 0 300 300"
                    fill="none"
                    style={{ color: motifColor, opacity: accentOpacity }}
                >
                    <path
                        d="M30 150 C80 60, 220 60, 270 150 C220 240, 80 240, 30 150 Z"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                    <path
                        d="M50 150 C90 80, 210 80, 250 150 C210 220, 90 220, 50 150 Z"
                        stroke="#D4AF37"
                        strokeWidth="1.5"
                    />
                    <circle cx="150" cy="150" r="45" stroke="currentColor" strokeWidth="2" />
                    <circle cx="150" cy="150" r="30" stroke="#D4AF37" strokeWidth="1.5" />
                    <path d="M105 150 C120 120, 180 120, 195 150" stroke="currentColor" strokeWidth="2" />
                </svg>
            )}

            {/* 5. Amalfi Ceramic Tiles */}
            {pattern === 'ceramic-tiles' && (
                <svg
                    className="absolute inset-0 w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: motifColor, opacity: baseOpacity }}
                >
                    <defs>
                        <pattern id="tile-pat" width="80" height="80" patternUnits="userSpaceOnUse">
                            <rect x="0" y="0" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="1" />
                            <path d="M40 0 L80 40 L40 80 L0 40 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                            <circle cx="40" cy="40" r="14" fill="none" stroke="currentColor" strokeWidth="1.2" />
                            <circle cx="40" cy="40" r="6" fill="currentColor" fillOpacity="0.4" />
                            <path d="M40 0 L40 26 M40 54 L40 80 M0 40 L26 40 M54 40 L80 40" stroke="currentColor" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#tile-pat)" />
                </svg>
            )}

            {/* 6. Constellation Map */}
            {pattern === 'constellation-map' && (
                <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 1200 800"
                    fill="none"
                    preserveAspectRatio="xMidYMid slice"
                    style={{ color: motifColor, opacity: accentOpacity }}
                >
                    {/* Constellation line segments */}
                    <path d="M150 120 L280 180 L390 140 L480 230 L410 320" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                    <path d="M780 150 L910 110 L1020 220 L960 340 L830 300 Z" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                    <path d="M220 580 L340 640 L470 590 L560 670" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                    <path d="M750 620 L860 540 L980 610 L1050 720" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                    
                    {/* Stars */}
                    <circle cx="150" cy="120" r="3.5" fill="currentColor" />
                    <circle cx="280" cy="180" r="2.5" fill="currentColor" />
                    <circle cx="390" cy="140" r="4" fill="currentColor" />
                    <circle cx="480" cy="230" r="3" fill="currentColor" />
                    <circle cx="410" cy="320" r="2.5" fill="currentColor" />
                    <circle cx="780" cy="150" r="3" fill="currentColor" />
                    <circle cx="910" cy="110" r="4" fill="currentColor" />
                    <circle cx="1020" cy="220" r="3.5" fill="currentColor" />
                    <circle cx="960" cy="340" r="2" fill="currentColor" />
                    <circle cx="830" cy="300" r="3" fill="currentColor" />

                    {/* Celestial grid circles */}
                    <circle cx="600" cy="400" r="280" stroke="currentColor" strokeWidth="0.8" strokeDasharray="6 6" />
                    <circle cx="600" cy="400" r="180" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="600" y1="100" x2="600" y2="700" stroke="currentColor" strokeWidth="0.6" strokeDasharray="4 4" />
                    <line x1="300" y1="400" x2="900" y2="400" stroke="currentColor" strokeWidth="0.6" strokeDasharray="4 4" />
                </svg>
            )}

            {/* 7. Washi Natural Paper Fibers */}
            {pattern === 'washi-fibers' && (
                <svg
                    className="absolute inset-0 w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: motifColor, opacity: baseOpacity }}
                >
                    <defs>
                        <pattern id="washi-pat" width="120" height="120" patternUnits="userSpaceOnUse">
                            <path d="M10 20 Q40 25, 70 15 T110 30" stroke="currentColor" strokeWidth="0.7" fill="none" />
                            <path d="M25 80 Q65 70, 95 90" stroke="currentColor" strokeWidth="0.6" fill="none" />
                            <path d="M50 40 Q55 65, 45 95" stroke="currentColor" strokeWidth="0.5" fill="none" />
                            <circle cx="35" cy="45" r="1" fill="currentColor" />
                            <circle cx="85" cy="65" r="1.2" fill="currentColor" />
                            <circle cx="105" cy="100" r="0.8" fill="currentColor" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#washi-pat)" />
                </svg>
            )}

            {/* 8. Airmail Chevrons & Cancellation Stamps */}
            {pattern === 'airmail-chevrons' && (
                <>
                    <svg
                        className="absolute top-12 right-12 w-48 sm:w-60 h-48 sm:h-60"
                        viewBox="0 0 200 200"
                        fill="none"
                        style={{ color: motifColor, opacity: accentOpacity }}
                    >
                        <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="2.5" />
                        <circle cx="100" cy="100" r="72" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="20" y1="85" x2="180" y2="85" stroke="currentColor" strokeWidth="1.5" />
                        <line x1="20" y1="115" x2="180" y2="115" stroke="currentColor" strokeWidth="1.5" />
                        {/* Stamp waves */}
                        <path d="M170 70 Q190 60, 210 70 T250 70" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path d="M170 90 Q190 80, 210 90 T250 90" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path d="M170 110 Q190 100, 210 110 T250 110" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                </>
            )}

            {/* 9. Vinyl Grooves */}
            {pattern === 'vinyl-grooves' && (
                <svg
                    className="absolute -bottom-24 -left-24 w-96 sm:w-[32rem] h-96 sm:h-[32rem]"
                    viewBox="0 0 500 500"
                    fill="none"
                    style={{ color: motifColor, opacity: accentOpacity }}
                >
                    <circle cx="250" cy="250" r="230" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="250" cy="250" r="200" stroke="currentColor" strokeWidth="1" />
                    <circle cx="250" cy="250" r="170" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="250" cy="250" r="140" stroke="currentColor" strokeWidth="0.8" />
                    <circle cx="250" cy="250" r="110" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="250" cy="250" r="80" stroke="currentColor" strokeWidth="2" />
                    <circle cx="250" cy="250" r="30" fill="currentColor" fillOpacity="0.2" />
                </svg>
            )}

            {/* 10. Bauhaus Modernist Shapes */}
            {pattern === 'bauhaus-shapes' && (
                <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 1000 700"
                    fill="none"
                    preserveAspectRatio="xMidYMid slice"
                    style={{ color: motifColor, opacity: accentOpacity }}
                >
                    <circle cx="180" cy="180" r="110" stroke="currentColor" strokeWidth="2" />
                    <polygon points="850,120 950,290 750,290" stroke="currentColor" strokeWidth="2" />
                    <rect x="120" y="480" width="140" height="140" stroke="currentColor" strokeWidth="2" />
                    <line x1="400" y1="50" x2="400" y2="650" stroke="currentColor" strokeWidth="1" strokeDasharray="8 8" />
                    <path d="M780 480 A100 100 0 0 1 880 580 L780 580 Z" stroke="currentColor" strokeWidth="2" />
                </svg>
            )}

            {/* 11. Soft Radiant Aura */}
            {pattern === 'soft-aura' && (
                <div
                    className="absolute inset-0"
                    style={{
                        background: `radial-gradient(circle at 80% 20%, ${motifColor}${isDark ? '20' : '15'} 0%, transparent 45%), radial-gradient(circle at 15% 75%, ${motifColor}${isDark ? '18' : '12'} 0%, transparent 40%)`,
                    }}
                />
            )}

            {/* 12. Neumorphic Glow */}
            {pattern === 'neumorphic-glow' && (
                <div
                    className="absolute inset-0"
                    style={{
                        background: `radial-gradient(circle at 50% 15%, ${motifColor}18 0%, transparent 50%), radial-gradient(circle at 50% 85%, #00000008 0%, transparent 50%)`,
                    }}
                />
            )}

            {/* 13. Mist Haze */}
            {pattern === 'mist-haze' && (
                <div
                    className="absolute inset-0 opacity-40"
                    style={{
                        backgroundImage: `linear-gradient(180deg, transparent 0%, ${motifColor}0A 30%, ${motifColor}14 60%, transparent 100%)`,
                    }}
                />
            )}

            {/* 14. Music Staves */}
            {pattern === 'music-staff' && (
                <svg
                    className="absolute inset-x-0 top-1/3 w-full h-40"
                    viewBox="0 0 1200 120"
                    fill="none"
                    style={{ color: motifColor, opacity: accentOpacity }}
                >
                    <line x1="0" y1="20" x2="1200" y2="20" stroke="currentColor" strokeWidth="1" />
                    <line x1="0" y1="40" x2="1200" y2="40" stroke="currentColor" strokeWidth="1" />
                    <line x1="0" y1="60" x2="1200" y2="60" stroke="currentColor" strokeWidth="1" />
                    <line x1="0" y1="80" x2="1200" y2="80" stroke="currentColor" strokeWidth="1" />
                    <line x1="0" y1="100" x2="1200" y2="100" stroke="currentColor" strokeWidth="1" />
                    {/* Notes */}
                    <ellipse cx="280" cy="70" rx="8" ry="6" fill="currentColor" transform="rotate(-20 280 70)" />
                    <line x1="287" y1="68" x2="287" y2="24" stroke="currentColor" strokeWidth="2" />
                    <ellipse cx="360" cy="50" rx="8" ry="6" fill="currentColor" transform="rotate(-20 360 50)" />
                    <line x1="367" y1="48" x2="367" y2="10" stroke="currentColor" strokeWidth="2" />
                    <ellipse cx="780" cy="60" rx="8" ry="6" fill="currentColor" transform="rotate(-20 780 60)" />
                    <line x1="787" y1="58" x2="787" y2="18" stroke="currentColor" strokeWidth="2" />
                    <ellipse cx="860" cy="80" rx="8" ry="6" fill="currentColor" transform="rotate(-20 860 80)" />
                    <line x1="867" y1="78" x2="867" y2="35" stroke="currentColor" strokeWidth="2" />
                </svg>
            )}

            {/* 15. Woodland Pine Cones & Branches */}
            {pattern === 'woodland-pine' && (
                <svg
                    className="absolute -top-10 right-0 w-80 sm:w-96 h-80 sm:h-96"
                    viewBox="0 0 350 350"
                    fill="none"
                    style={{ color: motifColor, opacity: accentOpacity }}
                >
                    <path d="M30 180 Q140 160, 240 100 T320 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Needles clusters */}
                    <line x1="120" y1="150" x2="100" y2="120" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="120" y1="150" x2="90" y2="135" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="120" y1="150" x2="110" y2="110" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="190" y1="120" x2="175" y2="90" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="190" y1="120" x2="160" y2="100" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="190" y1="120" x2="185" y2="80" stroke="currentColor" strokeWidth="1.5" />
                    {/* Pine cone silhouette */}
                    <path d="M140 180 C130 195, 130 220, 150 230 C170 220, 170 195, 160 180 Z" fill="currentColor" fillOpacity="0.5" />
                </svg>
            )}

            {/* 16. Citrus Blossom & Fruit */}
            {pattern === 'citrus-bloom' && (
                <svg
                    className="absolute top-1/3 -left-12 w-64 sm:w-80 h-64 sm:h-80"
                    viewBox="0 0 300 300"
                    fill="none"
                    style={{ color: motifColor, opacity: accentOpacity }}
                >
                    <circle cx="150" cy="150" r="70" stroke="currentColor" strokeWidth="2.5" />
                    <circle cx="150" cy="150" r="54" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                    {/* Slices */}
                    <line x1="150" y1="96" x2="150" y2="204" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="96" y1="150" x2="204" y2="150" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="112" y1="112" x2="188" y2="188" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="112" y1="188" x2="188" y2="112" stroke="currentColor" strokeWidth="1.5" />
                    {/* Leaves */}
                    <path d="M150 80 C140 40, 180 40, 190 70 Z" fill="currentColor" />
                    <path d="M150 80 C110 70, 120 40, 140 50 Z" fill="currentColor" />
                </svg>
            )}

            {/* 17. Terracotta Arches */}
            {pattern === 'terracotta-arches' && (
                <svg
                    className="absolute inset-0 w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: motifColor, opacity: baseOpacity }}
                >
                    <defs>
                        <pattern id="arch-pat" width="100" height="140" patternUnits="userSpaceOnUse">
                            <path
                                d="M20 140 L20 60 A30 30 0 0 1 80 60 L80 140 M28 140 L28 62 A22 22 0 0 1 72 62 L72 140"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.2"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#arch-pat)" />
                </svg>
            )}

            {/* 18. Newspaper Columns */}
            {pattern === 'newspaper-columns' && (
                <div
                    className="absolute inset-0 pointer-events-none opacity-25"
                    style={{
                        backgroundImage: `linear-gradient(90deg, transparent calc(50% - 300px), currentColor 1px, transparent calc(50% - 299px), transparent calc(50% + 299px), currentColor 1px, transparent calc(50% + 300px))`,
                        color: motifColor,
                    }}
                />
            )}

            {/* 19. Film Sprockets */}
            {pattern === 'film-sprockets' && (
                <div className="absolute inset-y-0 left-2 sm:left-4 flex flex-col justify-between py-6 opacity-30" style={{ color: motifColor }}>
                    {[...Array(16)].map((_, i) => (
                        <div key={i} className="w-3 h-2.5 rounded-[2px] border border-current bg-current/20 my-1" />
                    ))}
                </div>
            )}

            {/* 20. Cherry Blossom Petals */}
            {pattern === 'cherry-petals' && (
                <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 1000 800"
                    fill="none"
                    preserveAspectRatio="xMidYMid slice"
                    style={{ color: motifColor, opacity: accentOpacity }}
                >
                    <path d="M120 80 C110 65, 130 50, 140 70 C145 80, 130 90, 120 80 Z" fill="currentColor" />
                    <path d="M340 180 C325 170, 350 150, 360 170 C365 185, 345 195, 340 180 Z" fill="currentColor" />
                    <path d="M780 120 C770 105, 800 95, 805 115 C810 130, 790 135, 780 120 Z" fill="currentColor" />
                    <path d="M920 280 C910 265, 935 250, 945 270 C950 285, 930 295, 920 280 Z" fill="currentColor" />
                    <path d="M220 540 C205 530, 230 510, 240 530 C245 545, 225 555, 220 540 Z" fill="currentColor" />
                    <path d="M680 620 C670 605, 695 590, 705 610 C710 625, 690 635, 680 620 Z" fill="currentColor" />
                    <path d="M860 690 C845 680, 870 660, 880 680 C885 695, 865 705, 860 690 Z" fill="currentColor" />
                </svg>
            )}
        </div>
    );
}
