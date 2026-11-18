import { expect, it } from 'vitest';
import { advanceSpring, rubberBand } from '../src/features/dock/spring';
import { cssTimeMilliseconds } from '../src/utils/liquidGlass';

it('keeps production-minified seconds and source milliseconds at the same duration', () => {
  expect(cssTimeMilliseconds('.18s')).toBe(180);
  expect(cssTimeMilliseconds('180ms')).toBe(180);
  expect(cssTimeMilliseconds('0s')).toBe(0);
  expect(cssTimeMilliseconds('')).toBe(180);
});
it('preserves ordinary dragging while resisting both ends within a bounded range', () => {
  expect(rubberBand(45, 0, 100)).toBe(45);
  expect(rubberBand(-1000, 0, 100)).toBeGreaterThanOrEqual(-4);
  expect(rubberBand(-50, 0, 100)).toBeLessThan(0);
  expect(rubberBand(150, 0, 100)).toBeGreaterThan(100);
  expect(rubberBand(1000, 0, 100)).toBeLessThanOrEqual(104);
});
it('carries release velocity and settles consistently at different refresh rates', () => {
  expect(advanceSpring({ x: 20, velocity: 500 }, 100, 1/60).x).toBeGreaterThan(advanceSpring({ x: 20, velocity: 0 }, 100, 1/60).x);
  for (const hz of [30,60,120]) {
    let state = { x: 20, velocity: 500 };
    for (let i = 0; i < hz; i++) state = advanceSpring(state, 100, 1/hz);
    expect(Math.abs(state.x - 100)).toBeLessThan(.05);
    expect(Math.abs(state.velocity)).toBeLessThan(.5);
  }
});
