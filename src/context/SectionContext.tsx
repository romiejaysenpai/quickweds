'use client'

import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';

interface Section {
  id: string;
  title: string;
}

interface SectionActionsContextType {
  registerSection: (id: string, title: string) => void;
  unregisterSection: (id: string) => void;
}

interface SectionContextType extends SectionActionsContextType {
  sections: Section[];
}

const SectionContext = createContext<SectionContextType | undefined>(undefined);
const SectionActionsContext = createContext<SectionActionsContextType | undefined>(undefined);

export const useSectionContext = () => {
  const context = useContext(SectionContext);
  if (!context) {
    throw new Error('useSectionContext must be used within a SectionProvider');
  }
  return context;
};

/**
 * Subscribe only to stable register/unregister actions without re-rendering
 * when sibling wedding sections register or unregister.
 */
export const useSectionActions = () => {
  const context = useContext(SectionActionsContext);
  if (!context) {
    throw new Error('useSectionActions must be used within a SectionProvider');
  }
  return context;
};

interface SectionProviderProps {
  children: ReactNode;
}

export const SectionProvider = ({ children }: SectionProviderProps) => {
  const [sections, setSections] = useState<Section[]>([]);

  const registerSection = useCallback((id: string, title: string) => {
    setSections(prev => {
      // Avoid duplicate registrations
      if (prev.some(section => section.id === id)) return prev;
      return [...prev, { id, title }];
    });
  }, []);

  const unregisterSection = useCallback((id: string) => {
    setSections(prev => {
      if (!prev.some(section => section.id === id)) return prev;
      return prev.filter(section => section.id !== id);
    });
  }, []);

  const actions = useMemo(
    () => ({ registerSection, unregisterSection }),
    [registerSection, unregisterSection]
  );

  const value = useMemo(
    () => ({ sections, registerSection, unregisterSection }),
    [sections, registerSection, unregisterSection]
  );

  return (
    <SectionActionsContext.Provider value={actions}>
      <SectionContext.Provider value={value}>
        {children}
      </SectionContext.Provider>
    </SectionActionsContext.Provider>
  );
};
