import { classroom } from '../../features/classroom/config';
import { compareMaterials } from './metadata';
import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { catalog } from '../../data/catalog';
import { EmptyState, PageHeading } from '../../components/ui';
import { MaterialCard } from './MaterialCard';
export function MaterialsPage({ subjectId, learningFieldId, embedded = false }: { subjectId?: string; learningFieldId?: string; embedded?: boolean }) {
  const [query, setQuery] = useState(''); const [subject, setSubject] = useState(subjectId ?? '');
  const [field, setField] = useState(learningFieldId ?? ''); const [type, setType] = useState(''); const [sort, setSort] = useState<'date' | 'title'>('date');
  const fields = catalog.learningFields.filter(f => f.subjectId === subject);
  const items = catalog.materials.filter(m => (!subject || m.subjectId === subject) && (!field || m.learningFieldId === field) && (!type || m.fileType === type) && `${m.title} ${m.description} ${m.tags.join(' ')} ${m.originalFilename ?? ''}`.toLocaleLowerCase('de').includes(query.toLocaleLowerCase('de'))).sort((a,b) => compareMaterials(a,b,sort));
  return <>{!embedded && <PageHeading eyebrow={classroom.name} title="Materialien" description="Lernzettel, Arbeitsblätter und Zusammenfassungen für den Unterricht."/>}
    <div className="filters glass"><label className="filter-search"><Search size={18}/><input aria-label="Materialien suchen" placeholder="Titel, Thema oder Schlagwort suchen …" value={query} onChange={e => setQuery(e.target.value)}/></label><div className="filter-controls"><SlidersHorizontal size={17}/>{!subjectId && <select aria-label="Fach filtern" value={subject} onChange={e => {setSubject(e.target.value); setField('');}}><option value="">Alle Fächer</option>{catalog.subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select>}{!learningFieldId && <select aria-label="Lernfeld filtern" value={field} onChange={e => setField(e.target.value)} disabled={fields.length === 0}><option value="">Alle Lernfelder</option>{fields.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}</select>}<select aria-label="Dateityp filtern" value={type} onChange={e => setType(e.target.value)}><option value="">Alle Dateitypen</option>{['PDF','DOCX','PNG','TXT','PPTX','ZIP'].map(t => <option key={t}>{t}</option>)}</select><select aria-label="Sortierung" value={sort} onChange={e => setSort(e.target.value === 'title' ? 'title' : 'date')}><option value="date">Neueste zuerst</option><option value="title">Titel A–Z</option></select></div></div>
    <p className="result-count" aria-live="polite">{items.length} {items.length === 1 ? 'Material' : 'Materialien'} {items.some(m => m.example) ? ' · enthält gekennzeichnete Beispiele' : ''}</p>
    {items.length ? <div className="material-grid">{items.map(m => <MaterialCard material={m} key={m.id}/>)}</div> : <EmptyState/>}
  </>;
}
