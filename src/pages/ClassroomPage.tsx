import { BookOpen, CalendarDays, School, Users } from 'lucide-react';
import { PageHeading } from '../components/ui';
import { classroom } from '../features/classroom/config';
import { ClassEvents } from '../features/classroom/ClassEvents';
import { catalog } from '../data/catalog';
import { Link } from 'react-router-dom';
export function ClassroomPage() {
  return <><PageHeading eyebrow={classroom.program} title={`Klasse ${classroom.name}`} description="Fächer, Unterrichtsmaterialien und gemeinsame Termine."/><div className="classroom-grid"><section className="glass classroom-info"><Users size={27}/><h2>{classroom.name}</h2><p>{classroom.program}</p>{classroom.school && <p><School size={17}/>{classroom.school}</p>}<dl><div><dt>Fächer</dt><dd>{catalog.subjects.length}</dd></div><div><dt>Materialien</dt><dd>{catalog.materials.length}</dd></div></dl><p className="muted">Hier findet ihr eure bereitgestellten Unterrichtsmaterialien und die dazugehörigen Lerninhalte. Die Bezeichnungen der BK-Lernfelder sind noch vorläufig.</p><Link className="text-link" to="/materialien"><BookOpen size={16}/>Unterrichtsmaterialien öffnen</Link></section><section className="glass dashboard-panel"><div className="panel-heading"><h2><CalendarDays size={22}/>Termine der Klasse</h2></div><ClassEvents/></section></div></>;
}
