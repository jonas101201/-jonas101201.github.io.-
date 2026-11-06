import { translateTree } from '../i18n/translate';
import { useI18n } from "../i18n/context";
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, BookOpen, Layers, Sparkles } from 'lucide-react';
import { catalog, subjectName, fieldName } from '../data/catalog';
import { EmptyState, PageHeading, SectionHeading } from '../components/ui';
import { MaterialCard } from '../features/materials/MaterialCard';
import { studySheets, sheetSearchText } from '../features/study-sheets/data';
export function SearchPage() {
    const { tr, language, locale, count } = useI18n();
    const [params] = useSearchParams();
    const q = params.get('q')?.trim() ?? '';
    const term = q.toLocaleLowerCase(locale);
    const match = (text: string) => term && text.toLocaleLowerCase(locale).includes(term);
    const materials = catalog.materials.filter(m => match(`${m.title} ${m.description} ${m.tags.join(' ')} ${tr(subjectName(m.subjectId))} ${tr(fieldName(m.learningFieldId)) ?? ''} ${m.originalFilename ?? ''}`));
    const quizzes = catalog.quizzes.filter(m => match(`${m.title} ${m.description} ${tr(m.title)} ${tr(m.description)} ${tr(subjectName(m.subjectId))} ${m.questions.map(q => tr(q.prompt)).join(' ')}`));
    const sets = catalog.flashcardSets.filter(m => match(`${m.title} ${m.description} ${tr(subjectName(m.subjectId))} ${m.cards.map(c => c.front + ' ' + c.back + ' ' + tr(c.front) + ' ' + tr(c.back)).join(' ')}`));
    const sheets = studySheets.filter(sheet => match(`${sheetSearchText(sheet)} ${sheetSearchText(translateTree(sheet, language))} ${tr(subjectName(sheet.subjectId))} ${tr(fieldName(sheet.learningFieldId))}`));
    return <><PageHeading eyebrow={tr("SUCHE")} title={q ? tr("Suchergebnisse f\u00FCr \u201E{0}\u201C", [q]) : tr('Was möchtest du lernen?')} description={tr("Durchsuche Unterrichtsmaterialien, Lernzettel, Quizze und Karteikarten.")}/>
    <form className="search-page-form" role="search"><input aria-label={tr("Suchbegriff")} name="q" defaultValue={q} placeholder={tr("Zum Beispiel: Spielformen")}/><button className="button primary">{tr("Suchen")}</button></form>
    {materials.length + quizzes.length + sets.length + sheets.length === 0 ? <EmptyState title={q ? tr('Keine Treffer') : tr('Suchbegriff eingeben')}>{q ? tr('Versuche einen anderen Begriff, etwa „Spiel“ oder „Kommunikation“.') : tr('Gib oben einen Begriff ein.')}</EmptyState> : <><p className="result-count">{count(materials.length + quizzes.length + sets.length + sheets.length, 'results')}</p>{sheets.length > 0 && <><SectionHeading title={tr("Lernzettel")}/>{sheets.map(sheet => <Link className="search-result glass" key={sheet.id} to={`/lernzettel/${sheet.id}`}><BookOpen size={22}/><div><h3>{tr(subjectName(sheet.subjectId))} · {tr(fieldName(sheet.learningFieldId))} · {tr(sheet.title)}</h3><p className="muted">{tr(sheet.description)}</p></div><ArrowUpRight size={20}/></Link>)}</>}{materials.length > 0 && <><SectionHeading title={tr("Materialien")}/><div className="material-grid">{materials.map(m => <MaterialCard key={m.id} material={m}/>)}</div></>}{quizzes.length > 0 && <><SectionHeading title={tr("Quizze")}/>{quizzes.map(m => <Link className="search-result glass" key={m.id} to={`/quizze/${m.id}`}><Sparkles size={22}/><div><h3>{tr(m.title)}</h3><p className="muted">{tr(m.description)}</p></div><ArrowUpRight size={20}/></Link>)}</>}{sets.length > 0 && <><SectionHeading title={tr("Karteikarten")}/>{sets.map(m => <Link className="search-result glass" key={m.id} to={`/karteikarten/${m.id}`}><Layers size={22}/><div><h3>{tr(m.title)}</h3><p className="muted">{tr(m.description)}</p></div><ArrowUpRight size={20}/></Link>)}</>}</>}
  </>;
}
