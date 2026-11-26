import { z } from 'zod';
import { catalog } from '../../data/catalog';
import { achievementDefinitions, challengeDefinitions, collectionDefinitions } from './achievementRegistry';
import { activityKey, assessedWell, challengeProgress, eventCounts } from './analytics';
import { companionProgress, companionQualified, companions } from './companions';
import { compatibleLook, cosmeticById, cosmetics } from './cosmetics';
import { premiumWorldById, premiumWorlds } from './worlds';
import { dateSchema, keySchema, learningKinds, learningReference, missionRecordSchema, validMissionPlan, validStoredMissionPlan, type MissionPlan } from './missions';
import { activityRewards, DAY_MS, elapsedDays, INITIAL_REWARDED_REVIEWS, levelFor, LONG_TERM_REWARD_GAP_DAYS, MAX_REWARDED_REVIEWS, MIN_BLURTING_WORDS, milestoneLevels, REVIEW_DAYS, type Reward } from './rules';

export { levelFor, milestoneLevels, xpForLevel } from './rules';
export { achievementDefinitions, challengeDefinitions, collectionDefinitions } from './achievementRegistry';
export { challengeProgress, reviewFor, statistics } from './analytics';
export type LearningKind = typeof learningKinds[number];

const ratings = ['remembered', 'partial', 'missing', 'misunderstood'] as const;
const integer = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
const shortText = z.string().trim().min(1).max(60);
const maxEvents = 20_000;
const maxTransactions = 50_000;

// A completion records activity and observations. XP or a credit balance is
// never accepted from the learning screen.
const learningEventSchema = z.strictObject({
  id: keySchema,
  kind: z.enum(learningKinds),
  contentId: keySchema,
  subjectId: keySchema,
  learningFieldId: keySchema.optional(),
  at: dateSchema,
  attempted: integer,
  total: integer.min(1).max(1000),
  correct: integer.optional(),
  selfKnown: integer.optional(),
  elapsedMs: integer,
  concepts: z.record(keySchema, z.enum(ratings)).optional(),
}).refine(event => event.kind === 'blurting'
  ? event.correct === undefined && event.selfKnown === undefined && event.concepts !== undefined && Object.keys(event.concepts).length === event.total
  : event.attempted === event.total && event.concepts === undefined &&
    (event.kind === 'cards' ? event.correct === undefined && (event.selfKnown ?? 0) <= event.total
      : event.selfKnown === undefined && event.correct !== undefined && event.correct <= event.total));

export type LearningEvent = z.infer<typeof learningEventSchema>;

const transactionKinds = ['activity', 'review', 'improvement', 'mission', 'challenge', 'collection', 'purchase'] as const;
const transactionSchema = z.strictObject({
  id: keySchema,
  kind: z.enum(transactionKinds),
  eventId: keySchema.optional(),
  title: z.string().min(1).max(400),
  at: dateSchema,
  xp: integer,
  credits: z.number().int().min(-1_000_000).max(1_000_000),
});
type Transaction = z.infer<typeof transactionSchema>;
const reviewSchema = z.strictObject({
  lastAt: dateSchema,
  dueAt: dateSchema,
  interval: z.number().int().min(1).max(30),
  streak: integer.max(REVIEW_DAYS.length - 1),
  rewarded: integer.max(MAX_REWARDED_REVIEWS),
  lastRewardedAt: dateSchema.optional(),
});
type Review = z.infer<typeof reviewSchema>;
const lookSchema = z.record(keySchema, keySchema);
const presetSchema = z.strictObject({ id: keySchema, name: shortText, equipped: lookSchema });
const stateDataSchema = z.strictObject({
  version: z.literal(1),
  xp: integer,
  credits: integer,
  events: z.array(learningEventSchema).max(maxEvents),
  transactions: z.array(transactionSchema).max(maxTransactions),
  owned: z.array(keySchema).max(500),
  equipped: lookSchema,
  wishlist: z.array(keySchema).max(500),
  presets: z.array(presetSchema).max(12),
  activeCompanion: keySchema,
  companionPoints: z.record(keySchema, integer),
  unlocks: z.array(keySchema).max(2000),
  missions: z.array(missionRecordSchema).max(500),
  reviews: z.record(keySchema, reviewSchema),
  resolvedGaps: z.array(keySchema).max(20_000),
  challenges: z.record(keySchema, dateSchema),
  goalFieldId: keySchema.optional(),
});

