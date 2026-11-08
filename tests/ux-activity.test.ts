import { describe, expect, it } from 'vitest';
import { ACTIVITY_KEY, addActivity, readActivity, writeActivity } from '../src/features/activity/storage';
import { CONSENT_KEY, hasActivityConsent, readConsentedProgress, grantProgressStorage } from '../src/utils/privacyStorage';
const time = '2026-11-08T12:00:00.000Z';
function memory() { const data = new Map<string, string>(); return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => { data.set(k, v); }, removeItem: (k: string) => { data.delete(k); } }; }
describe('Bounded, versioned local activity', () => {
  it('does not access storage without consent', () => {
    expect(readActivity({ getItem: () => { throw Error('read forbidden'); }, setItem: () => { throw Error('write forbidden'); } }, false).activities).toEqual([]);
  });
  it('keeps the most recent unique 20 entries and stores no titles or queries', () => {
    let entries = [] as ReturnType<typeof addActivity>;
    for (let i = 0; i < 25; i++) entries = addActivity(entries, `/materialien/test-${i}`, time);
    entries = addActivity(entries, '/materialien/test-10', time);
    expect(entries).toHaveLength(20); expect(entries[0]!.to).toBe('/materialien/test-10');
    expect(new Set(entries.map(e => e.to)).size).toBe(20);
    const storage = memory(); expect(writeActivity(storage, entries)).toBe(true);
    expect(readActivity(storage, true).activities).toEqual(entries);
    expect(Object.keys(entries[0]!).sort()).toEqual(['to', 'visitedAt']);
  });
  it.each(['{broken', '{"version":2,"entries":[]}', '{"version":1,"entries":[{"to":"https://evil.test","visitedAt":"2026-11-08T12:00:00.000Z"}]}'])('protects unreadable or newer records until explicit reset: %s', raw => {
    const storage = memory(); storage.setItem(ACTIVITY_KEY, raw);
    expect(readActivity(storage, true)).toMatchObject({ activityWritable: false, activities: [], activityWarning: expect.any(String) });
    expect(storage.getItem(ACTIVITY_KEY)).toBe(raw);
  });
  it('rejects external routes, query strings and invalid timestamps', () => {
    for (const route of ['https://example.com', '//example.com', '/suche?q=private', '/materialien/test?token=secret']) expect(() => addActivity([], route, time)).toThrow();
    expect(() => addActivity([], '/quizze/test', 'invalid')).toThrow();
    expect(writeActivity({ getItem: () => null, setItem: () => { throw Error('quota'); } }, [])).toBe(false);
  });
  it('preserves existing v1 consent for progress and requires upgraded consent for activity', () => {
    const storage = memory(); storage.setItem(CONSENT_KEY, JSON.stringify({ version: 1, grantedAt: time }));
    expect(readConsentedProgress(storage).persistenceEnabled).toBe(true);
    expect(hasActivityConsent(storage)).toBe(false);
    grantProgressStorage(storage); expect(hasActivityConsent(storage)).toBe(true);
  });
});
