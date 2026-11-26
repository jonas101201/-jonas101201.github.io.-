import { z } from 'zod';
import type { BlurtingConcept } from './tasks';

export const maxAnswerLength = 50_000;
export const ratings = ['remembered', 'partial', 'missing', 'misunderstood'] as const;
export type Rating = typeof ratings[number];

export function words(text: string): string[] {
  return text.normalize('NFKC').toLocaleLowerCase('de-DE')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .match(/[\p{L}\p{M}\p{N}]+/gu) ?? [];
}

export function matchedKeywords(tokens: readonly string[], concept: Pick<BlurtingConcept, 'keywords'>): string[] {
  return concept.keywords.filter(keyword => {
    const phrase = words(keyword);
    return phrase.length > 0 && tokens.some((_, index) => phrase.every((word, offset) => tokens[index + offset] === word));
  });
}

export function summarizeRatings(values: readonly Rating[]) {
  const totals: Record<Rating, number> = { remembered: 0, partial: 0, missing: 0, misunderstood: 0 };
  for (const rating of values) totals[rating]++;
  return totals;
}

const draftSchema = z.object({
  version: z.literal(1),
  id: z.uuid(),
  phase: z.enum(['write', 'compare']),
  answer: z.string().max(maxAnswerLength),
  ratings: z.record(z.string().regex(/^[a-z][a-z0-9-]{0,59}$/), z.enum(ratings)),
  showTimer: z.boolean(),
  recallElapsedMs: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).optional(),
  startedAt: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
}).strict();
export type Draft = z.infer<typeof draftSchema>;

export function parseDraft(value: string | null, concepts: readonly Pick<BlurtingConcept, 'id'>[]) {
  if (!value || value.length > 65_536) return null;
  try {
    const draft = draftSchema.safeParse(JSON.parse(value));
    if (!draft.success) return null;
    if (Object.keys(draft.data.ratings).some(id => !concepts.some(concept => concept.id === id))) return null;
    return draft.data;
  } catch {
    return null;
  }
}
