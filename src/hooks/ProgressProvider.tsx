import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { emptyProgress, type LearningProgress, type QuizResult } from '../types/progress';
import { readProgress, writeProgress, STORAGE_KEY } from '../utils/storage';
interface ProgressContextValue {
  progress: LearningProgress; warning: string | null;
  saveQuiz: (result: QuizResult) => void;
  markCard: (setId: string, cardId: string, status: 'known' | 'difficult') => void;
  reset: () => void;
}
// Shared state keeps statistics in sync across routes.
// eslint-disable-next-line react-refresh/only-export-components
export const ProgressContext = createContext<ProgressContextValue | null>(null);
function initial() {
  try { return readProgress(window.localStorage); } catch { return { progress: emptyProgress(), warning: 'Lokaler Speicher ist nicht verfügbar. Du kannst ohne Speicherung weiterlernen.' }; }
}
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState(initial);
  const current = useRef(snapshot);
  const update = useCallback((change: (p: LearningProgress) => LearningProgress, force = false) => {
    const previous = current.current;
    const progress = change(previous.progress);
    let warning = previous.warning;
    if (!warning || force) {
      try { warning = writeProgress(window.localStorage, progress) ? null : 'Speichern fehlgeschlagen. Dein Fortschritt bleibt für diese Sitzung erhalten.'; }
      catch { warning = 'Speichern fehlgeschlagen. Dein Fortschritt bleibt für diese Sitzung erhalten.'; }
    }
    current.current = { progress, warning }; setSnapshot(current.current);
  }, []);
  useEffect(() => {
    const sync = (e: StorageEvent) => { if (e.key === STORAGE_KEY || e.key === null) { current.current = initial(); setSnapshot(current.current); } };
    window.addEventListener('storage', sync); return () => window.removeEventListener('storage', sync);
  }, []);
  return <ProgressContext.Provider value={{ ...snapshot,
    saveQuiz: result => update(p => ({ ...p, quizResults: [...p.quizResults, result].slice(-200) })),
    markCard: (set, card, status) => update(p => ({ ...p, cards: { ...p.cards, [`${set}:${card}`]: { status, reviews: (p.cards[`${set}:${card}`]?.reviews ?? 0) + 1, updatedAt: new Date().toISOString() } } })),
    reset: () => update(emptyProgress, true),
  }}>{children}</ProgressContext.Provider>;
}
