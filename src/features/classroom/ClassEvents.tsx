import { useI18n } from "../../i18n/context";
import { Link } from 'react-router-dom';
import { CalendarDays, FileText, ArrowUpRight } from 'lucide-react';
import { classroom, upcomingEvents } from './config';
import { subjectName } from '../../data/catalog';
export function ClassEvents({ limit }: {
    limit?: number;
}) {
    const { tr, locale } = useI18n();
    const events = upcomingEvents(classroom.events).slice(0, limit);
    if (!events.length)
        return <div className="events-empty"><CalendarDays size={30}/><h3>{tr("Keine anstehenden Termine")}</h3><p>{tr("Klassenarbeiten, Abgaben und Pr\u00E4sentationen erscheinen hier, sobald sie eingetragen sind.")}</p></div>;
    return <div className="event-list">{events.map(e => {
        const content = <><span className="event-icon"><FileText size={23} aria-hidden="true"/></span><div><h3>{tr(e.title)}</h3><p><time dateTime={e.date}>{new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${e.date}T12:00:00Z`))}</time>{e.subjectId && ` · ${tr(subjectName(e.subjectId))}`}</p>{e.description && <p>{tr(e.description)}</p>}{e.subjectId && <span className="event-study-link">{tr(e.studySheetId ? 'Zum Lernzettel' : 'Termin ansehen')} <ArrowUpRight size={15} aria-hidden="true"/></span>}</div><span className="badge">{tr(e.kind)}</span></>;
        return e.subjectId ? <Link className="event-item event-item-linked" to={e.studySheetId ? `/lernzettel/${e.studySheetId}${e.topicId ? `/${e.topicId}` : ''}` : `/termine/${e.id}`}  key={e.id}>{content}</Link> : <article className="event-item" key={e.id}>{content}</article>;
    })}</div>;
}
