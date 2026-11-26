import { useEffect, useLayoutEffect, useRef } from 'react';
import { useI18n } from '../../i18n/context';
import type { Look } from './cosmetics';

export function LookPreviewFrame({ look }: { look: Look }) {
  const { tr } = useI18n();
  const frame = useRef<HTMLIFrameElement>(null);
  const container = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const shell = container.current;
    if (!shell) return;
    // Scale the 320px layout on narrower cards instead of clipping its navigation.
    let scale = 0;
    let frameId = 0;
    const resize = () => {
      const next = Math.min(1, shell.clientWidth / 320);
      if (next === scale) return;
      scale = next;
      shell.style.setProperty('--look-scale', String(scale));
    };
    resize();
    if (typeof ResizeObserver !== 'function') return;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(resize);
    });
    observer.observe(shell);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, []);
  useEffect(() => {
    const send = () => frame.current?.contentWindow?.postMessage({ type: 'lernhub-look-preview', look }, window.location.origin);
    function ready(event: MessageEvent) {
      if (event.source === frame.current?.contentWindow && event.origin === window.location.origin && event.data?.type === 'lernhub-look-ready') send();
    }
    window.addEventListener('message', ready);
    send();
    return () => window.removeEventListener('message', ready);
  }, [look]);
  return <div ref={container} className="look-preview-frame" role="group" aria-label={tr('Designvorschau')}>
    <iframe ref={frame} title={tr('LernHub-Startseite als Vorschau')}
      src={window.location.href.split('#')[0] + '#/?anprobe=studio'} tabIndex={-1}
      onLoad={() => frame.current?.contentWindow?.postMessage({ type: 'lernhub-look-preview', look }, window.location.origin)}/>
  </div>;
}
