import { useEffect, useRef } from 'react';

/** Decorative, locally rendered ASCII waves; no video download or third-party requests. */
export function AsciiWaves({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let previous = 0;
    let phase = phaseRef.current;
    let width = 0;
    let height = 0;
    let cell = 10;
    const glyphs = ' .,:;=+*#@';

    function paint() {
      if (!canvas || !context) return;
      context.clearRect(0, 0, width, height);
      const rows = Math.ceil(height / (cell * 1.5));
      const columns = Math.ceil(width / cell);
      const mobile = width <= 820;
      context.font = `${mobile ? 600 : 400} ${Math.round(cell * 1.12)}px ui-monospace, SFMono-Regular, Consolas, monospace`;
      context.textBaseline = 'top';
      for (let y = 0; y < rows; y++) {
        const v = y / rows;
        for (let x = 0; x < columns; x++) {
          const u = x / columns;
          const ridge = (mobile ? .23 : .39) + (mobile ? .09 : .13) * Math.sin(u * 7.5 - phase * .55) + .065 * Math.cos(u * 14 + phase * .24);
          const second = .77 + .10 * Math.sin(u * 9 + phase * .32);
          const band = Math.exp(-(((v - ridge) / (mobile ? .12 : .095)) ** 2)) + .65 * Math.exp(-(((v - second) / .07) ** 2));
          const texture = .55 + .45 * Math.sin(u * 20 + v * 16 - phase);
          const intensity = Math.min(1, band * (.58 + texture * .42));
          if (intensity < .08) continue;
          const glyph = glyphs.charAt(Math.min(glyphs.length - 1, Math.floor((mobile ? Math.sqrt(intensity) : intensity) * (glyphs.length - 1))));
          context.fillStyle = `rgba(${Math.round(106 + u * 65)},${Math.round(153 - u * 30)},239,${(mobile ? .12 + intensity * .5 : .08 + intensity * .37).toFixed(2)})`;
          context.fillText(glyph, x * cell, y * cell * 1.5);
        }
      }
    }
    function tick(now: number) {
      if (document.hidden || paused || motion.matches) return;
      // A low frame rate and bounded character grid keep this background inexpensive.
      if (now - previous >= 66) {
        phase += Math.min((now - previous) / 1000, .1);
        previous = now;
        paint();
      }
      frame = requestAnimationFrame(tick);
    }
    function resume() {
      cancelAnimationFrame(frame);
      previous = performance.now();
      paint();
      if (!document.hidden && !paused && !motion.matches) frame = requestAnimationFrame(tick);
    }
    function resize() {
      if (!canvas || !context) return;
      width = window.innerWidth;
      height = window.innerHeight;
      cell = Math.max(width <= 820 ? 12 : 10, width / 160, height / 105);
      const scale = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      resume();
    }
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', resume);
    motion.addEventListener('change', resume);
    return () => {
      cancelAnimationFrame(frame);
      phaseRef.current = phase;
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', resume);
      motion.removeEventListener('change', resume);
    };
  }, [paused]);
  return <canvas ref={canvasRef} className="ascii-waves" aria-hidden="true" />;
}
