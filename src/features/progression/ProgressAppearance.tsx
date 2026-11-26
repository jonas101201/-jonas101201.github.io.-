import { lazy, Suspense } from 'react';
import { useProgressionConsent } from './useProgressionConsent';

const Surface = lazy(() => import('./CosmeticSurface').then(module => ({ default: module.CosmeticSurface })));

export function ProgressAppearance({ preview = false }: { preview?: boolean | 'studio' }) {
  const enabled = useProgressionConsent();
  return enabled || preview ? <Suspense fallback={null}><Surface preview={preview}/></Suspense> : null;
}
