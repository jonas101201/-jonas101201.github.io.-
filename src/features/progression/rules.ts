export const DAY_MS = 86_400_000;
export const REVIEW_DAYS = [1, 3, 7, 14, 30] as const;
export const MAX_REWARDED_REVIEWS = 12;
export const INITIAL_REWARDED_REVIEWS = 5;
export const LONG_TERM_REWARD_GAP_DAYS = 30;
export const MIN_BLURTING_WORDS = 12;
export const LEVEL_COUNT = 50;

export interface Reward { xp: number; credits: number }

export const activityRewards = {
  cards: { xp: 40, credits: 15 },
  quiz: { xp: 60, credits: 25 },
  blurting: { xp: 80, credits: 35 },
  exam: { xp: 150, credits: 60 },
  review: { xp: 120, credits: 50 },
  improvement: { xp: 35, credits: 15 },
  collection: { xp: 500, credits: 500 },
} satisfies Record<string, Reward>;

export const missionClasses = {
  quick: { label: 'Quick Mission', estimatedMinutes: 5, reward: { xp: 50, credits: 20 }, steps: 2 },
  focus: { label: 'Focus Mission', estimatedMinutes: 12, reward: { xp: 100, credits: 40 }, steps: 3 },
  expert: { label: 'Expert Mission', estimatedMinutes: 25, reward: { xp: 200, credits: 85 }, steps: 4 },
  master: { label: 'Master Mission', estimatedMinutes: 40, reward: { xp: 350, credits: 150 }, steps: 5 },
} as const;

export const milestoneLevels = [5, 10, 15, 20, 30, 40, 50] as const;
export const companionThresholds = [0, 5, 15, 30] as const;

export function xpForLevel(level: number) {
  const steps = Math.max(0, Math.min(LEVEL_COUNT, Math.floor(level)) - 1);
  return 90 * steps + 6 * steps * (steps - 1) / 2 + Math.floor(steps * (steps - 1) * (2 * steps - 1) / 30);
}

export function levelFor(xp: number) {
  let level = 1;
  while (level < LEVEL_COUNT && xp >= xpForLevel(level + 1)) level++;
  const floor = xpForLevel(level);
  const next = level < LEVEL_COUNT ? xpForLevel(level + 1) : null;
  return { level, floor, next, earned: Math.max(0, xp - floor), remaining: next === null ? 0 : Math.max(0, next - xp) };
}

export function elapsedDays(from: string, to: string) {
  return (Date.parse(to) - Date.parse(from)) / DAY_MS;
}
