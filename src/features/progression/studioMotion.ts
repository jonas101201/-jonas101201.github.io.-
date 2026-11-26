import { useEffect, useState } from 'react';
import { useBackgroundPreference } from '../../theme/preferences';

export function useStudioMotionPaused() {
  const [paused] = useBackgroundPreference();
  const [visible, setVisible] = useState(() => !document.hidden);
  const [reduced, setReduced] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  useEffect(() => {
    const sync = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media) return;
    const sync = () => setReduced(media.matches);
    media.addEventListener?.('change', sync);
    sync();
    return () => media.removeEventListener?.('change', sync);
  }, []);
  return paused || reduced || !visible;
}

export function useCompanionGreeting(playOnMount = false) {
  const [greeting, setGreeting] = useState(playOnMount ? 1 : 0);
  useEffect(() => {
    if (!greeting) return;
    const handle = window.setTimeout(() => setGreeting(0), 1800);
    return () => window.clearTimeout(handle);
  }, [greeting]);
  return [greeting, () => setGreeting(previous => previous + 1)] as const;
}
