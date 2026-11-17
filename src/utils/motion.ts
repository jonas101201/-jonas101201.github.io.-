import { flushSync } from 'react-dom';

let activeTransition: ViewTransition | undefined;

/** Keep both visual states during the swap; React owns the single accessible state. */
export function changeWithMotion(update: () => void) {
  activeTransition?.skipTransition();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !document.startViewTransition) {
    update();
    return;
  }
  const transition = document.startViewTransition(() => flushSync(update));
  activeTransition = transition;
  // Skipping intentionally rejects ready; consume it without reporting a page error.
  void transition.ready.catch(() => {});
  // Clean up skipped transitions too; an older completion must not clear a newer one.
  const clear = () => { if (activeTransition === transition) activeTransition = undefined; };
  void transition.finished.then(clear, clear);
}
