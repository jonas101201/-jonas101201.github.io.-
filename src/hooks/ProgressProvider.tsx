import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { emptyProgress, type LearningProgress, type QuizResult } from '../types/progress';
import { writeProgress, STORAGE_KEY } from '../utils/storage';
import { CONSENT_KEY, readConsentedProgress, grantProgressStorage, revokeProgressStorage } from '../utils/privacyStorage';
interface ProgressContextValue {
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
  try { return readConsentedProgress(window.localStorage); } catch { return { progress: emptyProgress(), warning: 'Lokaler Speicher ist nicht verfügbar. Du kannst ohne Speicherung weiterlernen.', persistenceEnabled: false }; }
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
    current.current = { progress, warning, persistenceEnabled: previous.persistenceEnabled }; setSnapshot(current.current);
  }, []);
  useEffect(() => {
    const sync = (e: StorageEvent) => { if (e.key === STORAGE_KEY || e.key === CONSENT_KEY || e.key === null) { current.current = initial(); setSnapshot(current.current); } };
    window.addEventListener('storage', sync); return () => window.removeEventListener('storage', sync);
  }, []);
  return <ProgressContext.Provider value={{ ...snapshot,
    enablePersistence: () => {
      try {
        if (!grantProgressStorage(window.localStorage)) throw new Error('blocked');
        const saved = readConsentedProgress(window.localStorage);
        const progress = current.current.progress.quizResults.length || Object.keys(current.current.progress.cards).length ? current.current.progress : saved.progress;
        current.current = { ...saved, progress };
        setSnapshot(current.current);
        update(p => p);
      } catch {
        current.current = { ...current.current, persistenceEnabled: false, warning: 'Dauerhafte Speicherung konnte nicht aktiviert werden. Du kannst weiterlernen.' };
        setSnapshot(current.current);
      }
    },
    disablePersistence: () => {
      let deleted = false;
      try { deleted = revokeProgressStorage(window.localStorage); } catch { /* browser blocks storage */ }
      current.current = { progress: emptyProgress(), persistenceEnabled: false, warning: deleted ? null : 'Speicherung ist ausgeschaltet. Bereits gespeicherte Daten konnten nicht vollständig gelöscht werden; bitte lösche die Website-Daten im Browser.' };
      setSnapshot(current.current);
    },
    saveQuiz: result => update(p => ({ ...p, quizResults: [...p.quizResults, result].slice(-200) })),
    markCard: (set, card, status) => update(p => ({ ...p, cards: { ...p.cards, [`${set}:${card}`]: { status, reviews: (p.cards[`${set}:${card}`]?.reviews ?? 0) + 1, updatedAt: new Date().toISOString() } } })),
    reset: () => {
      if (!current.current.persistenceEnabled) {
        try { window.localStorage.removeItem(STORAGE_KEY); }
        catch { current.current = { ...current.current, warning: 'Bitte lösche vorhandene Lerndaten über die Website-Daten deines Browsers.' }; }
      }
      update(emptyProgress, true);
    },
  }}>{children}</ProgressContext.Provider>;
}
