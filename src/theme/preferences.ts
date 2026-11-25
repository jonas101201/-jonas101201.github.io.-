import { useEffect, useState } from 'react';
import { applyTheme, resolveTheme, THEME_KEY, type ThemePreference } from './theme';

const sessionPreferences = new Map<string, string>();
const BACKGROUND_KEY = 'lernhub:background-paused:v1';

function usePreference<T extends string>(key: string, decode: (value: string | null) => T) {
  const read = () => {
    try { return decode(sessionPreferences.get(key) ?? localStorage.getItem(key)); }
    catch { return decode(sessionPreferences.get(key) ?? null); }
  };
  const [value, setValue] = useState(read);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === null || event.key === key) setValue(decode(event.newValue));
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [decode, key]);
  return [value, (next: T) => {
    try { localStorage.setItem(key, next); sessionPreferences.delete(key); }
    catch { sessionPreferences.set(key, next); }
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: next }));
  }] as const;
}

const decodeTheme = (value: string | null): ThemePreference => value === 'light' || value === 'system' ? value : 'dark';
const decodeBackground = (value: string | null) => value === 'true' ? 'true' : 'false';

export function useThemePreference() {
  const [preference, setPreference] = usePreference(THEME_KEY, decodeTheme);
  const [system, setSystem] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true);
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    const update = () => setSystem(media?.matches ?? true);
    media?.addEventListener?.('change', update);
    return () => media?.removeEventListener?.('change', update);
  }, []);
  const theme = preference === 'system' ? (system ? 'dark' : 'light') : preference;
  return { preference, theme, setPreference: (next: ThemePreference) => {
    applyTheme(resolveTheme(next));
    setPreference(next);
  } };
}

export function useBackgroundPreference() {
  const [value, setValue] = usePreference(BACKGROUND_KEY, decodeBackground);
  return [value === 'true', (paused: boolean) => setValue(paused ? 'true' : 'false')] as const;
}
