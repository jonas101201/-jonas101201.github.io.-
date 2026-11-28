import { describe, expect, it } from 'vitest';
import { catalog } from '../src/data/catalog';
import { tasks } from '../src/features/blurting/tasks';
import { applyAction, challengeProgress, emptyState, levelFor, reviewFor, stateSchema, statistics, xpForLevel, type LearningEvent, type LearningKind, type State } from '../src/features/progression/engine';
import { learningReference, missionSteps, recommendMissions } from '../src/features/progression/missions';
import { activityRewards, DAY_MS, MAX_REWARDED_REVIEWS } from '../src/features/progression/rules';
import { cosmetics } from '../src/features/progression/cosmetics';
import { companionProgress } from '../src/features/progression/companions';

const start = Date.parse('2026-01-01T12:00:00Z');
const at = (days: number) => new Date(start + days * DAY_MS).toISOString();
const quizId = catalog.quizzes.find(quiz => quiz.learningFieldId === 'bk1-lf3')!.id;
const blurtingId = tasks.find(task => task.learningFieldId === 'bk1-lf3')!.id;
function completed(kind: LearningKind, contentId: string, day: number, id = `${kind}:${contentId}:${day.toString().replace('.', '-')}`): LearningEvent {
  const ref = learningReference(kind, contentId)!;
  return { id, kind, contentId, subjectId: ref.subjectId, learningFieldId: ref.learningFieldId, at: at(day),
    attempted: kind === 'blurting' ? 25 : ref.total, total: ref.total,
    elapsedMs: Math.max(ref.total * 3000, 30_000),
    ...(kind === 'blurting' ? { concepts: Object.fromEntries(ref.conceptIds!.map(id => [id, 'remembered'])) } : {}),
    ...(kind === 'quiz' || kind === 'exam' ? { correct: ref.total } : {}),
  };
}
const record = (state: State, event: LearningEvent) => applyAction(state, { type: 'complete', event });

