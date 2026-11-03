import { z } from 'zod';
import raw from '../../data/classroom.json';
import { catalog } from '../../data/catalog';
const EventSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(1),
  date: z.iso.date(),
  kind: z.enum(['Klassenarbeit', 'Abgabe', 'Präsentation', 'Termin']),
  subjectId: z.string().optional(),
  description: z.string().optional(),
});
const ClassroomSchema = z.object({
  name: z.string().trim().min(1), program: z.string().trim().min(1),
  school: z.string(), description: z.string().trim().min(1), events: z.array(EventSchema),
});
export type ClassEvent = z.infer<typeof EventSchema>;
export function validateClassroom(value: unknown, subjectIds: string[]) {
  const result = ClassroomSchema.parse(value);
  if (new Set(result.events.map(e => e.id)).size !== result.events.length) throw new Error('Doppelte Termin-ID');
  for (const event of result.events) if (event.subjectId && !subjectIds.includes(event.subjectId)) throw new Error('Unbekanntes Fach im Termin');
  return result;
}
export const classroom = validateClassroom(raw, catalog.subjects.map(s => s.id));
export function classDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = (type: string) => parts.find(p => p.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function upcomingEvents(events: ClassEvent[], today = classDate()) {
  return events.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title, 'de'));
}
