import { ActiveCompanion } from '../progression/ActiveCompanion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Brain, Clock3 } from 'lucide-react';
import { ContextBackLink, ContentRouteLink } from '../../components/ContextLinks';
import { EmptyState, PageHeading } from '../../components/ui';
import { catalog, fieldName, subjectName } from '../../data/catalog';
import { useListFilters } from '../../hooks/useListFilters';
import { useI18n } from '../../i18n/context';
import { reviewFor } from '../progression/engine';
import { useProgression } from '../progression/store';
import { matchedKeywords, maxAnswerLength, parseDraft, ratings, summarizeRatings, words, type Draft, type Rating } from './analysis';
import { blurtingPath, blurtingTaskById, tasks, type BlurtingTask } from './tasks';
import { SmartRecall } from './SmartRecall';
import { isSmartRecallTaskEnabled } from './smartRecall';
import './blurting.css';

const difficultyLabels = { basic: 'Basis', intermediate: 'Aufbau', advanced: 'Vertiefung' };
const ratingLabels: Record<Rating, string> = {
  remembered: 'Vollständig und fachlich richtig erinnert',
  partial: 'Teilweise erinnert',
  missing: 'Nicht erinnert',
  misunderstood: 'Falsch verstanden',
};
const sessionDrafts = new Map<string, { draft: Draft; generation: string | null }>();

export function BlurtingList() {
  const { tr, locale } = useI18n();
  const { state, enabled } = useProgression();
  const { subject, setSubject } = useListFilters();
  const visible = tasks.filter(task => !subject || task.subjectId === subject);
  return <>
    <PageHeading title={tr('Freier Wissensabruf')} description={tr('Schreibe aus dem Gedächtnis, vergleiche deinen Text mit dem Lernzettel und entscheide, was du wiederholen möchtest.')}/>
    <label className="blurting-picker">
      {tr('Fach')}
      <select value={subject} onChange={event => setSubject(event.target.value)}>
        <option value="">{tr('Alle Fächer')}</option>
        {catalog.subjects.filter(item => tasks.some(task => task.subjectId === item.id))
          .map(item => <option key={item.id} value={item.id}>{tr(item.title)}</option>)}
      </select>
    </label>
    {visible.length ? <div className="learning-grid">
      {visible.map(task => {
        const review = enabled ? reviewFor(state, 'blurting', task.id) : undefined;
        return <article key={task.id} className="learning-card glass">
          <span className="feature-icon teal"><Brain size={25} aria-hidden="true"/></span>
          <p className="learning-card-meta">{[tr(subjectName(task.subjectId)), tr(fieldName(task.learningFieldId))].filter(Boolean).join(' · ')}</p>
          <h2>{tr(task.title)}</h2>
          <p className="muted">{tr(difficultyLabels[task.difficulty])} · {tr('Ca. {0} Min.', [task.estimatedMinutes])}</p>
          {review && <p className="muted">{tr('Wiederholung ab {0}', [new Date(review.dueAt).toLocaleDateString(locale)])}</p>}
          <ContentRouteLink className="button primary" to={blurtingPath(task)}>
            {tr(sessionDrafts.has(task.id) ? 'Entwurf fortsetzen' : 'Aufgabe öffnen')}<ArrowRight size={16} aria-hidden="true"/>
          </ContentRouteLink>
        </article>;
      })}
    </div> : <EmptyState/>}
  </>;
}

export function BlurtingPage() {
  const { id } = useParams();
  const { tr } = useI18n();
  const task = blurtingTaskById.get(id ?? '');
  return task ? <BlurtingSession key={task.id} task={task}/> :
    <EmptyState title={tr('Aufgabe nicht gefunden')}><Link to="/blurting">{tr('Alle Wissensabruf-Aufgaben')}</Link></EmptyState>;
}

type Outcome = {
  xp: number;
  credits: number;
  dueAt?: string;
  counted: boolean;
  previous?: number;
};

