import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useI18n } from '../i18n/context';
import { breadcrumbsFor } from '../utils/navigation';
export function Breadcrumbs() {
  const { tr } = useI18n();
  const { pathname } = useLocation();
  const crumbs = useMemo(() => breadcrumbsFor(pathname), [pathname]);
  if (!crumbs.length) return null;
  return <nav className="breadcrumbs" aria-label={tr('Brotkrümelnavigation')}><ol>{crumbs.map((crumb, i) => <li key={crumb.to}>{i > 0 && <ChevronRight size={14} aria-hidden="true"/>}{i === crumbs.length - 1 ? <span aria-current="page">{tr(crumb.label)}</span> : <Link to={crumb.to}>{tr(crumb.label)}</Link>}</li>)}</ol></nav>;
}
