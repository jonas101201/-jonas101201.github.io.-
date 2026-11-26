import { useId, useState } from 'react';
import { BookCopy, BookOpen, ChevronDown, ChevronUp, PenLine, FolderOpen, GraduationCap, Sparkles, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatedDisclosure } from '../components/AnimatedDisclosure';
import { PageHeading, SubjectCard } from '../components/ui';
import { catalog } from '../data/catalog';
import { useI18n } from '../i18n/context';

const primarySubjects = catalog.subjects.filter(subject => subject.id === 'bk1' || subject.id === 'bk2');
const otherSubjects = catalog.subjects.filter(subject => subject.id !== 'bk1' && subject.id !== 'bk2');

const formats = [
  { to: '/materialien', label: 'Unterrichtsmaterialien', Icon: FolderOpen },
  { to: '/lernzettel', label: 'Lernzettel', Icon: BookOpen },
  { to: '/quizze', label: 'Quizze', Icon: Sparkles },
  { to: '/karteikarten', label: 'Karteikarten', Icon: BookCopy },
  { to: '/pruefungstraining', label: 'Prüfungstraining', Icon: GraduationCap },
  { to: '/blurting', label: 'Freier Wissensabruf', Icon: PenLine },
];

export function LearnPage() {
  const { tr } = useI18n();
  const [showOtherSubjects, setShowOtherSubjects] = useState(false);
  const otherSubjectsId = useId();
  return <>
    <PageHeading title={tr('Lernen')}/>
    <div className="learn-ways">
      <section className="glass dashboard-panel" aria-labelledby="learn-subjects">
        <div className="panel-heading"><h2 id="learn-subjects">{tr('Nach Fach lernen')}</h2></div>
        <div className="learn-shortcuts">
          {primarySubjects.map(subject => <SubjectCard subject={subject} key={subject.id}/>)}
          {otherSubjects.length > 0 && <div>
            <button type="button" className="button secondary learn-subject-toggle" aria-expanded={showOtherSubjects} aria-controls={otherSubjectsId} onClick={() => setShowOtherSubjects(open => !open)}>
              <span>{tr(showOtherSubjects ? 'Weitere Fächer ausblenden' : 'Weitere Fächer anzeigen')}</span>
              {showOtherSubjects ? <ChevronUp size={18} aria-hidden="true"/> : <ChevronDown size={18} aria-hidden="true"/>}
            </button>
            <AnimatedDisclosure open={showOtherSubjects} id={otherSubjectsId}>
              <div className="learn-shortcuts learn-other-subjects">
                {otherSubjects.map(subject => <SubjectCard subject={subject} key={subject.id}/>)}
              </div>
            </AnimatedDisclosure>
          </div>}
        </div>
      </section>
      <section className="glass dashboard-panel" aria-labelledby="learn-formats">
        <div className="panel-heading"><h2 id="learn-formats">{tr('Nach Lernformat lernen')}</h2></div>
        <div className="learn-shortcuts">{formats.map(({ to, label, Icon }) => <Link key={to} to={to} className="search-result glass"><Icon size={21} aria-hidden="true"/><span>{tr(label)}</span><ArrowUpRight size={16} aria-hidden="true"/></Link>)}</div>
      </section>
    </div>
  </>;
}