describe('progression rewards', () => {
  it('uses an increasing 50-level curve without a disappearing final level', () => {
    let previousCost = 0;
    for (let level = 2; level <= 50; level++) {
      const expectedXP = xpForLevel(level);
      const cost = expectedXP - xpForLevel(level - 1);
      expect(cost).toBeGreaterThan(previousCost);
      expect(levelFor(expectedXP - 1).level).toBe(level - 1);
      expect(levelFor(expectedXP).level).toBe(level);
      previousCost = cost;
    }
    expect(levelFor(xpForLevel(50) + 5000)).toMatchObject({ level: 50, next: null, remaining: 0 });
  });

  it('counts a serious first low-score attempt and ignores duplicate or immediate identical payments', () => {
    const empty = emptyState();
    const event = { ...completed('quiz', quizId, 0), correct: 0 };
    const first = record(empty, event);
    expect(first.xp).toBe(activityRewards.quiz.xp);
    expect(first.credits).toBe(activityRewards.quiz.credits);
    expect(first.transactions).toHaveLength(1);
    expect(empty.events).toHaveLength(0);
    expect(record(first, event)).toBe(first);
    const promptlyRepeated = record(first, { ...event, id: 'quiz-repeat', at: at(.1) });
    expect(promptlyRepeated.xp).toBe(first.xp);
    expect(promptlyRepeated.transactions).toEqual(first.transactions);
    expect(promptlyRepeated.events).toHaveLength(2);
  });

  it('rejects superficial runs, unknown material and out-of-scope event references', () => {
    const empty = emptyState();
    const event = completed('quiz', quizId, 0);
    expect(record(empty, { ...event, elapsedMs: 200 })).toBe(empty);
    expect(record(empty, { ...event, attempted: 1 })).toBe(empty);
    expect(record(empty, { ...event, contentId: 'unknown-quiz' })).toBe(empty);
    expect(record(empty, { ...event, subjectId: 'bk9' })).toBe(empty);
    const recall = completed('blurting', blurtingId, 0);
    expect(record(empty, { ...recall, attempted: 3 })).toBe(empty);
    expect(record(empty, { ...recall, concepts: {} })).toBe(empty);
  });

  it('rewards a new objective best without combining a review tariff with an improvement tariff', () => {
    const quiz = completed('quiz', quizId, 0);
    const initial = record(emptyState(), { ...quiz, correct: 0 });
    const improved = record(initial, { ...completed('quiz', quizId, 1), correct: 2 });
    expect(improved.xp - initial.xp).toBe(activityRewards.review.xp);
    expect(statistics(improved, at(1))).toMatchObject({ reviewed: 1, improved: 1, objective: { count: 2, correct: 2 } });
    expect(improved.unlocks).toContain('achievement:improved-quiz');
  });

  it('extends successful review intervals and caps financially rewarded repetitions', () => {
    let state = record(emptyState(), completed('quiz', quizId, 0));
    let day = 0;
    for (const interval of [1, 3, 7, 14, ...Array<number>(MAX_REWARDED_REVIEWS - 3).fill(30)]) {
      expect(reviewFor(state, 'quiz', quizId)?.interval).toBe(interval);
      day += interval;
      state = record(state, completed('quiz', quizId, day));
    }
    expect(reviewFor(state, 'quiz', quizId)?.rewarded).toBe(MAX_REWARDED_REVIEWS);
    expect(state.credits).toBe(activityRewards.quiz.credits + MAX_REWARDED_REVIEWS * activityRewards.review.credits);
    expect(stateSchema.safeParse(state).success).toBe(true);
  });

  it('keeps every cosmetic attainable with a finite catalogue economy', () => {
    const requiredCredits = cosmetics.reduce((sum, cosmetic) => sum + (cosmetic.condition.type === 'credits' ? cosmetic.condition.price : 0), 0);
    const activityCredits = catalog.quizzes.length * (activityRewards.quiz.credits + activityRewards.exam.credits)
      + catalog.flashcardSets.length * activityRewards.cards.credits + tasks.length * activityRewards.blurting.credits;
    const referenceCount = catalog.quizzes.length * 2 + catalog.flashcardSets.length + tasks.length;
    expect(activityCredits + referenceCount * MAX_REWARDED_REVIEWS * activityRewards.review.credits).toBeGreaterThan(requiredCredits);
  });

  it('does not pay daily indefinitely when the self assessment stays weak', () => {
    let state = record(emptyState(), { ...completed('quiz', quizId, 0), correct: 0 });
    for (let day = 1; day <= 6; day++) state = record(state, { ...completed('quiz', quizId, day), correct: 0 });
    expect(reviewFor(state, 'quiz', quizId)?.rewarded).toBe(5);
    expect(reviewFor(state, 'quiz', quizId)?.interval).toBe(1);
    state = record(state, { ...completed('quiz', quizId, 35), correct: 0 });
    expect(reviewFor(state, 'quiz', quizId)?.rewarded).toBe(6);
  });

  it('extends card review intervals from self ratings without recording an objective score', () => {
    const set = catalog.flashcardSets[0]!;
    const event = completed('cards', set.id, 0);
    let state = record(emptyState(), { ...event, selfKnown: event.total });
    expect(reviewFor(state, 'cards', set.id)?.interval).toBe(1);
    state = record(state, { ...completed('cards', set.id, 1), selfKnown: event.total });
    expect(reviewFor(state, 'cards', set.id)?.interval).toBe(3);
    expect(statistics(state, at(1))).toMatchObject({ objective: { count: 0 }, cardRatings: { count: 2, known: event.total * 2 } });
  });

  it('keeps self ratings distinct and counts each resolved gap only once', () => {
    const recall = completed('blurting', blurtingId, 0);
    const concepts = Object.fromEntries(Object.keys(recall.concepts!).map(id => [id, 'missing' as const]));
    let state = record(emptyState(), { ...recall, concepts });
    state = record(state, completed('blurting', blurtingId, 1));
    state = record(state, { ...completed('blurting', blurtingId, 2), concepts });
    state = record(state, completed('blurting', blurtingId, 3));
    expect(state.resolvedGaps.length).toBe(recall.total);
    expect(statistics(state, at(3))).toMatchObject({ objective: { count: 0 }, self: { count: 4, remembered: recall.total * 2, missing: recall.total * 2 } });
  });
});

