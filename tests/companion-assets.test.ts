import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { companions } from '../src/features/progression/companions';

const root = resolve('public/worlds/models');
const motions = ['idle', 'greet', 'celebrate'];
const expressions = ['', '-dual', '-smile', '-dual-smile',
  ...['excited', 'curious', 'focused', 'surprised', 'proud', 'thoughtful'].flatMap(expression => ['-' + expression, '-dual-' + expression])];
const parts = ['rings-holo', 'crystals-satellite', 'particles-stardust', 'crown-stellar', 'garden-flower-crown'];

function webp(name: string) {
  const buffer = readFileSync(resolve(root, name + '.webp'));
  expect(buffer.toString('ascii', 0, 4), name).toBe('RIFF');
  expect(buffer.toString('ascii', 8, 12), name).toBe('WEBP');
  return buffer;
}

describe('Companion 2D catalogue', () => {
  for (const { id } of companions) it(`${id} has valid sprite strips and equipped art`, () => {
    const poster = webp(id + '-poster');
    for (const motion of motions) expect(webp(id + '-' + motion + '-sprite').length).toBeGreaterThan(poster.length);
    for (const part of parts) webp(id + '-' + part);
    for (const stage of [0,1,2,3]) {
      if (stage) for (const motion of motions) webp(id + '-stage-' + stage + '-' + motion + '-sprite');
      for (const expression of expressions) {
        if (!stage && !expression) continue;
        webp(id + '-stage-' + stage + expression);
      }
    }
  });
});
