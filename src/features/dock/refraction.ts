/** Rounded-lens normal map. Neutral interior, strongest refraction at the rim. */
export function lensMap(width: number, height: number, padding: number, selection?: { x: number; y: number; width: number; height: number }) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(width + padding * 2); canvas.height = Math.ceil(height + padding * 2);
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const image = ctx.createImageData(canvas.width, canvas.height);
  const radius = Math.min(height / 2, 36);
  for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
    const dx = x - canvas.width / 2, dy = y - canvas.height / 2;
    const qx = Math.abs(dx) - (width / 2 - radius), qy = Math.abs(dy) - (height / 2 - radius);
    const ox = Math.max(qx, 0), oy = Math.max(qy, 0), length = Math.hypot(ox, oy);
    const distance = length + Math.min(Math.max(qx, qy), 0) - radius;
    const edge = Math.pow(1 - Math.min(1, Math.max(0, -distance / 23)), 2);
    const nx = length ? ox / length * Math.sign(dx) : qx > qy ? Math.sign(dx) : 0;
    const ny = length ? oy / length * Math.sign(dy) : qy >= qx ? Math.sign(dy) : 0;
    let rx = nx * edge, ry = ny * edge;
    if (selection) {
      const px = (x - padding - selection.x - selection.width / 2) / (selection.width / 2);
      const py = (y - padding - selection.y - selection.height / 2) / (selection.height / 2);
      const r = Math.hypot(px, py);
      const rim = Math.max(0, 1 - Math.abs(r - .88) / .32) * .55;
      rx += px * rim; ry += py * rim;
    }
    const i = (y * canvas.width + x) * 4;
    image.data[i] = 128 + Math.max(-1, Math.min(1, rx)) * 125; image.data[i + 1] = 128 + Math.max(-1, Math.min(1, ry)) * 125;
    image.data[i + 2] = 128; image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL();
}
