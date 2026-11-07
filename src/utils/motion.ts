import { flushSync } from 'react-dom';

/** Keep both visual states during the swap; React owns the single accessible state. */
export function changeWithMotion(update: () => void) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !document.startViewTransition) {
    update();
    return;
  }
  document.startViewTransition(() => flushSync(update));
}
