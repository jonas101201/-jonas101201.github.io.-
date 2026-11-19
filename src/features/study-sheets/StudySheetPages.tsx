import { translateTree } from '../../i18n/translate';
import { useI18n } from "../../i18n/context";
import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, BookOpen, Clock3, Printer, Search } from 'lucide-react';
import { catalog, subjectName } from '../../data/catalog';
import { classroom } from '../classroom/config';
import { EmptyState, PageHeading } from '../../components/ui';
import { MaterialSources } from '../../components/MaterialSources';
import { readingMinutes, sheetSearchText, studySheets, topicPath, topicSearchText, type StudyTopic } from './data';
export function StudySheetList({ subjectId, learningFieldId, embedded = false }: {
    subjectId?: string;
    learningFieldId?: string;
    embedded?: boolean;
}) {
    const { tr, language, count } = useI18n();
    const [subject, setSubject] = useState(subjectId ?? 'alle');
    const [query, setQuery] = useState('');
    const term = query.trim().toLocaleLowerCase('de');
    const availableSubjects = catalog.subjects.filter(s => ['bk1', 'bk2'].includes(s.id) || studySheets.some(sheet => sheet.subjectId === s.id));
    const subjects = availableSubjects.filter(s => (!subjectId || s.id === subjectId) && (subject === 'alle' || s.id === subject));
    const fields = catalog.learningFields.filter(f => subjects.some(s => s.id === f.subjectId) && (!learningFieldId || f.id === learningFieldId));
    const scopes = [
        ...fields.map(field => ({ id: field.id, subjectId: field.subjectId, field, sheet: studySheets.find(s => s.learningFieldId === field.id) })),
        ...studySheets.filter(sheet => !sheet.learningFieldId && !learningFieldId && subjects.some(s => s.id === sheet.subjectId)).map(sheet => ({ id: sheet.id, subjectId: sheet.subjectId, field: undefined, sheet })),
    ];
    const matches = scopes.filter(({ subjectId: scopeSubject, field, sheet }) =>
        !term || `${tr(subjectName(scopeSubject))} ${field ? `LF ${field.number}` : ''} ${sheet ? `${sheetSearchText(sheet)} ${sheetSearchText(translateTree(sheet, language))}` : 'Noch keine Unterlagen'}`.toLocaleLowerCase('de').includes(term)
    );
    return <>
    {!embedded && <PageHeading eyebrow={classroom.name} title={tr("Lernzettel")} description={tr("Oberthemen und einzelne Lernzettel zu jedem Unterthema – mit Erklärungen, Vergleichen, Beispielen und Merksätzen.")}/>}
    {!embedded && <div className="sheet-filters glass"><div className="segmented" aria-label={tr("Fach filtern")}>{['alle', ...availableSubjects.map(s => s.id)].map(id => <button key={id} aria-pressed={subject === id} className={subject === id ? 'active' : ''} onClick={() => setSubject(id)}>{id === 'alle' ? tr('Alle') : tr(subjectName(id))}</button>)}</div><label className="sheet-search"><Search size={18}/><input aria-label={tr("Lernzettel durchsuchen")} placeholder={tr("Thema oder Begriff suchen …")} value={query} onChange={e => setQuery(e.target.value)}/></label></div>}
    {matches.length === 0 ? <EmptyState title={tr("Keine Lernzettel gefunden")}>{tr("Versuche einen anderen Begriff oder w\u00E4hle ein anderes Fach.")}</EmptyState> : subjects.map(s => {
            const group = matches.filter(f => f.subjectId === s.id).sort((a, b) => (a.field?.number ?? 0) - (b.field?.number ?? 0));
            if (!group.length)
                return null;
            const ready = group.filter(scope => scope.sheet);
            const pending = group.flatMap(scope => !scope.sheet && scope.field ? [scope.field] : []);
            return <section key={s.id} className="sheet-group" aria-label={tr("{0} Lernzettel", [tr(s.title)])}>
        {!learningFieldId && <div className="section-heading"><h2>{tr(s.title)} <span className="muted">· {tr(s.subtitle)}</span></h2><span className="muted">{group.filter(scope => scope.sheet).length}{tr(" verf\u00FCgbar")}</span></div>}
        <div className="sheet-grid">{ready.map(({ field, sheet }) => {
                    const parentMatch = `${tr(subjectName(sheet!.subjectId))} ${field ? `LF ${field.number}` : ''} ${tr(sheet!.title)} ${sheet!.title}`.toLocaleLowerCase('de').includes(term);
                    const topics = sheet!.sections.filter(topic => !term || parentMatch || `${topicSearchText(topic)} ${topicSearchText(translateTree(topic, language))}`.includes(term));
                    return <article className={`sheet-card glass ${s.color}`} key={sheet!.id}><div className="sheet-card-top"><span className="sheet-lf">{tr(s.title)}{field && <>{tr(" · LF ")}{field.number}</>}</span><BookOpen size={19}/></div><h3><Link to={`/lernzettel/${sheet!.id}`}>{tr(sheet!.title)}</Link></h3><p>{tr(sheet!.description)}</p><ol className="sheet-topic-links">{topics.map(topic => <li key={topic.id}><Link to={topicPath(sheet!, topic)}>{tr(topic.title)}<ArrowUpRight size={14}/></Link></li>)}</ol><div className="sheet-card-meta"><span>{tr("{0} Unterthemen", [sheet!.sections.length])}</span><Link className="text-link" to={`/lernzettel/${sheet!.id}`}>{tr("Themenübersicht öffnen")}</Link></div></article>;
                })}</div>
        {pending.length > 0 && <details className="sheet-pending-fields" open={learningFieldId ? true : undefined}><summary>{learningFieldId ? tr('Noch kein Lernzettel für dieses Lernfeld') : tr('Weitere Lernfelder ohne Lernzettel: {0}', [count(pending.length, 'fields')])}</summary><div className="sheet-pending-grid">{pending.map(field => <div key={field.id}><strong>{tr(s.title)}{tr(" \u00B7 LF ")}{field.number}</strong><span>{catalog.materials.some(m => m.learningFieldId === field.id && !m.example) ? tr("Noch kein Lernzettel erstellt.") : tr("Noch keine Unterrichtsmaterialien hinterlegt.")}</span></div>)}</div></details>}
      </section>;
        })}
  </>;
}
function TopicContent({ topic, collection = false, math = false }: { topic: StudyTopic; collection?: boolean; math?: boolean }) {
    const { tr } = useI18n();
    const Heading = collection ? 'h3' : 'h2';
    return <section className="sheet-topic" aria-label={tr(topic.title)}>
      {collection && <h2 className="sheet-topic-title" id={`sheet-${topic.id}`}>{tr(topic.title)}</h2>}
      <aside className="sheet-core glass" aria-label={tr("Kern des Themas")}><strong>{tr("Kern des Themas")}</strong><p>{tr(topic.takeaway)}</p></aside>
      <section className="sheet-section glass"><Heading>{tr("Begriff und Bedeutung")}</Heading><p>{tr(topic.intro)}</p>
        {topic.terms && <dl className="sheet-terms">{topic.terms.map(item => <div key={item.term}><dt>{tr(item.term)}</dt><dd>{tr(item.definition)}</dd></div>)}</dl>}
      </section>
      {topic.table && <section className="sheet-section glass">
        <Heading>{tr("Vergleich und Übersicht")}</Heading>
        <div className="sheet-table-wrap" role="region" tabIndex={0} aria-label={tr("Tabelle: {0}", [tr(topic.title)])}>
          <table role="table">
            <caption className="sr-only">{tr(topic.title)}</caption>
            <thead role="rowgroup"><tr role="row">{topic.table.headers.map(header => <th role="columnheader" scope="col" key={header}>{tr(header)}</th>)}</tr></thead>
            <tbody role="rowgroup">{topic.table.rows.map((row, i) => <tr role="row" key={i}>
              {row.map((cell, index) => index === 0
                ? <th role="rowheader" scope="row" key={index}>{tr(cell)}</th>
                : <td role="cell" key={index}><span className="sheet-cell-label" aria-hidden="true">{tr(topic.table!.headers[index]!)}</span>{tr(cell)}</td>)}
            </tr>)}</tbody>
          </table>
        </div>
      </section>}
      {topic.points && <section className="sheet-section glass"><Heading>{tr("Zusammenhänge und Einordnung")}</Heading><ul className="sheet-points">{topic.points.map(point => <li key={point}>{tr(point)}</li>)}</ul></section>}
      <section className="sheet-section sheet-case glass"><Heading>{math ? tr("Durchgerechnetes Beispiel") : tr("Praxisbeispiel mit Einordnung")}</Heading><p className="eyebrow">{tr(topic.caseStudy.sourceBased ? "Fallbeispiel aus der Unterlage" : "Eigenes Anwendungsbeispiel")}</p><p>{tr(topic.caseStudy.scenario)}</p><dl className="sheet-terms"><div><dt>{math ? tr("Rechenweg") : tr("Einordnen")}</dt><dd>{tr(topic.caseStudy.analysis)}</dd></div><div><dt>{math ? tr("Ergebnis prüfen") : tr("Begründet handeln")}</dt><dd>{tr(topic.caseStudy.action)}</dd></div></dl></section>
      <section className="sheet-section sheet-at-glance glass"><Heading>{tr("Auf einen Blick")}</Heading><dl className="sheet-terms"><div><dt>{tr("Grundgedanke")}</dt><dd>{tr(topic.takeaway)}</dd></div><div><dt>{math ? tr("Rechenkontrolle") : tr("Praxisbezug")}</dt><dd>{tr(topic.caseStudy.action)}</dd></div></dl><MaterialSources ids={topic.materialIds} title={tr("Grundlagen dieses Lernzettels")}/><div className="sheet-print-sources"><p><strong>{tr("Grundlagen dieses Lernzettels")}</strong></p><ul>{topic.materialIds.map(id => <li key={id}>{tr(catalog.materials.find(m => m.id === id)!.title)}</li>)}</ul></div></section>
    </section>;
}
export function StudySheetPage() {
    const { tr, locale } = useI18n();
    const { id, topicId } = useParams();
    const [params] = useSearchParams();
    const sheet = studySheets.find(s => s.id === id);
    const topic = sheet?.sections.find(s => s.id === topicId);
    if (!sheet || (topicId && !topic))
        return <EmptyState title={tr("Lernzettel nicht gefunden")}><Link className="text-link" to={sheet ? `/lernzettel/${sheet.id}` : '/lernzettel'}>{tr("Zur Themenübersicht")}</Link></EmptyState>;
    const collection = !topic && params.get('ansicht') === 'gesamt';
    const field = catalog.learningFields.find(f => f.id === sheet.learningFieldId);
    const current = topic ? sheet.sections.indexOf(topic) : -1;
    const previous = sheet.sections[current - 1];
    const next = sheet.sections[current + 1];
    return <div className={`study-sheet-page ${collection ? 'sheet-collection' : ''}`}>
      <div className="sheet-toolbar"><Link className="back-link" to={topic || collection ? `/lernzettel/${sheet.id}` : '/lernzettel'}><ArrowLeft size={16}/>{tr(topic || collection ? "Zur Themenübersicht" : "Alle Lernzettel")}</Link>
        {topic || collection ? <button className="button secondary" onClick={() => window.print()}><Printer size={17}/>{tr("Drucken / als PDF speichern")}</button> : <Link className="button secondary" to={`/lernzettel/${sheet.id}?ansicht=gesamt`}><Printer size={17}/>{tr("Alle Unterthemen zusammen öffnen")}</Link>}
      </div>
      <article className="study-sheet">
        <header className="sheet-heading"><p className="eyebrow">{classroom.name} · {tr(subjectName(sheet.subjectId))}{field && <>{tr(" · LF ")}{field.number}</>}</p>{topic && <Link className="text-link sheet-parent-link" to={`/lernzettel/${sheet.id}`}>{tr(sheet.title)}</Link>}<h1 id={topic ? `sheet-${topic.id}` : undefined}>{tr(topic?.title ?? sheet.title)}</h1><p className="muted">{tr(topic ? "Eigenständiger Lernzettel zum Unterthema" : sheet.description)}</p><div className="sheet-meta"><span><Clock3 size={15}/>{readingMinutes(topic ?? sheet)}{tr(" Min. Lesezeit")}</span><span>{tr("Stand: ")}{new Date(`${sheet.updatedAt}T12:00:00`).toLocaleDateString(locale)}</span></div><p className="sheet-editorial">{tr("Für eure Klasse zusammengefasst · Grundlage sind die verlinkten Unterrichtsunterlagen.")}</p></header>
        {!topic && !collection && <nav className="sheet-topic-directory" aria-label={tr("Unterthemen im Überblick")}><h2>{tr("Unterthemen im Überblick")}</h2><p className="muted">{tr("Jedes Unterthema hat einen eigenen Lernzettel mit Erklärung, Beispiel und Zusammenfassung.")}</p><ol>{sheet.sections.map(item => <li key={item.id}><Link className="sheet-topic-card glass" to={topicPath(sheet, item)}><div><h3>{tr(item.title)}</h3><p>{tr(item.intro)}</p><span className="muted">{readingMinutes(item)}{tr(" Min. Lesezeit")}</span></div><ArrowUpRight size={20}/></Link></li>)}</ol></nav>}
        {topic && <TopicContent topic={topic} math={sheet.subjectId === 'mathematik'}/>}
        {collection && sheet.sections.map(item => <TopicContent key={item.id} topic={item} collection math={sheet.subjectId === 'mathematik'}/>)}
      </article>
      {topic && <nav className="sheet-topic-pagination glass" aria-label={tr("Zwischen Unterthemen wechseln")}>
        {previous ? <Link to={topicPath(sheet, previous)}><span>{tr("Vorheriges Unterthema")}</span>{tr(previous.title)}</Link> : <span/>}
        {next ? <Link to={topicPath(sheet, next)}><span>{tr("Nächstes Unterthema")}</span>{tr(next.title)}</Link> : <Link to={`/lernzettel/${sheet.id}`}>{tr("Zur Themenübersicht")}</Link>}
      </nav>}
    </div>;
}
