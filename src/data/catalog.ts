import rawCatalog from './catalog.json';
import { validateCatalog } from '../utils/validate';
export const catalog = validateCatalog(rawCatalog);
export const subjectName = (id: string) => catalog.subjects.find(s => s.id === id)?.title ?? 'Unbekanntes Fach';
export const fieldName = (id?: string) => catalog.learningFields.find(f => f.id === id)?.title;
