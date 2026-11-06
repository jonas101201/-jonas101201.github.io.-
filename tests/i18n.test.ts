import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import translations from '../src/i18n/uk.json';
import { formatCount, LANGUAGE_KEY, readLanguage, translateText, translateTree } from '../src/i18n/translate';
import { catalog } from '../src/data/catalog';
import { studySheets, validateStudySheets } from '../src/features/study-sheets/data';
import { validateCatalog } from '../src/utils/validate';
import { describeAnswer, evaluate, solution } from '../src/features/quizzes/engine';

const dictionary: Record<string, string> = translations;
const textKeys = new Set(['title','subtitle','description','prompt','explanation','text','left','right','front','back','intro','points','term','definition','headers','rows','takeaway','scenario','analysis','action','question','answer']);
function contentStrings(value: unknown, local = false): string[] {
  if (typeof value === 'string') return local ? [value] : [];
  if (Array.isArray(value)) return value.flatMap(item => contentStrings(item, local));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([key, item]) => contentStrings(item, textKeys.has(key)));
  return [];
}
describe('Deutsch und Ukrainisch', () => {
  it('übersetzt jeden Lerntext einschließlich aller Antworten und Tabellen', () => {
    const strings = new Set(contentStrings([catalog.quizzes, catalog.flashcardSets, studySheets, catalog.subjects, catalog.learningFields]));
    for (const source of strings) expect(dictionary[source], source).toBeTruthy();
  });
  it('enthält die direkt verwendeten Beschriftungen der Oberfläche', () => {
    for (const file of readdirSync(resolve('src'), { recursive: true, encoding: 'utf8' }).filter(file => file.endsWith('.tsx'))) {
      const ast = ts.createSourceFile(file, readFileSync(resolve('src', file), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      function inspect(node: ts.Node) {
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'tr' && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) {
          const text = node.arguments[0].text.trim();
          expect(dictionary[text], `${file}: ${text}`).toBeTruthy();
        }
        ts.forEachChild(node, inspect);
      }
      inspect(ast);
    }
  });
  it('erhält in allen Übersetzungen die Platzhalter', () => {
    const placeholders = (text: string) => [...text.matchAll(/\{\d+\}/g)].map(match => match[0]).sort();
    for (const [source, target] of Object.entries(dictionary)) expect(placeholders(target), source).toEqual(placeholders(source));
  });
  it('erhält IDs, Quellen, richtige Antworten und originale Daten', () => {
    const before = JSON.stringify(catalog);
    const uk = validateCatalog({ ...catalog, quizzes: translateTree(catalog.quizzes, 'uk'), flashcardSets: translateTree(catalog.flashcardSets, 'uk') });
    expect(uk.quizzes.map(q => q.id)).toEqual(catalog.quizzes.map(q => q.id));
    for (const quiz of uk.quizzes) {
      const source = catalog.quizzes.find(q => q.id === quiz.id)!;
      expect(quiz.materialIds).toEqual(source.materialIds);
      const answers = Object.fromEntries(quiz.questions.map(q => [q.id, q.type === 'matching' ? Object.fromEntries(q.pairs.map(p => [p.id, p.id])) : q.correctOptionIds]));
      expect(evaluate(quiz.questions, answers).score).toBe(quiz.questions.length);
      expect(quiz.questions.map(q => q.id)).toEqual(source.questions.map(q => q.id));
    }
    expect(validateStudySheets(translateTree(studySheets, 'uk'))).toHaveLength(studySheets.length);
    expect(JSON.stringify(catalog)).toBe(before);
  });
  it('übersetzt zusammengesetzte Auswertungen statt nur ganze Sätze', () => {
    const tr = (source: string) => translateText(source, 'uk');
    const question = catalog.quizzes.flatMap(q => q.questions).find(q => q.type === 'matching')!;
    expect(solution(question, tr)).not.toBe(solution(question));
    expect(describeAnswer(question, undefined, tr)).toBe('Відповіді немає');
  });
  it('verwendet einen getrennten Speicherschlüssel und fällt bei Problemen auf Deutsch zurück', () => {
    expect(LANGUAGE_KEY).not.toContain('progress');
    expect(readLanguage({ getItem: () => 'uk' })).toBe('uk');
    expect(readLanguage({ getItem: () => 'de' })).toBe('de');
    for (const value of [null, 'xx', '{broken']) expect(readLanguage({ getItem: () => value })).toBe('de');
    expect(readLanguage({ getItem: () => { throw new Error('blocked'); } })).toBe('de');
  });
  it('bildet ukrainische Mengenformen für 1, 4 und 5 korrekt', () => {
    expect(formatCount(1, 'sections', 'uk')).toBe('1 розділ');
    expect(formatCount(4, 'sections', 'uk')).toBe('4 розділи');
    expect(formatCount(5, 'sections', 'uk')).toBe('5 розділів');
    expect(formatCount(21, 'cards', 'uk')).toBe('21 картка');
    expect(formatCount(12, 'cards', 'uk')).toBe('12 карток');
    expect(formatCount(2, 'pages', 'de')).toBe('2 Seiten');
  });
  it('erhält deutsche Texte, Leerzeichen und Werte bei der Umschaltung', () => {
    expect(translateText('Frage', 'de')).toBe('Frage');
    expect(translateText(' Frage ', 'uk')).toBe(' Запитання ');
    expect(translateText('Klasse {0} öffnen', 'uk', ['ERZ.1.2'])).toBe('Відкрити клас ERZ.1.2');
    expect(translateText('Neue nicht übersetzte Unterlage', 'uk')).toBe('Neue nicht übersetzte Unterlage');
  });
});
