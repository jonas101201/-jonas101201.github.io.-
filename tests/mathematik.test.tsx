// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { catalog } from '../src/data/catalog';
import { LanguageProvider } from '../src/i18n/LanguageProvider';
import { StudySheetList } from '../src/features/study-sheets/StudySheetPages';
import { sheetSources, studySheets, validateStudySheets } from '../src/features/study-sheets/data';
import { buildSearchIndex, searchIndex } from '../src/features/search';
import { breadcrumbsFor } from '../src/utils/navigation';

const sheet = studySheets.find(s => s.id === 'mathematik-regression')!;
beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('Mathematik ohne erfundenes BK-Lernfeld', () => {
  it('verknüpft drei Original-PDFs und zwei gekennzeichnete Bildabschriften', () => {
    const materials = catalog.materials.filter(m => m.subjectId === 'mathematik');
    expect(sheet.subjectId).toBe('mathematik');
    expect(sheet.learningFieldId).toBeUndefined();
    expect(materials.filter(m => m.fileType === 'PDF').map(m => m.originalFilename).sort()).toEqual(['Protokoll 1.pdf', 'Protokoll 3.1.pdf', 'Protokoll 3.2.pdf']);
    expect(materials.filter(m => m.fileType === 'TXT').every(m => m.title.includes('Abschrift'))).toBe(true);
    expect(materials).toHaveLength(5);
    expect(new Set(sheetSources(sheet))).toEqual(new Set(materials.map(m => m.id)));
    for (const material of materials) {
      expect(material.learningFieldId).toBeUndefined();
      expect(material.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(material.sizeBytes).toBeGreaterThan(0);
      expect(material.example).toBe(false);
    }
  });
  it('weist unbekannte Fächer, fehlende BK-Lernfelder und fachfremde Quellen zurück', () => {
    const unknown = structuredClone(studySheets);
    unknown.find(s => s.id === sheet.id)!.subjectId = 'unbekannt';
    expect(() => validateStudySheets(unknown)).toThrow('Unbekanntes Fach');
    const missing = structuredClone(studySheets);
    delete missing.find(s => s.subjectId === 'bk1')!.learningFieldId;
    expect(() => validateStudySheets(missing)).toThrow('Ungültiges Lernfeld');
    const wrongSource = structuredClone(studySheets);
    wrongSource.find(s => s.id === sheet.id)!.sections[0]!.materialIds = ['bk1-lf3-03-bindung-diehl'];
    expect(() => validateStudySheets(wrongSource)).toThrow('Ungültige Lernzettelquelle');
  });
  it('zeigt Mathe in der Fachansicht und lässt global danach filtern', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<LanguageProvider><MemoryRouter><StudySheetList subjectId="mathematik" embedded/></MemoryRouter></LanguageProvider>);
    expect(screen.getByRole('link', { name: sheet.title }).getAttribute('href')).toBe(`/lernzettel/${sheet.id}`);
    expect(screen.queryByText(/Weitere Lernfelder/)).toBeNull();
    unmount();
    render(<LanguageProvider><MemoryRouter><StudySheetList/></MemoryRouter></LanguageProvider>);
    await user.click(screen.getByRole('button', { name: 'Mathematik' }));
    const article = screen.getByRole('article');
    expect(within(article).getByRole('link', { name: sheet.title })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Bindung und Erziehung' })).toBeNull();
  });
  it('findet den Korrelationszettel in der Suche und ordnet seine Brotkrumen Mathe zu', () => {
    const index = buildSearchIndex(s => s ?? '', 'de');
    expect(searchIndex(index, 'Korrelationskoeffizient').some(entry => entry.to === '/lernzettel/mathematik-regression/korrelation')).toBe(true);
    const crumbs = breadcrumbsFor('/lernzettel/mathematik-regression/korrelation');
    expect(crumbs.map(c => c.to)).toContain('/faecher/mathematik');
    expect(crumbs.some(c => c.label.includes('Lernfeld'))).toBe(false);
  });
});

describe('Nachgerechnete Beispiele statt übernommener Vorzeichenfehler', () => {
  it('kontrolliert Steigungen, Achsenabschnitte und Korrelation anhand der gegebenen Summen', () => {
    const x = 505 / 5, y = 145 / 5;
    const m1 = (14175 / 505 - y) / (51925 / 505 - x);
    const m2 = (4475 / 145 - y) / (14175 / 145 - x);
    const rows = sheet.sections.find(t => t.id === 'geraden-aufstellen')!.table!.rows;
    const decimal = (n: number) => n.toFixed(9).replace('.', ',').replace('-', '−');
    expect(rows.find(r => r[0] === 'Steigung mit ungerundeten Hilfspunkten')!.slice(1)).toEqual([
      `mₓ ≈ ${decimal(m1)}`, `mᵧ ≈ ${decimal(m2)}`,
    ]);
    expect(rows.find(r => r[0] === 'Achsenabschnitt b = 29 − m·101')!.slice(1)).toEqual([
      `bₓ ≈ ${decimal(y - m1 * x)}`, `bᵧ ≈ ${decimal(y - m2 * x)}`,
    ]);
    expect(-Math.sqrt(m1 / m2)).toBeCloseTo(-0.9430225);
  });
  it('unterscheidet Einsetzen, Umstellen und den vorzeichenbehafteten Koeffizienten', () => {
    expect(-0.79 * 10 + 9.23).toBeCloseTo(1.33);
    expect((6 - 9.5) / -0.84).toBeCloseTo(25 / 6);
    expect(-Math.sqrt(-0.38 / -0.42)).toBeCloseTo(-0.9511897);
    const correlation = sheet.sections.find(t => t.id === 'korrelation')!;
    expect(correlation.intro).toContain('zwischen −1 und +1');
    expect(correlation.intro).toContain('nur der Betrag liegt zwischen 0 und 1');
    expect(sheet.sections.find(t => t.id === 'y-berechnen')!.table!.rows.at(-1)![1]).toContain('1,33');
    expect(sheet.sections.find(t => t.id === 'x-berechnen')!.table!.rows.at(-2)![1]).toContain('25/6');
  });
});
