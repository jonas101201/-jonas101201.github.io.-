import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { EmptyState, ExampleBadge, PageHeading } from '../components/ui';
import { catalog, subjectName, fieldName } from '../data/catalog';
import { classroom } from '../features/classroom/config';
export function ExamPage() {
  return <><PageHeading eyebrow={classroom.name} title="Prüfungstraining" description="Quizze ohne Zwischenfeedback. Die Auswertung mit Lösungen erhältst du nach der letzten Frage."/>{catalog.quizzes.length ? <div className="learning-grid">{catalog.quizzes.map(q => <article key={q.id} className="learning-card glass"><span className="feature-icon violet"><GraduationCap size={26}/></span><p className="learning-card-meta">{subjectName(q.subjectId)}{q.learningFieldId && ` · ${fieldName(q.learningFieldId)}`}</p><h2>{q.title}</h2><p className="muted">{q.description}</p><div className="tags"><span>{q.questions.length} Fragen</span><span>Ohne Zeitlimit</span></div>{q.example && <ExampleBadge/>}<Link className="button primary" to={`/quizze/${q.id}?modus=pruefung`}>Training starten<ArrowRight size={16}/></Link></article>)}</div> : <EmptyState title="Keine Prüfungsquizze vorhanden"/>}</>;
}
