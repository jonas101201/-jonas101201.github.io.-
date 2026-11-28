import { useLayoutEffect, useRef, type RefObject } from 'react';
import type { Location, NavigationType } from 'react-router-dom';

export function useRouteScroll(location: Location, action: NavigationType, main: RefObject<HTMLElement | null>) {
  const positions = useRef(new Map<string, number>());
  const previous = useRef<Location | null>(null);
  useLayoutEffect(() => {
    const old = previous.current;
    const changedPage = old?.pathname !== location.pathname;
    const changesView = old && new URLSearchParams(old.search).get('bereich') !== new URLSearchParams(location.search).get('bereich');
    const restoreKey = action === 'POP' ? location.key : location.state?.restoreKey;
    const position = typeof restoreKey === 'string' ? positions.current.get(restoreKey) ?? 0
      : changedPage || changesView ? 0 : window.scrollY;
    previous.current = location;
    if (old && changedPage) main.current?.focus({ preventScroll: true });
    if (window.scrollY !== position || changedPage) window.scrollTo(0, position);
    const save = () => {
      const cache = positions.current;
      cache.delete(location.key);
      cache.set(location.key, window.scrollY);
      if (cache.size > 100) cache.delete(cache.keys().next().value!);
    };
    save();
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, [location, action, main]);

  useLayoutEffect(() => {
    const before = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => { window.history.scrollRestoration = before; };
  }, []);
}
