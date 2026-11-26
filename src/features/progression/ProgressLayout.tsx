import { NavLink, Outlet } from 'react-router-dom';
import { useI18n } from '../../i18n/context';
import { PageHeading } from '../../components/ui';
import './progress.css';

const destinations = [
  { to: '/fortschritt', label: 'Übersicht' },
  { to: '/fortschritt/store', label: 'Reward Store' },
  { to: '/fortschritt/studio', label: 'LernHub Studio' },
  { to: '/fortschritt/begleiter', label: 'Lernbegleiter' },
  { to: '/fortschritt/speicher', label: 'Speicher' },
];

export function ProgressLayout() {
  const { tr } = useI18n();
  return <div className="hub-progress">
    <PageHeading title={tr('Fortschritt')} description={tr('Deine Lernziele, Belohnungen und Lernumgebung auf diesem Gerät.')}/>
    <nav className="segmented progress-nav" aria-label={tr('Fortschrittsbereiche')}>
      {destinations.map(({ to, label }) =>
        <NavLink end to={to} key={to} className={({isActive}) => 'button ' + (isActive ? 'primary' : 'secondary')}>{tr(label)}</NavLink>)}
    </nav>
    <Outlet/>
  </div>;
}
