import { z } from 'zod';
import { studyTopics } from '../study-sheets/data';
import type { BlurtingTask } from './tasks';

const apiOrigin = (import.meta.env.VITE_SMART_RECALL_API_ORIGIN || import.meta.env.VITE_MATERIALS_API_ORIGIN)?.replace(/\/$/, '');
const smartRecallEnabled = import.meta.env.VITE_SMART_RECALL === 'true' && Boolean(apiOrigin && /^https:\/\/[a-z0-9.-]+$/i.test(apiOrigin));
const pilot = new Set(['bk2-lf4-spiel', 'bk1-lf3-feinfuehligkeit', 'mathematik-regression-korrelation']);
export function isSmartRecallTaskEnabled(taskId: string) {
  return smartRecallEnabled && (pilot.has(taskId) || import.meta.env.VITE_SMART_RECALL_ALL_TASKS === 'true');
}

export const smartRecallMaxAnswer = 3000;
export const smartRecallNotBefore = Date.parse(import.meta.env.VITE_SMART_RECALL_NOT_BEFORE ?? '');

export const recallStatuses = ['correct', 'partial', 'incomplete', 'wrong', 'missing', 'uncertain'] as const;
const text = z.string().max(1000);
const points = z.number().min(0).max(100);
const schema = z.object({
  status: z.enum(['evaluated', 'uncertain']),
  taskId: z.string(),
  version: z.string().min(1).max(100),
  criteria: z.array(z.object({
    id: z.string(), status: z.enum(recallStatuses), reason: text,
    excerpt: text.nullish(), sourceId: z.string().nullish(), sourceQuote: text.nullish(), correction: text.nullish(),
  })).min(1).max(20),
  sources: z.array(z.object({
    id: z.string(), sheetId: z.string(), sectionId: z.string(), title: text, to: z.string(),
  })).min(1).max(20),
  score: z.object({ earned: points, possible: points.positive(), maxEarned: points }),
  feedback: text,
});

export type SmartRecallResult = z.infer<typeof schema>;
export type SmartRecallError = 'access_connection' | 'unauthorized' | 'disabled' | 'invalid_request' | 'unsupported_task' | 'busy' | 'user_budget' | 'budget' | 'unavailable' | 'invalid_result' | 'timeout';
const errors = new Set<string>(['unauthorized', 'disabled', 'invalid_request', 'unsupported_task', 'busy', 'user_budget', 'budget', 'unavailable', 'invalid_result', 'timeout']);

export function parseSmartRecallResult(raw: unknown, task: BlurtingTask, answer: string) {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return null;
  const result = parsed.data;
  const { score } = result;
  const concepts = new Set(task.concepts.map(concept => concept.id));
  const sources = new Set(result.sources.map(source => source.id));
  if (result.taskId !== task.id || score.earned > score.maxEarned || score.maxEarned > score.possible ||
      result.criteria.length !== concepts.size || new Set(result.criteria.map(row => row.id)).size !== concepts.size ||
      sources.size !== result.sources.length ||
      result.criteria.some(row => !concepts.has(row.id) || (row.sourceId && !sources.has(row.sourceId)) || (row.excerpt && !answer.includes(row.excerpt))) ||
      result.sources.some(source => !studyTopics.some(topic => topic.id === source.sheetId + '/' + source.sectionId && topic.to === source.to))
  ) return null;
  return result;
}

export function smartRecallLoginUrl() {
  return `${apiOrigin}/api/recall/session`;
}

export async function requestSmartRecall(task: BlurtingTask, answer: string, attemptId: string, language: 'de' | 'uk', signal: AbortSignal) {
  const response = await fetch(`${apiOrigin}/api/recall/evaluate`, {
    method: 'POST', credentials: 'include', redirect: 'error', cache: 'no-store', signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId: task.id, answer, attemptId, language }),
  }).catch((error: unknown) => {
    if (!signal.aborted && error instanceof TypeError && navigator.onLine) throw new Error('access_connection');
    throw error;
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('unauthorized');
    const raw: unknown = await response.json().catch(() => null);
    const error = raw && typeof raw === 'object' && 'error' in raw ? raw.error : null;
    throw new Error(typeof error === 'string' && errors.has(error) ? error : 'unavailable');
  }
  const result = parseSmartRecallResult(await response.json().catch(() => null), task, answer);
  if (!result) throw new Error('invalid_result');
  return result;
}
