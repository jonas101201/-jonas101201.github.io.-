import { CatalogSchema, type Catalog } from '../types/content';
import { isSafeMaterialPath } from './paths';
export function validateCatalog(input: unknown): Catalog {
  const data = CatalogSchema.parse(input);
  function unique(ids: string[], label: string) {
    if (new Set(ids).size !== ids.length) throw new Error(`Doppelte ID: ${label}`);
  }
  for (const [name, items] of Object.entries(data)) unique(items.map(x => x.id), name);
  const subjects = new Set(data.subjects.map(x => x.id));
  for (const field of data.learningFields) if (!subjects.has(field.subjectId)) throw new Error('Unbekanntes Fach im Lernfeld');
  for (const item of [...data.topics, ...data.materials, ...data.quizzes, ...data.flashcardSets]) {
    if (!subjects.has(item.subjectId)) throw new Error(`Unbekanntes Fach: ${item.id}`);
    if (item.learningFieldId && !data.learningFields.some(f => f.id === item.learningFieldId && f.subjectId === item.subjectId)) throw new Error(`Ungültiges Lernfeld: ${item.id}`);
    if (item.topicId && !data.topics.some(t => t.id === item.topicId && t.subjectId === item.subjectId && (!t.learningFieldId || t.learningFieldId === item.learningFieldId))) throw new Error(`Ungültiges Thema: ${item.id}`);
  }
  for (const m of data.materials) {
    if (!isSafeMaterialPath(m.path) || !m.path.toLowerCase().endsWith(`.${m.fileType.toLowerCase()}`)) throw new Error(`Ungültiger Dateipfad: ${m.id}`);
    if (m.originalFilename && !m.originalFilename.toLowerCase().endsWith(`.${m.fileType.toLowerCase()}`)) throw new Error(`Ungültiger Originaldateiname: ${m.id}`);
  }
  for (const m of data.materials) if (m.preview && (m.fileType !== 'DOCX' || !isSafeMaterialPath(m.preview.path) || !m.preview.path.endsWith('.pdf') || m.preview.path === m.path)) throw new Error(`Ungültige Vorschau: ${m.id}`);
  for (const learning of [...data.quizzes, ...data.flashcardSets]) {
    const items = 'questions' in learning ? learning.questions : learning.cards;
    for (const item of [learning, ...items]) {
      if (!item.materialIds) continue;
      unique(item.materialIds, item.id);
      for (const ref of item.materialIds) {
        const material = data.materials.find(m => m.id === ref);
        if (!material || material.subjectId !== learning.subjectId || material.learningFieldId !== learning.learningFieldId) throw new Error(`Ungültige Unterrichtsquelle: ${item.id}`);
      }
    }
  }
  for (const quiz of data.quizzes) {
    unique(quiz.questions.map(q => q.id), quiz.id);
    for (const source of quiz.sources) if (!source.startsWith('https://')) throw new Error('Quellen benötigen HTTPS');
    for (const q of quiz.questions) {
      if (q.type === 'matching') {
        unique(q.pairs.map(p => p.id), q.id);
        unique(q.pairs.map(p => p.right), q.id);
      } else {
        unique(q.options.map(o => o.id), q.id);
        unique(q.correctOptionIds, q.id);
        if (q.correctOptionIds.some(a => !q.options.some(o => o.id === a))) throw new Error(`Unbekannte Antwort: ${q.id}`);
        if (q.type !== 'multiple' && q.correctOptionIds.length !== 1) throw new Error(`Eine richtige Antwort erforderlich: ${q.id}`);
        if (q.type === 'boolean' && q.options.length !== 2) throw new Error(`Zwei Wahrheitswerte erforderlich: ${q.id}`);
      }
    }
  }
  for (const set of data.flashcardSets) unique(set.cards.map(c => c.id), set.id);
  return data;
}
