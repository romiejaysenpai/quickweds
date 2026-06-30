'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, Image as ImageIcon, Gift, Clock, BookOpen, Send, HelpCircle, Shirt, MapPin } from 'lucide-react';
import type { Wedding } from '@/types/wedding';

interface TemplateNavigationProps {
    wedding: Wedding;
}

const NAV_ITEMS = [
    { id: 'details', label: 'Details', icon: Calendar },
    { id: 'rsvp', label: 'RSVP', icon: Send },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'venue', label: 'Venue', icon: MapPin },
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

    useEffect(() => {
        // Wait a brief moment to ensure all components are mounted before finding sections
        const timer = setTimeout(() => {
            const existing = NAV_ITEMS.filter(item => document.getElementById(item.id));
            setActiveSections(existing.map(item => item.id));
        }, 1000);

        const handleScroll = () => {
            const scrollPosition = window.scrollY + window.innerHeight / 3;
            let current = '';
            
            // Show navigation once guests begin exploring, especially on phones.
            if (window.scrollY > 180) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }

            for (const item of NAV_ITEMS) {
                const element = document.getElementById(item.id);
                if (element && element.offsetTop <= scrollPosition) {
                    current = item.id;
                }
            }
            setCurrentSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check

        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    if (activeSections.length === 0) return null;

    const itemsToShow = NAV_ITEMS.filter(item => activeSections.includes(item.id));

    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const motifColor = wedding.motif_color || 'var(--primary)';
    const isDark = ['midnight', 'royal', 'urban', 'glitch', 'film', 'artdeco', 'cinematic'].includes(wedding.template?.toLowerCase() || '');

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    className="fixed inset-x-0 bottom-0 z-[100] flex justify-center sm:inset-x-6 sm:bottom-6 sm:px-0 sm:pb-0"
                    style={{
                        paddingLeft: 'max(0.5rem, var(--safe-area-inset-left))',
                        paddingRight: 'max(0.5rem, var(--safe-area-inset-right))',
                        paddingBottom: 'max(0.6rem, var(--safe-area-inset-bottom))',
                    }}
                >
                    {/* Floating Dock Navigation */}
                    <nav
                        aria-label="Wedding page sections"
                        className={`no-scrollbar flex w-full max-w-[calc(100vw-1rem)] snap-x items-center justify-start gap-1 overflow-x-auto overscroll-x-contain rounded-[1.35rem] border p-1 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all sm:w-auto sm:max-w-[calc(100vw-3rem)] sm:justify-center sm:gap-2 sm:rounded-[2rem] sm:p-1.5 ${
                            isDark ? 'bg-black/80 border-white/10' : 'bg-white/85 border-black/5'
                        }`}
                        style={{ borderColor: isDark ? `${motifColor}20` : `${motifColor}40` }}
                    >
                        {itemsToShow.map((item) => {
                            const isActive = currentSection === item.id;
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    aria-label={`Go to ${item.label}`}
                                    aria-current={isActive ? 'location' : undefined}
                                    title={item.label}
                                    onClick={() => scrollTo(item.id)}
                                    className={`group relative flex h-11 w-11 shrink-0 snap-center items-center justify-center rounded-[1.05rem] p-0 text-center transition-colors duration-200 sm:h-12 sm:w-auto sm:min-w-[4.8rem] sm:gap-1.5 sm:rounded-[1.5rem] sm:px-4 sm:py-2 ${
                                        isActive 
                                            ? 'text-white shadow-md ring-1 ring-white/30' 
                                            : isDark ? 'text-white/72 hover:text-white hover:bg-white/5' : 'text-foreground/72 hover:text-foreground hover:bg-black/5'
                                    }`}
                                    style={isActive ? { backgroundColor: motifColor, boxShadow: `0 4px 15px ${motifColor}40` } : {}}
                                >
                                    <Icon className={`h-4.5 w-4.5 sm:h-5 sm:w-5 ${isActive ? 'fill-current opacity-25' : ''}`} />
                                    <span className="hidden max-w-[4.5rem] truncate text-[10px] font-black uppercase tracking-[0.12em] sm:block">
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </nav>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
