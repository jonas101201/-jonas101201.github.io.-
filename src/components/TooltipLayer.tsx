import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

/** Shared desktop tooltip delay. Native labels remain the accessible name. */
export function TooltipLayer() {
  const id = `tooltip-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const tip = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<{ owner: HTMLElement; text: string } | null>(null);
  useEffect(() => {
    let owner: HTMLElement | null = null, title: string | null = null, described: string | null = null;
    let timer = 0, leaveTimer = 0, lastShown = -Infinity, visible = false;
    function hide() {
      window.clearTimeout(timer); window.clearTimeout(leaveTimer);
      if (visible) lastShown = performance.now();
      if (owner) {
        if (title !== null && !owner.hasAttribute('title')) owner.setAttribute('title', title);
        const remaining = owner.getAttribute('aria-describedby')?.split(/\s+/).filter(value => value && value !== id).join(' ');
        if (remaining) owner.setAttribute('aria-describedby', remaining); else owner.removeAttribute('aria-describedby');
      }
      owner = null; title = null; visible = false; setShown(null);
    }
    function start(element: HTMLElement, immediate: boolean) {
      if (owner === element) { window.clearTimeout(leaveTimer); return; }
      hide();
      if (element.closest('[data-dock-replica],[inert],dialog') || element.matches(':disabled')) return;
      const text = element.getAttribute('title')?.trim() || (element.matches('.icon-button') ? element.getAttribute('aria-label') : '');
      if (!text) return;
      owner = element; title = element.getAttribute('title'); described = element.getAttribute('aria-describedby');
      element.removeAttribute('title');
      timer = window.setTimeout(() => {
        if (!owner?.isConnected || !owner.getBoundingClientRect().width) { hide(); return; }
        visible = true;
        if (owner.getAttribute('aria-label') !== text) owner.setAttribute('aria-describedby', [described, id].filter(Boolean).join(' '));
        setShown({ owner, text });
      }, immediate || performance.now() - lastShown < 700 ? 0 : 450);
    }
    function over(event: PointerEvent) {
      if (event.target instanceof Element && event.target.closest(`[id="${id}"]`)) { window.clearTimeout(leaveTimer); return; }
      if (event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      const element = event.target instanceof Element ? event.target.closest('[title],.icon-button[aria-label]') : null;
      if (element instanceof HTMLElement) start(element, false);
    }
    function out(event: PointerEvent) {
      const related = event.relatedTarget;
      if (related instanceof Node && (owner?.contains(related) || tip.current?.contains(related))) { window.clearTimeout(leaveTimer); return; }
      if (owner) { window.clearTimeout(leaveTimer); leaveTimer = window.setTimeout(hide, 120); }
    }
    function focus(event: FocusEvent) {
      const element = event.target;
      if (element instanceof HTMLElement && element.matches(':focus-visible')) start(element, true);
    }
    function blur(event: FocusEvent) { if (event.target === owner) hide(); }
    function key(event: globalThis.KeyboardEvent) { if (['Escape','Enter',' '].includes(event.key)) hide(); }
    document.addEventListener('pointerover', over); document.addEventListener('pointerout', out);
    document.addEventListener('focusin', focus); document.addEventListener('focusout', blur);
    document.addEventListener('pointerdown', hide); document.addEventListener('keydown', key);
    document.addEventListener('click', hide);
    window.addEventListener('scroll', hide, true); window.addEventListener('resize', hide);
    return () => {
      hide(); document.removeEventListener('pointerover', over); document.removeEventListener('pointerout', out);
      document.removeEventListener('focusin', focus); document.removeEventListener('focusout', blur);
      document.removeEventListener('pointerdown', hide); document.removeEventListener('keydown', key);
      document.removeEventListener('click', hide);
      window.removeEventListener('scroll', hide, true); window.removeEventListener('resize', hide);
    };
  }, [id]);
  useLayoutEffect(() => {
    if (!tip.current || !shown) return;
    const anchor = shown.owner.getBoundingClientRect(), bounds = tip.current.getBoundingClientRect();
    const below = anchor.bottom + bounds.height + 16 <= window.innerHeight;
    tip.current.style.left = `${Math.max(8, Math.min(window.innerWidth - bounds.width - 8, anchor.left + (anchor.width - bounds.width) / 2))}px`;
    tip.current.style.top = `${Math.max(8, below ? anchor.bottom + 8 : anchor.top - bounds.height - 8)}px`;
    tip.current.dataset.side = below ? 'below' : 'above';
  }, [shown]);
  return shown ? <div ref={tip} id={id} role="tooltip" className="app-tooltip">{shown.text}</div> : null;
}
