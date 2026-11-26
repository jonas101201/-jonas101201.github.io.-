import { catalog, subjectName, fieldName } from '../../data/catalog';
import { studySheets, sheetSearchText, studyTopics, topicSearchText } from '../study-sheets/data';
import { translateTree, type Language } from '../../i18n/translate';
export interface SearchEntry { id: string; title: string; kind: string; to: string; text: string; context?: string; subjectId?: string; learningFieldId?: string }
export const destinations = [
  ['/', 'Übersicht'], ['/faecher', 'Fächer'], ['/materialien', 'Materialien'],
  ['/lernzettel', 'Lernzettel'], ['/quizze', 'Quizze'], ['/karteikarten', 'Karteikarten'],
  ['/pruefungstraining', 'Prüfungstraining'], ['/klasse', 'Klasse'],
  ['/ueber', 'Informationen & Speicher'], ['/datenschutz', 'Datenschutz'],
  ['/blurting', 'Freier Wissensabruf'], ['/fortschritt', 'Fortschritt'],
  ['/lernen', 'Lernen'], ['/suche', 'Suche'], ['/termine', 'Termine'], ['/einstellungen', 'Einstellungen'], ['/speicher', 'Speicher'],
] as const;
const normalize = (text: string) => text.toLocaleLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
/** Metadata only: never fetch protected files to populate search. */
const indices = new WeakMap<(text: string | undefined) => string, Map<Language, SearchEntry[]>>();
export function buildSearchIndex(tr: (s: string | undefined) => string, language: Language): SearchEntry[] {
  const cached = indices.get(tr) ?? new Map<Language, SearchEntry[]>();
  const existing = cached.get(language);
  if (existing) return existing;
  const entry = (id: string, title: string, kind: string, to: string, text: string, scope?: { subjectId: string; learningFieldId?: string }): SearchEntry => {
    const context = scope && [tr(subjectName(scope.subjectId)), tr(fieldName(scope.learningFieldId))].filter(Boolean).join(' · ');
    return { id, title: tr(title), kind: tr(kind), to, context, subjectId: scope?.subjectId, learningFieldId: scope?.learningFieldId,
      text: normalize([title, tr(title), kind, tr(kind), context, scope?.learningFieldId?.replace(/^.*-lf/, 'LF '), text].filter(Boolean).join(' ')) };
  };
  const result = [
    ...destinations.map(([to, title]) => entry(`nav:${to}`, title, 'Navigation', to, '')),
    ...catalog.subjects.map(s => entry(`subject:${s.id}`, s.title, 'Fächer', `/faecher/${s.id}`, tr(s.subtitle), { subjectId: s.id })),
    ...catalog.learningFields.map(f => entry(`field:${f.id}`, `${subjectName(f.subjectId)} · ${f.title}`, 'Lernfeld', `/faecher/${f.subjectId}/lernfelder/${f.id}`, `LF ${f.number}`, { subjectId: f.subjectId, learningFieldId: f.id })),
    ...catalog.materials.map(m => entry(`material:${m.id}`, m.title, 'Materialien', `/materialien/${m.id}`, `${m.description} ${tr(m.description)} ${m.tags.join(' ')} ${m.originalFilename ?? ''}`, m)),
    ...catalog.quizzes.map(m => entry(`quiz:${m.id}`, m.title, 'Quizze', `/quizze/${m.id}`, `${m.description} ${tr(m.description)} ${m.questions.map(q => q.prompt + ' ' + tr(q.prompt)).join(' ')}`, m)),
    ...catalog.flashcardSets.map(m => entry(`cards:${m.id}`, m.title, 'Karteikarten', `/karteikarten/${m.id}`, `${m.description} ${tr(m.description)} ${m.cards.map(c => `${c.front} ${c.back} ${tr(c.front)} ${tr(c.back)}`).join(' ')}`, m)),
    ...studyTopics.map(s => entry(`sheet:${s.id}`, s.title, 'Lernzettel', s.to, `${tr(s.parentTitle)} ${topicSearchText(s.topic)} ${topicSearchText(translateTree(s.topic, language))}`, s)),
    ...studySheets.map(s => entry(`sheet:${s.id}`, s.title, 'Lernzettel', `/lernzettel/${s.id}`, `${sheetSearchText(s)} ${sheetSearchText(translateTree(s, language))}`, s)),
  ];
  cached.set(language, result);
  indices.set(tr, cached);
  return result;
}
export function searchIndex(index: SearchEntry[], query: string): SearchEntry[] {
  const words = normalize(query.trim()).split(/\s+/).filter(Boolean);
  if (!words.length) return index.filter(e => e.id.startsWith('nav:'));
  const phrase = normalize(query.trim());
  return index.filter(e => words.every(word => e.text.includes(word))).sort((a, b) => Number(normalize(b.title).includes(phrase)) - Number(normalize(a.title).includes(phrase)));
}
export function moveSelection(current: number, key: string, length: number) {
  if (!length) return 0;
  if (key === 'Home') return 0;
  if (key === 'End') return length - 1;
  return (current + (key === 'ArrowUp' ? -1 : 1) + length) % length;
}

/** Reuse consent-aware content history; never store a second navigation trail. */
export function commandSuggestions(index: SearchEntry[], recentRoutes: readonly string[]) {
  const recent = [...new Set(recentRoutes)].flatMap(to => {
    const entry = index.find(e => e.to === to && /^(material|sheet|quiz|cards):/.test(e.id));
    return entry ? [{ ...entry, recent: true }] : [];
  }).slice(0, 6);
  return [...recent, ...searchIndex(index, '').map(entry => ({ ...entry, recent: false }))];
}
