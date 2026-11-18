import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../i18n/context';
import { useSearchParams } from 'react-router-dom';
import { ContentLink, EmptyState, PageHeading } from '../components/ui';
import { buildSearchIndex, searchIndex } from '../features/search';
export function SearchPage() {
  const { tr, language } = useI18n();
  const [params, setParams] = useSearchParams();
  const q = params.get('q')?.trim() ?? '';
  const [query, setQuery] = useState(q);
  const [invalid, setInvalid] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  useEffect(() => { setQuery(q); setInvalid(false); }, [q]);
  const index = useMemo(() => buildSearchIndex(tr, language), [tr, language]);
  const results = q ? searchIndex(index, q) : [];
  return <><PageHeading eyebrow={tr('SUCHE')} title={q ? tr('Suchergebnisse für „{0}“', [q]) : tr('Was möchtest du lernen?')} description={tr('Durchsuche Unterrichtsmaterialien, Lernzettel, Quizze und Karteikarten.')}/>
    <form className="search-page-form" role="search" noValidate onSubmit={event => {
      event.preventDefault();
      if (!query.trim()) {
        setInvalid(true); field.current?.focus({ preventScroll: true });
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) { field.current?.getAnimations?.().forEach(animation => animation.cancel()); field.current?.animate?.([{ translate: '0' },{ translate: '-3px' },{ translate: '3px' },{ translate: '-2px' },{ translate: '0' }],{ duration: 180, easing: 'ease-out' }); }
        return;
      }
      setInvalid(false); setParams({ q: query.trim() });
    }}><input ref={field} aria-label={tr('Suchbegriff')} name="q" value={query} onChange={event => { setQuery(event.target.value); setInvalid(false); }} aria-invalid={invalid || undefined} aria-describedby={invalid ? 'search-input-error' : undefined} placeholder={tr('Zum Beispiel: Spielformen')}/><button className="button primary">{tr('Suchen')}</button></form>
    {invalid && <p id="search-input-error" className="input-error" role="alert">{tr('Gib oben einen Begriff ein.')}</p>}
    {!results.length ? <EmptyState title={q ? tr('Keine Treffer') : tr('Suchbegriff eingeben')}>{q ? tr('Versuche einen anderen Begriff, etwa „Spiel“ oder „Kommunikation“.') : tr('Gib oben einen Begriff ein.')}</EmptyState> : <><p className="result-count" role="status">{results.length} {tr('Treffer')}</p><div className="search-results">{results.map(result => <ContentLink key={result.id} to={result.to} title={result.title} kind={result.kind}/>)}</div></>}
  </>;
}
