import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useI18n } from '../i18n/context';
import { applyTheme, currentTheme, THEME_KEY, type Theme } from './theme';

export function ThemeToggle() {
  const { tr } = useI18n();
  const [theme, setTheme] = useState<Theme>(currentTheme);
  useEffect(() => { applyTheme(theme); }, [theme]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === THEME_KEY || event.key === null) setTheme(currentTheme());
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const label = tr(theme === 'dark' ? 'Hellen Modus aktivieren' : 'Dunklen Modus aktivieren');
  return <button className="icon-button theme-toggle" aria-label={label} title={label} onClick={() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { window.localStorage.setItem(THEME_KEY, next); } catch { /* The chosen appearance still works for this session. */ }
  }}>{theme === 'dark' ? <Sun size={20} aria-hidden="true"/> : <Moon size={20} aria-hidden="true"/>}</button>;
}
