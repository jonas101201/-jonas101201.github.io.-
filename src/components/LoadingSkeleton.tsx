import { useI18n } from '../i18n/context';
export function LoadingSkeleton() {
  const { tr } = useI18n();
  return <div className="app-shell loading-shell" role="status" aria-label={tr('LernHub wird geladen')}><p>{tr('LernHub wird geladen …')}</p><div className="skeleton-heading skeleton" aria-hidden="true"/><div className="skeleton-grid" aria-hidden="true">{[0, 1, 2].map(i => <div key={i} className="skeleton-card glass"><div className="skeleton-line skeleton"/><div className="skeleton-line skeleton"/><div className="skeleton-block skeleton"/></div>)}</div></div>;
}