export type State = z.infer<typeof stateDataSchema>;
export type Action =
  | { type: 'complete'; event: LearningEvent }
  | { type: 'cosmetic-buy'; id: string; at: string }
  | { type: 'cosmetic-wishlist'; id: string }
  | { type: 'world-buy'; id: string; at: string }
  | { type: 'world-equip' | 'world-wishlist'; id: string }
  | { type: 'equip'; equipped: Record<string, string> }
  | { type: 'preset-save'; id: string; name: string }
  | { type: 'preset-delete'; id: string }
  | { type: 'preset-rename'; id: string; name: string }
  | { type: 'companion-select'; id: string }
  | { type: 'mission-start'; mission: MissionPlan; at: string }
  | { type: 'mission-pause' | 'mission-resume' | 'mission-cancel' | 'mission-complete'; id: string; at: string }
  | { type: 'challenge-join'; id: string; at: string }
  | { type: 'set-goal'; learningFieldId?: string };

function unique(values: readonly string[]) {
  return new Set(values).size === values.length;
}

export const stateSchema = stateDataSchema.superRefine((state, ctx) => {
  const inconsistent = (path: string) => ctx.addIssue({ code: 'custom', path: [path], message: 'Inconsistent local progress archive' });
  if (!unique(state.events.map(event => event.id))) inconsistent('events');
  const eventIds = new Set(state.events.map(event => event.id));
  if (!unique(state.transactions.map(transaction => transaction.id))) inconsistent('transactions');
  let credits = 0, xp = 0;
  for (const transaction of state.transactions) {
    const purchase = transaction.kind === 'purchase';
    const observational = transaction.kind === 'review' || transaction.kind === 'improvement';
    if (purchase ? transaction.xp !== 0 || transaction.credits >= 0 : transaction.credits < 0 || (!observational && transaction.xp === 0)) {
      inconsistent('transactions');
      break;
    }
    if (transaction.eventId && !eventIds.has(transaction.eventId)) {
      inconsistent('transactions');
      break;
    }
    credits += transaction.credits;
    xp += transaction.xp;
    if (credits < 0 || !Number.isSafeInteger(credits) || !Number.isSafeInteger(xp)) {
      inconsistent('transactions');
      break;
    }
  }
  if (credits !== state.credits) inconsistent('credits');
  if (xp !== state.xp) inconsistent('xp');
  if (!unique(state.owned) || !unique(state.wishlist) || !unique(state.unlocks) || !unique(state.resolvedGaps)) inconsistent('unlocks');
  for (const world of premiumWorlds) {
    const purchase = state.transactions.find(tx => tx.id === `purchase:world:${world.id}`);
    const count = world.cosmeticIds.filter(id => state.owned.includes(id)).length;
    if (purchase ? purchase.kind !== 'purchase' || purchase.credits >= 0 || count !== world.cosmeticIds.length : count !== 0) {
      inconsistent('owned');
    }
  }
  if (state.transactions.some(tx => {
    if (tx.id.startsWith('purchase:world:')) return !premiumWorldById(tx.id.slice('purchase:world:'.length));
    return tx.kind === 'purchase' && cosmeticById(tx.id.slice('purchase:'.length))?.condition.type === 'world';
  })) inconsistent('transactions');
  if (!state.owned.includes('orbit') || !state.owned.includes(state.activeCompanion) || !companions.some(item => item.id === state.activeCompanion)) inconsistent('activeCompanion');
  for (const [slot, id] of Object.entries(state.equipped)) {
    if (!state.owned.includes(id) || cosmeticById(id)?.slot !== slot || (slot === 'companion' && id !== state.activeCompanion)) inconsistent('equipped');
  }
  if (!unique(state.presets.map(preset => preset.id)) || state.presets.some(preset => Object.entries(preset.equipped).some(([slot, id]) => cosmeticById(id)?.slot !== slot || !state.owned.includes(id)))) inconsistent('presets');
  if (!unique(state.missions.map(mission => mission.id)) || state.missions.filter(mission => mission.status === 'active').length > 1) inconsistent('missions');
  for (const mission of state.missions) {
    if (mission.id !== mission.plan.id || !validStoredMissionPlan(mission.plan) || !unique(mission.completedStepIds) ||
      !mission.completedStepIds.every(id => mission.plan.steps.some(step => step.id === id)) ||
      (mission.status === 'completed' && (!mission.completedAt || mission.completedStepIds.length !== mission.plan.steps.length))) {
      inconsistent('missions');
      break;
    }
  }
});

