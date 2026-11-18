export interface SpringState { x: number; velocity: number }
/** Bounded resistance outside a control's range; ordinary motion stays 1:1. */
export function rubberBand(value: number, min: number, max: number, limit = 4) {
  const edge = Math.max(min, Math.min(max, value));
  const excess = value - edge;
  return edge + Math.sign(excess) * limit * (1 - Math.exp(-Math.abs(excess) / 35));
}
/** Small integration steps keep 30/60/120 Hz release behavior consistent. */
export function advanceSpring(state: SpringState, target: number, seconds: number): SpringState {
  let { x, velocity } = state;
  const count = Math.max(1, Math.ceil(Math.min(seconds, .05) / (1 / 120)));
  const dt = Math.min(seconds, .05) / count;
  for (let i = 0; i < count; i++) {
    velocity += ((target - x) * 430 - velocity * 29) * dt;
    x += velocity * dt;
  }
  return { x, velocity };
}
