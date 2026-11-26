import type { CSSProperties } from 'react';

export const slots = {
  background: 'Hintergrund', glass: 'Glasmaterial', accent: 'Akzentfarbe', icons: 'Icon-Paket',
  logo: 'LernHub-Logo', celebration: 'Abschlussanimation', progress: 'Fortschrittsbalken',
  navigation: 'Navigationsanimation', companion: 'Lernbegleiter',
  body: 'Körpermaterial', eyes: 'Augen', expression: 'Gesichtsausdruck', crystals: 'Kristalle',
  rings: 'Ringe', crown: 'Krone', particles: 'Partikel', 'companion-color': 'Begleiter-Farbe',
} as const;

export type Slot = keyof typeof slots;
export type Look = Partial<Record<Slot, string>>;
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type Condition = { type: 'credits'; price: number }
  | { type: 'level'; level: number }
  | { type: 'achievement' | 'collection' | 'companion'; id: string };
type Palette = readonly [dark: string, light: string];
type Visual = {
  palette?: Palette;
  glow?: Palette;
  third?: Palette;
  style?: string;
};
export interface Cosmetic {
  id: string;
  name: string;
  description: string;
  slot: Slot;
  rarity: Rarity;
  condition: Condition;
  visual: Visual;
  compatibility: readonly ('dark' | 'light')[];
  version: 1;
}

export const rarityLabels: Record<Rarity, string> = {
  common: 'Gewöhnlich', rare: 'Selten', epic: 'Episch', legendary: 'Legendär', mythic: 'Mythisch',
};

const credits = (price: number): Condition => ({ type: 'credits', price });
const level = (value: number): Condition => ({ type: 'level', level: value });
const achievement = (id: string): Condition => ({ type: 'achievement', id });
const collection = (id: string): Condition => ({ type: 'collection', id });
const companion = (id: string): Condition => ({ type: 'companion', id });
function item(id: string, name: string, slot: Slot, rarity: Rarity, condition: Condition, description: string, visual: Visual): Cosmetic {
  return { id, name, slot, rarity, condition, description, visual, version: 1, compatibility: ['dark', 'light'] };
}