export function emptyState(): State {
  return {
    version: 1, xp: 0, credits: 0, events: [], transactions: [],
    owned: ['orbit'], equipped: {}, wishlist: [], presets: [],
    activeCompanion: 'orbit', companionPoints: {}, unlocks: [],
    missions: [], reviews: {}, resolvedGaps: [], challenges: {},
  };
}

function qualify(event: LearningEvent) {
  if (!learningEventSchema.safeParse(event).success) return false;
  const reference = learningReference(event.kind, event.contentId);
  if (!reference || event.subjectId !== reference.subjectId || event.learningFieldId !== reference.learningFieldId || event.total !== reference.total) return false;
  if (event.kind === 'blurting') {
    return event.attempted >= MIN_BLURTING_WORDS && event.elapsedMs >= 15_000 &&
      reference.conceptIds?.every(id => Object.hasOwn(event.concepts ?? {}, id)) === true;
  }
  return event.elapsedMs >= 2_000 * event.attempted;
}

function plannedReview(previous: Review | undefined, event: LearningEvent, due: boolean, rewarded: boolean): Review {
  const well = assessedWell(event);
  const streak = !well ? 0 : due ? Math.min((previous?.streak ?? 0) + 1, REVIEW_DAYS.length - 1) : previous?.streak ?? 0;
  const interval = REVIEW_DAYS[streak]!;
  const dueAt = new Date(Date.parse(event.at) + interval * DAY_MS).toISOString();
  if (previous && !due && Date.parse(dueAt) >= Date.parse(previous.dueAt)) return previous;
  return { lastAt: event.at, dueAt, interval, streak, rewarded: (previous?.rewarded ?? 0) + Number(rewarded),
    lastRewardedAt: rewarded ? event.at : previous?.lastRewardedAt };
}

function grant(state: State, transaction: Transaction) {
  // IDs are deterministic per financial or milestone action.
  if (state.transactions.some(previous => previous.id === transaction.id)) return;
  state.xp += transaction.xp;
  state.credits += transaction.credits;
  state.transactions.push(transaction);
}

function reward(state: State, kind: Exclude<Transaction['kind'], 'purchase'>, id: string, title: string, at: string, amounts: Reward, eventId?: string) {
  grant(state, { id: `${kind}:${id}`, kind, title, at, ...amounts, ...(eventId === undefined ? {} : { eventId }) });
}

function unlock(state: State, id: string) {
  if (state.unlocks.includes(id)) return false;
  state.unlocks.push(id);
  return true;
}

function addOwned(state: State, id: string) {
  if (state.owned.includes(id)) return false;
  state.owned.push(id);
  unlock(state, `cosmetic:${id}`);
  return true;
}

export function ownsWorld(state: State, id: string) {
  const world = premiumWorldById(id);
  return Boolean(world && world.cosmeticIds.every(cosmeticId => state.owned.includes(cosmeticId)));
}

