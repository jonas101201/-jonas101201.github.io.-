// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from '../src/i18n/LanguageProvider';
import { LANGUAGE_KEY, translateText } from '../src/i18n/translate';
import { StudySheetList, StudySheetPage } from '../src/features/study-sheets/StudySheetPages';
import { studySheets, studyTopics } from '../src/features/study-sheets/data';

beforeEach(() => { localStorage.clear(); vi.stubGlobal('print', vi.fn()); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
function page(path: string) {
  return render(<LanguageProvider><MemoryRouter initialEntries={[path]}><Routes>
    <Route path="/lernzettel" element={<StudySheetList/>}/>
    <Route path="/lernzettel/:id" element={<StudySheetPage/>}/>
    <Route path="/lernzettel/:id/:topicId" element={<StudySheetPage/>}/>
  </Routes></MemoryRouter></LanguageProvider>);
}
describe('Lernzettel nach Ober- und Unterthemen', () => {
  it.each(studyTopics.map(topic => [topic.to, topic] as const))('rendert %s eigenständig und ohne Kontrollfragen', (path, entry) => {
    page(path);
    expect(screen.getByRole('heading', { level: 1, name: entry.title })).toBeTruthy();
    for (const heading of ['Begriff und Bedeutung', 'Praxisbeispiel mit Einordnung', 'Auf einen Blick']) {
      expect(screen.getByRole('heading', { level: 2, name: heading })).toBeTruthy();
    }
    expect(screen.getByText(entry.topic.intro)).toBeTruthy();
    expect(screen.getByText(entry.topic.caseStudy.scenario)).toBeTruthy();
    expect(screen.queryByText('Kontrollfragen')).toBeNull();
    expect(screen.queryByText('Erst selbst beantworten, dann die Lösung öffnen.')).toBeNull();
    expect(screen.getAllByRole('link', { name: 'Zur Themenübersicht' }).every(link => link.getAttribute('href') === `/lernzettel/${entry.parentId}`)).toBe(true);
  });
  it('ordnet alle Unterthemen ihrem Oberthema zu und wechselt zwischen ihnen', async () => {
    const user = userEvent.setup(); page('/lernzettel/bk2-lf2');
    const directory = screen.getByRole('navigation', { name: 'Unterthemen im Überblick' });
    const parent = studySheets.find(s => s.id === 'bk2-lf2')!;
    expect(within(directory).getAllByRole('link')).toHaveLength(parent.sections.length);
    await user.click(within(directory).getAllByRole('link')[0]!);
    expect(screen.getByRole('heading', { level: 1, name: parent.sections[0]!.title })).toBeTruthy();
    await user.click(screen.getByRole('link', { name: /Nächstes Unterthema/ }));
    expect(screen.getByRole('heading', { level: 1, name: parent.sections[1]!.title })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Drucken / als PDF speichern' }));
    expect(window.print).toHaveBeenCalledOnce();
  });
  it('zeigt die Gesamtansicht mit allen Einzelthemen ohne Abfragebereich', () => {
    const { container } = page('/lernzettel/bk2-lf2?ansicht=gesamt');
    const parent = studySheets.find(s => s.id === 'bk2-lf2')!;
    expect(container.querySelectorAll('.sheet-topic')).toHaveLength(parent.sections.length);
    for (const topic of parent.sections) expect(screen.getByRole('heading', { level: 2, name: topic.title })).toBeTruthy();
    expect(screen.queryByText('Kontrollfragen')).toBeNull();
    expect(screen.queryByRole('navigation', { name: 'Unterthemen im Überblick' })).toBeNull();
  });
  it('filtert Unterthemen und erhält den Link zum zugehörigen Oberthema', async () => {
    const user = userEvent.setup(); page('/lernzettel');
    await user.type(screen.getByRole('textbox', { name: 'Lernzettel durchsuchen' }), 'Operationalisierung');
    const article = screen.getByRole('article');
    expect(within(article).getByRole('link', { name: /Hypothese, Operationalisierung/ }).getAttribute('href')).toBe('/lernzettel/bk2-lf2/hypothesen');
    expect(within(article).getByRole('link', { name: 'Themenübersicht öffnen' }).getAttribute('href')).toBe('/lernzettel/bk2-lf2');
  });
  it('übersetzt den vollständigen Aufbau und die neuen Fachbegriffe', () => {
    localStorage.setItem(LANGUAGE_KEY, 'uk'); page('/lernzettel/bk2-lf2/hypothesen');
    const topic = studyTopics.find(s => s.to === '/lernzettel/bk2-lf2/hypothesen')!;
    expect(screen.getByRole('heading', { name: translateText(topic.title, 'uk'), level: 1 })).toBeTruthy();
    expect(screen.getByRole('heading', { name: translateText('Begriff und Bedeutung', 'uk') })).toBeTruthy();
    expect(screen.getByText(translateText(topic.description, 'uk'))).toBeTruthy();
  });
  it('behandelt unbekannte Unterthemen ohne Anzeige eines fremden Lernzettels', () => {
    page('/lernzettel/bk2-lf2/fehlt');
    expect(screen.getByRole('heading', { name: 'Lernzettel nicht gefunden' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Zur Themenübersicht' }).getAttribute('href')).toBe('/lernzettel/bk2-lf2');
  });
});
