import { catalog, subjectName, fieldName } from '../../data/catalog';
import { studySheets, sheetSearchText } from '../study-sheets/data';
import { translateTree, type Language } from '../../i18n/translate';
export interface SearchEntry { id: string; title: string; kind: string; to: string; text: string }
export const destinations = [
  ['/', 'Übersicht'], ['/faecher', 'Fächer'], ['/materialien', 'Materialien'],
  ['/lernzettel', 'Lernzettel'], ['/quizze', 'Quizze'], ['/karteikarten', 'Karteikarten'],
  ['/pruefungstraining', 'Prüfungstraining'], ['/klasse', 'Klasse'],
  ['/ueber', 'Informationen & Speicher'], ['/datenschutz', 'Datenschutz'],
] as const;
const normalize = (text: string) => text.toLocaleLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
/** Metadata only: never fetch protected files to populate search. */
export function buildSearchIndex(tr: (s: string | undefined) => string, language: Language): SearchEntry[] {
  const entry = (id: string, title: string, kind: string, to: string, text: string): SearchEntry => ({ id, title: tr(title), kind: tr(kind), to, text: normalize(`${title} ${tr(title)} ${kind} ${tr(kind)} ${text}`) });
  const meta = (m: { subjectId: string; learningFieldId?: string }) => `${tr(subjectName(m.subjectId))} ${tr(fieldName(m.learningFieldId))}`;
  return [
    ...destinations.map(([to, title]) => entry(`nav:${to}`, title, 'Navigation', to, '')),
    ...catalog.subjects.map(s => entry(`subject:${s.id}`, s.title, 'Fächer', `/faecher/${s.id}`, tr(s.subtitle))),
    ...catalog.learningFields.map(f => entry(`field:${f.id}`, `${subjectName(f.subjectId)} · ${f.title}`, 'Lernfeld', `/faecher/${f.subjectId}/lernfelder/${f.id}`, `LF ${f.number}`)),
    ...catalog.materials.map(m => entry(`material:${m.id}`, m.title, 'Materialien', `/materialien/${m.id}`, `${meta(m)} ${m.description} ${tr(m.description)} ${m.tags.join(' ')} ${m.originalFilename ?? ''}`)),
    ...catalog.quizzes.map(m => entry(`quiz:${m.id}`, m.title, 'Quizze', `/quizze/${m.id}`, `${meta(m)} ${m.description} ${tr(m.description)} ${m.questions.map(q => q.prompt + ' ' + tr(q.prompt)).join(' ')}`)),
    ...catalog.flashcardSets.map(m => entry(`cards:${m.id}`, m.title, 'Karteikarten', `/karteikarten/${m.id}`, `${meta(m)} ${m.description} ${tr(m.description)} ${m.cards.map(c => `${c.front} ${c.back} ${tr(c.front)} ${tr(c.back)}`).join(' ')}`)),
    ...studySheets.map(s => entry(`sheet:${s.id}`, s.title, 'Lernzettel', `/lernzettel/${s.id}`, `${meta(s)} ${sheetSearchText(s)} ${sheetSearchText(translateTree(s, language))}`)),
  ];
}
export function searchIndex(index: SearchEntry[], query: string): SearchEntry[] {
  const words = normalize(query.trim()).split(/\s+/).filter(Boolean);
  if (!words.length) return index.filter(e => e.id.startsWith('nav:'));
  return index.filter(e => words.every(word => e.text.includes(word))).sort((a, b) => Number(normalize(b.title).includes(normalize(query))) - Number(normalize(a.title).includes(normalize(query))));
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
