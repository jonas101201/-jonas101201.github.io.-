import { useI18n } from "../../i18n/context";
import { CalendarDays, FileText } from 'lucide-react';
import { classroom, upcomingEvents } from './config';
import { subjectName } from '../../data/catalog';
export function ClassEvents({ limit }: {
    limit?: number;
}) {
    const { tr, locale } = useI18n();
    const events = upcomingEvents(classroom.events).slice(0, limit);
    if (!events.length)
        return <div className="events-empty"><CalendarDays size={30}/><h3>{tr("Keine anstehenden Termine")}</h3><p>{tr("Klassenarbeiten, Abgaben und Pr\u00E4sentationen erscheinen hier, sobald sie eingetragen sind.")}</p></div>;
    return <div className="event-list">{events.map(e => <article className="event-item" key={e.id}><span className="event-icon"><FileText size={23}/></span><div><h3>{tr(e.title)}</h3><p><time dateTime={e.date}>{new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${e.date}T12:00:00Z`))}</time>{e.subjectId && ` · ${tr(subjectName(e.subjectId))}`}</p>{e.description && <p>{tr(e.description)}</p>}</div><span className="badge">{tr(e.kind)}</span></article>)}</div>;
}
