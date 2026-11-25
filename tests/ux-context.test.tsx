// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../src/app/App';
import { LanguageProvider } from '../src/i18n/LanguageProvider';

vi.mock('../src/components/ClayBackground', () => ({ ClayBackground: ({ paused }: { paused: boolean }) => <div data-testid="background" data-paused={paused}/> }));
beforeEach(() => {
  localStorage.clear();
  window.location.hash = '#/';
  vi.stubGlobal('scrollTo', vi.fn());
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const show = () => render(<LanguageProvider><App/></LanguageProvider>);

it('enters through Lernen and keeps the field and format when switching between them', async () => {
  show();
  const user = userEvent.setup();
  await user.click(within(screen.getByRole('navigation', { name: 'Schnellnavigation' })).getByRole('link', { name: 'Lernen' }));
  const subjects = screen.getByRole('region', { name: 'Nach Fach lernen' });
  expect(within(screen.getByRole('region', { name: 'Nach Lernformat lernen' })).getAllByRole('link')).toHaveLength(5);
  await user.click(within(subjects).getByRole('link', { name: /^BK1/ }));
  await user.selectOptions(screen.getByRole('combobox', { name: 'Lernfeld' }), 'bk1-lf3');
  await user.click(screen.getByRole('button', { name: 'Lernzettel' }));
  expect(window.location.hash).toBe('#/faecher/bk1/lernfelder/bk1-lf3?bereich=lernzettel');
  await user.click(screen.getByRole('button', { name: 'Karteikarten' }));
  expect(window.location.hash).toBe('#/faecher/bk1/lernfelder/bk1-lf3?bereich=karteikarten');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Lernfeld' }), 'bk1-lf2');
  expect(window.location.hash).toBe('#/faecher/bk1/lernfelder/bk1-lf2?bereich=karteikarten');
});

it('applies settings to the header and the global background across routes and reloads', async () => {
  const view = show();
  const user = userEvent.setup();
  await user.click(screen.getByRole('link', { name: 'Einstellungen' }));
  await user.click(screen.getByRole('button', { name: 'Hell' }));
  await user.click(screen.getByRole('checkbox', { name: 'Animierter Hintergrund' }));
  expect(screen.getByRole('button', { name: 'Dunklen Modus aktivieren' })).toBeTruthy();
  expect(screen.getByTestId('background').getAttribute('data-paused')).toBe('true');
  view.unmount();
  show();
  expect(screen.getByRole('button', { name: 'Hell' }).getAttribute('aria-pressed')).toBe('true');
  expect(screen.getByTestId('background').getAttribute('data-paused')).toBe('true');
});
