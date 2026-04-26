'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, Image as ImageIcon, Gift, Clock, BookOpen, Send, Menu, X } from 'lucide-react';
import type { Wedding } from '@/types/wedding';

interface TemplateNavigationProps {
    wedding: Wedding;
}

const NAV_ITEMS = [
    { id: 'bio', label: 'Story', icon: Heart },
    { id: 'details', label: 'Details', icon: Calendar },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'gift', label: 'Registry', icon: Gift },
    { id: 'rsvp', label: 'RSVP', icon: Send },
    { id: 'guestbook', label: 'Notes', icon: BookOpen },
];

export default function TemplateNavigation({ wedding }: TemplateNavigationProps) {
    const [activeSections, setActiveSections] = useState<string[]>([]);
    const [currentSection, setCurrentSection] = useState<string>('');
    const [isOpen, setIsOpen] = useState(false);
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
            
            // Show navigation only when scrolled past the hero section (approx 500px)
            if (window.scrollY > 500) {
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
            setIsOpen(false);
        }
    };

    const motifColor = wedding.motif_color || 'var(--primary)';

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2"
                >
                    {/* Floating Dock Navigation */}
                    <nav
                        className="flex items-center gap-1 sm:gap-2 rounded-[2rem] border bg-white/85 p-1.5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all"
                        style={{ borderColor: `${motifColor}40` }}
                    >
                        {itemsToShow.map((item) => {
                            const isActive = currentSection === item.id;
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => scrollTo(item.id)}
                                    className={`group relative flex flex-col items-center justify-center gap-1 rounded-[1.5rem] px-4 py-2 sm:px-5 sm:py-2.5 transition-all duration-300 ${
                                        isActive 
                                            ? 'text-white scale-105 shadow-md' 
                                            : 'text-foreground/60 hover:text-foreground hover:bg-black/5'
                                    }`}
                                    style={isActive ? { backgroundColor: motifColor, boxShadow: `0 4px 15px ${motifColor}40` } : {}}
                                >
                                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${isActive ? 'fill-current opacity-20' : ''}`} />
                                    
                                    {/* Absolute tooltip for label, visible only when active or hovered on desktop */}
                                    <span className={`absolute -top-10 left-1/2 -translate-x-1/2 rounded-lg bg-black/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all pointer-events-none whitespace-nowrap
                                        ${isActive ? 'opacity-100 -top-12' : 'opacity-0 group-hover:opacity-100 group-hover:-top-12 hidden sm:block'}
                                    `}>
                                        {item.label}
                                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/80" />
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
