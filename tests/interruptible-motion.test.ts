// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { changeWithMotion } from '../src/utils/motion';

const original = document.startViewTransition;
afterEach(() => { Object.defineProperty(document, 'startViewTransition', { configurable: true, writable: true, value: original }); vi.unstubAllGlobals(); });

it('skips an unfinished transition before starting the next update and ignores older completions', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  const pending: { skipTransition: ReturnType<typeof vi.fn>; finish: () => void; finished: Promise<void> }[] = [];
  Object.defineProperty(document, 'startViewTransition', { configurable: true, writable: true, value: vi.fn((update: () => void) => {
    let finish = () => {};
    const finished = new Promise<void>(resolve => { finish = resolve; });
    const transition = { finished, ready: Promise.resolve(), finish, skipTransition: vi.fn() };
    pending.push(transition);
    if (typeof update === 'function') void update();
    return transition as unknown as ViewTransition;
  }) });
  const update = vi.fn();
  changeWithMotion(update); changeWithMotion(update);
  expect(pending[0]!.skipTransition).toHaveBeenCalledOnce();
  pending[0]!.finish(); await Promise.resolve();
  changeWithMotion(update);
  expect(pending[1]!.skipTransition).toHaveBeenCalledOnce();
  expect(update).toHaveBeenCalledTimes(3);
  pending[1]!.finish(); pending[2]!.finish(); await Promise.resolve();
});

it('updates immediately without browser transitions under reduced motion', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  const start = vi.fn();
  Object.defineProperty(document, 'startViewTransition', { configurable: true, writable: true, value: start });
  const update = vi.fn(); changeWithMotion(update);
  expect(update).toHaveBeenCalledOnce(); expect(start).not.toHaveBeenCalled();
});
