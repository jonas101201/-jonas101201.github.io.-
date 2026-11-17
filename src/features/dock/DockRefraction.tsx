import { useEffect, useId, useRef, type RefObject } from 'react';
import { lensMap } from './refraction';

/** Local, inert optical copy of the rendered page. Regular SVG filters also work
 * in WebKit, where SVG URL filters on backdrop-filter are not supported.
 * No screenshots, network requests, protected media or form actions are used. */
export function DockRefraction({ shell, animated }: { shell: RefObject<HTMLDivElement | null>; animated: boolean }) {
  const id = `dock-lens-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const scene = useRef<HTMLDivElement>(null);
  const waveCopy = useRef<HTMLCanvasElement>(null);
  const map = useRef<SVGFEImageElement>(null);
  const warp = useRef<SVGFEDisplacementMapElement>(null);
  useEffect(() => {
    const element = shell.current;
    const host = scene.current;
    const media = window.matchMedia('(max-width: 820px)');
    if (!element || !host) return;
    let disposeScene = () => {};
    function activate() {
      disposeScene();
      disposeScene = () => {};
      if (!media.matches || !element || !host) return;
      const source = document.querySelector<HTMLElement>('.workspace .main-content');
      const glass = element.querySelector<HTMLElement>('.mobile-dock');
      if (!source || !glass) return;
      let frame = 0, updateFrame = 0, lastWidth = 0, lastHeight = 0, lastSelection = '', waveFrame = 0, previousWave = 0;
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      let copy: HTMLElement | null = null;
      function glassRect() {
        const rect = glass!.getBoundingClientRect();
        return { left: rect.left + glass!.clientLeft, top: rect.top + glass!.clientTop, width: glass!.clientWidth, height: glass!.clientHeight };
      }
      function position() {
        cancelAnimationFrame(frame); frame = 0;
        if (!copy || !element || !glass || !source) return;
        const rect = glassRect(), src = source.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const zoom = glass.dataset.selecting ? 1.075 : 1.035;
        copy.style.width = `${src.width}px`;
        const x = 32 + (src.left - rect.left - rect.width / 2) * zoom + rect.width / 2;
        const y = 32 + (src.top - rect.top - rect.height / 2) * zoom + rect.height / 2;
        copy.style.transform = `translate(${x}px,${y}px) scale(${zoom})`;
        const scroller = document.scrollingElement ?? document.documentElement;
        const scrollRange = scroller.scrollHeight - scroller.clientHeight;
        if (CSS.supports('animation-timeline', 'scroll(root block)') && scrollRange > 0) {
          let top = 0;
          for (let node: HTMLElement | null = source; node; node = node.offsetParent as HTMLElement | null) top += node.offsetTop;
          const start = 32 + (top - rect.top - rect.height / 2) * zoom + rect.height / 2;
          copy.style.setProperty('--lens-x', `${x}px`);
          copy.style.setProperty('--lens-y-start', `${start}px`);
          copy.style.setProperty('--lens-y-end', `${start - scrollRange * zoom}px`);
          copy.style.setProperty('--lens-zoom', String(zoom));
          copy.dataset.scrollSync = 'true';
        } else delete copy.dataset.scrollSync;
        warp.current?.setAttribute('scale', glass.dataset.selecting ? '30' : '22');
        const selectionElement = glass.querySelector<HTMLElement>('.dock-selection');
        const selection = selectionElement?.getBoundingClientRect();
        const selectionX = selection ? Math.round((selection.left - rect.left) / 6) * 6 : 0;
        const selectionShape = selection ? [selectionX, selection.top - rect.top, selection.width, selection.height].map(value => Math.round(value / 2) * 2).join(':') : '';
        if (lastWidth !== rect.width || lastHeight !== rect.height || lastSelection !== selectionShape) {
          lastWidth = rect.width; lastHeight = rect.height; lastSelection = selectionShape;
          map.current?.setAttribute('href', lensMap(rect.width, rect.height, 32, selection ? { x: selectionX, y: selection.top - rect.top, width: selection.width, height: selection.height } : undefined));
        }
        paintWaves();
        // Keep the lens attached to the moving, deforming pill during its short
        // release spring. Stop sampling as soon as the compositor settles.
        if (!motion.matches && selectionElement?.getAnimations().some(animation => animation.playState === 'running')) frame = requestAnimationFrame(position);
      }
      function paintWaves() {
        const original = document.querySelector<HTMLCanvasElement>('.ascii-waves');
        const target = waveCopy.current;
        const ctx = target?.getContext('2d');
        if (!original || !target || !ctx || !glass) return;
        const rect = glassRect(), waves = original.getBoundingClientRect();
        const width = Math.ceil(rect.width + 64), height = Math.ceil(rect.height + 64);
        if (target.width !== width) target.width = width;
        if (target.height !== height) target.height = height;
        ctx.clearRect(0, 0, width, height);
        if (!waves.width || !waves.height) return;
        target.style.opacity = getComputedStyle(original).opacity;
        const sx = original.width / waves.width, sy = original.height / waves.height;
        ctx.drawImage(original, (rect.left - 32 - waves.left) * sx, (rect.top - 32 - waves.top) * sy, width * sx, height * sy, 0, 0, width, height);
      }
      function waveTick(now: number) {
        if (!animated || motion.matches || document.hidden) return;
        if (now - previousWave >= 66) { previousWave = now; paintWaves(); }
        waveFrame = requestAnimationFrame(waveTick);
      }
      function resumeWaves() { cancelAnimationFrame(waveFrame); paintWaves(); if (animated && !motion.matches && !document.hidden) waveFrame = requestAnimationFrame(waveTick); }
      function queue() { if (!frame) frame = requestAnimationFrame(position); }
      function snapshot() {
        function visualCopy(node: Node): Node {
          // Exclude network-capable media BEFORE cloning, including detached images.
          if (node instanceof Element && node.matches('iframe,object,embed,video,audio,img,picture,canvas,script,style,link,image,input[type="image"]')) {
            const placeholder = document.createElement('div');
            placeholder.style.height = `${node.getBoundingClientRect().height}px`;
            return placeholder;
          }
          const cloned = node.cloneNode(false);
          if (cloned instanceof Element) {
            for (const attr of ['id', 'name', 'for', 'form', 'href', 'src', 'srcset', 'action', 'autofocus', 'data-liquid']) cloned.removeAttribute(attr);
            if (cloned instanceof HTMLElement && cloned.matches('a,button,input,select,textarea,[tabindex]')) cloned.tabIndex = -1;
          }
          for (const child of node.childNodes) cloned.appendChild(visualCopy(child));
          return cloned;
        }
        const replica = visualCopy(source!) as HTMLElement;
        replica.classList.add('dock-scene-copy'); replica.dataset.dockReplica = 'true';
        replica.setAttribute('aria-hidden', 'true'); replica.inert = true;
        const sourceStyle = getComputedStyle(source!);
        replica.style.fontFamily = sourceStyle.fontFamily; replica.style.fontSize = sourceStyle.fontSize;
        replica.style.fontWeight = sourceStyle.fontWeight; replica.style.color = 'var(--color-text)'; replica.style.letterSpacing = sourceStyle.letterSpacing;
        // Preserve proportional inheritance: a computed 21px root line-height
        // must not force 11px tags to inherit a fixed 21px line-height.
        const ratio = parseFloat(sourceStyle.lineHeight) / parseFloat(sourceStyle.fontSize);
        replica.style.lineHeight = Number.isFinite(ratio) ? String(ratio) : 'normal';
        host!.replaceChildren(replica); copy = replica;
        // Never paint a fresh copy at its default, unaligned document position.
        position();
      }
      function changed() { if (!updateFrame) updateFrame = requestAnimationFrame(() => { updateFrame = 0; snapshot(); }); }
      snapshot(); resumeWaves();
      document.addEventListener('visibilitychange', resumeWaves); motion.addEventListener('change', resumeWaves);
      const mutations = new MutationObserver(changed);
      mutations.observe(source, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class', 'open', 'aria-pressed', 'value'] });
      const resize = new ResizeObserver(() => { queue(); changed(); }); resize.observe(source); resize.observe(glass);
      window.addEventListener('scroll', position, { passive: true });
      window.addEventListener('resize', queue, { passive: true });
      element.addEventListener('dockmove', queue); glass.addEventListener('transitionend', queue);
      disposeScene = () => {
        cancelAnimationFrame(frame); cancelAnimationFrame(waveFrame); document.removeEventListener('visibilitychange', resumeWaves); motion.removeEventListener('change', resumeWaves); cancelAnimationFrame(updateFrame); mutations.disconnect(); resize.disconnect();
        window.removeEventListener('scroll', position); window.removeEventListener('resize', queue); element.removeEventListener('dockmove', queue); glass.removeEventListener('transitionend', queue);
        host.replaceChildren();
      };
    }
    activate(); media.addEventListener('change', activate);
    return () => { disposeScene(); media.removeEventListener('change', activate); };
  }, [shell, animated]);
  return <>
    <svg className="dock-optics-definitions" aria-hidden="true" focusable="false"><defs><filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feImage ref={map} result="normal-map" preserveAspectRatio="none" x="0" y="0" width="100%" height="100%"/>
      <feDisplacementMap ref={warp} in="SourceGraphic" in2="normal-map" scale="22" xChannelSelector="R" yChannelSelector="G"/>
      <feGaussianBlur stdDeviation="0.35"/>
    </filter></defs></svg>
    <div className="dock-refraction" aria-hidden="true" inert><div className="dock-refraction-warp" style={{ filter: `url("#${id}")` }}><div className="dock-refraction-crop"><canvas ref={waveCopy} className="dock-refraction-waves"/><div ref={scene} className="dock-refraction-scene"/></div></div></div>
  </>;
}
