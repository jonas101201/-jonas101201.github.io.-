import { lazy, Suspense, type ReactNode } from 'react';
import { useCompanionVisibility } from '../../theme/preferences';
import { useProgressionConsent } from './useProgressionConsent';

const Companion = lazy(() => import('./CompanionPlacement').then(module => ({ default: module.CompanionPlacement })));

export function ActiveCompanion({ context, encouraging, fallback, children }: { context: 'home' | 'completion'; encouraging?: boolean; fallback?: ReactNode; children?: ReactNode }) {
  const enabled = useProgressionConsent();
  const [visible] = useCompanionVisibility();
  return enabled && visible ? <Suspense fallback={fallback}><Companion context={context} encouraging={encouraging} fallback={fallback}>{children}</Companion></Suspense> : fallback;
}
