import { describe, expect, it } from 'vitest';
import { buildSearchIndex, moveSelection, searchIndex } from '../src/features/search';
import { catalog } from '../src/data/catalog';
const index = buildSearchIndex(s => s ?? '', 'de');
describe('Shared metadata search', () => {
  it('indexes each supported content type with a unique route and stable identity', () => {
    expect(new Set(index.map(e => e.id)).size).toBe(index.length);
    for (const kind of ['material:', 'sheet:', 'quiz:', 'cards:', 'nav:']) expect(index.some(e => e.id.startsWith(kind))).toBe(true);
    expect(index.filter(e => e.id.startsWith('material:'))).toHaveLength(catalog.materials.length);
    expect(index.every(e => e.to.startsWith('/') && !e.to.startsWith('//'))).toBe(true);
  });
  it('matches multiple words, diacritics, source filenames and learning content', () => {
    expect(searchIndex(index, '  SPIELformen  ').some(e => e.id.startsWith('quiz:'))).toBe(true);
    expect(searchIndex(index, 'prufungstraining')[0]!.to).toBe('/pruefungstraining');
    const m = catalog.materials.find(m => m.originalFilename)!;
    expect(searchIndex(index, m.originalFilename!).some(e => e.id === `material:${m.id}`)).toBe(true);
    expect(searchIndex(index, 'xxxxxxxxxxxxxxxxx')).toEqual([]);
    expect(searchIndex(index, '').every(e => e.id.startsWith('nav:'))).toBe(true);
    expect(searchIndex(index, 'BK2 Spiel').length).toBeGreaterThan(0);
  });
  it('wraps selection and safely handles empty results and boundary keys', () => {
    expect(moveSelection(0, 'ArrowUp', 3)).toBe(2);
    expect(moveSelection(2, 'ArrowDown', 3)).toBe(0);
    expect(moveSelection(1, 'Home', 3)).toBe(0);
    expect(moveSelection(0, 'End', 3)).toBe(2);
    expect(moveSelection(0, 'ArrowDown', 0)).toBe(0);
  });
});

it('finds standalone topics directly, including translated text and recent topic suggestions', () => {
  const results = searchIndex(index, 'Operationalisierung');
  expect(results.some(e => e.to === '/lernzettel/bk2-lf2/hypothesen')).toBe(true);
  expect(index.find(e => e.to === '/lernzettel/bk2-lf2/hypothesen')?.id).toBe('sheet:bk2-lf2/hypothesen');
});

it('searches new topics in Ukrainian while retaining their stable routes', async () => {
  const { translateText } = await import('../src/i18n/translate');
  const uk = buildSearchIndex(s => translateText(s, 'uk'), 'uk');
  expect(searchIndex(uk, 'операціоналізація').some(e => e.to === '/lernzettel/bk2-lf2/hypothesen')).toBe(true);
});
