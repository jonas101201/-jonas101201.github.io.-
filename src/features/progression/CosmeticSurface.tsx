import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useBackgroundPreference } from '../../theme/preferences';
import { compatibleLook, lookVariables } from './cosmetics';
import { useProgression } from './store';
import './studio.css';

export function CosmeticSurface() {
  const { enabled, state } = useProgression();
  const [backgroundPaused] = useBackgroundPreference();
  const [visible, setVisible] = useState(() => !document.hidden);
  const look = useMemo(() => compatibleLook(state.equipped, state.owned), [state.equipped, state.owned]);
  const variables = useMemo(() => lookVariables(look), [look]);
  useEffect(() => {
    const sync = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);
  useLayoutEffect(() => {
    if (!enabled || !Object.keys(variables).length) return;
    const root = document.documentElement;
    const entries = Object.entries(variables);
    for (const [name, value] of entries) root.style.setProperty(name, value);
    root.dataset.studio = '';
    const parts = ['glass', 'accent', 'icons', 'logo', 'progress', 'navigation', 'celebration'] as const;
    for (const slot of parts) {
      if (look[slot]) root.setAttribute('data-studio-' + slot, '');
    }
    return () => {
      for (const [name] of entries) root.style.removeProperty(name);
      delete root.dataset.studio;
      for (const slot of parts) root.removeAttribute('data-studio-' + slot);
    };
  }, [enabled, look, variables]);
  useLayoutEffect(() => {
    if (!enabled || (!backgroundPaused && visible)) return;
    const root = document.documentElement;
    root.dataset.studioPaused = '';
    return () => { delete root.dataset.studioPaused; };
  }, [enabled, backgroundPaused, visible]);
  return null;
}
