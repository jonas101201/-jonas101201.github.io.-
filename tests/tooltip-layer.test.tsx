// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { TooltipLayer } from '../src/components/TooltipLayer';
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
function over(element: Element) {
  const event = new Event('pointerover', { bubbles: true }); Object.assign(event, { pointerType: 'mouse' }); fireEvent(element, event);
}
it('delays the first hint, skips the next delay, and preserves updated native labels on dismissal', async () => {
  vi.useFakeTimers(); vi.stubGlobal('matchMedia', () => ({ matches: true }));
  render(<><button title="Erster Hinweis">Eins</button><button title="Zweiter Hinweis">Zwei</button><TooltipLayer/></>);
  const first = screen.getByText('Eins'), second = screen.getByText('Zwei');
  const rect = () => ({ x:10,y:10,left:10,top:10,right:110,bottom:54,width:100,height:44,toJSON:()=>({}) });
  first.getBoundingClientRect = rect; second.getBoundingClientRect = rect;
  over(first); await act(() => vi.advanceTimersByTimeAsync(449)); expect(screen.queryByRole('tooltip')).toBeNull();
  await act(() => vi.advanceTimersByTimeAsync(1)); expect(screen.getByRole('tooltip').textContent).toBe('Erster Hinweis');
  over(second); await act(() => vi.advanceTimersByTimeAsync(0)); expect(screen.getByRole('tooltip').textContent).toBe('Zweiter Hinweis');
  second.setAttribute('title','Geänderter Hinweis'); second.setAttribute('aria-describedby',`${second.getAttribute('aria-describedby')} external-help`);
  fireEvent.click(second); expect(screen.queryByRole('tooltip')).toBeNull();
  expect(second.getAttribute('title')).toBe('Geänderter Hinweis'); expect(second.getAttribute('aria-describedby')).toBe('external-help');
});
