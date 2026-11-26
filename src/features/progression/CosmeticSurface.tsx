import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useBackgroundPreference } from '../../theme/preferences';
import { compatibleLook, lookVariables, type Look } from './cosmetics';
import { useProgression } from './store';
import { enchantedGarden } from './worlds';
import './studio.css';
import './item-artwork.css';
import './worlds.css';
import './garden-clay.css';

export function CosmeticSurface({ preview = false }: { preview?: boolean | 'studio' }) {
  const { enabled: optedIn, state } = useProgression();
  const enabled = optedIn || preview;
  const [backgroundPaused] = useBackgroundPreference();
  const [temporary, setTemporary] = useState<Look>({});
  const [visible, setVisible] = useState(() => !document.hidden);
  const look = useMemo<Look>(() => preview === 'studio' ? temporary : preview ? enchantedGarden.look : compatibleLook(state.equipped, state.owned),
    [preview, state.equipped, state.owned, temporary]);

  useLayoutEffect(() => {
    if (preview !== 'studio') return;
    function receive(event: MessageEvent<unknown>) {
      const data = event.data;
      if (event.source !== window.parent || event.origin !== window.location.origin ||
          !data || typeof data !== 'object' || !('type' in data) || data.type !== 'lernhub-look-preview' ||
          !('look' in data) || !data.look || typeof data.look !== 'object' || Array.isArray(data.look)) return;
      const entries = Object.entries(data.look).filter((entry): entry is [string, string] => typeof entry[1] === 'string');
      setTemporary(compatibleLook(Object.fromEntries(entries)));
    }
    window.addEventListener('message', receive);
    window.parent.postMessage({ type: 'lernhub-look-ready' }, window.location.origin);
    return () => window.removeEventListener('message', receive);
  }, [preview]);
  const variables = useMemo(() => {
    // Living Garden supplies its own scoped Clay tokens.
    if (look.glass !== 'garden-clay') return lookVariables(look);
    return lookVariables({ ...look, glass: undefined });
  }, [look]);
  useEffect(() => {
    const sync = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);
  useLayoutEffect(() => {
    if (!enabled || !Object.keys(look).length) return;
    const root = document.documentElement;
    const entries = Object.entries(variables);
    for (const [name, value] of entries) root.style.setProperty(name, value);
    root.dataset.studio = '';
    if (look.glass === 'garden-clay') root.dataset.livingClay = look.glass;
    if (look.progress === 'garden-growth') root.dataset.gardenGrowth = '';
    if (look.environment === 'garden-fireflies') root.dataset.gardenFireflies = '';
    if (look.background) root.dataset.cosmeticScene = look.background;
    const parts = ['glass', 'accent', 'icons', 'logo', 'progress', 'navigation', 'celebration'] as const;
    for (const slot of parts) {
      const equipped = look[slot];
      if (equipped && !(slot === 'glass' && equipped === 'garden-clay')) root.setAttribute('data-studio-' + slot, slot === 'logo' || slot === 'glass' || slot === 'progress' ? equipped : '');
    }
    return () => {
      for (const [name] of entries) root.style.removeProperty(name);
      delete root.dataset.studio;
      delete root.dataset.livingClay;
      delete root.dataset.gardenFireflies;
      delete root.dataset.gardenGrowth;
      delete root.dataset.cosmeticScene;
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
