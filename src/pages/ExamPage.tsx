import { useI18n } from "../i18n/context";
import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { EmptyState, ExampleBadge, PageHeading } from '../components/ui';
import { catalog, subjectName, fieldName } from '../data/catalog';
import { classroom } from '../features/classroom/config';
export function ExamPage() {
    const { tr } = useI18n();
    return <><PageHeading eyebrow={classroom.name} title={tr("Prüfungstraining")} description={tr("Quizze ohne Zwischenfeedback. Die Auswertung mit Lösungen erhältst du nach der letzten Frage.")}/>{catalog.quizzes.length ? <div className="learning-grid">{catalog.quizzes.map(q => <article key={q.id} className="learning-card glass"><span className="feature-icon violet"><GraduationCap size={26}/></span><p className="learning-card-meta">{tr(subjectName(q.subjectId))}{q.learningFieldId && ` · ${tr(fieldName(q.learningFieldId))}`}</p><h2>{tr(q.title)}</h2><p className="muted">{tr(q.description)}</p><div className="tags"><span>{q.questions.length}{tr(" Fragen")}</span><span>{tr("Ohne Zeitlimit")}</span></div>{q.example && <ExampleBadge />}<Link className="button primary" to={`/quizze/${q.id}?modus=pruefung`}>{tr("Training starten")}<ArrowRight size={16}/></Link></article>)}</div> : <EmptyState title={tr("Keine Prüfungsquizze vorhanden")}/>}</>;
}
