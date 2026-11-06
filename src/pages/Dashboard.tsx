import { useI18n } from "../i18n/context";
import { Link } from 'react-router-dom';
import { ArrowUpRight, BarChart3, CalendarDays, BookOpen, ChevronRight, FileText, GraduationCap, Layers, Play, Zap } from 'lucide-react';
import { catalog } from '../data/catalog';
import { SectionHeading, SubjectCard } from '../components/ui';
import { MaterialCard } from '../features/materials/MaterialCard';
import { useProgress } from '../hooks/useProgress';
import { classroom } from '../features/classroom/config';
import { ClassEvents } from '../features/classroom/ClassEvents';
const shortcuts = [
    { title: 'Lernzettel', to: '/lernzettel', Icon: BookOpen },
    { title: 'Materialien', to: '/materialien', Icon: FileText },
    { title: 'Quizze', to: '/quizze', Icon: Play },
    { title: 'Karteikarten', to: '/karteikarten', Icon: Layers },
    { title: 'Prüfungstraining', to: '/pruefungstraining', Icon: GraduationCap },
];
export function Dashboard() {
    const { tr, count } = useI18n();
    const { progress, persistenceEnabled } = useProgress();
    const availableCards = catalog.flashcardSets.flatMap(set => set.cards.map(card => ({ key: `${set.id}:${card.id}` })));
    const known = availableCards.filter(c => progress.cards[c.key]?.status === 'known').length;
    const difficult = availableCards.filter(c => progress.cards[c.key]?.status === 'difficult').length;
    const percent = availableCards.length ? Math.round(known / availableCards.length * 100) : 0;
    const latest = [...catalog.materials].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 3);
    return <div className="dashboard">
    <header className="dashboard-heading"><div><p>{tr(classroom.program)}</p><h1>{classroom.name}</h1><span>{tr(classroom.description)}</span></div><Link to="/klasse" className="class-chip">{tr("Klassen\u00FCbersicht")}<ArrowUpRight size={15}/></Link></header>
    <section aria-label={tr("Fächer der Klasse")}><div className="featured-subjects">{catalog.subjects.slice(0, 2).map(s => <SubjectCard key={s.id} subject={s} featured/>)}</div><div className="small-subjects">{catalog.subjects.slice(2).map(s => <SubjectCard key={s.id} subject={s}/>)}</div></section>
    <section className="dashboard-shortcuts"><h2><Zap size={21}/>{tr("Schnellzugriff")}</h2><div className="shortcut-grid">{shortcuts.map(({ title, to, Icon }) => <Link className="shortcut glass" to={to} key={to}><Icon size={24}/><span>{tr(title)}</span><ChevronRight size={16}/></Link>)}</div></section>
    <div className="dashboard-panels"><section className="dashboard-panel glass"><div className="panel-heading"><h2><BarChart3 size={22}/>{tr("Dein Fortschritt")}</h2><Link to="/ueber" className="icon-button" aria-label={tr("Lernverlauf anzeigen")}><ArrowUpRight size={18}/></Link></div><div className="progress-overview"><div className="progress-ring" role="img" aria-label={tr("{0} von {1} Karten gewusst, {2} Prozent", [known, availableCards.length, percent])}><svg viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="65" className="ring-track"/><circle cx="80" cy="80" r="65" className="ring-value" pathLength="100" strokeDasharray={`${percent} 100`}/></svg><div><strong>{percent}<span> %</span></strong><small>{tr("Karten gewusst")}</small></div></div><dl className="progress-metrics"><div><dt>{tr("Gewusste Karten")}</dt><dd>{known}<span> / {availableCards.length}</span></dd></div><div><dt>{tr("Noch \u00FCben")}</dt><dd>{count(difficult, 'cards')}</dd></div><div><dt>{tr("Quizversuche")}</dt><dd>{progress.quizResults.length}</dd></div></dl></div><p className="panel-footnote">{persistenceEnabled ? tr('Fortschritt wird nur in diesem Browser gespeichert.') : tr('Fortschritt bleibt bis zum Neuladen erhalten. Dauerhafte Speicherung kannst du freiwillig aktivieren.')}</p></section>
    <section className="dashboard-panel glass"><div className="panel-heading"><h2><CalendarDays size={22}/>{tr("N\u00E4chste Termine")}</h2><Link to="/klasse" className="icon-button" aria-label={tr("Alle Klassentermine anzeigen")}><ArrowUpRight size={18}/></Link></div><ClassEvents limit={3}/></section></div>
    <section className="recent-section"><SectionHeading title={tr("Zuletzt hinzugefügt")} to="/materialien" link={tr("Alle Materialien")}/><div className="recent-materials">{latest.map(m => <MaterialCard material={m} key={m.id}/>)}</div></section>
  </div>;
}
