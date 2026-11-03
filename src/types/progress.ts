import { z } from 'zod';
const safeKey = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?::[a-z0-9]+(?:-[a-z0-9]+)*)?$/);
export const QuizResultSchema = z.object({ id: z.string().min(1), quizId: safeKey, date: z.iso.datetime(), mode: z.enum(['learn','exam']), score: z.number().int().nonnegative(), total: z.number().int().positive(), wrongQuestionIds: z.array(safeKey) }).refine(r => r.score <= r.total && r.wrongQuestionIds.length === r.total - r.score && new Set(r.wrongQuestionIds).size === r.wrongQuestionIds.length);
export const CardProgressSchema = z.object({ status: z.enum(['known','difficult']), reviews: z.number().int().positive(), updatedAt: z.iso.datetime() });
export const LearningProgressSchema = z.object({ version: z.literal(1), quizResults: z.array(QuizResultSchema).max(200), cards: z.record(safeKey, CardProgressSchema) });
export type QuizResult = z.infer<typeof QuizResultSchema>;
export type LearningProgress = z.infer<typeof LearningProgressSchema>;
export const emptyProgress = (): LearningProgress => ({ version: 1, quizResults: [], cards: {} });
