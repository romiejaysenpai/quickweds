'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_STORAGE_KEY = 'theme';
const THEME_CHANGE_EVENT = 'quickweds-theme-change';

function getServerThemeSnapshot(): Theme {
  return 'light';
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
  } catch {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function subscribeToThemeChanges(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  window.addEventListener('storage', onStoreChange);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  mediaQuery.addEventListener('change', onStoreChange);

  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
    mediaQuery.removeEventListener('change', onStoreChange);
  };
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribeToThemeChanges, getStoredTheme, getServerThemeSnapshot);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    applyTheme(newTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [setTheme, theme]);

  const value = useMemo(
    () => ({ theme, toggleTheme, setTheme }),
    [theme, toggleTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
