// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '../src/theme/ThemeToggle';
import { THEME_KEY, readTheme } from '../src/theme/theme';
import { LanguageProvider } from '../src/i18n/LanguageProvider';

beforeEach(() => { localStorage.clear(); document.documentElement.removeAttribute('data-theme'); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); document.documentElement.removeAttribute('data-theme'); });
const show = () => render(<LanguageProvider><ThemeToggle/></LanguageProvider>);
it('keeps dark as default, saves a chosen appearance independently and restores it', async () => {
  const user = userEvent.setup(); const view = show();
  expect(document.documentElement.dataset.theme).toBe('dark');
  await user.click(screen.getByRole('button', { name: 'Hellen Modus aktivieren' }));
  expect(document.documentElement.dataset.theme).toBe('light');
  expect(Object.keys(localStorage)).toEqual([THEME_KEY]);
  expect(localStorage.getItem(THEME_KEY)).toBe('light');
  view.unmount(); show();
  await user.click(screen.getByRole('button', { name: 'Dunklen Modus aktivieren' }));
  expect(document.documentElement.dataset.theme).toBe('dark');
});
it('can switch when browser storage is unavailable', async () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw Error('blocked'); });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw Error('blocked'); });
  const user = userEvent.setup(); show();
  await user.click(screen.getByRole('button', { name: 'Hellen Modus aktivieren' }));
  expect(document.documentElement.dataset.theme).toBe('light');
  await user.click(screen.getByRole('button', { name: 'Dunklen Modus aktivieren' }));
  expect(document.documentElement.dataset.theme).toBe('dark');
});
it('synchronizes another tab and resets when website data is cleared', () => {
  show(); localStorage.setItem(THEME_KEY, 'light');
  fireEvent(window, new StorageEvent('storage', { key: THEME_KEY, newValue: 'light' }));
  expect(document.documentElement.dataset.theme).toBe('light');
  localStorage.clear(); fireEvent(window, new StorageEvent('storage', { key: null }));
  expect(document.documentElement.dataset.theme).toBe('dark');
});
it('ignores invalid saved values', () => {
  for (const value of [null, 'system', '{broken', 'LIGHT']) expect(readTheme({ getItem: () => value })).toBe('dark');
});
