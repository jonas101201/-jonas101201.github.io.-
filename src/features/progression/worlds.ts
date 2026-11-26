import type { Cosmetic, Look, Rarity } from './cosmetics';

type WorldLook = Required<Pick<Look, 'background' | 'glass' | 'crown' | 'progress' | 'environment' | 'celebration'>>;

export interface PremiumWorld {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  price: number;
  look: WorldLook;
  cosmeticIds: readonly string[];
  artwork: string;
  reveal: string;
  compatibility: Cosmetic['compatibility'];
}

const gardenLook = {
  glass: 'garden-clay',
  background: 'garden-forest',
  crown: 'garden-flower-crown',
  progress: 'garden-growth',
  environment: 'garden-fireflies',
  celebration: 'garden-bloom',
} satisfies WorldLook;

export const enchantedGarden = {
  id: 'enchanted-garden',
  name: 'Enchanted Garden',
  description: 'Ein verwunschener Waldgarten mit mattem Moosrelief, blühenden Ranken und warmem Licht zwischen den Baumwurzeln.',
  rarity: 'legendary',
  price: 3600,
  look: gardenLook,
  cosmeticIds: Object.values(gardenLook),
  artwork: 'enchanted-garden',
  reveal: 'garden-awakening',
  compatibility: ['dark', 'light'],
} satisfies PremiumWorld;

export const premiumWorlds: readonly PremiumWorld[] = [enchantedGarden];

export function premiumWorldById(id: string) {
  return premiumWorlds.find(world => world.id === id);
}

function gardenCosmetic(slot: keyof WorldLook, name: string, description: string, visual: Cosmetic['visual']): Cosmetic {
  return {
    id: gardenLook[slot], name, description, slot, visual,
    rarity: enchantedGarden.rarity,
    condition: { type: 'world', id: enchantedGarden.id },
    compatibility: enchantedGarden.compatibility,
    version: 1,
  };
}

export const premiumCosmetics = [
  gardenCosmetic('glass', 'Living Garden', 'Botanisches Relief mit modelliertem Moos und tiefen, matten Kanten.', {
    palette: ['#263a31', '#e3eae0'], glow: ['#90b58d72', '#3c674c6b'],
  }),
  gardenCosmetic('background', 'Enchanted Forest', 'Waldlicht fällt zwischen gestaffelten Baumkronen in einen verwunschenen Garten.', {
    palette: ['#244335', '#b6ccad'], glow: ['#386447', '#cde0ba'], third: ['#1b332b', '#a3c3b2'],
  }),
  gardenCosmetic('crown', 'Botanische Blütenkrone', 'Zarte Blüten zwischen ineinander gewachsenen Blättern.', {
    palette: ['#91c799', '#426f50'], glow: ['#f6d7a4', '#905442'], style: 'garden-flower-crown',
  }),
  gardenCosmetic('progress', 'Wachsender Trieb', 'Ein frischer Trieb markiert den zurückgelegten Weg.', {
    palette: ['#9ed399', '#376849'], glow: ['#e7ca83', '#83521d'], style: 'garden-growth',
  }),
  gardenCosmetic('environment', 'Glühwürmchen', 'Kleine Lichtpunkte zwischen den Blättern.', {
    palette: ['#ead991', '#705522'], style: 'garden-fireflies',
  }),
  gardenCosmetic('celebration', 'Erste Blüte', 'Eine kurze botanische Entfaltung begleitet den Lernabschluss.', {
    palette: ['#f1d395', '#815827'], style: 'garden-bloom',
  }),
] satisfies readonly Cosmetic[];
