import { catalog, subjectName, fieldName } from '../../data/catalog';
import { studySheets, sheetSearchText, studyTopics, topicSearchText } from '../study-sheets/data';
import { tasks } from '../blurting/tasks';
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
const normalize = (text: string) => text.toLocaleLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/ß/g, 'ss');
const foldGermanSpelling = (text: string) => text.replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u');
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
    ...tasks.map(task => entry(`blurting:${task.id}`, task.title, 'Freier Wissensabruf', `/blurting/${task.id}`, `${task.prompt} ${tr(task.prompt)}`, task)),
    ...studyTopics.map(s => entry(`sheet:${s.id}`, s.title, 'Lernzettel', s.to, `${tr(s.parentTitle)} ${topicSearchText(s.topic)} ${topicSearchText(translateTree(s.topic, language))}`, s)),
    ...studySheets.map(s => entry(`sheet:${s.id}`, s.title, 'Lernzettel', `/lernzettel/${s.id}`, `${sheetSearchText(s)} ${sheetSearchText(translateTree(s, language))}`, s)),
  ];
  cached.set(language, result);
  indices.set(tr, cached);
  return result;
}
// A single edit or transposition on a title token, only when exact search is empty.
function oneTypo(term: string, word: string) {
  if (term.length < 5 || Math.abs(term.length - word.length) > 1) return false;
  const [short, long] = term.length <= word.length ? [term, word] : [word, term];
  let start = 0;
  while (start < short.length && short[start] === long[start]) start++;
  if (short.length !== long.length) return short.slice(start) === long.slice(start + 1);
  if (short.slice(start + 1) === long.slice(start + 1)) return true;
  return short[start] === long[start + 1] && short[start + 1] === long[start] &&
    short.slice(start + 2) === long.slice(start + 2);
}

export function searchIndex(index: SearchEntry[], query: string): SearchEntry[] {
  const words = normalize(query.trim()).split(/\s+/).filter(Boolean);
  if (!words.length) return index.filter(entry => entry.id.startsWith('nav:'));
  let phrase = words.join(' ');
  let matching = index.filter(entry => words.every(word => entry.text.includes(word)));
  const alternate = words.map(foldGermanSpelling);
  if (!matching.length && alternate.some((word, i) => word !== words[i])) {
    matching = index.filter(entry => alternate.every(word => entry.text.includes(word)));
    if (matching.length) phrase = alternate.join(' ');
  }
  if (matching.length) {
    return matching.map(entry => {
      const title = normalize(entry.title);
      const score = title === phrase ? 3 : title.startsWith(phrase) ? 2 : title.includes(phrase) ? 1 : 0;
      return { entry, score };
    }).sort((a, b) => b.score - a.score).map(({ entry }) => entry);
  }
  if (words.length > 6 || phrase.length > 120) return [];
  return index.filter(entry => {
    const titleTokens = normalize(entry.title).match(/[\p{L}\p{N}]+/gu) ?? [];
    const missing = words.filter(word => !entry.text.includes(word));
    return missing.length === 1 && titleTokens.some(word => oneTypo(missing[0]!, word));
  });
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
