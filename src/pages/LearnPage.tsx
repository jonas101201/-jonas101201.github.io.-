import { BookCopy, BookOpen, FolderOpen, GraduationCap, Sparkles, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeading, SubjectCard } from '../components/ui';
import { catalog } from '../data/catalog';
import { useI18n } from '../i18n/context';

const formats = [
  { to: '/materialien', label: 'Unterrichtsmaterialien', Icon: FolderOpen },
  { to: '/lernzettel', label: 'Lernzettel', Icon: BookOpen },
  { to: '/quizze', label: 'Quizze', Icon: Sparkles },
  { to: '/karteikarten', label: 'Karteikarten', Icon: BookCopy },
  { to: '/pruefungstraining', label: 'Prüfungstraining', Icon: GraduationCap },
];

export function LearnPage() {
  const { tr } = useI18n();
  return <>
    <PageHeading title={tr('Lernen')}/>
    <div className="learn-ways">
      <section className="glass dashboard-panel" aria-labelledby="learn-subjects">
        <div className="panel-heading"><h2 id="learn-subjects">{tr('Nach Fach lernen')}</h2></div>
        <div className="learn-shortcuts">{catalog.subjects.map(subject => <SubjectCard subject={subject} key={subject.id}/>)}</div>
      </section>
      <section className="glass dashboard-panel" aria-labelledby="learn-formats">
        <div className="panel-heading"><h2 id="learn-formats">{tr('Nach Lernformat lernen')}</h2></div>
        <div className="learn-shortcuts">{formats.map(({ to, label, Icon }) => <Link key={to} to={to} className="search-result glass"><Icon size={21} aria-hidden="true"/><span>{tr(label)}</span><ArrowUpRight size={16} aria-hidden="true"/></Link>)}</div>
      </section>
    </div>
  </>;
}
