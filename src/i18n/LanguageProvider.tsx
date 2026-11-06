import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LanguageContext } from './context';
import { formatCount, isLanguage, LANGUAGE_KEY, readLanguage, translateText, type Language } from './translate';
function initialLanguage(): Language {
  try { return readLanguage(window.localStorage); } catch { return 'de'; }
}
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState<Language>(initialLanguage);
  const setLanguage = useCallback((value: Language) => {
    updateLanguage(value);
    try { window.localStorage.setItem(LANGUAGE_KEY, value); } catch { /* Still switch for this session. */ }
  }, []);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === LANGUAGE_KEY) updateLanguage(isLanguage(event.newValue) ? event.newValue : 'de');
      if (event.key === null) updateLanguage(initialLanguage());
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const tr = useCallback((source: string | undefined, values?: readonly unknown[]) => translateText(source, language, values), [language]);
  const count = useCallback((value: number, noun: Parameters<typeof formatCount>[1]) => formatCount(value, noun, language), [language]);
  const value = useMemo(() => ({ language, locale: language === 'uk' ? 'uk-UA' as const : 'de-DE' as const, setLanguage, tr, count }), [language, setLanguage, tr, count]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
