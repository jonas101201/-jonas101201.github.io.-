import { z } from 'zod';
import { catalog, fieldName, subjectName } from '../../data/catalog';
import { classroom, upcomingEvents } from '../classroom/config';
import { tasks, blurtingPath } from '../blurting/tasks';
import type { LearningEvent, LearningKind, State } from './engine';
import { DAY_MS, missionClasses } from './rules';

export const missionKinds = ['quick', 'focus', 'expert', 'master'] as const;
export const learningKinds = ['quiz', 'exam', 'cards', 'blurting'] as const;
export const keySchema = z.string().max(200).regex(/^[a-zA-Z0-9][a-zA-Z0-9:/-]*$/);
export const dateSchema = z.iso.datetime({ offset: true });
const missionStepSchema = z.strictObject({
  id: keySchema,
  kind: z.enum(learningKinds),
  contentId: keySchema,
  title: z.string().min(1).max(400),
  to: z.string().min(1).max(450),
});
export const missionPlanSchema = z.strictObject({
  id: keySchema,
  title: z.string().min(1).max(400),
  kind: z.enum(missionKinds),
  reason: z.string().min(1).max(400),
  estimatedMinutes: z.number().int().min(3).max(60),
  subjectId: keySchema,
  learningFieldId: keySchema.optional(),
  steps: z.array(missionStepSchema).min(2).max(5),
  reward: z.strictObject({ xp: z.number().int().positive(), credits: z.number().int().positive() }),
});
export const missionRecordSchema = z.strictObject({
  id: keySchema,
  plan: missionPlanSchema,
  status: z.enum(['active', 'paused', 'completed', 'cancelled']),
  startedAt: dateSchema,
  resumedAt: dateSchema.optional(),
  completedAt: dateSchema.optional(),
  completedStepIds: z.array(keySchema).max(5),
});
export type MissionPlan = z.infer<typeof missionPlanSchema>;
export type MissionRecord = z.infer<typeof missionRecordSchema>;
export type MissionStep = z.infer<typeof missionStepSchema>;

export type LearningReference = MissionStep & { subjectId: string; learningFieldId?: string; total: number; conceptIds?: readonly string[] };
const references: LearningReference[] = [
  ...catalog.quizzes.flatMap(quiz => (['quiz', 'exam'] as const).map(kind => ({
    id: `${kind}:${quiz.id}`, kind, contentId: quiz.id, subjectId: quiz.subjectId, learningFieldId: quiz.learningFieldId,
    title: quiz.title, to: `/quizze/${quiz.id}?modus=${kind === 'exam' ? 'pruefung' : 'lernen'}`, total: quiz.questions.length,
  }))),
  ...catalog.flashcardSets.map(set => ({
    id: `cards:${set.id}`, kind: 'cards' as const, contentId: set.id, subjectId: set.subjectId, learningFieldId: set.learningFieldId,
    title: set.title, to: `/karteikarten/${set.id}`, total: set.cards.length,
  })),
  ...tasks.map(task => ({
    id: `blurting:${task.id}`, kind: 'blurting' as const, contentId: task.id, subjectId: task.subjectId,
    learningFieldId: task.learningFieldId, title: task.title, to: blurtingPath(task), total: task.concepts.length,
    conceptIds: task.concepts.map(concept => concept.id),
  })),
];
const referenceById = new Map(references.map(ref => [ref.id, ref]));
export const learningReference = (kind: LearningKind, contentId: string) => referenceById.get(`${kind}:${contentId}`);
export const scopeOf = (reference: Pick<LearningReference, 'subjectId' | 'learningFieldId'>) => reference.learningFieldId ?? reference.subjectId;
export function missionSteps(record: MissionRecord) {
  return record.plan.steps.map(step => {
    const current = learningReference(step.kind, step.contentId);
    return {
      ...step, title: current?.title ?? step.title, to: current?.to,
      completed: record.completedStepIds.includes(step.id),
    };
  });
}

function canonicalMissionId(kind: MissionPlan['kind'], scope: string) {
  return `${kind}:${scope}`;
}

/** Stored plans outlive catalogue labels and balancing. Validate only their
 * stable identity and internal routes. The current catalogue governs new plans. */
export const plantMissionId = 'quick:pflanziska';

