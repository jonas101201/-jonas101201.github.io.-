import { expect, it } from 'vitest';
import { dockSelectionIndex } from '../src/features/dock/useDockSelection';
it('selects four dock destinations while clamping a drag outside the bar', () => {
  expect([-100, 10, 90, 170, 250, 600].map(x => dockSelectionIndex(x, 10, 320))).toEqual([0, 0, 1, 2, 3, 3]);
});
