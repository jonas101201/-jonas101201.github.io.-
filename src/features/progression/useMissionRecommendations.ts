import { useMemo } from 'react';
import { useProgress } from '../../hooks/useProgress';
import { useI18n } from '../../i18n/context';
import { buildSearchIndex } from '../search';
import type { State } from './engine';
import { recommendMissions } from './missions';

export function useMissionRecommendations(state: State, enabled = true) {
  const { activities } = useProgress();
  const { tr, language } = useI18n();
  return useMemo(() => {
    if (!enabled) return [];
    const index = buildSearchIndex(tr, language);
    const recentField = activities.map(activity => index.find(entry => entry.to === activity.to)?.learningFieldId).find(Boolean);
    return recommendMissions(state, new Date().toISOString(), recentField);
  }, [activities, enabled, language, state, tr]);
}
