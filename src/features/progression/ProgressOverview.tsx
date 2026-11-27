import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, BookOpen, Brain, Check, CircleArrowRight, Clock3, Compass, Crown, Flag, Layers3, Target, Trophy, Zap } from 'lucide-react';
import { catalog, fieldName, subjectName } from '../../data/catalog';
import { useI18n } from '../../i18n/context';
import { ContentRouteLink } from '../../components/ContextLinks';
import { useMissionRecommendations } from './useMissionRecommendations';
import {
  achievementDefinitions, challengeDefinitions, challengeProgress, collectionDefinitions,
  levelFor, ownsWorld, reviewFor, statistics, type State,
} from './engine';
import { learningReference, missionSteps, plantMission, translateMissionTitle, type MissionRecord } from './missions';
import { milestoneLevels, missionClasses, xpForLevel } from './rules';
import { cosmeticById } from './cosmetics';
import { premiumWorldById } from './worlds';
import { useProgression } from './store';
import { GardenStem } from './StudioPreview';
import { ProgressStoragePanel } from './ProgressStoragePanel';

const missionIcons = { quick: Zap, focus: Target, expert: Flag, master: Crown };
const fieldStatus = { started: 'In Bearbeitung', due: 'Wiederholung empfohlen', verified: 'Mehrfach erfolgreich überprüft' };
const methodLabels = { quiz: 'Quiz', exam: 'Prüfungstraining', cards: 'Karteikarten', blurting: 'Freier Wissensabruf' };

export function ProgressOverview() {
  const { enabled, ready, state } = useProgression();
  const { tr } = useI18n();
  return <>
    {enabled && <><ProgressSummary state={state}/><MissionSection/><LearningOverview state={state}/><Achievements state={state}/></>}
    {!enabled && ready && <section className="glass prose">
      <h2>{tr('Lernen ohne Progress')}</h2>
      <div className="progress-actions">
        <Link className="button secondary" to="/lernen"><BookOpen size={18} aria-hidden="true"/>{tr('Lernen')}</Link>
        <Link className="button secondary" to="/blurting">{tr('Freier Wissensabruf')}</Link>
      </div>
    </section>}
    {!enabled && <ProgressStoragePanel/>}
  </>;
}

export function ProgressSummary({ state }: { state: State }) {
  const { tr, locale } = useI18n();
  const { level, floor, next, earned, remaining } = levelFor(state.xp);
  const milestone = milestoneLevels.find(value => value > level);
  const wanted = state.wishlist.flatMap(id => {
    const world = premiumWorldById(id);
    if (world && !ownsWorld(state, id)) return [{ name: world.name, cost: world.price, to: '/fortschritt/store?welt=' + id }];
    const item = cosmeticById(id);
    return item && !state.owned.includes(id) ? [{ name: item.name, cost: item.condition.type === 'credits' ? item.condition.price : null, to: '/fortschritt/store?auswahl=wishlist' }] : [];
  })[0];
  const cost = wanted?.cost ?? null;
  const number = new Intl.NumberFormat(locale);
  return <section className="glass progress-section progress-hero-summary" aria-labelledby="progress-level-heading">
    <div className="progress-hero-header">
      <h2 id="progress-level-heading">{tr('Level {0}', [level])}</h2>
      <p className="progress-hero-counters"><span>{number.format(state.xp)} XP</span><span>{number.format(state.credits)} HUB Credits</span></p>
    </div>
    {next === null ? <p>{tr('Alle verfügbaren Level erreicht.')}</p> : <>
      {state.equipped.progress === 'garden-growth' ? <GardenStem value={Math.round(earned / (next - floor) * 100)} label={tr('Fortschritt zum nächsten Level')}/> :
        <progress aria-label={tr('Fortschritt zum nächsten Level')} value={earned} max={next - floor}/>}
      <p>{tr('Noch {0} XP bis Level {1}', [number.format(remaining), level + 1])}</p>
    </>}
    {milestone && <p>{tr('Nächster Meilenstein: Level {0} bei {1} XP', [milestone, number.format(xpForLevel(milestone))])}</p>}
    <details className="progress-milestones">
      <summary>{tr('Meilensteine')}</summary>
      <ol className="progress-step-list">{milestoneLevels.map(value =>
        <li key={value} data-reached={level >= value || undefined}>{tr('Level {0}', [value])} · {tr(level >= value ? 'Erreicht' : 'Offen')}</li>)}</ol>
    </details>
    {wanted && <div className="notice">
      <strong>{tr('Dein Freischaltziel')} · {tr(wanted.name)}</strong>
      {cost !== null && <><p>{number.format(Math.min(state.credits, cost))} / {number.format(cost)} HUB Credits</p>
        <progress aria-label={tr('Fortschritt zum Freischaltziel')} max={cost} value={Math.min(state.credits, cost)}/></>}
      <Link className="text-link progress-compact-link" to={wanted.to}>{tr('Shop')}</Link>
    </div>}
  </section>;
}

