import { BookOpen, Home, MoreHorizontal, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n/context';

export function MobileDock({ onSearch, onMore, menuOpen }: {
  onSearch: () => void;
  onMore: (button: HTMLButtonElement) => void;
  menuOpen: boolean;
}) {
  const { tr } = useI18n();
  const { pathname } = useLocation();
  const home = pathname === '/';
  const learning = /^\/(faecher|materialien|quizze|karteikarten|pruefungstraining)(\/|$)/.test(pathname);
  return <nav className="mobile-dock" aria-label={tr('Schnellnavigation')} inert={menuOpen}>
    <Link to="/" aria-current={home ? 'page' : undefined} className={home ? 'active' : ''}><Home size={24} aria-hidden="true"/><span>{tr('Start')}</span></Link>
    <Link to="/faecher" aria-current={pathname === '/faecher' ? 'page' : undefined} className={learning ? 'active' : ''}><BookOpen size={24} aria-hidden="true"/><span>{tr('Lernen')}</span></Link>
    <button aria-haspopup="dialog" onClick={onSearch}><Search size={24} aria-hidden="true"/><span>{tr('Suche')}</span></button>
    <button aria-controls="main-sidebar" aria-expanded={menuOpen} onClick={event => onMore(event.currentTarget)} className={!home && !learning ? 'active' : ''}><MoreHorizontal size={24} aria-hidden="true"/><span>{tr('Mehr')}</span></button>
  </nav>;
}
