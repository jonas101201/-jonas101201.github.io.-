export type Theme = 'dark' | 'light';
export const THEME_KEY = 'lernhub:theme:v1';
let themeFrame = 0;

export function readTheme(storage: Pick<Storage, 'getItem'>): Theme {
  try { return storage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'; }
  catch { return 'dark'; }
}
export function currentTheme(): Theme {
  try { return readTheme(window.localStorage); } catch { return 'dark'; }
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
