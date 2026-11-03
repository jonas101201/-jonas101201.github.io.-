import { emptyProgress, LearningProgressSchema, type LearningProgress } from '../types/progress';
export const STORAGE_KEY = 'lernhub:progress:v1';
export interface StoragePort { getItem(key: string): string | null; setItem(key: string, value: string): void }
export function readProgress(storage: StoragePort): { progress: LearningProgress; warning: string | null } {
  try {
    const value = storage.getItem(STORAGE_KEY);
    if (!value) return { progress: emptyProgress(), warning: null };
    const result = LearningProgressSchema.safeParse(JSON.parse(value));
    if (!result.success) return { progress: emptyProgress(), warning: 'Gespeicherte Lerndaten sind beschädigt oder inkompatibel. Neue Ergebnisse werden erst nach dem Zurücksetzen gespeichert.' };
    return { progress: result.data, warning: null };
  } catch { return { progress: emptyProgress(), warning: 'Lokale Lerndaten können nicht gelesen werden. Du kannst ohne Speicherung weiterlernen.' }; }
}
export function writeProgress(storage: StoragePort, progress: LearningProgress): boolean {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(LearningProgressSchema.parse(progress))); return true; } catch { return false; }
}
