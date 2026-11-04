import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, BookOpen, Clock3, Printer, Search } from 'lucide-react';
import { catalog, subjectName } from '../../data/catalog';
import { classroom } from '../classroom/config';
import { EmptyState, PageHeading } from '../../components/ui';
import { MaterialSources } from '../../components/MaterialSources';
import { readingMinutes, sheetSearchText, sheetSources, studySheets } from './data';

export function StudySheetList({ subjectId, learningFieldId, embedded = false }: { subjectId?: string; learningFieldId?: string; embedded?: boolean }) {
  const [subject, setSubject] = useState(subjectId ?? 'alle');
  const [query, setQuery] = useState('');
  const term = query.trim().toLocaleLowerCase('de');
  const subjects = catalog.subjects.filter(s => ['bk1', 'bk2'].includes(s.id) && (!subjectId || s.id === subjectId) && (subject === 'alle' || s.id === subject));
  const fields = catalog.learningFields.filter(f => subjects.some(s => s.id === f.subjectId) && (!learningFieldId || f.id === learningFieldId));
  const matches = fields.filter(field => {
    const sheet = studySheets.find(s => s.learningFieldId === field.id);
    return !term || `${subjectName(field.subjectId)} LF ${field.number} ${sheet ? sheetSearchText(sheet) : 'Noch keine Unterlagen'}`.toLocaleLowerCase('de').includes(term);
  });
  return <>
    {!embedded && <PageHeading eyebrow={classroom.name} title="Lernzettel" description="Die wichtigsten Begriffe und Zusammenhänge aus euren Unterrichtsunterlagen – mit Beispielen, Quellen und Kontrollfragen."/>}
    {!embedded && <div className="sheet-filters glass"><div className="segmented" aria-label="Fach filtern">{['alle', 'bk1', 'bk2'].map(id => <button key={id} aria-pressed={subject === id} className={subject === id ? 'active' : ''} onClick={() => setSubject(id)}>{id === 'alle' ? 'Alle' : id.toUpperCase()}</button>)}</div><label className="sheet-search"><Search size={18}/><input aria-label="Lernzettel durchsuchen" placeholder="Thema oder Begriff suchen …" value={query} onChange={e => setQuery(e.target.value)}/></label></div>}
    {matches.length === 0 ? <EmptyState title="Keine Lernzettel gefunden">Versuche einen anderen Begriff oder wähle ein anderes Fach.</EmptyState> : subjects.map(s => {
      const group = matches.filter(f => f.subjectId === s.id).sort((a, b) => a.number - b.number);
      if (!group.length) return null;
      const ready = group.filter(f => studySheets.some(sheet => sheet.learningFieldId === f.id));
      const pending = group.filter(f => !studySheets.some(sheet => sheet.learningFieldId === f.id));
      return <section key={s.id} className="sheet-group" aria-label={`${s.title} Lernzettel`}>
        {!learningFieldId && <div className="section-heading"><h2>{s.title} <span className="muted">· {s.subtitle}</span></h2><span className="muted">{group.filter(f => studySheets.some(sheet => sheet.learningFieldId === f.id)).length} verfügbar</span></div>}
        <div className="sheet-grid">{ready.map(field => {
          const sheet = studySheets.find(item => item.learningFieldId === field.id);
          return <Link className={`sheet-card glass ${s.color}`} key={field.id} to={`/lernzettel/${sheet!.id}`}><div className="sheet-card-top"><span className="sheet-lf">{s.title} · LF {field.number}</span><ArrowUpRight size={19}/></div><h3>{sheet!.title}</h3><p>{sheet!.description}</p><div className="sheet-card-meta"><span><BookOpen size={15}/>{sheet!.sections.length} Abschnitte</span><span><Clock3 size={15}/>{readingMinutes(sheet!)} Min.</span></div></Link>;
        })}</div>
        {pending.length > 0 && <details className="sheet-pending-fields" open={learningFieldId ? true : undefined}><summary>{learningFieldId ? 'Noch keine Unterlagen für dieses Lernfeld' : `${pending.length} weitere Lernfelder ohne Unterlagen`}</summary><div className="sheet-pending-grid">{pending.map(field => <div key={field.id}><strong>{s.title} · LF {field.number}</strong><span>Noch keine Unterrichtsmaterialien hinterlegt.</span></div>)}</div></details>}
      </section>;
    })}
  </>;
}

