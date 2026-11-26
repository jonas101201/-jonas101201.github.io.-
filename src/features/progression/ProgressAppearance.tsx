import { lazy, Suspense } from 'react';
import { useProgressionConsent } from './useProgressionConsent';

const Surface = lazy(() => import('./CosmeticSurface').then(module => ({ default: module.CosmeticSurface })));

export function ProgressAppearance() {
  const enabled = useProgressionConsent();
  return enabled ? <Suspense fallback={null}><Surface/></Suspense> : null;
}
