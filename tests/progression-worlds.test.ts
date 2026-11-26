import { describe, expect, it } from 'vitest';
import { compatibleLook, cosmeticById } from '../src/features/progression/cosmetics';
import { applyAction, emptyState, ownsWorld, stateSchema } from '../src/features/progression/engine';
import { parseProgressBackup } from '../src/features/progression/storage';
import { enchantedGarden as garden } from '../src/features/progression/worlds';
import { learningReference, plantMission } from '../src/features/progression/missions';

const at = '2026-11-26T12:00:00.000Z';
const buy = { type: 'world-buy', id: garden.id, at } as const;
const equip = { type: 'world-equip', id: garden.id } as const;
function savedWithCredits(credits: number) {
  return stateSchema.parse({
    ...emptyState(), credits, xp: 500,
    transactions: [{ id: 'collection:fixture', kind: 'collection', title: 'Test fixture', at, xp: 500, credits }],
  });
}

describe('Enchanted Garden', () => {
  it('defines six distinct slots and exclusive cosmetics', () => {
    expect(garden.cosmeticIds).toHaveLength(6);
    expect(new Set(garden.cosmeticIds).size).toBe(6);
    for (const [slot, id] of Object.entries(garden.look)) {
      expect(cosmeticById(id)).toMatchObject({ id, slot, condition: { type: 'world', id: garden.id } });
    }
  });

  it('never grants partial ownership or deducts credits for invalid purchases', () => {
    const short = savedWithCredits(garden.price - 1);
    expect(applyAction(short, buy)).toBe(short);
    const rich = savedWithCredits(garden.price * 2);
    expect(applyAction(rich, { ...buy, id: 'unknown-world' })).toBe(rich);
    expect(applyAction(rich, { ...buy, at: 'not-a-date' })).toBe(rich);
    expect(applyAction(rich, { type: 'cosmetic-buy', id: garden.look.glass, at })).toBe(rich);
    expect(applyAction(rich, equip)).toBe(rich);
    expect(compatibleLook(garden.look, rich.owned)).toEqual({});
    expect(compatibleLook(garden.look)).toEqual(garden.look);
  });

  it('charges once and grants all six with one ledger record', () => {
    const rich = savedWithCredits(garden.price * 2);
    const bought = applyAction(rich, buy);
    expect(ownsWorld(rich, garden.id)).toBe(false);
    expect(ownsWorld(bought, garden.id)).toBe(true);
    expect(bought.credits).toBe(garden.price);
    expect(bought.transactions.at(-1)).toMatchObject({ id: 'purchase:world:enchanted-garden', kind: 'purchase', credits: -garden.price, xp: 0 });
    expect(bought.transactions).toHaveLength(rich.transactions.length + 1);
    expect(applyAction(bought, buy)).toBe(bought);
    expect(bought.equipped).toEqual({});
    expect(stateSchema.parse(bought)).toEqual(bought);
  });

  it('supports set and individual equipment, presets and a separate world wish', () => {
    const rich = savedWithCredits(garden.price);
    const wish = applyAction(rich, { type: 'world-wishlist', id: garden.id });
    expect(wish.wishlist).toEqual([garden.id]);
    expect(wish.credits).toBe(rich.credits);
    const bought = applyAction(wish, buy);
    const worn = applyAction(bought, equip);
    expect(worn.equipped).toEqual(garden.look);
    const saved = applyAction(worn, { type: 'preset-save', id: 'garden', name: 'My garden' });
    expect(saved.presets[0]?.equipped).toEqual(garden.look);
    const individual = applyAction(bought, { type: 'equip', equipped: { celebration: garden.look.celebration } });
    expect(individual.equipped).toEqual({ celebration: garden.look.celebration });
  });

  it('imports original V1 and world backups, rejects partial or unsupported world purchases', () => {
    const original = savedWithCredits(garden.price);
    const bought = applyAction(original, buy);
    const importState = (state: typeof original) => parseProgressBackup(JSON.stringify({ format: 'lernhub-progress', version: 1, exportedAt: at, state })).state;
    expect(importState(original)).toEqual(original);
    expect(importState(bought)).toEqual(bought);
    expect(() => importState({ ...bought, owned: ['orbit', garden.look.glass] })).toThrow();
    expect(() => importState({ ...original, owned: [...original.owned, ...garden.cosmeticIds] })).toThrow();
  });
});

describe('Pflanziskas Lernmission', () => {
  it('unlocks the companion only after both real learning activities', () => {
    const plan = plantMission()!;
    let state = applyAction(emptyState(), { type: 'mission-start', mission: plan, at });
    expect(state.missions[0]?.id).toBe(plan.id);
    expect(state.owned).not.toContain('pflanziska');
    for (const [index, step] of plan.steps.entries()) {
      const ref = learningReference(step.kind, step.contentId)!;
      const recall = step.kind === 'blurting';
      state = applyAction(state, { type: 'complete', event: {
        id: 'plant-test-' + index, kind: step.kind, contentId: step.contentId, subjectId: ref.subjectId, learningFieldId: ref.learningFieldId,
        at: new Date(Date.parse(at) + 40_000 * (index + 1)).toISOString(),
        elapsedMs: 120_000, total: ref.total, attempted: recall ? 30 : ref.total,
        ...(recall ? { concepts: Object.fromEntries(ref.conceptIds!.map(id => [id, 'remembered'])) } : { correct: ref.total }),
      } });
      expect(state.owned.includes('pflanziska')).toBe(index === plan.steps.length - 1);
    }
    expect(stateSchema.parse(state).missions[0]?.status).toBe('completed');
  });
});
