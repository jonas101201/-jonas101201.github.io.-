import { useEffect, useRef, useState } from 'react';
import { BookOpen, Check, ChevronDown, CircleHelp, Minus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ContentRouteLink } from '../../components/ContextLinks';
import { useI18n } from '../../i18n/context';
import { ActiveCompanion } from '../progression/ActiveCompanion';
import type { CompanionId } from '../progression/companions';
import type { Rating } from './analysis';
import { requestSmartRecall, smartRecallLoginUrl, smartRecallMaxAnswer, smartRecallNotBefore, type SmartRecallResult, type SmartRecallError } from './smartRecall';
import type { BlurtingTask } from './tasks';

const statusLabels = {
  correct: 'Fachlich korrekt', partial: 'Teilweise korrekt', incomplete: 'Unvollständig',
  wrong: 'Fachlich falsch', missing: 'Nicht erwähnt', uncertain: 'Nicht zuverlässig bewertbar',
};

const statusIcons = { correct: Check, partial: Minus, incomplete: Minus, wrong: X, missing: Minus, uncertain: CircleHelp };

const errors: Record<SmartRecallError, string> = {
  access_connection: 'Der Browser konnte die geschützte Anfrage nicht öffnen. Melde dich bei Cloudflare Access an. Falls du im App-Browser bist, öffne LernHub in Safari. Deine Antwort bleibt hier erhalten.',
  unauthorized: 'Melde dich bei Cloudflare Access an und versuche es danach erneut.',
  disabled: 'Die KI-Auswertung ist derzeit deaktiviert. Du kannst deine Antwort selbst kontrollieren.',
  invalid_request: 'Die Anfrage konnte nicht verarbeitet werden. Prüfe die Antwortlänge oder nutze die Selbstkontrolle.',
  unsupported_task: 'Für diese Aufgabe steht keine freigegebene Wissensgrundlage für die KI-Auswertung bereit.',
  busy: 'Für diesen Versuch läuft bereits eine Bewertung.',
  user_budget: 'Du hast dein persönliches Tageslimit für KI-Auswertungen erreicht. Du kannst deine Antwort selbst kontrollieren.',
  budget: 'Das kostenlose KI-Kontingent ist für heute ausgeschöpft. Du kannst weiterhin die Selbstkontrolle verwenden.',
  unavailable: 'Die KI-Auswertung ist gerade nicht erreichbar. Prüfe deine Internetverbindung und die Access-Anmeldung.',
  invalid_result: 'Das Modell hat kein überprüfbares Ergebnis geliefert. Deine Antwort bleibt erhalten.',
  timeout: 'Die KI-Auswertung hat zu lange gedauert. Deine Antwort bleibt erhalten.',
};

const errorCodes: Record<SmartRecallError, string> = {
  access_connection: 'SR-CONNECTION',
  unauthorized: 'SR-AUTH',
  disabled: 'SR-DISABLED',
  invalid_request: 'SR-REQUEST',
  unsupported_task: 'SR-TASK',
  busy: 'SR-BUSY',
  user_budget: 'SR-USER-LIMIT',
  budget: 'SR-DAY-LIMIT',
  unavailable: 'SR-UNAVAILABLE',
  invalid_result: 'SR-RESULT',
  timeout: 'SR-TIMEOUT',
};

const suggestedRatings: Partial<Record<keyof typeof statusLabels, Rating>> = {
  correct: 'remembered', partial: 'partial', incomplete: 'partial', wrong: 'misunderstood', missing: 'missing',
};

const recallAdvice: Record<CompanionId, string> = {
  orbit: 'Schauen wir uns diesen Lernaspekt genauer an.',
  ember: 'Nimm dir einen Punkt nach dem anderen vor.',
  spectre: 'Lies die Stelle nach und erkläre sie dann noch einmal aus dem Kopf.',
  bloom: 'Diesen Punkt nehmen wir als Nächstes unter die Lupe.',
  glitch: 'Beginne deine Wiederholung mit diesem Punkt.',
  cosmo: 'Schau dir dazu das Beispiel im Lernzettel an.',
  pflanziska: 'Hier kannst du dein Wissen Schritt für Schritt vertiefen.',
};

