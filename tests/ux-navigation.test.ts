import { describe, expect, it } from 'vitest';
import { breadcrumbsFor, isLearningSession } from '../src/utils/navigation';
import { buildSearchIndex, commandSuggestions } from '../src/features/search';
import { catalog } from '../src/data/catalog';
describe('Navigation hierarchy and suggestions', () => {
  it('links valid subject and field parents and omits invalid hierarchies', () => {
    expect(breadcrumbsFor('/faecher/bk1/lernfelder/bk1-lf2').map(c => c.to)).toEqual(['/', '/faecher', '/faecher/bk1', '/faecher/bk1/lernfelder/bk1-lf2']);
    expect(breadcrumbsFor('/faecher/bk1/lernfelder/bk2-lf1')).toEqual([]);
    expect(breadcrumbsFor('/')).toEqual([]);
    expect(breadcrumbsFor('/materialien').at(-1)?.label).toBe('Materialien');
  });
  it('uses actual content relationships and enables focus only for known sessions', () => {
    const quiz = catalog.quizzes[0]!;
    const route = `/quizze/${quiz.id}`;
    const crumbs = breadcrumbsFor(route);
    expect(crumbs.at(-1)).toEqual({ to: route, label: quiz.title });
    expect(crumbs.some(c => c.to === `/faecher/${quiz.subjectId}/lernfelder/${quiz.learningFieldId}`)).toBe(true);
    expect(isLearningSession(route)).toBe(true);
    expect(isLearningSession('/quizze/missing')).toBe(false);
    expect(isLearningSession('/quizze')).toBe(false);
    expect(isLearningSession(`/materialien/${catalog.materials[0]!.id}`)).toBe(false);
  });
  it('puts unique, available recent content first, then navigation; rejects unknown or external history', () => {
    const index = buildSearchIndex(s => s ?? '', 'de');
    const routes = index.filter(e => e.id.startsWith('material:')).slice(0, 8).map(e => e.to);
    const suggestions = commandSuggestions(index, ['https://example.com', '/materialien/missing', routes[0]!, ...routes]);
    expect(suggestions.filter(e => e.recent)).toHaveLength(6);
    expect(suggestions[0]?.to).toBe(routes[0]);
    expect(new Set(suggestions.map(e => e.to)).size).toBe(suggestions.length);
    expect(suggestions.filter(e => !e.recent).every(e => e.id.startsWith('nav:'))).toBe(true);
    expect(commandSuggestions(index, []).every(e => !e.recent)).toBe(true);
  });
});
