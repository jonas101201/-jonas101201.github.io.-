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
      let frame = 0, updateTimer = 0, lastWidth = 0, lastHeight = 0, lastSelection = -1, waveFrame = 0, previousWave = 0;
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      let copy: HTMLElement | null = null;
      function position() {
        frame = 0;
        if (!copy || !element || !glass || !source) return;
        const rect = glass.getBoundingClientRect(), src = source.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const zoom = glass.dataset.selecting ? 1.075 : 1.035;
        copy.style.width = `${src.width}px`;
        copy.style.transform = `translate(${32 + (src.left - rect.left - rect.width / 2) * zoom + rect.width / 2}px,${32 + (src.top - rect.top - rect.height / 2) * zoom + rect.height / 2}px) scale(${zoom})`;
        warp.current?.setAttribute('scale', glass.dataset.selecting ? '30' : '22');
        const selection = glass.querySelector<HTMLElement>('.dock-selection')?.getBoundingClientRect();
        const selectionX = selection ? Math.round((selection.left - rect.left) / 6) * 6 : 0;
        if (lastWidth !== rect.width || lastHeight !== rect.height || lastSelection !== selectionX) {
          lastWidth = rect.width; lastHeight = rect.height; lastSelection = selectionX;
          map.current?.setAttribute('href', lensMap(rect.width, rect.height, 32, selection ? { x: selectionX, y: selection.top - rect.top, width: selection.width, height: selection.height } : undefined));
        }
        paintWaves();
      }
      function paintWaves() {
        const original = document.querySelector<HTMLCanvasElement>('.ascii-waves');
        const target = waveCopy.current;
        const ctx = target?.getContext('2d');
        if (!original || !target || !ctx || !glass) return;
        const rect = glass.getBoundingClientRect(), waves = original.getBoundingClientRect();
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
        host!.replaceChildren(replica); copy = replica;
        queue();
      }
      function changed() { window.clearTimeout(updateTimer); updateTimer = window.setTimeout(snapshot, 80); }
      snapshot(); resumeWaves();
      document.addEventListener('visibilitychange', resumeWaves); motion.addEventListener('change', resumeWaves);
      const mutations = new MutationObserver(changed);
      mutations.observe(source, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class', 'open', 'aria-pressed', 'value'] });
      const resize = new ResizeObserver(queue); resize.observe(source); resize.observe(glass);
      window.addEventListener('scroll', queue, { passive: true });
      window.addEventListener('resize', queue, { passive: true });
      element.addEventListener('dockmove', queue); glass.addEventListener('transitionend', queue);
      disposeScene = () => {
        cancelAnimationFrame(frame); cancelAnimationFrame(waveFrame); document.removeEventListener('visibilitychange', resumeWaves); motion.removeEventListener('change', resumeWaves); window.clearTimeout(updateTimer); mutations.disconnect(); resize.disconnect();
        window.removeEventListener('scroll', queue); window.removeEventListener('resize', queue); element.removeEventListener('dockmove', queue); glass.removeEventListener('transitionend', queue);
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
