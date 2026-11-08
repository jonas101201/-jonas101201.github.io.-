// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { LanguageProvider } from '../src/i18n/LanguageProvider';
import { CommandPalette } from '../src/features/search/CommandPalette';
import { MaterialsPage } from '../src/features/materials/MaterialsPage';
import { ProgressProvider } from '../src/hooks/ProgressProvider';
import { useProgress } from '../src/hooks/useProgress';
import { ACTIVITY_KEY } from '../src/features/activity/storage';
import { CONSENT_KEY } from '../src/utils/privacyStorage';
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
function PaletteHarness() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  return <><button onClick={() => setOpen(true)}>Search</button>{open && <CommandPalette onClose={() => setOpen(false)}/>}<output>{location.pathname}</output></>;
}
function wrap(children: React.ReactNode) { return <MemoryRouter><LanguageProvider>{children}</LanguageProvider></MemoryRouter>; }
describe('UX interactions', () => {
  it('focuses the combobox, wraps selection, navigates with Enter and restores focus on cancel', async () => {
    const user = userEvent.setup(); render(wrap(<PaletteHarness/>));
    const trigger = screen.getByText('Search'); await user.click(trigger);
    const input = screen.getByRole('combobox'); expect(document.activeElement).toBe(input);
    await user.type(input, 'prufungstraining');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    await user.keyboard('{ArrowUp}{Enter}');
    expect(screen.queryByRole('dialog')).toBeNull(); expect(screen.getByRole('status').textContent).toBe('/pruefungstraining');
    await user.click(trigger); fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(document.activeElement).toBe(trigger);
  });
  it('traps Tab between close and input and handles empty results without navigation', async () => {
    const user = userEvent.setup(); render(wrap(<PaletteHarness/>)); await user.click(screen.getByText('Search'));
    await user.tab(); expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Suche schließen' }));
    await user.tab({ shift: true }); expect(document.activeElement).toBe(screen.getByRole('combobox'));
    await user.type(screen.getByRole('combobox'), 'xxxxxxxxxxxxxxxxxx'); await user.keyboard('{ArrowDown}{Enter}');
    expect(screen.queryAllByRole('option')).toHaveLength(0); expect(screen.getByRole('combobox').hasAttribute('aria-activedescendant')).toBe(false);
    await user.click(screen.getByRole('button', { name: 'Suche schließen' })); expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('preserves subject, field, type, query, sorting and result order when changing view', async () => {
    const user = userEvent.setup(); const { container } = render(wrap(<Routes><Route path="*" element={<MaterialsPage/>}/></Routes>));
    await user.selectOptions(screen.getByLabelText('Fach filtern'), 'bk1');
    await user.selectOptions(screen.getByLabelText('Lernfeld filtern'), 'bk1-lf2');
    await user.selectOptions(screen.getByLabelText('Dateityp filtern'), 'DOCX');
    await user.selectOptions(screen.getByLabelText('Sortierung'), 'title');
    await user.type(screen.getByLabelText('Materialien suchen'), 'entwicklung');
    const titles = () => [...container.querySelectorAll('.material-title')].map(e => e.textContent);
    const before = titles(); expect(before.length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: 'Liste' }));
    expect(container.querySelector('.material-list')).toBeTruthy(); expect(titles()).toEqual(before);
    expect((screen.getByLabelText('Lernfeld filtern') as HTMLSelectElement).value).toBe('bk1-lf2');
    expect((screen.getByLabelText('Dateityp filtern') as HTMLSelectElement).value).toBe('DOCX');
    expect((screen.getByLabelText('Sortierung') as HTMLSelectElement).value).toBe('title');
    await user.click(screen.getByRole('button', { name: 'Karten' })); expect(titles()).toEqual(before);
  });
});
function ActivityHarness() {
  const p = useProgress();
  return <><button onClick={() => p.trackActivity('/quizze/test')}>visit</button><button onClick={p.enablePersistence}>enable</button><button onClick={p.disablePersistence}>revoke</button><button onClick={p.reset}>reset</button><output>{p.activities.length}</output><span>{p.activityWarning}</span></>;
}
describe('Activity lifecycle', () => {
  it('stays in memory, then persists voluntarily, reloads and clears on reset and revocation', async () => {
    const user = userEvent.setup(); const view = render(<ProgressProvider><ActivityHarness/></ProgressProvider>);
    await user.click(screen.getByText('visit')); expect(localStorage.getItem(ACTIVITY_KEY)).toBeNull();
    await user.click(screen.getByText('enable')); expect(JSON.parse(localStorage.getItem(ACTIVITY_KEY)!).entries).toHaveLength(1);
    view.unmount(); render(<ProgressProvider><ActivityHarness/></ProgressProvider>); expect(screen.getByRole('status').textContent).toBe('1');
    await user.click(screen.getByText('reset')); expect(screen.getByRole('status').textContent).toBe('0'); expect(localStorage.getItem(ACTIVITY_KEY)).toBeNull();
    await user.click(screen.getByText('visit')); await user.click(screen.getByText('revoke'));
    expect(localStorage.getItem(ACTIVITY_KEY)).toBeNull(); expect(localStorage.getItem(CONSENT_KEY)).toBeNull(); expect(screen.getByRole('status').textContent).toBe('0');
  });
  it('does not overwrite a future schema after navigation or explicit consent until reset', async () => {
    const user = userEvent.setup(); const raw = '{"version":99,"entries":[]}';
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ version: 1, grantedAt: '2026-11-08T12:00:00.000Z', activity: { version: 1, grantedAt: '2026-11-08T12:00:00.000Z' } })); localStorage.setItem(ACTIVITY_KEY, raw);
    render(<ProgressProvider><ActivityHarness/></ProgressProvider>);
    await user.click(screen.getByText('visit')); await user.click(screen.getByText('enable')); expect(localStorage.getItem(ACTIVITY_KEY)).toBe(raw);
    await user.click(screen.getByText('reset')); await user.click(screen.getByText('visit'));
    expect(JSON.parse(localStorage.getItem(ACTIVITY_KEY)!).version).toBe(1);
  });
});

describe('Activity cross-tab and storage errors', () => {
  it('applies revocation from another tab and never writes after it', async () => {
    const user = userEvent.setup(); render(<ProgressProvider><ActivityHarness/></ProgressProvider>);
    await user.click(screen.getByText('enable')); await user.click(screen.getByText('visit'));
    localStorage.removeItem(CONSENT_KEY); localStorage.removeItem(ACTIVITY_KEY);
    fireEvent(window, new StorageEvent('storage', { key: CONSENT_KEY, newValue: null }));
    expect(screen.getByRole('status').textContent).toBe('0');
    await user.click(screen.getByText('visit')); expect(localStorage.getItem(ACTIVITY_KEY)).toBeNull();
  });
  it('continues in memory and shows a warning on write failure', async () => {
    const user = userEvent.setup(); render(<ProgressProvider><ActivityHarness/></ProgressProvider>);
    await user.click(screen.getByText('enable'));
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw Error('quota'); });
    try {
      await user.click(screen.getByText('visit')); expect(screen.getByRole('status').textContent).toBe('1');
      expect(screen.getByText(/Speichern fehlgeschlagen/)).toBeTruthy();
    } finally { spy.mockRestore(); }
  });
});
