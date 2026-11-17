import { useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent, type RefObject } from 'react';

export function dockSelectionIndex(clientX: number, left: number, width: number) {
  return Math.max(0, Math.min(3, Math.floor((clientX - left) / Math.max(1, width) * 4)));
}
export function useDockSelection(nav: RefObject<HTMLElement | null>, active: number, select: (index: number) => void) {
  const [preview, setPreview] = useState<number | null>(null);
  const gesture = useRef<{ id: number; x: number; y: number; active: boolean; index: number; lastX: number; lastTime: number; velocity: number } | null>(null);
  const suppressClick = useRef(false);
  const activeRef = useRef(active); activeRef.current = active;
  const selectRef = useRef(select); selectRef.current = select;
  function deform(velocity: number) {
    const element = nav.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const speed = Math.min(2.5, Math.abs(velocity));
    element.style.setProperty('--dock-stretch', `${1.035 + speed * .034}`);
    element.style.setProperty('--dock-squash', `${.975 - speed * .022}`);
    element.style.setProperty('--dock-tilt', `${Math.max(-1.5, Math.min(1.5, velocity * .65))}deg`);
    element.style.setProperty('--dock-shape', velocity < 0 ? '30px 25px 28px 26px / 25px 29px 25px 29px' : '25px 30px 26px 28px / 29px 25px 29px 25px');
  }
  function releaseShape() {
    const element = nav.current;
    if (!element) return;
    delete element.dataset.dockPressed;
    for (const property of ['--dock-stretch', '--dock-squash', '--dock-tilt', '--dock-shape']) element.style.removeProperty(property);
  }
  function position(index: number, pointerX?: number) {
    const element = nav.current;
    if (!element) return;
    const rect = element.getBoundingClientRect(), width = Math.max(0, rect.width - 16), step = width / 4;
    const x = pointerX === undefined ? index * step : Math.max(0, Math.min(width - step, pointerX - rect.left - 8 - step / 2));
    element.style.setProperty('--dock-slider-x', `${x}px`);
    element.style.setProperty('--dock-light-x', `${rect.width ? (x + step / 2) / rect.width * 100 : 50}%`);
    element.dispatchEvent(new Event('dockmove', { bubbles: true }));
  }
  useLayoutEffect(() => {
    const resize = () => { if (!gesture.current?.active) position(activeRef.current); };
    resize(); window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  // The ref is stable; position reads the current layout rather than state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
  function finish(event: PointerEvent<HTMLElement>, commit: boolean) {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    gesture.current = null;
    releaseShape();
    if (current.active) {
      suppressClick.current = true;
      delete event.currentTarget.dataset.selecting;
      setPreview(null); position(commit ? current.index : activeRef.current);
      if (commit) selectRef.current(current.index);
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }
  return {
    selected: preview ?? active,
    navProps: {
      onPointerDown(event: PointerEvent<HTMLElement>) {
        suppressClick.current = false;
        if (event.button !== 0 || !event.isPrimary || !(event.target instanceof Element)) return;
        gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, active: false, index: activeRef.current, lastX: event.clientX, lastTime: event.timeStamp, velocity: 0 };
        // Only the existing selection responds to a press; a tap still navigates
        // through the normal link/button click after pointerup.
        const rect = event.currentTarget.getBoundingClientRect();
        if (dockSelectionIndex(event.clientX, rect.left + 8, rect.width - 16) === activeRef.current) {
          event.currentTarget.dataset.dockPressed = 'true'; deform(0);
        }
      },
      onPointerMove(event: PointerEvent<HTMLElement>) {
        const current = gesture.current;
        if (!current || current.id !== event.pointerId) return;
        const dx = event.clientX - current.x, dy = event.clientY - current.y;
        if (!current.active) {
          if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { gesture.current = null; releaseShape(); return; }
          if (Math.abs(dx) < 7) return;
          current.active = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          event.currentTarget.dataset.selecting = 'true';
        }
        event.preventDefault();
        const rect = event.currentTarget.getBoundingClientRect();
        current.index = dockSelectionIndex(event.clientX, rect.left + 8, rect.width - 16);
        setPreview(current.index);
        const velocity = (event.clientX - current.lastX) / Math.max(8, event.timeStamp - current.lastTime);
        current.velocity = current.velocity * .45 + Math.max(-2.5, Math.min(2.5, velocity)) * .55;
        current.lastX = event.clientX; current.lastTime = event.timeStamp;
        deform(current.velocity);
        position(current.index, event.clientX);
      },
      onPointerUp: (event: PointerEvent<HTMLElement>) => finish(event, true),
      onPointerCancel: (event: PointerEvent<HTMLElement>) => finish(event, false),
      onPointerLeave() { if (gesture.current && !gesture.current.active) { gesture.current = null; releaseShape(); } },
      onLostPointerCapture(event: PointerEvent<HTMLElement>) {
        // Touch implicitly captures on the pressed child first. Its bubbling loss
        // during transfer to the nav must not cancel the new nav-owned gesture.
        if (event.target === event.currentTarget) finish(event, false);
      },
      onClickCapture(event: MouseEvent<HTMLElement>) { if (suppressClick.current && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } },
    },
    onSliderKeyDown(event: KeyboardEvent<HTMLElement>) {
      let next: number;
      if (event.key === 'ArrowLeft') next = Math.max(0, activeRef.current - 1);
      else if (event.key === 'ArrowRight') next = Math.min(3, activeRef.current + 1);
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = 3;
      else return;
      event.preventDefault(); position(next); selectRef.current(next);
    },
  };
}