export function validStoredMissionPlan(plan: MissionPlan) {
  if ((plan.id !== canonicalMissionId(plan.kind, scopeOf(plan)) && !(plan.id === plantMissionId && plan.kind === 'quick' && plan.learningFieldId === 'bk1-lf3')) ||
    new Set(plan.steps.map(step => step.id)).size !== plan.steps.length ||
    new Set(plan.steps.map(step => step.kind)).size < 2) return false;
  return plan.steps.every(step => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(step.contentId) || step.id !== step.kind + ':' + step.contentId) return false;
    const routes = {
      quiz: '/quizze/' + step.contentId + '?modus=lernen',
      exam: '/quizze/' + step.contentId + '?modus=pruefung',
      cards: '/karteikarten/' + step.contentId,
      blurting: '/blurting/' + step.contentId,
    };
    return step.to === routes[step.kind];
  });
}

export function validMissionPlan(plan: MissionPlan) {
  if (!validStoredMissionPlan(plan)) return false;
  const config = missionClasses[plan.kind];
  if (plan.id === plantMissionId && plan.steps.some((step, index) => step.id !== plantMission()?.steps[index]?.id)) return false;
  if (plan.estimatedMinutes !== config.estimatedMinutes ||
      plan.reward.xp !== config.reward.xp || plan.reward.credits !== config.reward.credits ||
      plan.steps.length !== config.steps || new Set(plan.steps.map(step => step.id)).size !== plan.steps.length ||
      new Set(plan.steps.map(step => step.kind)).size < 2) return false;
  return plan.steps.every(step => {
    const ref = learningReference(step.kind, step.contentId);
    return ref && step.id === ref.id && step.to === ref.to && step.title === ref.title
      && ref.subjectId === plan.subjectId && ref.learningFieldId === plan.learningFieldId;
  });
}

function reuseReference(ref: LearningReference): MissionStep {
  const { id, kind, contentId, title, to } = ref;
  return { id, kind, contentId, title, to };
}

const scopeGroups = new Map<string, LearningReference[]>();
for (const ref of references) {
  const scope = scopeOf(ref);
  const group = scopeGroups.get(scope) ?? [];
  group.push(ref);
  scopeGroups.set(scope, group);
}

export function plantMission(): MissionPlan | null {
  const scope = scopeGroups.get('bk1-lf3') ?? [];
  const recall = scope.find(ref => ref.kind === 'blurting');
  const quiz = scope.find(ref => ref.kind === 'quiz');
  if (!recall || !quiz) return null;
  return {
    id: plantMissionId, kind: 'quick', title: 'Pflanziskas Lernmission',
    reason: 'Rufe dein Wissen über Bindung ab und überprüfe es im passenden Quiz. Damit schaltest du Pflanziska frei.',
    subjectId: 'bk1', learningFieldId: 'bk1-lf3',
    estimatedMinutes: missionClasses.quick.estimatedMinutes, reward: missionClasses.quick.reward,
    steps: [reuseReference(recall), reuseReference(quiz)],
  };
}

const preferredMethods: Record<string, readonly LearningKind[]> = {
  orbit: ['quiz', 'blurting', 'cards', 'exam'],
  ember: ['cards', 'blurting', 'quiz', 'exam'],
  spectre: ['blurting', 'cards', 'quiz', 'exam'],
  bloom: ['blurting', 'quiz', 'cards', 'exam'],
  glitch: ['exam', 'quiz', 'blurting', 'cards'],
  cosmo: ['blurting', 'quiz', 'cards', 'exam'],
};

