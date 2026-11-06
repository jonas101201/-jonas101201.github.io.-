import ukrainian from './uk.json';
export type Language = 'de' | 'uk';
export const LANGUAGE_KEY = 'lernhub:language:v1';
export const isLanguage = (value: unknown): value is Language => value === 'de' || value === 'uk';
const uk: Record<string, string> = ukrainian;
export function translateText(source: string | undefined, language: Language, values: readonly unknown[] = []) {
  if (!source) return '';
  const trimmed = source.trim();
  const translated = language === 'uk' ? uk[trimmed] ?? trimmed : trimmed;
  const result = source.slice(0, source.length - source.trimStart().length) + translated + source.slice(source.trimEnd().length);
  return result.replace(/\{(\d+)\}/g, (_, index: string) => String(values[Number(index)] ?? `{${index}}`));
}
export function translateTree<T>(value: T, language: Language): T {
  if (language === 'de') return value;
  if (typeof value === 'string') return translateText(value, language) as T;
  if (Array.isArray(value)) return value.map(item => translateTree(item, language)) as T;
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, translateTree(item, language)])) as T;
  return value;
}
export function readLanguage(storage: Pick<Storage, 'getItem'>): Language {
  try { const value = storage.getItem(LANGUAGE_KEY); return isLanguage(value) ? value : 'de'; } catch { return 'de'; }
}

const counts = {
  questions: { de: ['Frage','Fragen','Fragen'], uk: ['запитання','запитання','запитань'] },
  cards: { de: ['Karte','Karten','Karten'], uk: ['картка','картки','карток'] },
  sections: { de: ['Abschnitt','Abschnitte','Abschnitte'], uk: ['розділ','розділи','розділів'] },
  materials: { de: ['Material','Materialien','Materialien'], uk: ['матеріал','матеріали','матеріалів'] },
  pages: { de: ['Seite','Seiten','Seiten'], uk: ['сторінка','сторінки','сторінок'] },
  tasks: { de: ['Aufgabentyp','Aufgabentypen','Aufgabentypen'], uk: ['тип завдання','типи завдань','типів завдань'] },
  results: { de: ['Treffer','Treffer','Treffer'], uk: ['результат','результати','результатів'] },
  fields: { de: ['Lernfeld','Lernfelder','Lernfelder'], uk: ['навчальне поле','навчальні поля','навчальних полів'] },
} as const;
export function formatCount(value: number, noun: keyof typeof counts, language: Language) {
  const category = new Intl.PluralRules(language).select(value);
  const index = category === 'one' ? 0 : category === 'few' ? 1 : 2;
  return `${new Intl.NumberFormat(language).format(value)} ${counts[noun][language][index]}`;
}
