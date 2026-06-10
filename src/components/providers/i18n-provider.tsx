'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import pt from '@/lib/i18n/dictionaries/pt.json';
import en from '@/lib/i18n/dictionaries/en.json';

type Language = 'pt' | 'en';

interface I18nContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const dictionaries: Record<Language, unknown> = { pt, en };

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export function I18nProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [language, setLanguage] = useState<Language>('pt');

  // Load language from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem('app-language');
    const normalized = raw?.toLowerCase() ?? '';
    let savedLang: Language = 'pt';
    if (normalized.startsWith('en')) {
      savedLang = 'en';
    }
    setLanguage(savedLang);
  }, []);

  const updateLanguage = React.useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
  }, []);

  const contextValue = React.useMemo(() => {
    const t = (path: string, params?: Record<string, string | number>): string => {
      const keys = path.split('.');
      let value: unknown = dictionaries[language];

      for (const key of keys) {
        if (value && typeof value === 'object' && key in (value as Record<string, unknown>)) {
          value = (value as Record<string, unknown>)[key];
        } else {
          return path;
        }
      }

      if (typeof value !== 'string') return path;

      let translated = value;
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          translated = translated.replace(`{${key}}`, String(val));
        });
      }

      return translated;
    };

    return { language, setLanguage: updateLanguage, t };
  }, [language, updateLanguage]);

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