export function recommendMissions(state: State, at: string, recentFieldId?: string): MissionPlan[] {
  const now = Date.parse(at);
  const latestByScope = new Map<string, LearningEvent>();
  const latestByContent = new Map<string, LearningEvent>();
  const methods = new Set<LearningKind>();
  for (const event of state.events) {
    const previous = latestByScope.get(scopeOf(event));
    if (!previous || Date.parse(previous.at) < Date.parse(event.at)) latestByScope.set(scopeOf(event), event);
    const key = `${event.kind}:${event.contentId}`;
    const previousActivity = latestByContent.get(key);
    if (!previousActivity || Date.parse(previousActivity.at) < Date.parse(event.at)) latestByContent.set(key, event);
    methods.add(event.kind);
  }
  const upcoming = upcomingEvents(classroom.events, at.slice(0, 10)).filter(event => Date.parse(event.date) - now <= 14 * DAY_MS);
  const priority = preferredMethods[state.activeCompanion] ?? preferredMethods.orbit!;
  const reserved = new Set(state.missions.filter(record => record.status !== 'cancelled').map(record => record.id));
  const candidates = [...scopeGroups].flatMap(([scope, group]) => {
    const lead = group[0]!;
    const previous = latestByScope.get(scope);
    const due = group.some(ref => state.reviews[ref.id] && Date.parse(state.reviews[ref.id]!.dueAt) <= now);
    const gaps = group.some(ref => Object.values(latestByContent.get(ref.id)?.concepts ?? {}).some(rating => rating !== 'remembered'));
    const upcomingEvent = upcoming.some(event => event.subjectId === lead.subjectId);
    const weakQuiz = group.some(ref => {
      const attempted = latestByContent.get(ref.id);
      return typeof attempted?.correct === 'number' && attempted.correct / attempted.total < 0.65;
    });
    const goal = scope === state.goalFieldId;
    const recent = scope === recentFieldId || Boolean(previous && now - Date.parse(previous.at) < 14 * DAY_MS);
    const fresh = !previous;
    const companion = state.activeCompanion;
    const score = Number(goal) * (companion === 'ember' ? 15 : 10) + Number(due) * (companion === 'orbit' || companion === 'spectre' ? 12 : 8)
      + Number(gaps) * (companion === 'bloom' ? 10 : 5) + Number(upcomingEvent) * (companion === 'glitch' ? 12 : 4)
      + Number(weakQuiz) * 4 + Number(recent) * 3 + Number(fresh && companion === 'cosmo') * 5;
    const reason = goal ? 'Dieses Lernfeld entspricht deinem gewählten Ziel.'
      : due ? 'In diesem Bereich ist eine Wiederholung empfohlen.'
      : gaps ? 'In deinen Selbsteinschätzungen sind hier noch Kernaspekte offen.'
      : upcomingEvent ? 'Für dieses Fach steht in den nächsten zwei Wochen ein Termin an.'
      : weakQuiz ? 'Dein letztes Quiz in diesem Bereich lässt Raum für eine gezielte Wiederholung.'
      : recent ? 'Du hast dieses Lernfeld vor Kurzem bearbeitet.'
      : fresh ? 'Hier kannst du ein weiteres Thema und mehrere Lernmethoden ausprobieren.'
      : 'Die Übungen verbinden mehrere Lernmethoden zum selben Lernfeld.';
    function rank(ref: LearningReference) {
      const review = state.reviews[ref.id];
      const newMethod = !methods.has(ref.kind);
      return (review && Date.parse(review.dueAt) <= now ? 15 : 0)
        + (newMethod ? companion === 'cosmo' || companion === 'ember' ? 8 : 4 : 0)
        + (4 - priority.indexOf(ref.kind));
    }
    const sorted = [...group].sort((a, b) => rank(b) - rank(a));
    return [{ scope, lead, sorted, score, reason }];
  }).sort((a, b) => b.score - a.score);

  return missionKinds.flatMap(kind => {
    const config = missionClasses[kind];
    for (const { scope, lead, sorted, reason } of candidates) {
      const id = canonicalMissionId(kind, scope);
      if (reserved.has(id)) continue;
      const differentMethods = new Map<LearningKind, LearningReference>();
      for (const ref of sorted) if (!differentMethods.has(ref.kind)) differentMethods.set(ref.kind, ref);
      if (differentMethods.size < 2) continue;
      const firstRepresentatives = [...differentMethods.values()];
      const selected = [...firstRepresentatives, ...sorted.filter(ref => !firstRepresentatives.includes(ref))].slice(0, config.steps);
      if (selected.length !== config.steps) continue;
      const title = [subjectName(lead.subjectId), fieldName(lead.learningFieldId), config.label].filter(Boolean).join(' · ');
      return [{
        id, title, kind, reason, subjectId: lead.subjectId, learningFieldId: lead.learningFieldId,
        estimatedMinutes: config.estimatedMinutes, steps: selected.map(reuseReference), reward: config.reward,
      }];
    }
    return [];
  });
}
