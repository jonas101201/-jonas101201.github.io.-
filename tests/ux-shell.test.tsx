// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../src/app/App';
import { LanguageProvider } from '../src/i18n/LanguageProvider';
vi.mock('../src/utils/liquidGlass', () => ({ mountLiquidGlass: () => () => {} }));
vi.mock('../src/components/AsciiWaves', () => ({ AsciiWaves: () => null }));
beforeEach(() => {
  localStorage.clear(); window.location.hash = '';
  vi.stubGlobal('scrollTo', vi.fn());
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it('opens from global Ctrl+K and Cmd+K, closes with the shortcut, and resumes a visited quiz', async () => {
  const user = userEvent.setup(); render(<LanguageProvider><App/></LanguageProvider>);
  fireEvent.keyDown(window, { key: 'k', ctrlKey: true }); expect(screen.getByRole('dialog')).toBeTruthy();
  await user.type(screen.getByRole('combobox', { name: 'Suchbegriff' }), 'Die vier Spielformen'); await user.keyboard('{Enter}');
  expect(screen.queryByRole('dialog')).toBeNull(); expect(screen.getByRole('heading', { name: 'Die vier Spielformen' })).toBeTruthy();
  fireEvent.keyDown(window, { key: 'K', metaKey: true }); expect(screen.getByRole('dialog')).toBeTruthy();
  await user.type(screen.getByRole('combobox', { name: 'Suchbegriff' }), 'Übersicht'); await user.keyboard('{Enter}');
  expect(screen.getByRole('heading', { name: 'Weiterlernen' })).toBeTruthy();
  expect(screen.getByRole('link', { name: /Quizze Die vier Spielformen/ })).toBeTruthy();
  expect(localStorage.getItem('lernhub:activity:v1')).toBeNull();
  fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
  await user.keyboard('{Control>}k{/Control}'); expect(screen.queryByRole('dialog')).toBeNull();
});
