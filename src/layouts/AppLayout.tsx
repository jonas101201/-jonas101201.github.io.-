import { CommandPalette } from '../features/search/CommandPalette';
import { buildSearchIndex } from '../features/search';
import { changeWithMotion } from '../utils/motion';
import { GlassFilters } from '../components/GlassFilters';
import { AsciiWaves } from '../components/AsciiWaves';
import { LanguageSwitcher } from '../i18n/LanguageSwitcher';
import { useI18n } from "../i18n/context";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { FileText, GraduationCap, Home, Layers, Pause, Menu, Search, Settings2, Sparkle, Users, X, Play, BookCopy, BookOpen } from 'lucide-react';
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
    const { tr, language } = useI18n();
    const shell = useRef<HTMLDivElement>(null);
    useEffect(() => { if (shell.current)
        return mountLiquidGlass(shell.current); }, []);
    const [menu, setMenu] = useState(false);
    const [backgroundPaused, setBackgroundPaused] = useState(false);
    const [palette, setPalette] = useState(false);
    const closePalette = useCallback(() => setPalette(false), []);
    const searchIndex = useMemo(() => buildSearchIndex(tr, language), [tr, language]);
    const location = useLocation();
    const { warning, activityWarning, persistenceEnabled, trackActivity } = useProgress();
    const main = useRef<HTMLElement>(null);
    const lastActivityPath = useRef('');
    const activityTracker = useRef(trackActivity);
    activityTracker.current = trackActivity;
    useEffect(() => {
        if (lastActivityPath.current === location.pathname) return;
        lastActivityPath.current = location.pathname;
        const entry = searchIndex.find(e => e.to === location.pathname && /^(material|sheet|quiz|cards):/.test(e.id));
        if (entry) activityTracker.current(entry.to);
    }, [location.pathname, searchIndex]);
    const restoreFocus = useRef(false);
    const trigger = useRef<HTMLButtonElement>(null);
    const sidebar = useRef<HTMLElement>(null);
    useEffect(() => {
        main.current?.focus();
        window.scrollTo(0, 0);
    }, [location.pathname]);
    useEffect(() => {
        const label = location.pathname === '/datenschutz' ? 'Datenschutz' : links.find(l => l.to !== '/' && location.pathname.startsWith(l.to))?.label ?? (location.pathname === '/' ? 'Übersicht' : 'Informationen');
        document.title = `${tr(label)} · ${classroom.name} · LernHub`;
    }, [location.pathname, tr]);
    useEffect(() => {
        function keys(e: KeyboardEvent) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && !e.repeat) {
                e.preventDefault();
                setMenu(false); setPalette(value => !value);
            }
            if (e.key === 'Escape' && menu) {
                restoreFocus.current = true;
                setMenu(false);
            }
            if (menu && e.key === 'Tab') {
                const elements = sidebar.current?.querySelectorAll<HTMLElement>('a,button');
                const first = elements?.[0];
                const last = elements?.[elements.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last?.focus();
                }
                else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first?.focus();
                }
            }
        }
        window.addEventListener('keydown', keys);
        return () => window.removeEventListener('keydown', keys);
    }, [menu]);
    useEffect(() => {
        if (!menu) {
            if (restoreFocus.current) {
                trigger.current?.focus();
                restoreFocus.current = false;
            }
            return;
        }
        const before = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        sidebar.current?.querySelector<HTMLElement>('button')?.focus();
        return () => { document.body.style.overflow = before; };
    }, [menu]);
    useEffect(() => {
        const media = window.matchMedia('(min-width: 821px)');
        const close = () => { if (media.matches)
            setMenu(false); };
        media.addEventListener('change', close);
        return () => media.removeEventListener('change', close);
    }, []);
    return <div ref={shell} className="app-shell">
    <GlassFilters/>
    {palette && <CommandPalette onClose={closePalette}/>}
    <AsciiWaves paused={backgroundPaused}/>
    <a href="#main-content" className="skip-link" onClick={e => { e.preventDefault(); main.current?.focus(); main.current?.scrollIntoView(); }}>{tr("Zum Inhalt springen")}</a>
    <div className={`nav-overlay ${menu ? 'is-open' : ''}`} aria-hidden="true" onClick={() => { restoreFocus.current = true; setMenu(false); }}/>
    <aside ref={sidebar} className={`sidebar ${menu ? 'is-open' : ''}`} aria-label={tr("Hauptnavigation")}>
      <Link to="/" className="brand" onClick={() => setMenu(false)}><Sparkle size={26} fill="currentColor" strokeWidth={1}/>Lern<span>Hub</span></Link>
      <button className="icon-button mobile-close" aria-label={tr("Menü schließen")} onClick={() => { restoreFocus.current = true; setMenu(false); }}><X /></button>
      <nav className="main-nav" aria-label="LernHub">{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenu(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''} ${to === '/klasse' ? 'class-nav-link' : ''}`}><Icon size={23} strokeWidth={1.7}/><span>{tr(label)}</span></NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-class"><span>{classroom.name}</span><small>{tr(classroom.program)}</small></div><NavLink to="/ueber" className="nav-link" onClick={() => setMenu(false)}><Settings2 size={21}/><span>{tr("Informationen & Speicher")}</span></NavLink></div>
    </aside>
    <div className="workspace" inert={menu}>
      <header className="topbar"><button ref={trigger} className="icon-button mobile-menu" aria-label={tr("Menü öffnen")} aria-expanded={menu} onClick={() => setMenu(true)}><Menu /></button><Link to="/" className="mobile-brand">Lern<span>Hub</span></Link>
        <button className="global-search command-trigger" aria-haspopup="dialog" onClick={() => setPalette(true)}><Search size={20}/><span>{tr('In LernHub suchen …')}</span><kbd>{typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : tr('Strg K')}</kbd></button>
        <button className="icon-button background-motion-toggle" aria-pressed={backgroundPaused} aria-label={tr(backgroundPaused ? 'Hintergrundanimation fortsetzen' : 'Hintergrundanimation pausieren')} title={tr(backgroundPaused ? 'Hintergrundanimation fortsetzen' : 'Hintergrundanimation pausieren')} onClick={() => changeWithMotion(() => setBackgroundPaused(value => !value))}><span className="motion-icon">{backgroundPaused ? <Play size={18}/> : <Pause size={18}/>}</span></button><LanguageSwitcher/><Link to="/klasse" className="class-button" aria-label={tr("Klasse {0} \u00F6ffnen", [classroom.name])}><Users size={21}/><span>{classroom.name}</span></Link>
      </header>
      <main id="main-content" tabIndex={-1} ref={main} className="main-content">{(warning || activityWarning) && <div role="status" className="notice warning">{tr(warning || activityWarning || undefined)} <Link to="/ueber">{tr("Speicher verwalten")}</Link></div>}<div key={location.pathname} className="page-enter"><Outlet /></div></main>
      <footer className="page-footer"><span>{tr("LernHub \u00B7 ")}{classroom.name}</span><div className="footer-links"><Link to="/datenschutz">{tr("Datenschutz")}</Link><Link to="/ueber">{persistenceEnabled ? tr('Speicher verwalten') : tr('Speicherung aktivieren')}</Link><Link to="/ueber">{tr("Informationen & Speicher")}</Link></div></footer>
    </div>
  </div>;
}
