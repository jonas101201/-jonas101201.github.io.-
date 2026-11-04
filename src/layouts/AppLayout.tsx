import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FileText, GraduationCap, Home, Layers, Menu, Search, Settings2, Sparkle, Users, X, Play, BookCopy, BookOpen } from 'lucide-react';
import { useProgress } from '../hooks/useProgress';
import { classroom } from '../features/classroom/config';
import { mountLiquidGlass } from '../utils/liquidGlass';
const links = [
  { to: '/', label: 'Übersicht', icon: Home },
  { to: '/faecher', label: 'Fächer', icon: Layers },
  { to: '/materialien', label: 'Materialien', icon: FileText },
  { to: '/lernzettel', label: 'Lernzettel', icon: BookOpen },
  { to: '/quizze', label: 'Quizze', icon: Play },
  { to: '/karteikarten', label: 'Karteikarten', icon: BookCopy },
  { to: '/pruefungstraining', label: 'Prüfungstraining', icon: GraduationCap },
  { to: '/klasse', label: 'Klasse', icon: Users },
];
export function AppLayout() {
  const shell = useRef<HTMLDivElement>(null);
  useEffect(() => { if (shell.current) return mountLiquidGlass(shell.current); }, []);
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate(); const location = useLocation();
  const { warning } = useProgress();
  const main = useRef<HTMLElement>(null); const search = useRef<HTMLInputElement>(null);
  const restoreFocus = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null); const sidebar = useRef<HTMLElement>(null);
  useEffect(() => {
    main.current?.focus(); window.scrollTo(0, 0);
    const label = links.find(l => l.to !== '/' && location.pathname.startsWith(l.to))?.label ?? (location.pathname === '/' ? 'Übersicht' : 'Informationen');
    document.title = `${label} · ${classroom.name} · LernHub`;
  }, [location.pathname]);
  useEffect(() => {
    function keys(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); search.current?.focus(); }
      if (e.key === 'Escape' && menu) { restoreFocus.current = true; setMenu(false); }
      if (menu && e.key === 'Tab') {
        const elements = sidebar.current?.querySelectorAll<HTMLElement>('a,button');
        const first = elements?.[0]; const last = elements?.[elements.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }
    window.addEventListener('keydown', keys); return () => window.removeEventListener('keydown', keys);
  }, [menu]);
  useEffect(() => {
    if (!menu) {
      if (restoreFocus.current) { trigger.current?.focus(); restoreFocus.current = false; }
      return;
    }
    const before = document.body.style.overflow; document.body.style.overflow = 'hidden';
    sidebar.current?.querySelector<HTMLElement>('button')?.focus();
    return () => { document.body.style.overflow = before; };
  }, [menu]);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 821px)');
    const close = () => { if (media.matches) setMenu(false); };
    media.addEventListener('change', close); return () => media.removeEventListener('change', close);
  }, []);
  return <div ref={shell} className="app-shell">
    <a href="#main-content" className="skip-link" onClick={e => {e.preventDefault();main.current?.focus();main.current?.scrollIntoView();}}>Zum Inhalt springen</a>
    {menu && <div className="nav-overlay" onClick={() => {restoreFocus.current = true; setMenu(false);}}/>}
    <aside ref={sidebar} className={`sidebar ${menu ? 'is-open' : ''}`} aria-label="Hauptnavigation">
      <Link to="/" className="brand" onClick={() => setMenu(false)}><Sparkle size={26} fill="currentColor" strokeWidth={1}/>Lern<span>Hub</span></Link>
      <button className="icon-button mobile-close" aria-label="Menü schließen" onClick={() => {restoreFocus.current = true; setMenu(false);}}><X/></button>
      <nav className="main-nav" aria-label="LernHub">{links.map(({to,label,icon:Icon}) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenu(false)} className={({isActive}) => `nav-link ${isActive ? 'active' : ''} ${to === '/klasse' ? 'class-nav-link' : ''}`}><Icon size={23} strokeWidth={1.7}/><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-class"><span>{classroom.name}</span><small>{classroom.program}</small></div><NavLink to="/ueber" className="nav-link" onClick={() => setMenu(false)}><Settings2 size={21}/><span>Informationen & Speicher</span></NavLink></div>
    </aside>
    <div className="workspace" inert={menu}>
      <header className="topbar"><button ref={trigger} className="icon-button mobile-menu" aria-label="Menü öffnen" aria-expanded={menu} onClick={() => setMenu(true)}><Menu/></button><Link to="/" className="mobile-brand">Lern<span>Hub</span></Link>
        <form className="global-search" role="search" onSubmit={e => {e.preventDefault();navigate(`/suche?q=${encodeURIComponent(query)}`);}}><Search size={20}/><input ref={search} aria-label="LernHub durchsuchen" placeholder="In LernHub suchen …" value={query} onChange={e => setQuery(e.target.value)}/><kbd>Strg K</kbd></form>
        <Link to="/klasse" className="class-button" aria-label={`Klasse ${classroom.name} öffnen`}><Users size={21}/><span>{classroom.name}</span></Link>
      </header>
      <main id="main-content" tabIndex={-1} ref={main} className="main-content">{warning && <div role="status" className="notice warning">{warning} <Link to="/ueber">Speicher verwalten</Link></div>}<Outlet/></main>
      <footer className="page-footer"><span>LernHub · {classroom.name}</span><Link to="/ueber">Datenschutz & Informationen</Link></footer>
    </div>
  </div>;
}