function MissionSection() {
  const { state, dispatch, error } = useProgression();
  const { tr } = useI18n();
  const { hash } = useLocation();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (hash === '#missionen') heading.current?.focus();
  }, [hash]);
  const recommendations = useMissionRecommendations(state);
  const plant = plantMission();
  const plans = [
    ...(plant && !state.missions.some(item => item.id === plant.id && item.status !== 'cancelled') ? [plant] : []),
    ...recommendations,
  ];
  const active = state.missions.some(item => item.status === 'active');
  const current = state.missions.filter(item => item.status === 'active' || item.status === 'paused');

  function missionAction(type: 'mission-pause' | 'mission-resume' | 'mission-cancel', mission: MissionRecord) {
    void dispatch({ type, id: mission.id, at: new Date().toISOString() });
  }

  return <section className="progress-section progress-missions" aria-labelledby="missionen">
    <div className="progress-missions-header"><h2 className="progress-section-title" id="missionen" ref={heading} tabIndex={-1}><Compass aria-hidden="true"/>{tr('Lernmissionen')}</h2>
    {error && <p className="notice warning" role="status">{tr(error)}</p>}
    {active && <p className="muted">{tr('Du kannst jeweils eine Mission aktiv bearbeiten. Pausiere sie, um eine andere zu starten.')}</p>}
    <label className="settings-check">{tr('Mein Lernziel')}
      <select value={state.goalFieldId ?? ''} onChange={event => void dispatch({ type: 'set-goal', learningFieldId: event.target.value || undefined })}>
        <option value="">{tr('Automatisch empfehlen')}</option>
        {catalog.learningFields.map(field => <option key={field.id} value={field.id}>{tr(subjectName(field.subjectId))} · {tr(field.title)}</option>)}
      </select>
    </label>
    </div>
    {current.map(mission => <article key={mission.id} className="glass progress-mission-card progress-current-mission" data-mission-kind={mission.plan.kind}>
        <div className="progress-mission-meta"><Flag size={18} aria-hidden="true"/><strong>{tr(mission.status === 'paused' ? 'Pausiert' : 'Aktiv')}</strong><span>{mission.completedStepIds.length} / {mission.plan.steps.length}</span></div>
        <h3>{translateMissionTitle(mission.plan.title, tr)}</h3>
        <p>{tr(mission.plan.reason)}</p>
        <progress className="progress-track" aria-label={tr('Missionsschritte')} max={mission.plan.steps.length} value={mission.completedStepIds.length}/>
        <ol className="progress-step-list">{missionSteps(mission).map(step => <li key={step.id}>
          {step.completed ? <span><Check size={15} aria-hidden="true"/> {tr('Erledigt')} · {tr(step.title)}</span>
            : mission.status === 'active' && step.to ? <ContentRouteLink className="text-link" to={step.to}>{tr(methodLabels[step.kind])} · {tr(step.title)}</ContentRouteLink>
              : <span>{tr(methodLabels[step.kind])} · {tr(step.title)}{!step.to && ' · ' + tr('Inhalt nicht mehr verfügbar')}</span>}
        </li>)}</ol>
        <div className="progress-actions">
          <button className="button secondary" disabled={mission.status === 'paused' && active} onClick={() => missionAction(mission.status === 'paused' ? 'mission-resume' : 'mission-pause', mission)}>{tr(mission.status === 'paused' ? 'Fortsetzen' : 'Pausieren')}</button>
          <button className="button secondary" onClick={() => missionAction('mission-cancel', mission)}>{tr('Mission abbrechen')}</button>
        </div>
      </article>)}
    <div className="progress-tile-grid">
      {plans.map(plan => {
        const Icon = missionIcons[plan.kind];
        return <article key={plan.id} className="glass progress-mission-card" data-mission-kind={plan.kind}>
          <div className="progress-mission-meta">
            <span className="progress-emblem"><Icon size={20} aria-hidden="true"/></span>
            <strong>{tr(missionClasses[plan.kind].label)}</strong>
            <span><Clock3 size={14} aria-hidden="true"/>{tr('Ca. {0} Min.', [plan.estimatedMinutes])}</span>
          </div>
          <h3>{translateMissionTitle(plan.title, tr)}</h3>
          <p>{tr(plan.reason)}</p>
          <details className="progress-mission-steps">
            <summary>{tr('Missionsschritte')}</summary>
            <ol className="progress-step-list">{plan.steps.map(step => <li key={step.id}>{tr(methodLabels[step.kind])} · {tr(step.title)}</li>)}</ol>
          </details>
          <div className="progress-mission-footer">
            <p className="progress-reward"><Trophy size={15} aria-hidden="true"/> {plan.reward.xp} XP · {plan.reward.credits} HUB Credits</p>
            <button className="button primary" disabled={active} onClick={() => void dispatch({ type: 'mission-start', mission: plan, at: new Date().toISOString() })}>{tr('Mission starten')}</button>
          </div>
        </article>;
      })}
    </div>
    {state.missions.some(mission => mission.status === 'completed') && <details className="glass prose">
      <summary>{tr('Abgeschlossene Missionen')}</summary>
      <ul>{state.missions.filter(mission => mission.status === 'completed').map(mission => <li key={mission.id}>{translateMissionTitle(mission.plan.title, tr)}</li>)}</ul>
    </details>}
  </section>;
}

