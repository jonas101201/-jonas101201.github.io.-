import { flushSync } from 'react-dom';

let activeTransition: ViewTransition | undefined;
let releaseActiveSource: (() => void) | undefined;

/** Keep both visual states during the swap; React owns the single accessible state. */
export function changeWithMotion(update: () => void, options: { direction?: 'forward' | 'backward' | 'flip'; source?: HTMLElement; shared?: string } = {}) {
  activeTransition?.skipTransition();
  releaseActiveSource?.(); releaseActiveSource = undefined;
  const root = document.documentElement;
  delete root.dataset.learningDirection;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !document.startViewTransition) {
    update();
    return;
  }
  if (options.direction) root.dataset.learningDirection = options.direction;
  const oldName = options.source?.style.viewTransitionName ?? '';
  if (options.source && options.shared) options.source.style.viewTransitionName = options.shared;
  let ownsSource = true;
  const releaseSource = () => { if (ownsSource && options.source) options.source.style.viewTransitionName = oldName; ownsSource = false; };
  releaseActiveSource = releaseSource;
  const transition = document.startViewTransition(() => {
    releaseSource();
    flushSync(update);
  });
  activeTransition = transition;
  // Skipping intentionally rejects ready; consume it without reporting a page error.
  void transition.ready.catch(() => {});
  // Clean up skipped transitions too; an older completion must not clear a newer one.
  const clear = () => {
    if (activeTransition !== transition) return;
    activeTransition = undefined; delete root.dataset.learningDirection;
    releaseSource(); releaseActiveSource = undefined;
  };
  void transition.finished.then(clear, clear);
}
