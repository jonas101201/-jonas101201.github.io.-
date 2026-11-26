import { lazy, Suspense } from 'react';
import { useCompanionVisibility } from '../../theme/preferences';
import { useProgressionConsent } from './useProgressionConsent';

const Companion = lazy(() => import('./CompanionPlacement').then(module => ({ default: module.CompanionPlacement })));

export function ActiveCompanion({ context }: { context: 'home' | 'completion' }) {
  const enabled = useProgressionConsent();
  const [visible] = useCompanionVisibility();
  return enabled && visible ? <Suspense fallback={null}><Companion context={context}/></Suspense> : null;
}
