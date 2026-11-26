import type { Action } from './engine';
import { readConsent } from './consent';

export async function recordLearningCompletion(event: Extract<Action, { type: 'complete' }>['event']) {
  const epoch = readConsent();
  if (!epoch) return null;
  try {
    const { dispatchProgression } = await import('./store');
    const result = await dispatchProgression({ type: 'complete', event }, epoch);
    const transactions = result?.transactions.filter(item => item.eventId === event.id) ?? [];
    if (!transactions.length) return null;
    return {
      xp: transactions.reduce((sum, item) => sum + item.xp, 0),
      credits: transactions.reduce((sum, item) => sum + item.credits, 0),
    };
  } catch {
    // A blocked local database must never disrupt an existing learning session.
    return null;
  }
}
