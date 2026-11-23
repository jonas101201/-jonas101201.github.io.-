// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from '../src/i18n/LanguageProvider';
import { ClassEvents } from '../src/features/classroom/ClassEvents';
import { classroom } from '../src/features/classroom/config';
import { DateDetailPage } from '../src/pages/DatesPage';
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-23T12:00:00Z')); });
afterEach(() => { cleanup(); vi.useRealTimers(); });
it('records both exam dates without assigning unrelated study sheets', () => {
  expect(classroom.events.filter(e => e.date >= '2027-02-22').map(e => [e.date, e.title, e.subjectId, e.studySheetId])).toEqual([
    ['2027-02-22', 'GLN BK2 · Partizipation', 'bk2', undefined],
    ['2027-04-19', '4. GLN BK1 · Lerntheorie', 'bk1', undefined],
  ]);
});
it('renders dated events as links and opens an honest pending state', () => {
  render(<LanguageProvider><MemoryRouter><ClassEvents/></MemoryRouter></LanguageProvider>);
  expect(screen.getByRole('link', { name: /GLN BK2 · Partizipation/ }).getAttribute('href')).toBe('/termine/gln-bk2-2027-02-22');
  expect(screen.getByRole('link', { name: /4. GLN BK1 · Lerntheorie/ }).getAttribute('href')).toBe('/termine/gln-bk1-2027-04-19');
  cleanup();
  render(<LanguageProvider><MemoryRouter initialEntries={['/termine/gln-bk1-2027-04-19']}><Routes><Route path="/termine/:id" element={<DateDetailPage/>}/></Routes></MemoryRouter></LanguageProvider>);
  expect(screen.getByRole('heading', { name: 'Lernzettel folgt' })).toBeTruthy();
  expect(screen.getByText(/19. April 2027/)).toBeTruthy();
});
