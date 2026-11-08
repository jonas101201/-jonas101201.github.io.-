// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { mountLiquidGlass } from '../src/utils/liquidGlass';
afterEach(() => { document.body.replaceChildren(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
it('keeps glass controls usable without animations under reduced motion and cancels running reveals when it changes', () => {
  let reduced = true;
  let changed = () => {};
  vi.stubGlobal('matchMedia', () => ({ get matches() { return reduced; }, addEventListener: (_: string, fn: () => void) => { changed = fn; }, removeEventListener: vi.fn() }));
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: Promise.resolve() } });
  const cancel = vi.fn();
  const animate = vi.fn(() => ({ cancel, finished: new Promise<void>(() => {}) }));
  Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: animate });
  const root = document.createElement('div');
  root.innerHTML = '<div class="material-list"><article>Material</article></div><button>Liste</button>';
  document.body.append(root);
  const dispose = mountLiquidGlass(root);
  expect(animate).not.toHaveBeenCalled(); expect(root.querySelector('button')?.dataset.liquid).toBe('control'); dispose();
  reduced = false;
  const disposeAnimated = mountLiquidGlass(root);
  expect(animate).toHaveBeenCalled(); reduced = true; changed(); expect(cancel).toHaveBeenCalled(); disposeAnimated();
});
