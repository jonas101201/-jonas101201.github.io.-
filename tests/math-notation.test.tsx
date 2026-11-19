// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import katex from 'katex';
import { LanguageProvider } from '../src/i18n/LanguageProvider';
import { translateTree } from '../src/i18n/translate';
import { studySheets } from '../src/features/study-sheets/data';
import MathStudyTopic from '../src/features/study-sheets/MathStudyTopic';
const sheet = studySheets.find(s => s.id === 'mathematik-regression')!;
afterEach(cleanup);

describe('Gesetzte Formeln und nachvollziehbare Rechnungen', () => {
  it('rendert jede gespeicherte Formel und jeden übersetzten Inline-Ausdruck fehlerfrei', () => {
    const expressions: string[] = [];
    function inline(value: unknown) {
      if (typeof value === 'string') {
        expect((value.match(/\$/g) ?? []).length % 2, value).toBe(0);
        for (const match of value.matchAll(/\$([^$]+)\$/g)) expressions.push(match[1]!);
      } else if (Array.isArray(value)) value.forEach(inline);
      else if (value && typeof value === 'object') Object.values(value).forEach(inline);
    }
    inline(sheet); inline(translateTree(sheet, 'uk'));
    for (const topic of sheet.sections) {
      expressions.push(...topic.formulas!.map(f => f.latex));
      for (const c of topic.calculations!) expressions.push(c.formula, ...c.givens, c.result, ...c.steps.flatMap(s => s.expressions), ...(c.check?.expressions ?? []));
    }
    for (const expression of expressions) {
      expect(() => katex.renderToString(expression, { throwOnError: true, strict: 'error', trust: false }), expression).not.toThrow();
    }
  });
  it('trennt die allgemeine x-Formel vom Einsetzen, Umstellen und Ergebnis', () => {
    const topic = sheet.sections.find(t => t.id === 'x-berechnen')!;
    render(<LanguageProvider><MemoryRouter><MathStudyTopic topic={topic}/></MemoryRouter></LanguageProvider>);
    const card = screen.getByRole('article', { name: 'x-Wert bei y = 6 berechnen' });
    expect(within(card).getByText('Gesucht:')).toBeTruthy();
    expect(within(card).getByText('Gegeben')).toBeTruthy();
    expect(within(card).getByText('Allgemeine Formel')).toBeTruthy();
    expect(card.querySelector('.math-start-formula annotation')!.textContent).toBe('x=\\frac{y-b}{m}');
    expect(card.querySelector('.math-start-formula mfrac')).toBeTruthy();
    expect(within(card).getByRole('heading', { name: 'Auf beiden Seiten 9,5 abziehen' })).toBeTruthy();
    expect(card.querySelector('.math-result annotation')!.textContent).toBe('x\\approx4{,}17');
    expect(within(card).getByText('Probe')).toBeTruthy();
  });
  it('setzt die Korrelationsformel mit echter Wurzel über einem Bruch', () => {
    const topic = sheet.sections.find(t => t.id === 'korrelation')!;
    render(<LanguageProvider><MemoryRouter><MathStudyTopic topic={topic}/></MemoryRouter></LanguageProvider>);
    const card = screen.getByRole('article', { name: 'Richtung und Stärke berechnen' });
    expect(card.querySelector('.math-start-formula msqrt mfrac')).toBeTruthy();
    expect(within(card).getByRole('heading', { name: 'Das Vorzeichen aus der Richtung übernehmen' })).toBeTruthy();
    expect(card.querySelector('.math-result annotation')!.textContent).toBe('r\\approx-0{,}95');
  });
  it('erhält die mathematische Notation bei der Sprachumschaltung', () => {
    const translated = translateTree(sheet, 'uk');
    for (const [i, topic] of sheet.sections.entries()) {
      expect(translated.sections[i]!.formulas!.map(f => f.latex)).toEqual(topic.formulas!.map(f => f.latex));
      expect(translated.sections[i]!.calculations!.map(c => c.result)).toEqual(topic.calculations!.map(c => c.result));
      expect(translated.sections[i]!.calculations![0]!.goal).not.toBe(topic.calculations![0]!.goal);
    }
  });
});
