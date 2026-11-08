import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { buildSearchIndex, moveSelection, searchIndex } from './index';
export function CommandPalette({ onClose }: { onClose: () => void }) {
  const { tr, language } = useI18n();
  const navigate = useNavigate();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const index = useMemo(() => buildSearchIndex(tr, language), [tr, language]);
  const results = useMemo(() => searchIndex(index, query), [index, query]);
  const active = Math.min(selected, Math.max(0, results.length - 1));
  useEffect(() => {
    const previous = document.activeElement;
    const element = dialog.current!;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.showModal(); input.current?.focus();
    return () => { element.close(); document.body.style.overflow = overflow; if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); };
  }, []);
  useEffect(() => { dialog.current?.querySelector(`#command-option-${active}`)?.scrollIntoView({ block: 'nearest' }); }, [active]);
  function choose(position: number) {
    const result = results[position];
    if (result) { onClose(); navigate(result.to); }
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
    <p role="status" className="muted command-count">{results.length} {tr('Treffer')}</p>
    <ul id="command-results" role="listbox" aria-label={tr('Suchergebnisse')} className="command-results">{results.map((result, i) => <li id={`command-option-${i}`} key={result.id} role="option" aria-selected={i === active} onPointerMove={() => setSelected(i)} onMouseDown={e => e.preventDefault()} onClick={() => choose(i)}><span>{result.title}</span><small>{result.kind}</small></li>)}</ul>
    {!results.length && <p className="empty-state">{tr('Keine Treffer')}</p>}
    <p id="command-help" className="command-help muted">{tr('↑ ↓ auswählen · Eingabe öffnen · Esc schließen')}</p>
  </dialog>;
}
