import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { LanguageContext, type LanguageContextValue } from './context';
import { formatCount, isLanguage, isLanguagePrepared, LANGUAGE_KEY, prepareLanguage, readLanguage, translateText, type Language } from './translate';
function initialLanguage(): Language {
  try { return readLanguage(window.localStorage); } catch { return 'de'; }
}
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState<Language>(() => {
    const preferred = initialLanguage();
    return isLanguagePrepared(preferred) ? preferred : 'de';
  });
  const [languageRequest, setLanguageRequest] = useState<LanguageContextValue['languageRequest']>();
  const request = useRef(0);
  const invalidateRequest = useCallback(() => { request.current++; }, []);
  const changeLanguage = useCallback((value: Language, persist: boolean) => {
    const current = ++request.current;
    const apply = () => {
      if (current !== request.current) return;
      updateLanguage(value);
      setLanguageRequest(undefined);
      if (persist) {
        try { window.localStorage.setItem(LANGUAGE_KEY, value); } catch { /* Still switch for this session. */ }
      }
    };
    if (isLanguagePrepared(value)) apply();
    else {
      setLanguageRequest({ language: value, status: 'loading' });
      void prepareLanguage(value).then(apply, () => {
        if (current === request.current) setLanguageRequest({ language: value, status: 'failed' });
      });
    }
  }, []);
  const setLanguage = useCallback((value: Language) => changeLanguage(value, true), [changeLanguage]);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  useEffect(() => {
    changeLanguage(initialLanguage(), false);
    const sync = (event: StorageEvent) => {
      if (event.key === LANGUAGE_KEY) changeLanguage(isLanguage(event.newValue) ? event.newValue : 'de', false);
      if (event.key === null) changeLanguage(initialLanguage(), false);
    };
    window.addEventListener('storage', sync);
    return () => {
      invalidateRequest();
      window.removeEventListener('storage', sync);
    };
  }, [changeLanguage, invalidateRequest]);
  const tr = useCallback((source: string | undefined, values?: readonly unknown[]) => translateText(source, language, values), [language]);
  const count = useCallback((value: number, noun: Parameters<typeof formatCount>[1]) => formatCount(value, noun, language), [language]);
  const value = useMemo(() => ({ language, languageRequest, locale: language === 'uk' ? 'uk-UA' as const : 'de-DE' as const, setLanguage, tr, count }), [language, languageRequest, setLanguage, tr, count]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
