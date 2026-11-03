import { describe, expect, it } from 'vitest';
import { catalog } from '../src/data/catalog';
import { validateCatalog } from '../src/utils/validate';
import { evaluate, isComplete } from '../src/features/quizzes/engine';

describe('BK2 LF1 bis LF4: Unterrichtsquizze und Lernkarten', () => {
  it.each([1, 2, 3, 4])('liefert für LF%i vollständige, belegte Lerninhalte mit auswertbaren Lösungen', lf => {
    const quiz = catalog.quizzes.find(q => q.id === `bk2-lf${lf}-gesamtquiz`)!;
    const set = catalog.flashcardSets.find(s => s.id === `bk2-lf${lf}-lernkarten`)!;
    expect(quiz).toMatchObject({ subjectId: 'bk2', learningFieldId: `bk2-lf${lf}`, example: false });
    expect(set).toMatchObject({ subjectId: 'bk2', learningFieldId: `bk2-lf${lf}`, example: false });
    expect(quiz.questions).toHaveLength(20);
    expect(set.cards).toHaveLength(24);
    expect(new Set(quiz.questions.map(q => q.type)).size).toBe(4);
    expect(new Set(quiz.questions.map(q => q.prompt)).size).toBe(20);
    expect(new Set(set.cards.map(c => c.front)).size).toBe(24);
    const answers = Object.fromEntries(quiz.questions.map(q => {
      const answer = q.type === 'matching' ? Object.fromEntries(q.pairs.map(p => [p.id, p.id])) : q.correctOptionIds;
      expect(isComplete(q, answer)).toBe(true);
      expect(q.explanation.length).toBeGreaterThan(50);
      return [q.id, answer];
    }));
    expect(evaluate(quiz.questions, answers)).toMatchObject({ score: 20, total: 20, wrongQuestionIds: [] });
    for (const item of [...quiz.questions, ...set.cards]) {
      expect(item.materialIds?.length).toBeGreaterThan(0);
      for (const id of item.materialIds!) expect(catalog.materials.find(m => m.id === id)).toMatchObject({ subjectId: 'bk2', learningFieldId: `bk2-lf${lf}`, example: false });
    }
    expect(new Set(quiz.materialIds)).toEqual(new Set([...quiz.questions, ...set.cards].flatMap(i => i.materialIds!)));
  });
  it('übernimmt alle 20 neuen PDFs mit Integritätsmetadaten', () => {
    const files = catalog.materials.filter(m => ['bk2-lf2', 'bk2-lf3'].includes(m.learningFieldId ?? '') && !m.example);
    expect(files.filter(m => m.learningFieldId === 'bk2-lf2')).toHaveLength(19);
    expect(files.filter(m => m.learningFieldId === 'bk2-lf3')).toHaveLength(1);
    expect(files.reduce((sum, m) => sum + m.pageCount!, 0)).toBe(195);
    for (const m of files) {
      expect(m.originalFilename).toMatch(/^BK2 .*\.pdf$/);
      expect(m.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(m.sizeBytes).toBeGreaterThan(0);
    }
  });
  it('verhindert unbekannte Unterrichtsquellen', () => {
    const invalid = structuredClone(catalog);
    invalid.quizzes.find(q => q.id === 'bk2-lf1-gesamtquiz')!.questions[0]!.materialIds = ['gibt-es-nicht'];
    expect(() => validateCatalog(invalid)).toThrow('Ungültige Unterrichtsquelle');
  });
  it('verhindert Quellen aus einem anderen Lernfeld', () => {
    const invalid = structuredClone(catalog);
    invalid.flashcardSets.find(s => s.id === 'bk2-lf3-lernkarten')!.cards[0]!.materialIds = [catalog.materials.find(m => m.learningFieldId === 'bk2-lf2')!.id];
    expect(() => validateCatalog(invalid)).toThrow('Ungültige Unterrichtsquelle');
  });
});
