import { ACTIVITY_KEY } from '../features/activity/storage';
import { emptyProgress } from '../types/progress';
import { readProgress, STORAGE_KEY, type StoragePort } from './storage';

export const CONSENT_KEY = 'lernhub:progress-consent:v1';
export interface PrivacyStoragePort extends StoragePort { removeItem(key: string): void }
export function readConsentedProgress(storage: PrivacyStoragePort) {
  try {
    const consent = storage.getItem(CONSENT_KEY);
    if (!consent) return { progress: emptyProgress(), warning: null, persistenceEnabled: false };
    const record: unknown = JSON.parse(consent);
    if (typeof record !== 'object' || record === null || !('version' in record) || record.version !== 1 || !('grantedAt' in record) || typeof record.grantedAt !== 'string' || !Number.isFinite(Date.parse(record.grantedAt))) {
      return { progress: emptyProgress(), warning: null, persistenceEnabled: false };
    }
    return { ...readProgress(storage), persistenceEnabled: true };
  } catch {
    return { progress: emptyProgress(), warning: 'Lokaler Speicher ist nicht verfügbar. Du kannst ohne dauerhafte Speicherung weiterlernen.', persistenceEnabled: false };
  }
}
export function grantProgressStorage(storage: PrivacyStoragePort): boolean {
  try { const grantedAt = new Date().toISOString(); storage.setItem(CONSENT_KEY, JSON.stringify({ version: 1, grantedAt, activity: { version: 1, grantedAt } })); return true; }
  catch { return false; }
}
export function revokeProgressStorage(storage: PrivacyStoragePort): boolean {
  let success = true;
  // Attempt all removals, even if one fails.
  for (const key of [CONSENT_KEY, STORAGE_KEY, ACTIVITY_KEY]) {
    try { storage.removeItem(key); } catch { success = false; }
  }
  return success;
}

/** Old consent continues to cover progress, never newly introduced visit history. */
export function hasActivityConsent(storage: PrivacyStoragePort): boolean {
  try {
    const record = JSON.parse(storage.getItem(CONSENT_KEY) ?? 'null');
    return record?.version === 1 && typeof record.grantedAt === 'string' && Number.isFinite(Date.parse(record.grantedAt)) && record.activity?.version === 1 && typeof record.activity.grantedAt === 'string' && Number.isFinite(Date.parse(record.activity.grantedAt));
  } catch { return false; }
}
