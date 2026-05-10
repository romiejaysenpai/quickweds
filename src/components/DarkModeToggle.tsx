'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

type Theme = 'light' | 'dark';

const subscribeToClient = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function getStoredTheme(): Theme {
    if (typeof window === 'undefined') return 'light';

    const savedTheme = localStorage.getItem('quickweds-theme') as Theme | null;
    if (savedTheme) return savedTheme;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

export function useDarkMode() {
    const [theme, setTheme] = useState<Theme>(getStoredTheme);
    const mounted = useSyncExternalStore(subscribeToClient, getClientSnapshot, getServerSnapshot);

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('quickweds-theme', newTheme);
        applyTheme(newTheme);
    };

    const setSpecificTheme = (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem('quickweds-theme', newTheme);
        applyTheme(newTheme);
    };

    return { theme, toggleTheme, setTheme: setSpecificTheme, mounted };
}

interface DarkModeToggleProps {
    variant?: 'default' | 'minimal';
}

export default function DarkModeToggle({ variant = 'default' }: DarkModeToggleProps) {
    const { theme, toggleTheme, mounted } = useDarkMode();

    if (!mounted) {
        return (
            <div className={`${variant === 'minimal' ? 'w-10 h-10' : 'w-12 h-12'} rounded-full bg-neutral animate-pulse`} />
        );
    }

    if (variant === 'minimal') {
        return (
            <button
                onClick={toggleTheme}
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
            className="relative w-14 h-8 rounded-full bg-neutral border border-border p-1 transition-colors hover:border-primary/30"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
            <motion.div
                className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm"
                initial={false}
                animate={{
                    x: theme === 'dark' ? 24 : 0,
                }}
                transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                }}
            >
                {theme === 'light' ? (
                    <Sun className="w-3.5 h-3.5 text-white" />
                ) : (
                    <Moon className="w-3.5 h-3.5 text-white" />
                )}
            </motion.div>
        </button>
    );
}
