import { BookOpen, CalendarDays } from 'lucide-react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { ContextBackLink } from '../components/ContextLinks';
import { EmptyState, PageHeading } from '../components/ui';
import { ClassEvents } from '../features/classroom/ClassEvents';
import { classroom } from '../features/classroom/config';
import { useI18n } from '../i18n/context';

export function DatesPage() {
  const { tr } = useI18n();
  return <div className="dates-page"><PageHeading eyebrow={tr('Deine Klasse')} title={tr('Termine')} description={tr('GLN und Klassenarbeiten deiner Klasse auf einen Blick.')}/><section className="glass dashboard-panel" aria-label={tr('Anstehende Termine')}><div className="panel-heading"><h2><CalendarDays size={22} aria-hidden="true"/>{tr('Anstehende Termine')}</h2></div><ClassEvents/></section></div>;
}

export function DateDetailPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const { tr, locale } = useI18n();
  const event = classroom.events.find(event => event.id === id);
  if (!event) return <EmptyState title={tr('Termin nicht gefunden')}><Link to="/termine">{tr('Alle Termine')}</Link></EmptyState>;
  if (event.studySheetId) return <Navigate replace state={state} to={`/lernzettel/${event.studySheetId}${event.topicId ? `/${event.topicId}` : ''}`}/>;
  return <div className="dates-page"><PageHeading eyebrow={tr(event.kind)} title={tr(event.title)} description={new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${event.date}T12:00:00Z`))}/><section className="glass dashboard-panel"><BookOpen size={27} aria-hidden="true"/><h2>{tr('Lernzettel folgt')}</h2><p className="muted">{tr('Für diesen Termin ist noch kein Lernzettel hinterlegt. Sobald er ergänzt ist, führt der Termin direkt dorthin.')}</p><ContextBackLink className="text-link" to="/termine" originLabel={tr('Zurück zur vorherigen Übersicht')}>{tr('Alle Termine')}</ContextBackLink></section></div>;
}