describe('missions, cosmetics and archive integrity', () => {
  it('only completes a mission using real activities while active and pays the mission once', () => {
    const original = applyAction(emptyState(), { type: 'set-goal', learningFieldId: 'bk1-lf3' });
    const mission = recommendMissions(original, at(0), 'bk1-lf3')[0]!;
    expect(mission.learningFieldId).toBe('bk1-lf3');
    const [first, second] = mission.steps;
    const fake = { ...mission, steps: [{ ...first!, to: '//example.invalid' }, second!] };
    expect(applyAction(original, { type: 'mission-start', mission: fake, at: at(0) })).toBe(original);
    let state = applyAction(original, { type: 'mission-start', mission, at: at(0) });
    state = record(state, completed(first!.kind, first!.contentId, .1));
    state = applyAction(state, { type: 'mission-pause', id: mission.id, at: at(.2) });
    state = record(state, completed(second!.kind, second!.contentId, .3));
    expect(state.missions[0]?.status).toBe('paused');
    state = applyAction(state, { type: 'mission-resume', id: mission.id, at: at(.4) });
    state = record(state, completed(second!.kind, second!.contentId, .35));
    expect(state.missions[0]?.status).toBe('active');
    state = record(state, completed(second!.kind, second!.contentId, .5));
    expect(state.missions[0]?.status).toBe('completed');
    expect(state.transactions.filter(item => item.kind === 'mission')).toHaveLength(1);
    expect(applyAction(state, { type: 'mission-complete', id: mission.id, at: at(1) })).toBe(state);
    expect(stateSchema.safeParse(state).success).toBe(true);
  });

  it('restores historical mission labels and retired content while rejecting external paths', () => {
    const empty = emptyState();
    const plan = recommendMissions(empty, at(0), 'bk1-lf3')[0]!;
    const running = applyAction(empty, { type: 'mission-start', mission: plan, at: at(0) });
    const record = running.missions[0]!;
    const retired = plan.steps[0]!;
    const contentId = 'retired-topic';
    const step = { ...retired, contentId, id: retired.kind + ':' + contentId, to: retired.to.replace(retired.contentId, contentId) };
    const historic = { ...record, plan: { ...plan, title: 'Ehemaliger Titel', reward: { xp: 51, credits: 21 }, steps: [step, ...plan.steps.slice(1)] } };
    expect(stateSchema.safeParse({ ...running, missions: [historic] }).success).toBe(true);
    expect(missionSteps(historic)[0]?.to).toBeUndefined();
    historic.plan.steps[0] = { ...step, to: '//example.invalid' };
    expect(stateSchema.safeParse({ ...running, missions: [historic] }).success).toBe(false);
  });

  it('pays voluntary challenges once, evolves Orbit and confines the look to owned slots', () => {
    let state = emptyState();
    expect(applyAction(state, { type: 'cosmetic-buy', id: 'aurora', at: at(0) })).toBe(state);
    const cards = catalog.flashcardSets.find(set => set.learningFieldId === 'bk1-lf3')!;
    state = applyAction(state, { type: 'challenge-join', id: 'methods-three', at: at(0) });
    state = record(state, completed('quiz', quizId, 1));
    state = record(state, completed('cards', cards.id, 2));
    state = record(state, completed('blurting', blurtingId, 3));
    state = record(state, completed('exam', quizId, 4));
    state = record(state, completed('quiz', quizId, 5));
    expect(challengeProgress(state, 'methods-three')).toMatchObject({ current: 3, target: 3, joined: true, complete: true });
    expect(state.transactions.filter(item => item.kind === 'challenge')).toHaveLength(1);
    expect(companionProgress(state, 'orbit').stageName).toBe('Awakened');
    const paid = applyAction(state, { type: 'cosmetic-buy', id: 'aurora', at: at(5) });
    expect(paid.credits).toBe(state.credits - 160);
    expect(applyAction(paid, { type: 'cosmetic-buy', id: 'aurora', at: at(5) })).toBe(paid);
    const equipped = applyAction(paid, { type: 'equip', equipped: { background: 'aurora', accent: 'accent-iris', logo: 'aurora', companion: 'glitch' } });
    expect(equipped.equipped).toEqual({ background: 'aurora' });
    const preset = applyAction(equipped, { type: 'preset-save', id: 'custom', name: 'Ruhiger Hintergrund' });
    expect(preset.presets[0]?.equipped).toEqual(equipped.equipped);
    expect(stateSchema.safeParse(preset).success).toBe(true);
    expect(stateSchema.safeParse({ ...preset, credits: preset.credits + 1 }).success).toBe(false);
  });
});

it('keeps quiz and examination answer totals separate in statistics', () => {
  const quiz = { ...completed('quiz', quizId, 0), correct: 0 };
  const exam = completed('exam', quizId, 1);
  const state = record(record(emptyState(), quiz), exam);
  expect(statistics(state)).toMatchObject({
    quiz: { total: quiz.total, correct: 0 },
    exam: { total: exam.total, correct: exam.total },
    self: { count: 0 },
  });
});
