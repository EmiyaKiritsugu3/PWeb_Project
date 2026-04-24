'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import pt from '@/lib/i18n/dictionaries/pt.json';
import en from '@/lib/i18n/dictionaries/en.json';

type Language = 'pt' | 'en';

interface I18nContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
}

const dictionaries: Record<Language, unknown> = { pt, en };

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('app-language') as Language;
    if (savedLang && (savedLang === 'pt' || savedLang === 'en')) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (path: string): string => {
    const keys = path.split('.');
    let value: unknown = dictionaries[language];

    for (const key of keys) {
      if (value && typeof value === 'object' && key in (value as Record<string, unknown>)) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return path; // Fallback to path if not found
      }
    }

    return typeof value === 'string' ? value : path;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
