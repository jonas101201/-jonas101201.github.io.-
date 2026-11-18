import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { buildSearchIndex, commandSuggestions, moveSelection, searchIndex } from './index';
import { lockPageScroll } from '../../utils/scrollLock';
export function CommandPalette({ onClose, recentRoutes = [], anchor }: { anchor?: HTMLElement | null; onClose: () => void; recentRoutes?: readonly string[] }) {
  const { tr, language } = useI18n();
  const navigate = useNavigate();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const resultsRegion = useRef<HTMLDivElement>(null);
  const navigating = useRef(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const index = useMemo(() => buildSearchIndex(tr, language), [tr, language]);
  const results = useMemo(() => query.trim() ? searchIndex(index, query) : commandSuggestions(index, recentRoutes), [index, query, recentRoutes]);
  const active = Math.min(selected, Math.max(0, results.length - 1));
  useEffect(() => {
    const previous = anchor ?? document.activeElement;
    const element = dialog.current!;
    const unlock = lockPageScroll();
    element.showModal(); input.current?.focus({ preventScroll: true });
    if (previous instanceof HTMLElement && previous.matches('button,a')) {
      const source = previous.getBoundingClientRect(), bounds = element.getBoundingClientRect();
      element.style.setProperty('--search-origin-x', `${Math.max(0, Math.min(100, (source.left + source.width / 2 - bounds.left) / bounds.width * 100))}%`);
      element.style.setProperty('--search-origin-y', source.top > bounds.top + bounds.height / 2 ? '100%' : '0%');
    }
    const viewport = window.visualViewport;
    const fitViewport = () => {
      element.style.setProperty('--search-viewport-height', `${viewport?.height ?? window.innerHeight}px`);
      element.style.setProperty('--search-viewport-top', `${viewport?.offsetTop ?? 0}px`);
    };
    fitViewport();
    viewport?.addEventListener('resize', fitViewport);
    viewport?.addEventListener('scroll', fitViewport);
    window.addEventListener('resize', fitViewport);
    return () => {
      viewport?.removeEventListener('resize', fitViewport);
      viewport?.removeEventListener('scroll', fitViewport);
      window.removeEventListener('resize', fitViewport);
      element.close(); unlock(!navigating.current);
      if (!navigating.current && previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true });
    };
  }, [anchor]);
  useEffect(() => {
    const region = resultsRegion.current;
    const option = dialog.current?.querySelector(`#command-option-${active}`);
    if (!region || !option) return;
    const area = region.getBoundingClientRect(), item = option.getBoundingClientRect();
    if (item.top < area.top) region.scrollTop += item.top - area.top;
    else if (item.bottom > area.bottom) region.scrollTop += item.bottom - area.bottom;
  }, [active, results]);
  function choose(position: number) {
    const result = results[position];
    if (result) { navigating.current = true; onClose(); navigate(result.to); }
  }
  return <dialog ref={dialog} className="command-palette glass" aria-labelledby="command-title" onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === dialog.current) { const r = dialog.current.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose(); } }} onKeyDown={e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); e.stopPropagation(); onClose(); }
    if (e.key === 'Tab') { e.preventDefault(); (document.activeElement === input.current ? dialog.current?.querySelector<HTMLButtonElement>('button') : input.current)?.focus(); }
  }}>
    <div className="command-heading"><h2 id="command-title">{tr('LernHub durchsuchen')}</h2><button className="icon-button" aria-label={tr('Suche schließen')} onClick={onClose}><X size={20}/></button></div>
    <div className="command-input"><Search size={20}/><input ref={input} role="combobox" aria-label={tr('Suchbegriff')} aria-autocomplete="list" aria-expanded="true" aria-controls="command-results" aria-activedescendant={results.length ? `command-option-${active}` : undefined} aria-describedby="command-help" placeholder={tr('In LernHub suchen …')} value={query} onChange={e => { setQuery(e.target.value); setSelected(0); }} onKeyDown={e => {
      if (e.nativeEvent.isComposing) return;
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key) && (!['Home', 'End'].includes(e.key) || e.ctrlKey || e.metaKey)) { e.preventDefault(); setSelected(moveSelection(active, e.key, results.length)); }
      if (e.key === 'Enter') { e.preventDefault(); choose(active); }
    }}/></div>
    <div className="command-meta">{!query.trim() && <p className="muted command-count">{tr(recentRoutes.length ? 'Zuletzt besucht und Schnellzugriffe' : 'Schnellzugriffe')}</p>}
    <p role="status" className="muted command-count">{results.length} {tr('Treffer')}</p>
    </div><div ref={resultsRegion} className="command-results-region">
    <ul id="command-results" role="listbox" aria-label={tr('Suchergebnisse')} className="command-results">{results.map((result, i) => <li id={`command-option-${i}`} key={result.id} role="option" aria-selected={i === active} onPointerMove={e => { if (e.pointerType === 'mouse') setSelected(i); }} onMouseDown={e => e.preventDefault()} onClick={() => choose(i)}><span>{result.title}</span><small>{!query.trim() && recentRoutes.includes(result.to) ? `${tr('Zuletzt besucht')} · ` : ''}{result.kind}</small></li>)}</ul>
    {!results.length && <p className="empty-state">{tr('Keine Treffer')}</p>}
    </div>
    <p id="command-help" className="command-help muted">{tr('↑ ↓ auswählen · Eingabe öffnen · Esc schließen')}</p>
  </dialog>;
}
