import { useI18n } from "../i18n/context";
import { ArrowUpRight, ChevronRight, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { Subject } from '../types/content';
import { catalog } from '../data/catalog';
import { SubjectIcon } from './SubjectIcon';
export function PageHeading({ eyebrow, title, description, children }: {
    eyebrow?: string;
    title: string;
    description: string;
    children?: ReactNode;
}) {
    const { tr } = useI18n();
    return <div className="page-heading"><div>{eyebrow && <p className="eyebrow">{tr(eyebrow)}</p>}<h1>{tr(title)}</h1><p className="muted">{tr(description)}</p></div>{children}</div>;
}
export function EmptyState({ title = 'Keine Inhalte gefunden', children }: {
    title?: string;
    children?: ReactNode;
}) {
    const { tr } = useI18n();
    return <div className="empty-state"><SearchX size={28}/><h3>{tr(title)}</h3><p>{children ?? tr('Passe den Suchbegriff oder die Filter an.')}</p></div>;
}
export function SectionHeading({ title, note, to, link = 'Alle ansehen' }: {
    title: string;
    note?: string;
    to?: string;
    link?: string;
}) {
    const { tr } = useI18n();
    return <div className="section-heading"><div><h2>{tr(title)}</h2>{note && <p className="muted">{tr(note)}</p>}</div>{to && <Link className="text-link" to={to}>{tr(link)}<ArrowUpRight size={16}/></Link>}</div>;
}
export function SubjectCard({ subject, featured = false }: {
    subject: Subject;
    featured?: boolean;
}) {
    const { tr, count: countText } = useI18n();
    const count = catalog.materials.filter(m => m.subjectId === subject.id).length;
    const fields = catalog.learningFields.filter(f => f.subjectId === subject.id).sort((a, b) => a.number - b.number);
    if (featured)
        return <article className={`subject-card featured ${subject.color}`}>
    <Link to={`/faecher/${subject.id}`} className="subject-header" aria-label={tr("{0} \u00F6ffnen", [tr(subject.title)])}><span className="subject-symbol"><SubjectIcon subjectId={subject.id} size={36}/></span><div><h2>{tr(subject.title)}</h2><p>{tr(subject.subtitle)}</p></div><span className="subject-open"><ChevronRight size={21}/></span></Link>
    <nav className="subject-fields" aria-label={tr("{0} Lernfelder", [tr(subject.title)])}>{fields.map(f => <Link key={f.id} to={`/faecher/${subject.id}/lernfelder/${f.id}`} aria-label={tr("{0} \u00B7 {1}", [tr(subject.title), tr(f.title)])}>LF {f.number}</Link>)}</nav>
  </article>;
    return <Link to={`/faecher/${subject.id}`} className={`subject-card compact ${subject.color}`}><SubjectIcon subjectId={subject.id} size={31}/><h3>{tr(subject.title)}</h3><div className="subject-meta"><span>{countText(count, 'materials')}</span><ChevronRight size={18}/></div></Link>;
}
export function ExampleBadge() { const { tr } = useI18n(); return <span className="badge example">{tr("Beispielinhalt")}</span>; }
