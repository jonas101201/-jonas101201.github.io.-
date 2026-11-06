import { useI18n } from "../i18n/context";
import { classroom } from '../features/classroom/config';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, FolderOpen, Layers, Sparkles, BookOpen } from 'lucide-react';
import { catalog } from '../data/catalog';
import { EmptyState, PageHeading, SubjectCard } from '../components/ui';
import { MaterialsPage } from '../features/materials/MaterialsPage';
import { QuizList } from '../features/quizzes/QuizPages';
import { FlashcardList } from '../features/flashcards/FlashcardPages';
import { StudySheetList } from '../features/study-sheets/StudySheetPages';
export function SubjectsPage() {
    const { tr } = useI18n();
    return <><PageHeading eyebrow={classroom.name} title={tr("Fächer")} description={tr("Unterrichtsmaterialien, Lernzettel, Quizze und Karteikarten nach Fach und Lernfeld.")}/><div className="featured-subjects">{catalog.subjects.slice(0, 2).map(s => <SubjectCard key={s.id} subject={s} featured/>)}</div><div className="subject-grid">{catalog.subjects.slice(2).map(s => <SubjectCard key={s.id} subject={s}/>)}</div><p className="notice">{tr("BK-Lernfelder sind konfigurierbare Platzhalter. Die offiziellen Bezeichnungen erg\u00E4nzt eure Klasse im Inhaltskatalog.")}</p></>;
}
export function SubjectPage() {
    const { tr } = useI18n();
    const { subjectId, fieldId } = useParams();
    const [params, setParams] = useSearchParams();
    const subject = catalog.subjects.find(s => s.id === subjectId);
    const field = catalog.learningFields.find(f => f.id === fieldId && f.subjectId === subjectId);
    const fields = catalog.learningFields.filter(f => f.subjectId === subjectId);
    const tab = params.get('bereich') ?? 'materialien';
    if (!subject || (fieldId && !field))
        return <EmptyState title={tr("Fach oder Lernfeld nicht gefunden")}><Link to="/faecher">{tr("Alle F\u00E4cher ansehen")}</Link></EmptyState>;
    return <><Link className="back-link" to={field ? `/faecher/${subject.id}` : '/faecher'}><ArrowLeft size={16}/>{field ? tr("Zur\u00FCck zu {0}", [tr(subject.title)]) : tr('Alle Fächer')}</Link><PageHeading eyebrow={tr(subject.subtitle)} title={field ? tr("{0} \u00B7 {1}", [tr(subject.title), tr(field.title)]) : tr(subject.title)} description={field ? tr(field.description) : tr('Materialien, Lernzettel, Quizze und Karteikarten für dieses Fach.')}/>
    {!field && fields.length > 0 && <section className="field-section"><h2>{tr("Lernfelder")}</h2><p className="muted">{tr("Konfigurierbare Platzhalter \u00B7 offizielle Benennungen folgen.")}</p><div className="field-grid">{fields.map(f => <Link className="field-card glass" key={f.id} to={`/faecher/${subject.id}/lernfelder/${f.id}`}><span className={`field-number ${subject.color}`}>{String(f.number).padStart(2, '0')}</span><span>{tr(f.title)}</span><ChevronRight size={16}/></Link>)}</div></section>}
    <nav className="content-tabs" aria-label={tr("Lernbereiche")}>{[{ id: 'materialien', label: 'Unterrichtsmaterialien', Icon: FolderOpen }, { id: 'lernzettel', label: 'Lernzettel', Icon: BookOpen }, { id: 'quizze', label: 'Quizze', Icon: Sparkles }, { id: 'karteikarten', label: 'Karteikarten', Icon: Layers }].map(({ id, label, Icon }) => <button key={id} className={tab === id ? 'active' : ''} aria-pressed={tab === id} onClick={() => setParams({ bereich: id })}><Icon size={17}/>{tr(label)}</button>)}</nav>
    {tab === 'lernzettel' ? <StudySheetList key={`${subject.id}-${fieldId}-s`} subjectId={subject.id} learningFieldId={fieldId} embedded/> : tab === 'quizze' ? <QuizList key={`${subject.id}-${fieldId}-q`} subjectId={subject.id} learningFieldId={fieldId} embedded/> : tab === 'karteikarten' ? <FlashcardList key={`${subject.id}-${fieldId}-c`} subjectId={subject.id} learningFieldId={fieldId} embedded/> : <MaterialsPage key={`${subject.id}-${fieldId}-m`} subjectId={subject.id} learningFieldId={fieldId} embedded/>}
  </>;
}
