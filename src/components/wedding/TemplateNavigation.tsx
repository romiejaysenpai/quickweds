'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart,
    Calendar,
    Image as ImageIcon,
    Camera,
    Gift,
    Clock,
    BookOpen,
    Send,
    HelpCircle,
    Shirt,
    MapPin,
    MoreHorizontal,
    X,
    ChevronDown,
} from 'lucide-react';
import { getTemplateVisualProfile } from '@/lib/theme-engine';
import type { Wedding } from '@/types/wedding';

interface TemplateNavigationProps {
    wedding: Wedding;
}

const NAV_ITEMS = [
    { id: 'details', label: 'Details', icon: Calendar },
    { id: 'rsvp', label: 'RSVP', icon: Send },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'venue', label: 'Directions', icon: MapPin },
    { id: 'reception-venue', label: 'Reception', icon: MapPin },
    { id: 'entourage', label: 'Wedding Party', icon: Heart },
    { id: 'attire', label: 'Attire', icon: Shirt },
    { id: 'gift', label: 'Registry', icon: Gift },
    { id: 'bio', label: 'Story', icon: Heart },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'memories', label: 'Memories', icon: Camera },
    { id: 'faq', label: 'FAQs', icon: HelpCircle },
    { id: 'guestbook', label: 'Notes', icon: BookOpen },
];

const DESKTOP_PRIORITY_ORDER = [
    'bio',
    'details',
    'timeline',
    'gallery',
    'attire',
    'entourage',
    'venue',
    'reception-venue',
    'gift',
    'faq',
    'guestbook',
    'memories',
];

const LIGHT_BACKGROUND_STYLES = new Set(['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen']);