function LearningOverview({ state }: { state: State }) {
  const { tr, locale } = useI18n();
  const stats = statistics(state);
  const reviews = [...new Map(state.events.flatMap(event => {
    const reference = learningReference(event.kind, event.contentId);
    const review = reviewFor(state, event.kind, event.contentId);
    return reference && review ? [[reference.id, { reference, review }] as const] : [];
  })).values()].sort((a, b) => a.review.dueAt.localeCompare(b.review.dueAt));
  return <section className="progress-section" aria-labelledby="learning-overview-heading">
    <h2 className="progress-section-title" id="learning-overview-heading"><Activity aria-hidden="true"/>{tr('Lernstatistik')}</h2>
    <div className="progress-tile-grid progress-stat-grid">
      <article className="glass progress-stat-card">
        <h3><Activity aria-hidden="true"/>{tr('Lernaktivität')}</h3>
        <dl className="progress-stat-values">
          <div><dt>{tr('Qualifizierte Lernabschlüsse')}</dt><dd>{stats.completed}</dd></div>
          <div><dt>{tr('Zeitversetzte Wiederholungen')}</dt><dd>{stats.reviewed}</dd></div>
          <div><dt>{tr('Verbesserte Quizergebnisse')}</dt><dd>{stats.improved}</dd></div>
        </dl>
        {stats.cardRatings.count > 0 && <p className="muted">{tr('Karten als gewusst bewertet: {0} von {1}', [stats.cardRatings.known, stats.cardRatings.attempted])}</p>}
      </article>
      <article className="glass progress-stat-card">
        <h3><Target aria-hidden="true"/>{tr('Überprüfte Antworten')}</h3>
        {stats.objective.total > 0 ? <>
          <p className="progress-quiz-ratio"><strong>{stats.objective.correct}</strong><span> / {stats.objective.total}</span></p>
          <progress className="progress-track" aria-label={tr('Überprüfte Antworten')} max={stats.objective.total} value={stats.objective.correct}/>
          <p className="muted">{tr('Richtige Quizantworten')}</p>
        </> : <p className="muted">{tr('Noch keine überprüften Antworten.')}</p>}
      </article>
      <article className="glass progress-stat-card">
        <h3><Brain aria-hidden="true"/>{tr('Selbstauswertung im Wissensabruf')}</h3>
        <dl className="progress-stat-values progress-recall-values">
          <div><dt>{tr('Vollständig')}</dt><dd>{stats.self.remembered}</dd></div>
          <div><dt>{tr('Teilweise')}</dt><dd>{stats.self.partial}</dd></div>
          <div><dt>{tr('Offen')}</dt><dd>{stats.self.missing}</dd></div>
          <div><dt>{tr('Falsch verstanden')}</dt><dd>{stats.self.misunderstood}</dd></div>
        </dl>
        <p className="muted">{tr('{0} aufgearbeitete Kernaspekte', [stats.resolvedGaps])}</p>
      </article>
    </div>
    <details className="glass progress-stat-card"><summary><Layers3 size={18} aria-hidden="true"/> {tr('Fächer und Lernfelder')}</summary>
      <ul className="progress-ledger">{catalog.subjects.flatMap(subject => {
        const fields = catalog.learningFields.filter(field => field.subjectId === subject.id);
        const entries = fields.length ? fields : [{ id: subject.id, title: subject.title }];
        return entries.map(entry => {
          const field = stats.fields.find(item => item.scope === entry.id);
          return <li key={entry.id}><strong>{tr(subject.title)}{fields.length ? ' · ' + tr(entry.title) : ''}</strong> · {tr(field ? fieldStatus[field.status] : 'Noch nicht bearbeitet')}</li>;
        });
      })}</ul>
    </details>
    {reviews.length > 0 && <section className="glass prose">
      <h3>{tr('Empfohlene Wiederholung')}</h3>
      <ul className="progress-ledger">{reviews.slice(0, 12).map(({ reference, review }) => <li key={reference.id}>
        <Link className="text-link progress-compact-link" to={reference.to}>{tr(reference.title)}<CircleArrowRight size={15} aria-hidden="true"/></Link>
        <span> · {new Date(review.dueAt).toLocaleDateString(locale)} · {tr(fieldName(reference.learningFieldId) || subjectName(reference.subjectId))}</span>
      </li>)}</ul>
    </section>}
  </section>;
}

