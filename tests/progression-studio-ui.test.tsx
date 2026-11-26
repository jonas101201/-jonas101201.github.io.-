// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../src/i18n/LanguageProvider';
import { emptyState } from '../src/features/progression/engine';
import { Studio } from '../src/features/progression/Studio';
import { RewardStore } from '../src/features/progression/RewardStore';
import { CosmeticSurface } from '../src/features/progression/CosmeticSurface';

const mock = vi.hoisted(() => ({ value: null as unknown }));
vi.mock('../src/features/progression/store', () => ({ useProgression: () => mock.value }));

function show(node: React.ReactNode, path = '/') {
  return render(<LanguageProvider><MemoryRouter initialEntries={[path]}>{node}</MemoryRouter></LanguageProvider>);
}
beforeEach(() => {
  localStorage.clear();
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(cleanup);

it('offers previews without consent, with a separate confirmed purchase for enabled users', async () => {
  const user = userEvent.setup();
  const dispatch = vi.fn(async () => ({ ...emptyState(), owned: ['aurora'] }));
  mock.value = { state: emptyState(), enabled: false, dispatch, error: null };
  const view = show(<RewardStore/>);
  await user.type(screen.getByRole('searchbox'), 'Aurora');
  const aurora = screen.getByRole('heading', { name: 'Aurora' }).closest('article')!;
  await user.click(within(aurora).getByRole('button', { name: 'Vorschau für Aurora' }));
  expect(screen.getByRole('heading', { name: 'Aurora · Vorschau' })).toBeTruthy();
  expect(screen.getByTitle('LernHub-Startseite als Vorschau').getAttribute('src')).toContain('#/?anprobe=studio');
  expect(screen.getByRole('link', { name: 'Im Studio kombinieren' }).getAttribute('href')).toContain('?vorschau=aurora');
  await user.click(screen.getByRole('button', { name: 'Produktansicht' }));
  expect(screen.queryByTitle('LernHub-Startseite als Vorschau')).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Vorschau schließen' }));
  expect(document.activeElement).toBe(within(aurora).getByRole('button', { name: 'Vorschau für Aurora' }));
  expect((within(aurora).getByRole('button', { name: 'Eintauschen' }) as HTMLButtonElement).disabled).toBe(true);
  expect(dispatch).not.toHaveBeenCalled();

  view.unmount();
  mock.value = { state: { ...emptyState(), credits: 200 }, enabled: true, dispatch, error: null };
  show(<RewardStore/>);
  const purchasable = screen.getByRole('heading', { name: 'Aurora' }).closest('article')!;
  await user.click(within(purchasable).getByRole('button', { name: 'Eintauschen' }));
  expect(dispatch).not.toHaveBeenCalled();
  await user.click(within(purchasable).getByRole('button', { name: 'Für 160 Credits bestätigen' }));
  expect(dispatch).toHaveBeenCalledWith({ type: 'cosmetic-buy', id: 'aurora', at: expect.any(String) });
});

it('does not equip locked cosmetics and applies two owned slots together', async () => {
  const user = userEvent.setup();
  const state = { ...emptyState(), owned: ['aurora', 'accent-iris', 'orbit'] };
  const dispatch = vi.fn(async () => state);
  mock.value = { state, enabled: true, dispatch, error: null };
  show(<Studio/>);
  await user.selectOptions(screen.getByLabelText('Hintergrund', { exact: false }), 'aurora');
  await user.selectOptions(screen.getByLabelText('Akzentfarbe', { exact: false }), 'accent-mint');
  expect((screen.getByRole('button', { name: 'Design anwenden' }) as HTMLButtonElement).disabled).toBe(true);
  await user.selectOptions(screen.getByLabelText('Akzentfarbe', { exact: false }), 'accent-iris');
  await user.click(screen.getByRole('button', { name: 'Design anwenden' }));
  expect(dispatch).toHaveBeenCalledWith({ type: 'equip', equipped: { background: 'aurora', accent: 'accent-iris' } });
});

it('opens a shop accessory in the companion preview and discards it without equipping', async () => {
  const user = userEvent.setup();
  const dispatch = vi.fn();
  mock.value = { state: emptyState(), enabled: true, dispatch, error: null };
  const view = show(<Studio/>, '/fortschritt/studio?vorschau=eyes-dual');
  expect(screen.getByRole('button', { name: /^Begleiter$/ }).getAttribute('aria-pressed')).toBe('true');
  expect(view.container.querySelector('.studio-character-preview img')?.getAttribute('src')).toContain('orbit-stage-0-dual.webp');
  expect((screen.getByRole('button', { name: 'Design anwenden' }) as HTMLButtonElement).disabled).toBe(true);
  await user.click(screen.getByRole('button', { name: 'Änderungen verwerfen' }));
  expect(view.container.querySelector('.studio-character-preview img')?.getAttribute('src')).toContain('orbit-poster.webp');
  expect(dispatch).not.toHaveBeenCalled();
});

it('clears the equipped surface on unmount without modifying other slots', () => {
  const state = { ...emptyState(), equipped: { background: 'aurora' }, owned: ['aurora', 'orbit'] };
  mock.value = { state, enabled: true };
  const view = show(<CosmeticSurface/>);
  const root = document.documentElement;
  expect(root.style.getPropertyValue('--studio-orb-one-dark')).toBe('#256457');
  expect(root.hasAttribute('data-studio-glass')).toBe(false);
  view.unmount();
  expect(root.style.getPropertyValue('--studio-orb-one-dark')).toBe('');
  expect(root.hasAttribute('data-studio')).toBe(false);
});
