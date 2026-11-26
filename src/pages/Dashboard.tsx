import { CurrentDate } from '../components/CurrentDate';
import { buildSearchIndex } from '../features/search';
import { lazy, Suspense, useMemo } from 'react';
import { useProgressionConsent } from '../features/progression/useProgressionConsent';
import { useI18n } from '../i18n/context';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BarChart3, CalendarDays, ChevronRight } from 'lucide-react';
import { catalog } from '../data/catalog';
import { SectionHeading } from '../components/ui';
import { MaterialCard } from '../features/materials/MaterialCard';
import { useProgress } from '../hooks/useProgress';
import { ClassEvents } from '../features/classroom/ClassEvents';
import { studySheets } from '../features/study-sheets/data';

const ProgressHomeStats = lazy(() => import('../features/progression/ProgressHomeStats').then(module => ({ default: module.ProgressHomeStats })));

export function Dashboard() {
  const { tr, count, language } = useI18n();
  const progressionActive = useProgressionConsent();
  const { progress, activities, persistenceEnabled } = useProgress();
  const index = useMemo(() => buildSearchIndex(tr, language), [tr, language]);
  const recent = activities.flatMap(a => { const entry = index.find(e => e.to === a.to); return entry ? [entry] : []; });
  const entry = recent[0];
  const lastQuiz = entry?.id.startsWith('quiz:') ? progress.quizResults.filter(result => result.quizId === entry.id.slice(5)).at(-1) : undefined;
  const cardSet = entry?.id.startsWith('cards:') ? catalog.flashcardSets.find(set => set.id === entry.id.slice(6)) : undefined;
  const assessed = cardSet?.cards.filter(card => progress.cards[`${cardSet.id}:${card.id}`]);
  const resumeProgress = lastQuiz ? tr('Letztes Ergebnis: {0} %', [Math.round(lastQuiz.score / lastQuiz.total * 100)])
    : assessed?.length ? tr('{0} von {1} Karten gewusst', [assessed.filter(card => progress.cards[`${cardSet!.id}:${card.id}`]?.status === 'known').length, cardSet!.cards.length]) : undefined;
  const starter = studySheets.find(s => s.id === 'bk1-lf3') ?? studySheets[0]!;
  const bkSubjects = catalog.subjects.filter(subject => ['bk1', 'bk2'].includes(subject.id));
  const cards = catalog.flashcardSets.flatMap(set => set.cards.map(card => `${set.id}:${card.id}`));
  const known = cards.filter(key => progress.cards[key]?.status === 'known').length;
  const difficult = cards.filter(key => progress.cards[key]?.status === 'difficult').length;
  const percent = cards.length ? Math.round(known / cards.length * 100) : 0;
  const latest = [...catalog.materials].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 3);

  return <div className="dashboard home-dashboard">
    <header className="home-heading">
      <h1 id="home-fields-heading">{tr('Deine Lernfelder')}</h1>
      <p className="home-date"><CurrentDate compact/></p>
    </header>
    <div className="home-main-grid">
      <section className="home-fields" aria-labelledby="home-fields-heading">
        <div className="home-bk-groups">{bkSubjects.map(subject => {
          const fields = catalog.learningFields.filter(field => field.subjectId === subject.id).sort((a, b) => a.number - b.number);
          return <article className={`home-bk-group ${subject.color}`} key={subject.id}>
            <Link className="home-bk-heading" to={`/faecher/${subject.id}`} aria-label={tr('{0} öffnen', [tr(subject.title)])}>
              <span className="home-bk-badge">{tr(subject.title)}</span>
              <h2>{tr(subject.subtitle)}</h2><ChevronRight size={20} aria-hidden="true"/>
            </Link>
            <nav className="home-bk-fields" aria-label={tr('{0} Lernfelder', [tr(subject.title)])}>{fields.map(field => <Link key={field.id} to={`/faecher/${subject.id}/lernfelder/${field.id}`} aria-label={tr('{0} · {1}', [tr(subject.title), tr(field.title)])}>LF {field.number}</Link>)}</nav>
          </article>;
        })}</div>
      </section>
      <section className="home-resume" aria-labelledby="continue-heading">
        <Link className="home-resume-card glass" to={entry?.to ?? `/lernzettel/${starter.id}`}>
          <h2 id="continue-heading" className="home-card-label">{tr(entry ? 'Weiterlernen' : 'Dein Einstieg')}</h2>
          {entry && <span className="home-resume-kind">{[entry.kind, entry.context].filter(Boolean).join(' · ')}</span>}
          <h3>{entry?.title ?? tr(starter.title)}</h3>
          {resumeProgress && <span className="home-resume-progress">{resumeProgress}</span>}
          <span className="home-resume-action"><span className="sr-only">{tr(entry ? 'Fortsetzen' : 'Lernzettel öffnen')}</span><ArrowRight size={22} aria-hidden="true"/></span>
        </Link>
      </section>
    </div>
    <section className="home-subjects home-subject-shortcuts" aria-label={tr('Weitere Fächer')}><div className="home-section-heading"><h2>{tr('Weitere Fächer')}</h2></div><div>{catalog.subjects.filter(subject => !['bk1', 'bk2'].includes(subject.id)).map(subject => <Link className={`home-subject-chip ${subject.color}`} to={`/faecher/${subject.id}`} key={subject.id}>{tr(subject.title)}<ArrowUpRight size={14} aria-hidden="true"/></Link>)}</div></section>
      <div className="dashboard-panels">      <section className="dashboard-panel glass"><div className="panel-heading"><h2><CalendarDays size={22}/>{tr('Nächste Termine')}</h2><Link to="/termine" className="icon-button" aria-label={tr('Alle Klassentermine anzeigen')}><ArrowUpRight size={18}/></Link></div><ClassEvents limit={3}/></section><section className="dashboard-panel glass"><div className="panel-heading"><h2><BarChart3 size={22}/>{tr('Dein Fortschritt')}</h2><Link to="/fortschritt" className="icon-button" aria-label={tr('Fortschritt öffnen')}><ArrowUpRight size={18}/></Link></div><div className="progress-overview"><div className="progress-ring" role="img" aria-label={tr('{0} von {1} Karten gewusst, {2} Prozent', [known, cards.length, percent])}><svg viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="65" className="ring-track"/><circle cx="80" cy="80" r="65" className="ring-value" pathLength="100" strokeDasharray={`${percent} 100`}/></svg><div><strong>{percent}<span> %</span></strong><small>{tr('Karten gewusst')}</small></div></div><dl className="progress-metrics"><div><dt>{tr('Gewusste Karten')}</dt><dd>{known}<span> / {cards.length}</span></dd></div><div><dt>{tr('Noch üben')}</dt><dd>{count(difficult, 'cards')}</dd></div><div><dt>{tr('Quizversuche')}</dt><dd>{progress.quizResults.length}</dd></div></dl></div>{progressionActive && <Suspense fallback={null}><ProgressHomeStats/></Suspense>}<p className="panel-footnote">{persistenceEnabled ? tr('Fortschritt wird nur in diesem Browser gespeichert.') : tr('Fortschritt bleibt bis zum Neuladen erhalten. Dauerhafte Speicherung kannst du freiwillig aktivieren.')}</p><Link className="text-link progress-compact-link" to="/speicher">{tr('Lernverlauf anzeigen')}</Link></section>
</div>
      <section className="recent-section"><SectionHeading title={tr('Zuletzt hinzugefügt')} to="/materialien" link={tr('Alle Materialien')}/><div className="recent-materials">{latest.map(m => <MaterialCard material={m} key={m.id}/>)}</div></section>
  </div>;
}