export const cosmetics: readonly Cosmetic[] = [
  item('aurora', 'Aurora', 'background', 'common', credits(160), 'Grüne und violette Lichtkörper ziehen über den Hintergrund.', { palette: ['#256457', '#99ceb5'], glow: ['#514479', '#cabbe8'], third: ['#284247', '#aec9d5'] }),
  item('nebula', 'Nebula', 'background', 'rare', credits(550), 'Staubiges Violett trifft auf einen kühlen blauen Nebel.', { palette: ['#694662', '#dfb6d8'], glow: ['#354d76', '#a7bfda'], third: ['#483055', '#c3abd8'] }),
  item('deep-space', 'Deep Space', 'background', 'rare', level(10), 'Ein dunkler Orbit mit zurückhaltenden blauen Reflexen.', { palette: ['#274770', '#9ab5db'], glow: ['#3b5076', '#b3c7e7'], third: ['#283349', '#c4d1e1'] }),
  item('solar-flare', 'Solar Flare', 'background', 'epic', credits(1200), 'Warme Sonnentöne und ein tiefer kupferner Kern.', { palette: ['#8c5627', '#dfb671'], glow: ['#7b3a2a', '#e2a188'], third: ['#6b4129', '#cba484'] }),
  item('oceanic', 'Oceanic', 'background', 'common', credits(230), 'Strömende Blau- und Aquatöne in drei Tiefen.', { palette: ['#285b82', '#9cbfdd'], glow: ['#21606a', '#a3d1d8'], third: ['#294b6b', '#adc8de'] }),
  item('glacier', 'Glacier', 'background', 'epic', level(20), 'Eisblauer Glanz mit einem kühlen, transparenten Eindruck.', { palette: ['#427484', '#bce2e7'], glow: ['#56748a', '#c2d8eb'], third: ['#385d74', '#b7cde1'] }),
  item('event-horizon', 'Event Horizon', 'background', 'legendary', credits(3200), 'Dunkle Bögen umschließen einen goldenen Lichtsaum.', { palette: ['#473b52', '#aaa0bd'], glow: ['#765732', '#ddc193'], third: ['#2b273b', '#b7abc9'] }),

  item('crystal-glass', 'Crystal', 'glass', 'common', credits(200), 'Kühle Glasflächen mit einer klaren Kante.', { palette: ['#263a4b', '#e2edf5'], glow: ['#a5d2ea60', '#ffffffdd'] }),
  item('frosted-glass', 'Frosted Glass', 'glass', 'rare', level(5), 'Seidig matte Flächen mit sanftem Frostreflex.', { palette: ['#364251', '#e6edf0'], glow: ['#a6bac94d', '#ffffffbf'] }),
  item('obsidian-glass', 'Obsidian', 'glass', 'epic', credits(1100), 'Tiefes Schieferglas mit präziser Lichtkante.', { palette: ['#282c39', '#e4e5eb'], glow: ['#9aa3c560', '#ffffffc4'] }),
  item('champagne-glass', 'Champagne', 'glass', 'rare', credits(680), 'Ein sanfter warmer Schimmer auf den Karten.', { palette: ['#413a36', '#f1eae3'], glow: ['#d0ad725b', '#fff9efdd'] }),
  item('emerald-glass', 'Emerald', 'glass', 'epic', credits(1450), 'Smaragdgrün getöntes Glas bei klarer Schrift.', { palette: ['#273e3d', '#e0efeb'], glow: ['#8fd3b266', '#f0fffacc'] }),
  item('prismatic-glass', 'Prismatic', 'glass', 'mythic', collection('memory'), 'Violett in der Fläche, Blau im Lichtsaum.', { palette: ['#34374c', '#ece9f6'], glow: ['#a8b4ee6e', '#fbf9ffdf'] }),

  item('accent-iris', 'Iris', 'accent', 'common', credits(120), 'Violetter Lichtsaum an aktiven Elementen.', { palette: ['#d6bafa', '#69439a'], glow: ['#d6bafa55', '#69439a44'] }),
  item('accent-mint', 'Mint', 'accent', 'rare', credits(430), 'Klares Mint für Fokus und Auswahl.', { palette: ['#8de8c6', '#126644'], glow: ['#8de8c655', '#12664444'] }),
  item('accent-amber', 'Amber', 'accent', 'epic', level(15), 'Goldener Lichtsaum für Fokus und Auswahl.', { palette: ['#ffd58f', '#765018'], glow: ['#ffd58f55', '#76501844'] }),

  item('icons-line', 'Airline', 'icons', 'common', credits(100), 'Vertraute Navigationssymbole mit einer feineren Linie.', { style: '1.5' }),
  item('icons-bold', 'Signal', 'icons', 'rare', credits(440), 'Vertraute Symbole mit einer kräftigeren Kontur.', { style: '2.6' }),
  item('icons-cut', 'Precision', 'icons', 'rare', level(30), 'Gerade Linienenden prägen die vertrauten Symbole.', { style: 'square' }),
  item('icons-radiant', 'Radiant', 'icons', 'legendary', credits(3400), 'Formtreue Symbole mit einem feinen Lichtreflex.', { style: 'radiant' }),

  item('logo-chrome', 'Chrome', 'logo', 'common', credits(240), 'Das Buchzeichen erhält einen silbrigen Glanz.', { style: 'grayscale(1) contrast(1.09) brightness(1.08)' }),
  item('logo-obsidian', 'Obsidian', 'logo', 'rare', credits(610), 'Ein kühles, dunkleres Finish für das Buchzeichen.', { style: 'grayscale(.85) hue-rotate(18deg) contrast(1.22) brightness(.88)' }),
  item('logo-holographic', 'Holographic', 'logo', 'epic', credits(1600), 'Das Buchzeichen schimmert in einem violetten Finish.', { style: 'hue-rotate(48deg) saturate(1.6) brightness(1.08)' }),
  item('logo-gold', 'Gold', 'logo', 'legendary', level(50), 'Goldton für das unverwechselbare Buchzeichen.', { style: 'sepia(.72) saturate(1.45) brightness(1.12)' }),

  item('celebrate-nova', 'Nova', 'celebration', 'common', credits(250), 'Ein heller Lichtsaum wächst kurz um ein Ergebnis.', { style: 'studio-nova', palette: ['#99d9ee', '#327991'] }),
  item('celebrate-ripple', 'Liquid Ripple', 'celebration', 'rare', credits(650), 'Ein weicher Glanz läuft über die Abschlusskarte.', { style: 'studio-ripple', palette: ['#a1ebd8', '#216e62'] }),
  item('celebrate-aurora', 'Aurora Wave', 'celebration', 'epic', credits(1350), 'Ein violetter Reflex kennzeichnet den Abschluss.', { style: 'studio-ripple', palette: ['#c9abfa', '#694397'] }),
  item('celebrate-golden', 'Golden Ascension', 'celebration', 'legendary', credits(3600), 'Goldenes Licht steigt auf der Abschlusskarte auf.', { style: 'studio-nova', palette: ['#ffd290', '#876020'] }),
  item('celebrate-singularity', 'Singularity', 'celebration', 'mythic', collection('exams'), 'Ein blauer Lichtimpuls sammelt sich am Rand der Abschlusskarte.', { style: 'studio-ripple', palette: ['#9abdfc', '#3c57a5'] }),

  item('bar-plasma', 'Plasma', 'progress', 'common', credits(190), 'Ein klarer violetter Verlauf für Fortschrittsbalken.', { palette: ['#c195f1', '#6a429d'], glow: ['#e3b0f3', '#9b3975'] }),
  item('bar-crystal', 'Crystal Bar', 'progress', 'rare', credits(490), 'Eisblau und Türkis markieren den Fortschritt.', { palette: ['#86d9ec', '#275d90'], glow: ['#83efd5', '#18766a'] }),
  item('bar-aurora', 'Aurora Bar', 'progress', 'epic', credits(1250), 'Der Balken fließt von Grün zu Violett.', { palette: ['#86e0c1', '#266b51'], glow: ['#c4a6f8', '#704aaa'] }),
  item('bar-gold', 'Liquid Gold', 'progress', 'legendary', level(40), 'Ein goldener Streifen markiert behaltene Fortschritte.', { palette: ['#ffd986', '#7f551e'], glow: ['#ffb489', '#985027'] }),

  item('nav-drift', 'Drift', 'navigation', 'common', credits(230), 'Seiten erscheinen in einer kleinen seitlichen Bewegung.', { style: 'studio-page-drift' }),
  item('nav-fade', 'Soft Focus', 'navigation', 'rare', credits(580), 'Seiten wechseln mit einer kurzen, ruhigen Überblendung.', { style: 'studio-page-fade' }),
  item('nav-lift', 'Lift', 'navigation', 'epic', achievement('expert-mission'), 'Seiten steigen sanft aus einer kleinen Tiefenbewegung auf.', { style: 'studio-page-lift' }),

  item('orbit', 'Orbit', 'companion', 'common', companion('orbit'), 'Analytiker für Fortschritt und strukturierte Wiederholung.', { palette: ['#96ddfa', '#31599c'], style: 'orbit' }),
  item('ember', 'Ember', 'companion', 'rare', credits(500), 'Motivator für persönliche Ziele und Abwechslung.', { palette: ['#ffc58c', '#8e3f2a'], style: 'ember' }),
  item('spectre', 'Spectre', 'companion', 'epic', companion('spectre'), 'Gedächtnisexperte für Blurting und Wiederholung.', { palette: ['#d4bafa', '#69449b'], style: 'spectre' }),
  item('bloom', 'Bloom', 'companion', 'epic', companion('bloom'), 'Entwicklungsbegleiter für Lernlücken und Verbesserungen.', { palette: ['#a6e6a7', '#347142'], style: 'bloom' }),
  item('glitch', 'Glitch', 'companion', 'legendary', companion('glitch'), 'Stratege für Prüfungsvorbereitung und Lernplanung.', { palette: ['#82eadb', '#166e71'], style: 'glitch' }),
  item('cosmo', 'Cosmo', 'companion', 'mythic', companion('cosmo'), 'Entdecker für neue Fächer und Lernmethoden.', { palette: ['#fac1de', '#8b416b'], style: 'cosmo' }),

  item('body-mercury', 'Mercury Skin', 'body', 'rare', credits(520), 'Silbrige Reflexe auf dem Körper des Begleiters.', { style: 'mercury' }),
  item('eyes-dual', 'Twin Lens', 'eyes', 'common', credits(170), 'Zwei schmale Lichtlinsen als Augen.', { style: 'dual' }),
  item('expression-smile', 'Calm Signal', 'expression', 'common', credits(130), 'Ein ruhiger Lichtbogen als Gesichtsausdruck.', { style: 'smile' }),
  item('crystals-satellite', 'Crystal Satellites', 'crystals', 'epic', credits(1150), 'Zwei kleine Kristalle begleiten die Bewegung.', { style: 'satellites' }),
  item('rings-holo', 'Holo Ring', 'rings', 'rare', credits(630), 'Ein feiner holografischer Ring umläuft den Begleiter.', { style: 'holo' }),
  item('crown-stellar', 'Stellar Crown', 'crown', 'mythic', achievement('companion-celestial'), 'Eine leuchtende Krone markiert die höchste Entwicklung.', { style: 'stellar' }),
  item('particles-stardust', 'Stardust Trail', 'particles', 'epic', achievement('first-review'), 'Wenige ruhige Lichtpunkte begleiten den Orbit.', { style: 'stardust' }),
  item('companion-indigo', 'Indigo Core', 'companion-color', 'epic', credits(1250), 'Tiefer Indigo-Ton mit kühlem Licht für jeden Begleiter.', { palette: ['#a6b1ff', '#454f9d'] }),
];

