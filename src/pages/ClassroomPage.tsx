import { useI18n } from "../i18n/context";
import { BookOpen, CalendarDays, School, Users } from 'lucide-react';
import { PageHeading } from '../components/ui';
import { classroom } from '../features/classroom/config';
import { ClassEvents } from '../features/classroom/ClassEvents';
import { catalog } from '../data/catalog';
import { Link } from 'react-router-dom';
export function ClassroomPage() {
    const { tr } = useI18n();
    return <><PageHeading eyebrow={tr(classroom.program)} title={tr("Klasse {0}", [classroom.name])} description={tr("Fächer, Unterrichtsmaterialien und gemeinsame Termine.")}/><div className="classroom-grid"><section className="glass classroom-info"><Users size={27}/><h2>{classroom.name}</h2><p>{tr(classroom.program)}</p>{classroom.school && <p><School size={17}/>{classroom.school}</p>}<dl><div><dt>{tr("F\u00E4cher")}</dt><dd>{catalog.subjects.length}</dd></div><div><dt>{tr("Materialien")}</dt><dd>{catalog.materials.length}</dd></div></dl><p className="muted">{tr("Hier findet ihr eure bereitgestellten Unterrichtsmaterialien und die dazugeh\u00F6rigen Lerninhalte. Die Bezeichnungen der BK-Lernfelder sind noch vorl\u00E4ufig.")}</p><Link className="text-link" to="/materialien"><BookOpen size={16}/>{tr("Unterrichtsmaterialien \u00F6ffnen")}</Link></section><section className="glass dashboard-panel"><div className="panel-heading"><h2><CalendarDays size={22}/>{tr("Termine der Klasse")}</h2></div><ClassEvents /></section></div></>;
}
