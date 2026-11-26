import { ProgressAppearance } from '../features/progression/ProgressAppearance';
import { LogoMark } from '../components/LogoMark';
import { MobileDock } from '../components/MobileDock';
import { TooltipLayer } from '../components/TooltipLayer';
import { mountDisclosureMotion } from '../utils/disclosureMotion';
import { ThemeToggle } from '../theme/ThemeToggle';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { canFocusRoute, isLearningSession } from '../utils/navigation';
import { CommandPalette } from '../features/search/CommandPalette';
import { buildSearchIndex } from '../features/search';
import { changeWithMotion } from '../utils/motion';
import { ClayBackground } from '../components/ClayBackground';
import { useBackgroundPreference } from '../theme/preferences';
import { useRouteScroll } from '../hooks/useRouteScroll';
import { useI18n } from "../i18n/context";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { BarChart3, CalendarDays, PenLine, FileText, GraduationCap, Home, Layers, Search, Settings, Settings2, Database, ShieldCheck, Users, Play, BookCopy, BookOpen, PanelLeftClose, PanelLeftOpen, Maximize, Minimize } from 'lucide-react';
import { useProgress } from '../hooks/useProgress';
import { classroom } from '../features/classroom/config';
const links = [
    { to: '/', label: 'Start', icon: Home },
    { to: '/faecher', label: 'Fächer', icon: Layers },
    { to: '/materialien', label: 'Unterrichtsmaterialien', icon: FileText },
    { to: '/lernzettel', label: 'Lernzettel', icon: BookOpen },
    { to: '/quizze', label: 'Quizze', icon: Play },
    { to: '/karteikarten', label: 'Karteikarten', icon: BookCopy },
    { to: '/pruefungstraining', label: 'Prüfungstraining', icon: GraduationCap },
    { to: '/termine', label: 'Termine', icon: CalendarDays },
    { to: '/klasse', label: 'Klasse', icon: Users },
    { to: '/ueber', label: 'Informationen', icon: Settings2 },
    { to: '/speicher', label: 'Speicher', icon: Database },
    { to: '/datenschutz', label: 'Datenschutz', icon: ShieldCheck },
];
const sidebarGroups = [
    { label: 'Übersicht', items: links.slice(0, 1) },
    { label: 'Lernen', items: [...links.slice(1, 7), { to: '/blurting', label: 'Freier Wissensabruf', icon: PenLine }] },
    { label: 'Organisation', items: [...links.slice(7, 9), { to: '/fortschritt', label: 'Fortschritt', icon: BarChart3 }] },
    { label: 'System', items: links.slice(9) },
];
export function AppLayout() {
    const { tr, language } = useI18n();
    const shell = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!shell.current) return;
        return mountDisclosureMotion(shell.current);
    }, []);
    const [collapsed, setCollapsed] = useState(false);
    const [focusPath, setFocusPath] = useState('');
    const [backgroundPaused] = useBackgroundPreference();
    const [palette, setPalette] = useState(false);
    const searchAnchor = useRef<HTMLElement | null>(null);
    const openSearch = useCallback((anchor?: HTMLElement) => { searchAnchor.current = anchor ?? null; setPalette(true); }, []);
    const closePalette = useCallback(() => setPalette(false), []);
    const searchIndex = useMemo(() => buildSearchIndex(tr, language), [tr, language]);
    const location = useLocation();
    const learning = canFocusRoute(location.pathname);
    const isHome = location.pathname === '/';
    const focusMode = learning && focusPath === location.pathname;
    const { activities, warning, activityWarning, persistenceEnabled, trackActivity } = useProgress();
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
    useRouteScroll(location, useNavigationType(), main);
    useLayoutEffect(() => { setFocusPath(''); setPalette(false); }, [location.pathname]);
    useEffect(() => {
        const label = sidebarGroups.flatMap(group => group.items).find(link => location.pathname === link.to || location.pathname.startsWith(link.to + '/'))?.label
          ?? ({ '/lernen': 'Lernen', '/suche': 'Suche', '/einstellungen': 'Einstellungen' }[location.pathname] || 'Informationen');
        document.title = [tr(label), classroom.name, 'LernHub'].join(' · ');
    }, [location.pathname, tr]);
    useEffect(() => {
        function keys(event: KeyboardEvent) {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !event.repeat && !event.defaultPrevented) {
                event.preventDefault();
                searchAnchor.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
                setPalette(value => !value);
            }
        }
        window.addEventListener('keydown', keys);
        return () => window.removeEventListener('keydown', keys);
    }, []);
    return <div ref={shell} className={`app-shell ${isHome ? 'home-route' : ''} ${focusMode ? '' : 'dock-enabled'} ${learning ? 'focus-capable' : ''} ${isLearningSession(location.pathname) ? 'learning-route' : ''} ${collapsed ? 'sidebar-collapsed' : ''} ${focusMode ? 'focus-mode' : ''}`}>
    <ProgressAppearance/>
    <div className="app-safe-area" aria-hidden="true"/>
    <TooltipLayer/>
    {palette && <CommandPalette anchor={searchAnchor.current} onClose={closePalette} recentRoutes={activities.map(a => a.to)}/>}
    <ClayBackground paused={backgroundPaused || focusMode}/>
    <a href="#main-content" className="skip-link" onClick={e => { e.preventDefault(); main.current?.focus(); main.current?.scrollIntoView(); }}>{tr("Zum Inhalt springen")}</a>
    <aside id="main-sidebar" className="sidebar" aria-label={tr('Hauptnavigation')}>
      <Link to="/" className="brand" aria-label="LernHub"><LogoMark/><span className="brand-wordmark">LernHub</span></Link>
      <nav className="main-nav" aria-label="LernHub">{sidebarGroups.map(({ label, items }) => (
        <div className="sidebar-group" key={label} role="group" aria-label={tr(label)}>
          <p className="sidebar-group-label muted" aria-hidden="true">{tr(label)}</p>
          {items.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} aria-label={tr(label)} title={collapsed ? tr(label) : undefined} end={to === '/'} className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}><Icon size={23} strokeWidth={1.7} aria-hidden="true"/><span>{tr(label)}</span></NavLink>)}
        </div>
      ))}</nav>
      <div className="sidebar-bottom"><div className="sidebar-class"><span>{classroom.name}</span><small>{tr(classroom.program)}</small></div></div>
    </aside>
    <div className="workspace">
      <header className="topbar">
        <Link className="home-mobile-brand" to="/" aria-label="LernHub"><LogoMark/><span className="brand-wordmark">LernHub</span></Link>
        <button className="icon-button desktop-sidebar-toggle" aria-controls="main-sidebar" aria-expanded={!collapsed} aria-label={tr(collapsed ? 'Seitenleiste ausklappen' : 'Seitenleiste einklappen')} onClick={() => changeWithMotion(() => setCollapsed(value => !value))}>{collapsed ? <PanelLeftOpen size={20}/> : <PanelLeftClose size={20}/>}</button>
        {learning && <button className="button secondary focus-toggle" aria-pressed={focusMode} aria-label={tr(focusMode ? 'Fokusmodus verlassen' : 'Fokusmodus aktivieren')} title={tr(focusMode ? 'Fokusmodus verlassen' : 'Fokusmodus aktivieren')} onClick={() => changeWithMotion(() => setFocusPath(focusMode ? '' : location.pathname))}>{focusMode ? <Minimize size={18} aria-hidden="true"/> : <Maximize size={18} aria-hidden="true"/>}<span>{tr(focusMode ? 'Fokusmodus verlassen' : 'Fokusmodus aktivieren')}</span></button>}
        <button className="global-search command-trigger" aria-label={tr('In LernHub suchen …')} aria-haspopup="dialog" onClick={event => openSearch(event.currentTarget)}><Search size={20}/><span>{tr('In LernHub suchen …')}</span><kbd>{typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : tr('Strg K')}</kbd></button>
        <div className="header-preferences"><ThemeToggle/><Link className="icon-button settings-link" to="/einstellungen" aria-label={tr('Einstellungen')} title={tr('Einstellungen')}><Settings size={20} aria-hidden="true"/></Link></div>
      </header>
      <main id="main-content" tabIndex={-1} ref={main} className="main-content">{(warning || activityWarning) && <div role="status" className="notice warning">{tr(warning || activityWarning || undefined)} <Link to="/speicher">{tr("Speicher verwalten")}</Link></div>}<Breadcrumbs/><div key={location.pathname} className="page-enter"><Outlet /></div></main>
      <footer className="page-footer"><span>{tr("LernHub \u00B7 ")}{classroom.name}</span><div className="footer-links"><Link to="/datenschutz">{tr("Datenschutz")}</Link><Link to="/speicher">{persistenceEnabled ? tr('Speicher verwalten') : tr('Speicherung aktivieren')}</Link><Link to="/ueber">{tr("Informationen & Speicher")}</Link></div></footer>
    </div>
    {!focusMode && <MobileDock searchOpen={palette}/>}
  </div>;
}
