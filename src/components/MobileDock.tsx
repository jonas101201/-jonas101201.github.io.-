import { useRef } from 'react';
import { BookOpen, CalendarDays, Home, Search, ShoppingBag } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/context';
import { primaryArea } from '../utils/navigation';
import { useDockSelection } from '../features/dock/useDockSelection';

const destinations = [
  { to: '/', label: 'Start', Icon: Home },
  { to: '/lernen', label: 'Lernen', Icon: BookOpen },
  { to: '/suche', label: 'Suche', Icon: Search },
  { to: '/termine', label: 'Termine', Icon: CalendarDays },
  { to: '/fortschritt/store', label: 'Shop', Icon: ShoppingBag },
];

export function MobileDock({ searchOpen }: { searchOpen: boolean }) {
  const { tr } = useI18n();
  const { pathname } = useLocation();
  const nav = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const area = primaryArea(pathname);
  const selection = useDockSelection(nav, searchOpen ? 2 : area ?? 0, index => navigate(destinations[index]!.to), destinations.length);
  const hasArea = searchOpen || area !== undefined;

  return <div className="mobile-dock-shell">
    <nav ref={nav} className="mobile-dock mobile-dock-five" data-dock-inactive={!hasArea || undefined} aria-label={tr('Schnellnavigation')} onDragStart={event => event.preventDefault()} {...selection.navProps}>
      <span className="dock-selection" role="slider" tabIndex={0} aria-label={tr('Navigationsregler')} aria-valuemin={0} aria-valuemax={4} aria-valuenow={selection.selected} aria-valuetext={tr(destinations[selection.selected]?.label)} onKeyDown={selection.onSliderKeyDown}/>
      {destinations.map(({ to, label, Icon }, index) => <Link key={to} draggable={false}
        className={`dock-item ${hasArea && selection.selected === index ? 'active' : ''}`} to={to}
        aria-current={area === index ? (pathname === to ? 'page' : 'location') : undefined}>
        <Icon size={24} aria-hidden="true"/><span>{tr(label)}</span>
      </Link>)}
    </nav>
  </div>;
}
