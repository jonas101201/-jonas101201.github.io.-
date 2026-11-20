import { CurrentDate } from '../components/CurrentDate';
import { buildSearchIndex } from '../features/search';
import { useMemo } from 'react';
import { useI18n } from '../i18n/context';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BarChart3, CalendarDays, BookOpen, ChevronRight, FileText, GraduationCap, Layers } from 'lucide-react';
import { catalog } from '../data/catalog';
import { SectionHeading } from '../components/ui';
import { MaterialCard } from '../features/materials/MaterialCard';
import { useProgress } from '../hooks/useProgress';
import { ClassEvents } from '../features/classroom/ClassEvents';
import { studySheets } from '../features/study-sheets/data';

export function Dashboard() {
  const { tr, count, language } = useI18n();
  const { progress, activities, persistenceEnabled } = useProgress();
  const index = useMemo(() => buildSearchIndex(tr, language), [tr, language]);
  const recent = activities.flatMap(a => { const entry = index.find(e => e.to === a.to); return entry ? [entry] : []; });
  const entry = recent[0];
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
              <span><h3>{tr(subject.subtitle)}</h3></span><ChevronRight size={20} aria-hidden="true"/>
            </Link>
            <nav className="home-bk-fields" aria-label={tr('{0} Lernfelder', [tr(subject.title)])}>{fields.map(field => <Link key={field.id} to={`/faecher/${subject.id}/lernfelder/${field.id}`} aria-label={tr('{0} · {1}', [tr(subject.title), tr(field.title)])}>LF {field.number}</Link>)}</nav>
          </article>;
        })}</div>
      </section>
      <section className="home-resume" aria-labelledby="continue-heading">
        <Link className="home-resume-card glass" to={entry?.to ?? `/lernzettel/${starter.id}`}>
          <h2 id="continue-heading" className="home-card-label">{tr(entry ? 'Weiterlernen' : 'Dein Einstieg')}</h2>
          <span className="home-resume-kind">{entry?.kind ?? tr('Lernzettel')}</span>
          <h3>{entry?.title ?? tr(starter.title)}</h3>
          <p>{entry ? tr('Dein zuletzt geöffneter Lerninhalt.') : tr('BK1 · LF 3 · Grundlagen und Zusammenhänge')}</p>
          <span className="home-resume-action"><span className="sr-only">{tr(entry ? 'Fortsetzen' : 'Lernzettel öffnen')}</span><ArrowRight size={22} aria-hidden="true"/></span>
        </Link>
      </section>
    </div>
    <details className="home-extras"><summary>{tr('Weitere Lernangebote und Klasseninfos')}<ChevronRight size={18} aria-hidden="true"/></summary>
    <section className="home-quick" aria-labelledby="home-quick-heading"><h2 id="home-quick-heading">{tr('Schnell starten')}</h2><div>
      <Link to="/quizze"><GraduationCap size={25} aria-hidden="true"/>{tr('Quiz üben')}</Link>
      <Link to="/materialien"><FileText size={24} aria-hidden="true"/>{tr('Materialien')}</Link>
    </div></section>
    <section className="home-subjects" aria-label={tr('Fächer der Klasse')}><div className="home-section-heading"><h2>{tr('Alle Fächer')}</h2></div><div>{catalog.subjects.map(subject => <Link className={`home-subject-chip ${subject.color}`} to={`/faecher/${subject.id}`} key={subject.id}>{tr(subject.title)}<ArrowUpRight size={14} aria-hidden="true"/></Link>)}</div></section>
      <div className="home-extra-links"><Link className="text-link" to="/karteikarten"><Layers size={18}/>{tr('Karteikarten')}</Link><Link className="text-link" to="/pruefungstraining"><GraduationCap size={18}/>{tr('Prüfungstraining')}</Link><Link className="text-link" to="/lernzettel"><BookOpen size={18}/>{tr('Alle Lernzettel')}</Link></div>
      <div className="dashboard-panels"><section className="dashboard-panel glass"><div className="panel-heading"><h2><BarChart3 size={22}/>{tr('Dein Fortschritt')}</h2><Link to="/ueber" className="icon-button" aria-label={tr('Lernverlauf anzeigen')}><ArrowUpRight size={18}/></Link></div><div className="progress-overview"><div className="progress-ring" role="img" aria-label={tr('{0} von {1} Karten gewusst, {2} Prozent', [known, cards.length, percent])}><svg viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="65" className="ring-track"/><circle cx="80" cy="80" r="65" className="ring-value" pathLength="100" strokeDasharray={`${percent} 100`}/></svg><div><strong>{percent}<span> %</span></strong><small>{tr('Karten gewusst')}</small></div></div><dl className="progress-metrics"><div><dt>{tr('Gewusste Karten')}</dt><dd>{known}<span> / {cards.length}</span></dd></div><div><dt>{tr('Noch üben')}</dt><dd>{count(difficult, 'cards')}</dd></div><div><dt>{tr('Quizversuche')}</dt><dd>{progress.quizResults.length}</dd></div></dl></div><p className="panel-footnote">{persistenceEnabled ? tr('Fortschritt wird nur in diesem Browser gespeichert.') : tr('Fortschritt bleibt bis zum Neuladen erhalten. Dauerhafte Speicherung kannst du freiwillig aktivieren.')}</p></section>
      <section className="dashboard-panel glass"><div className="panel-heading"><h2><CalendarDays size={22}/>{tr('Nächste Termine')}</h2><Link to="/klasse" className="icon-button" aria-label={tr('Alle Klassentermine anzeigen')}><ArrowUpRight size={18}/></Link></div><ClassEvents limit={3}/></section></div>
      <section className="recent-section"><SectionHeading title={tr('Zuletzt hinzugefügt')} to="/materialien" link={tr('Alle Materialien')}/><div className="recent-materials">{latest.map(m => <MaterialCard material={m} key={m.id}/>)}</div></section>
    </details>
  </div>;
}