const byId = new Map(cosmetics.map(item => [item.id, item] as const));
export function cosmeticById(id?: string) {
  return id === undefined ? undefined : byId.get(id);
}

export function compatibleLook(look: Readonly<Record<string, string>>, owned?: readonly string[], theme?: 'dark' | 'light'): Look {
  const valid: Look = {};
  for (const slot of Object.keys(slots) as Slot[]) {
    const item = cosmeticById(look[slot]);
    if (item?.slot === slot && (!owned || owned.includes(item.id)) && (!theme || item.compatibility.includes(theme))) valid[slot] = item.id;
  }
  return valid;
}

export type LookStyle = CSSProperties & Record<`--studio-${string}`, string>;
export function lookVariables(look: Look): LookStyle {
  const variables: LookStyle = {};
  function setPalette(property: string, palette?: Palette) {
    if (!palette) return;
    variables[`--studio-${property}-dark`] = palette[0];
    variables[`--studio-${property}-light`] = palette[1];
  }
  for (const [slot, id] of Object.entries(look)) {
    const item = cosmeticById(id);
    if (!item || item.slot !== slot) continue;
    const { palette, glow, third, style } = item.visual;
    switch (item.slot) {
      case 'background':
        setPalette('orb-one', palette);
        setPalette('orb-two', glow);
        setPalette('orb-three', third);
        break;
      case 'glass':
        setPalette('panel', palette);
        setPalette('rim', glow);
        break;
      case 'accent':
        setPalette('accent', palette);
        setPalette('accent-glow', glow);
        break;
      case 'progress':
        setPalette('bar-start', palette);
        setPalette('bar-end', glow);
        break;
      case 'celebration':
        setPalette('celebration-color', palette);
        if (style) variables['--studio-celebration'] = style;
        break;
      case 'navigation':
        if (style) variables['--studio-navigation'] = style;
        break;
      case 'logo':
        if (style) variables['--studio-logo'] = style;
        break;
      case 'icons':
        if (style === 'square') variables['--studio-icon-cap'] = style;
        else if (style === 'radiant') variables['--studio-icon-glow'] = 'drop-shadow(0 0 3px currentColor)';
        else if (style) variables['--studio-icon-weight'] = style;
        break;
    }
  }
  return variables;
}