function BlurtingSession({ task }: { task: BlurtingTask }) {
  const smartRecallEnabled = isSmartRecallTaskEnabled(task.id);
  const { tr, locale } = useI18n();
  const { state, enabled, ready, error, dispatch, allowTexts, textGeneration, readDraft, saveDraft, finishDraft } = useProgression();
  const [draft, setDraft] = useState<Draft | null>(() => sessionDrafts.get(task.id)?.draft ?? null);
  const [timer, setTimer] = useState(false);
  const [manual, setManual] = useState(false);
  const [hasEvaluation, setHasEvaluation] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [draftError, setDraftError] = useState(false);
  const [previousText, setPreviousText] = useState<string | null>(null);
  const current = useRef(draft);
  const draftGeneration = useRef(sessionDrafts.get(task.id)?.generation ?? null);
  const dirty = useRef(0);
  const mounted = useRef(false);
  const pending = useRef(false);
  const synced = useRef<string | null>(null);
  const controls = useRef({ readDraft, saveDraft, allowTexts, textGeneration });
  controls.current = { readDraft, saveDraft, allowTexts, textGeneration };
  const title = useRef<HTMLHeadingElement>(null);
  const manualHeading = useRef<HTMLHeadingElement>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const phase = outcome ? 'complete' : draft?.phase ?? 'prepare';
  const tokens = useMemo(() => words(draft?.answer ?? ''), [draft?.answer]);

  function update(next: Draft | null) {
    dirty.current++;
    current.current = next;
    if (next) {
      sessionDrafts.delete(task.id);
      sessionDrafts.set(task.id, { draft: next, generation: draftGeneration.current });
      if (sessionDrafts.size > 100) sessionDrafts.delete(sessionDrafts.keys().next().value!);
    } else sessionDrafts.delete(task.id);
    setDraft(next);
  }

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (!controls.current.allowTexts || !dirty.current || draftGeneration.current !== controls.current.textGeneration) return;
      const value = current.current ? JSON.stringify(current.current) : null;
      if (value !== synced.current) void controls.current.saveDraft(task.id, value).catch(() => {});
    };
  }, [task.id]);

  useEffect(() => {
    if (!ready || !draftGeneration.current || draftGeneration.current === textGeneration) return;
    // A text revocation or restored backup invalidates the predecessor draft.
    dirty.current = 0;
    current.current = null;
    draftGeneration.current = null;
    synced.current = null;
    sessionDrafts.delete(task.id);
    setDraft(null);
    setOutcome(null);
    setPreviousText(null);
  }, [ready, textGeneration, task.id]);

  useEffect(() => {
    if (!ready || !allowTexts || dirty.current) return;
    let cancelled = false;
    void controls.current.readDraft(task.id).then(raw => {
      if (cancelled || dirty.current || current.current) return;
      const restored = parseDraft(raw, task.concepts);
      if (!restored) return;
      synced.current = raw;
      current.current = restored;
      draftGeneration.current = textGeneration;
      sessionDrafts.set(task.id, { draft: restored, generation: textGeneration });
      setDraft(restored);
    }).catch(() => { if (!cancelled) setDraftError(true); });
    return () => { cancelled = true; };
  }, [ready, allowTexts, textGeneration, task]);

  useEffect(() => {
    if (!ready || !allowTexts || !dirty.current || phase === 'complete' || draftGeneration.current !== textGeneration) return;
    const value = draft ? JSON.stringify(draft) : null;
    if (value === synced.current) return;
    let cancelled = false;
    const handle = window.setTimeout(() => {
      if (!dirty.current || current.current !== draft || !controls.current.allowTexts || draftGeneration.current !== controls.current.textGeneration) return;
      void controls.current.saveDraft(task.id, value).then(ok => {
        if (cancelled) return;
        if (ok) synced.current = value;
        setDraftError(!ok);
      }).catch(() => { if (!cancelled) setDraftError(true); });
    }, 500);
    return () => { cancelled = true; window.clearTimeout(handle); };
  }, [ready, allowTexts, textGeneration, draft, phase, task.id]);

  useEffect(() => {
    if (phase === 'write') editor.current?.focus({ preventScroll: true });
    else if (phase !== 'prepare') title.current?.focus();
  }, [phase]);

  useEffect(() => { if (manual) manualHeading.current?.focus(); }, [manual]);

  useEffect(() => {
    if (!allowTexts || phase !== 'compare') return;
    let cancelled = false;
    void readDraft('completed:' + task.id).then(value => {
      if (!cancelled) setPreviousText(parseDraft(value, task.concepts)?.answer ?? null);
    });
    return () => { cancelled = true; };
  }, [allowTexts, phase, readDraft, task]);

  const context = [tr(subjectName(task.subjectId)), tr(fieldName(task.learningFieldId))].filter(Boolean).join(' · ');

  function begin() {
    draftGeneration.current = textGeneration;
    setPreviousText(null);
    setOutcome(null);
    setSaveError(false);
    setManual(false);
    setHasEvaluation(false);
    update({ version: 1, id: crypto.randomUUID(), phase: 'write', answer: '', ratings: {}, showTimer: timer, startedAt: Date.now() });
  }

  async function finish(withoutSaving = false) {
    if (!draft || pending.current || task.concepts.some(concept => !draft.ratings[concept.id])) return;
    pending.current = true;
    const canArchive = Boolean(allowTexts && textGeneration === draftGeneration.current);
    setSaving(true);
    setSaveError(false);
    try {
      const previousEvent = enabled ? [...state.events].reverse()
        .find(event => event.kind === 'blurting' && event.contentId === task.id && event.id !== draft.id) : undefined;
      const previousRatings = previousEvent?.concepts;
      const previous = previousRatings && task.concepts.every(concept => previousRatings[concept.id])
        ? task.concepts.filter(concept => previousRatings[concept.id] === 'remembered').length : undefined;
      const result = enabled && !withoutSaving ? await dispatch({ type: 'complete', event: {
        id: draft.id, kind: 'blurting', contentId: task.id, subjectId: task.subjectId,
        learningFieldId: task.learningFieldId, at: new Date().toISOString(), attempted: tokens.length,
        elapsedMs: draft.recallElapsedMs ?? 0, total: task.concepts.length, concepts: draft.ratings,
      } }) : null;
      if (enabled && !withoutSaving && !result) {
        if (mounted.current) setSaveError(true);
        return;
      }
      const awards = result?.transactions.filter(transaction => transaction.eventId === draft.id) ?? [];
      const dueAt = result && reviewFor(result, 'blurting', task.id)?.dueAt;
      const counted = result?.events.some(event => event.id === draft.id) ?? false;
      // Clear refs before issuing the final transaction, so the timer and
      // unmount flush cannot revive a completed active draft.
      if (current.current?.id !== draft.id) return;
      current.current = null;
      dirty.current = 0;
      sessionDrafts.delete(task.id);
      if (mounted.current) setOutcome({
        xp: awards.reduce((sum, transaction) => sum + transaction.xp, 0),
        credits: awards.reduce((sum, transaction) => sum + transaction.credits, 0),
        dueAt: dueAt || undefined, counted, previous,
      });
      if (canArchive) {
        const archived = await finishDraft(task.id, draft.id, enabled && !withoutSaving ? JSON.stringify(draft) : null).catch(() => false);
        if (mounted.current) setDraftError(!archived);
      }
    } catch {
      if (mounted.current) setSaveError(true);
    } finally {
      pending.current = false;
      if (mounted.current) setSaving(false);
    }
  }

  const states = draft ? summarizeRatings(Object.values(draft.ratings)) : summarizeRatings([]);
  const gaps = draft ? task.concepts.filter(concept => draft.ratings[concept.id] !== 'remembered') : [];
  return <div className="blurting-session">
    <ContextBackLink className="back-link" to="/blurting" originLabel={tr('Zurück zur vorherigen Übersicht')}><ArrowLeft size={16} aria-hidden="true"/>{tr('Alle Wissensabruf-Aufgaben')}</ContextBackLink>
    <PageHeading eyebrow={context} title={task.title} description={tr(difficultyLabels[task.difficulty]) + ' · ' + tr('Ca. {0} Min.', [task.estimatedMinutes])}/>
    {draftError && <p className="notice warning" role="status">{tr('Der Entwurf konnte nicht im Browserspeicher aktualisiert werden.')}</p>}
    {phase === 'prepare' && <section className="glass dashboard-panel blurting-panel">
      <h2>{tr('Vorbereitung')}</h2>
      <p>{tr(task.prompt)}</p>
      <p className="muted">{tr('Die Musteraspekte erscheinen erst nach dem Absenden. Die Zeitangabe ist eine Orientierung.')}</p>
      <label className="blurting-check"><input type="checkbox" checked={timer} onChange={event => setTimer(event.target.checked)}/>{tr('Zeit anzeigen')}</label>
      <button className="button primary" onClick={begin}>{tr('Wissen abrufen')}<ArrowRight size={16} aria-hidden="true"/></button>
    </section>}
    {phase === 'write' && draft && <section className="glass dashboard-panel blurting-panel">
      <h2 ref={title} tabIndex={-1}>{tr('Aus dem Gedächtnis schreiben')}</h2>
      <p id="blurting-prompt">{tr(task.prompt)}</p>
      <label htmlFor="blurting-answer">{tr('Deine Antwort')}</label>
      <textarea id="blurting-answer" className="blurting-editor" ref={editor} aria-describedby="blurting-prompt" value={draft.answer}
        maxLength={maxAnswerLength} onChange={event => update({ ...draft, answer: event.target.value })}/>
      <div className="blurting-meta">
        <span>{tr('{0} Wörter', [tokens.length])}</span>
        {draft.showTimer && <RecallClock startedAt={draft.startedAt}/>}
        <span>{tr(allowTexts && draftGeneration.current === textGeneration ? 'Entwurf wird in diesem Browser zwischengespeichert.' : 'Entwurf bleibt bis zum Neuladen in diesem Tab.')}</span>
      </div>
      <button className="button primary" disabled={!tokens.length} onClick={() => update({ ...draft, phase: 'compare', recallElapsedMs: Math.max(0, Date.now() - draft.startedAt) })}>
        {tr(smartRecallEnabled ? 'Antwort abschließen' : 'Antwort absenden und vergleichen')}<ArrowRight size={16} aria-hidden="true"/>
      </button>
    </section>}
    {smartRecallEnabled && draft && (phase === 'compare' || phase === 'complete') && <SmartRecall
      key={draft.id} task={task} answer={draft.answer} attemptId={draft.id} complete={phase === 'complete'} manual={manual}
      companion={state.activeCompanion} onEvaluated={() => setHasEvaluation(true)}
      showManual={() => { setManual(true); manualHeading.current?.focus(); }}
      applyRatings={suggestions => {
        update({ ...draft, ratings: { ...suggestions, ...draft.ratings } });
        setManual(true);
        manualHeading.current?.focus();
      }}
      edit={() => { setManual(false); update({ ...draft, phase: 'write', ratings: {} }); }}
    />}
    {phase === 'compare' && draft && (!smartRecallEnabled || manual) && <>
      <div className="blurting-comparison">
        <section className="glass dashboard-panel blurting-panel">
          <h2 ref={title} tabIndex={-1}>{tr('Deine Antwort')}</h2>
          <p className="blurting-answer">{draft.answer}</p>
          {allowTexts && previousText && <details>
            <summary>{tr('Letzte gespeicherte Antwort ansehen')}</summary>
            <p className="blurting-answer">{previousText}</p>
          </details>}
        </section>
        <section className="glass dashboard-panel blurting-panel">
          <h2 ref={manualHeading} tabIndex={-1}>{tr('Erwartungshorizont und Selbsteinschätzung')}</h2>
          <p className="muted">{tr('Schlagworttreffer sind Hinweise im Text. Ob deine Erklärung fachlich stimmt, beurteilst du anhand des Lernzettels selbst.')}</p>
          {task.concepts.map(concept => {
            const hints = matchedKeywords(tokens, concept);
            return <fieldset key={concept.id} className="blurting-concept">
              <legend>{tr(concept.title)}</legend>
              <p>{tr(concept.explanation)}</p>
              {hints.length > 0 && <p className="muted">{tr('Erkannte Begriffe: {0}', [hints.join(', ')])}</p>}
              {ratings.map(rating => <label key={rating} className="blurting-check">
                <input type="radio" name={'rating-' + concept.id} checked={draft.ratings[concept.id] === rating}
                  onChange={() => update({ ...draft, ratings: { ...draft.ratings, [concept.id]: rating } })}/>
                {tr(ratingLabels[rating])}
              </label>)}
            </fieldset>;
          })}
        </section>
      </div>
      {gaps.some(concept => draft.ratings[concept.id]) && <ReviewLinks task={task} gaps={gaps.filter(concept => draft.ratings[concept.id]).map(concept => concept.title)}/>}
      {saveError && <p className="notice warning" role="alert">{error ?? tr('Das Ergebnis konnte nicht gespeichert werden. Du kannst es erneut versuchen oder die Übung ohne Speichern abschließen.')}</p>}
      <div className="button-row">
        <button className="button primary" disabled={saving || task.concepts.some(concept => !draft.ratings[concept.id])}
          onClick={() => { void finish(); }}>{tr('Selbsteinschätzung abschließen')}</button>
        {saveError && <button className="button secondary" disabled={saving} onClick={() => { void finish(true); }}>{tr('Ohne Speichern abschließen')}</button>}
      </div>
    </>}
    {phase === 'complete' && outcome && <section className="glass dashboard-panel blurting-panel">
      <h2 ref={title} tabIndex={-1}>{tr('Wissensabruf abgeschlossen')}</h2>
      {!hasEvaluation && <ActiveCompanion context="completion" encouraging={gaps.length > 0}/>}
      <dl className="blurting-summary">
        {ratings.map(rating => <div key={rating}><dt>{tr(ratingLabels[rating])}</dt><dd>{states[rating]}</dd></div>)}
      </dl>
      {outcome.previous !== undefined && <p>{tr('Beim letzten gespeicherten Versuch vollständig erinnert: {0}', [outcome.previous])}</p>}
      {outcome.counted && (outcome.xp > 0 || outcome.credits > 0) && <p role="status" data-motion-success>{tr('{0} XP und {1} HUB Credits erhalten.', [outcome.xp, outcome.credits])}</p>}
      {enabled && !outcome.counted && <p>{tr('Dieser Abschluss bleibt eine Übung ohne neue Gutschrift.')}</p>}
      {outcome.dueAt
        ? <p>{tr('Wiederholung ab {0}', [new Date(outcome.dueAt).toLocaleDateString(locale)])}</p>
        : <p>{tr('Wiederhole offene Aspekte möglichst morgen.')}</p>}
      {gaps.length > 0 && <ReviewLinks task={task} gaps={gaps.map(concept => concept.title)}/>}
      <div className="button-row">
        <Link className="button primary" to="/blurting">{tr('Andere Aufgabe wählen')}</Link>
        {enabled && <Link className="button secondary" to="/fortschritt">{tr('Fortschritt')}</Link>}
        <button className="button secondary" disabled={saving} onClick={() => { setOutcome(null); setManual(false); setHasEvaluation(false); update(null); }}>{tr('Neuer Versuch')}</button>
      </div>
    </section>}
  </div>;
}

function ReviewLinks({ task, gaps }: { task: BlurtingTask; gaps: string[] }) {
  const { tr } = useI18n();
  return <section className="glass dashboard-panel blurting-panel">
    <h3>{tr('Gezielt wiederholen')}</h3>
    <p>{gaps.map(gap => tr(gap)).join(' · ')}</p>
    <ul className="blurting-links">
      {task.related.map(reference => <li key={reference.to}>
        <ContentRouteLink className="text-link" to={reference.to}>{tr(reference.kind)} · {tr(reference.title)}</ContentRouteLink>
      </li>)}
    </ul>
  </section>;
}

function RecallClock({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    let timer = 0;
    function sync() {
      window.clearInterval(timer);
      if (!document.hidden) {
        setNow(Date.now());
        timer = window.setInterval(() => setNow(Date.now()), 1000);
      }
    }
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', sync); };
  }, []);
  const elapsed = Math.floor(Math.max(0, now - startedAt) / 1000);
  return <span className="blurting-clock"><Clock3 size={16} aria-hidden="true"/>{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</span>;
}
