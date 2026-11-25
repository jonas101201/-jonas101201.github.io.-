export type Theme = 'dark' | 'light';
export type ThemePreference = Theme | 'system';
export const THEME_KEY = 'lernhub:theme:v1';
let themeFrame = 0;

export function readTheme(storage: Pick<Storage, 'getItem'>): Theme {
  try { return storage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'; }
  catch { return 'dark'; }
}
export function resolveTheme(preference: ThemePreference): Theme {
  if (preference !== 'system') return preference;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches === false ? 'light' : 'dark';
}
export function currentTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    return resolveTheme(stored === 'system' || stored === 'light' ? stored : 'dark');
  } catch { return 'dark'; }
}
export function applyTheme(theme: Theme) {
  if (themeFrame) window.cancelAnimationFrame(themeFrame);
  document.documentElement.dataset.themeChanging = 'true';
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#e9edf1' : '#222d3a');
  document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.setAttribute('content', theme === 'light' ? 'default' : 'black-translucent');
  if (typeof window.requestAnimationFrame === 'function') {
    themeFrame = window.requestAnimationFrame(() => {
      themeFrame = window.requestAnimationFrame(() => { delete document.documentElement.dataset.themeChanging; themeFrame = 0; });
    });
  } else delete document.documentElement.dataset.themeChanging;
}
