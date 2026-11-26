import { useLocation } from 'react-router-dom';

export interface ContentOrigin {
  from: string;
  fromIndex?: number;
  fromKey?: string;
}

export function useContentOrigin(): ContentOrigin {
  const { pathname, search, hash, key } = useLocation();
  const fromIndex = window.history.state?.idx;
  return { from: pathname + search + hash, fromIndex, fromKey: key };
}
