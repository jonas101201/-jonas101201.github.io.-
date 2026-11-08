// @vitest-environment jsdom
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../src/app/App';
import { LanguageProvider } from '../src/i18n/LanguageProvider';
import { LoadingSkeleton } from '../src/components/LoadingSkeleton';
import { catalog } from '../src/data/catalog';
vi.mock('../src/utils/liquidGlass', () => ({ mountLiquidGlass: () => () => {} }));
vi.mock('../src/components/AsciiWaves', () => ({ AsciiWaves: ({ paused }: { paused: boolean }) => <div data-testid="waves" data-paused={paused}/> }));
beforeEach(() => {
  localStorage.clear(); vi.stubGlobal('scrollTo', vi.fn());
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it('shares session progress, pauses background in focus mode and keeps card state when leaving focus', async () => {
  const set = catalog.flashcardSets[0]!; window.location.hash = `#/karteikarten/${set.id}`;
  const user = userEvent.setup(); const { container } = render(<LanguageProvider><App/></LanguageProvider>);
  expect(container.querySelector('.learning-session-header')).toBeTruthy();
  expect(container.querySelector('.focus-mode')).toBeTruthy();
  expect(screen.getByTestId('waves').getAttribute('data-paused')).toBe('true');
  const progress = screen.getByRole('progressbar', { name: 'Lernrundenfortschritt' }); expect(progress.getAttribute('value')).toBe('0');
  await user.click(screen.getByRole('button', { name: /Zum Umdrehen aktivieren/ }));
  await user.click(screen.getByRole('button', { name: 'Gewusst' }));
  expect(screen.getByText('Als gewusst markiert.')).toBeTruthy(); expect(progress.getAttribute('value')).toBe('1');
  await user.click(screen.getByRole('button', { name: 'Fokusmodus verlassen' }));
  expect(container.querySelector('.focus-mode')).toBeNull(); expect(progress.getAttribute('value')).toBe('1');
  expect(screen.getByTestId('waves').getAttribute('data-paused')).toBe('false');
  await user.click(screen.getByRole('button', { name: 'Mischen' })); expect(screen.getByText('Karten neu gemischt.')).toBeTruthy();
  expect(progress.getAttribute('value')).toBe('0');
  fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
  expect(screen.getAllByRole('option').some(e => e.textContent?.includes('Zuletzt besucht'))).toBe(true);
  expect(localStorage.getItem('lernhub:activity:v1')).toBeNull();
});
it('frames quizzes with the same header and resets focus defaults for a new learning route', async () => {
  const quiz = catalog.quizzes[0]!; window.location.hash = `#/quizze/${quiz.id}`;
  const user = userEvent.setup(); const { container } = render(<LanguageProvider><App/></LanguageProvider>);
  expect(container.querySelector('.learning-session-header h1')?.textContent).toBe(quiz.title);
  expect(screen.getByRole('progressbar', { name: 'Quizfortschritt' }).getAttribute('value')).toBe('0');
  await user.click(screen.getByRole('button', { name: 'Fokusmodus verlassen' }));
  expect(container.querySelector('.focus-mode')).toBeNull();
  fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
  await user.type(screen.getByRole('combobox', { name: 'Suchbegriff' }), catalog.flashcardSets[0]!.title); await user.keyboard('{Enter}');
  expect(container.querySelector('.focus-mode')).toBeTruthy();
  expect(screen.getByRole('progressbar', { name: 'Lernrundenfortschritt' })).toBeTruthy();
});
it('announces real startup loading once and hides decorative placeholders from assistive technology', () => {
  const { container } = render(<LanguageProvider><LoadingSkeleton/></LanguageProvider>);
  expect(screen.getByRole('status', { name: 'LernHub wird geladen' })).toBeTruthy();
  expect(container.querySelector('.skeleton-grid')?.getAttribute('aria-hidden')).toBe('true');
  expect(container.querySelectorAll('button,a,input')).toHaveLength(0);
});