export function cosmeticAvailable(state: State, id: string) {
  const item = cosmeticById(id);
  if (!item) return false;
  if (state.owned.includes(id)) return true;
  const condition = item.condition;
  switch (condition.type) {
    case 'credits': return state.credits >= condition.price;
    case 'world': return false;
    case 'level': return levelFor(state.xp).level >= condition.level;
    case 'companion': return companionQualified(state, condition.id);
    case 'collection':
    case 'achievement': return state.unlocks.includes(`${condition.type}:${condition.id}`);
  }
}

function settleUnlocks(state: State, at: string, eventId?: string) {
  const metrics = eventCounts(state);
  const subjectMethods = (subjectId: string) => new Set(state.events.filter(event => event.subjectId === subjectId).map(event => event.kind)).size;
  const subjectReviewed = (subjectId: string) => [...metrics.reviewedIds].some(id => metrics.eventsById.get(id)?.subjectId === subjectId);
  const completeMissions = state.missions.filter(mission => mission.status === 'completed');
  const stage = Math.max(...companions.map(companion => companionProgress(state, companion.id).stage));
  const criteria: Record<typeof achievementDefinitions[number]['id'], boolean> = {
    'first-blurting': metrics.blurting >= 1, 'ten-recalls': metrics.blurting >= 10,
    'first-review': metrics.reviewed >= 1, 'all-methods': metrics.methods.length >= 4,
    'improved-quiz': metrics.improved >= 1, 'first-mission': completeMissions.length >= 1,
    'expert-mission': completeMissions.some(mission => mission.plan.kind === 'expert'),
    'first-exam': metrics.exams >= 1, 'five-exams': metrics.exams >= 5,
    'bk1-methods': subjectMethods('bk1') >= 3, 'bk1-review': subjectReviewed('bk1'),
    'bk2-methods': subjectMethods('bk2') >= 3, 'bk2-review': subjectReviewed('bk2'),
    'first-evolution': stage >= 1, 'companion-celestial': stage >= 3,
  };
  for (const { id } of achievementDefinitions) if (criteria[id]) unlock(state, `achievement:${id}`);
  for (const collection of collectionDefinitions) {
    if (collection.achievementIds.every(id => state.unlocks.includes(`achievement:${id}`)) && unlock(state, `collection:${collection.id}`)) {
      reward(state, 'collection', collection.id, collection.title, at, activityRewards.collection, eventId);
    }
  }
  for (const challenge of challengeDefinitions) {
    if (!Object.hasOwn(state.challenges, challenge.id)) continue;
    const progress = challengeProgress(state, challenge.id, metrics);
    if (progress.current >= progress.target && unlock(state, `challenge:${challenge.id}`)) {
      reward(state, 'challenge', challenge.id, challenge.title, at, challenge.reward, eventId);
    }
  }
  const level = levelFor(state.xp).level;
  for (const milestone of milestoneLevels) if (level >= milestone) unlock(state, `level:${milestone}`);
  for (const item of cosmetics) if (item.condition.type !== 'credits' && cosmeticAvailable(state, item.id)) addOwned(state, item.id);
}

function setLook(state: State, requested: Record<string, string>) {
  state.equipped = compatibleLook(requested, state.owned);
  state.activeCompanion = state.equipped.companion ?? 'orbit';
}

function completeMission(state: State, mission: State['missions'][number], at: string, eventId?: string) {
  if (mission.status !== 'active' || mission.completedStepIds.length !== mission.plan.steps.length) return;
  mission.status = 'completed';
  mission.completedAt = at;
  unlock(state, `mission:${mission.id}`);
  reward(state, 'mission', mission.id, mission.plan.title, at, mission.plan.reward, eventId);
}

