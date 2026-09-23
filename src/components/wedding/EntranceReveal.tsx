'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getTemplateVisualProfile } from '@/lib/theme-engine';

interface EntranceRevealProps {
    weddingId: string;
    initials: string;
    motifColor: string;
    coupleNames: string;
    weddingDate: string;
    venueName?: string;
    heroImage?: string;
    template?: string;
}

export default function EntranceReveal({ weddingId, initials, motifColor, coupleNames, weddingDate, venueName, template }: EntranceRevealProps) {
    const reduceMotion = useReducedMotion();
    const [isVisible, setIsVisible] = useState(false);
    const visual = getTemplateVisualProfile(template, motifColor);
    useEffect(() => {
        if (reduceMotion) return;
        const key = `quickweds_entrance_seen_${weddingId}`;
        let seen = false;
        try { seen = Boolean(sessionStorage.getItem(key)); } catch { /* Private browsers can disable storage. */ }
        if (seen) return;
        const show = window.setTimeout(() => setIsVisible(true), 0);
        const hide = window.setTimeout(() => {
            try { sessionStorage.setItem(key, '1'); } catch { /* The page still opens. */ }
            setIsVisible(false);
        }, 1700);
        return () => { window.clearTimeout(show); window.clearTimeout(hide); };
    }, [weddingId, reduceMotion]);
    const dismiss = () => {
        try { sessionStorage.setItem(`quickweds_entrance_seen_${weddingId}`, '1'); } catch { /* Optional memory only. */ }
        setIsVisible(false);
        window.dispatchEvent(new Event('quickweds:start-background-music'));
    };
    const date = weddingDate ? new Date(`${weddingDate.slice(0, 10)}T12:00:00`).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : '';
    return <AnimatePresence>{isVisible && <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .35 }} className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto px-6 py-10 ${visual.isDark ? 'bg-[#151315] text-[#FFF8F0]' : 'bg-[#FBF8F2] text-[#352C2C]'}`}>
        <div className="my-auto w-full max-w-lg border-y border-current/20 py-10 text-center">
            <p className="text-xs uppercase tracking-[.22em]">You are warmly invited</p>
            <p className="my-6 font-serif text-3xl tracking-[.15em]" style={{ color: motifColor }}>{initials}</p>
            <p className="break-words font-serif text-4xl leading-tight sm:text-5xl">{coupleNames}</p>
            <p className="mt-6 text-base">{date}</p>
            {venueName && <p className="mt-2 text-sm opacity-80">{venueName}</p>}
            <button type="button" onClick={dismiss} className="mt-8 min-h-11 border border-current/30 px-6 py-2 text-sm">Open invitation</button>
        </div>
    </motion.div>}</AnimatePresence>;
}
