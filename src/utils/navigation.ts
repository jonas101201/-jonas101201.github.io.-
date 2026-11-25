import { catalog } from '../data/catalog';
import { studySheets, studyTopics } from '../features/study-sheets/data';
import { destinations } from '../features/search';
export interface Crumb { to: string; label: string }
export function isLearningSession(path: string) {
  return catalog.quizzes.some(q => path === `/quizze/${q.id}`) || catalog.flashcardSets.some(s => path === `/karteikarten/${s.id}`);
}
export function breadcrumbsFor(path: string): Crumb[] {
  const home = { to: '/', label: 'Übersicht' };
  if (path === '/') return [];
  const direct = destinations.find(([to]) => to === path);
  if (direct) return [home, { to: direct[0], label: direct[1] }];
  const subject = catalog.subjects.find(s => path === `/faecher/${s.id}`);
  const field = catalog.learningFields.find(f => path === `/faecher/${f.subjectId}/lernfelder/${f.id}`);
  const content = [...catalog.materials.map(m => ({ ...m, to: `/materialien/${m.id}` })), ...catalog.quizzes.map(q => ({ ...q, to: `/quizze/${q.id}` })), ...catalog.flashcardSets.map(s => ({ ...s, to: `/karteikarten/${s.id}` })), ...studySheets.map(s => ({ ...s, to: `/lernzettel/${s.id}` })), ...studyTopics].find(item => item.to === path);
  const subjectId = subject?.id ?? field?.subjectId ?? content?.subjectId;
  const parent = catalog.subjects.find(s => s.id === subjectId);
  if (!parent) return [];
  const crumbs = [home, { to: '/faecher', label: 'Fächer' }, { to: `/faecher/${parent.id}`, label: parent.title }];
  const learningField = field ?? catalog.learningFields.find(f => f.id === content?.learningFieldId && f.subjectId === subjectId);
  if (learningField) crumbs.push({ to: `/faecher/${parent.id}/lernfelder/${learningField.id}`, label: learningField.title });
  const topic = studyTopics.find(t => t.to === path);
  if (topic) crumbs.push({ to: `/lernzettel/${topic.parentId}`, label: topic.parentTitle });
  if (content) crumbs.push({ to: content.to, label: content.title });
  return crumbs;
}

export function primaryArea(pathname: string) {
  const section = pathname.split('/')[1];
  if (!section) return 0;
  if (['lernen', 'faecher', 'materialien', 'lernzettel', 'quizze', 'karteikarten', 'pruefungstraining'].includes(section)) return 1;
  if (section === 'suche') return 2;
  if (section === 'termine') return 3;
  return 4;
}

export function canFocusRoute(pathname: string) {
  return isLearningSession(pathname) || studySheets.some(sheet => pathname === `/lernzettel/${sheet.id}`) || studyTopics.some(topic => topic.to === pathname);
}
