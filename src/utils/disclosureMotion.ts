import { cssTimeMilliseconds } from './liquidGlass';

/** Native details keep their semantics; this fills Safari's intrinsic-height gap. */
export function mountDisclosureMotion(root: HTMLElement) {
  if ((typeof CSS !== 'undefined' && CSS.supports?.('interpolate-size', 'allow-keywords')) || typeof HTMLElement.prototype.animate !== 'function') return () => {};
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Map<HTMLDetailsElement, { desired: boolean; animation: Animation; height: string; overflow: string }>();
  function finish(details: HTMLDetailsElement) {
    const entry = active.get(details);
    if (!entry) return;
    active.delete(details);
    if (!entry.desired && details.contains(document.activeElement)) details.querySelector('summary')?.focus({ preventScroll: true });
    details.open = entry.desired;
    details.style.height = entry.height; details.style.overflow = entry.overflow;
    entry.animation.cancel();
  }
  function click(event: MouseEvent) {
    if (event.defaultPrevented || motion.matches || event.button !== 0 || !(event.target instanceof Element)) return;
    const summary = event.target.closest('summary');
    const details = summary?.parentElement;
    if (!(details instanceof HTMLDetailsElement) || details.closest('[data-dock-replica],[inert]') || !root.contains(details)) return;
    if (event.target.closest('a,button,input,select,textarea')) return;
    event.preventDefault();
    const old = active.get(details), desired = !(old?.desired ?? details.open);
    const from = details.getBoundingClientRect().height;
    const height = old?.height ?? details.style.height, overflow = old?.overflow ?? details.style.overflow;
    active.delete(details); old?.animation.cancel();
    details.style.height = height;
    details.open = desired;
    const to = details.getBoundingClientRect().height;
    details.open = true; details.style.overflow = 'hidden';
    const style = getComputedStyle(root);
    const duration = cssTimeMilliseconds(style.getPropertyValue(desired ? '--motion-enter' : '--motion-exit'), desired ? 180 : 144);
    const animation = details.animate([{ height: `${from}px` },{ height: `${to}px` }], { duration, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
    const entry = { desired, animation, height, overflow }; active.set(details, entry);
    void animation.finished.then(() => { if (active.get(details) === entry) finish(details); }, () => {});
  }
  const reduced = () => { if (motion.matches) for (const details of active.keys()) finish(details); };
  root.addEventListener('click', click); motion.addEventListener('change', reduced);
  return () => { root.removeEventListener('click', click); motion.removeEventListener('change', reduced); for (const details of active.keys()) finish(details); };
}
