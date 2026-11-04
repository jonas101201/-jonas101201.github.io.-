import { describe, expect, it } from 'vitest';
import { catalog } from '../src/data/catalog';
import { validateCatalog } from '../src/utils/validate';
import { materialUrl, isSafeMaterialPath } from '../src/utils/paths';
import { evaluate } from '../src/features/quizzes/engine';
const materials = catalog.materials.filter(m => m.learningFieldId === 'bk1-lf2');
describe('BK1 LF2: gemischte Unterrichtsdateien und Lerninhalte', () => {
  it('übernimmt alle 26 Originaldateien aus acht Themenbereichen', () => {
    expect(materials).toHaveLength(26);
    expect(new Set(materials.map(m => m.topicId)).size).toBe(8);
    expect(materials.filter(m => m.fileType === 'DOCX')).toHaveLength(15);
    expect(materials.filter(m => m.fileType === 'PNG')).toHaveLength(8);
    expect(materials.filter(m => m.fileType === 'PDF')).toHaveLength(3);
    for (const m of materials) {
      expect(m).toMatchObject({ subjectId: 'bk1', example: false });
      expect(m.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(m.originalFilename?.toLowerCase()).toMatch(new RegExp(`\\.${m.fileType.toLowerCase()}$`));
    }
  });
  it('hält Original-Worddatei und geprüfte PDF-Vorschau getrennt', () => {
    for (const m of materials.filter(m => m.fileType === 'DOCX')) {
      expect(m.path).toMatch(/\.docx$/);
      expect(m.preview?.path).toMatch(/-vorschau\.pdf$/);
      expect(m.preview?.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(m.preview?.sizeBytes).toBeGreaterThan(0);
      expect(m.pageCount).toBe(m.preview?.pageCount);
      expect(materialUrl(m.preview!.path, 'https://materials.example.test')).toBe(`https://materials.example.test/${m.preview!.path}`);
    }
    expect(materials.filter(m => m.fileType !== 'DOCX').some(m => m.preview)).toBe(false);
  });
  it('unterscheidet gleichnamige Arbeitsblätter aus unterschiedlichen ZIPs', () => {
    const matches = materials.filter(m => m.originalFilename === '2_AB_Merkmale der Entwicklung.docx');
    expect(matches).toHaveLength(2);
    expect(new Set(matches.map(m => m.path)).size).toBe(2);
    expect(new Set(matches.map(m => m.topicId)).size).toBe(2);
    expect(matches[0]!.sha256).not.toBe(matches[1]!.sha256);
  });
  it('liefert auswertbare Fragen und Karten mit Quellen im selben Lernfeld', () => {
    const quiz = catalog.quizzes.find(q => q.id === 'bk1-lf2-gesamtquiz')!;
    const set = catalog.flashcardSets.find(s => s.id === 'bk1-lf2-lernkarten')!;
    expect(quiz.questions).toHaveLength(20); expect(set.cards).toHaveLength(24);
    expect(new Set(quiz.questions.map(q => q.type)).size).toBe(4);
    for (const item of [...quiz.questions, ...set.cards]) {
      expect(item.materialIds?.length).toBeGreaterThan(0);
      for (const id of item.materialIds!) expect(materials.some(m => m.id === id)).toBe(true);
    }
    const answers = Object.fromEntries(quiz.questions.map(q => [q.id, q.type === 'matching' ? Object.fromEntries(q.pairs.map(p => [p.id, p.id])) : q.correctOptionIds]));
    expect(evaluate(quiz.questions, answers)).toMatchObject({ score: 20, total: 20, wrongQuestionIds: [] });
  });
  it('erlaubt sichere PNG-URLs und blockiert weiterhin Traversierung', () => {
    expect(materialUrl('materials/bk1/lf2/bild.png','https://materials.example.test')).toBe('https://materials.example.test/materials/bk1/lf2/bild.png');
    for (const path of ['materials/../bild.png', 'materials/%2e%2e/bild.png', 'https://fremd.test/bild.png']) expect(isSafeMaterialPath(path)).toBe(false);
  });
  it.each(['materials/../vorschau.pdf', 'materials/vorschau.docx'])('blockiert ungültige Vorschaupfade: %s', path => {
    const invalid = structuredClone(catalog);
    invalid.materials.find(m => m.fileType === 'DOCX')!.preview!.path = path;
    expect(() => validateCatalog(invalid)).toThrow('Vorschau');
  });
});