function Achievements({ state }: { state: State }) {
  const { tr, locale } = useI18n();
  const { dispatch } = useProgression();
  const achievements = new Map(achievementDefinitions.map(item => [item.id, item]));
  return <div className="progress-section">
    <section className="progress-section"><h2 className="progress-section-title" id="erfolge"><Trophy aria-hidden="true"/>{tr('Herausforderungen')}</h2>
      <div className="progress-tile-grid">{challengeDefinitions.map(item => {
        const progress = challengeProgress(state, item.id);
        return <article key={item.id} className="glass progress-mission-card">
          <div className="progress-mission-meta"><span className="progress-emblem"><Trophy size={20} aria-hidden="true"/></span><strong>{tr(item.difficulty)}</strong><span>{progress.current} / {progress.target}</span></div>
          <h3>{tr(item.title)}</h3><p>{tr(item.description)}</p>
          <progress className="progress-track" aria-label={tr(item.title)} value={progress.current} max={progress.target}/>
          <p className="progress-reward"><Zap size={15} aria-hidden="true"/> {item.reward.xp} XP · {item.reward.credits} HUB Credits</p>
          {progress.complete ? <strong>{tr('Erreicht')}</strong> : progress.joined ? <span>{tr('Aktiv')}</span> :
            <button className="button secondary" onClick={() => void dispatch({ type: 'challenge-join', id: item.id, at: new Date().toISOString() })}>{tr('Herausforderung annehmen')}</button>}
        </article>;
      })}</div>
    </section>
    <section className="glass prose"><h2>{tr('Erfolge und Sammlungen')}</h2>
      {collectionDefinitions.map(collection => <details key={collection.id}>
        <summary>{tr(collection.title)} · {collection.achievementIds.filter(id => state.unlocks.includes('achievement:' + id)).length} / {collection.achievementIds.length}</summary>
        <ul className="progress-ledger">{collection.achievementIds.map(id => {
          const item = achievements.get(id);
          return item && <li key={id}><strong>{tr(item.title)}</strong> · {tr(state.unlocks.includes('achievement:' + id) ? 'Erreicht' : 'Offen')}<p>{tr(item.description)}</p></li>;
        })}</ul>
      </details>)}
    </section>
    <details className="glass prose">
      <summary>{tr('Letzte Credit-Transaktionen')}</summary>
      {state.transactions.length === 0 ? <p>{tr('Noch keine Transaktionen.')}</p> : <ol className="progress-ledger">
        {state.transactions.slice(-20).reverse().map(item => <li key={item.id}>
          {new Date(item.at).toLocaleDateString(locale)} · {item.credits > 0 && '+'}{item.credits} HUB Credits · {tr(item.title)}
        </li>)}
      </ol>}
    </details>
  </div>;
}
