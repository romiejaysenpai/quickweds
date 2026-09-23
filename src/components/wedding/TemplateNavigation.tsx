'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, Image as ImageIcon, Gift, Clock, BookOpen, Send, HelpCircle, Shirt, MapPin, MoreHorizontal, X } from 'lucide-react';
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
    { id: 'faq', label: 'FAQs', icon: HelpCircle },
    { id: 'guestbook', label: 'Notes', icon: BookOpen },
];

export default function TemplateNavigation({ wedding }: TemplateNavigationProps) {
    const [activeSections, setActiveSections] = useState<string[]>([]);
    const [currentSection, setCurrentSection] = useState<string>('');
    const [isVisible, setIsVisible] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);

    useEffect(() => {
        const refreshSections = () => {
            const ids = NAV_ITEMS.filter(item => document.getElementById(item.id)).map(item => item.id);
            setActiveSections(previous => previous.join(',') === ids.join(',') ? previous : ids);
        };
        const timer = window.setTimeout(refreshSections, 0);
        const observer = new MutationObserver(refreshSections);
        const root = document.querySelector('.wedding-page');
        if (root) observer.observe(root, { childList: true, subtree: true });

        const handleScroll = () => {
            const scrollPosition = window.scrollY + window.innerHeight / 3;
            let current = '';
            let closestTop = -Infinity;
            
            // Show navigation once guests begin exploring, especially on phones.
            if (window.scrollY > 180) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }

            for (const item of NAV_ITEMS) {
                const element = document.getElementById(item.id);
                if (element) {
                    const top = element.getBoundingClientRect().top + window.scrollY;
                    if (top <= scrollPosition && top > closestTop) {
                        closestTop = top;
                        current = item.id;
                    }
                }
            }
            setCurrentSection(current);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check

        return () => {
            clearTimeout(timer);
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, [wedding.template, wedding.template_style]);

    if (activeSections.length === 0) return null;

    const itemsToShow = NAV_ITEMS.filter(item => activeSections.includes(item.id));

    const scrollTo = (id: string) => {
        setMoreOpen(false);
        const element = document.getElementById(id);
        if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
            });
        }
    };

    const motifColor = wedding.motif_color || 'var(--primary)';
    const visual = getTemplateVisualProfile(wedding.template || 'classic', motifColor, false, wedding.card_style);
    const isDark = visual.isDark;
    const primaryItems = ['details', activeSections.includes('venue') ? 'venue' : 'reception-venue', 'rsvp'];
    const overflowItems = itemsToShow.filter(item => !primaryItems.includes(item.id));

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    className="fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center justify-center sm:inset-x-6 sm:bottom-6 sm:px-0 sm:pb-0"
                    style={{
                        paddingLeft: 'max(0.5rem, var(--safe-area-inset-left))',
                        paddingRight: 'max(0.5rem, var(--safe-area-inset-right))',
                        paddingBottom: 'max(0.6rem, var(--safe-area-inset-bottom))',
                    }}
                >
                    {moreOpen && overflowItems.length > 0 && (
                        <div onKeyDown={event => { if (event.key === 'Escape') { setMoreOpen(false); document.getElementById('wedding-navigation-toggle')?.focus(); } }} id="wedding-navigation-more" className={`mb-2 grid w-full max-w-md grid-cols-2 gap-1 rounded-2xl border p-2 shadow-lg ${isDark ? 'border-white/15 bg-[#18181b] text-white' : 'border-black/10 bg-white text-[#292524]'}`}>
                            {overflowItems.map(item => (
                                <button key={item.id} type="button" onClick={() => scrollTo(item.id)} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2" aria-current={currentSection === item.id ? 'location' : undefined}>
                                    <item.icon className="h-4 w-4" aria-hidden="true" />{item.label}
                                </button>
                            ))}
                        </div>
                    )}
                    <nav aria-label="Wedding page sections" className={`flex w-full max-w-md items-center justify-evenly rounded-2xl border p-1 shadow-lg backdrop-blur-xl ${isDark ? 'border-white/15 bg-[#18181b]/95 text-white' : 'border-black/10 bg-white/95 text-[#292524]'}`}>
                        {primaryItems.map(id => itemsToShow.find(item => item.id === id)).filter((item): item is typeof NAV_ITEMS[number] => Boolean(item)).map(item => (
                            <button key={item.id} type="button" onClick={() => scrollTo(item.id)} aria-current={currentSection === item.id ? 'location' : undefined} className={`flex min-h-14 min-w-16 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${currentSection === item.id ? (isDark ? 'bg-white/15' : 'bg-black/5') : ''}`}>
                                <item.icon className="h-4 w-4" aria-hidden="true" />{item.label}
                            </button>
                        ))}
                        {overflowItems.length > 0 && (
                            <button id="wedding-navigation-toggle" type="button" aria-expanded={moreOpen} aria-controls="wedding-navigation-more" onClick={() => setMoreOpen(open => !open)} onKeyDown={event => { if (event.key === 'Escape') setMoreOpen(false); }} className="flex min-h-14 min-w-16 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 text-xs font-medium focus-visible:outline-2 focus-visible:outline-offset-2">
                                {moreOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <MoreHorizontal className="h-4 w-4" aria-hidden="true" />}More
                            </button>
                        )}
                    </nav>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
