import { z } from 'zod';
import rawSheets from '../../data/study-sheets.json';
import { catalog } from '../../data/catalog';

const text = z.string().trim().min(1);
const references = z.array(text).min(1);
const SectionSchema = z.object({
  id: text, title: text, intro: text.optional(), points: z.array(text).optional(),
  terms: z.array(z.object({ term: text, definition: text })).optional(),
  table: z.object({ headers: z.array(text).min(2), rows: z.array(z.array(text)).min(1) }).optional(),
  takeaway: text, materialIds: references,
});
const SheetSchema = z.object({
  id: text, subjectId: z.enum(['bk1', 'bk2']), learningFieldId: text,
  title: text, description: text, updatedAt: z.iso.date(),
  sections: z.array(SectionSchema).min(1),
  caseStudy: z.object({ scenario: text, analysis: text, action: text }),
  review: z.array(z.object({ question: text, answer: text })).min(1),
});
export type StudySheet = z.infer<typeof SheetSchema>;

export function validateStudySheets(input: unknown): StudySheet[] {
  const sheets = z.array(SheetSchema).parse(input);
  if (new Set(sheets.map(s => s.id)).size !== sheets.length || new Set(sheets.map(s => s.learningFieldId)).size !== sheets.length) throw new Error('Doppelter Lernzettel');
  for (const sheet of sheets) {
    if (!catalog.learningFields.some(f => f.id === sheet.learningFieldId && f.subjectId === sheet.subjectId)) throw new Error(`Ungültiges Lernfeld: ${sheet.id}`);
    if (new Set(sheet.sections.map(s => s.id)).size !== sheet.sections.length) throw new Error(`Doppelter Abschnitt: ${sheet.id}`);
    for (const section of sheet.sections) {
      if (!section.intro && !section.points?.length && !section.terms?.length && !section.table) throw new Error(`Leerer Abschnitt: ${section.id}`);
      if (section.table?.rows.some(row => row.length !== section.table!.headers.length)) throw new Error(`Ungültige Tabelle: ${section.id}`);
      for (const id of section.materialIds) {
        if (!catalog.materials.some(m => m.id === id && m.subjectId === sheet.subjectId && m.learningFieldId === sheet.learningFieldId && !m.example)) throw new Error(`Ungültige Lernzettelquelle: ${section.id}`);
      }
    }
  }
  return sheets;
}
export const studySheets = validateStudySheets(rawSheets);
export const sheetSources = (sheet: StudySheet) => [...new Set(sheet.sections.flatMap(s => s.materialIds))];
export const sheetSearchText = (sheet: StudySheet) => [sheet.title, sheet.description, ...sheet.sections.flatMap(s => [s.title, s.intro, ...(s.points ?? []), ...(s.terms?.flatMap(t => [t.term, t.definition]) ?? []), ...(s.table?.rows.flat() ?? [])]), sheet.caseStudy.scenario, sheet.caseStudy.analysis, sheet.caseStudy.action, ...sheet.review.flatMap(r => [r.question, r.answer])].join(' ').toLocaleLowerCase('de');
export const readingMinutes = (sheet: StudySheet) => Math.max(1, Math.ceil(sheetSearchText(sheet).split(/\s+/).length / 180));
