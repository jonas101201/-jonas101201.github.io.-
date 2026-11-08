import { useMemo } from 'react';
import { useI18n } from '../i18n/context';
import { useSearchParams } from 'react-router-dom';
import { ContentLink, EmptyState, PageHeading } from '../components/ui';
import { buildSearchIndex, searchIndex } from '../features/search';
export function SearchPage() {
  const { tr, language } = useI18n();
  const [params] = useSearchParams();
  const q = params.get('q')?.trim() ?? '';
  const index = useMemo(() => buildSearchIndex(tr, language), [tr, language]);
  const results = q ? searchIndex(index, q) : [];
  return <><PageHeading eyebrow={tr('SUCHE')} title={q ? tr('Suchergebnisse für „{0}“', [q]) : tr('Was möchtest du lernen?')} description={tr('Durchsuche Unterrichtsmaterialien, Lernzettel, Quizze und Karteikarten.')}/>
    <form className="search-page-form" role="search"><input aria-label={tr('Suchbegriff')} name="q" defaultValue={q} placeholder={tr('Zum Beispiel: Spielformen')}/><button className="button primary">{tr('Suchen')}</button></form>
    {!results.length ? <EmptyState title={q ? tr('Keine Treffer') : tr('Suchbegriff eingeben')}>{q ? tr('Versuche einen anderen Begriff, etwa „Spiel“ oder „Kommunikation“.') : tr('Gib oben einen Begriff ein.')}</EmptyState> : <><p className="result-count" role="status">{results.length} {tr('Treffer')}</p><div className="search-results">{results.map(result => <ContentLink key={result.id} to={result.to} title={result.title} kind={result.kind}/>)}</div></>}
  </>;
}
