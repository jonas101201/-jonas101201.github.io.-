import { describe, expect, it } from 'vitest';
import { compatibleLook, cosmeticById, cosmetics, lookVariables, slots } from '../src/features/progression/cosmetics';

function luminance(hex: string) {
  const channels = Array.from({ length: 3 }, (_, index) => parseInt(hex.slice(index * 2 + 1, index * 2 + 3), 16) / 255);
  return channels.map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [.2126, .7152, .0722][index]!, 0);
}
function contrast(first: string, second: string) {
  const a = luminance(first);
  const b = luminance(second);
  return (Math.max(a,b) + .05) / (Math.min(a,b) + .05);
}

describe('Studio catalog and compatibility', () => {
  it('has unique versioned items in all slots and exposes their price or condition', () => {
    expect(new Set(cosmetics.map(item => item.id)).size).toBe(cosmetics.length);
    expect(new Set(cosmetics.map(item => item.slot))).toEqual(new Set(Object.keys(slots)));
    expect(cosmetics.every(item => item.version === 1 && item.description.length > 0 && item.compatibility.length > 0)).toBe(true);
    expect(cosmetics.filter(item => item.slot === 'companion')).toHaveLength(7);
    expect(cosmetics.filter(item => item.rarity === 'mythic').every(item => item.condition.type !== 'credits')).toBe(true);
  });

  it('excludes unknown, wrongly assigned or unowned cosmetics from an applied look', () => {
    const candidate = { background: 'aurora', glass: 'deep-space', progress: 'bar-plasma', logo: 'removed', other: 'orbit' };
    expect(compatibleLook(candidate, ['aurora', 'deep-space', 'orbit'], 'light')).toEqual({ background: 'aurora' });
    expect(compatibleLook(candidate)).toEqual({ background: 'aurora', progress: 'bar-plasma' });
  });

  it('uses independent theme palettes and does not override untouched slots', () => {
    expect(lookVariables({})).toEqual({});
    expect(lookVariables({ background: 'aurora', icons: 'icons-line' })).toMatchObject({
      '--studio-orb-one-dark': '#256457', '--studio-orb-one-light': '#99ceb5', '--studio-icon-weight': '1.5',
    });
    expect(lookVariables({ background: 'aurora' })['--studio-panel-dark']).toBeUndefined();
    expect(cosmeticById('__proto__')).toBeUndefined();
  });

  it('maintains text contrast on the authored glass and accent focus visibility across themes', () => {
    const glass = cosmetics.filter(item => item.slot === 'glass');
    const accent = cosmetics.filter(item => item.slot === 'accent');
    for (const [theme, ink, muted, selected] of [[0, '#edf2fa', '#b9c6d7', '#425d7c'], [1, '#303c4d', '#53657b', '#cbdbea']] as const) {
      for (const item of glass) {
        const surface = item.visual.palette![theme];
        expect(contrast(surface, ink), item.id).toBeGreaterThanOrEqual(4.5);
        expect(contrast(surface, muted), item.id).toBeGreaterThanOrEqual(4.5);
        for (const highlight of accent) expect(contrast(surface, highlight.visual.palette![theme]), `${item.id}/${highlight.id}`).toBeGreaterThanOrEqual(3);
      }
      for (const item of accent) expect(contrast(selected, item.visual.palette![theme]), item.id).toBeGreaterThanOrEqual(3);
    }
  });
});
