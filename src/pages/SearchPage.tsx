import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, BookOpen, Layers, Sparkles } from 'lucide-react';
import { catalog, subjectName, fieldName } from '../data/catalog';
import { EmptyState, PageHeading, SectionHeading } from '../components/ui';
import { MaterialCard } from '../features/materials/MaterialCard';
import { studySheets, sheetSearchText } from '../features/study-sheets/data';
export function SearchPage() {
  const [params] = useSearchParams(); const q = params.get('q')?.trim() ?? ''; const term = q.toLocaleLowerCase('de');
  const match = (text: string) => term && text.toLocaleLowerCase('de').includes(term);
  const materials = catalog.materials.filter(m=>match(`${m.title} ${m.description} ${m.tags.join(' ')} ${subjectName(m.subjectId)} ${fieldName(m.learningFieldId) ?? ''} ${m.originalFilename ?? ''}`));
  const quizzes = catalog.quizzes.filter(m=>match(`${m.title} ${m.description} ${subjectName(m.subjectId)}`));
  const sets = catalog.flashcardSets.filter(m=>match(`${m.title} ${m.description} ${subjectName(m.subjectId)} ${m.cards.map(c=>c.front+' '+c.back).join(' ')}`));
  const sheets = studySheets.filter(sheet => match(`${sheetSearchText(sheet)} ${subjectName(sheet.subjectId)} ${fieldName(sheet.learningFieldId)}`));
  return <><PageHeading eyebrow="SUCHE" title={q ? `Suchergebnisse für „${q}“` : 'Was möchtest du lernen?'} description="Durchsuche Unterrichtsmaterialien, Lernzettel, Quizze und Karteikarten."/>
    <form className="search-page-form" role="search"><input aria-label="Suchbegriff" name="q" defaultValue={q} placeholder="Zum Beispiel: Spielformen"/><button className="button primary">Suchen</button></form>
    {materials.length + quizzes.length + sets.length + sheets.length === 0 ? <EmptyState title={q ? 'Keine Treffer' : 'Suchbegriff eingeben'}>{q ? 'Versuche einen anderen Begriff, etwa „Spiel“ oder „Kommunikation“.' : 'Gib oben einen Begriff ein.'}</EmptyState> : <><p className="result-count">{materials.length + quizzes.length + sets.length + sheets.length} Treffer</p>{sheets.length > 0 && <><SectionHeading title="Lernzettel"/>{sheets.map(sheet => <Link className="search-result glass" key={sheet.id} to={`/lernzettel/${sheet.id}`}><BookOpen size={22}/><div><h3>{subjectName(sheet.subjectId)} · {fieldName(sheet.learningFieldId)} · {sheet.title}</h3><p className="muted">{sheet.description}</p></div><ArrowUpRight size={20}/></Link>)}</>}{materials.length > 0 && <><SectionHeading title="Materialien"/><div className="material-grid">{materials.map(m => <MaterialCard key={m.id} material={m}/>)}</div></>}{quizzes.length > 0 && <><SectionHeading title="Quizze"/>{quizzes.map(m => <Link className="search-result glass" key={m.id} to={`/quizze/${m.id}`}><Sparkles size={22}/><div><h3>{m.title}</h3><p className="muted">{m.description}</p></div><ArrowUpRight size={20}/></Link>)}</>}{sets.length > 0 && <><SectionHeading title="Karteikarten"/>{sets.map(m => <Link className="search-result glass" key={m.id} to={`/karteikarten/${m.id}`}><Layers size={22}/><div><h3>{m.title}</h3><p className="muted">{m.description}</p></div><ArrowUpRight size={20}/></Link>)}</>}</>}
  </>;
}