export default function TemplateNavigation({ wedding }: TemplateNavigationProps) {
    const [activeSections, setActiveSections] = useState<string[]>([]);
    const [currentSection, setCurrentSection] = useState<string>('');
    const [isVisible, setIsVisible] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [moreOpen, setMoreOpen] = useState(false);
    const [desktopMoreOpen, setDesktopMoreOpen] = useState(false);
    const desktopMoreRef = useRef<HTMLDivElement>(null);
    const mobileNavRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let debounceTimer: number | null = null;
        let rafId: number | null = null;

        const refreshSections = () => {
            const ids = NAV_ITEMS.filter((item) => document.getElementById(item.id)).map((item) => item.id);
            setActiveSections((previous) => (previous.join(',') === ids.join(',') ? previous : ids));
        };

        const scheduleRefresh = () => {
            if (debounceTimer !== null) window.clearTimeout(debounceTimer);
            debounceTimer = window.setTimeout(refreshSections, 120);
        };

        const initialTimer = window.setTimeout(refreshSections, 0);
        const observer = new MutationObserver(scheduleRefresh);
        const root = document.querySelector('.wedding-page');
        if (root) observer.observe(root, { childList: true, subtree: true });

        const measureScroll = () => {
            rafId = null;
            const y = window.scrollY;
            const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
            setScrollProgress(Math.min(100, Math.max(0, (y / maxScroll) * 100)));

            const scrollPosition = y + window.innerHeight / 3;
            let current = '';
            let closestTop = -Infinity;

            if (y > 180) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
                setDesktopMoreOpen(false);
                setMoreOpen(false);
            }

            for (const item of NAV_ITEMS) {
                const element = document.getElementById(item.id);
                if (element) {
                    const top = element.getBoundingClientRect().top + y;
                    if (top <= scrollPosition && top > closestTop) {
                        closestTop = top;
                        current = item.id;
                    }
                }
            }
            setCurrentSection((prev) => (prev === current ? prev : current));
        };

        const handleScroll = () => {
            if (rafId === null) {
                rafId = window.requestAnimationFrame(measureScroll);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        measureScroll();

        return () => {
            window.clearTimeout(initialTimer);
            if (debounceTimer !== null) window.clearTimeout(debounceTimer);
            if (rafId !== null) window.cancelAnimationFrame(rafId);
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, [wedding.template, wedding.template_style]);

    useEffect(() => {
        if (!desktopMoreOpen && !moreOpen) return;
        const handleOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (desktopMoreOpen && desktopMoreRef.current && !desktopMoreRef.current.contains(target)) {
                setDesktopMoreOpen(false);
            }
            if (moreOpen && mobileNavRef.current && !mobileNavRef.current.contains(target)) {
                setMoreOpen(false);
            }
        };
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setDesktopMoreOpen(false);
                setMoreOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleOutside);
            document.removeEventListener('keydown', handleKey);
        };
    }, [desktopMoreOpen, moreOpen]);

    if (activeSections.length === 0) return null;

    const itemsToShow = NAV_ITEMS.filter((item) => activeSections.includes(item.id));

    const scrollTo = (id: string) => {
        setMoreOpen(false);
        setDesktopMoreOpen(false);
        const element = document.getElementById(id);
        if (element) {
            const offset = window.innerWidth >= 768 ? 88 : 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
            });
        }
    };

    const scrollToTop = () => {
        setMoreOpen(false);
        setDesktopMoreOpen(false);
        window.scrollTo({
            top: 0,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        });
    };

    const motifColor = wedding.motif_color || 'var(--primary)';
    const visual = getTemplateVisualProfile(wedding.template || 'classic', motifColor, false, wedding.card_style);
    const hasLightBgOverride = Boolean(wedding.background_style && LIGHT_BACKGROUND_STYLES.has(wedding.background_style));
    const isDark = visual.isDark && !hasLightBgOverride && wedding.template_style !== 'luxury-planner' && wedding.template !== 'luxury-planner';
    const isSharp = visual.isSharp;

    // Mobile primary dock items (preserves Details, Directions/Reception, RSVP, More)
    const primaryItems = ['details', activeSections.includes('venue') ? 'venue' : 'reception-venue', 'rsvp'];
    const overflowItems = itemsToShow.filter((item) => !primaryItems.includes(item.id));

    // Desktop editorial bar items (excludes RSVP because RSVP gets the right-hand primary CTA)
    const hasRsvp = activeSections.includes('rsvp');
    const desktopActionId = hasRsvp ? 'rsvp' : activeSections.includes('memories') ? 'memories' : 'details';
    const desktopActionLabel = hasRsvp ? 'RSVP' : activeSections.includes('memories') ? 'Memories' : 'Details';
    const desktopOrdered = DESKTOP_PRIORITY_ORDER
        .filter((id) => id !== desktopActionId && activeSections.includes(id))
        .map((id) => itemsToShow.find((item) => item.id === id))
        .filter((item): item is (typeof NAV_ITEMS)[number] => Boolean(item));
    const desktopInline = desktopOrdered.slice(0, 5);
    const desktopOverflow = desktopOrdered.slice(5);

    const brideFirst = wedding.bride_name?.trim().split(/\s+/)[0] || '';
    const groomFirst = wedding.groom_name?.trim().split(/\s+/)[0] || '';
    const coupleShortLabel = brideFirst && groomFirst ? `${brideFirst} & ${groomFirst}` : wedding.bride_name || 'Our Wedding';

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.header
                    key="wedding-desktop-nav"
                    initial={{ y: -72, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -72, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-x-0 top-0 z-[90] hidden px-6 pt-3.5 md:flex md:justify-center"
                >
                    <nav
                        data-wedding-navigation="true"
                        aria-label="Wedding page sections"
                        className={`relative flex w-full max-w-5xl items-center justify-between gap-4 overflow-visible border px-6 py-2.5 shadow-[0_14px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl ${
                            isSharp ? 'rounded-none' : 'rounded-full'
                        } ${
                            isDark
                                ? 'border-white/15 bg-[#121114]/88 text-[#F5EFE6]'
                                : 'border-black/10 bg-[#FFFDFB]/90 text-[#2E2726]'
                        }`}
                    >
                        <div
                            aria-hidden="true"
                            className={`pointer-events-none absolute inset-x-6 bottom-0 h-[1.5px] overflow-hidden ${isSharp ? 'inset-x-0' : ''}`}
                        >
                            <div
                                className="h-full transition-[width] duration-150 ease-out"
                                style={{ width: `${scrollProgress}%`, backgroundColor: motifColor, opacity: 0.65 }}
                            />
                        </div>
                            <button
                                type="button"
                                onClick={scrollToTop}
                                className="shrink-0 truncate font-serif text-base tracking-tight transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4"
                            >
                                {coupleShortLabel}
                            </button>

                            <div className="flex items-center gap-1 lg:gap-2">
                                {desktopInline.map((item) => {
                                    const active = currentSection === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            data-wedding-control="navigation"
                                            type="button"
                                            onClick={() => scrollTo(item.id)}
                                            aria-current={active ? 'location' : undefined}
                                            className={`relative min-h-10 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.2em] transition-opacity ${
                                                isSharp ? 'rounded-none' : 'rounded-full'
                                            } ${active ? 'opacity-100' : 'opacity-65 hover:opacity-100'}`}
                                        >
                                            {item.label}
                                            {active && (
                                                <span
                                                    aria-hidden="true"
                                                    className="absolute inset-x-3 bottom-1 h-px"
                                                    style={{ backgroundColor: motifColor }}
                                                />
                                            )}
                                        </button>
                                    );
                                })}

                                {desktopOverflow.length > 0 && (
                                    <div ref={desktopMoreRef} className="relative">
                                        <button
                                            data-wedding-control="navigation"
                                            type="button"
                                            aria-expanded={desktopMoreOpen}
                                            onClick={() => setDesktopMoreOpen((open) => !open)}
                                            className={`inline-flex min-h-10 items-center gap-1 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.2em] opacity-70 transition-opacity hover:opacity-100 ${
                                                isSharp ? 'rounded-none' : 'rounded-full'
                                            }`}
                                        >
                                            More
                                            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${desktopMoreOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                                        </button>
                                        {desktopMoreOpen && (
                                            <div
                                                data-wedding-navigation="true"
                                                className={`absolute right-0 top-full mt-2.5 min-w-[11rem] border p-1.5 shadow-xl backdrop-blur-xl ${
                                                    isSharp ? 'rounded-none' : 'rounded-2xl'
                                                } ${
                                                    isDark
                                                        ? 'border-white/15 bg-[#161519]/95 text-[#F5EFE6]'
                                                        : 'border-black/10 bg-[#FFFDFB]/95 text-[#2E2726]'
                                                }`}
                                            >
                                                {desktopOverflow.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        data-wedding-control="navigation"
                                                        type="button"
                                                        onClick={() => scrollTo(item.id)}
                                                        aria-current={currentSection === item.id ? 'location' : undefined}
                                                        className={`flex min-h-10 w-full items-center justify-between px-3.5 text-left text-[11px] font-medium uppercase tracking-[0.18em] transition-colors ${
                                                            isSharp ? 'rounded-none' : 'rounded-xl'
                                                        } ${
                                                            isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
                                                        }`}
                                                    >
                                                        {item.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <button
                                data-wedding-control="primary"
                                type="button"
                                onClick={() => scrollTo(desktopActionId)}
                                className={`shrink-0 inline-flex min-h-10 items-center justify-center px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-all hover:opacity-90 ${
                                    isSharp ? 'rounded-none' : 'rounded-full'
                                }`}
                                style={{ backgroundColor: motifColor }}
                            >
                                {desktopActionLabel}
                            </button>
                    </nav>
                </motion.header>
            )}

            {isVisible && (
                /* Mobile Floating Bottom Navigation */
                <motion.div
                    key="wedding-mobile-nav"
                    ref={mobileNavRef}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', bounce: 0.18, duration: 0.55 }}
                    className="fixed inset-x-0 bottom-0 z-[90] flex flex-col items-center justify-center md:hidden"
                    style={{
                        paddingLeft: 'max(0.75rem, var(--safe-area-inset-left))',
                        paddingRight: 'max(0.75rem, var(--safe-area-inset-right))',
                        paddingBottom: 'max(0.65rem, var(--safe-area-inset-bottom))',
                    }}
                >
                        {moreOpen && overflowItems.length > 0 && (
                            <div
                                data-wedding-navigation="true"
                                onKeyDown={(event) => {
                                    if (event.key === 'Escape') {
                                        setMoreOpen(false);
                                        document.getElementById('wedding-navigation-toggle')?.focus();
                                    }
                                }}
                                id="wedding-navigation-more"
                                className={`mb-2 grid w-full max-w-md grid-cols-2 gap-1 border p-2 shadow-xl backdrop-blur-xl ${
                                    isSharp ? 'rounded-none' : 'rounded-2xl'
                                } ${
                                    isDark
                                        ? 'border-white/15 bg-[#151418]/95 text-[#F5EFE6]'
                                        : 'border-black/10 bg-[#FFFDFB]/95 text-[#2E2726]'
                                }`}
                            >
                                {overflowItems.map((item) => (
                                    <button
                                        data-wedding-control="navigation"
                                        key={item.id}
                                        type="button"
                                        onClick={() => scrollTo(item.id)}
                                        className={`flex min-h-11 items-center gap-3 px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                                            isSharp ? 'rounded-none' : 'rounded-xl'
                                        } ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                                        aria-current={currentSection === item.id ? 'location' : undefined}
                                    >
                                        <item.icon className="h-4 w-4 opacity-75" aria-hidden="true" />
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        )}
                        <nav
                            data-wedding-navigation="true"
                            aria-label="Wedding page sections"
                            className={`flex w-full max-w-md items-center justify-evenly border p-1 shadow-[0_14px_38px_rgba(0,0,0,0.14)] backdrop-blur-xl ${
                                isSharp ? 'rounded-none' : 'rounded-2xl'
                            } ${
                                isDark
                                    ? 'border-white/15 bg-[#151418]/92 text-[#F5EFE6]'
                                    : 'border-black/10 bg-[#FFFDFB]/92 text-[#2E2726]'
                            }`}
                        >
                            {primaryItems
                                .map((id) => itemsToShow.find((item) => item.id === id))
                                .filter((item): item is (typeof NAV_ITEMS)[number] => Boolean(item))
                                .map((item) => {
                                    const active = currentSection === item.id;
                                    return (
                                        <button
                                            data-wedding-control="navigation"
                                            key={item.id}
                                            type="button"
                                            onClick={() => scrollTo(item.id)}
                                            aria-current={active ? 'location' : undefined}
                                            className={`relative flex min-h-14 min-w-16 flex-1 flex-col items-center justify-center gap-1 px-2 text-[11px] font-medium tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                                                isSharp ? 'rounded-none' : 'rounded-xl'
                                            } ${active ? (isDark ? 'bg-white/12' : 'bg-black/[0.05]') : 'opacity-75'}`}
                                        >
                                            <item.icon className="h-4 w-4" aria-hidden="true" />
                                            {item.label}
                                            {active && (
                                                <span
                                                    aria-hidden="true"
                                                    className="absolute bottom-1 h-0.5 w-5 rounded-full"
                                                    style={{ backgroundColor: motifColor }}
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            {overflowItems.length > 0 && (
                                <button
                                    data-wedding-control="navigation"
                                    id="wedding-navigation-toggle"
                                    type="button"
                                    aria-expanded={moreOpen}
                                    aria-controls="wedding-navigation-more"
                                    onClick={() => setMoreOpen((open) => !open)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Escape') setMoreOpen(false);
                                    }}
                                    className={`flex min-h-14 min-w-16 flex-1 flex-col items-center justify-center gap-1 px-2 text-[11px] font-medium tracking-wide opacity-75 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                                        isSharp ? 'rounded-none' : 'rounded-xl'
                                    }`}
                                >
                                    {moreOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <MoreHorizontal className="h-4 w-4" aria-hidden="true" />}
                                    More
                                </button>
                            )}
                        </nav>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
