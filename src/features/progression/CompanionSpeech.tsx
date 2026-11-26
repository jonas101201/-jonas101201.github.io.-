import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/context';
import { translateMissionTitle } from './missions';
import './companion-placement.css';

export function CompanionSpeech({ title, active = false }: { title: string; active?: boolean }) {
  const { tr } = useI18n();
  return <div className="companion-speech">
    <p>{tr(active ? 'Aktive Mission' : 'Mein Lernvorschlag')}</p>
    <strong>{translateMissionTitle(title, tr)}</strong>
    <Link className="text-link" to="/fortschritt#missionen">{tr('Lernmissionen')}</Link>
  </div>;
}
