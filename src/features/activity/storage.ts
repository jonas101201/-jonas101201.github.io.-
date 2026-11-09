import { z } from 'zod';
import type { StoragePort } from '../../utils/storage';
export const ACTIVITY_KEY = 'lernhub:activity:v1';
const Entry = z.object({ to: z.string().regex(/^\/(?:(?:materialien|quizze|karteikarten)\/[a-z0-9-]+|lernzettel\/[a-z0-9-]+(?:\/[a-z0-9-]+)?)$/), visitedAt: z.iso.datetime() });
const Envelope = z.object({ version: z.literal(1), entries: z.array(Entry).max(20) });
export type Activity = z.infer<typeof Entry>;
export function addActivity(entries: Activity[], to: string, now = new Date().toISOString()): Activity[] {
  const entry = Entry.parse({ to, visitedAt: now });
  return [entry, ...entries.filter(e => e.to !== to)].slice(0, 20);
}
export function readActivity(storage: Pick<StoragePort, 'getItem'>, enabled: boolean): { activities: Activity[]; activityWritable: boolean; activityWarning: string | null } {
  if (!enabled) return { activities: [], activityWritable: true, activityWarning: null };
  try {
    const raw = storage.getItem(ACTIVITY_KEY);
    if (!raw) return { activities: [], activityWritable: true, activityWarning: null };
    const parsed = Envelope.parse(JSON.parse(raw));
    // v1 is independent of the existing progress v1. Future migrations must be explicit.
    return { activities: parsed.entries, activityWritable: true, activityWarning: null };
  } catch {
    return { activities: [], activityWritable: false, activityWarning: 'Der Aktivitätsverlauf ist nicht lesbar oder stammt aus einer neueren Version. Er bleibt bis zum Zurücksetzen unverändert.' };
  }
}
export function writeActivity(storage: StoragePort, entries: Activity[]) {
  try { storage.setItem(ACTIVITY_KEY, JSON.stringify(Envelope.parse({ version: 1, entries }))); return true; }
  catch { return false; }
}
