// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HashRouter } from 'react-router-dom';
import { LanguageProvider } from '../src/i18n/LanguageProvider';
import { SearchPage } from '../src/pages/SearchPage';
afterEach(() => { cleanup(); vi.unstubAllGlobals(); window.location.hash = ''; });
it('validates an empty query and submits into the hash-router query without reloading', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  window.location.hash = '#/suche';
  render(<HashRouter><LanguageProvider><SearchPage/></LanguageProvider></HashRouter>);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Suchen' }));
  expect(screen.getByRole('alert').textContent).toContain('Begriff');
  const input = screen.getByRole('textbox', { name: 'Suchbegriff' });
  expect(document.activeElement).toBe(input);
  await user.type(input, '  Bindung  '); await user.click(screen.getByRole('button', { name: 'Suchen' }));
  await waitFor(() => expect(window.location.hash).toBe('#/suche?q=Bindung'));
  expect(window.location.search).toBe('');
  expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
  expect(screen.queryByRole('alert')).toBeNull();
});