export function StudySheetPage() {
  const { id } = useParams();
  const sheet = studySheets.find(s => s.id === id);
  if (!sheet) return <EmptyState title="Lernzettel nicht gefunden"><Link className="text-link" to="/lernzettel">Alle Lernzettel</Link></EmptyState>;
  const field = catalog.learningFields.find(f => f.id === sheet.learningFieldId)!;
  const quiz = catalog.quizzes.find(q => q.learningFieldId === sheet.learningFieldId && !q.example);
  const cards = catalog.flashcardSets.find(s => s.learningFieldId === sheet.learningFieldId && !s.example);
  return <div className="study-sheet-page">
    <div className="sheet-toolbar"><Link className="back-link" to="/lernzettel"><ArrowLeft size={16}/>Alle Lernzettel</Link><button className="button secondary" onClick={() => window.print()}><Printer size={17}/>Drucken / als PDF speichern</button></div>
    <article className="study-sheet">
      <header className="sheet-heading"><p className="eyebrow">{classroom.name} · {subjectName(sheet.subjectId)} · LF {field.number}</p><h1>{sheet.title}</h1><p className="muted">{sheet.description}</p><div className="sheet-meta"><span><Clock3 size={15}/>{readingMinutes(sheet)} Min. Lesezeit</span><span>{sheet.sections.length} Abschnitte</span><span>Stand: {new Date(`${sheet.updatedAt}T12:00:00`).toLocaleDateString('de-DE')}</span></div><p className="sheet-editorial">Für eure Klasse zusammengefasst · Grundlage sind die verlinkten Unterrichtsunterlagen.</p></header>
      <nav className="sheet-contents glass" aria-label="Abschnitte im Lernzettel"><h2>Inhalt</h2>{sheet.sections.map(section => <button key={section.id} onClick={() => { const heading = document.getElementById(`sheet-${section.id}`); heading?.focus({ preventScroll: true }); heading?.scrollIntoView({ behavior: 'auto', block: 'start' }); }}>{section.title}<ArrowUpRight size={15}/></button>)}</nav>
      {sheet.sections.map(section => <section key={section.id} className="sheet-section glass"><h2 tabIndex={-1} id={`sheet-${section.id}`}>{section.title}</h2>{section.intro && <p>{section.intro}</p>}{section.terms && <dl className="sheet-terms">{section.terms.map(item => <div key={item.term}><dt>{item.term}</dt><dd>{item.definition}</dd></div>)}</dl>}{section.table && <div className="sheet-table-wrap" role="region" tabIndex={0} aria-label={`Tabelle: ${section.title}`}><table><caption className="sr-only">{section.title}</caption><thead><tr>{section.table.headers.map(header => <th scope="col" key={header}>{header}</th>)}</tr></thead><tbody>{section.table.rows.map((row, i) => <tr key={i}>{row.map((cell, index) => index === 0 ? <th scope="row" key={index}>{cell}</th> : <td key={index}>{cell}</td>)}</tr>)}</tbody></table></div>}{section.points && <ul className="sheet-points">{section.points.map(point => <li key={point}>{point}</li>)}</ul>}<p className="sheet-takeaway"><strong>Merken</strong>{section.takeaway}</p><MaterialSources ids={section.materialIds} title="Unterrichtsquellen zu diesem Abschnitt"/></section>)}
      <section className="sheet-section sheet-case glass"><p className="eyebrow">Anwendung · eigenes Übungsbeispiel</p><h2>Vom Begriff zur Situation</h2><p>{sheet.caseStudy.scenario}</p><h3>Einordnen</h3><p>{sheet.caseStudy.analysis}</p><h3>Begründet handeln</h3><p>{sheet.caseStudy.action}</p></section>
      <section className="sheet-section glass sheet-review"><h2>Kontrollfragen</h2><p className="muted">Erst selbst beantworten, dann die Lösung öffnen.</p>{sheet.review.map((item, index) => <details key={item.question}><summary>{index + 1}. {item.question}</summary><p>{item.answer}</p></details>)}<dl className="sheet-print-review">{sheet.review.map(item => <div key={item.question}><dt>{item.question}</dt><dd>{item.answer}</dd></div>)}</dl></section>
      <section className="sheet-section sheet-all-sources glass"><h2>Grundlagen dieses Lernzettels</h2><ul>{sheetSources(sheet).map(source => <li key={source}><Link className="text-link" to={`/materialien/${source}`}>{catalog.materials.find(m => m.id === source)!.title}</Link></li>)}</ul></section>
    </article>
    <div className="sheet-next glass"><div><h2>Weiterüben</h2><p className="muted">Passende Aufgaben zu {subjectName(sheet.subjectId)} · LF {field.number}</p></div><div className="button-row">{quiz && <Link className="button primary" to={`/quizze/${quiz.id}`}>Zum Quiz<ArrowUpRight size={16}/></Link>}{cards && <Link className="button secondary" to={`/karteikarten/${cards.id}`}>Karteikarten</Link>}<Link className="button secondary" to={`/faecher/${sheet.subjectId}/lernfelder/${field.id}`}>Unterrichtsmaterialien</Link></div></div>
  </div>;
}
