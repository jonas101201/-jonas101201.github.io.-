import { useI18n } from "../../i18n/context";
import { MaterialSources } from '../../components/MaterialSources';
import { classroom } from '../../features/classroom/config';
import { useRef, useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CircleCheck, RotateCcw, Sparkles, Trophy, X, Clock3 } from 'lucide-react';
import { catalog, subjectName, fieldName } from '../../data/catalog';
import { EmptyState, ExampleBadge, PageHeading } from '../../components/ui';
import { useProgress } from '../../hooks/useProgress';
import type { Question, Quiz } from '../../types/content';
import { describeAnswer, evaluate, isComplete, isCorrect, prepareQuestions, shuffle, solution, type Answer } from './engine';
export function QuizList({ subjectId, learningFieldId, embedded = false }: {
    subjectId?: string;
    learningFieldId?: string;
    embedded?: boolean;
}) {
    const { tr, count } = useI18n();
    const [subject, setSubject] = useState(subjectId ?? '');
    const [field, setField] = useState(learningFieldId ?? '');
    const { progress } = useProgress();
    const quizzes = catalog.quizzes.filter(q => (!subject || q.subjectId === subject) && (!field || q.learningFieldId === field));
    return <>{!embedded && <PageHeading eyebrow={classroom.name} title={tr("Quizze")} description={tr("Fragen zu euren Unterrichtsthemen. Mit direktem Feedback oder Auswertung am Ende.")}/>}
    {!embedded && <div className="inline-filters"><select aria-label={tr("Quiz-Fach")} value={subject} onChange={e => { setSubject(e.target.value); setField(''); }}><option value="">{tr("Alle F\u00E4cher")}</option>{catalog.subjects.map(s => <option value={s.id} key={s.id}>{tr(s.title)}</option>)}</select><select aria-label={tr("Quiz-Lernfeld")} value={field} onChange={e => setField(e.target.value)}><option value="">{tr("Alle Lernfelder")}</option>{catalog.learningFields.filter(f => f.subjectId === subject).map(f => <option key={f.id} value={f.id}>{tr(f.title)}</option>)}</select></div>}
    {quizzes.length ? <div className="learning-grid">{quizzes.map(q => { const results = progress.quizResults.filter(r => r.quizId === q.id); const last = results.at(-1); return <article className="learning-card glass" key={q.id}><span className="feature-icon violet"><Sparkles size={25}/></span><div className="learning-card-meta">{tr(subjectName(q.subjectId))} · {tr(fieldName(q.learningFieldId))}</div><h2>{tr(q.title)}</h2><p className="muted">{tr(q.description)}</p><div className="tags"><span>{count(q.questions.length, 'questions')}</span><span>{count(new Set(q.questions.map(question => question.type)).size, 'tasks')}</span></div>{q.example && <ExampleBadge />}{last && <p className="result-note">{tr("Letzter Versuch: ")}{Math.round(last.score / last.total * 100)} % · {count(last.total, 'questions')}</p>}<div className="button-row"><Link className="button primary" to={`/quizze/${q.id}?modus=lernen`}>{tr("Lernmodus")}<ArrowRight size={16}/></Link><Link className="button secondary" to={`/quizze/${q.id}?modus=pruefung`}><Clock3 size={16}/>{tr("Pr\u00FCfungsmodus")}</Link></div></article>; })}</div> : <EmptyState title={tr("Keine Quizze vorhanden")}>{tr("F\u00FCr diese Auswahl ist noch kein Quiz hinterlegt.")}</EmptyState>}
  </>;
}
export function QuizPage() {
    const { tr } = useI18n();
    const { id } = useParams();
    const [params] = useSearchParams();
    const quiz = catalog.quizzes.find(q => q.id === id);
    if (!quiz)
        return <EmptyState title={tr("Quiz nicht gefunden")}><Link to="/quizze">{tr("Alle Quizze ansehen")}</Link></EmptyState>;
    const mode = params.get('modus') === 'pruefung' ? 'exam' : 'learn';
    return <QuizSession key={`${id}-${mode}`} quiz={quiz} mode={mode}/>;
}
function QuizSession({ quiz, mode }: {
    quiz: Quiz;
    mode: 'learn' | 'exam';
}) {
    const { tr } = useI18n();
    const [questions, setQuestions] = useState(() => prepareQuestions(quiz.questions));
    const [answers, setAnswers] = useState<Record<string, Answer>>({});
    const [index, setIndex] = useState(0);
    const [checked, setChecked] = useState(false);
    const [finished, setFinished] = useState(false);
    const saved = useRef(false);
    const focus = useRef<HTMLHeadingElement>(null);
    const { saveQuiz } = useProgress();
    const question = questions[index];
    useEffect(() => { focus.current?.focus(); }, [index, finished]);
    const result = evaluate(questions, answers);
    function finish() {
        if (!saved.current) {
            saveQuiz({ id: crypto.randomUUID(), quizId: quiz.id, mode, date: new Date().toISOString(), ...result });
            saved.current = true;
        }
        setFinished(true);
    }
    function restart(wrongOnly = false) {
        const next = wrongOnly ? questions.filter(q => result.wrongQuestionIds.includes(q.id)) : quiz.questions;
        setQuestions(prepareQuestions(next));
        setAnswers({});
        setIndex(0);
        setChecked(false);
        setFinished(false);
        saved.current = false;
    }
    if (finished)
        return <><Link to="/quizze" className="back-link"><ArrowLeft size={16}/>{tr("Alle Quizze")}</Link><div className="quiz-result glass"><span className="feature-icon violet"><Trophy size={30}/></span><p className="eyebrow">{tr("DEIN ERGEBNIS")}</p><h1 tabIndex={-1} ref={focus}>{Math.round(result.score / result.total * 100)}<span> %</span></h1><h2>{result.score === result.total ? tr('Alle Fragen richtig beantwortet') : tr('Quiz abgeschlossen')}</h2><p className="muted">{result.score}{tr(" von ")}{result.total}{tr(" Fragen richtig \u00B7 ")}{mode === 'exam' ? tr('Prüfungsmodus') : tr('Lernmodus')}</p><p className="muted">{tr("Das Ergebnis ist in deinem lokalen Lernverlauf erfasst.")}</p><div className="button-row centered"><button className="button primary" onClick={() => restart()}><RotateCcw size={16}/>{tr("Alles wiederholen")}</button>{result.wrongQuestionIds.length > 0 && <button className="button secondary" onClick={() => restart(true)}>{tr("Nur Fehler wiederholen (")}{result.wrongQuestionIds.length})</button>}</div></div>
      {result.wrongQuestionIds.length > 0 && <><h2 className="review-heading">{tr("Falsch beantwortete Fragen")}</h2><div className="review-list">{questions.filter(q => result.wrongQuestionIds.includes(q.id)).map(q => <article key={q.id} className="glass review-card"><h3>{tr(q.prompt)}</h3><p><strong>{tr("Deine Antwort:")}</strong> {describeAnswer(q, answers[q.id], tr)}</p><p className="correct"><strong>{tr("Richtige Antwort:")}</strong> {solution(q, tr)}</p><p className="muted">{tr(q.explanation)}</p><MaterialSources ids={q.materialIds}/></article>)}</div></>}
      <Sources quiz={quiz}/></>;
    if (!question)
        return <EmptyState title={tr("Keine Fragen vorhanden")}/>;
    const answer = answers[question.id];
    const correct = checked && isCorrect(question, answer);
    const isLast = index === questions.length - 1;
    return <><Link to="/quizze" className="back-link"><ArrowLeft size={16}/>{tr("Quiz verlassen")}</Link><PageHeading eyebrow={tr("{0} / {1}", [tr(subjectName(quiz.subjectId)), tr(fieldName(quiz.learningFieldId)) ?? ''])} title={tr(quiz.title)} description={mode === 'learn' ? tr('Lernmodus · Direktes Feedback nach jeder Antwort.') : tr('Prüfungsmodus · Die Auswertung erhältst du am Ende.')}>{quiz.example && <ExampleBadge />}</PageHeading>
    <div className="quiz-progress"><span>{tr("Frage ")}{index + 1}{tr(" von ")}{questions.length}</span><span>{Math.round(index / questions.length * 100)}{tr(" % abgeschlossen")}</span></div><progress value={index} max={questions.length} aria-label={tr("Quizfortschritt")}/>
    <section className="question-card glass"><p className="eyebrow">{tr({ single: 'EINE ANTWORT', multiple: 'MEHRERE ANTWORTEN MÖGLICH', boolean: 'RICHTIG ODER FALSCH', matching: 'ZUORDNUNG' }[question.type])}</p><h2 ref={focus} tabIndex={-1}>{tr(question.prompt)}</h2>
      <AnswerInputs key={question.id} question={question} answer={answer} disabled={checked} onChange={a => setAnswers(p => ({ ...p, [question.id]: a }))}/>
      {checked && <div role="status" className={`feedback ${correct ? 'success' : 'incorrect'}`}><strong>{correct ? <CircleCheck size={20}/> : <X size={20}/>} {correct ? tr('Richtig beantwortet!') : tr('Noch nicht ganz.')}</strong>{!correct && <p>{tr("Richtige Antwort: ")}{solution(question, tr)}</p>}<p>{tr(question.explanation)}</p><MaterialSources ids={question.materialIds}/></div>}
      <div className="question-actions"><span className="muted">{mode === 'exam' ? tr('Auswertung am Ende') : tr('Direktes Feedback')}</span>{mode === 'learn' && !checked ? <button className="button primary" disabled={!isComplete(question, answer)} onClick={() => setChecked(true)}>{tr("Antwort pr\u00FCfen")}<Check size={17}/></button> : <button className="button primary" disabled={!isComplete(question, answer)} onClick={() => {
                if (isLast)
                    finish();
                else {
                    setIndex(i => i + 1);
                    setChecked(false);
                }
            }}>{isLast ? tr('Ergebnis anzeigen') : tr('Nächste Frage')}<ArrowRight size={17}/></button>}</div>
    </section><Sources quiz={quiz}/></>;
}
function AnswerInputs({ question: q, answer, disabled, onChange }: {
    question: Question;
    answer?: Answer;
    disabled: boolean;
    onChange: (a: Answer) => void;
}) {
    const { tr } = useI18n();
    const [rightOptions] = useState(() => q.type === 'matching' ? shuffle(q.pairs) : []);
    if (q.type === 'matching')
        return <div className="matching-inputs">{q.pairs.map(p => <label key={p.id}><span>{tr(p.left)}</span><select disabled={disabled} value={answer && !Array.isArray(answer) ? answer[p.id] ?? '' : ''} onChange={e => onChange({ ...(!Array.isArray(answer) ? answer : {}), [p.id]: e.target.value })}><option value="">{tr("Antwort w\u00E4hlen \u2026")}</option>{rightOptions.map(o => <option key={o.id} value={o.id}>{tr(o.right)}</option>)}</select></label>)}</div>;
    const selected = Array.isArray(answer) ? answer : [];
    return <fieldset className="answer-options"><legend className="sr-only">{q.type === 'multiple' ? tr('Wähle alle richtigen Antworten') : tr('Wähle eine Antwort')}</legend>{q.options.map((o, i) => <label className={`answer-option ${selected.includes(o.id) ? 'selected' : ''}`} key={o.id}><input name={q.id} type={q.type === 'multiple' ? 'checkbox' : 'radio'} disabled={disabled} checked={selected.includes(o.id)} onChange={() => onChange(q.type === 'multiple' ? (selected.includes(o.id) ? selected.filter(x => x !== o.id) : [...selected, o.id]) : [o.id])}/><span className="answer-letter">{String.fromCharCode(65 + i)}</span><span>{tr(o.text)}</span></label>)}</fieldset>;
}
function Sources({ quiz }: {
    quiz: Quiz;
}) { const { tr } = useI18n(); return <><MaterialSources ids={quiz.materialIds} title={tr("Unterlagen zu diesem Quiz")}/>{quiz.sources.length > 0 && <details className="sources"><summary>{tr("Weitere Quellen & Hinweise")}</summary>{quiz.example && <p>{tr("Redaktionell erstellte Beispielfragen. Spielformen k\u00F6nnen sich \u00FCberschneiden; die Fragen beziehen sich auf den jeweils vorherrschenden Aspekt.")}</p>}<ul>{quiz.sources.map(s => <li key={s}><a href={s} target="_blank" rel="noopener noreferrer">{new URL(s).hostname}<ArrowRight size={13}/></a></li>)}</ul></details>}</>; }
