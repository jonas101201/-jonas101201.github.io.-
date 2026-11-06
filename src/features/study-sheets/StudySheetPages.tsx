import { translateTree } from '../../i18n/translate';
import { useI18n } from "../../i18n/context";
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, BookOpen, Clock3, Printer, Search } from 'lucide-react';
import { catalog, subjectName } from '../../data/catalog';
import { classroom } from '../classroom/config';
import { EmptyState, PageHeading } from '../../components/ui';
import { MaterialSources } from '../../components/MaterialSources';
import { readingMinutes, sheetSearchText, sheetSources, studySheets } from './data';
export function StudySheetList({ subjectId, learningFieldId, embedded = false }: {
    subjectId?: string;
    learningFieldId?: string;
    embedded?: boolean;
}) {
    const { tr, language, count } = useI18n();
    const [subject, setSubject] = useState(subjectId ?? 'alle');
    const [query, setQuery] = useState('');
    const term = query.trim().toLocaleLowerCase('de');
    const subjects = catalog.subjects.filter(s => ['bk1', 'bk2'].includes(s.id) && (!subjectId || s.id === subjectId) && (subject === 'alle' || s.id === subject));
    const fields = catalog.learningFields.filter(f => subjects.some(s => s.id === f.subjectId) && (!learningFieldId || f.id === learningFieldId));
    const matches = fields.filter(field => {
        const sheet = studySheets.find(s => s.learningFieldId === field.id);
        return !term || `${tr(subjectName(field.subjectId))} LF ${field.number} ${sheet ? `${sheetSearchText(sheet)} ${sheetSearchText(translateTree(sheet, language))}` : 'Noch keine Unterlagen'}`.toLocaleLowerCase('de').includes(term);
    });
    return <>
    {!embedded && <PageHeading eyebrow={classroom.name} title={tr("Lernzettel")} description={tr("Die wichtigsten Begriffe und Zusammenhänge aus euren Unterrichtsunterlagen – mit Beispielen, Quellen und Kontrollfragen.")}/>}
    {!embedded && <div className="sheet-filters glass"><div className="segmented" aria-label={tr("Fach filtern")}>{['alle', 'bk1', 'bk2'].map(id => <button key={id} aria-pressed={subject === id} className={subject === id ? 'active' : ''} onClick={() => setSubject(id)}>{id === 'alle' ? tr('Alle') : id.toUpperCase()}</button>)}</div><label className="sheet-search"><Search size={18}/><input aria-label={tr("Lernzettel durchsuchen")} placeholder={tr("Thema oder Begriff suchen …")} value={query} onChange={e => setQuery(e.target.value)}/></label></div>}
    {matches.length === 0 ? <EmptyState title={tr("Keine Lernzettel gefunden")}>{tr("Versuche einen anderen Begriff oder w\u00E4hle ein anderes Fach.")}</EmptyState> : subjects.map(s => {
            const group = matches.filter(f => f.subjectId === s.id).sort((a, b) => a.number - b.number);
            if (!group.length)
                return null;
            const ready = group.filter(f => studySheets.some(sheet => sheet.learningFieldId === f.id));
            const pending = group.filter(f => !studySheets.some(sheet => sheet.learningFieldId === f.id));
            return <section key={s.id} className="sheet-group" aria-label={tr("{0} Lernzettel", [tr(s.title)])}>
        {!learningFieldId && <div className="section-heading"><h2>{tr(s.title)} <span className="muted">· {tr(s.subtitle)}</span></h2><span className="muted">{group.filter(f => studySheets.some(sheet => sheet.learningFieldId === f.id)).length}{tr(" verf\u00FCgbar")}</span></div>}
        <div className="sheet-grid">{ready.map(field => {
                    const sheet = studySheets.find(item => item.learningFieldId === field.id);
                    return <Link className={`sheet-card glass ${s.color}`} key={field.id} to={`/lernzettel/${sheet!.id}`}><div className="sheet-card-top"><span className="sheet-lf">{tr(s.title)}{tr(" \u00B7 LF ")}{field.number}</span><ArrowUpRight size={19}/></div><h3>{tr(sheet!.title)}</h3><p>{tr(sheet!.description)}</p><div className="sheet-card-meta"><span><BookOpen size={15}/>{count(sheet!.sections.length, 'sections')}</span><span><Clock3 size={15}/>{readingMinutes(sheet!)}{tr(" Min.")}</span></div></Link>;
                })}</div>
        {pending.length > 0 && <details className="sheet-pending-fields" open={learningFieldId ? true : undefined}><summary>{learningFieldId ? tr('Noch keine Unterlagen für dieses Lernfeld') : tr('Weitere Lernfelder ohne Unterlagen: {0}', [count(pending.length, 'fields')])}</summary><div className="sheet-pending-grid">{pending.map(field => <div key={field.id}><strong>{tr(s.title)}{tr(" \u00B7 LF ")}{field.number}</strong><span>{tr("Noch keine Unterrichtsmaterialien hinterlegt.")}</span></div>)}</div></details>}
      </section>;
        })}
  </>;
}
export function StudySheetPage() {
    const { tr, locale, count } = useI18n();
    const { id } = useParams();
    const sheet = studySheets.find(s => s.id === id);
    if (!sheet)
        return <EmptyState title={tr("Lernzettel nicht gefunden")}><Link className="text-link" to="/lernzettel">{tr("Alle Lernzettel")}</Link></EmptyState>;
    const field = catalog.learningFields.find(f => f.id === sheet.learningFieldId)!;
    const quiz = catalog.quizzes.find(q => q.learningFieldId === sheet.learningFieldId && !q.example);
    const cards = catalog.flashcardSets.find(s => s.learningFieldId === sheet.learningFieldId && !s.example);
    return <div className="study-sheet-page">
    <div className="sheet-toolbar"><Link className="back-link" to="/lernzettel"><ArrowLeft size={16}/>{tr("Alle Lernzettel")}</Link><button className="button secondary" onClick={() => window.print()}><Printer size={17}/>{tr("Drucken / als PDF speichern")}</button></div>
    <article className="study-sheet">
      <header className="sheet-heading"><p className="eyebrow">{classroom.name} · {tr(subjectName(sheet.subjectId))}{tr(" \u00B7 LF ")}{field.number}</p><h1>{tr(sheet.title)}</h1><p className="muted">{tr(sheet.description)}</p><div className="sheet-meta"><span><Clock3 size={15}/>{readingMinutes(sheet)}{tr(" Min. Lesezeit")}</span><span>{count(sheet.sections.length, 'sections')}</span><span>{tr("Stand: ")}{new Date(`${sheet.updatedAt}T12:00:00`).toLocaleDateString(locale)}</span></div><p className="sheet-editorial">{tr("F\u00FCr eure Klasse zusammengefasst \u00B7 Grundlage sind die verlinkten Unterrichtsunterlagen.")}</p></header>
      <nav className="sheet-contents glass" aria-label={tr("Abschnitte im Lernzettel")}><h2>{tr("Inhalt")}</h2>{sheet.sections.map(section => <button key={section.id} onClick={() => { const heading = document.getElementById(`sheet-${section.id}`); heading?.focus({ preventScroll: true }); heading?.scrollIntoView({ behavior: 'auto', block: 'start' }); }}>{tr(section.title)}<ArrowUpRight size={15}/></button>)}</nav>
      {sheet.sections.map(section => <section key={section.id} className="sheet-section glass"><h2 tabIndex={-1} id={`sheet-${section.id}`}>{tr(section.title)}</h2>{section.intro && <p>{tr(section.intro)}</p>}{section.terms && <dl className="sheet-terms">{section.terms.map(item => <div key={item.term}><dt>{tr(item.term)}</dt><dd>{tr(item.definition)}</dd></div>)}</dl>}{section.table && <div className="sheet-table-wrap" role="region" tabIndex={0} aria-label={tr("Tabelle: {0}", [tr(section.title)])}><table><caption className="sr-only">{tr(section.title)}</caption><thead><tr>{section.table.headers.map(header => <th scope="col" key={header}>{tr(header)}</th>)}</tr></thead><tbody>{section.table.rows.map((row, i) => <tr key={i}>{row.map((cell, index) => index === 0 ? <th scope="row" key={index}>{tr(cell)}</th> : <td key={index}>{tr(cell)}</td>)}</tr>)}</tbody></table></div>}{section.points && <ul className="sheet-points">{section.points.map(point => <li key={point}>{tr(point)}</li>)}</ul>}<p className="sheet-takeaway"><strong>{tr("Merken")}</strong>{tr(section.takeaway)}</p><MaterialSources ids={section.materialIds} title={tr("Unterrichtsquellen zu diesem Abschnitt")}/></section>)}
      <section className="sheet-section sheet-case glass"><p className="eyebrow">{tr("Anwendung \u00B7 eigenes \u00DCbungsbeispiel")}</p><h2>{tr("Vom Begriff zur Situation")}</h2><p>{tr(sheet.caseStudy.scenario)}</p><h3>{tr("Einordnen")}</h3><p>{tr(sheet.caseStudy.analysis)}</p><h3>{tr("Begr\u00FCndet handeln")}</h3><p>{tr(sheet.caseStudy.action)}</p></section>
      <section className="sheet-section glass sheet-review"><h2>{tr("Kontrollfragen")}</h2><p className="muted">{tr("Erst selbst beantworten, dann die L\u00F6sung \u00F6ffnen.")}</p>{sheet.review.map((item, index) => <details key={item.question}><summary>{index + 1}. {tr(item.question)}</summary><p>{tr(item.answer)}</p></details>)}<dl className="sheet-print-review">{sheet.review.map(item => <div key={item.question}><dt>{tr(item.question)}</dt><dd>{tr(item.answer)}</dd></div>)}</dl></section>
      <section className="sheet-section sheet-all-sources glass"><h2>{tr("Grundlagen dieses Lernzettels")}</h2><ul>{sheetSources(sheet).map(source => <li key={source}><Link className="text-link" to={`/materialien/${source}`}>{tr(catalog.materials.find(m => m.id === source)!.title)}</Link></li>)}</ul></section>
    </article>
    <div className="sheet-next glass"><div><h2>{tr("Weiter\u00FCben")}</h2><p className="muted">{tr("Passende Aufgaben zu ")}{tr(subjectName(sheet.subjectId))}{tr(" \u00B7 LF ")}{field.number}</p></div><div className="button-row">{quiz && <Link className="button primary" to={`/quizze/${quiz.id}`}>{tr("Zum Quiz")}<ArrowUpRight size={16}/></Link>}{cards && <Link className="button secondary" to={`/karteikarten/${cards.id}`}>{tr("Karteikarten")}</Link>}<Link className="button secondary" to={`/faecher/${sheet.subjectId}/lernfelder/${field.id}`}>{tr("Unterrichtsmaterialien")}</Link></div></div>
  </div>;
}
