import { CalendarDays, FileText } from 'lucide-react';
import { classroom, upcomingEvents } from './config';
import { subjectName } from '../../data/catalog';
export function ClassEvents({ limit }: { limit?: number }) {
  const events = upcomingEvents(classroom.events).slice(0, limit);
  if (!events.length) return <div className="events-empty"><CalendarDays size={30}/><h3>Keine anstehenden Termine</h3><p>Klassenarbeiten, Abgaben und Präsentationen erscheinen hier, sobald sie eingetragen sind.</p></div>;
  return <div className="event-list">{events.map(e => <article className="event-item" key={e.id}><span className="event-icon"><FileText size={23}/></span><div><h3>{e.title}</h3><p><time dateTime={e.date}>{new Intl.DateTimeFormat('de-DE', {weekday:'short', day:'numeric', month:'short', timeZone:'UTC'}).format(new Date(`${e.date}T12:00:00Z`))}</time>{e.subjectId && ` · ${subjectName(e.subjectId)}`}</p>{e.description && <p>{e.description}</p>}</div><span className="badge">{e.kind}</span></article>)}</div>;
}
