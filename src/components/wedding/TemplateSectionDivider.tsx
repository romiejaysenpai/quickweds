'use client';

interface TemplateSectionDividerProps {
    template?: string;
    style?: string;
    motifColor?: string;
    className?: string;
    inverted?: boolean;
}

export default function TemplateSectionDivider({
    template,
    style,
    motifColor = '#D16C78',
    className = '',
}: TemplateSectionDividerProps) {
    const activeTemplate = style || template || 'classic';
    const t = activeTemplate.toLowerCase();

    // 1. Vintage — Postal airmail dashes & vintage stamp serration
    if (t === 'vintage') {
        return (
            <div className={`template-divider template-divider-vintage py-8 flex flex-col items-center justify-center gap-2 overflow-hidden ${className}`}>
                <div className="flex items-center gap-3 w-full max-w-md px-6">
                    <div className="h-px flex-1 border-t-2 border-dashed border-[#8B6B4D]/35" />
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded border border-[#8B6B4D]/40 bg-[#FBF7F0] text-[10px] uppercase font-mono tracking-widest text-[#8B6B4D]">
                        <span>AIR MAIL</span>
                        <span>✦</span>
                        <span>POST</span>
                    </div>
                    <div className="h-px flex-1 border-t-2 border-dashed border-[#8B6B4D]/35" />
                </div>
            </div>
        );
    }

    // 2. Film — 35mm film strip sprocket perforations
    if (t === 'film') {
        return (
            <div className={`template-divider template-divider-film py-6 flex items-center justify-center overflow-hidden ${className}`}>
                <div className="w-full max-w-xl mx-auto flex items-center justify-between gap-2 px-6 py-2 bg-black/80 border-y border-white/10">
                    <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/40">35MM EXPOSURE</span>
                    <div className="flex gap-2.5">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-3 h-2 rounded-[2px] bg-white/20 border border-white/30" />
                        ))}
                    </div>
                    <span className="text-[9px] font-mono text-amber-400/60 tracking-widest">ISO 400</span>
                </div>
            </div>
        );
    }

    // 3. Glitch — Cyberpunk / Terminal ASCII divider
    if (t === 'glitch') {
        return (
            <div className={`template-divider template-divider-glitch py-8 flex items-center justify-center font-mono text-xs overflow-hidden ${className}`}>
                <div className="w-full max-w-lg px-6 flex items-center justify-center gap-3 text-cyan-400/70">
                    <span className="opacity-40">{'///'}</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
                    <span className="text-[10px] tracking-[0.4em] uppercase bg-black/80 px-2 py-0.5 border border-cyan-400/30 text-cyan-300">
                        {'DATA_SEQ // LINK'}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
                    <span className="opacity-40">{'\\\\\\'}</span>
                </div>
            </div>
        );
    }

    // 3b. Urban — Industrial hazard accent & VIP divider
    if (t === 'urban') {
        return (
            <div className={`template-divider template-divider-urban py-8 flex items-center justify-center font-mono text-xs overflow-hidden ${className}`}>
                <div className="w-full max-w-lg px-6 flex items-center justify-center gap-3 text-red-500/70">
                    <span className="opacity-40">{'//'}</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#FF4D5A]/50 to-transparent" />
                    <span className="text-[10px] tracking-[0.35em] uppercase bg-white/5 px-3 py-1 border border-white/20 text-white font-mono">
                        {'SECTION // BREAK'}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#FF4D5A]/50 to-transparent" />
                    <span className="opacity-40">{'//'}</span>
                </div>
            </div>
        );
    }

    // 4. Tropical & Riviera — Gentle sea wave curve
    if (t === 'tropical' || t === 'riviera') {
        return (
            <div className={`template-divider template-divider-wave py-6 flex justify-center items-center overflow-hidden opacity-60 ${className}`}>
                <svg
                    viewBox="0 0 1200 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full max-w-2xl h-8 text-current"
                    style={{ color: motifColor }}
                >
                    <path
                        d="M0 24C150 40 300 8 450 24C600 40 750 8 900 24C1050 40 1150 16 1200 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <path
                        d="M0 32C150 48 300 16 450 32C600 48 750 16 900 32C1050 48 1150 24 1200 32"
                        stroke="currentColor"
                        strokeWidth="0.75"
                        strokeOpacity="0.4"
                        strokeLinecap="round"
                    />
                </svg>
            </div>
        );
    }

    // 5. Sakura — Cherry blossom petal motif
    if (t === 'sakura') {
        return (
            <div className={`template-divider template-divider-sakura py-8 flex items-center justify-center ${className}`}>
                <div className="flex items-center gap-4 w-full max-w-md px-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-pink-300/60" />
                    <div className="flex items-center gap-2 text-pink-400">
                        <span className="text-sm">🌸</span>
                        <span className="text-xs opacity-60">❀</span>
                        <span className="text-sm">🌸</span>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-pink-300/60" />
                </div>
            </div>
        );
    }

    // 6. Royal, Luxury, ArtDeco — Gold stepped diamond filigree
    if (t === 'royal' || t === 'luxury' || t === 'artdeco') {
        return (
            <div className={`template-divider template-divider-luxury py-8 flex items-center justify-center ${className}`}>
                <div className="flex items-center gap-4 w-full max-w-lg px-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-[#D4AF37]" />
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rotate-45 bg-[#D4AF37]/60" />
                        <div className="w-2.5 h-2.5 rotate-45 border border-[#D4AF37] bg-[#D4AF37]/20 shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
                        <div className="w-1.5 h-1.5 rotate-45 bg-[#D4AF37]/60" />
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#D4AF37]/50 to-[#D4AF37]" />
                </div>
            </div>
        );
    }

    // 7. Garden & Boho — Botanical leaf vine flourish
    if (t === 'garden' || t === 'boho') {
        return (
            <div className={`template-divider template-divider-botanical py-8 flex items-center justify-center ${className}`}>
                <div className="flex items-center gap-4 w-full max-w-md px-6 opacity-70" style={{ color: motifColor }}>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-current" />
                    <svg viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-6 text-current stroke-current">
                        <path d="M4 12C12 6 20 18 24 12C28 6 36 18 44 12" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M16 9C17 6 21 7 20 10C19 13 15 12 16 9Z" fill="currentColor" fillOpacity="0.25" />
                        <path d="M32 15C31 18 27 17 28 14C29 11 33 12 32 15Z" fill="currentColor" fillOpacity="0.25" />
                    </svg>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-current" />
                </div>
            </div>
        );
    }

    // 8. Rustic — Twine rope style with amber warmth
    if (t === 'rustic') {
        return (
            <div className={`template-divider template-divider-rustic py-8 flex items-center justify-center ${className}`}>
                <div className="flex items-center gap-4 w-full max-w-md px-6 text-[#8C6D4F]">
                    <div className="h-px flex-1 border-t border-dotted border-[#8C6D4F]/50" />
                    <div className="flex items-center gap-1.5 opacity-80">
                        <span className="text-xs">✦</span>
                        <span className="w-2 h-2 rounded-full border border-[#8C6D4F] bg-[#8C6D4F]/20" />
                        <span className="text-xs">✦</span>
                    </div>
                    <div className="h-px flex-1 border-t border-dotted border-[#8C6D4F]/50" />
                </div>
            </div>
        );
    }

    // 9. Midnight & Celestial — Constellation starlight
    if (t === 'midnight' || t === 'celestial') {
        return (
            <div className={`template-divider template-divider-celestial py-8 flex items-center justify-center ${className}`}>
                <div className="flex items-center gap-4 w-full max-w-md px-6 text-amber-200/70">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-200/30 to-amber-200/60" />
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] opacity-60">✦</span>
                        <span className="text-xs">✧</span>
                        <span className="text-sm text-amber-100">✦</span>
                        <span className="text-xs">✧</span>
                        <span className="text-[10px] opacity-60">✦</span>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-200/30 to-amber-200/60" />
                </div>
            </div>
        );
    }

    // 10. Whimsical — Fairy tale sparkle dust
    if (t === 'whimsical') {
        return (
            <div className={`template-divider template-divider-whimsical py-8 flex items-center justify-center ${className}`}>
                <div className="flex items-center gap-3 w-full max-w-sm px-6 opacity-80" style={{ color: motifColor }}>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-current" />
                    <span className="text-xs">✨</span>
                    <span className="text-[10px] opacity-50">✦</span>
                    <span className="text-xs">✨</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-current" />
                </div>
            </div>
        );
    }

    // 11. Vogue & Editorial — Haute couture issue rule
    if (t === 'vogue' || t === 'editorial') {
        return (
            <div className={`template-divider template-divider-editorial py-8 flex items-center justify-center ${className}`}>
                <div className="flex items-center gap-4 w-full max-w-md px-6 opacity-40">
                    <div className="h-px flex-1 bg-current" />
                    <span className="text-[9px] font-mono uppercase tracking-[0.4em]">{'ISSUE // EDIT'}</span>
                    <div className="h-px flex-1 bg-current" />
                </div>
            </div>
        );
    }

    // 12. Minimal & Nordic — Architectural hairline
    if (t === 'minimal' || t === 'nordic') {
        return (
            <div className={`template-divider template-divider-minimal py-8 flex items-center justify-center ${className}`}>
                <div className="flex items-center justify-center gap-3 w-full max-w-xs px-6 opacity-25">
                    <div className="w-12 h-px bg-current" />
                    <span className="text-[8px] font-mono tracking-widest uppercase">§</span>
                    <div className="w-12 h-px bg-current" />
                </div>
            </div>
        );
    }

    // Default — Elegant classic fade diamond
    return (
        <div className={`template-divider template-divider-classic py-8 flex items-center justify-center ${className}`}>
            <div className="flex items-center gap-3 w-full max-w-md px-6 opacity-60" style={{ color: motifColor }}>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-current" />
                <div className="w-1.5 h-1.5 rotate-45 border border-current bg-current/20" />
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-current" />
            </div>
        </div>
    );
}
