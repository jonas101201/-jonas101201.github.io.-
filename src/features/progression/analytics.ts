import { challengeDefinitions } from './achievementRegistry';
import type { LearningEvent, LearningKind, State } from './engine';
import { scopeOf } from './missions';
import { elapsedDays } from './rules';

export const activityKey = (kind: LearningKind, id: string) => `${kind}:${id}`;
export function reviewFor(state: State, kind: LearningKind, contentId: string) {
  return state.reviews[activityKey(kind, contentId)];
}

export function assessedWell(event: LearningEvent) {
  if (event.correct !== undefined) return event.correct / event.total >= 0.75;
  if (event.concepts) return Object.values(event.concepts).filter(rating => rating === 'remembered').length / event.total >= 0.75;
  // Card ratings guide repetition but never count as an objective check.
  return event.selfKnown !== undefined && event.selfKnown / event.total >= 0.75;
}

export function eventCounts(state: State) {
  const eventsById = new Map(state.events.map(event => [event.id, event]));
  const reviewed = state.transactions.filter(transaction => transaction.kind === 'review');
  const reviewedIds = new Set(reviewed.flatMap(item => item.eventId ? [item.eventId] : []));
  const improved = state.transactions.filter(transaction => transaction.kind === 'improvement');
  const improvedIds = new Set(improved.flatMap(item => item.eventId ? [item.eventId] : []));
  const distinct = (kind: LearningKind) => new Set(state.events.filter(event => event.kind === kind).map(event => event.contentId)).size;
  return { eventsById, reviewedIds, improvedIds, methods: [...new Set(state.events.map(event => event.kind))],
    reviewed: reviewed.length, improved: improved.length, blurting: distinct('blurting'), exams: distinct('exam') };
}

export function statistics(state: State, at = new Date().toISOString()) {
  const data = eventCounts(state);
  const fields = new Map<string, { scope: string; subjectId: string; learningFieldId?: string; completed: number; objectiveChecks: number; successfulChecks: number; due: boolean; improvements: number }>();
  const objective = { count: 0, correct: 0, total: 0 };
  const quiz = { correct: 0, total: 0 };
  const exam = { correct: 0, total: 0 };
  const cardRatings = { count: 0, known: 0, attempted: 0 };
  const self = { count: 0, remembered: 0, partial: 0, missing: 0, misunderstood: 0 };
  for (const event of state.events) {
    const scope = scopeOf(event);
    const field = fields.get(scope) ?? { scope, subjectId: event.subjectId, learningFieldId: event.learningFieldId,
      completed: 0, objectiveChecks: 0, successfulChecks: 0, due: false, improvements: 0 };
    field.completed++;
    const review = reviewFor(state, event.kind, event.contentId);
    if (review && Date.parse(review.dueAt) <= Date.parse(at)) field.due = true;
    if (data.improvedIds.has(event.id)) field.improvements++;
    if (event.correct !== undefined) {
      field.objectiveChecks++;
      objective.count++;
      objective.correct += event.correct;
      objective.total += event.total;
      const result = event.kind === 'exam' ? exam : quiz;
      result.correct += event.correct;
      result.total += event.total;
      if (assessedWell(event)) field.successfulChecks++;
    }
    if (event.selfKnown !== undefined) {
      cardRatings.count++;
      cardRatings.known += event.selfKnown;
      cardRatings.attempted += event.total;
    }
    if (event.concepts) {
      self.count++;
      for (const rating of Object.values(event.concepts)) self[rating]++;
    }
    fields.set(scope, field);
  }
  return {
    methods: data.methods, completed: state.events.length, reviewed: data.reviewed, improved: data.improved,
    resolvedGaps: state.resolvedGaps.length, objective, quiz, exam, self, cardRatings,
    fields: [...fields.values()].map(field => ({ ...field, status: field.due ? 'due' as const
      : field.successfulChecks >= 2 ? 'verified' as const : 'started' as const })),
  };
}

export function challengeProgress(state: State, id: string, metrics = eventCounts(state)) {
  const definition = challengeDefinitions.find(item => item.id === id);
  let current = 0;
  switch (id) {
    case 'methods-three': current = metrics.methods.length; break;
    case 'recall-five': current = metrics.blurting; break;
    case 'improve-three': current = metrics.improved; break;
    case 'master-mission': current = state.missions.filter(mission => mission.status === 'completed' && mission.plan.kind === 'master').length; break;
    case 'week-review': {
      const ordered = [...state.events].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
      const last = new Map<string, string>();
      for (const event of ordered) {
        const key = activityKey(event.kind, event.contentId);
        const previous = last.get(key);
        if (previous && metrics.reviewedIds.has(event.id) && elapsedDays(previous, event.at) >= 7) {
          current = 1;
          break;
        }
        last.set(key, event.at);
      }
    }
  }
  const target = definition?.target ?? 1;
  return { current: Math.min(current, target), target, joined: Object.hasOwn(state.challenges, id), complete: state.unlocks.includes(`challenge:${id}`) };
}

