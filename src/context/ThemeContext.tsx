'use client';

import React, { createContext, useContext, useEffect } from 'react';

type Theme = 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const noop = () => {};

const LIGHT_THEME_CONTEXT: ThemeContextType = {
  theme: 'light',
  toggleTheme: noop,
  setTheme: noop,
};

const ThemeContext = createContext<ThemeContextType>(LIGHT_THEME_CONTEXT);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.style.colorScheme = 'light';
    try {
      localStorage.removeItem('theme');
    } catch {
      // Ignore storage access errors in restricted browsing contexts.
    }
  }, []);

  return (
    <ThemeContext.Provider value={LIGHT_THEME_CONTEXT}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
