import { ACTIVITY_KEY } from '../src/features/activity/storage';
import { describe, expect, it } from 'vitest';
import { CONSENT_KEY, grantProgressStorage, readConsentedProgress, revokeProgressStorage, type PrivacyStoragePort } from '../src/utils/privacyStorage';
import { STORAGE_KEY } from '../src/utils/storage';
import { emptyProgress } from '../src/types/progress';
function memory(): PrivacyStoragePort {
  const data = new Map<string,string>();
  return { getItem: k => data.get(k) ?? null, setItem: (k,v) => { data.set(k,v); }, removeItem: k => { data.delete(k); } };
}
describe('Freiwillige Fortschrittsspeicherung', () => {
  it('liest ohne Einwilligung auch vorhandene Lerndaten nicht und schreibt nichts', () => {
    const reads: string[] = [];
    const storage: PrivacyStoragePort = {
      getItem: key => { reads.push(key); if (key === STORAGE_KEY) throw new Error('Lerndaten dürfen nicht gelesen werden'); return null; },
      setItem: () => { throw new Error('Kein Schreiben erlaubt'); }, removeItem: () => { throw new Error('Keine automatische Löschung'); },
    };
    expect(readConsentedProgress(storage)).toEqual({ progress: emptyProgress(), warning: null, persistenceEnabled: false });
    expect(reads).toEqual([CONSENT_KEY]);
  });
  it('lädt Fortschritte erst nach ausdrücklicher Aktivierung und merkt Textversion und Zeitpunkt', () => {
    const storage = memory(); storage.setItem(STORAGE_KEY, JSON.stringify(emptyProgress()));
    expect(grantProgressStorage(storage)).toBe(true);
    expect(JSON.parse(storage.getItem(CONSENT_KEY)!)).toMatchObject({ version: 1, grantedAt: expect.any(String), activity: { version: 1, grantedAt: expect.any(String) } });
    expect(readConsentedProgress(storage).persistenceEnabled).toBe(true);
  });
  it.each(['{}', 'null', '{kaputt', '{"version":1,"grantedAt":"ungültig"}', '{"version":2,"grantedAt":"2026-11-05T00:00:00Z"}'])('wertet ungültige Zustimmungen nicht als Freigabe: %s', record => {
    const storage = memory(); storage.setItem(CONSENT_KEY, record);
    expect(readConsentedProgress(storage).persistenceEnabled).toBe(false);
  });
  it('entfernt beim Widerruf sowohl Einwilligung als auch Verlauf', () => {
    const storage = memory(); grantProgressStorage(storage); storage.setItem(STORAGE_KEY, '{}'); storage.setItem(ACTIVITY_KEY, '{}');
    expect(revokeProgressStorage(storage)).toBe(true);
    expect(storage.getItem(ACTIVITY_KEY)).toBeNull(); expect(storage.getItem(CONSENT_KEY)).toBeNull(); expect(storage.getItem(STORAGE_KEY)).toBeNull();
    expect(readConsentedProgress(storage).persistenceEnabled).toBe(false);
  });
  it('meldet gesperrten Speicher und versucht bei Löschfehlern trotzdem beide Schlüssel', () => {
    const removed: string[] = [];
    const storage: PrivacyStoragePort = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); }, removeItem: key => { removed.push(key); throw new Error('blocked'); } };
    expect(readConsentedProgress(storage).persistenceEnabled).toBe(false);
    expect(grantProgressStorage(storage)).toBe(false);
    expect(revokeProgressStorage(storage)).toBe(false); expect(removed).toEqual([CONSENT_KEY, STORAGE_KEY, ACTIVITY_KEY]);
  });
});
