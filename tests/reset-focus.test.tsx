// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AboutPage } from '../src/pages/AboutPage';
import { ProgressProvider } from '../src/hooks/ProgressProvider';
import { LanguageProvider } from '../src/i18n/LanguageProvider';
afterEach(() => { cleanup(); localStorage.clear(); });
it('focuses the safe cancel action and restores the reset trigger on cancellation', async () => {
  render(<MemoryRouter><LanguageProvider><ProgressProvider><AboutPage/></ProgressProvider></LanguageProvider></MemoryRouter>);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button',{name:'Lokalen Fortschritt zurücksetzen'}));
  const cancel = screen.getByRole('button',{name:'Abbrechen'});
  expect(document.activeElement).toBe(cancel);
  await user.click(cancel);
  expect(document.activeElement).toBe(screen.getByRole('button',{name:'Lokalen Fortschritt zurücksetzen'}));
  expect(screen.queryByRole('button',{name:'Ja, Fortschritt zurücksetzen'})).toBeNull();
});
