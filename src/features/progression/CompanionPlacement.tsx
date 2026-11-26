import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/context';
import { CompanionVisual } from './Companion';
import { companionProgress, companions } from './companions';
import { useProgression } from './store';
import './companion-placement.css';

export function CompanionPlacement({ context }: { context: 'home' | 'completion' }) {
  const { tr } = useI18n();
  const { enabled, state } = useProgression();
  const [reaction, setReaction] = useState(context === 'completion');
  const [fits, setFits] = useState(context !== 'home');
  const button = useRef<HTMLButtonElement>(null);
  const timeout = useRef<number>(0);
  const character = companions.find(item => item.id === state.activeCompanion);
  const development = character && companionProgress(state, character.id);

  useEffect(() => () => window.clearTimeout(timeout.current), []);
  useEffect(() => {
    if (!reaction) return;
    const handle = window.setTimeout(() => setReaction(false), 1700);
    return () => window.clearTimeout(handle);
  }, [reaction]);

  useEffect(() => {
    if (context !== 'home' || !enabled) return;
    const root = button.current?.closest('.home-heading');
    const heading = root?.querySelector('h1');
    const date = root?.querySelector('.home-date');
    if (!root || !heading || !date) return;
    const fit = () => {
      const dateBox = date.getBoundingClientRect();
      if (button.current) button.current.style.insetInlineEnd = (root.getBoundingClientRect().right - dateBox.left + 6) + 'px';
      setFits(dateBox.left - heading.getBoundingClientRect().right >= 56);
    };
    fit();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(fit) : undefined;
    for (const item of [root, heading, date]) observer?.observe(item);
    window.addEventListener('resize', fit);
    return () => { observer?.disconnect(); window.removeEventListener('resize', fit); };
  }, [context, enabled]);

  if (!enabled || !character || !development?.unlocked) return null;
  const label = tr('{0} · {1}', [character.name, development.stageName]);
  const look = state.equipped;
  if (context === 'home') {
    return <button type="button" ref={button} className="active-companion active-companion-home" data-fits={fits}
      title={label} aria-label={label} onClick={() => {
        window.clearTimeout(timeout.current);
        setReaction(false);
        timeout.current = window.setTimeout(() => setReaction(true), 20);
      }}>
      <CompanionVisual id={character.id} stage={development.stage} look={look} motion={reaction ? 'greet' : 'idle'} interactive/>
    </button>;
  }
  return <div className="active-companion active-companion-completion" aria-hidden="true">
    <CompanionVisual id={character.id} stage={development.stage} look={look} motion={reaction ? 'celebrate' : 'still'} interactive/>
  </div>;
}
