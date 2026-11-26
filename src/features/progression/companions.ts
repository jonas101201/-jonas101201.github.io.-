import type { State } from './engine';
import { plantMissionId } from './missions';
import { companionThresholds } from './rules';

export const companions = [
  { id: 'orbit', name: 'Orbit', role: 'Analytiker', description: 'Priorisiert fällige Wiederholungen und den Überblick über bearbeitete Inhalte.', requirement: 'Von Anfang an verfügbar' },
  { id: 'ember', name: 'Ember', role: 'Motivator', description: 'Priorisiert persönliche Lernziele und abwechslungsreiche Übungen.', requirement: '500 HUB Credits' },
  { id: 'spectre', name: 'Spectre', role: 'Gedächtnisexperte', description: 'Priorisiert freien Wissensabruf und zeitversetzte Wiederholung.', requirement: '10 qualifizierte freie Wissensabrufe' },
  { id: 'bloom', name: 'Bloom', role: 'Entwicklungsbegleiter', description: 'Priorisiert Themen mit zuletzt offenen Kernaspekten.', requirement: '10 in der Selbstauswertung aufgearbeitete Kernaspekte' },
  { id: 'glitch', name: 'Glitch', role: 'Stratege', description: 'Priorisiert das Prüfungstraining und Fächer mit anstehenden Terminen.', requirement: '5 verschiedene abgeschlossene Prüfungstrainings' },
  { id: 'cosmo', name: 'Cosmo', role: 'Entdecker', description: 'Priorisiert noch unerprobte Lernmethoden und neue Themen.', requirement: 'Alle vier bewerteten Lernmethoden ausprobiert' },
  { id: 'pflanziska', name: 'Pflanziska', role: 'Klassenpflanze', description: 'Die Klassenpflanze mit geflochtenem Übertopf und selbst gebastelten Anhängern.', requirement: 'Pflanziskas Lernmission abschließen' },
] as const;

export const stages = ['Origin', 'Awakened', 'Ascended', 'Celestial'] as const;
export type CompanionId = typeof companions[number]['id'];

export function companionQualified(state: State, id: string) {
  const awarded = new Set(state.transactions.flatMap(transaction => transaction.kind === 'activity' && transaction.eventId ? [transaction.eventId] : []));
  switch (id) {
    case 'orbit': return true;
    case 'ember': return state.owned.includes(id);
    case 'spectre': return state.events.filter(event => event.kind === 'blurting' && awarded.has(event.id)).length >= 10;
    case 'bloom': return state.resolvedGaps.length >= 10;
    case 'glitch': return new Set(state.events.filter(event => event.kind === 'exam').map(event => event.contentId)).size >= 5;
    case 'cosmo': return new Set(state.events.map(event => event.kind)).size >= 4;
    case 'pflanziska': return state.unlocks.includes('mission:' + plantMissionId);
    default: return false;
  }
}

export function companionProgress(state: State, id: string) {
  const points = state.companionPoints[id] ?? 0;
  const stage = (points >= companionThresholds[3] ? 3 : points >= companionThresholds[2] ? 2 : points >= companionThresholds[1] ? 1 : 0);
  const labels = id === 'pflanziska' ? ['Original', 'Awakened', 'Flourishing', 'Celestial'] : stages;
  const required = companionThresholds[stage + 1];
  return {
    stage, stageName: labels[stage], labels, points,
    next: required === undefined ? undefined : { required, label: labels[stage + 1]! },
    unlocked: state.owned.includes(id) || id === 'orbit',
  };
}
