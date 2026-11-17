// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../src/app/App';
import { LanguageProvider } from '../src/i18n/LanguageProvider';
import { catalog } from '../src/data/catalog';
vi.mock('../src/utils/liquidGlass', () => ({ mountLiquidGlass: () => () => {} }));
vi.mock('../src/components/AsciiWaves', () => ({ AsciiWaves: () => null }));
beforeEach(() => {
  localStorage.clear(); window.location.hash = '#/';
  vi.stubGlobal('scrollTo', vi.fn());
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const show = () => render(<LanguageProvider><App/></LanguageProvider>);
it('keeps every BK1 and BK2 learning field directly reachable from the homepage', async () => {
  const user = userEvent.setup(); show();
  const section = screen.getByRole('region', { name: 'Deine Lernfelder' });
  for (const subject of ['bk1', 'bk2']) {
    const fields = catalog.learningFields.filter(field => field.subjectId === subject);
    const nav = within(section).getByRole('navigation', { name: `${subject.toUpperCase()} Lernfelder` });
    const links = within(nav).getAllByRole('link');
    expect(links.map(link => ({ label: link.getAttribute('aria-label'), href: link.getAttribute('href') }))).toEqual(fields.map(field => ({ label: `${subject.toUpperCase()} · ${field.title}`, href: `#/faecher/${subject}/lernfelder/${field.id}` })));
  }
  await user.click(within(section).getByRole('link', { name: 'BK1 · Lernfeld 3' }));
  expect(screen.getByRole('heading', { name: 'BK1 · Lernfeld 3' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Unterrichtsmaterialien', pressed: true })).toBeTruthy();
});
it('opens search and restores keyboard focus to the floating menu after Escape', async () => {
  const user = userEvent.setup(); const view = show();
  const dock = screen.getByRole('navigation', { name: 'Schnellnavigation' });
  await user.click(within(dock).getByRole('button', { name: 'Suche' }));
  expect(screen.getByRole('dialog')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Suche schließen' }));
  const more = within(dock).getByRole('button', { name: 'Mehr' });
  await user.click(more);
  expect(view.container.querySelector('.sidebar.is-open')).toBeTruthy();
  await user.keyboard('{Escape}');
  expect(view.container.querySelector('.sidebar.is-open')).toBeNull();
  expect(document.activeElement).toBe(more);
});
it('leaves the dock out of study sheet pages', () => {
  window.location.hash = '#/lernzettel/bk1-lf3/bindungsphasen'; show();
  expect(screen.queryByRole('navigation', { name: 'Schnellnavigation' })).toBeNull();
  expect(screen.getByRole('heading', { name: '2. Bindungsphasen und Entwicklung der Beziehung', level: 1 })).toBeTruthy();
});