export function SmartRecall({ task, answer, attemptId, complete, manual, companion, showManual, applyRatings, edit, onEvaluated }: {
  task: BlurtingTask;
  answer: string;
  attemptId: string;
  complete: boolean;
  manual: boolean;
  companion: string;
  onEvaluated: () => void;
  showManual: () => void;
  applyRatings: (ratings: Record<string, Rating>) => void;
  edit: () => void;
}) {
  const { tr, language, locale } = useI18n();
  const [disclose, setDisclose] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [result, setResult] = useState<SmartRecallResult | null>(null);
  const [problem, setProblem] = useState<SmartRecallError | null>(null);
  const request = useRef<AbortController | null>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const [pilotOpen, setPilotOpen] = useState(() => !(smartRecallNotBefore > Date.now()));
  useEffect(() => {
    if (pilotOpen) return;
    const timer = window.setTimeout(() => setPilotOpen(true), smartRecallNotBefore - Date.now());
    return () => window.clearTimeout(timer);
  }, [pilotOpen]);
  const answerLength = answer.trim().length;
  const eligible = answerLength > 0 && answerLength <= smartRecallMaxAnswer;
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => { if (result) resultHeading.current?.focus(); }, [result]);
  useEffect(() => {
    if (!complete) return;
    request.current?.abort();
    request.current = null;
  }, [complete]);

  async function evaluate() {
    if (!pilotOpen || !eligible || request.current || complete || result) return;
    const controller = new AbortController();
    request.current = controller;
    setWaiting(true);
    setProblem(null);
    const timeout = window.setTimeout(() => controller.abort('timeout'), 40_000);
    try {
      const output = await requestSmartRecall(task, answer, attemptId, language, controller.signal);
      if (!controller.signal.aborted) {
        setResult(output);
        onEvaluated();
      }
    } catch (error) {
      if (controller.signal.reason === 'timeout') setProblem('timeout');
      else if (!controller.signal.aborted) {
        const code = error instanceof Error ? error.message : 'unavailable';
        setProblem(Object.hasOwn(errors, code) ? code as SmartRecallError : 'unavailable');
      }
    } finally {
      window.clearTimeout(timeout);
      if (request.current === controller && (!controller.signal.aborted || controller.signal.reason === 'timeout')) {
        request.current = null;
        setWaiting(false);
      }
    }
  }

  function cancel() {
    request.current?.abort();
    request.current = null;
    setWaiting(false);
    setDisclose(false);
  }

  if (complete && !result) return null;
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const score = result?.score;
  const scoreLabel = score && tr('Punkte: {0} von {1}', [
    format.format(score.earned) + (score.earned === score.maxEarned ? '' : '–' + format.format(score.maxEarned)),
    format.format(score.possible),
  ]);
  const next = result?.criteria.find(criterion => criterion.status === 'wrong') ??
    result?.criteria.find(criterion => ['partial', 'incomplete', 'missing'].includes(criterion.status)) ??
    result?.criteria.find(criterion => criterion.status === 'uncertain');
  const nextTitle = task.concepts.find(concept => concept.id === next?.id)?.title;
  const nextSource = result?.sources.find(source => source.id === next?.sourceId);
  return <section className="glass dashboard-panel blurting-panel smart-recall" aria-labelledby="smart-recall-title">
    <h2 id="smart-recall-title" ref={resultHeading} tabIndex={-1}>{tr('Smart Recall · KI-Auswertung')}</h2>
    {!result && !complete && <>
      <div className="button-row">
        {!disclose && <button className="button primary" onClick={() => { setProblem(null); setDisclose(true); }} disabled={!pilotOpen || !eligible}>{tr('KI-Auswertung starten')}</button>}
        {!manual && <button className="button secondary" onClick={() => { cancel(); showManual(); }}>{tr('Selbst kontrollieren')}</button>}
        <button className="button secondary" onClick={() => { cancel(); edit(); }}>{tr('Antwort bearbeiten')}</button>
      </div>
      {!pilotOpen && <p className="notice">{tr('KI-Auswertung verfügbar ab {0}. Du kannst deine Antwort jetzt selbst kontrollieren.', [
        new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(smartRecallNotBefore),
      ])}</p>}
      {!eligible && <p>{tr('Die KI-Auswertung unterstützt Antworten bis {0} Zeichen. Die Selbstkontrolle bleibt verfügbar.', [smartRecallMaxAnswer])}</p>}
      {disclose && <div className="notice">
        <p>{tr('Wenn du fortfährst, werden deine Antwort und passende Auszüge aus den Lernzetteln zur Bewertung an Cloudflare Workers AI gesendet. Bitte verwende keine Namen oder anderen persönlichen Daten.')}</p>
        <p><Link className="text-link" to="/datenschutz#smart-recall-privacy">{tr('Datenschutz')}</Link> · <a className="text-link" href={smartRecallLoginUrl()} target="_blank" rel="noopener noreferrer">{tr('Bei Cloudflare Access anmelden')}</a></p>
        <div className="button-row">
          <button type="button" className="button primary" disabled={!pilotOpen || waiting || !eligible} onClick={() => void evaluate()}>{tr('Antwort senden und bewerten')}</button>
          <button type="button" className="button secondary" onClick={cancel}>{tr('Abbrechen')}</button>
        </div>
      </div>}
      {waiting && <p role="status">{tr('Deine Antwort wird anhand der Lernzettel bewertet …')}</p>}
      {problem && <p className="notice warning" role="alert">
        {tr(errors[problem])}
        <small className="smart-recall-error-code">{tr('Fehlercode {0}', [errorCodes[problem]])}</small>
      </p>}
    </>}
    {result && score && <>
      <div className="smart-recall-overview">
        <div className="smart-recall-score">
          <strong>{scoreLabel}</strong>
          {result.status === 'uncertain' && <span>{tr('Vorläufige Bewertung')}</span>}
        </div>
        <progress className="smart-recall-meter" max={score.possible} value={score.earned} aria-label={scoreLabel}/>
        <p>{result.feedback}</p>
      </div>
      <ActiveCompanion context="completion" encouraging={Boolean(next) || result.status === 'uncertain'}>
        <strong>{tr(next?.status === 'uncertain' ? 'Schauen wir gemeinsam in die Lernzettel.' : next ? recallAdvice[companion as CompanionId] ?? recallAdvice.orbit : 'Das hast du anhand der Lernzettel gut erklärt.')}</strong>
        {nextTitle && <span>{tr(nextTitle)}</span>}
        {nextSource && <ContentRouteLink className="text-link" to={nextSource.to} target="_blank" rel="noopener">{tr(nextSource.title)}</ContentRouteLink>}
      </ActiveCompanion>
      <ul className="smart-recall-criteria">
        {task.concepts.map(concept => {
          const criterion = result.criteria.find(row => row.id === concept.id);
          if (!criterion) return null;
          const source = result.sources.find(item => item.id === criterion.sourceId);
          const StatusIcon = statusIcons[criterion.status];
          return <li key={concept.id}>
            <details className="smart-recall-criterion">
              <summary>
                <span className="smart-recall-status-icon" data-status={criterion.status}><StatusIcon size={16} aria-hidden="true"/></span>
                <span className="smart-recall-row-text">
                  <strong>{tr(concept.title)}</strong>
                  <span className="smart-recall-status">{tr(statusLabels[criterion.status])}</span>
                </span>
                <ChevronDown className="smart-recall-chevron" size={16} aria-hidden="true"/>
              </summary>
              <div className="smart-recall-detail">
                <p>{criterion.reason}</p>
                {criterion.excerpt && <blockquote><mark>{criterion.excerpt}</mark></blockquote>}
                {criterion.correction && <p><strong>{tr('So kannst du es verbessern')}</strong> · {criterion.correction}</p>}
                {criterion.sourceQuote && <figure><figcaption>{tr('Beleg aus dem Lernzettel')}</figcaption><blockquote>{criterion.sourceQuote}</blockquote></figure>}
                {source && <ContentRouteLink className="text-link" to={source.to} target="_blank" rel="noopener">{tr(source.title)}</ContentRouteLink>}
              </div>
            </details>
          </li>;
        })}
      </ul>
      <details className="smart-recall-sources">
        <summary>
          <BookOpen size={16} aria-hidden="true"/>
          <strong>{tr('Verwendete Lernzettel')} ({result.sources.length})</strong>
          <ChevronDown className="smart-recall-chevron" size={16} aria-hidden="true"/>
        </summary>
        <p className="muted">{tr('Die Lernzettel öffnen sich in einem neuen Tab.')}</p>
        <ul className="blurting-links">
          {result.sources.map(source => <li key={source.id}><ContentRouteLink className="text-link" to={source.to} target="_blank" rel="noopener">{tr(source.title)}</ContentRouteLink></li>)}
        </ul>
      </details>
      {!complete && <div className="button-row">
        <button type="button" className="button secondary" onClick={showManual}>{tr('Selbst kontrollieren')}</button>
        {result.criteria.some(criterion => suggestedRatings[criterion.status]) && <button type="button" className="button primary" onClick={() => {
          const proposed: Record<string, Rating> = {};
          for (const criterion of result.criteria) {
            const rating = suggestedRatings[criterion.status];
            if (rating) proposed[criterion.id] = rating;
          }
          applyRatings(proposed);
        }}>{tr('Bewertungsvorschläge prüfen und übernehmen')}</button>}
      </div>}
    </>}
  </section>;
}
