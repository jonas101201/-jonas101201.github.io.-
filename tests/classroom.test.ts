import { describe, expect, it } from 'vitest';
import { classDate, upcomingEvents, validateClassroom, type ClassEvent } from '../src/features/classroom/config';
const profile = { name: 'ERZ.1.2', program: 'Erzieherausbildung', school: '', description: 'Materialien für die Klasse.', events: [] };
const event = (id: string, date: string): ClassEvent => ({ id, date, title: id, kind: 'Abgabe', subjectId: 'bk1' });
describe('Klassenkonfiguration und Termine', () => {
  it('akzeptiert eine Klasse ohne erfundene Termine', () => expect(validateClassroom(profile, ['bk1']).events).toEqual([]));
  it('lehnt unbekannte Fächer ab', () => expect(() => validateClassroom({ ...profile, events: [event('a', '2026-11-04')] }, ['bk2'])).toThrow('Unbekanntes Fach'));
  it('lehnt doppelte IDs ab', () => expect(() => validateClassroom({ ...profile, events: [event('a', '2026-11-04'), event('a', '2026-11-05')] }, ['bk1'])).toThrow('Doppelte'));
  it('lehnt ungültige Kalenderdaten ab', () => expect(() => validateClassroom({ ...profile, events: [event('a', '2026-02-31')] }, ['bk1'])).toThrow());
  it('zeigt heutige und zukünftige Termine chronologisch, ohne die Daten zu ändern', () => {
    const events = [event('spaet', '2026-11-10'), event('alt', '2026-11-01'), event('heute', '2026-11-03')];
    expect(upcomingEvents(events, '2026-11-03').map(e => e.id)).toEqual(['heute', 'spaet']);
    expect(events[0]?.id).toBe('spaet');
  });
  it('verwendet das Berliner Kalenderdatum an der Tagesgrenze', () => expect(classDate(new Date('2026-11-03T23:30:00Z'))).toBe('2026-11-04'));
});
