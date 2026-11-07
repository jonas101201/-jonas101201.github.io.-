import { changeWithMotion } from '../../utils/motion';
import { useI18n } from "../../i18n/context";
import { MaterialSources } from '../../components/MaterialSources';
import { classroom } from '../../features/classroom/config';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Layers, RotateCcw, Shuffle, ThumbsUp } from 'lucide-react';
import { catalog, subjectName, fieldName } from '../../data/catalog';
import { EmptyState, ExampleBadge, PageHeading } from '../../components/ui';
import { useProgress } from '../../hooks/useProgress';
import { shuffle } from '../quizzes/engine';
import type { FlashcardSet } from '../../types/content';
export function FlashcardList({ subjectId, learningFieldId, embedded = false }: {
    subjectId?: string;
    learningFieldId?: string;
    embedded?: boolean;
}) {
    const { tr } = useI18n();
    const [subject, setSubject] = useState(subjectId ?? '');
    const [field, setField] = useState(learningFieldId ?? '');
    const { progress } = useProgress();
    const sets = catalog.flashcardSets.filter(s => (!subject || s.subjectId === subject) && (!field || s.learningFieldId === field));
    return <>{!embedded && <PageHeading eyebrow={classroom.name} title={tr("Karteikarten")} description={tr("Begriffe und Definitionen nach Fach und Thema. Schwierige Karten gezielt wiederholen.")}/>}
    {!embedded && <div className="inline-filters"><select aria-label={tr("Karteikarten-Fach")} value={subject} onChange={e => { setSubject(e.target.value); setField(''); }}><option value="">{tr("Alle F\u00E4cher")}</option>{catalog.subjects.map(s => <option key={s.id} value={s.id}>{tr(s.title)}</option>)}</select><select aria-label={tr("Karteikarten-Lernfeld")} value={field} onChange={e => setField(e.target.value)}><option value="">{tr("Alle Lernfelder")}</option>{catalog.learningFields.filter(f => f.subjectId === subject).map(f => <option key={f.id} value={f.id}>{tr(f.title)}</option>)}</select></div>}
    {sets.length ? <div className="learning-grid">{sets.map(s => { const known = s.cards.filter(c => progress.cards[`${s.id}:${c.id}`]?.status === 'known').length; return <article className="learning-card glass" key={s.id}><span className="feature-icon teal"><Layers size={25}/></span><div className="learning-card-meta">{tr(subjectName(s.subjectId))} · {tr(fieldName(s.learningFieldId))}</div><h2>{tr(s.title)}</h2><p className="muted">{tr(s.description)}</p>{s.example && <ExampleBadge />}<div className="card-set-progress"><span>{known}{tr(" von ")}{s.cards.length}{tr(" gewusst")}</span><progress value={known} max={s.cards.length} aria-label={tr("Bekannte Karten")}/></div><Link className="button primary" to={`/karteikarten/${s.id}`}>{tr("Lernset \u00F6ffnen")}<ArrowRight size={16}/></Link></article>; })}</div> : <EmptyState title={tr("Keine Lernsets vorhanden")}>{tr("F\u00FCr diese Auswahl sind noch keine Karteikarten hinterlegt.")}</EmptyState>}
  </>;
}
export function FlashcardPage() {
    const { tr } = useI18n();
    const { id } = useParams();
    const set = catalog.flashcardSets.find(s => s.id === id);
    return set ? <CardSession key={id} set={set}/> : <EmptyState title={tr("Lernset nicht gefunden")}><Link to="/karteikarten">{tr("Alle Lernsets ansehen")}</Link></EmptyState>;
}
function CardSession({ set }: {
    set: FlashcardSet;
}) {
    const { tr } = useI18n();
    const { progress, markCard, persistenceEnabled } = useProgress();
    const [cards, setCards] = useState(set.cards);
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [difficultOnly, setDifficultOnly] = useState(false);
    const [message, setMessage] = useState('');
    const [completed, setCompleted] = useState(false);
    const flipButton = useRef<HTMLButtonElement>(null);
    const card = cards[index];
    const status = card && progress.cards[`${set.id}:${card.id}`]?.status;
    const difficult = set.cards.filter(c => progress.cards[`${set.id}:${c.id}`]?.status === 'difficult');
    useEffect(() => {
        if (!completed)
            flipButton.current?.focus();
    }, [index, completed]);
    function move(next: number) { setIndex(next); setFlipped(false); setMessage(''); }
    function mark(value: 'known' | 'difficult') {
        if (!card)
            return;
        markCard(set.id, card.id, value);
        setMessage(value === 'known' ? 'Als gewusst markiert.' : 'Für die Wiederholung vorgemerkt.');
        if (index < cards.length - 1) {
            setIndex(i => i + 1);
            setFlipped(false);
        }
        else
            setCompleted(true);
    }
    function selectCards(onlyDifficult: boolean) { setDifficultOnly(onlyDifficult); setCards(onlyDifficult ? difficult : set.cards); setIndex(0); setFlipped(false); setCompleted(false); setMessage(''); }
    return <><Link className="back-link" to="/karteikarten"><ArrowLeft size={16}/>{tr("Alle Karteikarten")}</Link><PageHeading eyebrow={tr("{0} / {1}", [tr(subjectName(set.subjectId)), tr(fieldName(set.learningFieldId)) ?? ''])} title={tr(set.title)} description={tr("Karte umdrehen und mit „Gewusst“ oder „Noch üben“ bewerten.")}>{set.example && <ExampleBadge />}</PageHeading>
    <div className="flash-toolbar"><div className="segmented"><button className={!difficultOnly ? 'active' : ''} aria-pressed={!difficultOnly} onClick={() => selectCards(false)}>{tr("Alle Karten (")}{set.cards.length})</button><button className={difficultOnly ? 'active' : ''} aria-pressed={difficultOnly} onClick={() => selectCards(true)}>{tr("Schwierige (")}{difficult.length})</button></div><button className="button secondary" onClick={() => { setCards(c => shuffle(c)); setIndex(0); setFlipped(false); setCompleted(false); }} disabled={!cards.length}><Shuffle size={16}/>{tr("Mischen")}</button></div>
    {completed ? <div className="empty-state glass"><CircleSuccess /><h2>{tr("Lernrunde abgeschlossen")}</h2><p>{tr("Die Kartenbewertungen wurden erfasst. Schwierige Karten k\u00F6nnen separat wiederholt werden.")}</p><div className="button-row centered"><button className="button primary" onClick={() => selectCards(false)}><RotateCcw size={16}/>{tr("Neue Runde")}</button><button className="button secondary" onClick={() => selectCards(true)}>{tr("Schwierige wiederholen (")}{difficult.length})</button></div></div> : card ? <div className="flash-session"><div className="flash-meta"><span>{tr("Karte ")}{index + 1}{tr(" von ")}{cards.length}</span><span>{status === 'known' ? tr('✓ Bereits gewusst') : status === 'difficult' ? tr('Zur Wiederholung markiert') : tr('Noch nicht bewertet')}</span></div><button ref={flipButton} className={`flashcard glass ${flipped ? 'flipped' : ''}`} onClick={() => changeWithMotion(() => setFlipped(f => !f))} aria-label={tr("{0}: {1}. Zum Umdrehen aktivieren.", [flipped ? tr('Antwort') : tr('Begriff'), flipped ? tr(card.back) : tr(card.front)])}><span className="eyebrow">{flipped ? tr('DIE ERKLÄRUNG') : tr('WAS BEDEUTET …?')}</span><span key={`${card.id}-${flipped ? 'back' : 'front'}`} className={flipped ? 'flash-back' : 'flash-front'}>{flipped ? tr(card.back) : tr(card.front)}</span><span className="flip-hint"><RotateCcw size={15}/>{tr("Klicken oder Leertaste zum Umdrehen")}</span></button>{flipped && <MaterialSources ids={card.materialIds}/>}<div className="flash-actions"><button className="button secondary" disabled={!flipped} onClick={() => mark('difficult')}><RotateCcw size={17}/>{tr("Noch \u00FCben")}</button><button className="button primary" disabled={!flipped} onClick={() => mark('known')}><ThumbsUp size={17}/>{tr("Gewusst")}</button></div><div className="flash-navigation"><button className="icon-button" aria-label={tr("Vorherige Karte")} disabled={index === 0} onClick={() => move(index - 1)}><ChevronLeft /></button><span>{index + 1} / {cards.length}</span><button className="icon-button" aria-label={tr("Nächste Karte")} disabled={index === cards.length - 1} onClick={() => move(index + 1)}><ChevronRight /></button></div></div> : <EmptyState title={tr("Aktuell keine schwierigen Karten.")}>{tr("Markiere Karten beim Lernen mit \u201ENoch \u00FCben\u201C, um sie hier gezielt zu wiederholen.")}</EmptyState>}
    <MaterialSources ids={set.materialIds} title={tr("Unterlagen zu diesem Lernset")}/><p className="sr-only" role="status">{tr(message)}</p><p className="local-note">{persistenceEnabled ? tr('Deine Einschätzungen werden nur in diesem Browser gespeichert.') : tr('Deine Einschätzungen bleiben bis zum Neuladen in diesem Tab erhalten.')}{tr(" Du kannst sie jederzeit neu bewerten.")}</p>
  </>;
}
function CircleSuccess() { return <span className="feature-icon teal" data-motion-success><Check size={30}/></span>; }

