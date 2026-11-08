import { ACTIVITY_KEY, addActivity, readActivity, writeActivity, type Activity } from '../features/activity/storage';
import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { emptyProgress, type LearningProgress, type QuizResult } from '../types/progress';
import { writeProgress, STORAGE_KEY } from '../utils/storage';
import { CONSENT_KEY, hasActivityConsent, readConsentedProgress, grantProgressStorage, revokeProgressStorage } from '../utils/privacyStorage';
interface ProgressContextValue {
  activityPersistenceEnabled: boolean; activities: Activity[]; activityWarning: string | null; trackActivity: (to: string) => void;
  progress: LearningProgress; warning: string | null; persistenceEnabled: boolean;
  enablePersistence: () => void; disablePersistence: () => void;
  saveQuiz: (result: QuizResult) => void;
  markCard: (setId: string, cardId: string, status: 'known' | 'difficult') => void;
  reset: () => void;
}
// Shared state keeps statistics in sync across routes.
// eslint-disable-next-line react-refresh/only-export-components
export const ProgressContext = createContext<ProgressContextValue | null>(null);
function initial() {
  try { const saved = readConsentedProgress(window.localStorage); return { ...saved, activityPersistenceEnabled: hasActivityConsent(window.localStorage), ...readActivity(window.localStorage, saved.persistenceEnabled && hasActivityConsent(window.localStorage)) }; } catch { return { activityPersistenceEnabled: false, activities: [] as Activity[], activityWritable: false, activityWarning: null, progress: emptyProgress(), warning: 'Lokaler Speicher ist nicht verfügbar. Du kannst ohne Speicherung weiterlernen.', persistenceEnabled: false }; }
}
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState(initial);
  const current = useRef(snapshot);
  const update = useCallback((change: (p: LearningProgress) => LearningProgress, force = false) => {
    const previous = current.current;
    const progress = change(previous.progress);
    let warning = previous.warning;
    if (previous.persistenceEnabled && (!warning || force)) {
      try { warning = writeProgress(window.localStorage, progress) ? null : 'Speichern fehlgeschlagen. Dein Fortschritt bleibt für diese Sitzung erhalten.'; }
      catch { warning = 'Speichern fehlgeschlagen. Dein Fortschritt bleibt für diese Sitzung erhalten.'; }
    }
    current.current = { ...previous, progress, warning }; setSnapshot(current.current);
  }, []);
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key === ACTIVITY_KEY) {
        // A history change must never reload unrelated progress from disk: a
        // failed write may have left the only current results in this tab.
        if (!current.current.activityPersistenceEnabled) return;
        const activity = readActivity({ getItem: key => window.localStorage.getItem(key) }, true);
        current.current = { ...current.current, ...activity };
      } else if (e.key === STORAGE_KEY || e.key === CONSENT_KEY || e.key === null) {
        current.current = initial();
      } else return;
      setSnapshot(current.current);
    };
    window.addEventListener('storage', sync); return () => window.removeEventListener('storage', sync);
  }, []);
  return <ProgressContext.Provider value={{ ...snapshot,
    trackActivity: to => {
      const previous = current.current;
      const activities = addActivity(previous.activities, to);
      let activityWarning = previous.activityWarning;
      if (previous.activityPersistenceEnabled && previous.activityWritable) {
        try { if (!writeActivity(window.localStorage, activities)) activityWarning = 'Der Aktivitätsverlauf bleibt nur in dieser Sitzung erhalten; Speichern fehlgeschlagen.'; }
        catch { activityWarning = 'Der Aktivitätsverlauf bleibt nur in dieser Sitzung erhalten; Speichern fehlgeschlagen.'; }
      }
      current.current = { ...previous, activities, activityWarning }; setSnapshot(current.current);
    },
    enablePersistence: () => {
      try {
        if (!grantProgressStorage(window.localStorage)) throw new Error('blocked');
        const saved = readConsentedProgress(window.localStorage);
        const progress = current.current.progress.quizResults.length || Object.keys(current.current.progress.cards).length ? current.current.progress : saved.progress;
        const activity = readActivity(window.localStorage, true);
        const activities = current.current.activities.length ? current.current.activities : activity.activities;
        if (activity.activityWritable && !writeActivity(window.localStorage, activities)) activity.activityWarning = 'Der Aktivitätsverlauf konnte nicht gespeichert werden.';
        current.current = { ...saved, ...activity, activities, progress, activityPersistenceEnabled: true };
        setSnapshot(current.current);
        update(p => p);
      } catch {
        current.current = { ...current.current, persistenceEnabled: false, activityPersistenceEnabled: false, warning: 'Dauerhafte Speicherung konnte nicht aktiviert werden. Du kannst weiterlernen.' };
        setSnapshot(current.current);
      }
    },
    disablePersistence: () => {
      let deleted = false;
      try { deleted = revokeProgressStorage(window.localStorage); } catch { /* browser blocks storage */ }
      current.current = { activityPersistenceEnabled: false, activities: [], activityWritable: true, activityWarning: null, progress: emptyProgress(), persistenceEnabled: false, warning: deleted ? null : 'Speicherung ist ausgeschaltet. Bereits gespeicherte Daten konnten nicht vollständig gelöscht werden; bitte lösche die Website-Daten im Browser.' };
      setSnapshot(current.current);
    },
    saveQuiz: result => update(p => ({ ...p, quizResults: [...p.quizResults, result].slice(-200) })),
    markCard: (set, card, status) => update(p => ({ ...p, cards: { ...p.cards, [`${set}:${card}`]: { status, reviews: (p.cards[`${set}:${card}`]?.reviews ?? 0) + 1, updatedAt: new Date().toISOString() } } })),
    reset: () => {
      let activityWarning = null;
      try { window.localStorage.removeItem(ACTIVITY_KEY); } catch { activityWarning = 'Bitte lösche den Aktivitätsverlauf über die Website-Daten deines Browsers.'; }
      current.current = { ...current.current, activities: [], activityWritable: !activityWarning, activityWarning };
      if (!current.current.persistenceEnabled) {
        try { window.localStorage.removeItem(STORAGE_KEY); }
        catch { current.current = { ...current.current, warning: 'Bitte lösche vorhandene Lerndaten über die Website-Daten deines Browsers.' }; }
      }
      update(emptyProgress, true);
    },
  }}>{children}</ProgressContext.Provider>;
}
