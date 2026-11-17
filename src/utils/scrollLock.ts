/** Freeze the page on iOS too, keeping its content at the current viewport position. */
export function lockPageScroll() {
  const body = document.body;
  const root = document.documentElement;
  const x = window.scrollX, y = window.scrollY;
  const bodyProperties = ['position', 'top', 'left', 'width', 'overflow', 'padding-right'] as const;
  const rootProperties = ['overflow', 'overscroll-behavior', 'scroll-behavior'] as const;
  const save = (style: CSSStyleDeclaration, properties: readonly string[]) => properties.map(property => ({ property, value: style.getPropertyValue(property), priority: style.getPropertyPriority(property) }));
  const beforeBody = save(body.style, bodyProperties);
  const beforeRoot = save(root.style, rootProperties);
  const scrollbar = Math.max(0, window.innerWidth - root.clientWidth);
  const padding = parseFloat(getComputedStyle(body).paddingRight) || 0;
  root.style.overflow = 'hidden';
  root.style.overscrollBehavior = 'none';
  body.style.position = 'fixed';
  body.style.top = `${-y}px`;
  body.style.left = `${-x}px`;
  body.style.width = '100%';
  body.style.overflow = 'hidden';
  if (scrollbar) body.style.paddingRight = `${padding + scrollbar}px`;
  let released = false;
  return (restorePosition = true) => {
    if (released) return;
    released = true;
    const restore = (style: CSSStyleDeclaration, values: typeof beforeBody) => values.forEach(({ property, value, priority }) => {
      if (value) style.setProperty(property, value, priority); else style.removeProperty(property);
    });
    restore(body.style, beforeBody);
    restore(root.style, beforeRoot.filter(({ property }) => property !== 'scroll-behavior'));
    root.style.scrollBehavior = 'auto';
    const targetX = restorePosition ? x : 0, targetY = restorePosition ? y : 0;
    if (window.scrollX !== targetX || window.scrollY !== targetY) window.scrollTo(targetX, targetY);
    restore(root.style, beforeRoot.filter(({ property }) => property === 'scroll-behavior'));
  };
}
