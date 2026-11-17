// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../src/i18n/LanguageProvider';
import { MaterialsPage } from '../src/features/materials/MaterialsPage';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); localStorage.clear(); });

function setup() {
  let mobile = true;
  let changed = () => {};
  vi.stubGlobal('matchMedia', () => ({ get matches() { return mobile; }, addEventListener: (_: string, fn: () => void) => { changed = fn; }, removeEventListener: vi.fn() }));
  render(<MemoryRouter><LanguageProvider><MaterialsPage/></LanguageProvider></MemoryRouter>);
  return { user: userEvent.setup(), resize: (value: boolean) => act(() => { mobile = value; changed(); }) };
}

it('opens mobile filters by keyboard and preserves active filters and results when collapsed', async () => {
  const { user } = setup();
  expect(screen.queryByRole('combobox', { name: 'Fach filtern' })).toBeNull();
  const trigger = screen.getByRole('button', { name: 'Filter und Sortierung' });
  trigger.focus(); await user.keyboard('{Enter}');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Fach filtern' }), 'bk1');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Lernfeld filtern' }), 'bk1-lf3');
  const results = screen.getByText(/\d+ Materialien/).textContent;
  await user.click(trigger);
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  expect(trigger.textContent).toContain('2 aktiv');
  expect(screen.queryByRole('combobox', { name: 'Fach filtern' })).toBeNull();
  expect(screen.getByText(/\d+ Materialien/).textContent).toBe(results);
  await user.click(trigger);
  expect((screen.getByRole('combobox', { name: 'Lernfeld filtern' }) as HTMLSelectElement).value).toBe('bk1-lf3');
});

it('shows desktop controls after resizing without losing the selection or opening hidden mobile controls', async () => {
  const { user, resize } = setup();
  resize(false);
  expect(screen.queryByRole('button', { name: 'Filter und Sortierung' })).toBeNull();
  await user.selectOptions(screen.getByRole('combobox', { name: 'Dateityp filtern' }), 'ZIP');
  resize(true);
  expect(screen.queryByRole('combobox', { name: 'Dateityp filtern' })).toBeNull();
  await user.click(screen.getByRole('button', { name: /Filter und Sortierung/ }));
  expect((screen.getByRole('combobox', { name: 'Dateityp filtern' }) as HTMLSelectElement).value).toBe('ZIP');
});
