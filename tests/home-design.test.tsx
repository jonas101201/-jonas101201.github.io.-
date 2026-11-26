// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../src/app/App';
import { LanguageProvider } from '../src/i18n/LanguageProvider';
import { catalog } from '../src/data/catalog';
vi.mock('../src/utils/liquidGlass', () => ({ mountLiquidGlass: () => () => {} }));
vi.mock('../src/components/ClayBackground', () => ({ ClayBackground: () => null }));
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
it('opens the shop in one tap and moves the supplementary links to the header menu', async () => {
  const user = userEvent.setup(); const view = show();
  const dock = screen.getByRole('navigation', { name: 'Schnellnavigation' });
  await user.click(within(dock).getByRole('link', { name: 'Suche' }));
  expect(screen.getByRole('search')).toBeTruthy();
  expect(within(dock).getByRole('link', { name: 'Suche' }).getAttribute('aria-current')).toBe('page');
  expect(within(dock).getAllByRole('link').map(link => link.textContent)).toEqual(['Start', 'Lernen', 'Suche', 'Termine', 'Shop']);
  await user.click(within(dock).getByRole('link', { name: 'Shop' }));
  expect(window.location.hash).toBe('#/fortschritt/store');
  expect(within(dock).getByRole('link', { name: 'Shop' }).getAttribute('aria-current')).toBe('page');
  const trigger = screen.getByRole('button', { name: 'LernHub-Menü' });
  await user.click(trigger);
  const menu = screen.getByRole('dialog', { name: 'LernHub-Menü' });
  for (const label of ['Fortschritt', 'Klasse', 'Speicher', 'Datenschutz', 'Über LernHub']) {
    expect(within(menu).getByRole('link', { name: label })).toBeTruthy();
  }
  expect(within(menu).getByRole('link', { name: 'Wunschliste' }).getAttribute('href')).toBe('#/fortschritt/store?auswahl=wishlist');
  expect(within(menu).queryByRole('link', { name: 'Materialien' })).toBeNull();
  expect(view.container.querySelector('.sidebar.is-open')).toBeNull();
  fireEvent(menu, new Event('cancel', { cancelable: true }));
  expect(screen.queryByRole('dialog', { name: 'LernHub-Menü' })).toBeNull();
  expect(document.activeElement).toBe(trigger);
});
it('keeps the dock in the learning area on study sheet deep links', () => {
  window.location.hash = '#/lernzettel/bk1-lf3/bindungsphasen'; show();
  const dock = screen.getByRole('navigation', { name: 'Schnellnavigation' });
  expect(within(dock).getByRole('link', { name: 'Lernen' }).getAttribute('aria-current')).toBe('location');
  expect(screen.getByRole('heading', { name: '2. Bindungsphasen und Entwicklung der Beziehung', level: 1 })).toBeTruthy();
});
