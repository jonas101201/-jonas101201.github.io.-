// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from '../src/i18n/LanguageProvider';
import { StudySheetPage } from '../src/features/study-sheets/StudySheetPages';
import { studySheets, validateStudySheets } from '../src/features/study-sheets/data';

const sheet = studySheets.find(s => s.id === 'bk2-lf4')!;
afterEach(cleanup);
describe('BK2 LF4 nach den Ich-kann-Kriterien', () => {
  it('ordnet alle 13 Kriterien passenden, belegten Kapiteln zu und erhält alte Themenlinks', () => {
    expect(sheet.objectives).toHaveLength(13);
    expect(sheet.objectives!.map(goal => goal.topicId)).toEqual([
      'spiel', 'spiel', 'entwicklung', 'emotional-sozial', 'formen', 'kooperationsformen',
      'freispiel', 'schemata', 'schemata', 'begleitung', 'spielzeug', 'spielzeugfrei', 'digital-spiele',
    ]);
    for (const id of ['spiel', 'formen', 'schemata', 'begleitung', 'spielzeug', 'wettbewerb', 'schiessspiele', 'raeume', 'besondere-spiele', 'resilienz', 'inklusion', 'spielplanung']) {
      expect(sheet.sections.some(topic => topic.id === id)).toBe(true);
    }
    for (const goal of sheet.objectives!) expect(sheet.sections.find(topic => topic.id === goal.topicId)!.materialIds.length).toBeGreaterThan(0);
    expect(sheet.sections.find(topic => topic.id === 'spielzeug')!.table!.rows.map(row => row[0])).toEqual([
      'Alter und Entwicklungsstand', 'Fantasie und Vorstellungsvermögen', 'Umwelterfahrungen',
      'Spielmöglichkeiten', 'Material und Verarbeitung', 'Gestaltung, Form und Farbe', 'Größe und Gewicht',
      'Anzahl und Menge', 'Konstruktion und Mechanik', 'Haltbarkeit und Lebensdauer', 'Sicherheit', 'Umweltverträglichkeit', 'Preis',
    ]);
  });
  it('weist ein Lernziel mit nicht vorhandenem Kapitel zurück', () => {
    const changed = structuredClone(studySheets);
    changed.find(s => s.id === sheet.id)!.objectives![0]!.topicId = 'fehlt';
    expect(() => validateStudySheets(changed)).toThrow('Ungültiges Lernziel');
  });
  it('öffnet das Zielkapitel und zeigt dort nur die passenden Kriterien', async () => {
    localStorage.clear();
    render(<LanguageProvider><MemoryRouter initialEntries={['/lernzettel/bk2-lf4']}><Routes>
      <Route path="/lernzettel/:id" element={<StudySheetPage/>}/>
      <Route path="/lernzettel/:id/:topicId" element={<StudySheetPage/>}/>
    </Routes></MemoryRouter></LanguageProvider>);
    const user = userEvent.setup();
    await user.click(screen.getByText('13 Kriterien zur Prüfungsvorbereitung'));
    const goals = screen.getByRole('navigation', { name: 'Ich-kann-Kriterien' });
    expect(within(goals).getAllByRole('link')).toHaveLength(13);
    await user.click(within(goals).getByRole('link', { name: sheet.objectives![6]!.label }));
    expect(screen.getByRole('heading', { level: 1, name: /Freispiel: Merkmale/ })).toBeTruthy();
    const panel = screen.getByRole('heading', { name: 'Passende Ich-kann-Kriterien' }).parentElement!;
    expect(within(panel).getAllByRole('listitem')).toHaveLength(1);
    expect(within(panel).getByText(sheet.objectives![6]!.label)).toBeTruthy();
  });
});
