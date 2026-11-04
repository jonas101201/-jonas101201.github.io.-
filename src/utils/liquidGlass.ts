const controls = 'button, select, input[type="range"], summary, .answer-option, a.button, a.icon-button, a.nav-link, a.class-button, a.shortcut, a.field-card, a.subject-header, .subject-fields a, a.subject-card, a.sheet-card, a.search-result, a.class-chip, a.text-link, a.back-link';

/** Progressive visual enhancement. Native clicks, keys and form behavior stay intact. */
export function mountLiquidGlass(root: HTMLElement) {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let pointerFrame = 0;
  let pointer: { element: HTMLElement; x: number; y: number } | undefined;
  let pressed: HTMLElement | undefined;
  let disposed = false;
  const decorated = new Set<HTMLElement>();
  const groups = new Set<HTMLElement>();

  function enhance() {
    frame = 0;
    if (disposed) return;
    for (const element of decorated) if (!root.contains(element)) decorated.delete(element);
    for (const group of groups) if (!root.contains(group)) groups.delete(group);
    root.querySelectorAll<HTMLElement>(controls).forEach(element => {
      element.dataset.liquid = element.matches('input[type="range"]') ? 'range' : element.matches('.text-link, .back-link') ? 'link' : element.matches('.flashcard, .sheet-card, .subject-card, .search-result') ? 'card' : 'control';
      decorated.add(element);
    });
    root.querySelectorAll<HTMLElement>('.segmented, .content-tabs').forEach(group => {
      groups.add(group);
      const active = group.querySelector<HTMLElement>('button[aria-pressed="true"], button.active');
      if (!active) { delete group.dataset.glassPill; return; }
      // Layout dimensions exclude the hover/press scale of the active button.
      group.style.setProperty('--pill-x', `${active.offsetLeft}px`);
      group.style.setProperty('--pill-y', `${active.offsetTop}px`);
      group.style.setProperty('--pill-width', `${active.offsetWidth}px`);
      group.style.setProperty('--pill-height', `${active.offsetHeight}px`);
      group.dataset.glassPill = 'ready';
    });
  }
  function schedule() { if (!frame && !disposed) frame = requestAnimationFrame(enhance); }
  function control(event: Event) {
    if (!(event.target instanceof Element)) return;
    const element = event.target.closest<HTMLElement>('[data-liquid]');
    if (!element || !root.contains(element) || element.matches(':disabled, [aria-disabled="true"]') || element.closest('[inert]') || element.querySelector('input:disabled')) return;
    return element;
  }
  function light(event: PointerEvent) {
    if (motion.matches || event.pointerType === 'touch') return;
    const element = control(event);
    if (!element) return;
    pointer = { element, x: event.clientX, y: event.clientY };
    if (!pointerFrame) pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      if (!pointer || disposed || !pointer.element.isConnected) return;
      const rect = pointer.element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointer.element.style.setProperty('--glass-x', `${Math.max(0, Math.min(100, (pointer.x - rect.left) / rect.width * 100))}%`);
      pointer.element.style.setProperty('--glass-y', `${Math.max(0, Math.min(100, (pointer.y - rect.top) / rect.height * 100))}%`);
    });
  }
  function release() { if (pressed) delete pressed.dataset.glassPressed; pressed = undefined; }
  function down(event: PointerEvent) {
    release();
    if (event.button !== 0) return;
    pressed = control(event);
    if (!pressed) return;
    light(event);
    pressed.dataset.glassPressed = 'true';
  }
  function keyDown(event: KeyboardEvent) {
    if (event.repeat || !['Enter', ' '].includes(event.key)) return;
    const element = control(event);
    if (element && element.matches('button, summary, a')) { release(); pressed = element; pressed.dataset.glassPressed = 'true'; }
  }
  function keyUp(event: KeyboardEvent) { if (['Enter', ' ', 'Escape', 'Tab'].includes(event.key)) release(); }
  const mutations = new MutationObserver(schedule);
  mutations.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-pressed', 'disabled'] });
  const resize = new ResizeObserver(schedule);
  resize.observe(root);
  root.addEventListener('pointermove', light, { passive: true });
  root.addEventListener('pointerdown', down, { passive: true });
  root.addEventListener('keydown', keyDown);
  window.addEventListener('pointerup', release, { passive: true });
  window.addEventListener('pointercancel', release, { passive: true });
  window.addEventListener('keyup', keyUp);
  window.addEventListener('blur', release);
  motion.addEventListener('change', release);
  enhance();
  void document.fonts.ready.then(schedule);
  return () => {
    disposed = true;
    cancelAnimationFrame(frame); cancelAnimationFrame(pointerFrame);
    mutations.disconnect(); resize.disconnect(); release();
    root.removeEventListener('pointermove', light); root.removeEventListener('pointerdown', down); root.removeEventListener('keydown', keyDown);
    window.removeEventListener('pointerup', release); window.removeEventListener('pointercancel', release); window.removeEventListener('keyup', keyUp); window.removeEventListener('blur', release);
    motion.removeEventListener('change', release);
    decorated.forEach(element => { delete element.dataset.liquid; element.style.removeProperty('--glass-x'); element.style.removeProperty('--glass-y'); });
    groups.forEach(group => { delete group.dataset.glassPill; ['--pill-x', '--pill-y', '--pill-width', '--pill-height'].forEach(name => group.style.removeProperty(name)); });
  };
}
