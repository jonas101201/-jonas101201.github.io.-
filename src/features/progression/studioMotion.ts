import { useEffect, useState } from 'react';
import { useBackgroundPreference } from '../../theme/preferences';

export function useStudioMotionPaused() {
  const [paused] = useBackgroundPreference();
  const [visible, setVisible] = useState(() => !document.hidden);
  useEffect(() => {
    const sync = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);
  return paused || !visible;
}
