// @vitest-environment jsdom
import { prepareLanguage } from '../src/i18n/translate';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { catalog } from '../src/data/catalog';
import { LanguageProvider } from '../src/i18n/LanguageProvider';
import { StudySheetList } from '../src/features/study-sheets/StudySheetPages';
import { sheetSources, studySheets, validateStudySheets } from '../src/features/study-sheets/data';
import { translateTree } from '../src/i18n/translate';
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
    const calculations = sheet.sections.find(t => t.id === 'geraden-aufstellen')!.calculations!;
    const expressions = calculations.flatMap(c => c.steps.flatMap(s => s.expressions));
    const decimal = (n: number) => n.toFixed(9).replace('.', '{,}');
    for (const [suffix, m] of [['x', m1], ['y', m2]] as const) {
      expect(expressions).toContain(`m_${suffix}\\approx ${decimal(m)}`);
      expect(expressions).toContain(`b_${suffix}\\approx ${decimal(y - m * x)}`);
    }
    expect(-Math.sqrt(m1 / m2)).toBeCloseTo(-0.9430225);
  });
  it('unterscheidet Einsetzen, Umstellen und den vorzeichenbehafteten Koeffizienten', () => {
    expect(-0.79 * 10 + 9.23).toBeCloseTo(1.33);
    expect((6 - 9.5) / -0.84).toBeCloseTo(25 / 6);
    expect(-Math.sqrt(-0.38 / -0.42)).toBeCloseTo(-0.9511897);
    const correlation = sheet.sections.find(t => t.id === 'korrelation')!;
    expect(correlation.intro).toContain('zwischen −1 und +1');
    expect(correlation.intro).toContain('nur der Betrag liegt zwischen 0 und 1');
    expect(sheet.sections.find(t => t.id === 'y-berechnen')!.calculations![0]!.result).toContain('1{,}33');
    expect(sheet.sections.find(t => t.id === 'x-berechnen')!.calculations![0]!.steps.flatMap(s => s.expressions)).toContain('x=\\frac{25}{6}');
  });
});

describe('Wertetabelle und gewichtete Mittelwerte aus dem Unterricht', () => {
  it('enthält alle 21 Wertepaare mit korrekt berechneten Quadraten, Produkten und Summen', () => {
    const table = sheet.sections.find(t => t.id === 'wertetabelle')!.table!;
    expect(table.kind).toBe('values');
    expect(table.rows).toHaveLength(21);
    expect(table.rows[0]).toEqual(['4', '3', '16', '9', '12']);
    for (const row of table.rows) {
      const [x, y, squareX, squareY, product] = row.map(Number) as [number, number, number, number, number];
      expect(squareX).toBe(x * x);
      expect(squareY).toBe(y * y);
      expect(product).toBe(x * y);
    }
    expect(table.totals).toEqual(['60', '85', '202', '419', '229']);
    for (const [index, total] of table.totals!.entries()) expect(table.rows.reduce((sum, row) => sum + Number(row[index]), 0)).toBe(Number(total));
    const broken = structuredClone(studySheets);
    broken.find(s => s.id === sheet.id)!.sections.find(t => t.id === 'wertetabelle')!.table!.totals!.pop();
    expect(() => validateStudySheets(broken)).toThrow('Ungültige Tabelle');
  });
  it('bezeichnet und berechnet alle vier gewichteten Mittelwerte getrennt', () => {
    const weightedX = sheet.sections.find(t => t.id === 'gewichtete-mittelwerte-x')!;
    const weightedY = sheet.sections.find(t => t.id === 'gewichtete-mittelwerte-y')!;
    const cases = [
      [weightedX, 0, 'x_x', '\\sum x^2', 'x', 51925, 505],
      [weightedX, 1, 'y_x', '\\sum xy', 'x', 14175, 505],
      [weightedY, 0, 'x_y', '\\sum xy', 'y', 14175, 145],
      [weightedY, 1, 'y_y', '\\sum y^2', 'y', 4475, 145],
    ] as const;
    for (const [topic, index, symbol, numerator, weight, sum, denominator] of cases) {
      const calculation = topic.calculations![index]!;
      expect(calculation.formula).toBe(`${symbol}=\\frac{${numerator}}{\\sum ${weight}}`);
      expect(calculation.result).toBe(`${symbol}\\approx${(sum / denominator).toFixed(2).replace('.', '{,}')}`);
      expect(topic.context!.title).toContain('13.01.2026');
    }
    const results = searchIndex(buildSearchIndex(s => s ?? '', 'de'), 'gewichtete mittelwerte nach x');
    expect(results[0]!.to).toBe('/lernzettel/mathematik-regression/gewichtete-mittelwerte-x');
  });
  it('verwendet die entfernten Delta-Zeichen auch nach der Sprachumschaltung nicht', () => {
    for (const language of ['de', 'uk'] as const) expect(JSON.stringify(translateTree(sheet, language))).not.toMatch(/\\Delta|Δx|Δy/);
  });
});

await prepareLanguage('uk');
