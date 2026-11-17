// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CurrentDate } from '../src/components/CurrentDate';
import { LanguageProvider } from '../src/i18n/LanguageProvider';
import { LANGUAGE_KEY } from '../src/i18n/translate';
beforeEach(() => { localStorage.clear(); vi.useFakeTimers(); });
afterEach(() => { cleanup(); vi.useRealTimers(); });
const show = () => render(<LanguageProvider><CurrentDate/></LanguageProvider>);
it('advances at local midnight without a reload', () => {
  vi.setSystemTime(new Date(2026, 10, 17, 23, 59, 59));
  const view = show();
  expect(screen.getByText('Dienstag, 17. November 2026')).toBeTruthy();
  act(() => { vi.advanceTimersByTime(2000); });
  expect(screen.getByText('Mittwoch, 18. November 2026')).toBeTruthy();
  expect(view.container.querySelector('time')?.getAttribute('datetime')).toBe('2026-11-18');
});
it('refreshes when returning to an open tab after several days', () => {
  vi.setSystemTime(new Date(2026, 10, 17, 10)); show();
  vi.setSystemTime(new Date(2026, 10, 20, 10));
  fireEvent(window, new Event('focus'));
  expect(screen.getByText('Freitag, 20. November 2026')).toBeTruthy();
});
it('formats the current device date using the selected language', () => {
  localStorage.setItem(LANGUAGE_KEY, 'uk');
  vi.setSystemTime(new Date(2026, 10, 17, 1));
  const view = show();
  expect(view.container.querySelector('time')?.getAttribute('datetime')).toBe('2026-11-17');
  expect(view.container.textContent).toContain('листопада');
});
