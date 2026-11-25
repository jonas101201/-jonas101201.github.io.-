import { useListFilters } from '../../hooks/useListFilters';
import { ActionFeedback } from '../../components/ActionFeedback';
import { ViewToggle, type MaterialView } from '../../components/ViewToggle';
import { useI18n } from "../../i18n/context";
import { classroom } from '../../features/classroom/config';
import { compareMaterials } from './metadata';
import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { catalog } from '../../data/catalog';
import { EmptyState, PageHeading } from '../../components/ui';
import { MaterialCard } from './MaterialCard';
import { MobileFilters } from '../../components/MobileFilters';
export function MaterialsPage({ subjectId, learningFieldId, embedded = false }: {
    subjectId?: string;
    learningFieldId?: string;
    embedded?: boolean;
}) {
    const { tr, count } = useI18n();
    const [message, setMessage] = useState('');
    const { params, subject, field, setSubject, setField, setFilters, fields } = useListFilters(subjectId, learningFieldId);
    const view: MaterialView = params.get('ansicht') === 'liste' ? 'list' : 'cards';
    const query = params.get('q') ?? '';
    const type = ['PDF', 'DOCX', 'PNG', 'TXT', 'PPTX', 'ZIP'].find(value => value === params.get('typ')) ?? '';
    const sort = params.get('sort') === 'titel' ? 'title' : 'date';
    const activeFilters = Number(Boolean(subject && !subjectId)) + Number(Boolean(field && !learningFieldId)) + Number(Boolean(type)) + Number(sort !== 'date');
    const items = catalog.materials.filter(m => (!subject || m.subjectId === subject) && (!field || m.learningFieldId === field) && (!type || m.fileType === type) && `${m.title} ${m.description} ${m.tags.join(' ')} ${m.originalFilename ?? ''}`.toLocaleLowerCase('de').includes(query.toLocaleLowerCase('de'))).sort((a, b) => compareMaterials(a, b, sort));
    return <>{!embedded && <PageHeading eyebrow={classroom.name} title={tr("Materialien")} description={tr("Lernzettel, Arbeitsblätter und Zusammenfassungen für den Unterricht.")}/>}
    <div className="filters glass"><label className="filter-search"><Search size={18}/><input aria-label={tr("Materialien suchen")} placeholder={tr("Titel, Thema oder Schlagwort suchen …")} value={query} onChange={e => setFilters({ q: e.target.value })}/></label><MobileFilters activeCount={activeFilters}><SlidersHorizontal size={17}/>{!subjectId && <select aria-label={tr("Fach filtern")} value={subject} onChange={e => setSubject(e.target.value)}><option value="">{tr("Alle F\u00E4cher")}</option>{catalog.subjects.map(s => <option key={s.id} value={s.id}>{tr(s.title)}</option>)}</select>}{!subjectId && <select aria-label={tr("Lernfeld filtern")} value={field} onChange={e => setField(e.target.value)} disabled={fields.length === 0}><option value="">{tr("Alle Lernfelder")}</option>{fields.map(f => <option key={f.id} value={f.id}>{tr(f.title)}</option>)}</select>}<select aria-label={tr("Dateityp filtern")} value={type} onChange={e => setFilters({ typ: e.target.value })}><option value="">{tr("Alle Dateitypen")}</option>{['PDF', 'DOCX', 'PNG', 'TXT', 'PPTX', 'ZIP'].map(t => <option key={t}>{t}</option>)}</select><select aria-label={tr("Sortierung")} value={sort} onChange={e => setFilters({ sort: e.target.value === 'title' ? 'titel' : '' })}><option value="date">{tr("Neueste zuerst")}</option><option value="title">{tr("Titel A\u2013Z")}</option></select></MobileFilters></div>
    <div className="library-toolbar"><ViewToggle value={view} onChange={next => { setFilters({ ansicht: next === 'list' ? 'liste' : '' }); setMessage(next === 'list' ? 'Listenansicht aktiviert.' : 'Kartenansicht aktiviert.'); }}/><p className="result-count" aria-live="polite">{count(items.length, 'materials')} {items.some(m => m.example) ? tr(' · enthält gekennzeichnete Beispiele') : ''}</p></div>
    <div className="library-feedback"><ActionFeedback message={tr(message)}/></div>
    {items.length ? <div className={view === 'list' ? 'material-list' : 'material-grid'}>{items.map(m => <MaterialCard material={m} key={m.id}/>)}</div> : <EmptyState />}
  </>;
}
