import { createContext, useContext } from 'react';
import { formatCount, type Language } from './translate';
export interface LanguageContextValue {
  language: Language;
  locale: 'de-DE' | 'uk-UA';
  count: (value: number, noun: Parameters<typeof formatCount>[1]) => string;
  setLanguage: (language: Language) => void;
  tr: (source: string | undefined, values?: readonly unknown[]) => string;
}
export const LanguageContext = createContext<LanguageContextValue | null>(null);
export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('LanguageProvider fehlt');
  return context;
}
