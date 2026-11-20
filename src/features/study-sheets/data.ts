import { z } from 'zod';
import rawSheets from '../../data/study-sheets.json';
import { catalog } from '../../data/catalog';

const text = z.string().trim().min(1);
const references = z.array(text).min(1);
const CaseSchema = z.object({ scenario: text, analysis: text, action: text, sourceBased: z.boolean().optional() });
const FormulaSchema = z.object({ label: text, latex: text, note: text.optional() });
const CalculationSchema = z.object({
  title: text, goal: text, givens: z.array(text).min(1), formula: text,
  steps: z.array(z.object({ label: text, expressions: z.array(text).min(1), note: text.optional() })).min(1),
  result: text, interpretation: text,
  check: z.object({ expressions: z.array(text).min(1), note: text }).optional(),
});
const SectionSchema = z.object({
  id: text, title: text, intro: text, points: z.array(text).optional(),
  terms: z.array(z.object({ term: text, definition: text })).optional(),
  table: z.object({
    headers: z.array(text).min(2), rows: z.array(z.array(text)).min(1),
    kind: z.enum(['comparison', 'values']).optional(), caption: text.optional(), totals: z.array(text).optional(),
  }).optional(),
  context: z.object({ title: text, text }).optional(),
  takeaway: text, materialIds: references, caseStudy: CaseSchema,
  formulas: z.array(FormulaSchema).min(1).optional(),
  calculations: z.array(CalculationSchema).min(1).optional(),
});
const SheetSchema = z.object({
  id: text, subjectId: text, learningFieldId: text.optional(),
  title: text, description: text, updatedAt: z.iso.date(),
  sections: z.array(SectionSchema).min(1),
  objectives: z.array(z.object({ label: text, topicId: text })).min(1).optional(),
  shortVersion: z.object({
    title: text, description: text, updatedAt: z.iso.date(),
    sections: z.array(z.object({
      id: text, topicId: text, title: text, points: z.array(text),
      tables: z.array(z.object({ caption: text, headers: z.tuple([text, text]), rows: z.array(z.tuple([text, text])).min(1) })).optional(),
    })).min(1),
  }).optional(),
}).strict();
export type StudySheet = z.infer<typeof SheetSchema>;
export type StudyTopic = z.infer<typeof SectionSchema>;

export function validateStudySheets(input: unknown): StudySheet[] {
  const sheets = z.array(SheetSchema).parse(input);
  if (new Set(sheets.map(s => s.id)).size !== sheets.length || new Set(sheets.map(s => `${s.subjectId}:${s.learningFieldId ?? ''}`)).size !== sheets.length) throw new Error('Doppelter Lernzettel');
  for (const sheet of sheets) {
    if (!catalog.subjects.some(s => s.id === sheet.subjectId)) throw new Error(`Unbekanntes Fach: ${sheet.id}`);
    if ((sheet.learningFieldId || ['bk1', 'bk2'].includes(sheet.subjectId)) && !catalog.learningFields.some(f => f.id === sheet.learningFieldId && f.subjectId === sheet.subjectId)) throw new Error(`Ungültiges Lernfeld: ${sheet.id}`);
    if (new Set(sheet.sections.map(s => s.id)).size !== sheet.sections.length) throw new Error(`Doppelter Abschnitt: ${sheet.id}`);
    if (sheet.objectives?.some(goal => !sheet.sections.some(section => section.id === goal.topicId))) throw new Error(`Ungültiges Lernziel: ${sheet.id}`);
    if (sheet.shortVersion && (new Set(sheet.shortVersion.sections.map(section => section.id)).size !== sheet.shortVersion.sections.length || sheet.shortVersion.sections.some(section => !sheet.sections.some(topic => topic.id === section.topicId)))) throw new Error(`Ungültige Kurzfassung: ${sheet.id}`);
    for (const section of sheet.sections) {
      if (!section.points?.length && !section.terms?.length && !section.table && !section.calculations?.length) throw new Error(`Leerer Abschnitt: ${section.id}`);
      if (section.table && (section.table.rows.some(row => row.length !== section.table!.headers.length) || (section.table.totals && section.table.totals.length !== section.table.headers.length))) throw new Error(`Ungültige Tabelle: ${section.id}`);
      for (const id of section.materialIds) {
        if (!catalog.materials.some(m => m.id === id && m.subjectId === sheet.subjectId && m.learningFieldId === sheet.learningFieldId && !m.example)) throw new Error(`Ungültige Lernzettelquelle: ${section.id}`);
      }
    }
  }
  return sheets;
}
export const studySheets = validateStudySheets(rawSheets);
export const sheetSources = (sheet: StudySheet) => [...new Set(sheet.sections.flatMap(s => s.materialIds))];
export const topicPath = (sheet: Pick<StudySheet, 'id'>, topic: Pick<StudyTopic, 'id'>) => `/lernzettel/${sheet.id}/${topic.id}`;
export const topicSearchText = (topic: StudyTopic) => [topic.title, topic.intro, ...(topic.points ?? []), ...(topic.terms?.flatMap(t => [t.term, t.definition]) ?? []), ...(topic.table?.headers ?? []), ...(topic.table?.rows.flat() ?? []), ...(topic.table?.totals ?? []), ...(topic.context ? [topic.context.title, topic.context.text] : []), topic.takeaway,
  ...(topic.formulas?.flatMap(f => [f.label, f.latex, f.note ?? '']) ?? []),
  ...(topic.calculations?.flatMap(c => [c.title, c.goal, ...c.givens, c.formula, ...c.steps.flatMap(step => [step.label, ...step.expressions, step.note ?? '']), c.result, c.interpretation, ...(c.check ? [...c.check.expressions, c.check.note] : [])]) ?? Object.values(topic.caseStudy)),
].join(' ').toLocaleLowerCase('de');
export const sheetSearchText = (sheet: StudySheet) => [sheet.title, sheet.description, ...(sheet.objectives?.map(goal => goal.label) ?? []), ...sheet.sections.map(topicSearchText)].join(' ').toLocaleLowerCase('de');
export const readingMinutes = (sheet: StudySheet | StudyTopic) => Math.max(1, Math.ceil(('sections' in sheet ? sheetSearchText(sheet) : topicSearchText(sheet)).split(/\s+/).length / 180));
export const studyTopics = studySheets.flatMap(sheet => sheet.sections.map(topic => ({
  id: `${sheet.id}/${topic.id}`, parentId: sheet.id, parentTitle: sheet.title,
  subjectId: sheet.subjectId, learningFieldId: sheet.learningFieldId,
  title: topic.title, description: topic.intro, to: topicPath(sheet, topic), topic,
})));
