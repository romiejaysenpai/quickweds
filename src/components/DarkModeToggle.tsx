'use client';

import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface DarkModeToggleProps {
    variant?: 'default' | 'minimal';
}

export default function DarkModeToggle({ variant = 'default' }: DarkModeToggleProps) {
    const { theme, toggleTheme } = useTheme();

    if (variant === 'minimal') {
        return (
            <button
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                className="w-10 h-10 rounded-full bg-neutral hover:bg-neutral/80 border border-border flex items-center justify-center text-text-secondary hover:text-primary transition-all"
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
                <motion.div
                    initial={false}
                    animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {theme === 'light' ? (
                        <Moon className="w-4 h-4" />
                    ) : (
                        <Sun className="w-4 h-4" />
                    )}
                </motion.div>
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            role="switch"
            aria-checked={theme === 'dark'}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className={`grid h-9 w-[88px] shrink-0 grid-cols-2 rounded-lg border p-0.5 text-[9px] font-black uppercase tracking-widest transition-colors hover:border-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/15 ${
                theme === 'dark' ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border bg-white text-text-secondary'
            }`}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
            <span className={`flex items-center justify-center gap-1 rounded-md transition ${theme === 'light' ? 'bg-neutral text-foreground shadow-sm' : ''}`}>
                <Sun className="h-3 w-3" /> Light
            </span>
            <span className={`flex items-center justify-center gap-1 rounded-md transition ${theme === 'dark' ? 'bg-primary text-white shadow-sm' : ''}`}>
                <Moon className="h-3 w-3" /> Dark
            </span>
        </button>
    );
}
