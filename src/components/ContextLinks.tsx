import { ArrowLeft } from 'lucide-react';
import { useContentOrigin, type ContentOrigin } from '../hooks/useContentOrigin';
import { Link, useLocation, useNavigate, type LinkProps } from 'react-router-dom';

export function ContentRouteLink(props: LinkProps) {
  const origin = useContentOrigin();
  return <Link {...props} state={origin}/>;
}

export function ContextBackLink({ to, children, originLabel, ...props }: Omit<LinkProps, 'to'> & { to: string; originLabel?: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const origin = location.state as ContentOrigin | null;
  const from = origin?.from;
  if (typeof from !== 'string' || !/^\/(?!\/|\\)/.test(from) || from === location.pathname + location.search) {
    return <Link {...props} to={to}>{children}</Link>;
  }
  const currentIndex = window.history.state?.idx;
  const distance = typeof currentIndex === 'number' && typeof origin?.fromIndex === 'number'
    ? currentIndex - origin.fromIndex : 0;
  return <Link {...props} to={from} state={{ restoreKey: origin?.fromKey }} onClick={event => {
    if (distance <= 0 || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(-distance);
  }}>{originLabel ? <><ArrowLeft size={16} aria-hidden="true"/>{originLabel}</> : children}</Link>;
}
