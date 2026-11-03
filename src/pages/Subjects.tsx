import { classroom } from '../features/classroom/config';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, FolderOpen, Layers, Sparkles } from 'lucide-react';
import { catalog } from '../data/catalog';
import { EmptyState, PageHeading, SubjectCard } from '../components/ui';
import { MaterialsPage } from '../features/materials/MaterialsPage';
import { QuizList } from '../features/quizzes/QuizPages';
import { FlashcardList } from '../features/flashcards/FlashcardPages';
export function SubjectsPage() {
  return <><PageHeading eyebrow={classroom.name} title="Fächer" description="Unterrichtsmaterialien, Quizze und Karteikarten nach Fach und Lernfeld."/><div className="featured-subjects">{catalog.subjects.slice(0,2).map(s => <SubjectCard key={s.id} subject={s} featured/>)}</div><div className="subject-grid">{catalog.subjects.slice(2).map(s => <SubjectCard key={s.id} subject={s}/>)}</div><p className="notice">BK-Lernfelder sind konfigurierbare Platzhalter. Die offiziellen Bezeichnungen ergänzt eure Klasse im Inhaltskatalog.</p></>;
}
export function SubjectPage() {
  const { subjectId, fieldId } = useParams(); const [params,setParams] = useSearchParams();
  const subject = catalog.subjects.find(s => s.id === subjectId); const field = catalog.learningFields.find(f => f.id === fieldId && f.subjectId === subjectId);
  const fields = catalog.learningFields.filter(f => f.subjectId === subjectId);
  const tab = params.get('bereich') ?? 'materialien';
  if (!subject || (fieldId && !field)) return <EmptyState title="Fach oder Lernfeld nicht gefunden"><Link to="/faecher">Alle Fächer ansehen</Link></EmptyState>;
  return <><Link className="back-link" to={field ? `/faecher/${subject.id}` : '/faecher'}><ArrowLeft size={16}/>{field ? `Zurück zu ${subject.title}` : 'Alle Fächer'}</Link><PageHeading eyebrow={subject.subtitle} title={field ? `${subject.title} · ${field.title}` : subject.title} description={field ? field.description : 'Materialien, Quizze und Karteikarten für dieses Fach.'}/>
    {!field && fields.length > 0 && <section className="field-section"><h2>Lernfelder</h2><p className="muted">Konfigurierbare Platzhalter · offizielle Benennungen folgen.</p><div className="field-grid">{fields.map(f => <Link className="field-card glass" key={f.id} to={`/faecher/${subject.id}/lernfelder/${f.id}`}><span className={`field-number ${subject.color}`}>{String(f.number).padStart(2,'0')}</span><span>{f.title}</span><ChevronRight size={16}/></Link>)}</div></section>}
    <nav className="content-tabs" aria-label="Lernbereiche">{[{id:'materialien',label:'Unterrichtsmaterialien',Icon:FolderOpen},{id:'quizze',label:'Quizze',Icon:Sparkles},{id:'karteikarten',label:'Karteikarten',Icon:Layers}].map(({id,label,Icon}) => <button key={id} className={tab === id ? 'active' : ''} aria-pressed={tab === id} onClick={() => setParams({bereich:id})}><Icon size={17}/>{label}</button>)}</nav>
    {tab === 'quizze' ? <QuizList key={`${subject.id}-${fieldId}-q`} subjectId={subject.id} learningFieldId={fieldId} embedded/> : tab === 'karteikarten' ? <FlashcardList key={`${subject.id}-${fieldId}-c`} subjectId={subject.id} learningFieldId={fieldId} embedded/> : <MaterialsPage key={`${subject.id}-${fieldId}-m`} subjectId={subject.id} learningFieldId={fieldId} embedded/>}
  </>;
}
