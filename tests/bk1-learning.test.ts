import { describe, expect, it } from 'vitest';
import { catalog } from '../src/data/catalog';
import { evaluate } from '../src/features/quizzes/engine';

describe('BK1 LF1: Originalunterlagen und Lerninhalte', () => {
  const materials = catalog.materials.filter(m => m.learningFieldId === 'bk1-lf1');
  const quiz = catalog.quizzes.find(q => q.id === 'bk1-lf1-gesamtquiz')!;
  const set = catalog.flashcardSets.find(s => s.id === 'bk1-lf1-lernkarten')!;
  it('ordnet alle fünf Original-PDFs mit 64 Seiten BK1 LF1 zu', () => {
    expect(materials).toHaveLength(5);
    expect(materials.reduce((sum, m) => sum + m.pageCount!, 0)).toBe(64);
    for (const m of materials) {
      expect(m).toMatchObject({ subjectId: 'bk1', fileType: 'PDF', example: false });
      expect(m.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(m.originalFilename).toMatch(/\.pdf$/);
    }
  });
  it('liefert 20 auswertbare Fragen und 24 Karten mit passenden Quellen', () => {
    expect(quiz).toMatchObject({ subjectId: 'bk1', learningFieldId: 'bk1-lf1', example: false });
    expect(set).toMatchObject({ subjectId: 'bk1', learningFieldId: 'bk1-lf1', example: false });
    expect(quiz.questions).toHaveLength(20);
    expect(set.cards).toHaveLength(24);
    expect(new Set(quiz.questions.map(q => q.type)).size).toBe(4);
    for (const item of [...quiz.questions, ...set.cards]) {
      expect(item.materialIds?.length).toBeGreaterThan(0);
      for (const id of item.materialIds!) expect(materials.some(m => m.id === id)).toBe(true);
    }
    const answers = Object.fromEntries(quiz.questions.map(q => [q.id, q.type === 'matching' ? Object.fromEntries(q.pairs.map(p => [p.id, p.id])) : q.correctOptionIds]));
    expect(evaluate(quiz.questions, answers)).toMatchObject({ score: 20, total: 20, wrongQuestionIds: [] });
  });
  it('entfernt alle fünf Beispielmaterialien aus dem Katalog', () => {
    expect(catalog.materials.some(m => m.example)).toBe(false);
    for (const id of ['kommunikation-grundlagen', 'prozentrechnung', 'feelings-vocabulary', 'werte-reflexion', 'partizipation']) expect(catalog.materials.some(m => m.id === id)).toBe(false);
    expect(catalog.materials.filter(m => m.learningFieldId !== 'bk1-lf2')).toHaveLength(66);
    expect(catalog.materials.filter(m => m.learningFieldId !== 'bk1-lf2').reduce((sum, m) => sum + m.pageCount!, 0)).toBe(544);
  });
});
