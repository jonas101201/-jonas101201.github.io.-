import { useLayoutEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useI18n } from '../i18n/context';
import { applyTheme } from './theme';
import { useThemePreference } from './preferences';

export function ThemeToggle() {
  const { tr } = useI18n();
  const { theme, setPreference } = useThemePreference();
  useLayoutEffect(() => { applyTheme(theme); }, [theme]);
  const label = tr(theme === 'dark' ? 'Hellen Modus aktivieren' : 'Dunklen Modus aktivieren');
  return <button className="icon-button theme-toggle" aria-label={label} title={label} onClick={() => setPreference(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={20} aria-hidden="true"/> : <Moon size={20} aria-hidden="true"/>}</button>;
}
