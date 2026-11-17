// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { useDockSelection } from '../src/features/dock/useDockSelection';
beforeEach(() => { vi.stubGlobal('matchMedia', () => ({ matches: false })); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
function Harness({ select }: { select: (index: number) => void }) {
  const nav = useRef<HTMLElement>(null);
  const selection = useDockSelection(nav, 0, select);
  return <nav ref={nav} {...selection.navProps}><button className="dock-item">Start</button><output>{selection.selected}</output></nav>;
}
function pointer(target: Element, type: string, x: number) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, { pointerId: 7, pointerType: 'touch', isPrimary: true, button: type === 'pointerdown' ? 0 : -1, clientX: x, clientY: 25 });
  fireEvent(target, event);
}
function setup() {
  const select = vi.fn();const view = render(<Harness select={select}/>);
  const nav = view.container.querySelector('nav')!;
  nav.getBoundingClientRect = () => ({ left: 0, top: 0, width: 416, height: 64, x: 0, y: 0, right: 416, bottom: 64, toJSON: () => ({}) });
  nav.setPointerCapture = vi.fn();nav.hasPointerCapture = vi.fn(() => true);nav.releasePointerCapture = vi.fn();
  return { nav, select };
}
it('keeps a touch drag alive when implicit capture transfers from an icon to the dock', () => {
  const { nav, select } = setup();const start = screen.getByRole('button', { name: 'Start' });
  pointer(start, 'pointerdown', 50);pointer(start, 'pointermove', 155);
  expect(nav.dataset.selecting).toBe('true');
  pointer(start, 'lostpointercapture', 155);
  expect(nav.dataset.selecting).toBe('true');expect(select).not.toHaveBeenCalled();
  pointer(nav, 'pointerup', 155);
  expect(select).toHaveBeenCalledExactlyOnceWith(1);expect(nav.dataset.selecting).toBeUndefined();
});
it('cancels when the dock itself genuinely loses capture', () => {
  const { nav, select } = setup();pointer(nav, 'pointerdown', 50);pointer(nav, 'pointermove', 255);pointer(nav, 'lostpointercapture', 255);pointer(nav, 'pointerup', 255);
  expect(select).not.toHaveBeenCalled();expect(nav.dataset.selecting).toBeUndefined();
});
it('deforms only the selection while dragging, reverses tilt with direction and clears it on cancellation', () => {
  const { nav, select } = setup();
  pointer(nav, 'pointerdown', 50); pointer(nav, 'pointermove', 255);
  expect(Number(nav.style.getPropertyValue('--dock-stretch'))).toBeGreaterThan(1);
  expect(Number(nav.style.getPropertyValue('--dock-squash'))).toBeLessThan(1);
  expect(parseFloat(nav.style.getPropertyValue('--dock-tilt'))).toBeGreaterThan(0);
  pointer(nav, 'pointermove', 55);
  expect(parseFloat(nav.style.getPropertyValue('--dock-tilt'))).toBeLessThan(0);
  pointer(nav, 'pointercancel', 55);
  expect(select).not.toHaveBeenCalled();
  expect(nav.dataset.dockPressed).toBeUndefined();
  for (const property of ['--dock-stretch', '--dock-squash', '--dock-tilt', '--dock-shape']) expect(nav.style.getPropertyValue(property)).toBe('');
});
it('keeps dragging functional without shape motion when reduced motion is enabled', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  const { nav, select } = setup();
  pointer(nav, 'pointerdown', 50); pointer(nav, 'pointermove', 155);
  expect(nav.style.getPropertyValue('--dock-stretch')).toBe('');
  pointer(nav, 'pointerup', 155);
  expect(select).toHaveBeenCalledExactlyOnceWith(1);
});
it('clears a soft press when the user starts scrolling vertically instead of navigating', () => {
  const { nav, select } = setup(); pointer(nav, 'pointerdown', 50);
  expect(nav.dataset.dockPressed).toBe('true');
  const event = new Event('pointermove', { bubbles: true, cancelable: true });
  Object.assign(event, { pointerId: 7, clientX: 50, clientY: 60 }); fireEvent(nav, event);
  expect(nav.dataset.dockPressed).toBeUndefined(); expect(nav.style.getPropertyValue('--dock-stretch')).toBe('');
  pointer(nav, 'pointerup', 50); expect(select).not.toHaveBeenCalled();
});
