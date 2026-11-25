import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { BookOpen, CalendarDays, Database, Home, MoreHorizontal, Search, Settings2, ShieldCheck, Users, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/context';
import { primaryArea } from '../utils/navigation';
import { useDockSelection } from '../features/dock/useDockSelection';

const moreLinks = [
  { to: '/klasse', label: 'Klasse', Icon: Users },
  { to: '/ueber', label: 'Informationen', Icon: Settings2 },
  { to: '/speicher', label: 'Speicher', Icon: Database },
  { to: '/datenschutz', label: 'Datenschutz', Icon: ShieldCheck },
];
export function MobileDock({ searchOpen }: { searchOpen: boolean }) {
  const { tr } = useI18n();
  const { pathname } = useLocation();
  const shell = useRef<HTMLDivElement>(null);
  const nav = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const id = `dock-more-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const area = primaryArea(pathname);
  const selectedIndex = searchOpen ? 2 : open ? 4 : area;
  const labels = [tr('Start'), tr('Lernen'), tr('Suche'), tr('Termine'), tr('Mehr')];
  const selection = useDockSelection(nav, selectedIndex, index => {
    if (index === 4) setOpen(true);
    else {
      setOpen(false);
      navigate(['/', '/lernen', '/suche', '/termine'][index]!);
    }
  }, 5);
  function close(restore = false) { setOpen(false); if (restore) trigger.current?.focus(); }
  useLayoutEffect(() => {
    if (!open || !panel.current || !shell.current) return;
    const place = () => {
      const rect = shell.current!.getBoundingClientRect();
      const viewport = window.visualViewport;
      const above = rect.top - (viewport?.offsetTop ?? 0) - 24;
      const below = (viewport?.offsetTop ?? 0) + (viewport?.height ?? innerHeight) - rect.bottom - 24;
      const belowDock = above < Math.min(420, panel.current!.scrollHeight) && below > above;
      panel.current!.dataset.placement = belowDock ? 'below' : 'above';
      panel.current!.style.setProperty('--dropup-max-height', `${Math.max(100, belowDock ? below : above)}px`);
    };
    place();
    panel.current.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    const element = shell.current;
    element.addEventListener('dockmove', place); window.addEventListener('resize', place);
    return () => { element.removeEventListener('dockmove', place); window.removeEventListener('resize', place); };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    function outside(event: Event) { if (event.target instanceof Node && !shell.current?.contains(event.target)) setOpen(false); }
    function keys(event: KeyboardEvent) { if (event.key === 'Escape') { event.preventDefault(); setOpen(false); trigger.current?.focus(); } }
    const desktop = window.matchMedia('(min-width: 821px)');
    const resize = () => { if (desktop.matches) setOpen(false); };
    document.addEventListener('pointerdown', outside); document.addEventListener('focusin', outside); document.addEventListener('keydown', keys);
    desktop.addEventListener('change', resize);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('focusin', outside); document.removeEventListener('keydown', keys); desktop.removeEventListener('change', resize); };
  }, [open]);
  return <div ref={shell} className="mobile-dock-shell">
    {open && <div ref={panel} id={id} className="dock-dropup" role="dialog" aria-label={tr('Weitere Bereiche')}>
      <header><h2>{tr('Mehr')}</h2><button className="icon-button" aria-label={tr('Zusatzmenü schließen')} onClick={() => close(true)}><X size={19}/></button></header>
      <nav aria-label={tr('Weitere Bereiche')}>{moreLinks.map(({ to, label, Icon }) => <Link to={to} key={to} onClick={() => close()}><Icon size={20} aria-hidden="true"/><span>{tr(label)}</span></Link>)}</nav>
    </div>}
    <nav ref={nav} className="mobile-dock mobile-dock-five" aria-label={tr('Schnellnavigation')} onDragStart={event => event.preventDefault()} {...selection.navProps}>
      <span className="dock-selection" role="slider" tabIndex={0} aria-label={tr('Navigationsregler')} aria-valuemin={0} aria-valuemax={4} aria-valuenow={selection.selected} aria-valuetext={labels[selection.selected]} onKeyDown={selection.onSliderKeyDown}/>
      <Link draggable={false} className={`dock-item ${selection.selected === 0 ? 'active' : ''}`} to="/" onClick={() => close()} aria-current={area === 0 ? 'page' : undefined}><Home size={24} aria-hidden="true"/><span>{tr('Start')}</span></Link>
      <Link draggable={false} className={`dock-item ${selection.selected === 1 ? 'active' : ''}`} to="/lernen" onClick={() => close()} aria-current={area === 1 ? (pathname === '/lernen' ? 'page' : 'location') : undefined}><BookOpen size={24} aria-hidden="true"/><span>{tr('Lernen')}</span></Link>
      <Link draggable={false} className={`dock-item ${selection.selected === 2 ? 'active' : ''}`} to="/suche" onClick={() => close()} aria-current={area === 2 ? 'page' : undefined}><Search size={24} aria-hidden="true"/><span>{tr('Suche')}</span></Link>
      <Link draggable={false} className={`dock-item ${selection.selected === 3 ? 'active' : ''}`} to="/termine" onClick={() => close()} aria-current={area === 3 ? (pathname === '/termine' ? 'page' : 'location') : undefined}><CalendarDays size={24} aria-hidden="true"/><span>{tr('Termine')}</span></Link>
      <button ref={trigger} className={`dock-item ${selection.selected === 4 ? 'active' : ''}`} aria-haspopup="dialog" aria-controls={id} aria-expanded={open} aria-current={area === 4 ? 'location' : undefined} onClick={() => setOpen(value => !value)}><MoreHorizontal size={24} aria-hidden="true"/><span>{tr('Mehr')}</span></button>
    </nav>
  </div>;
}