function completeActivity(state: State, event: LearningEvent) {
  const key = activityKey(event.kind, event.contentId);
  const same = state.events.filter(old => old.kind === event.kind && old.contentId === event.contentId);
  const previous = same.at(-1);
  // Equal-time sequences can arise from simultaneous saves in separate tabs.
  // They do not produce another review or mission credit.
  if (previous && Date.parse(previous.at) >= Date.parse(event.at)) return false;
  const reference = learningReference(event.kind, event.contentId)!;
  const review = state.reviews[key];
  const due = Boolean(review && Date.parse(event.at) >= Date.parse(review.dueAt));
  const rewardCount = review?.rewarded ?? 0;
  const eligibleInterval = rewardCount < INITIAL_REWARDED_REVIEWS || Boolean(
    review?.lastRewardedAt && elapsedDays(review.lastRewardedAt, event.at) >= LONG_TERM_REWARD_GAP_DAYS,
  );
  const rewarded = due && eligibleInterval && rewardCount < MAX_REWARDED_REVIEWS;
  const best = same.reduce((maximum, old) => Math.max(maximum, old.correct ?? 0), 0);
  const improved = previous !== undefined && event.correct !== undefined && event.correct - best >= Math.max(1, Math.ceil(event.total * 0.05));
  state.events.push(event);
  if (!previous) reward(state, 'activity', key, reference.title, event.at, activityRewards[event.kind], event.id);
  // A due repetition uses its own tariff. Do not stack an improvement payment on it.
  if (due) reward(state, 'review', event.id, reference.title, event.at, rewarded ? activityRewards.review : { xp: 0, credits: 0 }, event.id);
  if (improved) reward(state, 'improvement', event.id, reference.title, event.at, rewarded ? { xp: 0, credits: 0 } : activityRewards.improvement, event.id);
  state.reviews[key] = plannedReview(review, event, due, rewarded);
  if (previous?.concepts && event.concepts) {
    for (const [id, rating] of Object.entries(event.concepts)) {
      const gap = `${key}:${id}`;
      if (rating === 'remembered' && previous.concepts[id] && previous.concepts[id] !== 'remembered' && !state.resolvedGaps.includes(gap)) {
        state.resolvedGaps.push(gap);
      }
    }
  }
  const mission = state.missions.find(item => item.status === 'active');
  const step = mission?.plan.steps.find(item => item.id === key);
  const stepCompleted = mission && step && Date.parse(event.at) >= Date.parse(mission.resumedAt ?? mission.startedAt) && !mission.completedStepIds.includes(step.id);
  const beforeStage = companionProgress(state, state.activeCompanion).stage;
  if (!previous || rewarded || improved || stepCompleted) {
    state.companionPoints[state.activeCompanion] = (state.companionPoints[state.activeCompanion] ?? 0) + 1;
  }
  const stage = companionProgress(state, state.activeCompanion).stage;
  if (stage > beforeStage) unlock(state, `companion:${state.activeCompanion}:${stage}`);
  if (stepCompleted) {
    mission.completedStepIds.push(step.id);
    completeMission(state, mission, event.at, event.id);
  }
  settleUnlocks(state, event.at, event.id);
  return true;
}

