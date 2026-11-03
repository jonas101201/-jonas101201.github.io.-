import { ArrowUpRight, ChevronRight, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { Subject } from '../types/content';
import { catalog } from '../data/catalog';
import { SubjectIcon } from './SubjectIcon';
export function PageHeading({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description: string; children?: ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1><p className="muted">{description}</p></div>{children}</div>;
}
export function EmptyState({ title = 'Keine Inhalte gefunden', children }: { title?: string; children?: ReactNode }) {
  return <div className="empty-state"><SearchX size={28}/><h3>{title}</h3><p>{children ?? 'Passe den Suchbegriff oder die Filter an.'}</p></div>;
}
export function SectionHeading({ title, note, to, link = 'Alle ansehen' }: { title: string; note?: string; to?: string; link?: string }) {
  return <div className="section-heading"><div><h2>{title}</h2>{note && <p className="muted">{note}</p>}</div>{to && <Link className="text-link" to={to}>{link}<ArrowUpRight size={16}/></Link>}</div>;
}
export function SubjectCard({ subject, featured = false }: { subject: Subject; featured?: boolean }) {
  const count = catalog.materials.filter(m => m.subjectId === subject.id).length;
  const fields = catalog.learningFields.filter(f => f.subjectId === subject.id).sort((a,b) => a.number - b.number);
  if (featured) return <article className={`subject-card featured ${subject.color}`}>
    <Link to={`/faecher/${subject.id}`} className="subject-header" aria-label={`${subject.title} öffnen`}><span className="subject-symbol"><SubjectIcon subjectId={subject.id} size={36}/></span><div><h2>{subject.title}</h2><p>{subject.subtitle}</p></div><span className="subject-open"><ChevronRight size={21}/></span></Link>
    <nav className="subject-fields" aria-label={`${subject.title} Lernfelder`}>{fields.map(f => <Link key={f.id} to={`/faecher/${subject.id}/lernfelder/${f.id}`} aria-label={`${subject.title} · ${f.title}`}>LF {f.number}</Link>)}</nav>
  </article>;
  return <Link to={`/faecher/${subject.id}`} className={`subject-card compact ${subject.color}`}><SubjectIcon subjectId={subject.id} size={31}/><h3>{subject.title}</h3><div className="subject-meta"><span>{count} {count === 1 ? 'Material' : 'Materialien'}</span><ChevronRight size={18}/></div></Link>;
}
export function ExampleBadge() { return <span className="badge example">Beispielinhalt</span>; }
