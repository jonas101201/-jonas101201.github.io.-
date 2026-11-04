import { describe, expect, it } from 'vitest';
import { catalog } from '../src/data/catalog';
import { sheetSearchText, studySheets, validateStudySheets } from '../src/features/study-sheets/data';

describe('Lernzettel aus den Unterrichtsunterlagen', () => {
  it('deckt jedes belegte BK-Lernfeld ohne erfundene Lernfelder ab', () => {
    const available = new Set(catalog.materials.filter(m => ['bk1', 'bk2'].includes(m.subjectId) && !m.example).map(m => m.learningFieldId));
    expect(new Set(studySheets.map(s => s.learningFieldId))).toEqual(available);
    expect(studySheets.every(s => s.sections.length >= 4 && s.review.length >= 3)).toBe(true);
  });
  it('weist fehlende, fremde und fachfremde Unterrichtsquellen zurück', () => {
    for (const ref of ['fehlt', 'bk2-lf1-1-0-zusammenhang-selbstbild-fremdbild']) {
      const changed = structuredClone(studySheets);
      changed[0]!.sections[0]!.materialIds = [ref];
      expect(() => validateStudySheets(changed)).toThrow('Ungültige Lernzettelquelle');
    }
  });
  it('weist doppelte Lernfelder und beschädigte Tabellen zurück', () => {
    expect(() => validateStudySheets([...studySheets, studySheets[0]])).toThrow('Doppelter Lernzettel');
    const changed = structuredClone(studySheets);
    const table = changed.flatMap(s => s.sections).find(s => s.table)!.table!;
    table.rows[0]!.pop();
    expect(() => validateStudySheets(changed)).toThrow('Ungültige Tabelle');
  });
  it('findet auch Begriffe aus Tabellen und Erklärungen', () => {
    expect(sheetSearchText(studySheets.find(s => s.id === 'bk2-lf2')!)).toContain('reliabilität');
    expect(sheetSearchText(studySheets.find(s => s.id === 'bk1-lf2')!)).toContain('intraindividuelle');
  });
});