/** Pure transition for a single IndexedDB transaction. The input stays immutable. */
export function applyAction(current: State, action: Action): State {
  if ('at' in action && !dateSchema.safeParse(action.at).success) return current;
  if ('id' in action && !keySchema.safeParse(action.id).success) return current;
  if (action.type === 'complete' && (current.events.length >= maxEvents || current.events.some(event => event.id === action.event.id) || !qualify(action.event))) return current;
  const state = structuredClone(current);
  switch (action.type) {
    case 'complete': return completeActivity(state, structuredClone(action.event)) ? state : current;
    case 'cosmetic-buy': {
      const item = cosmeticById(action.id);
      if (!item || item.condition.type !== 'credits' || state.owned.includes(item.id) || !cosmeticAvailable(state, item.id)) return current;
      grant(state, { id: `purchase:${item.id}`, kind: 'purchase', title: item.name, at: action.at, xp: 0, credits: -item.condition.price });
      addOwned(state, item.id);
      return state;
    }
    case 'world-buy': {
      const world = premiumWorldById(action.id);
      if (!world || state.credits < world.price || state.transactions.some(tx => tx.id === `purchase:world:${world.id}`)) return current;
      const items = Object.entries(world.look);
      if (items.length !== 6 || world.cosmeticIds.length !== items.length || !unique(world.cosmeticIds) || items.some(([slot, id]) => {
        const item = cosmeticById(id);
        return !world.cosmeticIds.includes(id) || !item || item.slot !== slot || item.condition.type !== 'world' || item.condition.id !== world.id || state.owned.includes(id);
      })) return current;
      grant(state, { id: `purchase:world:${world.id}`, kind: 'purchase', title: world.name, at: action.at, xp: 0, credits: -world.price });
      for (const id of world.cosmeticIds) addOwned(state, id);
      return state;
    }
    case 'world-equip': {
      const world = premiumWorldById(action.id);
      if (!world || !ownsWorld(state, world.id)) return current;
      setLook(state, { ...state.equipped, ...world.look });
      return state;
    }
    case 'world-wishlist':
    case 'cosmetic-wishlist': {
      if (action.type === 'world-wishlist' ? !premiumWorldById(action.id) : !cosmeticById(action.id) || cosmeticById(action.id)?.condition.type === 'world') return current;
      state.wishlist = state.wishlist.includes(action.id) ? state.wishlist.filter(id => id !== action.id) : [...state.wishlist, action.id];
      return state;
    }
    case 'equip': {
      setLook(state, action.equipped);
      return state;
    }
    case 'preset-save': {
      const name = shortText.safeParse(action.name);
      if (!name.success || (state.presets.length >= 12 && !state.presets.some(preset => preset.id === action.id))) return current;
      const preset = { id: action.id, name: name.data, equipped: { ...state.equipped } };
      state.presets = [...state.presets.filter(item => item.id !== action.id), preset];
      return state;
    }
    case 'preset-rename': {
      const name = shortText.safeParse(action.name);
      const preset = state.presets.find(item => item.id === action.id);
      if (!name.success || !preset || preset.name === name.data) return current;
      preset.name = name.data;
      return state;
    }
    case 'preset-delete': {
      if (!state.presets.some(preset => preset.id === action.id)) return current;
      state.presets = state.presets.filter(preset => preset.id !== action.id);
      return state;
    }
    case 'companion-select': {
      if (!companions.some(companion => companion.id === action.id) || !state.owned.includes(action.id)) return current;
      setLook(state, { ...state.equipped, companion: action.id });
      return state;
    }
    case 'mission-start': {
      if (!validMissionPlan(action.mission) || state.missions.some(mission => mission.status === 'active') ||
        state.missions.some(mission => mission.id === action.mission.id && mission.status !== 'cancelled')) return current;
      state.missions = [...state.missions.filter(mission => mission.id !== action.mission.id),
        { id: action.mission.id, plan: structuredClone(action.mission), status: 'active', startedAt: action.at, completedStepIds: [] }];
      return state;
    }
    case 'mission-pause':
    case 'mission-resume':
    case 'mission-cancel':
    case 'mission-complete': {
      const mission = state.missions.find(item => item.id === action.id);
      if (!mission || mission.status === 'completed' || mission.status === 'cancelled') return current;
      if (action.type === 'mission-pause' && mission.status === 'active') mission.status = 'paused';
      else if (action.type === 'mission-resume' && mission.status === 'paused' && !state.missions.some(item => item.status === 'active')) {
        if (Date.parse(action.at) < Date.parse(mission.resumedAt ?? mission.startedAt)) return current;
        mission.status = 'active';
        mission.resumedAt = action.at;
      }
      else if (action.type === 'mission-cancel') mission.status = 'cancelled';
      else if (action.type === 'mission-complete' && mission.completedStepIds.length === mission.plan.steps.length) completeMission(state, mission, action.at);
      else return current;
      return state;
    }
    case 'challenge-join': {
      if (Object.hasOwn(state.challenges, action.id) || !challengeDefinitions.some(challenge => challenge.id === action.id)) return current;
      state.challenges[action.id] = action.at;
      settleUnlocks(state, action.at);
      return state;
    }
    case 'set-goal': {
      if (action.learningFieldId && !catalog.learningFields.some(field => field.id === action.learningFieldId)) return current;
      state.goalFieldId = action.learningFieldId;
      return state;
    }
  }
}
